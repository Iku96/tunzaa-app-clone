import * as Slot from "@rn-primitives/slot";
import type { SlottableTextProps, TextRef } from "@rn-primitives/types";
import * as React from "react";
import { Text as RNText, Platform } from "react-native";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { typography } from "@/styles/theme/typography";

const TextClassContext = React.createContext<string | undefined>(undefined);

const Text = React.forwardRef<TextRef, SlottableTextProps & { className?: string }>(
  ({ className, asChild = false, style, ...props }, ref) => {
    const textClass = React.useContext(TextClassContext);
    const resolvedColors = useResolvedThemeColors();
    const Component = asChild ? Slot.Text : RNText;

    // Map Tailwind font classes to Lato font families
    const getLatoFontFamily = (classes: string) => {
      const isItalic = classes.includes("italic");

      if (classes.includes("font-thin")) {
        return isItalic ? typography.fontFamily.thinItalic : typography.fontFamily.thin;
      }
      if (classes.includes("font-extralight")) {
        return isItalic ? typography.fontFamily.extraLightItalic : typography.fontFamily.extraLight;
      }
      if (classes.includes("font-light")) {
        return isItalic ? typography.fontFamily.lightItalic : typography.fontFamily.light;
      }
      if (classes.includes("font-medium")) {
        return isItalic ? typography.fontFamily.mediumItalic : typography.fontFamily.medium;
      }
      if (classes.includes("font-semibold")) {
        return isItalic ? typography.fontFamily.semiBoldItalic : typography.fontFamily.semiBold;
      }
      if (classes.includes("font-bold")) {
        return isItalic ? typography.fontFamily.boldItalic : typography.fontFamily.bold;
      }
      if (classes.includes("font-extrabold")) {
        return isItalic ? typography.fontFamily.extraBoldItalic : typography.fontFamily.extraBold;
      }
      if (classes.includes("font-black")) {
        return isItalic ? typography.fontFamily.blackItalic : typography.fontFamily.black;
      }

      return isItalic ? typography.fontFamily.regularItalic : typography.fontFamily.regular;
    };

    const getNativeTextStyle = () => {
      if (Platform.OS === "web") return {};

      const allClasses = cn(textClass, className) || "";
      const styles: any = {};

      // 1. Handle Colors
      if (resolvedColors) {
        if (allClasses.includes("text-foreground")) styles.color = resolvedColors.foreground;
        else if (allClasses.includes("text-primary-foreground")) styles.color = resolvedColors.primaryForeground;
        else if (allClasses.includes("text-secondary-foreground")) styles.color = resolvedColors.secondaryForeground;
        else if (allClasses.includes("text-accent-foreground")) styles.color = resolvedColors.accentForeground;
        else if (allClasses.includes("text-destructive-foreground")) styles.color = resolvedColors.destructiveForeground;
        else if (allClasses.includes("text-muted-foreground")) styles.color = resolvedColors.mutedForeground;
        else if (allClasses.includes("text-primary")) styles.color = resolvedColors.primary;
        else if (allClasses.includes("text-secondary")) styles.color = resolvedColors.secondary;
        else if (allClasses.includes("text-accent")) styles.color = resolvedColors.accent;
        else if (allClasses.includes("text-destructive")) styles.color = resolvedColors.destructive;
        else if (allClasses.includes("text-muted")) styles.color = resolvedColors.muted;
      }

      // 2. Handle Font Sizes (Internal Scaling)
      const allClassesList = allClasses.split(" ");
      const hasExplicitFontSize = allClassesList.some(cls => cls.startsWith("text-[") && cls.endsWith("px]"));

      if (!hasExplicitFontSize) {
        if (allClasses.includes("text-xs")) styles.fontSize = typography.fontSize.xs;
        else if (allClasses.includes("text-sm")) styles.fontSize = typography.fontSize.sm;
        else if (allClasses.includes("text-base")) styles.fontSize = typography.fontSize.md;
        else if (allClasses.includes("text-lg")) styles.fontSize = typography.fontSize.lg;
        else if (allClasses.includes("text-xl")) styles.fontSize = typography.fontSize.xl;
        else if (allClasses.includes("text-2xl")) styles.fontSize = typography.fontSize.xxl;
      }

      // 3. Handle Font Family
      styles.fontFamily = getLatoFontFamily(allClasses);

      return styles;
    };

    const nativeStyle = getNativeTextStyle();
    const combinedStyle = [nativeStyle, style];

    return (
      <Component
        className={cn(
          "text-base web:select-text",
          Platform.OS === "web" && "font-lato",
          !textClass && "text-foreground",
          textClass,
          className
        )}
        style={combinedStyle as any}
        ref={ref}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Text, TextClassContext };
