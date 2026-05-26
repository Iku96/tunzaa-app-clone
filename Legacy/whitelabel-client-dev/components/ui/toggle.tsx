import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, Platform } from "react-native";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium web:ring-offset-background web:transition-colors web:hover:bg-muted web:hover:text-muted-foreground web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-input bg-transparent web:hover:bg-accent active:bg-accent active:bg-accent",
        outline:
          "border border-input bg-transparent web:hover:bg-accent web:hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ToggleProps
>(
  (
    { className, variant, size, pressed, onPressedChange, style, ...props },
    ref
  ) => {
    const resolvedColors = useResolvedThemeColors();

    // Get platform-specific styles for React Native
    const getNativeStyles = () => {
      if (Platform.OS === "web" || !resolvedColors) {
        return {};
      }

      const baseStyle = {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: resolvedColors.input,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        paddingHorizontal: 12,
        paddingVertical: 8,
      };

      if (pressed) {
        return {
          ...baseStyle,
          backgroundColor: resolvedColors.accent,
        };
      }

      return {
        ...baseStyle,
        backgroundColor: "transparent",
      };
    };

    const combinedStyle = style
      ? [getNativeStyles(), style]
      : getNativeStyles();

    return (
      <Pressable
        ref={ref}
        role="button"
        aria-pressed={pressed}
        onPress={() => onPressedChange?.(!pressed)}
        className={cn(
          toggleVariants({ variant, size }),
          pressed && "bg-accent",
          className
        )}
        style={combinedStyle}
        {...props}
      />
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
