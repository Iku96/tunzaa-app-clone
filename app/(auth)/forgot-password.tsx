import { useState } from "react";
import { 
    View, 
    Image, 
    Alert, 
    KeyboardAvoidingView, 
    Platform, 
    useWindowDimensions, 
    ScrollView, 
    TextInput, 
    TouchableOpacity,
    StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { PhoneInput } from "@/components/PhoneInput";
import { useRequestPasswordReset } from "@/src/services/auth";
import { usePageTitle } from "@/hooks/usePageTitle";
import * as Burnt from "burnt";

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState("");
  const [isUsingEmail, setIsUsingEmail] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState({
    name: "Tanzania",
    code: "+255",
    flag: "🇹🇿",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();
  usePageTitle("Forgot-password");
  const requestPasswordReset = useRequestPasswordReset();

  const getFormattedPhone = () => {
    return (selectedCountry.code).replace("+", "") + identifier;
  }

  const handleResetPassword = async () => {
    if (!identifier) {
        Burnt.toast({ title: "Error", message: "Please enter your credentials", preset: "error" });
        return;
    }

    try {
      const phone = getFormattedPhone();
      const payload = isUsingEmail
        ? { email: identifier }
        : { phone_number: phone }; 

      await requestPasswordReset.mutateAsync(payload);
      setIsSuccess(true);
      Burnt.toast({ title: "Sent", message: "Check your incoming messages", preset: "done" });
    } catch (err: any) {
        console.error(err);
        Alert.alert(
            "Request Failed", 
            err.response?.data?.message || "Unable to send reset instructions. Verify your details and try again."
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            
            {/* Top Navigation / Logo */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1D1E1F" />
                </TouchableOpacity>
                
                <View style={styles.logoContainer}>
                    <Image
                        source={require('@/assets/blue-tunzaa-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <View style={{ width: 40 }} /> {/* Balance Spacer */}
            </View>

            <View style={styles.contentWrapper}>
              {isSuccess ? (
                <View style={styles.successWrapper}>
                  <View style={styles.iconContainer}>
                      <CheckCircle2 size={48} color="#3B5191" />
                  </View>

                  <Text style={styles.title}>Check your {isUsingEmail ? "Inbox" : "Phone"}</Text>
                  <Text style={styles.subtitle}>
                    We've sent temporary instructions to {isUsingEmail ? "your email address" : "your phone number"}. Please enter the code on the next screen.
                  </Text>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() =>
                      router.push({
                        pathname: "/reset-password",
                        params: isUsingEmail 
                            ? { email: identifier } 
                            : { phone_number: getFormattedPhone() },
                      })
                    }
                  >
                    <Text style={styles.primaryButtonText}>Continue to Reset</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setIsSuccess(false)}
                    style={styles.resendButton}
                  >
                      <Text style={styles.resendText}>Didn't receive code? Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.header}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                      Enter your {isUsingEmail ? "registered email address" : "phone number"} and we'll send instructions to regain access.
                    </Text>
                  </View>

                  <View style={styles.formContainer}>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity 
                            style={[styles.toggleBtn, isUsingEmail && styles.toggleBtnActive]}
                            onPress={() => { setIsUsingEmail(true); setIdentifier(""); }}
                        >
                            <Text style={[styles.toggleText, isUsingEmail && styles.toggleTextActive]}>Email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.toggleBtn, !isUsingEmail && styles.toggleBtnActive]}
                            onPress={() => { setIsUsingEmail(false); setIdentifier(""); }}
                        >
                            <Text style={[styles.toggleText, !isUsingEmail && styles.toggleTextActive]}>Phone</Text>
                        </TouchableOpacity>
                    </View>

                    {isUsingEmail ? (
                      <View>
                        <TextInput
                          style={styles.input}
                          value={identifier}
                          onChangeText={setIdentifier}
                          placeholder="Enter your email address"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          editable={!requestPasswordReset.isPending}
                        />
                      </View>
                    ) : (
                      <View style={styles.phoneInputFix}>
                          <PhoneInput
                            value={identifier}
                            onChangeText={setIdentifier}
                            selectedCountry={selectedCountry}
                            onCountryChange={setSelectedCountry}
                            label=""
                            editable={!requestPasswordReset.isPending}
                          />
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                          styles.primaryButton, 
                          (!identifier || requestPasswordReset.isPending) && { opacity: 0.6 }
                      ]}
                      onPress={handleResetPassword}
                      disabled={!identifier || requestPasswordReset.isPending}
                    >
                      <Text style={styles.primaryButtonText}>
                        {requestPasswordReset.isPending ? "Sending..." : "Send Instructions"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { alignItems: 'center' },
  logo: { width: 150, height: 50 },
  contentWrapper: { width: '100%', maxWidth: 353, alignSelf: 'center', marginTop: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#1D1E1F', textAlign: 'center' },
  subtitle: { fontSize: 15, fontWeight: '400', color: '#666666', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  formContainer: { gap: 20 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 25, padding: 4, marginBottom: 10 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 21 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#666666' },
  toggleTextActive: { color: '#3B5191' },
  input: { height: 56, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1D1E1F' },
  phoneInputFix: { marginTop: -8 }, // Adjust for component padding
  primaryButton: { height: 54, backgroundColor: '#3B5191', borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  
  successWrapper: { alignItems: 'center', marginTop: 30, width: '100%' },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF3F9', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  resendButton: { marginTop: 24, alignSelf: 'center' },
  resendText: { fontSize: 14, color: '#3B5191', fontWeight: '600' }
});