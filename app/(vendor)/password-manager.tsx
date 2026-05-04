import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useUpdatePassword } from '@/src/services/auth';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useI18n } from '@/hooks/useI18n';
import * as Burnt from 'burnt';

export default function PasswordManagerScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const { t } = useI18n();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const updatePasswordMutation = useUpdatePassword();

    const handleSave = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Burnt.toast({ title: 'Please fill all fields', preset: 'error' });
            return;
        }

        if (newPassword.length < 8) {
            Burnt.toast({ title: 'New password must be at least 8 characters', preset: 'error' });
            return;
        }

        if (newPassword !== confirmPassword) {
            Burnt.toast({ title: 'New passwords do not match', preset: 'error' });
            return;
        }

        const userId = user?.user_id || user?.id;
        if (!userId) {
            Burnt.toast({ title: 'User authentication error', preset: 'error' });
            return;
        }

        updatePasswordMutation.mutate(
            { 
                userId, 
                data: { currentPassword, newPassword }
            },
            {
                onSuccess: () => {
                    Burnt.toast({ title: 'Password updated successfully!', preset: 'done' });
                    router.back();
                },
                onError: (error) => {
                    console.error("Password update failed:", error);
                    Burnt.toast({ title: 'Failed to update password. Please check your current password.', preset: 'error' });
                }
            }
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.password_manager')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView 
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('settings.current_password')}</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="**********"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showCurrent}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                                {showCurrent ? <Eye size={20} color="#9CA3AF" /> : <EyeOff size={20} color="#9CA3AF" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('settings.new_password')}</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder={t('settings.at_least_8_chars')}
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showNew}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                                {showNew ? <Eye size={20} color="#9CA3AF" /> : <EyeOff size={20} color="#9CA3AF" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('settings.confirm_password')}</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder={t('settings.at_least_8_chars')}
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showConfirm}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                                {showConfirm ? <Eye size={20} color="#9CA3AF" /> : <EyeOff size={20} color="#9CA3AF" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.saveBtn, updatePasswordMutation.isPending && styles.saveBtnDisabled]} 
                        onPress={handleSave}
                        disabled={updatePasswordMutation.isPending}
                    >
                        <Text style={styles.saveBtnText}>
                            {updatePasswordMutation.isPending ? t('settings.saving_dots') : t('settings.save_password')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
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
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        height: 56,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        height: '100%',
    },
    eyeBtn: {
        padding: 8,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        backgroundColor: '#FFFFFF',
    },
    saveBtn: {
        backgroundColor: '#3B4A85',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    }
});
