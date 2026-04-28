/**
 * Supported app languages configuration.
 *
 * Uses ISO 639-1 two-letter language codes for compatibility with
 * platform locale APIs and i18n tooling. To add a new language:
 * 1. Add an entry here with code, name (in that language), and optional nativeName.
 * 2. Add translation keys for the new code in src/i18n/translations.ts.
 * 3. No other code changes required; the language screen reads from this list.
 *
 * @see https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 */

export const LANGUAGE_STORAGE_KEY = 'tunzaa_app_language';

/** ISO 639-1 language code type for type safety when adding new languages. */
export type LanguageCode = 'en' | 'sw' | string;

/**
 * Single supported language entry.
 * - code: ISO 639-1 code (e.g. 'en', 'sw').
 * - name: Display name in English (for UI in language list).
 * - nativeName: Optional display name in the language itself (e.g. "Kiswahili").
 */
export interface SupportedLanguage {
    code: LanguageCode;
    name: string;
    nativeName?: string;
}

/**
 * Ordered list of languages shown in the language picker.
 * Add new languages here; the rest of the app will pick them up automatically.
 */
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'sw', name: 'Kiswahili', nativeName: 'Kiswahili' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
] as const;

/** Default app language when none is selected (e.g. first launch). */
export const DEFAULT_LANGUAGE_CODE: LanguageCode = 'en';

/** Type for a value from SUPPORTED_LANGUAGES (readonly tuple). */
export type SupportedLanguageEntry = (typeof SUPPORTED_LANGUAGES)[number];
