import * as React from "react";
import { Pressable, View, Platform } from "react-native";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof View> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof View>,
  RadioGroupProps
>(({ className, value, onValueChange, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <View className={cn("grid gap-2", className)} ref={ref} {...props} />
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof Pressable> {
  value: string;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  RadioGroupItemProps
>(({ className, value, style, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  const resolvedColors = useResolvedThemeColors();
  const isSelected = context.value === value;

  // Get platform-specific styles for React Native
  const getNativeStyles = () => {
    if (Platform.OS === "web" || !resolvedColors) {
      return {};
    }

    return {
      height: 20,
      width: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: resolvedColors.primary,
      alignItems: "center",
      justifyContent: "center",
    };
  };

  const getIndicatorStyles = () => {
    if (Platform.OS === "web" || !resolvedColors) {
      return {};
    }

    return {
      height: 10,
      width: 10,
      borderRadius: 5,
      backgroundColor: resolvedColors.primary,
    };
  };

  const combinedStyle = style ? [getNativeStyles(), style] : getNativeStyles();
  const indicatorStyle = getIndicatorStyles();

  return (
    <Pressable
      ref={ref}
      role="radio"
      aria-checked={isSelected}
      onPress={() => context.onValueChange?.(value)}
      className={cn(
        "aspect-square h-4 w-4 native:h-5 native:w-5 rounded-full justify-center items-center border border-primary text-primary web:ring-offset-background web:focus:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
        props.disabled && "opacity-50",
        className
      )}
      style={combinedStyle}
      {...props}
    >
      {isSelected && (
        <View
          className="aspect-square h-[9px] w-[9px] native:h-[10] native:w-[10] bg-primary rounded-full"
          style={indicatorStyle}
        />
      )}
    </Pressable>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
