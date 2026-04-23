import { useState } from "react";
import {
  View,
  Image,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LanguageSelector } from "@/components/modals/LanguageSelector";
import { PhoneInput } from "@/components/PhoneInput";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Checkbox } from "@/components/ui/checkbox";
import AuthHeader from "@/features/auth/components/AuthHeader";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { useRequestOTP } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";
import { useAuth } from "@/context/auth";
import { setTempPhoneNumber } from "@/utils/storage";
import { useI18n } from "@/hooks/useI18n";
import { WebViewScreen } from "@/components/ui/webview";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { DynamicLogo } from "@/components/ui/DynamicLogo";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTenantStore } from "@/stores/tenant";
import { API_CONFIG } from "@/services/config";

export default function RegisterScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState({
    name: "Tanzania",
    code: "+255",
    flag: "🇹🇿",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsWebView, setShowTermsWebView] = useState(false);
  const [showPrivacyWebView, setShowPrivacyWebView] = useState(false);

  const router = useRouter();
  const requestOTP = useRequestOTP();
  const { setRegistrationPhone } = useAuthStore();
  const { socialLogin } = useAuth();
  const { t } = useI18n();
  const { tenant } = useTenantStore();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const resolvedColors = useResolvedThemeColors();
  usePageTitle("Register");

  const tenantName = tenant?.name || "Marketplace";
  const fallbackTermsUrl =
    "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf";
  const fallbackPrivacyUrl = "https://www.orimi.com/pdf-test.pdf";

  const getPdfViewerUrl = (url: string) => {
    if (url.toLowerCase().includes(".pdf")) {
      const encodedUrl = encodeURIComponent(url);
      return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
    }
    return url;
  };

  const handleContinue = async () => {
    if (!phoneNumber) {
      Alert.alert(t("auth.error"), "Please enter your phone number.");
      return;
    }

    if (!agreeToTerms) {
      Alert.alert(
        t("auth.error"),
        "Please agree to the Terms of Service and Privacy Policy to continue."
      );
      return;
    }

    const fullPhoneNumber = selectedCountry.code + phoneNumber;

    try {
      await requestOTP.mutateAsync({
        phone_number: fullPhoneNumber,
      });

      setRegistrationPhone(fullPhoneNumber);
      await setTempPhoneNumber(fullPhoneNumber);

      router.push({
        pathname: "/otp",
        params: { phone: fullPhoneNumber },
      });
    } catch (error: any) {
      Alert.alert(
        t("auth.error"),
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    }
  };

  const handleSocialAuthSuccess = async (socialData: any) => {
    try {
      // console.log("socialData RJ45::", JSON.stringify(socialData, null, 2));
      // Check if user is new or existing based on the actual data structure
      const hasNonBuyerProfiles = socialData.profiles?.some((profile: any) => 
        profile.role !== "buyer" && profile.is_active === true
      );
      
      // Check if user has logged in before (last_login is not null)
      const hasLoggedInBefore = socialData.last_login !== null;
      
      // If user has non-buyer profiles or has logged in before, they're existing
      if (hasNonBuyerProfiles || hasLoggedInBefore) {
        // User has existing profiles or has logged in before, log them in directly
        await socialLogin(socialData);
        // The useRouting hook will handle navigation based on their activeProfileRole
        return;
      } else {
        // New user (last_login is null, only has buyer profile), send them to complete profile
        router.push({
          pathname: "/complete-profile",
          params: {
            socialAuth: "true",
            socialData: JSON.stringify(socialData),
          },
        });
      }
    } catch (error: any) {
      Alert.alert(
        t("auth.error"),
        "Failed to process social authentication. Please try again."
      );
    }
  };

  const handleSocialAuthError = (error: any) => {
    console.error("Social auth error:", error);
  };

  return (
    <SafeAreaView className="flex-1 bg-muted">
      <AuthHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: isWide ? "center" : "flex-start",
            alignItems: isWide ? "center" : "stretch",
            paddingVertical: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            className={`w-full ${
              isWide
                ? "max-w-md rounded-2xl bg-white border border-border px-8 py-10"
                : "px-6"
            }`}
          >
            <Text className="text-4xl font-bold text-foreground mb-2 text-center">
              {t("auth.welcome", { tenantName })}
            </Text>
            <Text className="text-base text-muted-foreground mb-8 text-center">
              {t("auth.enter_or_create_account")}
            </Text>

            <View className="gap-6">
              {/* <SocialAuthButtons
                onSuccess={handleSocialAuthSuccess}
                onError={handleSocialAuthError}
                disabled={requestOTP.isPending}
              /> */}

              {/* <View className="flex-row items-center gap-4 my-2">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-sm text-muted-foreground px-2">
                  {t("auth.or")}
                </Text>
                <View className="flex-1 h-px bg-border" />
              </View> */}

              <PhoneInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                label={t("auth.phone_number")}
                required
              />

              <View className="flex-row justify-start items-center space-x-3 mr-2">
                <Checkbox
                  checked={agreeToTerms}
                  onCheckedChange={setAgreeToTerms}
                  className="mt-1"
                />
                <View className="flex-1 pt-0.5">
                  <Text className="text-sm text-muted-foreground leading-5 ml-2">
                    I agree to the{" "}
                    <Text
                      className="text-primary  text-sm underline"
                      onPress={() => setShowTermsWebView(true)}
                    >
                      Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text
                      className="text-primary text-sm underline"
                      onPress={() => setShowPrivacyWebView(true)}
                    >
                      Privacy Policy
                    </Text>
                    .
                  </Text>
                </View>
              </View>

              <Button
                variant="default"
                className="w-full mt-2"
                onPress={handleContinue}
                disabled={!phoneNumber || !agreeToTerms || requestOTP.isPending}
              >
                <Text className="text-base font-semibold text-primary">
                  {requestOTP.isPending ? t("auth.sending") : t("auth.continue")}
                </Text>
              </Button>
            </View>
              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-sm text-muted-foreground">
                  {t("auth.already_have_account")}{" "}
                </Text>
                <Button
                  variant="link"
                  className="p-0"
                  onPress={() => router.push("/login")}
                >
                  <Text className="text-sm font-semibold text-primary">
                    {t("auth.log_in")}
                  </Text>
                </Button>
              </View>
            <DynamicLogo width={120} height={40} className="self-center mt-10" />
          </View>

          {showTermsWebView && (
            <View className="absolute inset-0 z-50">
              <WebViewScreen
                url={getPdfViewerUrl(fallbackTermsUrl)}
                title="Terms of Service"
                onClose={() => setShowTermsWebView(false)}
              />
            </View>
          )}

          {showPrivacyWebView && (
            <View className="absolute inset-0 z-50">
              <WebViewScreen
                url={getPdfViewerUrl(fallbackPrivacyUrl)}
                title="Privacy Policy"
                onClose={() => setShowPrivacyWebView(false)}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
