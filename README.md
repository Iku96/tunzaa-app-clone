# Tunzaa App (Clone)

A React Native (Expo) mobile app for the Tunzaa save-to-buy and marketplace experience. Supports **English** and **Swahili** with an extensible i18n setup.

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the app](#running-the-app)
- [Development principles](#development-principles)
- [Project structure](#project-structure)
- [Internationalization (i18n)](#internationalization-i18n)
- [Adding a new language](#adding-a-new-language)
- [Code conventions and onboarding](#code-conventions-and-onboarding)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (or yarn / pnpm)
- **Expo Go** on your device (for `expo start`) **or** Android Studio / Xcode for native builds

Ensure you can run `node -v` and `npm -v` from the terminal.

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Iku96/tunzaa-app-clone.git
   cd tunzaa-app-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Optional: environment variables**  
   If the app uses Supabase or other backends, copy any `.env.example` to `.env` and fill in keys. See `src/lib/supabase-config.ts` for Supabase usage.

---

## Running the app

| Command | Description |
|--------|-------------|
| `npm start` | Start Expo dev server (QR code for Expo Go) |
| `npm run android` | Start and open on Android device/emulator |
| `npm run ios` | Start and open on iOS simulator |
| `npm run web` | Run in the browser |

**Recommended for first run:** `npm start`, then scan the QR code with Expo Go, or press `a` for Android / `i` for iOS.

For a **development build** (e.g. native modules): `npx expo run:android` or `npx expo run:ios`.

---

## Development principles

**UI and backend go together.** Whenever you implement or change UI (screens, forms, buttons, flows), implement the backend (API, persistence, state) at the same time so the feature works end-to-end.

- **New screen or flow** → Add or update API calls, Supabase, or local persistence so the screen uses real data.
- **New form or action** → Wire submit handlers to the backend, handle loading and errors, and reflect success in the UI.
- **New preference or setting** → Persist it (e.g. AsyncStorage, Supabase) and read it on app load.
- **List or detail view** → Fetch from the backend; avoid leaving placeholder or mock data as the final implementation.

“Backend” here means any persistence or server interaction (Supabase, REST, AsyncStorage, SecureStore, etc.). This keeps the app working in harmony and avoids half-built features.

---

## Project structure

```
tunzaa-app-clone/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout, LanguageProvider, Stack
│   ├── index.tsx           # Welcome/splash → redirects to language
│   ├── language.tsx       # Language selection (e.g. English, Swahili)
│   ├── role.tsx            # Buyer vs business role selection
│   └── home.tsx            # Placeholder home/marketplace screen
├── assets/                 # Images, icons, fonts
├── src/
│   ├── constants/          # App constants (e.g. supported languages)
│   │   └── languages.ts    # ISO 639-1 language config; add new languages here
│   ├── contexts/           # React context providers
│   │   └── LanguageContext.tsx  # Locale state + persistence + translations
│   ├── i18n/
│   │   └── translations.ts # Translation strings per locale (en, sw, …)
│   ├── lib/                # Supabase and other external services
│   └── types/              # Shared TypeScript types (e.g. DB types)
├── global.css              # Tailwind/NativeWind global styles
├── app.json                # Expo app config
├── package.json
└── README.md               # This file
```

- **Routing:** Expo Router uses the `app/` directory; each file is a route (e.g. `app/language.tsx` → `/language`).
- **State / i18n:** `LanguageProvider` in `_layout.tsx` provides `locale`, `setLocale`, and `t` (translations) to the whole app. Language choice is persisted with AsyncStorage.

---

## Internationalization (i18n)

The app uses a simple, code-based i18n approach (no external i18n library):

- **Language codes:** [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) (e.g. `en`, `sw`).
- **Config:** `src/constants/languages.ts` — defines `SUPPORTED_LANGUAGES`, default locale, and storage key.
- **Translations:** `src/i18n/translations.ts` — one object per locale with the same keys; `getTranslations(locale)` returns the right set.
- **Runtime:** `LanguageContext` loads the saved locale from AsyncStorage, exposes `locale`, `setLocale`, and `t` (the current translation object). Screens use `const { t } = useLanguage()` and render `t.someKey`.

This keeps adding a new language to a small, well-defined set of files (see below).

---

## Adding a new language

To support another language (e.g. French):

1. **Add the language to the supported list**  
   In `src/constants/languages.ts`, add an entry to `SUPPORTED_LANGUAGES`:
   ```ts
   { code: 'fr', name: 'French', nativeName: 'Français' }
   ```

2. **Add translation strings**  
   In `src/i18n/translations.ts`:
   - Add a new object (e.g. `const fr: TranslationKeys = { ... }`) with the same keys as `en` and `sw`.
   - Register it in the `translations` object: `fr: fr` (or `fr` if the variable is named `fr`).

3. **No other code changes**  
   The language screen reads from `SUPPORTED_LANGUAGES` and the context uses `translations[locale]`, so the new language will appear in the picker and be used when selected.

---

## Code conventions and onboarding

- **Comments:**  
  - **File-level:** JSDoc block at the top of each file describing the module’s purpose and, if relevant, how it fits into the app (e.g. “Language selection screen”, “Supported languages config”).  
  - **Functions / handlers:** Short JSDoc or inline comment for non-obvious logic (e.g. “Persists choice and navigates to role”).  
  - **Sections in JSX:** Inline comments for major UI blocks (e.g. `{/* Language list */}`) to help navigation.

- **Naming:**  
  - Components: PascalCase.  
  - Files: `kebab-case` or matching the component (e.g. `language.tsx`, `LanguageContext.tsx`).  
  - Constants: `UPPER_SNAKE_CASE` for true constants (e.g. `SUPPORTED_LANGUAGES`, `LANGUAGE_STORAGE_KEY`).

- **Types:**  
  - Shared types live in `src/types/`.  
  - Language-related types are in `src/constants/languages.ts` and `src/i18n/translations.ts`.

- **Styling:**  
  - Prefer `StyleSheet` from `react-native` for screens (avoids Android native prop issues seen with some className usage).  
  - Global/theme styles: `global.css` and `tailwind.config.js` (NativeWind).

New developers should read this README, then skim `app/_layout.tsx`, `app/language.tsx`, `src/constants/languages.ts`, and `src/contexts/LanguageContext.tsx` to see how routing and i18n are wired.

**AI agents:** For project instructions, context, and past issues/fixes, read and update **AGENTS.md** so the next agent has full context.

---

## Troubleshooting

- **Android crash: “String cannot be cast to Boolean”**  
  The app pins `react-native-screens` to `4.16.0` in `package.json` (and `overrides`) to avoid a regression on Expo SDK 54. If you upgrade Expo or react-native-screens, watch for this issue and consider keeping the pin until a fix is available.

- **Metro cache issues**  
  Run with a clean cache: `npx expo start --clear`.

- **Native build after dependency changes**  
  If you change native dependencies (e.g. upgrade Expo or screens), rebuild: `npx expo run:android` or `npx expo run:ios`.

---

## License

See the repository license file (if present).
