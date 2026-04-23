import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform } from "react-native";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { Text } from "@/components/ui/text";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold web:transition-colors web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-foreground web:hover:opacity-90 active:opacity-90",
        primary:
          "border-transparent bg-primary web:hover:opacity-90 active:opacity-90",
        destructive:
          "border-transparent bg-destructive web:hover:opacity-90 active:opacity-90",
        outline: "text-foreground border-foreground",
        secondary:
          "border-transparent bg-secondary web:hover:opacity-80 active:opacity-80",
        ghost:
          "border-transparent bg-transparent web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        link: "border-transparent bg-transparent web:underline-offset-4 web:hover:underline web:focus:underline",
        success: "border-transparent bg-success web:hover:opacity-90 active:opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const badgeTextVariants = cva("", {
  variants: {
    variant: {
      default: "text-background",
      primary: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-primary-foreground",
      ghost: "text-foreground",
      link: "text-primary",
      success: "text-success-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof Text>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const resolvedColors = useResolvedThemeColors();

  // Memoize the native styles to prevent infinite re-renders
  const nativeStyles = React.useMemo(() => {
    if (Platform.OS === "web" || !resolvedColors) {
      return {};
    }

    const baseStyle = {
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 2,
    };

    switch (variant) {
      case "default":
        return {
          ...baseStyle,
          backgroundColor: resolvedColors.foreground,
        };
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: resolvedColors.primary,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: resolvedColors.secondary,
        };
      case "destructive":
        return {
          ...baseStyle,
          backgroundColor: resolvedColors.destructive,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: resolvedColors.foreground,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      case "link":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      default:
        return baseStyle;
    }
  }, [resolvedColors, variant]);

  // Memoize the native text styles to prevent infinite re-renders
  const nativeTextStyles = React.useMemo(() => {
    if (Platform.OS === "web" || !resolvedColors) {
      return {};
    }

    switch (variant) {
      case "default":
        return { color: resolvedColors.background };
      case "primary":
      case "secondary":
      case "destructive":
        return { color: "#FFFFFF" };
      case "outline":
      case "ghost":
        return { color: resolvedColors.foreground };
      case "link":
        return { color: resolvedColors.primary };
      default:
        return { color: "#FFFFFF" };
    }
  }, [resolvedColors, variant]);

  // Memoize the combined styles
  const combinedStyle = React.useMemo(() => [nativeStyles, style], [nativeStyles, style]);

  return (
    <Text
      className={cn(
        badgeVariants({ variant }),
        badgeTextVariants({ variant }),
        className
      )}
      style={[combinedStyle, nativeTextStyles]}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
