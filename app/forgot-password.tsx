/**
 * ============================================================================
 * FORGOT PASSWORD SCREEN — Step 1: Request Reset
 * ============================================================================
 * Flow: Enter phone → POST /auth/password/reset/request → OTP sent
 *       → Navigate to otp.tsx with flow='reset-password'
 * ============================================================================
 */

import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../src/contexts/LanguageContext';
import { authApi } from '../src/services/auth';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestReset = async () => {
        if (!phoneOrEmail.trim()) {
            Alert.alert('Required', 'Please enter your phone number or email.');
            return;
        }

        setLoading(true);
        try {
            const isEmail = phoneOrEmail.includes('@');
            let payload: { phone_number?: string; email?: string } = {};

            if (isEmail) {
                payload.email = phoneOrEmail.trim();
            } else {
                // Normalize phone number — add +255 if needed
                let phone = phoneOrEmail.trim();
                if (!phone.startsWith('+')) {
                    phone = `+255${phone.replace(/^0/, '')}`;
                }
                payload.phone_number = phone;
            }

            console.log('🔐 [ForgotPassword] Requesting reset for:', payload);
            try {
                // Strategy 1: Try dedicated password reset request
                const response = await authApi.requestPasswordReset(payload);
                console.log('✅ [ForgotPassword] Reset OTP sent:', response);
            } catch (err: any) {
                const status = err.apiError?.status || err.originalError?.response?.status;
                if (status === 404 && payload.phone_number) {
                    // Strategy 2: Dedicated reset endpoint failed, fall back to standard OTP
                    console.log('⚠️ [ForgotPassword] API 404, falling back to standard OTP request...');
                    const otpResponse = await authApi.requestOTP({ phone_number: payload.phone_number });
                    console.log('✅ [ForgotPassword] Fallback OTP sent:', otpResponse);
                } else {
                    throw err; // Re-throw other errors
                }
            }

            // Navigate to OTP screen with reset-password flow
            router.push({
                pathname: '/otp',
                params: {
                    phone_number: payload.phone_number || '',
                    email: payload.email || '',
                    flow: 'reset-password',
                },
            } as any);

        } catch (e: any) {
            console.error('❌ [ForgotPassword] Error:', e);
            const message = e.apiError?.message || e.message || 'Failed to send reset code.';
            Alert.alert('Reset Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#1D1E1F" />
                            </TouchableOpacity>
                        </View>

                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="lock-closed-outline" size={32} color="#425BA4" />
                            </View>
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Don't worry! Enter your phone number or email below and we'll send you a verification code to reset your password.
                        </Text>

                        {/* Input */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Phone Number or Email</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="call-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 0769517032 or john@email.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={phoneOrEmail}
                                    onChangeText={setPhoneOrEmail}
                                    autoCapitalize="none"
                                    keyboardType="default"
                                />
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, (!phoneOrEmail.trim() || loading) && styles.submitButtonDisabled]}
                            onPress={handleRequestReset}
                            disabled={!phoneOrEmail.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Send Reset Code</Text>
                            )}
                        </TouchableOpacity>

                        {/* Back to login */}
                        <TouchableOpacity
                            style={styles.backToLoginButton}
                            onPress={() => router.replace('/login')}
                        >
                            <Ionicons name="arrow-back-outline" size={16} color="#425BA4" />
                            <Text style={styles.backToLoginText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: 24, paddingBottom: 40 },
    headerRow: { paddingTop: 8, marginBottom: 32 },
    backButton: { padding: 8, alignSelf: 'flex-start' },

    iconContainer: { alignItems: 'center', marginBottom: 24 },
    iconCircle: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: '#EFF3FF',
        justifyContent: 'center', alignItems: 'center',
    },

    title: {
        fontSize: 24, fontWeight: '700', color: '#1D1E1F', textAlign: 'center', marginBottom: 12,
    },
    subtitle: {
        fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: 20, marginBottom: 32,
        paddingHorizontal: 10,
    },

    inputSection: { marginBottom: 24 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB',
        borderRadius: 12, paddingHorizontal: 16, height: 54, backgroundColor: '#FFFFFF',
    },
    input: { flex: 1, fontSize: 16, color: '#1D1E1F' },

    submitButton: {
        height: 54, backgroundColor: '#425BA4', borderRadius: 27,
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    submitButtonDisabled: { opacity: 0.5 },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    backToLoginButton: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
    },
    backToLoginText: { color: '#425BA4', fontSize: 14, fontWeight: '600' },
});
