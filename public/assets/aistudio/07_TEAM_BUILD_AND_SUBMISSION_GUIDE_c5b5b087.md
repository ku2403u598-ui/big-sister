# The Big Sister — Team Build and Submission Guide

## Seven-day student plan
This plan is a guide, not a requirement to ship a production service. Adjust roles to team size and class deadlines.

### Suggested roles
- **Conversation designer:** refines the system prompt, tone, clarifying questions, example dialogues, and boundaries.
- **UX/UI designer:** designs the chat, onboarding, message states, responsive layout, and accessibility.
- **Knowledge and research lead:** checks the starter knowledge, verifies any added official facts, and labels assumptions.
- **Build/integration lead:** implements the real model call, system instruction, session state, error handling, and optional media.
- **Test and documentation lead:** runs test cases, captures evidence, maintains version log, and prepares the final walkthrough.

For a smaller group, combine roles. Every member should understand the main flow and boundaries.

## Quick implementation steps
1. **Day 1 — Define:** agree on the narrow MVP, audience, exclusions, and success criteria. Read all pack files.
2. **Day 2 — Prototype the conversation:** test the system prompt in a model chat, especially budgeting and non-judgment. Revise one issue at a time.
3. **Day 3 — Build text chat:** create the responsive UI and secure server-side model call. Make sure the actual system instruction is configured at runtime.
4. **Day 4 — Add session behaviour:** preserve the current conversation, correct changed figures, add reset/clear, and handle errors.
5. **Day 5 — Add optional capability:** implement real image upload only if time allows. Voice comes after text and image flow are stable; omit any unsupported feature.
6. **Day 6 — Test:** run at least ten scenarios on the actual app. Record failures and fix the highest-impact ones.
7. **Day 7 — Refine and present:** rerun affected tests, capture real evidence, document limitations and next steps.

## What should work in the MVP?
- [ ] App opens and is usable on mobile and desktop.
- [ ] Text messages reach the actual model.
- [ ] System instruction is configured at runtime.
- [ ] The agent handles user-provided amounts and corrects calculations when numbers change.
- [ ] The agent asks for missing information rather than guessing.
- [ ] Discretionary spending is handled without judgment.
- [ ] Out-of-scope and high-stakes requests are handled responsibly.
- [ ] Loading, network/API error, retry, and empty states work.
- [ ] Session reset works; no persistent memory is claimed.
- [ ] API key stays server-side.
- [ ] Any implemented image or voice feature genuinely works.
- [ ] Tests have real recorded results, including failures and blocked features.

## Common blockers and responses
- **Builder only produces a static interface:** explicitly ask it to implement a real server-side model request and test one message end to end.
- **Prompt is shown in the interface but not used:** move it into the model request's actual system-instruction configuration.
- **Model invents amounts or facts:** strengthen uncertainty rules, show arithmetic, ask confirmation, and test again.
- **Image upload is cosmetic:** either implement real image-byte transfer and multimodal analysis or remove the control.
- **Voice transcription is fake or unsupported:** remove it or use a clearly labelled supported browser capability; retain typed input.
- **API key appears in frontend code:** stop sharing/deploying the app, remove the exposed key, rotate it if real, and move calls to server-side code.
- **Model name/SDK fails:** check current Google AI Studio documentation and available models; do not guess a replacement.
- **Responses are too long:** tune the system prompt to ask one focused question and keep replies concise by default.
- **Agent feels controlling:** replace commands with options and invite the user to choose.
- **Team wants too many features:** prioritize the text-chat budget flow and postpone account systems, finance integrations, persistent memory, multi-agent orchestration, and advanced voice.

## Evidence to capture from real tests
Capture only what is needed for the class submission:
- screenshot of the welcome state and responsive conversation UI;
- a real successful budget conversation with test values, not private user data;
- a real correction/recalculation example;
- a real boundary or uncertainty response;
- a real error/retry state if safely reproducible;
- evidence of image/voice functionality only if implemented and actually tested;
- test sheet with actual statuses and scores;
- prompt/version log showing one iteration;
- short notes on limitations and next steps.

Never include real API keys, private financial details, identifiable receipts, or raw personal audio in screenshots.

## One-page blueprint checklist
- [ ] Purpose and primary job
- [ ] Audience and context
- [ ] Agent identity and personality
- [ ] User journey and conversation structure
- [ ] Actual runtime system prompt
- [ ] Starter knowledge and source limitations
- [ ] Session context and memory policy
- [ ] Architecture and secure model integration
- [ ] Privacy and data-minimization choices
- [ ] Scope boundaries and handoff guidance
- [ ] Sample conversations
- [ ] UI screens, states, and responsive behaviour
- [ ] Accessibility decisions
- [ ] Boundary-case test scenarios
- [ ] Real test results and scores
- [ ] Before/after evidence from at least one iteration
- [ ] Honest limitations and future improvements

## Submission narrative
Explain the project as a designed conversation that helps young adults feel more capable—not as an AI that controls their life. Show how the tone, pacing, uncertainty handling, and user agency were tested. Distinguish features that work from ideas that remain future work. A strong narrow prototype with honest limitations is better than a broad mockup pretending to be functional.
