# Google Play Data Safety — Magic Snooze (Draft)

Last updated: 2026-03-04

This draft is based on the current codebase (`AsyncStorage` local-first, no custom backend, optional local notifications).

## Suggested answers in Play Console

### 1) Does your app collect or share any required user data?
- **Collected:** No (for server-side collection by developer)
- **Shared with third parties:** No

> Review this section carefully if you add analytics, crash reporting, ads, remote APIs, cloud backup, or authentication later.

### 2) Data handling overview
- Data is primarily stored **locally on device** for app functionality.
- No account creation is required.
- No advertising SDKs are integrated.
- No developer-operated backend is used for user progress data.
- Notes may include optional user-created media (image attachments and voice notes), stored locally on device.

### 3) Security practices
- Data in transit: **Not applicable** for local-only personal productivity data.
- Users can request deletion: **Not applicable via server** (data is on device).
- Deletion method: user can clear app data / uninstall app.

### 4) Permissions used
- `POST_NOTIFICATIONS` (Android): optional reminders configured by user.
- Microphone permission: requested only when user records voice notes.
- Photos / media library permission: requested only when user attaches images to notes.

## Internal checklist before submitting Data Safety

- [ ] Confirm no hidden analytics/crash SDK was added.
- [ ] Confirm no code sends user tasks/notes/progress to external API.
- [ ] Confirm Play Console questionnaire matches `Privacy Policy` wording.
- [ ] If app behavior changes, update both this file and `privacy-policy.html`.
- [ ] Confirm permission prompts are contextual (only when feature is used).
- [ ] Confirm deny-path works (app usable even if microphone/gallery permissions are denied).

## Policy URL to use in Play Console

- `https://feyabloom.github.io/Magic-Snooze/privacy-policy.html`
