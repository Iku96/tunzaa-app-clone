import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Appearance } from "react-native";

// Function to get system theme for initial preferences
function getInitialSystemTheme(): "light" | "dark" {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  } else {
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === "dark" ? "dark" : "light";
  }
}

export interface Preferences {
  language: "en" | "sw" | "fr" | "ar" | "es" | "pt" | "zh" | "de";
  theme: "light" | "dark";
  notifications: boolean;
  hasSetLanguage: boolean; // Track if user has explicitly set a language
}

export const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "sw", name: "Kiswahili", flag: "🇹🇿" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "العربية", flag: "🇦🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
] as const;

interface PreferencesState extends Preferences {
  setLanguage: (language: Preferences["language"]) => void;
  setTheme: (theme: Preferences["theme"]) => void;
  setNotifications: (enabled: boolean) => void;
  getLanguageName: (code: Preferences["language"]) => string;
  getLanguageFlag: (code: Preferences["language"]) => string;
  isFirstTimeUser: () => boolean;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      language: "en",
      theme: getInitialSystemTheme(), // Use system theme as default
      notifications: true,
      hasSetLanguage: false, // Default to false for first-time users

      setLanguage: (language) => set({ language, hasSetLanguage: true }),
      setTheme: (theme) => set({ theme }),
      setNotifications: (notifications) => set({ notifications }),

      getLanguageName: (code) => {
        return languages.find((lang) => lang.code === code)?.name || "English";
      },

      getLanguageFlag: (code) => {
        return languages.find((lang) => lang.code === code)?.flag || "🇬🇧";
      },

      isFirstTimeUser: () => {
        return !get().hasSetLanguage;
      },
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
