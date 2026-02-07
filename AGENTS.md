# Agent & project instructions

This file is the **single source of instructions, context, and lessons learned** for this project. Any AI agent (or developer) working on this repo should **read this file first** and **update it** when the user gives new instructions or when new issues are fixed.

---

## How to use this file

- **Before starting work:** Read the sections below to understand user preferences, past issues, and tech context.
- **When the user gives new instructions:** Add a short entry under [User instructions](#user-instructions) and, if it’s a new rule or principle, under [Principles](#principles) or in [README](#related-docs).
- **When you fix a bug or learn something important:** Add it under [Past issues and fixes](#past-issues-and-fixes) so future agents don’t repeat the same mistake.
- **When making architectural or stack decisions:** Note them under [Tech and product context](#tech-and-product-context) if they affect how others should work.

Keep entries **concise and scannable**. Use bullet points and short paragraphs.

---

## User instructions

Instructions from the project owner. Treat these as requirements for all work on this repo.

- **UI and backend together**  
  Whenever you implement or change UI (screens, forms, buttons, flows), implement the backend (API, persistence, state) at the same time so the feature works end-to-end. Don’t leave “TODO: connect to API” as the only follow-up. See [Principles](#principles) and `.cursor/rules/ui-and-backend.mdc`.

- **Language selection (Figma)**  
  The “Choose your language” screen must match the Figma design: a single **“Choose preferred language”** button with a chevron (›). Tapping it opens a **dropdown** (implemented as a modal in React Native) where the user picks a language (e.g. English, Kiswahili). Languages are listed as pill-style options; selected = dark blue + checkmark. “Skip” remains at the bottom. Supported languages are driven by `src/constants/languages.ts`; adding a language there and in `src/i18n/translations.ts` is enough.

- **Documentation and onboarding**  
  Keep the project easy for another developer to join: comment code (file-level JSDoc, section comments in JSX, brief handler comments), and keep README.md updated with setup, structure, and how to do common tasks (e.g. adding a language). Follow common conventions (e.g. README table of contents, clear headings).

- **Single instructions doc for AI agents**  
  Maintain this file (AGENTS.md) with all instructions the user gives. Update it so that if the user works with another AI agent, that agent can refer here for context and learn from past mistakes and fixes.

- **Business vs Buyer onboarding**  
  Business users ("I'm a business") get a **separate onboarding flow** from buyers. Buyers go to the registration screen (`/register`). Business users should have their own merchant-specific setup (business details, verification, product catalog access, etc.).

*(Add new instructions above this line, with a short title and one or two sentences.)*

---

## Principles

- **UI + backend in harmony:** Every UI change that needs data or persistence should ship with the corresponding backend (Supabase, REST, AsyncStorage, etc.) in the same change set where possible.
- **i18n:** Use ISO 639-1 language codes. Supported languages live in `src/constants/languages.ts`; translations in `src/i18n/translations.ts`. Use `useLanguage()` and `t` in screens for all user-facing copy.
- **Comments:** File-level JSDoc, inline comments for non-obvious logic and major JSX sections. Naming: PascalCase components, UPPER_SNAKE_CASE for true constants.

---

## Past issues and fixes

Learn from these so they are not repeated.

### Android: `java.lang.String cannot be cast to java.lang.Boolean`

- **Symptom:** App crashes on Android startup.
- **Cause:** `react-native-screens` v4.17.0+ regression on Expo SDK 54 or strict type checking in New Architecture.
- **Fix:** Pin `react-native-screens` to `4.16.0` and disable `newArchEnabled` in `app.json` if necessary. Use `expo install --fix` to align dependencies.

### Android: Image and Layout Stability

- **Context:** Large images or images without explicit container dimensions may not render on some Android devices.
- **Practice:** Always wrap `Image` in a `View` with explicit `width` and `height`, and set `Image` to `width: '100%', height: '100%'`.
- **Logo Assets:** The splash screen logo is **white**. The app-internal logo (e.g., Language screen) must be **blue** to show against white backgrounds. Ensure correct asset variants (`tunzaa-logo-white.png` vs `tunzaa-logo-blue.png`) are used.

### Android: StyleSheet vs NativeWind

- **Context:** NativeWind `className` can cause issues on crash-prone screens.
- **Practice:** Prefer `StyleSheet` for critical layout/dimensions on Android.

---

## Tech and product context

- **Stack:** React Native (Expo SDK 54), TypeScript, Expo Router (file-based routing in `app/`), NativeWind/Tailwind, Supabase (backend). No separate backend repo in this project; “backend” means Supabase, REST, or local persistence (AsyncStorage, SecureStore).
- **Screens (flow):** Welcome (index) → Language → Role → Home. Language is persisted with AsyncStorage and used for all translated copy via `LanguageContext`.
- **Key files:**  
  - `app/_layout.tsx` — Root layout, LanguageProvider, Stack.  
  - `app/language.tsx` — Language screen (Figma: one button opening dropdown/modal).  
  - `src/constants/languages.ts` — Supported languages (add new ones here).  
  - `src/i18n/translations.ts` — Translation strings per locale.  
  - `src/contexts/LanguageContext.tsx` — Locale state + persistence + `t`.
- **Cursor rule:** `.cursor/rules/ui-and-backend.mdc` enforces “implement backend with UI”; it is always applied.

---

## Related docs

- **README.md** — Setup, run commands, project structure, i18n, adding a language, code conventions, troubleshooting.
- **.cursor/rules/ui-and-backend.mdc** — Rule: implement backend alongside UI.

---

*Last updated: when instructions or fixes are added. Keep this file current so the next agent has full context.*
