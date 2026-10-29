import { GoogleGenAI } from '@google/genai';

export interface ChatMessagePayload {
  role: 'user' | 'model';
  text: string;
}

export interface ImagePayload {
  data: string; // base64
  mimeType: string;
  name?: string;
}

export interface GenerateOptions {
  message?: string;
  history?: ChatMessagePayload[];
  image?: ImagePayload;
  systemInstruction: string;
  personaStyle?: 'practical' | 'gentle' | 'chatty';
}

export interface GenerateResult {
  text: string;
  provider: 'openrouter' | 'google-native';
  modelUsed: string;
  tierId: string;
}

/**
 * 1:1 Model Mapping Specification:
 * Ensures exact functional, generational, and fallback equivalence
 * between Google Native and OpenRouter.
 * Note: Only actively supported models are included to avoid 404/410 errors.
 */
export interface UnifiedModelTier {
  id: string;
  name: string;
  nativeModels: string[]; // Active Google native API model identifiers
  openRouterModels: string[]; // OpenRouter model identifiers
  timeoutMs: number;
}

export const UNIFIED_MODEL_TIERS: UnifiedModelTier[] = [
  {
    id: 'tier-1-primary',
    name: 'Gemini Flash Primary (Latest Reasoning)',
    nativeModels: ['gemini-3.8-flash'],
    openRouterModels: ['google/gemini-2.5-flash'],
    timeoutMs: 8000, // Quick 8s check; if high-demand spike (503) or slow, quickly cascade to Tier 2
  },
  {
    id: 'tier-2-secondary',
    name: 'Gemini Flash Lite (High-Throughput & Resilient)',
    nativeModels: ['gemini-3.1-flash-lite'],
    openRouterModels: ['google/gemini-2.0-flash-001'],
    timeoutMs: 25000,
  },
  {
    id: 'tier-3-tertiary',
    name: 'Gemini Flash Stable Fallback',
    nativeModels: ['gemini-flash-latest'],
    openRouterModels: ['google/gemini-flash-1.5'],
    timeoutMs: 25000,
  },
];

/**
 * Inspects environment variables to determine provider.
 * Automatically detects whether the user provided an OpenRouter key
 * (via OPENROUTER_API_KEY or a GEMINI_API_KEY starting with 'sk-or-').
 */
export function getAIProviderConfig(): {
  provider: 'openrouter' | 'google-native' | 'none';
  apiKey: string;
  primaryModel: string;
} {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openRouterKey || (geminiKey && geminiKey.startsWith('sk-or-'))) {
    return {
      provider: 'openrouter',
      apiKey: openRouterKey || geminiKey!,
      primaryModel: UNIFIED_MODEL_TIERS[0].openRouterModels[0],
    };
  }

  if (geminiKey) {
    return {
      provider: 'google-native',
      apiKey: geminiKey,
      primaryModel: UNIFIED_MODEL_TIERS[0].nativeModels[0],
    };
  }

  return {
    provider: 'none',
    apiKey: '',
    primaryModel: '',
  };
}

/**
 * Executes chat completion through OpenRouter, cascading through the 1:1 tiers
 */
async function callOpenRouterTiers(
  apiKey: string,
  options: GenerateOptions
): Promise<GenerateResult> {
  const { message, history = [], image, systemInstruction } = options;

  // Build standard message payload
  const messages: any[] = [
    {
      role: 'system',
      content: systemInstruction,
    },
  ];

  for (const turn of history) {
    if (turn.text) {
      messages.push({
        role: turn.role === 'model' ? 'assistant' : 'user',
        content: turn.text,
      });
    }
  }

  // Handle current turn with optional receipt image
  if (image && image.data && image.mimeType) {
    const base64Prefix = image.data.startsWith('data:')
      ? image.data
      : `data:${image.mimeType};base64,${image.data}`;

    const contentParts: any[] = [];
    if (message && message.trim()) {
      contentParts.push({ type: 'text', text: message.trim() });
    } else {
      contentParts.push({
        type: 'text',
        text: 'Please review this receipt or bill image. Distinguish visible facts from uncertain items, and let me know what you can clearly identify. Warn me if sensitive details are visible.',
      });
    }
    contentParts.push({
      type: 'image_url',
      image_url: {
        url: base64Prefix,
      },
    });

    messages.push({
      role: 'user',
      content: contentParts,
    });
  } else if (message && message.trim()) {
    messages.push({
      role: 'user',
      content: message.trim(),
    });
  }

  const appUrl = process.env.APP_URL || process.env.VERCEL_URL || 'https://the-big-sister.vercel.app';
  let lastError: any = null;

  // Step through each 1:1 tier in order
  for (const tier of UNIFIED_MODEL_TIERS) {
    for (const modelName of tier.openRouterModels) {
      try {
        console.log(`[OpenRouter] Trying ${tier.id} using model: ${modelName}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), tier.timeoutMs);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': appUrl,
            'X-Title': 'The Big Sister - Adulting & Budgeting Companion',
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            temperature: 0.65,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[OpenRouter] Model ${modelName} returned status ${response.status}: ${errText}`);
          lastError = new Error(`OpenRouter (${modelName}) returned ${response.status}: ${errText}`);
          continue;
        }

        const data = await response.json();
        const replyText = data?.choices?.[0]?.message?.content;

        if (replyText) {
          console.log(`[OpenRouter] ${tier.id} (${modelName}) succeeded.`);
          return {
            text: replyText,
            provider: 'openrouter',
            modelUsed: modelName,
            tierId: tier.id,
          };
        }
      } catch (err: any) {
        console.warn(`[OpenRouter] Model ${modelName} failed or timed out:`, err?.message || err);
        lastError = err;
      }
    }
  }

  throw lastError || new Error('All 1:1 mapped OpenRouter Gemini tiers failed to generate content');
}

/**
 * Executes chat completion through Google Native SDK, cascading through the 1:1 tiers
 */
async function callGoogleNativeTiers(
  apiKey: string,
  options: GenerateOptions
): Promise<GenerateResult> {
  const { message, history = [], image, systemInstruction } = options;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const contents: any[] = [];

  for (const turn of history) {
    if (turn.text) {
      contents.push({
        role: turn.role,
        parts: [{ text: turn.text }],
      });
    }
  }

  const currentParts: any[] = [];
  if (image && image.data && image.mimeType) {
    const cleanBase64 = image.data.replace(/^data:image\/\w+;base64,/, '');
    currentParts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: cleanBase64,
      },
    });
  }

  if (message && message.trim()) {
    currentParts.push({ text: message.trim() });
  } else if (image) {
    currentParts.push({
      text: 'Please review this receipt or bill image. Distinguish visible facts from uncertain items, and let me know what you can clearly identify. Warn me if sensitive details are visible.',
    });
  }

  contents.push({
    role: 'user',
    parts: currentParts,
  });

  let lastError: any = null;

  // Step through each 1:1 tier in order
  for (const tier of UNIFIED_MODEL_TIERS) {
    for (const modelName of tier.nativeModels) {
      try {
        console.log(`[GoogleNative] Trying ${tier.id} using model: ${modelName}`);

        const responsePromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.65,
          },
        });

        // Fast failover timeout: 8s on Tier 1 so demand spikes (503s/slowdowns) immediately try Tier 2 (3.1-flash-lite)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout with ${modelName} after ${tier.timeoutMs}ms`)), tier.timeoutMs)
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);
        if (response && response.text) {
          console.log(`[GoogleNative] ${tier.id} (${modelName}) succeeded.`);
          return {
            text: response.text,
            provider: 'google-native',
            modelUsed: modelName,
            tierId: tier.id,
          };
        }
      } catch (err: any) {
        console.warn(`[GoogleNative] Model ${modelName} failed or timed out:`, err?.message || err);
        lastError = err;
        // Continue to the next tier immediately
      }
    }
  }

  throw lastError || new Error('All 1:1 mapped native Google Gemini tiers failed to generate content');
}

/**
 * Unified dispatch function:
 * Automatically selects the appropriate provider and uses the 1:1 mapped model tiers.
 */
export async function generateSisterResponse(options: GenerateOptions): Promise<GenerateResult> {
  const config = getAIProviderConfig();

  if (config.provider === 'none') {
    throw new Error(
      'No AI API key is configured. Please provide GEMINI_API_KEY (from Google) or OPENROUTER_API_KEY (from OpenRouter).'
    );
  }

  if (config.provider === 'openrouter') {
    return await callOpenRouterTiers(config.apiKey, options);
  }

  return await callGoogleNativeTiers(config.apiKey, options);
}
