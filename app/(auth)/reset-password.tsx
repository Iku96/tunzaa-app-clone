import { useState } from "react";
import { 
    View, 
    KeyboardAvoidingView, 
    Platform, 
    useWindowDimensions, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    Image,
    Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react-native";
import * as Burnt from "burnt";

import { useConfirmPasswordReset } from "@/src/services/auth";
import { Text } from "@/components/ui/text";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ResetPasswordScreen() {
  const { email, phone_number, role } = useLocalSearchParams<{ email?: string, phone_number?: string, role?: string }>();
  const router = useRouter();

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const confirmReset = useConfirmPasswordReset();
  const isPhoneReset = !!phone_number;

  usePageTitle("Reset-password");

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword || !confirmPassword) {
      Burnt.toast({ title: "Missing Fields", message: "Please fill all fields before submitting", preset: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      Burnt.toast({ title: "Mismatch", message: "Passwords must match exactly", preset: "error" });
      return;
    }

    if (newPassword.length < 6) {
      Burnt.toast({ title: "Weak Password", message: "Minimum 6 characters required", preset: "error" });
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

      Burnt.toast({ title: "Success!", message: "Password changed. Please sign in.", preset: "done" });
      setTimeout(() => router.replace({ pathname: "/login", params: role ? { role: role } : {} }), 1200);

    } catch (error: any) {
        console.error(error);
        Alert.alert(
            "Reset Failed", 
            error.response?.data?.message || "Invalid code or internal issue. Please try again."
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
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.contentWrapper}>
              <View style={styles.header}>
                <Text style={styles.title}>Set New Password</Text>
                <Text style={styles.subtitle}>
                  Enter the numerical code we sent you via {isPhoneReset ? "SMS" : "Email"}, and define your new secure password below.
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* Reset Code */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Validation Code</Text>
                  <TextInput
                    style={styles.input}
                    value={resetToken}
                    onChangeText={setResetToken}
                    placeholder="Enter code"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    autoCapitalize="none"
                    editable={!confirmReset.isPending}
                  />
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordWrapper}>
                      <TextInput
                        style={styles.passwordInput}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="At least 6 characters"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        editable={!confirmReset.isPending}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeBtn}
                      >
                        {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                      </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordWrapper}>
                      <TextInput
                        style={styles.passwordInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Re-type new password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showConfirmPassword}
                        editable={!confirmReset.isPending}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeBtn}
                      >
                        {showConfirmPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                      </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                      styles.primaryButton, 
                      (!resetToken || !newPassword || confirmReset.isPending) && { opacity: 0.6 }
                  ]}
                  onPress={handleResetPassword}
                  disabled={!resetToken || !newPassword || confirmReset.isPending}
                >
                  <Text style={styles.primaryButtonText}>
                    {confirmReset.isPending ? "Processing..." : "Finalize & Save"}
                  </Text>
                </TouchableOpacity>
              </View>
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
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 30 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { alignItems: 'center' },
  logo: { width: 150, height: 50 },
  contentWrapper: { width: '100%', maxWidth: 353, alignSelf: 'center', marginTop: 10 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: '700', color: '#1D1E1F', textAlign: 'center' },
  subtitle: { fontSize: 15, fontWeight: '400', color: '#666666', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  formContainer: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#1D1E1F', marginLeft: 2 },
  input: { height: 54, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1D1E1F' },
  passwordWrapper: { height: 54, backgroundColor: '#F3F4F6', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 12 },
  passwordInput: { flex: 1, fontSize: 16, color: '#1D1E1F' },
  eyeBtn: { padding: 4 },
  primaryButton: { height: 54, width: '100%', backgroundColor: '#3B5191', borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
