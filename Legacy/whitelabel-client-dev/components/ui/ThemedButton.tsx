import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { typography } from "@/styles/theme/typography";
import { Text } from "@/components/ui/text";

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ThemedButton({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ThemedButtonProps) {
  const colors = useThemeColors();

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.secondary;
      case "accent":
        return colors.accent;
      default:
        return colors.primary;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 4,
        };
      case "md":
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 6,
        };
      case "lg":
        return {
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: 8,
        };
      default:
        return {
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 6,
        };
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case "sm":
        return { fontSize: typography.fontSize.sm };
      case "md":
        return { fontSize: typography.fontSize.md };
      case "lg":
        return { fontSize: typography.fontSize.lg };
      default:
        return { fontSize: typography.fontSize.md };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: getBackgroundColor(),
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.6 : 1,
        },
        getSizeStyles(),
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text
          className="font-semibold"
          style={[
            {
              color: "#FFFFFF",
            },
            getTextSize() as any,
            textStyle as any,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
