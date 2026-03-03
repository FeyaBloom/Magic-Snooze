# 💜 Magic Snooze

**A productivity app that doesn't punish you.**

*Made with ❤️ for the ADHD community and anyone tired of guilt-driven to-do apps.*

---

## What is Magic Snooze?

Magic Snooze is a productivity and wellness app designed with **ADHD in mind** (but useful for anyone). My core philosophy is simple: **track progress, not failure**. I assume you're already doing your best and provide structure without rigidity or shame.

Unlike traditional habit trackers that break your streak and make you feel terrible, I celebrate small wins, protect your consistency on bad days, and make rest **part of the system** instead of a failure.


---

## Why Magic Snooze? ✨

**💤 Snooze Days & Weekly Freeze**  
Intentionally pause for a day (Snooze) or get automatic protection once per week (Freeze). Your streaks remain intact. Because life happens.

**🎉 Tiny Victories**  
Celebrate 8 micro-accomplishments: drank water? Had a talk? Took a break? Each deserves confetti. No achievement is too small.

**🔔 Gentle Notifications**  
Soft reminders only when helpful. No aggressive pings. No anxiety. You can disable them entirely—I won't guilt trip you.

**💾 Privacy-First**  
All your data stays on your device. No login, no tracking, no servers. It's your journey, your data.

---

## Core Features 🌟

### 💤 **Intentional Snooze Days**
Press the Snooze button to pause all progress for a day—without breaking your streak or affecting stats. Rest guilt-free.

### 🧊 **Weekly Freeze Protection**
Miss a day? I absorb it automatically once per week. No penalties, no broken streaks. Resets every Monday.

### ⏰ **Morning & Evening Routines**
Fully customizable routines with visual progress bars. Default suggestions provided, but make them your own. Auto-reset at midnight.

### ✨ **Tiny Victories**
8 micro-celebrations in a beautiful modal:
- 🛏️ Slept well
- 💧 Drank water
- 🌬️ Breathed deeply
- 🍎 Ate on time
- 🌤 Went outside
- 😊 Had a talk
- ❤️ Treated myself
- ⏸️ Took a break

Each one triggers delightful confetti. Because you deserve celebration.


### 🌻 **Victory Garden**
A visual garden that grows as you celebrate victories. Watch your garden bloom with consistency—a living reminder of your progress.


### 🔥 **Smart Streak System**
Track current and longest streaks with visual fire indicators (🔥). See available freezes with ice icons (🧊). The system protects you, not punishes you.

### 🌟 **Levels & Achievements**
Earn levels based on monthly engagement:
- **Rookie** (0-24%)
- **Skilled** (25-49%)
- **Master** (50-74%)
- **Hero** (75%+)

Unlock 8 achievements: 👣 First Step, ⚔️ Week Warrior, 🗓️ Month Master, and more.

### 🎨 **Dynamic Themes**
Two beautiful themes:
- **☀️ Daydream** (soft pastels for daytime)
- **🌙 Night Forest** (deep, cozy tones for evening)

Auto-switch at 7 AM / 7 PM, or control manually. Bonus: **Messy Mode** randomly shuffles colors for chaotic fun.

### 📊 **Pareto Chart**
Visual bar chart showing your top 3 most celebrated victories of the month. See what brings you joy.

### 🌍 **Multi-Language Support**
- **Primary:** 🇬🇧 English, 🇦🇩 Catalan (català)
- **Also supported:** 🇪🇸 Spanish (español), 🇷🇺 Russian (русский)

Auto-detects your device language. Switch anytime in settings.


---

## Philosophy 💜

I built Magic Snooze because traditional productivity apps made me feel worse, not better. They punish inconsistency, create anxiety with aggressive notifications, and focus relentlessly on what you *didn't* do.

**My philosophy:**
- **ADHD-friendly first:** Structure without rigidity. Celebrate without pressure.
- **No guilt, no shame:** Rest is productive. Pausing is valid. You're not failing.
- **Progress over perfection:** Small wins matter. Showing up imperfectly beats not showing up at all.
- **Privacy and respect:** Your data is yours. No tracking, no login, no judgment.

This app is my love letter to anyone who's ever felt broken by a to-do list.

---

## Tech Stack 🛠️

- **React Native** 0.81.5 with **React** 19.1.0
- **Expo SDK** ~54.0 (iOS, Android, Web)
- **TypeScript** ~5.9.2
- **Expo Router** 6.0 (file-based navigation)
- **AsyncStorage** (local data persistence)
- **i18next** + **react-i18next** (internationalization)
- **Lottie** (delightful animations: confetti, stars, clouds)
- **Lucide React Native** (icons)
- **Expo Notifications** (gentle, optional reminders)
- **Custom fonts:** Cormorant (serif titles) + Nunito (sans-serif body)

---

## Getting Started (Developers) 👩‍💻

### Prerequisites
- Node.js (v18+)
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
# Clone the repo
git clone https://github.com/FeyaBloom/Magic-Snooze.git
cd Magic-Snooze

# Install dependencies
npm install

# Start the development server
npm start
```

### Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android device/emulator
npm run web        # Run in web browser
```

### Project Structure

```
app/               # Expo Router screens (file-based routing)
  (tabs)/          # Tab navigation screens
components/        # Reusable UI components
  modals/          # Modal components (Victories, DayDetails, etc.)
  stats/           # Statistics visualizations
hooks/             # Custom React hooks (business logic)
locales/           # Translation files (en, es, ru, ca)
utils/             # Utility functions (date handling, toast, etc.)
styles/            # Style definitions
assets/            # Fonts, animations, images
```

---

## Localization 🌍

**Primary languages:** 🇬🇧 English, 🇦🇩 Catalan (català)  
**Also supported:** 🇪🇸 Spanish (español), 🇷🇺 Russian (русский)

- Auto-detects device language on first launch
- Change language anytime in Settings
- Easily extensible: add JSON files to `locales/` folder

Contributing translations? I'd love your help! Check `locales/en.json` for the structure.

---

## Contributing 🤝

Issues and PRs are welcome! Whether you want to:
- Fix a bug
- Add a feature
- Improve translations
- Suggest ideas

**Guidelines:**
- Be kind, be patient
- Keep the ADHD-friendly philosophy in mind
- Test on at least one platform (Android/Web)

---

## Roadmap 🗺️

I'm open to community ideas! Some thoughts:
- ☁️ Optional cloud backup (privacy-respecting)
- 📈 More stats visualizations
- 🎨 User-created themes

Have ideas? Open an issue!

---

### Google Play compliance docs

- Privacy Policy (public URL, EN):
  - `https://feyabloom.github.io/Magic-Snooze/privacy-policy.html`
- Privacy Policy (public URL, CA):
  - `https://feyabloom.github.io/Magic-Snooze/privacy-policy-ca.html`
- License summary in Catalan (informative):
  - `docs/license-ca.html`
- Data Safety draft answers:
  - `docs/google-play-data-safety.md`
- Store listing copy pack (ready to paste):
  - `docs/google-play-store-copy.md`
- Full release checklist:
  - `docs/google-play-release-checklist.md`

---

## License 📄

[GNU AGPL 3.0](LICENSE) - free and open source software that protects user freedom.

---

## Support 💜

If Magic Snooze helps you, consider:
- ⭐ Starring the repo
- 📢 Sharing with friends who might benefit
- 🐛 Reporting bugs or suggesting features

---

**Made with 💜 for the ADHD community**

*Remember: You're doing better than you think.* ✨
