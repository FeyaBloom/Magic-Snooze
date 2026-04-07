# Magic Snooze
### Routines, tasks and notes — gentle, guilt-free relationship with yourself.

A free, open source productivity app built for anyone who wants to bring a little more kindness and structure into their daily life — at their own pace, without pressure.

---

## What is Magic Snooze?

Magic Snooze is a calm, privacy-first app for building routines, managing tasks, and capturing thoughts. It's designed around one simple idea: **progress doesn't have to hurt.**

Whether you're rebuilding after a hard season, learning to care for yourself a little better, helping a child find their rhythm, or simply tired of apps that make you feel behind — Magic Snooze meets you where you are.

No punishment for missed days. No rigid schedules. No guilt.

Especially helpful for neurodivergent minds, people recovering from burnout or depression, and anyone whose brain doesn't run on willpower alone.

---

## Why Magic Snooze? ✨

**💤 Snooze Days & Weekly Freeze**
Intentionally pause for a day, or get automatic streak protection once a week. Because life happens — and that shouldn't cost you your progress.

**🎉 Tiny Victories**
Celebrate 8 micro-accomplishments: drank water? Took a break? Had a good talk? Each one deserves confetti. No win is too small.

**🔔 Gentle Notifications**
Soft reminders, only when helpful. You can disable them entirely — no guilt either way.

**💾 Privacy-First**
All data stays on your device. No login, no tracking, no servers. Ever.

**🎙️🖼️ Rich Notes**
Capture text, attach images, and record voice notes in one place.

---

## Core Features 🌟

**💤 Intentional Snooze Days**
Press Snooze to pause all progress for a day — without breaking your streak or affecting stats. Rest is part of the system.

**🧊 Weekly Freeze Protection**
Miss a day? The app absorbs it automatically once per week. Resets every Monday.

**⏰ Morning & Evening Routines**
Fully customizable with visual progress bars. Default suggestions included — make them your own. Auto-reset at midnight.

**✨ Tiny Victories**
8 micro-celebrations: 🛏️ Slept well · 💧 Drank water · 🌬️ Breathed deeply · 🍎 Ate on time · 🌤 Went outside · 😊 Had a talk · ❤️ Treated myself · ⏸️ Took a break. Each triggers confetti. Because you deserve it.

**🌻 Victory Garden**
A visual garden that grows as you celebrate. A living reminder of your progress.

**🔥 Smart Streak System**
Track current and longest streaks. The system protects consistency — it doesn't punish the bad days.

**🌟 Levels & Achievements**
Earn levels based on monthly engagement: Rookie → Skilled → Master → Hero. Unlock 8 achievements along the way.

**🎨 Dynamic Themes**
☀️ Daydream (soft pastels) and 🌙 Night Forest (deep, cozy tones). Auto-switch at 7AM/7PM, or control manually. Bonus: Messy Mode for chaotic fun.

**📊 Pareto Chart**
Visual bar chart of your top 3 most celebrated victories. See what actually brings you joy.

**📝 Rich Notes**
Text, images, and voice notes in one place. All stored locally on your device.

**🌍 Multi-Language Support**
🇬🇧 English · 🇦🇩 Catalan · 🇪🇸 Spanish · 🇷🇺 Russian
Auto-detects device language on first launch. Switch anytime in settings.

---

## Philosophy 💜

Magic Snooze was built out of personal need — by someone with ADHD, during a season when conventional productivity tools made everything harder instead of easier.

The philosophy is simple:

- **Structure without rigidity.** Routines that bend, not break.
- **No guilt, no shame.** Rest is valid. Pausing is progress. Showing up imperfectly beats not showing up at all.
- **Small wins matter.** The brain needs celebration — especially on the hard days.
- **Your data is yours.** No tracking, no login, no judgment.

This app is for anyone ready to build a kinder relationship with themselves — one small step at a time.

---

## Tech Stack 🛠️

- React Native 0.81.5 with React 19.1.0
- Expo SDK ~54.0 (Android, Web)
- TypeScript ~5.9.2
- Expo Router 6.0 (file-based navigation)
- AsyncStorage (local data persistence)
- i18next + react-i18next (internationalization)
- Lottie (animations: confetti, stars, clouds)
- Lucide React Native (icons)
- Expo Notifications (gentle, optional reminders)
- Custom fonts: Cormorant (serif titles) + Nunito (sans-serif body)

---

## Getting Started (Developers) 👩‍💻

**Prerequisites**
- Node.js (v18+)
- Expo CLI: `npm install -g expo-cli`

**Installation**
```bash
git clone https://github.com/FeyaBloom/Magic-Snooze.git
cd Magic-Snooze
npm install
npm start
```

**Available Scripts**
```bash
npm start          # Start Expo dev server
npm run android    # Run on Android device/emulator
npm run web        # Run in web browser
```

**Project Structure**
```
app/               # Expo Router screens (file-based routing)
  (tabs)/          # Tab navigation screens
components/        # Reusable UI components
hooks/             # Custom React hooks (business logic)
locales/           # Translation files (en, es, ru, ca)
utils/             # Utility functions
styles/            # Style definitions
assets/            # Fonts, animations, images
```

---

## Localization 🌍

Primary: 🇬🇧 English, 🇦🇩 Catalan
Also supported: 🇪🇸 Spanish, 🇷🇺 Russian

Auto-detects device language on first launch. Easily extensible — add JSON files to `locales/`. Contributing translations? Check `locales/en.json` for the structure.

---

## Permissions 📱

Magic Snooze requests permissions only when needed for specific optional features:

- **Notifications** (POST_NOTIFICATIONS): for optional reminders
- **Microphone**: only when recording voice notes
- **Photos / Media Library**: only when attaching images to notes

Denying any permission leaves the rest of the app fully usable.

---

## Contributing 🤝

Issues and PRs are welcome. Whether you want to fix a bug, add a feature, improve translations, or suggest ideas — come in.

**Guidelines:**
- Be kind, be patient
- Keep the philosophy in mind: gentle, no guilt, privacy-first
- Test on at least one platform (Android/Web)

---

## Roadmap 🗺️

- 🎙️ Offline speech-to-text for voice notes (whisper.rn)
- ☁️ Optional privacy-respecting cloud backup
- 📈 Improved stats visualization
- 🎨 Customizable note item order

Have ideas? Open an issue.

---

## Google Play Compliance

- Landing source: `docs2/`
- GitHub Pages deploy: `.github/workflows/deploy-pages.yml`

---

## License 📄

GNU AGPL 3.0 — free and open source, protecting user freedom.

---

## Support 💜

If Magic Snooze helps you:
- ⭐ Star the repo
- 📢 Share with someone who might need it
- 🐛 Report bugs or suggest features

*You're doing better than you think. 🔥*
