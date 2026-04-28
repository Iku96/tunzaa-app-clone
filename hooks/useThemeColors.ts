import { useTheme } from "@/context/theme";
import { Platform } from "react-native";
import { useColorScheme } from "@/lib/useColorScheme";

/**
 * Convert hex color to RGBA with opacity
 */
function hexToRgba(hex: string, opacity: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${opacity})`;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Hook to access theme colors with proper typing
 *
 * Usage:
 * ```tsx
 * const colors = useThemeColors();
 *
 * <View style={{ backgroundColor: colors.primary }}>
 *   <Text style={{ color: colors.textPrimary }}>Hello</Text>
 * </View>
 * ```
 */
export function useThemeColors() {
  const { colors } = useTheme();

  return {
    primary: colors?.primary || "#425BA4",
    secondary: colors?.secondary || "#2D3748",
    accent: colors?.accent || "#3182CE",
    textPrimary: colors?.textPrimary || "#000000",
    textSecondary: colors?.textSecondary || "#666666",
    backgroundPrimary: colors?.backgroundPrimary || "#FFFFFF",
    backgroundSecondary: colors?.backgroundSecondary || "#F5F5F5",
    border: colors?.border || "#E5E5E5",

    // Helper methods for common use cases
    asPrimaryStyle: () => ({
      backgroundColor: colors?.primary || "#425BA4",
    }),
    asSecondaryStyle: () => ({
      backgroundColor: colors?.secondary || "#2D3748",
    }),
    asAccentStyle: () => ({
      backgroundColor: colors?.accent || "#3182CE",
    }),
    asTextPrimaryStyle: () => ({
      color: colors?.textPrimary || "#000000",
    }),
    asTextSecondaryStyle: () => ({
      color: colors?.textSecondary || "#666666",
    }),
  };
}

/**
 * Hook to get resolved theme colors for React Native components
 * This bypasses CSS variables and provides direct color values
 * Now supports adaptive theming with proper dark/light mode fallbacks
 */
export function useResolvedThemeColors() {
  const { isDarkColorScheme } = useColorScheme();

  // if (Platform.OS === "web") {
  //   // On web, return null to use CSS variables as normal
  //   return null;
  // }

  // On React Native, get resolved colors from global
  if (typeof global !== "undefined" && (global as any).__THEME_COLORS__) {
    const colors = (global as any).__THEME_COLORS__;

    // Add comprehensive opacity helper functions
    return {
      ...colors,
      // Ensure secondary foreground is adaptive
      secondaryForeground: colors.secondaryForeground || (isDarkColorScheme ? "#1A1A1A" : "#FFFFFF"),
      // System color opacity helpers
      backgroundWithOpacity: (opacity: number) =>
        hexToRgba(colors.background, opacity),
      foregroundWithOpacity: (opacity: number) =>
        hexToRgba(colors.foreground, opacity),
      borderWithOpacity: (opacity: number) => hexToRgba(colors.border, opacity),
      mutedWithOpacity: (opacity: number) => hexToRgba(colors.muted, opacity),
      cardWithOpacity: (opacity: number) => hexToRgba(colors.card, opacity),

      // Brand color opacity helpers
      primaryWithOpacity: (opacity: number) =>
        hexToRgba(colors.primary, opacity),
      secondaryWithOpacity: (opacity: number) =>
        hexToRgba(colors.secondary, opacity),
      accentWithOpacity: (opacity: number) => hexToRgba(colors.accent, opacity),

      // Success color opacity helpers
      successWithOpacity: (opacity: number) =>
        hexToRgba(colors.success, opacity),

      // Info color opacity helpers
      infoWithOpacity: (opacity: number) =>
        hexToRgba(colors.info, opacity),

      // Warning color opacity helpers
      warningWithOpacity: (opacity: number) =>
        hexToRgba(colors.warning, opacity),

      // Additional opacity helpers
      destructiveWithOpacity: (opacity: number) =>
        hexToRgba(colors.destructive, opacity),
      inputWithOpacity: (opacity: number) => hexToRgba(colors.input, opacity),
    };
  }

  // Adaptive fallback colors that respect dark/light mode
  // Updated to follow Material Design 2 Dark Theme guidelines for better accessibility
  const adaptiveFallbackColors = {
    // System colors - respect dark/light mode with lighter dark theme colors
    background: isDarkColorScheme ? "#1A1A1A" : "#FFFFFF", // Lighter: 10% instead of 0%
    foreground: isDarkColorScheme ? "#FFFFFF" : "#000000",
    muted: isDarkColorScheme ? "#2A2A2A" : "#F5F5F5", // Lighter: 16% instead of 10%
    mutedForeground: isDarkColorScheme ? "#B3B3B3" : "#666666", // Lighter: 70% instead of 63%
    border: isDarkColorScheme ? "#404040" : "#E5E7EB", // Lighter: 25% instead of 23%
    input: isDarkColorScheme ? "#404040" : "#E5E7EB", // Lighter: 25% instead of 23%
    card: isDarkColorScheme ? "#2A2A2A" : "#FFFFFF", // Lighter: 16% instead of 12%
    cardForeground: isDarkColorScheme ? "#FFFFFF" : "#000000",

    // Brand colors - use system-appropriate defaults with improved dark theme variants
    primary: isDarkColorScheme ? "#425BA4" : "#425BA4", // Tunzaa Blue
    secondary: isDarkColorScheme ? "#9CA3AF" : "#4B5563", // Lighter gray for dark theme for better visibility
    accent: isDarkColorScheme ? "#22D3EE" : "#059669", // Lighter accent for dark theme

    // Semantic colors
    destructive: isDarkColorScheme ? "#EF4444" : "#EF4444", // Keep destructive bright for visibility
    success: isDarkColorScheme ? "#2E7D32" : "#4CAF50", // Success colors: light #4CAF50, dark #2E7D32
    info: isDarkColorScheme ? "#0288D1" : "#03A9F4", // Info colors: light #03A9F4, dark #0288D1
    warning: isDarkColorScheme ? "#ED6C02" : "#FF9800", // Warning colors: light #FF9800, dark #ED6C02

    // Foreground colors for brand colors - adaptive based on dark/light mode
    primaryForeground: isDarkColorScheme ? "#FFFFFF" : "#FFFFFF", // White text on dark primary
    secondaryForeground: isDarkColorScheme ? "#1A1A1A" : "#FFFFFF", // Dark text on light secondary in dark mode
    accentForeground: "#FFFFFF",
    destructiveForeground: "#FFFFFF",
    successForeground: "#FFFFFF", // White text on success colors
    infoForeground: "#FFFFFF", // White text on info colors
    warningForeground: "#FFFFFF", // White text on warning colors

    // Additional surface colors with lighter dark theme variants
    popover: isDarkColorScheme ? "#2A2A2A" : "#FFFFFF", // Lighter: 16% instead of 12%
    popoverForeground: isDarkColorScheme ? "#FFFFFF" : "#000000",
  };

  return {
    ...adaptiveFallbackColors,
    // Comprehensive opacity helper functions
    backgroundWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.background, opacity),
    foregroundWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.foreground, opacity),
    borderWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.border, opacity),
    mutedWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.muted, opacity),
    cardWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.card, opacity),

    // Brand color opacity helpers
    primaryWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.primary, opacity),
    secondaryWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.secondary, opacity),
    accentWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.accent, opacity),

    // Success color opacity helpers
    successWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.success, opacity),

    // Info color opacity helpers
    infoWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.info, opacity),

    // Warning color opacity helpers
    warningWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.warning, opacity),

    // Additional opacity helpers
    destructiveWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.destructive, opacity),
    inputWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.input, opacity),
    popoverWithOpacity: (opacity: number) =>
      hexToRgba(adaptiveFallbackColors.popover, opacity),
  };
}

/**
 * Hook to get CSS variable values for web
 * This is useful when you need to use theme colors in CSS-in-JS or inline styles on web
 */
export function useThemeCSSVariables() {
  if (Platform.OS !== "web") {
    return null;
  }

  return {
    primary: "var(--color-primary)",
    secondary: "var(--color-secondary)",
    accent: "var(--color-accent)",
    textPrimary: "var(--color-text-primary)",
    textSecondary: "var(--color-text-secondary)",
    backgroundPrimary: "var(--color-background-primary)",
    backgroundSecondary: "var(--color-background-secondary)",
    border: "var(--color-border)",
  };
}

/**
 * Utility hook for cross-platform brand color styling
 * Automatically handles web CSS fallbacks and React Native direct styling
 *
 * Usage:
 * ```tsx
 * const brandStyles = useBrandStyles();
 *
 * return (
 *   <View {...brandStyles.primaryBackground()}>
 *     <Text {...brandStyles.primaryText()}>Brand element</Text>
 *   </View>
 * );
 * ```
 */
export function useBrandStyles() {
  const resolvedColors = useResolvedThemeColors();

  const primaryBackground = (opacity = 1) => {
    if (resolvedColors) {
      // React Native: Direct styling
      return {
        style: {
          backgroundColor:
            opacity === 1
              ? resolvedColors.primary
              : resolvedColors.primaryWithOpacity(opacity),
        },
      };
    } else {
      // Web: CSS classes
      return {
        className:
          opacity === 1
            ? "bg-brand-primary"
            : `bg-brand-primary/${Math.round(opacity * 100)}`,
      };
    }
  };

  const secondaryBackground = (opacity = 1) => {
    if (resolvedColors) {
      return {
        style: {
          backgroundColor:
            opacity === 1
              ? resolvedColors.secondary
              : resolvedColors.secondaryWithOpacity(opacity),
        },
      };
    } else {
      return {
        className:
          opacity === 1
            ? "bg-brand-secondary"
            : `bg-brand-secondary/${Math.round(opacity * 100)}`,
      };
    }
  };

  const accentBackground = (opacity = 1) => {
    if (resolvedColors) {
      return {
        style: {
          backgroundColor:
            opacity === 1
              ? resolvedColors.accent
              : resolvedColors.accentWithOpacity(opacity),
        },
      };
    } else {
      return {
        className:
          opacity === 1
            ? "bg-brand-accent"
            : `bg-brand-accent/${Math.round(opacity * 100)}`,
      };
    }
  };

  const primaryText = () => {
    if (resolvedColors) {
      return {
        style: { color: resolvedColors.primary },
      };
    } else {
      return {
        className: "text-brand-primary",
      };
    }
  };

  const secondaryText = () => {
    if (resolvedColors) {
      return {
        style: { color: resolvedColors.secondary },
      };
    } else {
      return {
        className: "text-brand-secondary",
      };
    }
  };

  const accentText = () => {
    if (resolvedColors) {
      return {
        style: { color: resolvedColors.accent },
      };
    } else {
      return {
        className: "text-brand-accent",
      };
    }
  };

  const primaryBorder = () => {
    if (resolvedColors) {
      return {
        style: {
          borderColor: resolvedColors.primary,
          borderWidth: 1,
        },
      };
    } else {
      return {
        className: "border border-brand-primary",
      };
    }
  };

  const successBorder = () => {
    if (resolvedColors) {
      return {
        style: { borderColor: resolvedColors.success, borderWidth: 1 },
      };
    } else {
      return { className: "border border-success" };
    }
  };

  const successBackground = (opacity = 1) => {
    if (resolvedColors) {
      return {
        style: {
          backgroundColor:
            opacity === 1
              ? resolvedColors.success
              : resolvedColors.successWithOpacity(opacity),
        },
      };
    } else {
      return {
        className:
          opacity === 1
            ? "bg-success"
            : `bg-success/${Math.round(opacity * 100)}`,
      };
    }
  };

  const successText = () => {
    if (resolvedColors) {
      return {
        style: { color: resolvedColors.success },
      };
    } else {
      return {
        className: "text-success",
      };
    }
  };

  const infoBackground = (opacity = 1) => {
    if (resolvedColors) {
      return {
        style: {
          backgroundColor:
            opacity === 1
              ? resolvedColors.info
              : resolvedColors.infoWithOpacity(opacity),
        },
      };
    } else {
      return {
        className:
          opacity === 1
            ? "bg-info"
            : `bg-info/${Math.round(opacity * 100)}`,
      };
    }
  };

  const infoText = () => {
    if (resolvedColors) {
      return {
        style: { color: resolvedColors.info },
      };
    } else {
      return {
        className: "text-info",
      };
    }
  };

  const warningBackground = (opacity = 1) => {
    if (resolvedColors) {
      return {
        style: {
          backgroundColor:
            opacity === 1
              ? resolvedColors.warning
              : resolvedColors.warningWithOpacity(opacity),
        },
      };
    } else {
      return {
        className:
          opacity === 1
            ? "bg-warning"
            : `bg-warning/${Math.round(opacity * 100)}`,
      };
    }
  };

  const warningText = () => {
    if (resolvedColors) {
      return {
        style: { color: resolvedColors.warning },
      };
    } else {
      return {
        className: "text-warning",
      };
    }
  };

  return {
    primaryBackground,
    secondaryBackground,
    accentBackground,
    successBackground,
    infoBackground,
    warningBackground,
    primaryText,
    secondaryText,
    accentText,
    successText,
    infoText,
    warningText,
    primaryBorder,
    successBorder,
    // Convenience methods
    brandPrimary: primaryBackground,
    brandSecondary: secondaryBackground,
    brandAccent: accentBackground,
    brandSuccess: successBackground,
    brandInfo: infoBackground,
    brandWarning: warningBackground,
  };
}
