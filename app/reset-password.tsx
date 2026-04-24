/**
 * ============================================================================
 * RESET PASSWORD SCREEN — Step 3: Set New Password
 * ============================================================================
 * Reached after OTP verification in the 'reset-password' flow.
 * Calls POST /auth/password/reset/confirm with the reset_token + new_password.
 * ============================================================================
 */

import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../src/services/auth';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { phone_number, email, reset_token } = useLocalSearchParams<{
        phone_number?: string; email?: string; reset_token?: string;
    }>();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const isFormValid = newPassword.length >= 8 && newPassword === confirmPassword && !!reset_token;

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Mismatch', 'Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert('Too Short', 'Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            // Strategy 1: Try dedicated password-reset/confirm endpoint
            const payload: any = {
                otp_code: reset_token || '',
                new_password: newPassword,
            };
            if (phone_number) payload.phone_number = phone_number;
            if (email) payload.email = email;

            console.log('🔐 [ResetPassword] Strategy 1: POST /auth/password-reset/confirm');
            console.log('🔐 [ResetPassword] Payload:', JSON.stringify(payload));

            try {
                const response = await authApi.confirmPasswordReset(payload);
                console.log('✅ [ResetPassword] Strategy 1 succeeded:', response);
                setShowSuccess(true);
                return;
            } catch (confirmErr: any) {
                const status = confirmErr.apiError?.status || confirmErr.originalError?.response?.status;
                console.warn(`⚠️ [ResetPassword] Strategy 1 failed (${status}):`, confirmErr.message);

                // Strategy 1 endpoint might not exist (404) or might be protected by auth middleware (401).
                // Or maybe the OTP is wrong. We will let Strategy 2 handle the OTP verification to be sure!
                console.log('⚠️ [ResetPassword] Proceeding to Strategy 2 fallback...');
            }

            // Strategy 2: Verify OTP to get real auth token, then update password via user endpoint
            console.log('🔐 [ResetPassword] Strategy 2: Verify OTP → Update password');
            const verifyResponse = await authApi.verifyOTP({
                phone_number: phone_number || '',
                otp: reset_token || '',
            });
            console.log('✅ [ResetPassword] OTP verified:', verifyResponse);

            const verifyData = verifyResponse as any;
            const isValidToken = typeof verifyData.access_token === 'string' && verifyData.access_token.includes('.');

            if (isValidToken && verifyData.user_id && verifyData.user_id !== 'user_id') {
                // We got a real token — use it to update the password
                console.log('🔐 [ResetPassword] Got real token, updating password for user:', verifyData.user_id);
                
                // Save token temporarily so the API client can use it
                await authApi.saveTokens(verifyData.access_token, verifyData.refresh_token);
                
                await authApi.updatePassword(verifyData.user_id, {
                    new_password: newPassword,
                });
                
                // Clear the temporary token — user should log in fresh
                await authApi.clearTokens();
                
                console.log('✅ [ResetPassword] Strategy 2 succeeded');
                setShowSuccess(true);
            } else {
                // OTP verify returned dummy token — backend doesn't support this flow
                throw new Error('Unable to reset password. The verification code may have expired. Please try again.');
            }
        } catch (e: any) {
            console.warn('❌ [ResetPassword] Error:', e.message || e);
            const message = e.apiError?.message || e.message || 'Failed to reset password.';
            Alert.alert('Reset Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessDismiss = () => {
        setShowSuccess(false);
        router.replace('/login');
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
                                <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>New Password</Text>
                            <View style={{ width: 32 }} />
                        </View>

                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="key-outline" size={32} color="#425BA4" />
                            </View>
                        </View>

                        <Text style={styles.subtitle}>
                            Create a strong password with at least 8 characters.
                        </Text>

                        {/* New Password */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="At least 8 characters"
                                    placeholderTextColor="#9CA3AF"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNew}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                                    <Ionicons name={showNew ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputSection}>
                            <Text style={styles.inputLabel}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Re-enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirm}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                                    <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                                <Text style={styles.errorHint}>Passwords do not match</Text>
                            )}
                        </View>

                        {/* Password strength hints */}
                        <View style={styles.hintsContainer}>
                            <HintRow met={newPassword.length >= 8} text="At least 8 characters" />
                            <HintRow met={/[A-Z]/.test(newPassword)} text="At least one uppercase letter" />
                            <HintRow met={/[0-9]/.test(newPassword)} text="At least one number" />
                            <HintRow met={newPassword === confirmPassword && confirmPassword.length > 0} text="Passwords match" />
                        </View>

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
                            onPress={handleResetPassword}
                            disabled={!isFormValid || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Reset Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Modal (matches Figma) */}
            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                        </View>
                        <Text style={styles.modalTitle}>Congratulation</Text>
                        <Text style={styles.modalMessage}>
                            You have successfully changed your password.
                        </Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleSuccessDismiss}>
                            <Text style={styles.modalButtonText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function HintRow({ met, text }: { met: boolean; text: string }) {
    return (
        <View style={hintStyles.row}>
            <Ionicons
                name={met ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={met ? '#22C55E' : '#D1D5DB'}
            />
            <Text style={[hintStyles.text, met && hintStyles.textMet]}>{text}</Text>
        </View>
    );
}

const hintStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    text: { fontSize: 13, color: '#9CA3AF' },
    textMet: { color: '#22C55E' },
});

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: 24, paddingBottom: 40 },

    headerRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 8, marginBottom: 24,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },

    iconContainer: { alignItems: 'center', marginBottom: 16 },
    iconCircle: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: '#EFF3FF',
        justifyContent: 'center', alignItems: 'center',
    },
    subtitle: {
        fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: 20,
        marginBottom: 32, paddingHorizontal: 10,
    },

    inputSection: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB',
        borderRadius: 12, paddingHorizontal: 16, height: 54, backgroundColor: '#FFFFFF',
    },
    input: { flex: 1, fontSize: 15, color: '#1F2937' },
    eyeIcon: { padding: 4 },
    errorHint: { fontSize: 12, color: '#EF4444', marginTop: 4 },

    hintsContainer: { marginBottom: 28 },

    submitButton: {
        height: 54, backgroundColor: '#425BA4', borderRadius: 27,
        justifyContent: 'center', alignItems: 'center',
    },
    submitButtonDisabled: { opacity: 0.5 },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    // Success Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(31, 41, 55, 0.7)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, alignItems: 'center',
        width: '80%', maxWidth: 320,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    },
    checkCircle: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: '#425BA4',
        justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
    modalMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    modalButton: {
        backgroundColor: '#425BA4', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 32,
    },
    modalButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
