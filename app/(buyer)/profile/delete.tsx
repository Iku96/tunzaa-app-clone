import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

const REASONS = [
    "No longer using the service/platform",
    "Found a better alternative",
    "Difficulty navigating the platform",
    "Personal reasons",
    "Account security concerns",
];

export default function DeleteAccountScreen() {
    const router = useRouter();
    const { user, logout } = useTunzaaAuth();
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [otherReason, setOtherReason] = useState('');

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Tunzaa User';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=425ba4`;

    const handleDeletePress = () => {
        if (!selectedReason && !otherReason) return;
        setShowConfirmModal(true);
    };

    const confirmDeleteIntent = () => {
        setShowConfirmModal(false);
        setShowPasswordModal(true);
    };

    const finalDelete = async () => {
        // Mock final delete logic
        await logout();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delete Your Account</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        <View style={styles.alertBadge}>
                            <Ionicons name="alert" size={14} color="#FFFFFF" />
                        </View>
                    </View>
                </View>

                {/* Warning Box */}
                <View style={styles.warningBox}>
                    <Text style={styles.warningBoxText}>
                        If you choose to delete your account, please select a reason below. Your feedback helps us improve.
                    </Text>
                </View>

                {/* Reasons List */}
                <View style={styles.reasonsList}>
                    {REASONS.map((reason, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.reasonItem}
                            onPress={() => setSelectedReason(reason)}
                        >
                            <Text style={styles.reasonText}>{reason}</Text>
                            <View style={[styles.radioButton, selectedReason === reason && styles.radioButtonSelected]}>
                                {selectedReason === reason && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.reasonItem}
                        onPress={() => setSelectedReason('Others')}
                    >
                        <Text style={styles.reasonText}>Others</Text>
                        <View style={[styles.radioButton, selectedReason === 'Others' && styles.radioButtonSelected]}>
                            {selectedReason === 'Others' && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.deleteButton, (!selectedReason && !otherReason) && styles.deleteButtonDisabled]}
                    onPress={handleDeletePress}
                    disabled={!selectedReason && !otherReason}
                >
                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* Modal 1: Are you sure? */}
            <Modal visible={showConfirmModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconWrapper}>
                            <Ionicons name="alert-circle" size={40} color="#DC2626" />
                        </View>
                        <Text style={styles.modalTitle}>Are you sure you want to delete your account permanently?</Text>
                        <Text style={styles.modalDescription}>
                            We're sorry to see you go. Deleting your account will remove all your information, payment records from our system. This action cannot be undone.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirmModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmDeleteBtn} onPress={confirmDeleteIntent}>
                                <Text style={styles.confirmDeleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal 2: Password Verification */}
            <Modal visible={showPasswordModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconWrapper}>
                            <Ionicons name="alert-circle" size={40} color="#DC2626" />
                        </View>
                        <Text style={styles.modalTitle}>Are you sure you want to delete your account permanently?</Text>
                        <Text style={styles.modalDescription}>
                            We're sorry to see you go. Deleting your account will remove all your information, payment records from our system. This action cannot be undone.
                        </Text>

                        <View style={styles.modalInputWrapper}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter password to continue"
                                autoCapitalize="none" secureTextEntry={!isPasswordVisible}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPasswordModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmDeleteBtn, !password && { opacity: 0.5 }]} onPress={finalDelete} disabled={!password}>
                                <Text style={styles.confirmDeleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
    },
    alertBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EA580C', // Orange alert badge
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    warningBox: {
        backgroundColor: '#FEF2F2', // Light red/pink
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FCA5A5',
        marginBottom: 24,
    },
    warningBoxText: {
        fontSize: 13,
        color: '#991B1B',
        lineHeight: 18,
    },
    reasonsList: {
        gap: 12,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    reasonText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#425BA4',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#425BA4',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    deleteButton: {
        backgroundColor: '#425BA4',
        borderRadius: 30,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonDisabled: {
        opacity: 0.5,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 340,
        alignItems: 'center',
    },
    modalIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 22,
    },
    modalDescription: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 24,
    },
    modalInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        width: '100%',
        marginBottom: 24,
    },
    modalInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#425BA4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#425BA4',
        fontSize: 14,
        fontWeight: '600',
    },
    confirmDeleteBtn: {
        flex: 1,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#425BA4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmDeleteBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
