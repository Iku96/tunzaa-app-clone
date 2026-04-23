import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/services/config";
import { DeviceEventEmitter, Platform } from "react-native";
import { THEME_UPDATE_EVENT } from "@/providers/ThemeProvider";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  border: string;
}

interface ThemeContextType {
  colors: ThemeColors | null;
  refreshTheme: () => Promise<void>;
}

const defaultColors: ThemeColors = {
  primary: "#ED8936", // Orange
  secondary: "#2D3748",
  accent: "#3182CE",
  textPrimary: "#000000",
  textSecondary: "#666666",
  backgroundPrimary: "#FFFFFF",
  backgroundSecondary: "#F5F5F5",
  border: "#E5E5E5",
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  refreshTheme: async () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContext.Provider");
  }
  return context;
};

export function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colors, setColors] = useState<ThemeColors | null>(null);

  const loadTheme = async () => {
    try {
      // Try to load native theme first
      const nativeTheme = await AsyncStorage.getItem(
        STORAGE_KEYS.THEME_CONFIG + "_native"
      );
      if (nativeTheme) {
        setColors(JSON.parse(nativeTheme));
        return;
      }

      // Fall back to raw theme config
      const rawTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_CONFIG);
      if (rawTheme) {
        const themeData = JSON.parse(rawTheme);
        setColors({
          primary: themeData.primary,
          secondary: themeData.secondary,
          accent: themeData.accent,
          textPrimary: themeData.text?.primary || defaultColors.textPrimary,
          textSecondary:
            themeData.text?.secondary || defaultColors.textSecondary,
          backgroundPrimary:
            themeData.background?.primary || defaultColors.backgroundPrimary,
          backgroundSecondary:
            themeData.background?.secondary ||
            defaultColors.backgroundSecondary,
          border: themeData.border || defaultColors.border,
        });
        return;
      }

      // Use default colors if no theme is stored
      setColors(defaultColors);
    } catch (error) {
      console.error("Error loading theme:", error);
      setColors(defaultColors);
    }
  };

  useEffect(() => {
    loadTheme();

    // Listen for theme updates
    let subscription: any;
    let webListener: any;

    if (Platform.OS !== "web") {
      // Native event listener
      subscription = DeviceEventEmitter.addListener(
        THEME_UPDATE_EVENT,
        (themeData) => {
          setColors(themeData);
        }
      );
    } else {
      // Web event listener
      webListener = (event: any) => {
        setColors(event.detail);
      };
      window.addEventListener(THEME_UPDATE_EVENT, webListener);
    }

    // Cleanup
    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (webListener) {
        window.removeEventListener(THEME_UPDATE_EVENT, webListener);
      }
    };
  }, []);

  const refreshTheme = async () => {
    await loadTheme();
  };

  return (
    <ThemeContext.Provider
      value={{ colors: colors || defaultColors, refreshTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
