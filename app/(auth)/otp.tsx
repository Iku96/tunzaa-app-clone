import { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Alert,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import AuthHeader from "@/features/auth/components/AuthHeader";
import { useVerifyOTP, useRequestOTP } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";
import { usePageTitle } from "@/hooks/usePageTitle";

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60;

export default function OTPScreen() {
  const { phone } = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [isResendActive, setIsResendActive] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  usePageTitle("OTP");
  const verifyOTP = useVerifyOTP();
  const requestOTP = useRequestOTP();
  const { setOtpVerified } = useAuthStore();

  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer === RESEND_TIMEOUT]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = otp.split("");
    newOtp[index] = value;
    const updatedOtp = newOtp.join("");
    setOtp(updatedOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updatedOtp.length === OTP_LENGTH) {
      handleVerify(updatedOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    try {
      await verifyOTP.mutateAsync({
        phone_number: phone as string,
        otp: code,
      });

      setOtpVerified(true);
      router.push("/complete-profile");
    } catch (error: any) {
      const message = error.apiError?.message || error.message || "Invalid OTP. Please try again.";
      Alert.alert("Verification Failed", message);
      setOtp("");
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!isResendActive) return;

    try {
      await requestOTP.mutateAsync({
        phone_number: phone as string,
      });

      setTimer(RESEND_TIMEOUT);
      setIsResendActive(false);

      Alert.alert("Success", "OTP has been resent to your phone.");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-muted">
      <AuthHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View
          className="flex-1"
          style={{
            justifyContent: isWide ? "center" : "flex-start",
            alignItems: isWide ? "center" : "stretch",
            paddingVertical: 32,
          }}
        >
          <View
            className={`w-full ${isWide
                ? "max-w-md rounded-2xl bg-white border border-border px-8 py-10"
                : "px-6"
              }`}
          >
            <Text className="text-4xl font-bold text-foreground mb-2 text-center">
              Enter OTP sent via SMS
            </Text>
            <Text className="text-base text-muted-foreground mb-8 text-center">
              We’ve sent OTP to {phone}
            </Text>

            <View className="flex-row justify-between mb-6">
              {[...Array(OTP_LENGTH)].map((_, index) => (
                <Input
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref as TextInput;
                  }}
                  className="w-12 h-12 text-xl font-semibold text-center bg-muted rounded-xl"
                  maxLength={1}
                  keyboardType="number-pad"
                  value={otp[index] || ""}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  editable={!verifyOTP.isPending}
                />
              ))}
            </View>

            <View className="flex-row items-center justify-end gap-2 mb-4">
              <View
                className={`w-2 h-2 rounded-full ${timer > 0 ? "bg-primary" : "bg-muted"
                  }`}
              />
              <Text className="text-base font-semibold text-foreground">
                {String(Math.floor(timer / 60)).padStart(2, "0")}:
                {String(timer % 60).padStart(2, "0")}
              </Text>
            </View>

            <Button
              variant="outline"
              className="self-center mt-2 px-5 py-2.5 rounded-full"
              onPress={handleResend}
              disabled={!isResendActive || requestOTP.isPending}
            >
              <Text
                className={`text-sm font-semibold ${isResendActive ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                {requestOTP.isPending ? "Resending..." : "Resend code"}
              </Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
