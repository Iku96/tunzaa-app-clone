import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, HelpCircle } from 'lucide-react-native';
import { useI18n } from '@/hooks/useI18n';
import * as Burnt from 'burnt';

export default function LiveChatScreen() {
    const router = useRouter();
    const { t } = useI18n();
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendMessage = async () => {
        if (!description.trim()) {
            Burnt.toast({ title: 'Please describe your issue', preset: 'error' });
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API call to ticketing system or email trigger
            await new Promise((resolve) => setTimeout(resolve, 1500));
            
            Burnt.toast({ title: 'Message sent successfully!', preset: 'done' });
            router.back();
        } catch (error) {
            console.error("Message submission failed:", error);
            Burnt.toast({ title: 'Failed to send message. Please try again.', preset: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{t('settings.live_chat_title')}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>
            <View style={styles.subHeaderContainer}>
                <Text style={styles.subHeaderText}>{t('settings.live_chat_subtitle')}</Text>
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
                    <Text style={styles.introText}>
                        {t('settings.live_chat_intro')}
                    </Text>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>{t('settings.description')} <Text style={styles.requiredStar}>*</Text></Text>
                            <HelpCircle size={14} color="#6B7280" strokeWidth={2} style={styles.infoIcon} />
                        </View>
                        
                        <TextInput
                            style={styles.textArea}
                            placeholder={t('settings.describe_issues')}
                            placeholderTextColor="#9CA3AF"
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                            editable={!isSubmitting}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.sendBtn, (!description.trim() || isSubmitting) && styles.sendBtnDisabled]} 
                        onPress={handleSendMessage}
                        disabled={!description.trim() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.sendBtnText}>{t('settings.send_message')}</Text>
                        )}
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
        paddingTop: 12,
        paddingBottom: 4,
        backgroundColor: '#FFFFFF',
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    subHeaderContainer: {
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        alignItems: 'center',
    },
    subHeaderText: {
        fontSize: 13,
        color: '#6B7280',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    introText: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 24,
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: '#374151',
    },
    requiredStar: {
        color: '#3B4A85',
    },
    infoIcon: {
        marginLeft: 6,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        height: 160,
        padding: 16,
        fontSize: 15,
        color: '#111827',
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        backgroundColor: '#FFFFFF',
    },
    sendBtn: {
        backgroundColor: '#3B4A85',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: {
        opacity: 0.7,
    },
    sendBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    }
});
