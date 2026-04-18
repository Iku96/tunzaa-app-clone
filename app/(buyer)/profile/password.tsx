/**
 * ============================================================================
 * PASSWORD MANAGER SCREEN (Change Password)
 * ============================================================================
 * Figma match: Password Manager with Current/New/Confirm fields,
 * "Save password" button, and Congratulation success modal.
 * API: PUT /users/{userId}/password
 * ============================================================================
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { authApi } from '../../../src/services/auth';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    const isFormValid = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

    const handleSave = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Mismatch', 'New password and confirmation do not match.');
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert('Too Short', 'Password must be at least 8 characters.');
            return;
        }
        if (!user?.user_id) {
            Alert.alert('Error', 'User session not found. Please log in again.');
            return;
        }

        setLoading(true);
        try {
            await authApi.updatePassword(user.user_id, {
                current_password: currentPassword,
                new_password: newPassword,
            });
            console.log('✅ [Password] Password changed successfully');
            setIsSuccessModalVisible(true);
        } catch (e: any) {
            console.error('❌ [Password] Change failed:', e);
            const message = e.apiError?.message || e.message || 'Failed to change password.';
            
            // Specific messaging for wrong current password
            if (message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('wrong') || message.toLowerCase().includes('invalid')) {
                Alert.alert('Wrong Password', 'Your current password is incorrect. Please try again.');
            } else {
                Alert.alert('Change Failed', message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsSuccessModalVisible(false);
        router.back();
    };

    const renderInput = (
        label: string,
        value: string,
        setValue: (v: string) => void,
        placeholder: string,
        show: boolean,
        setShow: (s: boolean) => void
    ) => (
        <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setValue}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    secureTextEntry={!show}
                />
                <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeIcon}>
                    <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Password Manager</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {renderInput('Current Password', currentPassword, setCurrentPassword, '***********', showCurrent, setShowCurrent)}
                {renderInput('New Password', newPassword, setNewPassword, 'At least 8 characters', showNew, setShowNew)}
                {renderInput('Confirm Password', confirmPassword, setConfirmPassword, 'At least 8 characters', showConfirm, setShowConfirm)}

                {/* Password validation hints */}
                {newPassword.length > 0 && (
                    <View style={styles.hintsContainer}>
                        <HintRow met={newPassword.length >= 8} text="At least 8 characters" />
                        <HintRow met={newPassword === confirmPassword && confirmPassword.length > 0} text="Passwords match" />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.saveButton, (!isFormValid || loading) && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!isFormValid || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save password</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Success Modal matching Figma exactly */}
            <Modal visible={isSuccessModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                        </View>
                        <Text style={styles.modalTitle}>Congratulation</Text>
                        <Text style={styles.modalMessage}>
                            You have successfully Change Your Password
                        </Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleCloseModal}>
                            <Text style={styles.modalButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function HintRow({ met, text }: { met: boolean; text: string }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Ionicons name={met ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={met ? '#22C55E' : '#D1D5DB'} />
            <Text style={{ fontSize: 12, color: met ? '#22C55E' : '#9CA3AF' }}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
    content: { padding: 24, flex: 1 },

    inputSection: { marginBottom: 24 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
        paddingHorizontal: 16, height: 50, backgroundColor: '#FFFFFF',
    },
    input: { flex: 1, fontSize: 15, color: '#1F2937' },
    eyeIcon: { padding: 4 },

    hintsContainer: { marginBottom: 12 },

    saveButton: {
        backgroundColor: '#425BA4', borderRadius: 30, height: 50,
        justifyContent: 'center', alignItems: 'center', marginTop: 16,
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

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
        backgroundColor: '#425BA4', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 40,
    },
    modalButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
