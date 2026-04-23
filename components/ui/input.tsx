import { forwardRef } from "react";
import { TextInput, TextInputProps, Platform } from "react-native";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { typography } from "@/styles/theme/typography";

export interface InputProps extends TextInputProps {
  className?: string;
  withFocusStyles?: boolean; // ✅ new prop
}

const Input = forwardRef<TextInput, InputProps>(
  ({ className, style, withFocusStyles = true, ...props }, ref) => { // ✅ default = true
    const resolvedColors = useResolvedThemeColors();

    // Get platform-specific styles for React Native
    const getNativeStyles = () => {
      if (Platform.OS === "web" || !resolvedColors) {
        return {};
      }

      return {
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: typography.fontSize.md,
        fontFamily: typography.fontFamily.regular,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: resolvedColors.input,
        backgroundColor: resolvedColors.background,
        color: resolvedColors.foreground,
      };
    };

    const combinedStyle = style
      ? [getNativeStyles(), style]
      : getNativeStyles();

    return (
      <TextInput
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          // Native-specific classes
          "native:h-14 native:px-4 native:py-2 native:text-base",
          withFocusStyles &&
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", // ✅ conditionally include
          className
        )}
        style={combinedStyle}
        placeholderTextColor={resolvedColors?.mutedForeground}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
