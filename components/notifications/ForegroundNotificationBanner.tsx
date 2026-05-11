import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { BlurView } from "expo-blur";
import { Bell } from "lucide-react-native";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useColorScheme } from "@/lib/useColorScheme";

export interface ForegroundNotificationData {
  title: string;
  body: string;
  imageUrl?: string;
  data?: any;
}

interface ForegroundNotificationBannerProps {
  notification: ForegroundNotificationData;
  onPress?: () => void;
  onDismiss: () => void;
  duration?: number; // Auto-dismiss duration in ms (0 = manual dismiss only)
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const BANNER_HEIGHT = 100;

export const ForegroundNotificationBanner: React.FC<
  ForegroundNotificationBannerProps
> = ({ notification, onPress, onDismiss, duration = 4000 }) => {
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT - 50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const resolvedColors = useResolvedThemeColors();
  const { isDarkColorScheme: isDark } = useColorScheme();

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: Platform.OS === "ios" ? 50 : 10,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss timer
    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissBanner();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const dismissBanner = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -BANNER_HEIGHT - 50,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handlePress = () => {
    dismissBanner();
    if (onPress) {
      // Small delay to let animation complete
      setTimeout(() => {
        onPress();
      }, 100);
    }
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handlePress}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 95 : 100}
          tint={isDark ? "dark" : "light"}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            minHeight: BANNER_HEIGHT,
            backgroundColor: isDark 
              ? "rgba(0, 0, 0, 0.6)" 
              : "rgba(255, 255, 255, 0.9)",
            borderWidth: 1,
            borderColor: resolvedColors?.border || (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"),
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: resolvedColors?.primary || "#3B82F6",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Bell size={24} color={resolvedColors?.primaryForeground || "#fff"} />
          </View>

          {/* Content */}
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: resolvedColors?.foreground || (isDark ? "#fff" : "#000"),
                marginBottom: 4,
              }}
            >
              {notification.title}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 14,
                color: resolvedColors?.mutedForeground || (isDark ? "#E5E7EB" : "#6B7280"),
                lineHeight: 18,
              }}
            >
              {notification.body}
            </Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

