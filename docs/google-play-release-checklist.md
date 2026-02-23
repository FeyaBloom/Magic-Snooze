# Google Play Release Checklist — Magic Snooze

Last updated: 2026-02-23

## A) Legal & compliance
- [ ] Privacy Policy published and publicly reachable
  - URL: `https://feyabloom.github.io/Magic-Snooze/privacy-policy.html`
- [ ] Data Safety form completed in Play Console
- [ ] Ads declaration set correctly (No, if still no ads)
- [ ] Content rating questionnaire completed
- [ ] App access section completed (No restrictions, if applicable)

## B) Store listing assets
- [ ] App name and short/long descriptions finalized
- [ ] App icon uploaded (512x512)
- [ ] Feature graphic uploaded (1024x500)
- [ ] Phone screenshots uploaded
- [ ] Tablet screenshots uploaded (recommended/required depending on targeting)
- [ ] Contact details added (email/website as needed)
- [ ] Privacy Policy URL added in store listing

## C) Build and technical quality
- [ ] Android App Bundle (`.aab`) release build generated
- [ ] Version bumped (`version` + Android `versionCode`)
- [ ] Target API level meets current Play requirement
- [ ] App Signing by Google Play enabled (recommended)
- [ ] Basic smoke test on at least one real Android device

## D) Functional checks before upload
- [ ] First launch works without crash
- [ ] Core tabs work: routines, tasks, notes, calendar, settings
- [ ] Notification permission flow works (allow/deny)
- [ ] App remains usable with notifications disabled
- [ ] Language switching works (ca/en/es/ru)
- [ ] Data reset flow works as expected

## E) Release rollout
- [ ] Upload AAB to internal testing track first
- [ ] Validate pre-launch report warnings
- [ ] Fix blocking issues (if any)
- [ ] Promote to closed/open testing or production
- [ ] Use staged rollout (e.g., 10% → 50% → 100%)

## F) Post-release
- [ ] Verify store listing live page
- [ ] Replace `href="#"` Google Play buttons in `docs/index.html` with final store URL
- [ ] Announce release (README / social / community)
