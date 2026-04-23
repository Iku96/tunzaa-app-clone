import React, { useState } from "react";
import {
  View,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/PhoneInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { navigateToRoleHome } from "@/utils/navigation";
import { useI18n } from "@/hooks/useI18n";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

const countryCodes = [
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Congo", code: "+243", flag: "🇨🇩" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
];

import { useTenantStore } from "@/stores/tenant";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [isPhoneInput, setIsPhoneInput] = useState(true);
  const { login, socialLogin, error } = useAuth();
  const { tenant } = useTenantStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();

  const tenantName = tenant?.name || "Marketplace";

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert(t("auth.error"), t("auth.enter_both_fields"));
      return;
    }

    setIsLoading(true);
    try {
      const loginIdentifier = isPhoneInput
        ? selectedCountry.code + identifier
        : identifier;

      await login(loginIdentifier, password);
      // Navigation handled by AuthContext or navigateToRoleHome
    } catch (err: any) {
      Alert.alert(
        t("auth.login_failed"),
        err.response?.data?.message || t("auth.invalid_credentials")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSuccess = async (userData: any) => {
    try {
      await socialLogin(userData);

    } catch (err: any) {
      Alert.alert(
        t("auth.login_failed"),
        err.apiError?.message || err.message || t("auth.social_login_failed")
      );
    }
  };

  const handleSocialError = (error: any) => {
    const errorMessage =
      error.apiError?.message ||
      error.message ||
      t("auth.social_login_failed");
    Alert.alert(t("auth.error"), errorMessage);
  };

  const content = (
    <View className="flex-1 px-6">
      <Text className="text-4xl font-bold text-foreground mb-2">
        {t("auth.welcome_back", { tenantName })}
      </Text>
      <Text className="text-base text-muted-foreground mb-8">
        {t("auth.log_in_to_account")}
      </Text>

      {error && (
        <View className="bg-destructive/10 p-4 rounded-lg mb-4">
          <Text className="text-sm text-destructive">{error}</Text>
        </View>
      )}

      <View className="gap-4">
        <View className="flex-row justify-end mb-2">
          <Button
            variant="link"
            onPress={() => setIsPhoneInput(!isPhoneInput)}
            className="p-0"
          >
            <Text className="text-sm text-primary">
              {isPhoneInput
                ? t("auth.use_email_instead")
                : t("auth.use_phone_instead")}
            </Text>
          </Button>
        </View>

        {isPhoneInput ? (
          <PhoneInput
            value={identifier}
            onChangeText={setIdentifier}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            label={t("auth.phone_number")}
            required
            editable={!isLoading}
          />
        ) : (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              {t("auth.email")}
              <Text className="text-destructive">
                {t("auth.required_field")}
              </Text>
            </Text>
            <Input
              value={identifier}
              onChangeText={setIdentifier}
              placeholder={t("auth.enter_email")}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        )}

        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            {t("auth.password")}
            <Text className="text-destructive">
              {t("auth.required_field")}
            </Text>
          </Text>
          <View className="relative">
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.enter_password")}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" color={resolvedColors?.foreground || "#000000"} />
              ) : (
                <Eye className="w-5 h-5" color={resolvedColors?.foreground || "#000000"} />
              )}
            </Button>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          {Platform.OS === "web" && (
            <View className="flex-row items-center gap-2">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                disabled={isLoading}
              />
              <Text className="text-sm text-foreground">
                {t("auth.remember_me")}
              </Text>
            </View>
          )}

          <Button
            variant="link"
            onPress={() => router.push("/forgot-password")}
            disabled={isLoading}
          >
            <Text className="text-sm text-primary">
              {t("auth.forgot_password")}
            </Text>
          </Button>
        </View>

        <Button
          variant="default"
          className="w-full mt-4 mb-5 border-primary native:h-auto native:min-h-[56px]"
          onPress={handleLogin}
          disabled={!identifier || !password || isLoading}
        >
          <Text className="text-base font-semibold text-primary">
            {isLoading ? t("auth.logging_in") : t("auth.log_in")}
          </Text>
        </Button>
      </View>

      <View className="gap-3">
        {/* Social buttons would go here */}
      </View>

      <View className="flex-row justify-center items-center p-6">
        <Text className="text-sm text-muted-foreground">
          {t("auth.dont_have_account")}{" "}
        </Text>
        <Button
          variant="link"
          onPress={() => router.push("/register")}
          disabled={isLoading}
          className="p-0"
        >
          <Text className="text-sm font-semibold text-primary color-primary">
            {t("auth.sign_up")}
          </Text>
        </Button>
      </View>

      <View>
        <Button
          variant="link"
          className="shadow shadow-foreground/5 mb-5"
          onPress={() => router.push("/(public)")}
        >
          <View className="flex-row items-center">
            <Text className="mr-2">
              {t("auth.skip_for_now")}
            </Text>
            <ChevronRight size={16} className="ml-2" color={resolvedColors?.primary || "#000000"} />
          </View>
        </Button>
      </View>
    </View>
  );

  if (Platform.OS === "web") {
    return content;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}