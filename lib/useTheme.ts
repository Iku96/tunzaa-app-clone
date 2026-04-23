import { useEffect, useState } from "react";
import { Platform, DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/services/config";
import { THEME_UPDATE_EVENT } from "@/providers/ThemeProvider";
import { useColorScheme } from "./useColorScheme";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  border: string;
  isDark: boolean;
}

export function useTheme() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [themeColors, setThemeColors] = useState<ThemeColors | null>(null);

  // Load theme from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(
          STORAGE_KEYS.THEME_CONFIG + "_native"
        );
        if (storedTheme) {
          const parsedTheme = JSON.parse(storedTheme);
          setThemeColors(parsedTheme);
        } else {
          // Fallback to default theme
          setThemeColors({
            primary: isDarkColorScheme ? "#3B82F6" : "#2563EB",
            secondary: isDarkColorScheme ? "#6B7280" : "#4B5563",
            accent: isDarkColorScheme ? "#10B981" : "#059669",
            textPrimary: isDarkColorScheme ? "#FFFFFF" : "#000000",
            textSecondary: isDarkColorScheme ? "#CCCCCC" : "#666666",
            backgroundPrimary: isDarkColorScheme ? "#000000" : "#FFFFFF",
            backgroundSecondary: isDarkColorScheme ? "#1A1A1A" : "#F5F5F5",
            border: isDarkColorScheme ? "#333333" : "#E5E5E5",
            isDark: isDarkColorScheme,
          });
        }
      } catch (error) {
        console.error("Error loading theme:", error);
        // Fallback theme
        setThemeColors({
          primary: isDarkColorScheme ? "#3B82F6" : "#2563EB",
          secondary: isDarkColorScheme ? "#6B7280" : "#4B5563",
          accent: isDarkColorScheme ? "#10B981" : "#059669",
          textPrimary: isDarkColorScheme ? "#FFFFFF" : "#000000",
          textSecondary: isDarkColorScheme ? "#CCCCCC" : "#666666",
          backgroundPrimary: isDarkColorScheme ? "#000000" : "#FFFFFF",
          backgroundSecondary: isDarkColorScheme ? "#1A1A1A" : "#F5F5F5",
          border: isDarkColorScheme ? "#333333" : "#E5E5E5",
          isDark: isDarkColorScheme,
        });
      }
    };

    loadTheme();
  }, [isDarkColorScheme]);

  // Listen for theme updates
  useEffect(() => {
    const handleThemeUpdate = (newTheme: ThemeColors) => {
      setThemeColors(newTheme);
    };

    if (Platform.OS !== "web") {
      const subscription = DeviceEventEmitter.addListener(
        THEME_UPDATE_EVENT,
        handleThemeUpdate
      );
      return () => subscription.remove();
    } else {
      if (typeof window !== "undefined") {
        const handleWebThemeUpdate = (event: CustomEvent<ThemeColors>) => {
          handleThemeUpdate(event.detail);
        };
        window.addEventListener(
          THEME_UPDATE_EVENT,
          handleWebThemeUpdate as EventListener
        );
        return () =>
          window.removeEventListener(
            THEME_UPDATE_EVENT,
            handleWebThemeUpdate as EventListener
          );
      }
    }
  }, []);

  return {
    themeColors,
    isDarkMode: isDarkColorScheme,
    colorScheme,
  };
}
