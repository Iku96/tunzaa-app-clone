import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, Platform } from "react-native";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

const buttonVariants = cva(
  "group flex items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-foreground web:hover:opacity-90 active:opacity-90",
        primary: "bg-primary web:hover:opacity-90 active:opacity-90",
        destructive: "bg-destructive web:hover:opacity-90 active:opacity-90",
        outline:
          "border border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        secondary: "bg-secondary web:hover:opacity-80 active:opacity-80",
        ghost:
          "web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        link: "web:underline-offset-4 web:hover:underline web:focus:underline ",
      },
      size: {
        default: "h-10 px-4 py-2 native:h-14 native:px-5 native:py-4",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 native:h-16 native:py-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva(
  "web:whitespace-nowrap text-sm native:text-base font-medium web:transition-colors",
  {
    variants: {
      variant: {
        default: "text-background",
        primary: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "text-foreground",
        secondary:
          "text-primary-foreground",
        ghost: "text-foreground",
        link: "text-primary group-active:underline",
      },
      size: {
        default: "",
        sm: "",
        lg: "native:text-lg",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant, size, style, ...props }, ref) => {
  const resolvedColors = useResolvedThemeColors();

  // Get platform-specific styles for React Native
  const getNativeStyles = () => {
    if (Platform.OS === "web" || !resolvedColors) {
      return {};
    }

    const baseStyle = {
      borderRadius: 6,
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
          backgroundColor: resolvedColors.background,
          borderWidth: 1,
          borderColor: resolvedColors.input,
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
  };

  // Get the text class with proper foreground color handling
  const getTextClass = () => {
    return cn(
      props.disabled && "web:pointer-events-none",
      buttonTextVariants({ variant, size })
    );
  };

  const combinedStyle = [getNativeStyles(), style];

  return (
    <TextClassContext.Provider value={getTextClass()}>
      <Pressable
        className={cn(
          props.disabled && "opacity-50 web:pointer-events-none",
          buttonVariants({ variant, size, className })
        )}
        style={combinedStyle}
        ref={ref}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
});
Button.displayName = "Button";

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
