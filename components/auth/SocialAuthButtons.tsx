import React, { useState, useEffect } from "react";
import { View, Platform, Alert } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { socialAuth } from "@/services/social-auth";
import { useI18n } from "@/hooks/useI18n";
import Svg, { Path } from "react-native-svg";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface SocialAuthButtonsProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export function SocialAuthButtons({
  onSuccess,
  onError,
  disabled = false,
}: SocialAuthButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();
  useEffect(() => {
    // Check Apple Sign-In availability
    const checkAppleAvailability = async () => {
      if (Platform.OS === "ios") {
        const available = await socialAuth.isAppleSignInAvailable();
        setIsAppleAvailable(available);
      }
    };

    checkAppleAvailability();
  }, []);

  const handleGoogleSignIn = async () => {
    if (disabled || isGoogleLoading) return;

    setIsGoogleLoading(true);
    try {
      const result = await socialAuth.signInWithGoogle();

      if (result) {
        onSuccess?.(result);
      }
      // If result is null, user cancelled - no error needed
    } catch (error: any) {
      console.error("Google sign in failed:", error);
      const errorMessage =
        error.message || "Google sign in failed. Please try again.";
      Alert.alert(t("auth.error"), errorMessage);
      onError?.(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (disabled || isAppleLoading) return;

    setIsAppleLoading(true);
    try {
      const result = await socialAuth.signInWithApple();

      if (result) {
        onSuccess?.(result);
      }
      // If result is null, user cancelled - no error needed
    } catch (error: any) {
      console.error("Apple sign in failed:", error);
      const errorMessage =
        error.message || "Apple sign in failed. Please try again.";
      Alert.alert(t("auth.error"), errorMessage);
      onError?.(error);
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <View className="gap-3">
      {/* Google Sign-In Button */}
      <Button
        variant="outline"
        className="w-full flex-row items-center justify-center px-4 py-3 border-2 border-border"
        onPress={handleGoogleSignIn}
        disabled={disabled || isGoogleLoading}
      >
        <View className="flex-row items-center gap-3">
         
        <Svg width="20" height="20" viewBox="0 0 24 24">
            <Path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill={resolvedColors?.foreground || "#000000"}
            />
          </Svg>
          <Text className="text-base font-medium text-foreground">
            {isGoogleLoading
              ? t("auth.signing_in")
              : t("auth.continue_with_google")}
          </Text>
        </View>
      </Button>

      {/* Apple Sign-In Button - iOS only */}
      {isAppleAvailable && (
        <Button
          variant="outline"
          className="w-full flex-row items-center justify-center px-4 py-3 border-2 border-border bg-black"
          onPress={handleAppleSignIn}
          disabled={disabled || isAppleLoading}
        >
          <View className="flex-row items-center gap-3">
          <Svg width="20" height="20" viewBox="0 0 24 24">
            <Path
              d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
              fill={resolvedColors?.foreground || "#000000"}
            />
          </Svg>
            <Text className="text-base font-medium text-foreground">
              {isAppleLoading
                ? t("auth.signing_in")
                : t("auth.continue_with_apple")}
            </Text>
          </View>
        </Button>
      )}
    </View>
  );
}
