import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    const handleSave = () => {
        // Mock save action
        setIsSuccessModalVisible(true);
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
                    secureTextEntry={!show}
                />
                <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeIcon}>
                    <Ionicons name={show ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
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
                {renderInput("Current Password", currentPassword, setCurrentPassword, "***********", showCurrent, setShowCurrent)}
                {renderInput("New Password", newPassword, setNewPassword, "At least 8 characters", showNew, setShowNew)}
                {renderInput("Confirm Password", confirmPassword, setConfirmPassword, "At least 8 characters", showConfirm, setShowConfirm)}

                <TouchableOpacity
                    style={[styles.saveButton, (!currentPassword || !newPassword || !confirmPassword) && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                >
                    <Text style={styles.saveButtonText}>Save password</Text>
                </TouchableOpacity>
            </View>

            {/* Success Modal matching screenshot */}
            <Modal
                visible={isSuccessModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                        </View>
                        <Text style={styles.modalTitle}>Congratulation</Text>
                        <Text style={styles.modalMessage}>You have successfully Change Your Password</Text>

                        {/* Hidden button stretching over the modal to dismiss, or just auto-dismiss */}
                        <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={handleCloseModal} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    content: {
        padding: 24,
        flex: 1,
    },
    inputSection: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 50,
        backgroundColor: '#FFFFFF',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
    },
    eyeIcon: {
        padding: 4,
    },
    saveButton: {
        backgroundColor: '#425BA4',
        borderRadius: 30,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.7)', // Dark blue-grey overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        width: '80%',
        maxWidth: 320,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    checkCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#425BA4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});
