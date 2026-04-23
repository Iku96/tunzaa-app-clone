import * as React from "react";
import { Pressable, Platform } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Check } from "@/lib/icons/Check";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof Pressable> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  CheckboxProps
>(({ className, checked, onCheckedChange, style, ...props }, ref) => {
  const resolvedColors = useResolvedThemeColors();

  // Get platform-specific styles for React Native
  const getNativeStyles = () => {
    if (Platform.OS === "web" || !resolvedColors) {
      return {};
    }

    const baseStyle = {
      height: 20,
      width: 20,
      borderRadius: 4,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    };

    if (checked) {
      return {
        ...baseStyle,
        backgroundColor: resolvedColors.primary,
        borderColor: resolvedColors.primary,
      };
    }

    return {
      ...baseStyle,
      backgroundColor: "transparent",
      borderColor: resolvedColors.border,
    };
  };

  const combinedStyle = [getNativeStyles(), style];

  function toggle() {
    onCheckedChange?.(!checked);
  }

  return (
    <Pressable
      ref={ref}
      role="checkbox"
      aria-checked={checked}
      onPress={toggle}
      className={cn(
        "web:peer h-4 w-4 native:h-[20] native:w-[20] shrink-0 rounded-sm native:rounded border border-primary web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        props.disabled && "web:cursor-not-allowed opacity-50",
        checked && "bg-primary",
        className
      )}
      style={combinedStyle}
      {...props}
    >
      {checked && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <Check
            size={12}
            strokeWidth={3}
            className="text-primary-foreground"
            color={Platform.OS === "web" ? undefined : "#FFFFFF"}
          />
        </Animated.View>
      )}
    </Pressable>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
