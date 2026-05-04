import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, useWindowDimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { toast } from "sonner-native";

import { useConfirmPasswordReset } from "@/src/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import AuthHeader from "@/features/auth/components/AuthHeader";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ResetPasswordScreen() {
  const { email, phone_number } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const confirmReset = useConfirmPasswordReset();
  const isPhoneReset = !!phone_number;
  const resolvedColors = useResolvedThemeColors();

  usePageTitle("Reset-password");

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword || !confirmPassword) {
      toast.error("Missing fields", {
        description: "Please fill in all fields before continuing",
        duration: 3000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password mismatch", {
        description: "Passwords do not match. Please try again.",
        duration: 3000,
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Weak password", {
        description: "Password must be at least 8 characters long.",
        duration: 3000,
      });
      return;
    }

    try {
      const payload = isPhoneReset
        ? {
          phone_number: phone_number as string,
          reset_token: resetToken,
          new_password: newPassword,
        }
        : {
          email: email as string,
          reset_token: resetToken,
          new_password: newPassword,
        };

      await confirmReset.mutateAsync(payload);

      toast.success("Success", {
        description: "Your password has been reset successfully.",
        duration: 3000,
      });

      setTimeout(() => router.replace("/login"), 1000);
    } catch (error: any) {
      toast.error("Reset failed", {
        description:
          error.response?.data?.message ||
          "Failed to reset password. Please try again.",
        duration: 3000,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AuthHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="flex-1"
            style={{
              justifyContent: isDesktop ? "center" : "flex-start",
              alignItems: isDesktop ? "center" : "stretch",
              paddingVertical: 32,
            }}
          >
            <View
              className={`w-full ${isDesktop
                ? "max-w-md rounded-2xl bg-white border border-border px-8 py-10"
                : "px-6"
                }`}
            >
              <Text className="text-4xl font-bold text-foreground mb-2">
                Reset your password
              </Text>
              <Text className="text-base text-muted-foreground mb-8">
                Enter the code sent to your{" "}
                {isPhoneReset ? "phone" : "email"} and your new password.
              </Text>

              <View className="gap-6">
                {/* Reset Code */}
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">
                    Reset Code<Text className="text-destructive">*</Text>
                  </Text>
                  <Input
                    value={resetToken}
                    onChangeText={setResetToken}
                    placeholder={`Enter the code from your ${isPhoneReset ? "SMS" : "email"
                      }`}
                    keyboardType="default"
                    autoCapitalize="none"
                    editable={!confirmReset.isPending}
                  />
                </View>

                {/* New Password */}
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">
                    New Password<Text className="text-destructive">*</Text>
                  </Text>
                  <View className="relative">
                    <Input
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Enter new password"
                      secureTextEntry={!showPassword}
                      editable={!confirmReset.isPending}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff
                          className="w-5 h-5 text-muted-foreground"
                          color={resolvedColors?.foreground || "#000000"}
                        />
                      ) : (
                        <Eye
                          className="w-5 h-5 text-muted-foreground"
                          color={resolvedColors?.foreground || "#000000"}
                        />
                      )}
                    </Button>
                  </View>
                </View>

                {/* Confirm Password */}
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">
                    Confirm Password<Text className="text-destructive">*</Text>
                  </Text>
                  <View className="relative">
                    <Input
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      secureTextEntry={!showConfirmPassword}
                      editable={!confirmReset.isPending}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          className="w-5 h-5 text-muted-foreground"
                          color={resolvedColors?.foreground || "#000000"}
                        />
                      ) : (
                        <Eye
                          className="w-5 h-5 text-muted-foreground"
                          color={resolvedColors?.foreground || "#000000"}
                        />
                      )}
                    </Button>
                  </View>
                </View>

                {/* 🔹 Buttons horizontally aligned */}
                <View
                  className="flex-row justify-between items-center mt-4"
                  style={{ gap: 12 }}
                >
                  <Button
                    variant="outline"
                    className="flex-1"
                    onPress={() => router.back()}
                    disabled={confirmReset.isPending}
                  >
                    <Text className="text-base font-semibold text-foreground">
                      Back
                    </Text>
                  </Button>

                  <Button
                    variant="default"
                    className="flex-1"
                    onPress={handleResetPassword}
                    disabled={
                      !resetToken ||
                      !newPassword ||
                      !confirmPassword ||
                      confirmReset.isPending
                    }
                  >
                    <Text className="text-base font-semibold text-primary">
                      {confirmReset.isPending ? "Resetting..." : "Reset Password"}
                    </Text>
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
