import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Mic, MicOff, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ChatAttachment } from '../types';
import { validateImageUpload, detectSensitiveContent } from '../utils/budget';

interface ChatComposerProps {
  onSendMessage: (text: string, attachment?: ChatAttachment) => void;
  isLoading: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [privacyWarning, setPrivacyWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition capability
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
    }
  }, []);

  // Check input for sensitive patterns like UPI handles or card numbers
  useEffect(() => {
    if (inputText.length > 5) {
      const check = detectSensitiveContent(inputText);
      if (check.containsSensitive) {
        setPrivacyWarning(check.issues[0]);
      } else {
        setPrivacyWarning(null);
      }
    } else {
      setPrivacyWarning(null);
    }
  }, [inputText]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (isLoading) return;
    const trimmed = inputText.trim();
    if (!trimmed && !attachment) return;

    if (isListening) {
      stopVoiceInput();
    }

    onSendMessage(trimmed, attachment || undefined);
    setInputText('');
    setAttachment(null);
    setAttachmentError(null);
    setPrivacyWarning(null);

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentError(null);
    const validation = validateImageUpload(file);
    if (!validation.valid) {
      setAttachmentError(validation.error || 'Invalid file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setAttachment({
        name: file.name,
        mimeType: file.type,
        data: base64Data,
        previewUrl: URL.createObjectURL(file),
      });
    };
    reader.onerror = () => {
      setAttachmentError('Could not read image file. Please try another one.');
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachment(null);
    setAttachmentError(null);
  };

  // Browser Speech Recognition toggle
  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput();
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('Speech recognition is not supported in this browser. Typed chat is fully available.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English accent preference

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
  };

  return (
    <div className="w-full border-t border-stone-200/90 bg-[#FAF8F5]/95 px-4 pt-3 pb-4 backdrop-blur-md">
      <div className="mx-auto max-w-3xl">
        {/* Sensitive data warning if detected */}
        {privacyWarning && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700" />
            <span>{privacyWarning}</span>
          </div>
        )}

        {/* Attachment Error */}
        {attachmentError && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{attachmentError}</span>
            </div>
            <button
              onClick={() => setAttachmentError(null)}
              className="text-red-600 hover:text-red-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Attachment preview with privacy reminder */}
        {attachment && (
          <div className="mb-2.5 rounded-xl border border-stone-200 bg-white p-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={attachment.previewUrl}
                  alt="Receipt preview"
                  className="h-12 w-12 rounded-lg object-cover ring-1 ring-stone-200"
                />
                <div>
                  <p className="text-xs font-medium text-stone-800 truncate max-w-xs">
                    {attachment.name}
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Reminder: Ensure UPI IDs, account numbers, and addresses are cropped or redacted.
                  </p>
                </div>
              </div>
              <button
                onClick={removeAttachment}
                aria-label="Remove attached image"
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input container */}
        <div className="relative flex flex-col rounded-2xl border border-stone-300/90 bg-white shadow-xs focus-within:border-[#B25329] focus-within:ring-2 focus-within:ring-[#B25329]/20 transition">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to your voice... (click mic to finish)'
                : 'Share an expense, ask about budgeting, or talk through rent...'
            }
            className="max-h-44 w-full resize-none border-none bg-transparent px-4 pt-3 pb-2 text-[15px] text-stone-900 placeholder-stone-400 focus:outline-none"
          />

          <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-stone-100">
            <div className="flex items-center gap-1">
              {/* File upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                aria-label="Attach bill or receipt image"
                title="Attach bill or receipt image (JPG, PNG, WebP up to 5MB)"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition disabled:opacity-40"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Voice recognition button */}
              {speechSupported ? (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={isLoading}
                  aria-label={isListening ? 'Stop voice recognition' : 'Speak message using browser voice recognition'}
                  title={
                    isListening
                      ? 'Stop browser speech recognition'
                      : 'Speak using browser speech recognition (populates composer to review)'
                  }
                  className={`flex h-8 items-center gap-1 px-2 rounded-lg text-xs font-medium transition disabled:opacity-40 ${
                    isListening
                      ? 'bg-red-100 text-red-700 animate-pulse'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" />
                      <span>Listening</span>
                    </>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] text-stone-400 sm:inline">
                Enter to send • Shift+Enter for newline
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || (!inputText.trim() && !attachment)}
                aria-label="Send message"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#B25329] text-white shadow-xs transition hover:bg-[#9B441F] focus:outline-none focus:ring-2 focus:ring-[#B25329]/40 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer disclosure */}
        <p className="mt-2 text-center text-[11px] text-stone-600">
          AI guidance is for informational planning. The Big Sister is not a certified financial planner, lawyer, or therapist.
        </p>
      </div>
    </div>
  );
};
