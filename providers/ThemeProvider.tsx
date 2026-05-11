import React, { useEffect, useState } from "react";
import {
  View,
  DeviceEventEmitter,
  Platform,
  Appearance,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTenant } from "@/src/services/tenant";
import { useTenantStore } from "@/stores/tenant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/src/services/config";
import { useColorScheme } from "@/lib/useColorScheme";
import { useAppStateRefresh } from "@/hooks/useAppStateRefresh";

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Event name for theme updates
export const THEME_UPDATE_EVENT = "THEME_COLORS_UPDATED";

// Function to convert hex to RGB values (for CSS variables)
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "0, 0, 0";
}

// Function to convert hex to HSL for system colors
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
    l * 100
  )}%`;
}

// Function to get dark/light variants of colors based on system theme
function getThemeVariant(color: string, isDark: boolean): string {
  if (isDark) {
    // For dark mode, lighten the colors slightly
    const hsl = hexToHsl(color);
    const [h, s, l] = hsl.split(" ");
    const lightness = parseInt(l);
    const adjustedLightness = Math.min(lightness + 10, 90);
    return `${h} ${s} ${adjustedLightness}%`;
  }
  return hexToHsl(color);
}

// Function to apply CSS variables to document root (web only)
function applyCSSVariablesToDocument(styles: Record<string, string>) {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    Object.entries(styles).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
}

// Helper function to lighten a color
function lightenColor(hex: string, factor: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  const lightenedR = Math.min(255, Math.round(r + (255 - r) * factor));
  const lightenedG = Math.min(255, Math.round(g + (255 - g) * factor));
  const lightenedB = Math.min(255, Math.round(b + (255 - b) * factor));

  return `#${lightenedR.toString(16).padStart(2, "0")}${lightenedG
    .toString(16)
    .padStart(2, "0")}${lightenedB.toString(16).padStart(2, "0")}`;
}

// Helper function to darken a color
function darkenColor(hex: string, factor: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  const darkenedR = Math.max(0, Math.round(r * (1 - factor)));
  const darkenedG = Math.max(0, Math.round(g * (1 - factor)));
  const darkenedB = Math.max(0, Math.round(b * (1 - factor)));

  return `#${darkenedR.toString(16).padStart(2, "0")}${darkenedG
    .toString(16)
    .padStart(2, "0")}${darkenedB.toString(16).padStart(2, "0")}`;
}

// Helper function to get contrast color (white or black) for a given background
function getContrastColor(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 98%"; // Default to white

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? "0 0% 2%" : "0 0% 98%";
}

// Helper function to get contrast color as hex for React Native
function getContrastColorHex(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "#FFFFFF"; // Default to white

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { data: tenant, isLoading, error, refetch } = useTenant();
  const { setTenant, setLoading } = useTenantStore();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [themeStyles, setThemeStyles] = useState<any>(null);
  const [cachedTenant, setCachedTenant] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Auto-refresh tenant config when app comes to foreground
  useAppStateRefresh();

  // Load cached tenant data on mount
  useEffect(() => {
    const loadCachedTenant = async () => {
      try {
        console.log("Fetching cached tenant")
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_CONFIG);
        if (cached) {
          const parsedTenant = JSON.parse(cached);
          setCachedTenant(parsedTenant);
        }
      } catch (error) {
        console.error("Failed to load cached tenant:", error);
      }
    };
    loadCachedTenant();
  }, []);

  useEffect(() => {
    setLoading(isLoading);

    // Determine which tenant data to use (live data takes priority)
    const activeTenant = tenant || cachedTenant;

    if (activeTenant) {
      setTenant(activeTenant);

      // Cache the live tenant data when available
      if (tenant) {
        AsyncStorage.setItem(STORAGE_KEYS.TENANT_CONFIG, JSON.stringify(tenant))
          .catch((err) => console.error("Failed to cache tenant data:", err));
      }

      // Apply dynamic theming using CSS variables approach
      if (activeTenant.branding?.theme?.colors) {
        const colors = activeTenant.branding.theme.colors;

        // Define system-appropriate colors based on dark/light mode
        // Updated to follow Material Design 2 Dark Theme guidelines for better accessibility
        const systemColors = {
          // System backgrounds - Locked to Light Mode
          background: {
            primary: "#FFFFFF",
            secondary: "#F5F5F5",
            tertiary: "#F8F9FA",
            elevated: "#FFFFFF",
          },
          // System text colors - Locked to Light Mode
          text: {
            primary: "#000000",
            secondary: "#666666",
            tertiary: "#9CA3AF",
            disabled: "#D1D5DB",
          },
          // System borders and dividers - Locked to Light Mode
          border: {
            primary: "#E5E7EB",
            secondary: "#D1D5DB",
            focus: "#3B82F6",
          },
          // System surfaces - Locked to Light Mode
          surface: {
            default: "#FFFFFF",
            elevated: "#FFFFFF",
            sunken: "#F9FAFB",
          },
        };

        // Get Tunzaa brand colors (Locking branding to Tunzaa 2.0)
        const brandColors = {
          primary: "#315BA9", // Tunzaa Blue
          secondary: "#84CC16", // Tunzaa Green
          accent: "#FBBF24", // Tunzaa Yellow
        };

        // Create CSS variable styles for adaptive theming
        const dynamicStyles = {
          // System colors (backgrounds, text, borders) - always respect dark/light mode
          "--color-background-primary": hexToRgb(
            systemColors.background.primary
          ),
          "--color-background-secondary": hexToRgb(
            systemColors.background.secondary
          ),
          "--color-background-tertiary": hexToRgb(
            systemColors.background.tertiary
          ),
          "--color-background-elevated": hexToRgb(
            systemColors.background.elevated
          ),

          "--color-text-primary": hexToRgb(systemColors.text.primary),
          "--color-text-secondary": hexToRgb(systemColors.text.secondary),
          "--color-text-tertiary": hexToRgb(systemColors.text.tertiary),
          "--color-text-disabled": hexToRgb(systemColors.text.disabled),

          "--color-border-primary": hexToRgb(systemColors.border.primary),
          "--color-border-secondary": hexToRgb(systemColors.border.secondary),
          "--color-border-focus": hexToRgb(systemColors.border.focus),

          "--color-surface-default": hexToRgb(systemColors.surface.default),
          "--color-surface-elevated": hexToRgb(systemColors.surface.elevated),
          "--color-surface-sunken": hexToRgb(systemColors.surface.sunken),

          // Brand colors (tenant-specific) - maintain brand identity
          "--color-brand-primary": hexToRgb(brandColors.primary),
          "--color-brand-secondary": hexToRgb(brandColors.secondary),
          "--color-brand-accent": hexToRgb(brandColors.accent),

          // Legacy theme colors (for backward compatibility)
          "--color-primary": hexToRgb(brandColors.primary),
          "--color-secondary": hexToRgb(brandColors.secondary),
          "--color-accent": hexToRgb(brandColors.accent),

          // System colors for react-native-reusables (HSL format)
          "--background": hexToHsl(systemColors.background.primary),
          "--foreground": hexToHsl(systemColors.text.primary),
          "--card": hexToHsl(systemColors.surface.elevated),
          "--card-foreground": hexToHsl(systemColors.text.primary),
          "--popover": hexToHsl(systemColors.surface.elevated),
          "--popover-foreground": hexToHsl(systemColors.text.primary),
          "--primary": hexToHsl(brandColors.primary),
          "--primary-foreground": getContrastColor(brandColors.primary),
          "--secondary": hexToHsl(brandColors.secondary),
          "--secondary-foreground": hexToHsl("#FFFFFF"),
          "--muted": hexToHsl(systemColors.background.secondary),
          "--muted-foreground": hexToHsl(systemColors.text.secondary),
          "--accent": hexToHsl(brandColors.accent),
          "--accent-foreground": getContrastColor(brandColors.accent),
          "--destructive": "0 84.2% 60.2%",
          "--destructive-foreground": "0 0% 98%",
          "--border": hexToHsl(systemColors.border.primary),
          "--input": hexToHsl(systemColors.border.primary),
          "--ring": hexToHsl(brandColors.primary),
        };

        // Only update if styles actually changed to prevent render loops
        if (JSON.stringify(dynamicStyles) !== JSON.stringify(themeStyles)) {
          setThemeStyles(dynamicStyles);
          // Apply CSS variables to document root on web
          applyCSSVariablesToDocument(dynamicStyles);
        }

        // Store adaptive theme colors for React Native direct access
        if (Platform.OS !== "web") {
          // Store resolved theme colors in global for React Native components
          const resolvedColors = {
            // System colors
            background: systemColors.background.primary,
            backgroundSecondary: systemColors.background.secondary,
            backgroundTertiary: systemColors.background.tertiary,
            backgroundElevated: systemColors.background.elevated,

            foreground: systemColors.text.primary,
            foregroundSecondary: systemColors.text.secondary,
            foregroundTertiary: systemColors.text.tertiary,
            foregroundDisabled: systemColors.text.disabled,

            border: systemColors.border.primary,
            borderSecondary: systemColors.border.secondary,
            borderFocus: systemColors.border.focus,

            surface: systemColors.surface.default,
            surfaceElevated: systemColors.surface.elevated,
            surfaceSunken: systemColors.surface.sunken,

            // Brand colors
            primary: brandColors.primary,
            secondary: brandColors.secondary,
            accent: brandColors.accent,

            // Legacy mappings for backward compatibility
            card: systemColors.surface.elevated,
            input: systemColors.border.primary,
            muted: systemColors.background.secondary,
            destructive: "#EF4444",

            // Semantic colors
            success: isDarkColorScheme ? "#2E7D32" : "#4CAF50",
            info: isDarkColorScheme ? "#0288D1" : "#03A9F4",
            warning: isDarkColorScheme ? "#ED6C02" : "#FF9800",

            // Foreground colors for brand colors (hex format for React Native)
            primaryForeground: getContrastColorHex(brandColors.primary),
            secondaryForeground: isDarkColorScheme 
              ? "#1A1A1A" // Dark text on light secondary in dark mode
              : "#FFFFFF", // White text on dark secondary in light mode
            accentForeground: getContrastColorHex(brandColors.accent),
            destructiveForeground: "#FFFFFF",
            successForeground: "#FFFFFF",
            infoForeground: "#FFFFFF",
            warningForeground: "#FFFFFF",
            mutedForeground: systemColors.text.secondary,
          };

          // Store in global for component access
          if (typeof global !== "undefined") {
            (global as any).__THEME_COLORS__ = resolvedColors;
          }
        }

        // Store theme configuration for offline access
        AsyncStorage.setItem(
          STORAGE_KEYS.THEME_CONFIG,
          JSON.stringify({
            isDarkMode: isDarkColorScheme,
            systemColors,
            brandColors,
            timestamp: Date.now(),
          })
        );

        // Store processed theme for native components that need direct access
        const themeForNative = {
          // Brand colors
          primary: brandColors.primary,
          secondary: brandColors.secondary,
          accent: brandColors.accent,

          // System colors
          textPrimary: systemColors.text.primary,
          textSecondary: systemColors.text.secondary,
          backgroundPrimary: systemColors.background.primary,
          backgroundSecondary: systemColors.background.secondary,
          border: systemColors.border.primary,

          isDark: isDarkColorScheme,
        };

        AsyncStorage.setItem(
          STORAGE_KEYS.THEME_CONFIG + "_native",
          JSON.stringify(themeForNative)
        );

        // Emit theme update event for components that need it
        if (Platform.OS !== "web") {
          DeviceEventEmitter.emit(THEME_UPDATE_EVENT, themeForNative);
        } else {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent(THEME_UPDATE_EVENT, { detail: themeForNative })
            );
          }
        }

      } else {
        // Apply default adaptive theme when no tenant branding is available

        // Define system colors for adaptive theming
        const systemColors = {
          background: {
            primary: isDarkColorScheme ? "#000000" : "#FFFFFF",
            secondary: isDarkColorScheme ? "#1A1A1A" : "#F5F5F5",
            elevated: isDarkColorScheme ? "#1F1F1F" : "#FFFFFF",
          },
          text: {
            primary: isDarkColorScheme ? "#FFFFFF" : "#000000",
            secondary: isDarkColorScheme ? "#A1A1AA" : "#666666",
          },
          border: {
            primary: isDarkColorScheme ? "#374151" : "#E5E7EB",
          },
        };

        // Tunzaa default brand colors
        const defaultBrandColors = {
          primary: "#315BA9", // Tunzaa Blue
          secondary: "#84CC16", // Tunzaa Green
          accent: "#FBBF24", // Tunzaa Yellow
        };

        const defaultStyles = {
          // System colors
          "--color-background-primary": hexToRgb(
            systemColors.background.primary
          ),
          "--color-background-secondary": hexToRgb(
            systemColors.background.secondary
          ),
          "--color-text-primary": hexToRgb(systemColors.text.primary),
          "--color-text-secondary": hexToRgb(systemColors.text.secondary),
          "--color-border-primary": hexToRgb(systemColors.border.primary),

          // Brand colors
          "--color-brand-primary": hexToRgb(defaultBrandColors.primary),
          "--color-brand-secondary": hexToRgb(defaultBrandColors.secondary),
          "--color-brand-accent": hexToRgb(defaultBrandColors.accent),
          "--color-primary": hexToRgb(defaultBrandColors.primary),
          "--color-secondary": hexToRgb(defaultBrandColors.secondary),
          "--color-accent": hexToRgb(defaultBrandColors.accent),

          // System colors for react-native-reusables
          "--background": hexToHsl(systemColors.background.primary),
          "--foreground": hexToHsl(systemColors.text.primary),
          "--primary": hexToHsl(defaultBrandColors.primary),
          "--primary-foreground": getContrastColor(defaultBrandColors.primary),
          "--secondary": hexToHsl(defaultBrandColors.secondary),
          "--secondary-foreground": isDarkColorScheme 
            ? hexToHsl("#1A1A1A") // Dark text on light secondary in dark mode
            : hexToHsl("#FFFFFF"), // White text on dark secondary in light mode
          "--muted": hexToHsl(systemColors.background.secondary),
          "--muted-foreground": hexToHsl(systemColors.text.secondary),
          "--border": hexToHsl(systemColors.border.primary),
          "--card": hexToHsl(systemColors.background.elevated),
          "--card-foreground": hexToHsl(systemColors.text.primary),
          "--destructive": isDarkColorScheme
            ? "0 62.8% 30.6%"
            : "0 84.2% 60.2%",
          "--destructive-foreground": "0 0% 98%",
          "--success": isDarkColorScheme
            ? "142 76% 36%"  // #2E7D32 - darker green for dark mode
            : "142 69% 58%", // #4CAF50 - lighter green for light mode
          "--success-foreground": "0 0% 98%",
          "--info": isDarkColorScheme
            ? "199 89% 48%"
            : "199 89% 48%",
          "--info-foreground": "0 0% 98%",
          "--warning": isDarkColorScheme
            ? "33 100% 50%"
            : "33 100% 50%",
          "--warning-foreground": "0 0% 98%",
        };

        // Only update if styles actually changed to prevent render loops
        if (JSON.stringify(defaultStyles) !== JSON.stringify(themeStyles)) {
          setThemeStyles(defaultStyles);
          applyCSSVariablesToDocument(defaultStyles);
        }

        // Store default theme colors for React Native
        if (Platform.OS !== "web") {
          const defaultResolvedColors = {
            background: systemColors.background.primary,
            foreground: systemColors.text.primary,
            primary: defaultBrandColors.primary,
            secondary: defaultBrandColors.secondary,
            accent: defaultBrandColors.accent,
            border: systemColors.border.primary,
            card: systemColors.background.elevated,
            muted: systemColors.background.secondary,
            mutedForeground: systemColors.text.secondary,
            primaryForeground: getContrastColorHex(defaultBrandColors.primary),
            secondaryForeground: isDarkColorScheme 
              ? "#1A1A1A" // Dark text on light secondary in dark mode
              : "#FFFFFF", // White text on dark secondary in light mode
            accentForeground: getContrastColorHex(defaultBrandColors.accent),
            destructive: "#EF4444",
            destructiveForeground: "#FFFFFF",
            success: isDarkColorScheme ? "#2E7D32" : "#4CAF50",
            successForeground: "#FFFFFF",
            info: isDarkColorScheme ? "#0288D1" : "#03A9F4",
            infoForeground: "#FFFFFF",
            warning: isDarkColorScheme ? "#ED6C02" : "#FF9800",
            warningForeground: "#FFFFFF",
          };

          if (typeof global !== "undefined") {
            (global as any).__THEME_COLORS__ = defaultResolvedColors;
          }
        }
      }

      // Store logo URL
      if (activeTenant.branding?.logoUrl) {
        AsyncStorage.setItem(
          STORAGE_KEYS.APP_LOGO_URL,
          activeTenant.branding.logoUrl
        );
      }
    }

    // Handle errors and retry logic
    if (error && !isLoading) {
      console.error("Tenant fetch error:", error);

      if (!cachedTenant && retryCount < 3) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, 1000 * Math.pow(2, retryCount));
      } else if (!cachedTenant && retryCount >= 3) {
        const fallbackTenant = {
          id: "fallback",
          name: "Default App",
          branding: {
            theme: {
              colors: {
                primary: "#315BA9",
                secondary: "#84CC16",
                accent: "#FBBF24",
              },
            },
          },
        };
        setCachedTenant(fallbackTenant);
      }

      setLoading(false);
    }
  }, [
    tenant,
    isLoading,
    error,
    setTenant,
    setLoading,
    colorScheme,
    isDarkColorScheme,
    cachedTenant,
    retryCount,
  ]);

  // Listen for system theme changes and update accordingly
  useEffect(() => {
    const handleSystemThemeChange = (preferences: any) => {
      // Theme will be updated through the main useEffect when colorScheme changes
    };

    if (Platform.OS !== "web") {
      const subscription = Appearance.addChangeListener(
        handleSystemThemeChange
      );
      return () => subscription?.remove();
    }
  }, []);

  // Set up system theme listener for web
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleWebThemeChange = (e: MediaQueryListEvent) => {
        const webSystemTheme = e.matches ? "dark" : "light";
      };
      mediaQuery.addEventListener("change", handleWebThemeChange);
      
      return () => {
        mediaQuery.removeEventListener("change", handleWebThemeChange);
      };
    }
  }, []);

  // Ensure we have tenant data before rendering
  const activeTenant = tenant || cachedTenant;

  if (isLoading && !cachedTenant) {
    // Show loading state only if we have no cached data
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-center text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (error && !activeTenant) {
    // This should rarely happen due to fallback logic above
    console.error("Failed to load tenant configuration:", error);
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-center text-destructive">
          Unable to load app configuration
        </Text>
      </View>
    );
  }

  // Apply CSS variables to the root View
  return (
    <View style={themeStyles} className="flex-1">
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      {children}
    </View>
  );
}
