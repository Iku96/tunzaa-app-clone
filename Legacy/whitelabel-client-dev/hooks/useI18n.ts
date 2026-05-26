import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { getLocales } from "expo-localization";
import { usePreferencesStore } from "@/stores/preferences";
import i18n from "@/config/i18n";

export const useI18n = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const { language, setLanguage } = usePreferencesStore();

  // Update i18n language when preference changes
  useEffect(() => {
    if (language !== i18nInstance.language) {
      i18nInstance.changeLanguage(language);
    }
  }, [language, i18nInstance]);

  // Sync with device locale on app start (only if no saved preference)
  useEffect(() => {
    const deviceLanguage = getLocales()[0]?.languageCode || "en";
    const supportedLanguages = ["en", "fr", "sw"];
    const validDeviceLanguage = supportedLanguages.includes(deviceLanguage)
      ? deviceLanguage
      : "en";

    // Only update if current language is default 'en' and device has different preference
    if (language === "en" && validDeviceLanguage !== "en") {
      // Wrap in setTimeout to avoid state update during mount phase issues
      const timer = setTimeout(() => {
        setLanguage(validDeviceLanguage as any);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [language, setLanguage]);

  const changeLanguage = (lang: "en" | "fr" | "sw") => {
    setLanguage(lang);
    i18nInstance.changeLanguage(lang);
  };

  return {
    t,
    language: i18nInstance.language,
    changeLanguage,
    isReady: i18nInstance.isInitialized,
  };
};
