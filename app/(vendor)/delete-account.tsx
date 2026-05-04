import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertTriangle, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/context/auth';
import { authApi } from '@/services/auth';
import { useI18n } from '@/hooks/useI18n';
import * as Burnt from 'burnt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAvatarUrl, getVendorLogoUrl } from '@/src/utils/images';

const REASON_KEYS = [
    'not_using',
    'better_alternative',
    'difficulty',
    'personal',
    'security',
    'others'
];

const BUSINESS_EXTRAS_KEY = "@tunzaa_business_extras";

export default function DeleteAccountScreen() {
    const localRouter = useRouter(); // renamed to avoid conflict
    const { user, logout } = useAuth();
    const { t } = useI18n();
    
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Profile Data Loading
    const currentProfile = user?.profiles?.find(p => p.role === user.activeProfileRole);
    const metadata = (currentProfile as any)?.metadata || {};
    const branding = (currentProfile as any)?.branding || {};
    const [profileData, setProfileData] = useState({
        displayName: currentProfile?.displayName || "",
        logo_url: getVendorLogoUrl({ metadata, branding }) || ""
    });

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const userId = user?.user_id || user?.id;
                if (!userId) return;
                const storedExtras = await AsyncStorage.getItem(`${BUSINESS_EXTRAS_KEY}_${userId}`);
                const localData = storedExtras ? JSON.parse(storedExtras) : {};
                setProfileData({
                    displayName: currentProfile?.displayName || localData.business_name || "",
                    logo_url: getVendorLogoUrl({ metadata, branding }) || localData.logo_url || ""
                });
            } catch (e) {
                console.warn("Failed to load extras", e);
            }
        };
        loadProfileData();
    }, [user, currentProfile, metadata, branding]);

    const handleDeleteAttempt = () => {
        if (!selectedReason) {
            Burnt.toast({ title: 'Please select a reason first', preset: 'error' });
            return;
        }
        setShowModal(true);
    };

    const confirmDeletion = async () => {
        if (!password) {
            Burnt.toast({ title: 'Please enter your password', preset: 'error' });
            return;
        }

        const userId = user?.user_id || user?.id;
        if (!userId) return;

        setIsDeleting(true);
        try {
            await authApi.disableUser();
            
            Burnt.toast({ title: t('account.account_deleted_success'), preset: 'done' });
            setShowModal(false);
            await logout();
        } catch (error) {
            console.error("Deactivation failed:", error);
            Burnt.toast({ title: t('account.account_deleted_failed'), preset: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => localRouter.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.delete_your_account')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image 
                            source={{ uri: getAvatarUrl(profileData.logo_url, profileData.displayName) }}
                            style={styles.avatarImage}
                        />
                        <View style={styles.warningBadge}>
                            <AlertTriangle size={14} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                    </View>
                </View>

                {/* Warning Alert */}
                <View style={styles.alertBox}>
                    <Text style={styles.alertText}>
                        {t('settings.delete_reason_prompt')}
                    </Text>
                </View>

                {/* Reasons List */}
                <View style={styles.reasonsList}>
                    {REASON_KEYS.map((reasonKey, index) => {
                        const reasonText = t(`settings.delete_reasons.${reasonKey}`);
                        return (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.reasonRow}
                                onPress={() => setSelectedReason(reasonKey)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.reasonText}>{reasonText}</Text>
                                <View style={[styles.radioOuter, selectedReason === reasonKey && styles.radioOuterSelected]}>
                                    {selectedReason === reasonKey && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.deleteBtn, !selectedReason && styles.deleteBtnDisabled]} 
                    onPress={handleDeleteAttempt}
                    disabled={!selectedReason}
                >
                    <Text style={styles.deleteBtnText}>{t('settings.delete_account')}</Text>
                </TouchableOpacity>
            </View>

            {/* Confirmation Modal */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <AlertTriangle size={24} color="#FFFFFF" strokeWidth={2} />
                        </View>
                        
                        <Text style={styles.modalTitle}>{t('settings.delete_confirm_title')}</Text>
                        <Text style={styles.modalSubtitle}>
                            {t('settings.delete_confirm_subtitle')}
                        </Text>

                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder={t('settings.enter_password_to_continue')}
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                {showPassword ? <Eye size={20} color="#9CA3AF" /> : <EyeOff size={20} color="#9CA3AF" />}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.modalBtnCancel]} 
                                onPress={() => setShowModal(false)}
                                disabled={isDeleting}
                            >
                                <Text style={styles.modalBtnCancelText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.modalBtnDelete]} 
                                onPress={confirmDeletion}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalBtnDeleteText}>{t('common.delete')}</Text>
                                )}
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
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#E5E7EB',
    },
    warningBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#DC2626',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#F9FAFB',
    },
    alertBox: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    alertText: {
        color: '#B91C1C',
        fontSize: 14,
        lineHeight: 20,
    },
    reasonsList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    reasonText: {
        fontSize: 15,
        color: '#374151',
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: '#3B4A85',
        backgroundColor: '#EFF6FF',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3B4A85',
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        backgroundColor: '#F9FAFB',
    },
    deleteBtn: {
        backgroundColor: '#3B4A85',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteBtnDisabled: {
        opacity: 0.5,
    },
    deleteBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        position: 'relative',
    },
    modalIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#DC2626',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -24,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginTop: 32,
        marginBottom: 12,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        width: '100%',
        marginBottom: 24,
    },
    passwordInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        height: '100%',
    },
    eyeBtn: {
        padding: 8,
    },
    modalBtnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnCancel: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#3B4A85',
    },
    modalBtnCancelText: {
        color: '#3B4A85',
        fontSize: 15,
        fontWeight: '600',
    },
    modalBtnDelete: {
        backgroundColor: '#3B4A85',
    },
    modalBtnDeleteText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    }
});
