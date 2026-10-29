# The Big Sister — Context, Memory, and Data

## Principle
The MVP remembers what is needed to help within the current conversation, but does not keep a personal profile between sessions. The user should not need to wonder what the agent has remembered.

## Five different concepts
1. **Single-turn input:** the message currently being answered, including an optional attachment.
2. **Recent conversation context:** the relevant user and agent messages from the current session.
3. **Rolling session summary:** an optional short summary created only to keep a long conversation coherent if the context window becomes too large. It exists in session memory only and should include only task-relevant details.
4. **Persistent user preferences:** settings saved across sessions, such as preferred response length. **Not enabled in this MVP.** Any future version requires explicit opt-in, a visible way to review/correct/delete, and a real storage mechanism.
5. **Task knowledge:** the curated budgeting and household guide shared by the app for all users. It is not personal memory and must not contain one user's details.

## What is remembered in the MVP?
During the current open session only, the app may retain:
- messages in the active conversation;
- figures the user explicitly shared for a budget;
- user-confirmed calculations or assumptions;
- temporary attachment references needed for the active request;
- a concise rolling summary if necessary to preserve continuity.

Do not collect or store:
- passwords, OTPs, UPI PINs, bank credentials, full card numbers;
- unnecessary personal identifiers from receipts or bills;
- raw audio by default;
- personal details unrelated to the user's current task;
- hidden profiles inferred from writing style or behaviour.

## Where and for how long?
- Keep active conversation state in client memory or another temporary session mechanism.
- Send only necessary recent messages or a task-focused summary to the model.
- Do not add a database, authentication, analytics-based personal profile, or cross-session storage for the MVP.
- When the user clears or resets the conversation, clear active client-side messages, temporary summary, and app-held attachment references. If the server temporarily handles files or request data, follow the platform's documented lifecycle and do not promise deletion beyond what the implementation can verify.
- Closing or reloading the app may end the session. Do not claim the app will remember the user next time.

## User control
Provide a visible “Clear conversation” or “Start fresh” control. Confirm before clearing if accidental loss is plausible. Explain that clearing resets the app's active session, not necessarily records retained by the underlying AI service according to its own terms or logs. The prototype should not claim full provider-side deletion unless the service supports it and the implementation confirms it.

Users should be able to correct any detail:
- “I meant ₹1,800, not ₹18,000.”
- The app should update the active state and recalculate.
- Never silently retain a superseded number as the current value.

## Example session data shape
This is conceptual pseudocode, not a requirement to use a database:

```json
{
  "sessionId": "ephemeral-random-id",
  "messages": [
    {"role": "user", "content": "I earn ₹18000 a month."},
    {"role": "assistant", "content": "Is that take-home pay?"}
  ],
  "workingFacts": {
    "income": {"amount": 18000, "currency": "INR", "period": "month", "confirmed": true},
    "rent": {"amount": 6000, "currency": "INR", "period": "month", "confirmed": true}
  },
  "sessionSummary": null,
  "persistentPreferences": null
}
```

Do not use this example to infer that the app must collect every field. Store only what is needed, and prefer ordinary conversation context if a separate data structure adds no value.

## Image and audio handling
- Images are sent to the model only when the user deliberately selects and submits them.
- Explain what the image will be used for.
- Ask users to redact unnecessary personal details.
- Do not save uploaded images to a durable store by default.
- Do not retain raw microphone recordings by default.
- If a speech API or model service processes data, do not make unsupported privacy promises; refer to the service's current terms when relevant.

## Future persistent memory (out of MVP)
Only consider this after user research shows clear value. It would require:
1. a clear opt-in moment describing what will be saved and why;
2. minimal fields, such as a user-chosen response style;
3. a secure storage mechanism with access controls;
4. a settings screen showing saved details;
5. controls to correct and delete saved details;
6. retention and deletion behaviour that has been tested;
7. a privacy notice consistent with the real implementation.

Never fake persistent memory by placing a user profile in a prompt while claiming it is safely stored, or claim that memory persists if it does not.
