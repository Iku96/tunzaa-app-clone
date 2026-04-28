/**
 * Language (locale) context and provider.
 *
 * Persists the user's language choice in AsyncStorage so it survives app restarts.
 * Provides: locale (current ISO 639-1 code), setLocale (update + persist), and t (translations).
 *
 * Usage: wrap the app in LanguageProvider (see app/_layout.tsx), then in any component:
 *   const { locale, setLocale, t } = useLanguage();
 *   <Text>{t.languageScreenTitle}</Text>
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    DEFAULT_LANGUAGE_CODE,
    LANGUAGE_STORAGE_KEY,
    type LanguageCode,
} from '../constants/languages';
import { getTranslations, type TranslationKeys } from '../i18n/translations';

/** Shape of the value provided by LanguageContext. */
interface LanguageContextValue {
    /** Current language code (ISO 639-1). */
    locale: LanguageCode;
    /** Set language and persist to storage. */
    setLocale: (code: LanguageCode) => Promise<void>;
    /** Translation strings for the current locale. */
    t: TranslationKeys;
    /** True until we've read the stored locale (avoids flash of default language). */
    isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Props for LanguageProvider. No required props; optional initialLocale for tests.
 */
interface LanguageProviderProps {
    children: React.ReactNode;
    /** Optional initial locale before storage is read (e.g. in tests). */
    initialLocale?: LanguageCode;
}

/**
 * Provider that loads the saved language from storage and exposes locale + translations.
 * Renders children once hydration is done so the correct language shows immediately where possible.
 */
export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
    const [locale, setLocaleState] = useState<LanguageCode>(initialLocale ?? DEFAULT_LANGUAGE_CODE);
    const [isHydrated, setIsHydrated] = useState(!initialLocale);

    // Load persisted language on mount
    useEffect(() => {
        if (initialLocale !== undefined) {
            setIsHydrated(true);
            return;
        }
        let cancelled = false;
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
            .then((stored) => {
                if (!cancelled && stored) {
                    setLocaleState(stored as LanguageCode);
                }
            })
            .finally(() => {
                if (!cancelled) setIsHydrated(true);
            });
        return () => {
            cancelled = true;
        };
    }, [initialLocale]);

    const setLocale = useCallback(async (code: LanguageCode) => {
        setLocaleState(code);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    }, []);

    const t = useMemo(() => getTranslations(locale), [locale]);

    const value = useMemo<LanguageContextValue>(
        () => ({ locale, setLocale, t, isHydrated }),
        [locale, setLocale, t, isHydrated]
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Hook to access the current locale and translations.
 * Must be used inside a LanguageProvider.
 */
export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return ctx;
}
