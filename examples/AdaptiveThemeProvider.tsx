import React, { useEffect, useState } from "react";
import {
  View,
  DeviceEventEmitter,
  Platform,
  Appearance,
  Text,
} from "react-native";
import { useTenant } from "@/src/services/tenant";
import { useTenantStore } from "@/stores/tenant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/src/services/config";
import { useColorScheme } from "@/lib/useColorScheme";

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

// Function to apply CSS variables to document root (web only)
function applyCSSVariablesToDocument(styles: Record<string, string>) {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    Object.entries(styles).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
}

/**
 * Adaptive ThemeProvider that creates true dark mode experience
 * Tenant colors are used for branding while system colors handle backgrounds and text
 */
export function AdaptiveThemeProvider({ children }: ThemeProviderProps) {
  const { data: tenant, isLoading, error, refetch } = useTenant();
  const { setTenant, setLoading } = useTenantStore();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [themeStyles, setThemeStyles] = useState<any>(null);
  const [cachedTenant, setCachedTenant] = useState<any>(null);

  // Load cached tenant data on mount
  useEffect(() => {
    const loadCachedTenant = async () => {
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_CONFIG);
        if (cached) {
          setCachedTenant(JSON.parse(cached));
        }
      } catch (error) {
        console.error("Failed to load cached tenant:", error);
      }
    };
    loadCachedTenant();
  }, []);

  useEffect(() => {
    setLoading(isLoading);

    const activeTenant = tenant || cachedTenant;

    if (activeTenant) {
      setTenant(activeTenant);

      // Cache the live tenant data when available
      if (tenant) {
        AsyncStorage.setItem(
          STORAGE_KEYS.TENANT_CONFIG,
          JSON.stringify(tenant)
        );
      }

      // Apply adaptive theming that respects system dark/light mode
      const applyAdaptiveTheming = () => {
        // Define system-appropriate colors based on dark/light mode
        const systemColors = {
          // System backgrounds - always respect dark/light mode
          background: {
            primary: isDarkColorScheme ? "#000000" : "#FFFFFF",
            secondary: isDarkColorScheme ? "#1A1A1A" : "#F5F5F5",
            tertiary: isDarkColorScheme ? "#2D2D2D" : "#F8F9FA",
            elevated: isDarkColorScheme ? "#1F1F1F" : "#FFFFFF",
          },
          // System text colors - always respect dark/light mode
          text: {
            primary: isDarkColorScheme ? "#FFFFFF" : "#000000",
            secondary: isDarkColorScheme ? "#A1A1AA" : "#666666",
            tertiary: isDarkColorScheme ? "#71717A" : "#9CA3AF",
            disabled: isDarkColorScheme ? "#52525B" : "#D1D5DB",
          },
          // System borders and dividers
          border: {
            primary: isDarkColorScheme ? "#374151" : "#E5E7EB",
            secondary: isDarkColorScheme ? "#4B5563" : "#D1D5DB",
            focus: isDarkColorScheme ? "#60A5FA" : "#3B82F6",
          },
          // System surfaces
          surface: {
            default: isDarkColorScheme ? "#111111" : "#FFFFFF",
            elevated: isDarkColorScheme ? "#1C1C1C" : "#FFFFFF",
            sunken: isDarkColorScheme ? "#0A0A0A" : "#F9FAFB",
          },
        };

        // Get tenant brand colors (these will be used as accents)
        const tenantColors = activeTenant.branding?.theme?.colors;
        const brandColors = {
          primary:
            tenantColors?.primary ||
            (isDarkColorScheme ? "#3B82F6" : "#2563EB"),
          secondary:
            tenantColors?.secondary ||
            (isDarkColorScheme ? "#6B7280" : "#4B5563"),
          accent:
            tenantColors?.accent || (isDarkColorScheme ? "#10B981" : "#059669"),
        };

        // Create CSS variables for the adaptive theme
        const adaptiveStyles = {
          // System colors (backgrounds, text, borders) - These always respect dark/light mode
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

          // Brand colors (tenant-specific) - These maintain brand identity
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
          "--secondary": hexToHsl(systemColors.background.secondary),
          "--secondary-foreground": hexToHsl(systemColors.text.primary),
          "--muted": hexToHsl(systemColors.background.secondary),
          "--muted-foreground": hexToHsl(systemColors.text.secondary),
          "--accent": hexToHsl(brandColors.accent),
          "--accent-foreground": getContrastColor(brandColors.accent),
          "--destructive": isDarkColorScheme
            ? "0 62.8% 30.6%"
            : "0 84.2% 60.2%",
          "--destructive-foreground": "0 0% 98%",
          "--border": hexToHsl(systemColors.border.primary),
          "--input": hexToHsl(systemColors.border.primary),
          "--ring": hexToHsl(brandColors.primary),
        };

        setThemeStyles(adaptiveStyles);
        applyCSSVariablesToDocument(adaptiveStyles);

        // Store adaptive theme colors for React Native direct access
        if (Platform.OS !== "web") {
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

            // Legacy mappings
            card: systemColors.surface.elevated,
            input: systemColors.border.primary,
            muted: systemColors.background.secondary,
            destructive: "#EF4444",

            // Foreground colors for brand colors
            primaryForeground: getContrastColor(brandColors.primary),
            secondaryForeground: getContrastColor(brandColors.secondary),
            accentForeground: getContrastColor(brandColors.accent),
            destructiveForeground: "#FFFFFF",
            mutedForeground: systemColors.text.secondary,

            // Opacity helper functions
            primaryWithOpacity: (opacity: number) =>
              `rgba(${hexToRgb(brandColors.primary)}, ${opacity})`,
            secondaryWithOpacity: (opacity: number) =>
              `rgba(${hexToRgb(brandColors.secondary)}, ${opacity})`,
            accentWithOpacity: (opacity: number) =>
              `rgba(${hexToRgb(brandColors.accent)}, ${opacity})`,
            borderWithOpacity: (opacity: number) =>
              `rgba(${hexToRgb(systemColors.border.primary)}, ${opacity})`,
          };

          if (typeof global !== "undefined") {
            (global as any).__THEME_COLORS__ = resolvedColors;
          }
        }

        // Store theme configuration for offline access
        const themeConfig = {
          isDarkMode: isDarkColorScheme,
          systemColors,
          brandColors,
          timestamp: Date.now(),
        };

        AsyncStorage.setItem(
          STORAGE_KEYS.THEME_CONFIG,
          JSON.stringify(themeConfig)
        );

        // Store processed theme for native components
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

        // Emit theme update event
        if (Platform.OS !== "web") {
          DeviceEventEmitter.emit(THEME_UPDATE_EVENT, themeForNative);
        } else {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent(THEME_UPDATE_EVENT, { detail: themeForNative })
            );
          }
        }
      };

      applyAdaptiveTheming();

      // Store logo URL
      if (activeTenant.branding?.logoUrl) {
        AsyncStorage.setItem(
          STORAGE_KEYS.APP_LOGO_URL,
          activeTenant.branding.logoUrl
        );
      }
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
  ]);

  // Listen for system theme changes
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

  // Apply CSS variables to the root View
  return (
    <View style={themeStyles} className="flex-1">
      {children}
    </View>
  );
}
