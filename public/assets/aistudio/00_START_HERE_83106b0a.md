# The Big Sister — Start Here

## Project summary
**The Big Sister** is a non-judgmental conversational adulting companion for young adults aged 18–24 in India. The seven-day MVP focuses on budgeting and everyday financial management, with a small amount of practical household guidance. It should feel emotionally safe, street-smart, and conversational—not parental, therapeutic, or controlling.

## Included files
- `00_START_HERE.md` — launch guide and assumptions
- `01_ONE_SHOT_BUILD_PROMPT.md` — paste this into Google AI Studio Build
- `02_AGENT_SYSTEM_PROMPT_AND_RULES.md` — actual runtime system instruction
- `03_DOMAIN_KNOWLEDGE_AND_SOURCES.md` — starter knowledge, scope, source rules
- `04_CONVERSATION_CONTEXT_AND_MEMORY.md` — session context and privacy
- `05_USER_EXPERIENCE_AND_TECH_SPEC.md` — interface, accessibility, architecture
- `06_TEST_EVALUATE_IMPROVE.md` — test cases and evaluation loop
- `07_TEAM_BUILD_AND_SUBMISSION_GUIDE.md` — seven-day team plan and submission checklist

## How to use the pack
1. Open **Google AI Studio → Build** and start a new web app.
2. Paste the complete contents of `01_ONE_SHOT_BUILD_PROMPT.md` into the Build prompt.
3. Attach the other seven Markdown files as companion project files if the interface offers file attachments. Ask the builder to read them before implementation.
4. Crucially, make the builder place the full instruction in `02_AGENT_SYSTEM_PROMPT_AND_RULES.md` into the actual runtime system-instruction field/API configuration. Do not merely display it in the UI or treat the Markdown attachment as an enforceable instruction by itself.
5. Build and test the text-chat MVP first. Only then attempt image uploads and voice input/output.
6. Inspect the generated code and run the test cases in `06_TEST_EVALUATE_IMPROVE.md`. Record real results; do not mark unrun tests as passed.

## Recommended MVP
- One agent, not a multi-agent system.
- Text chat with a clear current-session conversation.
- Indian-context budgeting guidance using details supplied by the user.
- Optional image attachment for receipts/bills, only if implemented with clear consent and uncertainty handling.
- Voice is an enhancement, not a reason to block the text MVP.
- No account, payment integration, bank/UPI connection, persistent memory, calendar integration, or automatic action-taking.

## Assumptions
- Primary audience: people aged 18–24 living in India, including students, hostel residents, people renting independently, and early-career workers.
- Primary job: help users understand spending and build a realistic budget without shame.
- Secondary job: explain simple household tasks and responsibilities when asked.
- Session-only context. No saved profile or cross-session memory by default.
- User remains in control of every decision.
- The agent can discuss general financial education but is not a financial adviser, therapist, lawyer, or emergency service.

## Technical notes and limitations
Google AI Studio Build currently supports full-stack web apps, with a React frontend and server-side Node.js runtime; its documentation describes server-side secrets for Gemini API calls. Validate current capabilities in the interface before relying on any feature. Use the server-side secret manager for keys; never put a real key in prompts, client code, Markdown, screenshots, or source control.

Image understanding may be possible through a compatible Gemini model, but the builder must implement actual file handling and send the image to the model; a paperclip icon alone is not functionality. Voice can mean several different things. For the MVP, use a truthful, supported implementation such as browser speech recognition and speech synthesis if available, clearly labelled, with typed chat always available. Do not call this real-time streaming transcription unless it actually is. A higher-fidelity live voice flow may require a compatible model/API, microphone permissions, configuration, and potentially usage costs.

Attaching these documents does not guarantee their contents become enforceable runtime instructions. The system prompt must be configured in the actual model request, and untrusted uploads must never override it. API usage, deployment, and third-party services may incur costs or quotas.

## First-use checklist
- [ ] The app can send a real model request and show a real response.
- [ ] System instructions are configured at runtime.
- [ ] The UI explains that this is AI guidance, not professional advice.
- [ ] Text chat works on desktop and mobile.
- [ ] Loading, empty, error, retry, and attachment states work.
- [ ] The app does not store conversations across sessions unless deliberately added and explained.
- [ ] No secret appears in client-side code.
- [ ] The test team has run and recorded at least ten test scenarios.
- [ ] All claims about voice, images, and live information have been verified in the working app.

## Current official technical reference
Checked 28 October 2026:
- Google AI Studio Build mode: https://ai.google.dev/gemini-api/docs/aistudio-build-mode
- Google AI Studio full-stack apps: https://ai.google.dev/gemini-api/docs/aistudio-fullstack
- Gemini API getting started and multimodal overview: https://aistudio.google.com/docs/get-started

The builder must re-check current model names, SDKs, limits, billing, and API requirements at implementation time.
