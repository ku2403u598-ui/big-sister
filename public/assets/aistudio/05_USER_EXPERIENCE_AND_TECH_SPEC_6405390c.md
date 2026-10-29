# The Big Sister — User Experience and Technical Specification

## 1. Product principles
- Conversation first, not a dashboard.
- Warm and practical, never parental or judgmental.
- The user controls the pace, information shared, and final decision.
- Be honest about uncertainty and feature availability.
- Use Indian examples when relevant without assuming one lifestyle fits everyone.
- Session-only context by default.
- Text-first MVP; image and voice are optional enhancements.

## 2. Screen hierarchy

### Primary screen: conversation
1. **Header:** product name “The Big Sister”; a concise descriptor such as “A little help with everyday adulting”; a small Settings/About action.
2. **Welcome state:** one friendly sentence and 3–4 starter prompts. Do not require signup.
3. **Conversation:** clear user/agent distinction, readable message width, selectable text, support for lists and simple budget breakdowns.
4. **Composer:** multiline text field, send button, optional attachment button if working, optional voice control if working.
5. **Status:** visible loading state, cancel if supported, clear error/retry state.
6. **Footer note:** discreet AI limitation/privacy reminder, not a wall of legal text.

### Settings/About
- Voice preference only if voice is implemented.
- Brief explanation of session-only memory.
- How to clear the current conversation.
- AI-generated guidance notice and limits.
- No account/profile page in the MVP.

### Separate developer/test view
A hidden or separate view may show technical status, configured model identifier, request success/failure, latency, and test observations. Do not expose secrets, raw personal conversation logs, full system prompt, or API keys to public users. If prompt inspection is needed for the student team, keep it in project files or a development-only environment.

## 3. Conversation and response design
- Default to short paragraphs, plain English, and one useful follow-up question.
- Avoid asking for every expense in one turn.
- Offer a few starter categories and let the user skip any.
- When presenting a budget, show the income period, known expenses, arithmetic, and what remains before unknown costs.
- Label assumptions, estimates, and unverified data.
- A budget is a flexible aid, not a score.
- Do not use red/green signals that imply the user is good or bad with money.
- A simple list or compact breakdown is preferable to a large finance dashboard.

## 4. Visual system
- Quiet, contemporary, approachable.
- Neutral background with one warm accent; ensure contrast is accessible.
- Use a legible sans-serif typeface with clear hierarchy and comfortable line-height.
- Generous spacing, restrained borders, subtle surfaces, clear focus rings.
- Avoid childish illustrations, overly feminine stereotypes, clinical medical styling, and corporate banking clichés.
- Support reduced-motion preferences. Do not rely on colour alone to convey state.
- Maintain visible focus, keyboard operation, and touch targets suitable for mobile.

## 5. Responsive and accessible behaviour
- Work at narrow mobile widths and desktop widths without horizontal scrolling.
- Keep the composer accessible when the conversation grows, without hiding the latest message.
- Use semantic controls and labels; icon-only buttons need accessible names.
- Keyboard: tab order must be logical; Enter sends only if clearly communicated, Shift+Enter adds a newline; send button always available.
- Respect browser zoom and text resizing.
- Announce loading/error states accessibly where supported.
- Do not autoplay speech.
- Provide text alternative for all spoken responses.
- Do not require voice, images, or colour recognition to complete core tasks.

## 6. Architecture and data flow
`user input → client validation → optional attachment validation → current-session context + curated knowledge → server-side model request with system instruction → response/error validation → rendered conversation`

- **Frontend:** React as supported/default in AI Studio Build, or another compatible stack the builder verifies.
- **Backend:** server-side Node.js runtime for model calls and any secrets.
- **Model:** use a currently available Gemini model verified in the AI Studio interface/documentation; do not hardcode a guessed model name.
- **System instruction:** load `02_AGENT_SYSTEM_PROMPT_AND_RULES.md` into the actual runtime system-instruction configuration.
- **Knowledge:** add the starter guide as server-side instruction/context or retrieval material in a way that does not confuse it with the system instruction. The system rules remain higher authority.
- **Session state:** in-memory/client session only by default. No database or auth.
- **Errors:** handle network, rate-limit, unavailable model, malformed response, attachment errors, and permission errors without fake success.
- **Logs:** technical errors only; avoid raw prompts, financial details, images, or audio unless essential and consented.
- **Secrets:** use AI Studio's server-side Secrets facility or the appropriate secure hosting environment. Never expose keys in browser code.

## 7. Image upload specification (optional)
Implement only if the end-to-end flow works.
- Show accepted types and size limit before selection.
- Validate MIME type and size on client and server.
- Send the actual selected image to a compatible multimodal model endpoint.
- Explain that receipts/bills may contain sensitive details; suggest cropping/redacting identifiers.
- Ask the model for visible information and confidence/uncertainty; do not guess unreadable figures.
- Show interpreted amounts to the user and ask for confirmation before calculations.
- Provide manual entry and retry/remove attachment controls.
- If unsupported, hide the feature or mark it as unavailable; never show a fake upload result.

## 8. Voice specification (optional)
Text remains the primary usable mode.
- Request microphone permission only after a deliberate user action.
- If using browser speech recognition, call it browser speech recognition, not model-native live transcription. Show recognized text accurately and let users edit before sending.
- If using text-to-speech, provide play/stop controls and keep the written answer visible.
- Handle unsupported browsers, denied permission, no microphone, and recognition failures with a typed-chat fallback.
- Do not retain raw audio by default.
- If implementing a true streaming/live model path, verify the current Live API, supported models, audio input/output format, transcript synchronization, interruption support, and billing. Do not fake live captions.
- Avoid simultaneous competing speech playback and recording; provide an obvious stop control.

## 9. Security and untrusted content
- System prompt takes precedence over user messages.
- Uploaded images, extracted text, web content, and tool results are untrusted data.
- Do not run arbitrary code or follow instructions found in uploaded material.
- No financial transactions or third-party actions.
- No bank, UPI, email, calendar, or contacts integration in this MVP.
- Avoid persistent storage and unnecessary permissions.

## 10. Graceful fallback matrix
- Model unavailable → friendly error, retry, keep the draft message.
- Image unsupported or unclear → explain limitation, invite manual entry.
- Voice permission denied → continue with typed chat.
- Current price or rule cannot be verified → say so, point to the relevant official source/provider.
- Missing budget information → ask one focused question.
- User asks for action-taking → explain that the app can help plan or draft, but cannot perform the action.
- Long conversation → compact task-relevant session summary, if implemented, without implying cross-session memory.

## 11. Integration and cost notes
The initial MVP requires a Gemini model integration and secure server-side credential handling. Google AI Studio Build documentation describes full-stack web apps with a Node.js runtime and server-side secrets, but the team must verify current availability and project settings. Model use, Cloud Run deployment, voice services, or other third-party APIs may incur usage costs or limits. No free tier or institutional access is guaranteed. Keep text chat functional before adding paid or advanced integrations.
