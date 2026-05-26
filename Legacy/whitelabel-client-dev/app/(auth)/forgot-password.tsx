import { useState } from "react";
import { View, Image, Alert, KeyboardAvoidingView, Platform, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, CircleHelp as HelpCircle } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { PhoneInput } from "@/components/PhoneInput";
import AuthHeader from "@/features/auth/components/AuthHeader";
import { useRequestPasswordReset } from "@/services/auth";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState("");
  const [isUsingEmail, setIsUsingEmail] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState({
    name: "Tanzania",
    code: "+255",
    flag: "🇹🇿",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
   usePageTitle("Forgot-password");
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const requestPasswordReset = useRequestPasswordReset();

  const getFormattedPhone = () => {
    return (selectedCountry.code).replace("+", "") + identifier;
  }

  const handleResetPassword = async () => {
    if (!identifier) return;

    setError(null);

    try {
      //let's strip the + from here
      const phone = getFormattedPhone();
      const payload = isUsingEmail
        ? { email: identifier }
        : { phone_number: phone }; 

      await requestPasswordReset.mutateAsync(payload);
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset instructions. Please try again."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AuthHeader />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
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
            className={`w-full ${
              isDesktop ? "max-w-md rounded-2xl bg-white border border-border px-8 py-10" : "px-6"
            }`}
          >
            <Text className="text-4xl font-bold text-foreground mb-2">
              Reset Password
            </Text>
            <Text className="text-base text-muted-foreground mb-8 leading-6">
              Enter your {isUsingEmail ? "email address" : "phone number"} and we'll
              send you instructions to reset your password.
            </Text>

            {error && (
              <View className="bg-destructive/10 p-4 rounded-lg mb-4">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            )}

            {isSuccess ? (
              <View className="flex-1 items-center py-10">
                
                <Text className="text-2xl font-bold text-foreground mb-2">
                  Check your {isUsingEmail ? "email" : "phone"}
                </Text>
                <Text className="text-base text-muted-foreground text-center mb-8 px-6 leading-6">
                  We've sent password reset instructions to your{" "}
                  {isUsingEmail ? "email address" : "phone number"}. Please check
                  your {isUsingEmail ? "inbox" : "messages"}.
                </Text>
                {isUsingEmail ? (
                  <Button
                    variant="default"
                    className="px-8 py-4 rounded-full"
                    onPress={() =>
                      router.push({
                        pathname: "/reset-password",
                        params: { email: identifier },
                      })
                    }
                  >
                    <Text className="text-base font-semibold text-primary">
                      Continue to Reset
                    </Text>
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="px-8 py-4 rounded-full"
                    onPress={() =>
                      
                      router.push({
                        pathname: "/reset-password",
                        params: { phone_number: getFormattedPhone() },
                      })
                    }
                  >
                    <Text className="text-base font-semibold text-primary">
                      Continue to Reset
                    </Text>
                  </Button>
                )}
              </View>
            ) : (
              <View className="gap-6">
                <View className="flex-row justify-end mb-2">
                  <Button
                    variant="link"
                    onPress={() => setIsUsingEmail(!isUsingEmail)}
                    className="p-0"
                  >
                    <Text className="text-sm text-primary">
                      Use {isUsingEmail ? "phone number" : "email"} instead
                    </Text>
                  </Button>
                </View>

                {isUsingEmail ? (
                  <View className="gap-2">
                    <Text className="text-sm font-semibold text-foreground">
                      Email address
                      <Text className="text-destructive">*</Text>
                    </Text>
                    <Input
                      value={identifier}
                      onChangeText={setIdentifier}
                      placeholder="Enter your email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!requestPasswordReset.isPending}
                    />
                  </View>
                ) : (
                  <PhoneInput
                    value={identifier}
                    onChangeText={setIdentifier}
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                    label="Phone number"
                    required
                    editable={!requestPasswordReset.isPending}
                  />
                )}

                <Button
                  variant="default"
                  className="w-full"
                  onPress={handleResetPassword}
                  disabled={!identifier || requestPasswordReset.isPending}
                >
                  <Text className="text-base font-semibold text-primary">
                    {requestPasswordReset.isPending
                      ? "Sending Instructions..."
                      : "Send Instructions"}
                  </Text>
                </Button>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}