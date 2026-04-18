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

- **Identity & Multi-Role Sync**  
  Users may use the single phone number for multiple profile roles (Buyer, Merchant, Delivery). When implementing identity logic (display names, profiles), always check the API endpoints (`src/services/` folder) to verify response structures. Ensure root user data (like `display_name`) is dynamically derived from the *active* profile to avoid cross-role identity confusion (e.g., showing a delivery "partner name" in the buyer dashboard).

- **UI and backend together**  
  Whenever you implement or change UI (screens, forms, buttons, flows) from a Figma design, implement the backend (API, data fetching, state persistence) at the same time so the feature works end-to-end. Never leave screens as "blank unuseful UI." Always ensure functionality and data recording are fully wired. See [Principles](#principles) and `.cursor/rules/ui-and-backend.mdc`.

- **Language selection (Figma)**  
  The “Choose your language” screen must match the Figma design: a single **“Choose preferred language”** button with a chevron (›). Tapping it opens a **dropdown** (implemented as a modal in React Native) where the user picks a language (e.g. English, Kiswahili). Languages are listed as pill-style options; selected = dark blue + checkmark. “Skip” remains at the bottom. Supported languages are driven by `src/constants/languages.ts`; adding a language there and in `src/i18n/translations.ts` is enough.

- **Documentation and onboarding**  
  Keep the project easy for another developer to join: comment code (file-level JSDoc, section comments in JSX, brief handler comments), and keep README.md updated with setup, structure, and how to do common tasks (e.g. adding a language). Follow common conventions (e.g. README table of contents, clear headings).

- **Single instructions doc for AI agents**  
  Maintain this file (AGENTS.md) with all instructions the user gives. Update it so that if the user works with another AI agent, that agent can refer here for context and learn from past mistakes and fixes.

- **Business vs Buyer onboarding**  
  Business users ("I'm a business") get a **separate onboarding flow** from buyers. Buyers go to the registration screen (`/register`). Business users should have their own merchant-specific setup (business details, verification, product catalog access, etc.).

- **Delivery Partner Flow**
  The delivery partner flow is separate from the buyer flow and lives under `app/(delivery)`. It involves selecting delivery types (which allows multiple selections), document uploads, and a driver dashboard with "Delivery requests". Use bottom-sheet style modals for success messages, matching the Figma designs.

- **Emulator Testing Setup**
  The primary testing environment is Expo Go (via `npm start`) or the Web interface in development. The user does not use Genymotion currently, so instructions and walkthroughs should direct them to test via Expo/Web instead.

*(Add new instructions above this line, with a short title and one or two sentences.)*

---

## Principles

- **UI + backend in harmony:** Every UI change that needs data or persistence should ship with the corresponding backend (Supabase, REST, AsyncStorage, etc.) in the same change set where possible.
- **i18n:** Use ISO 639-1 language codes. Supported languages live in `src/constants/languages.ts`; translations in `src/i18n/translations.ts`. Use `useLanguage()` and `t` in screens for all user-facing copy.
- **Keyboard UX:** Whenever you add an input box anywhere, always wrap the screen content or the specific input area in a `KeyboardAvoidingView` (with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`) to ensure the keyboard doesn't overlap the input box. Use `ScrollView` inside the wrapper for better scrollability.

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

### SafeAreaView overlaps on iOS/Android

- **Context:** Screens inside groups like `(delivery)` or `(buyer)` without navigation headers may render content overlapping the device status bar or physical notches.
- **Practice:** **CRITICAL: Across the entire app, ALL pages (including new ones like search or category) MUST observe the safe area by explicitly providing the `edges={['top']}` prop to the root `SafeAreaView`.** Example: `<SafeAreaView style={styles.container} edges={['top']}>`. There are no exceptions.

### Merchant Profile Persistence (Marketplace vs User Profile)

- **Context**: Merchant details (business name, logo, banner) are stored in both the `marketplace/vendors` API and the `users/{id}/profile/{id}` metadata.
- **Issue**: Updating only one API causes the UI (sidebar, header) to show outdated information.
- **Practice**: Always use the synchronized `updateVendor` method in `TunzaaAuthContext`. It performs a "double-write" to both APIs and updates the local state optimistically. For new vendors, `createVendor` also triggers this synchronization after success.

### Authentication Routing (Double-Login & App Restarts)

- **Context**: The app was experiencing unpredictable behavior where users logging in as Merchants were redirected to the Buyer portal, and unauthenticated users visiting the Delivery portal caused infinite loops (restarts).
- **Issue 1 (Double Login)**: `login.tsx` was calling the API twice in rapid succession, creating a race condition where the first response navigating to the Buyer portal beat the secondary intent for the Merchant portal.
- **Issue 2 (AuthGuard Cascading)**: The `AuthGuard` in `src/components/auth/AuthGuard.tsx` was firing on every state change without debouncing, leading to cascading `router.replace` loops.
- **Issue 3 (Nested Auth Screens)**: Delivery auth screens (`delivery-login`, `delivery-register`) lived inside the protected `(delivery)` folder, causing the `AuthGuard` to eject unauthenticated users back to the language screen immediately.
- **Fix**: 
  1. Removed the secondary `tunzaaLogin()` call in `login.tsx`. The `portalState` target is now computed *before* the single API call.
  2. Implemented `isNavigatingRef` and `lastNavigationRef` in `AuthGuard.tsx` to debounce and safely manage imperative routing. 
  3. Placed logic to explicitly recognize `delivery-login`, `delivery-register`, and `delivery-otp` within `AuthGuard` to allow access without authentication.
  4. Removed manual `setTimeout` routing logic from Social Login handlers to avoid racing against the `AuthGuard`.

### Marketplace API Case-Sensitivity (KYC)

- **Context**: KYC document submission for vendors and delivery partners.
- **Issue**: The API expects `document_type_id` (e.g. 'TIN', 'LICENSE') to be in **lowercase**. Sending uppercase strings returns a generic "Please check your input" error.
- **Fix**: Normalized all `document_type_id` strings to lowercase in `TunzaaAuthContext.tsx` before API submission.

### STORAGE_KEYS.LAST_PORTAL Missing Key

- **Context**: Portal routing between Buyer/Merchant/Delivery uses `LAST_PORTAL` in AsyncStorage.
- **Issue**: `STORAGE_KEYS` in `src/services/config.ts` did not define `LAST_PORTAL`. The `setLastPortal`/`getLastPortal` helpers in `storage.ts` referenced `STORAGE_KEYS.LAST_PORTAL` (undefined), silently failing. Meanwhile `TunzaaAuthContext.tsx` used the raw string `'LAST_PORTAL'` directly, causing inconsistency.
- **Fix**: Added `LAST_PORTAL: "LAST_PORTAL"` to `STORAGE_KEYS` in `config.ts`.

### Login API 401 Triggering Token Refresh Loop

- **Context**: `client.ts` response interceptor auto-refreshes tokens on any 401 response.
- **Issue**: When `POST /auth/login` itself returns a 401 (wrong credentials), the interceptor tries to refresh a token (which doesn't exist for a login call), fails, then calls `clearTokens()`, and finally shows the generic "Please log in to continue" instead of the actual "Invalid credentials" error.
- **Fix**: Added an `isAuthEndpoint` check in `client.ts` that skips the token-refresh interceptor for `/auth/login`, `/auth/register`, `/auth/otp/`, `/auth/password/reset`, and `/auth/firebase/login`. Auth-endpoint 401s now pass through directly with the real error message.

### OTP Registration "User Already Exists" Dead End

- **Context**: Phone-based registration goes OTP → verify → register.
- **Issue**: The backend OTP verify returns a dummy `access_token: "access_token"` (literal string, not a JWT) when the user doesn't have a session. Our JWT check correctly rejects it and calls `POST /auth/register`, but if the phone number is already registered, it fails with "User with this email already exists" — dead end.
- **Fix**: Added a fallback in `otp.tsx`: when registration fails with "already exists", automatically attempt `POST /auth/login` with the provided credentials. If login also fails, show an actionable alert with a "Go to Login" button.

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
