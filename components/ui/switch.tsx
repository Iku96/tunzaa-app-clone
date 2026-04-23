import * as React from "react";
import { Pressable, Platform } from "react-native";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof Pressable> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SwitchProps
>(({ className, checked, onCheckedChange, style, ...props }, ref) => {
  const resolvedColors = useResolvedThemeColors();

  // Get platform-specific styles for React Native
  const getNativeStyles = () => {
    if (Platform.OS === "web" || !resolvedColors) {
      return {};
    }

    const baseStyle = {
      height: 24,
      width: 44,
      borderRadius: 12,
      padding: 2,
      justifyContent: "center" as const,
    };

    if (checked) {
      return {
        ...baseStyle,
        backgroundColor: resolvedColors.primary,
        alignItems: "flex-end" as const,
      };
    }

    return {
      ...baseStyle,
      backgroundColor: resolvedColors.input,
      alignItems: "flex-start" as const,
    };
  };

  const getThumbStyles = () => {
    if (Platform.OS === "web" || !resolvedColors) {
      return {};
    }

    return {
      height: 20,
      width: 20,
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
    };
  };

  const combinedStyle = style ? [getNativeStyles(), style] : getNativeStyles();
  const thumbStyle = getThumbStyles();

  return (
    <Pressable
      ref={ref}
      role="switch"
      aria-checked={checked}
      onPress={() => onCheckedChange?.(!checked)}
      className={cn(
        "web:peer web:inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 web:focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        props.disabled && "web:cursor-not-allowed opacity-50",
        className
      )}
      style={combinedStyle}
      {...props}
    >
      <Pressable
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 web:transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
          checked && "native:translate-x-5"
        )}
        style={thumbStyle}
        pointerEvents="none"
      />
    </Pressable>
  );
});
Switch.displayName = "Switch";

export { Switch };
