import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

// Import translation resources
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import sw from "../locales/sw.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  sw: { translation: sw },
};

// Get device locale
const deviceLanguage = getLocales()[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage, // Use device language as default
  fallbackLng: "en",
  debug: __DEV__,

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  react: {
    useSuspense: false, // Important for React Native
  },
});

export default i18n;
