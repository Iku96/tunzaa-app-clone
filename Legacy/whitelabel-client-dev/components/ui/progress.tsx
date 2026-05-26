import * as React from "react";
import { View, Platform } from "react-native";
import { cn } from "@/lib/utils";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof View> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<React.ElementRef<typeof View>, ProgressProps>(
  ({ className, value = 0, max = 100, style, ...props }, ref) => {
    const resolvedColors = useResolvedThemeColors();

    // Get platform-specific styles for React Native
    const getNativeBackgroundStyles = () => {
      if (Platform.OS === "web" || !resolvedColors) {
        return {};
      }

      return {
        height: 16,
        borderRadius: 8,
        backgroundColor: resolvedColors.secondary,
      };
    };

    const getNativeIndicatorStyles = () => {
      if (Platform.OS === "web" || !resolvedColors) {
        return {};
      }

      const percentage = (value / max) * 100;

      return {
        flex: 1,
        height: 16,
        backgroundColor: resolvedColors.primary,
        borderRadius: 8,
        transform: [{ scaleX: percentage / 100 }],
        transformOrigin: "left",
      } as any;
    };

    const combinedBackgroundStyle = [getNativeBackgroundStyles(), style];
    const indicatorStyle = getNativeIndicatorStyles();

    return (
      <View
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        style={combinedBackgroundStyle}
        {...props}
      >
        <View
          className={cn(
            "h-full w-full flex-1 bg-primary web:transition-all",
            className
          )}
          style={[
            indicatorStyle,
            Platform.OS === "web"
              ? { transform: [{ translateX: `${(value / max) * 100 - 100}%` }] }
              : {},
          ]}
        />
      </View>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
