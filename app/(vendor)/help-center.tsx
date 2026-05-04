import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Mail, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useI18n } from '@/hooks/useI18n';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4'];

export default function HelpCenterScreen() {
    const router = useRouter();
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'FAQ' | 'CONTACT'>('CONTACT');
    const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

    const handlePhoneClick = () => {
        Linking.openURL('tel:+255753090090').catch((err) =>
            console.error("Failed to open phone URL:", err)
        );
    };

    const handleEmailClick = () => {
        Linking.openURL('mailto:mambo@Tunzaa.com').catch((err) =>
            console.error("Failed to open email URL:", err)
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.help_center')}</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Custom Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'FAQ' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('FAQ')}
                >
                    <Text style={[styles.tabText, activeTab === 'FAQ' && styles.tabTextActive]}>{t('settings.faq')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'CONTACT' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('CONTACT')}
                >
                    <Text style={[styles.tabText, activeTab === 'CONTACT' && styles.tabTextActive]}>{t('settings.contact_us')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {activeTab === 'FAQ' ? (
                    <View style={styles.faqSection}>
                        {FAQ_KEYS.map((key, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.faqItem}
                                onPress={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqQuestionRow}>
                                    <Text style={styles.faqQuestion}>{t(`settings.faq_items.${key}`)}</Text>
                                    {expandedFaqIndex === index ? (
                                        <ChevronUp size={20} color="#9CA3AF" />
                                    ) : (
                                        <ChevronDown size={20} color="#9CA3AF" />
                                    )}
                                </View>
                                {expandedFaqIndex === index && (
                                    <Text style={styles.faqAnswer}>{t(`settings.faq_items.a${index + 1}`)}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.contactSection}>
                        <Text style={styles.contactIntroText}>
                            {t('settings.contact_intro')}
                        </Text>

                        <View style={styles.contactButtonsContainer}>
                            <TouchableOpacity style={styles.contactOutlineBtn} onPress={handlePhoneClick}>
                                <Phone size={20} color="#111827" strokeWidth={1.5} />
                                <Text style={styles.contactOutlineBtnText}>(+255) 753 090 090</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.contactOutlineBtn} onPress={handleEmailClick}>
                                <Mail size={20} color="#111827" strokeWidth={1.5} />
                                <Text style={styles.contactOutlineBtnText}>mambo@Tunzaa.com</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>{t('settings.or_divider')}</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity 
                            style={styles.liveChatBtn}
                            onPress={() => router.push('/(vendor)/live-chat')}
                        >
                            <MessageCircle size={20} color="#FFFFFF" strokeWidth={1.5} style={{ marginRight: 8 }} />
                            <Text style={styles.liveChatBtnText}>{t('settings.live_chat')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
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
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingHorizontal: 20,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: '#3B4A85',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#6B7280',
    },
    tabTextActive: {
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    
    // FAQ Tab Styles
    faqSection: {
        flex: 1,
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingVertical: 16,
    },
    faqQuestionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    faqQuestion: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
        paddingRight: 16,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
        marginTop: 12,
    },

    // Contact Tab Styles
    contactSection: {
        flex: 1,
    },
    contactIntroText: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 24,
        marginBottom: 32,
    },
    contactButtonsContainer: {
        gap: 16,
        marginBottom: 40,
    },
    contactOutlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 28,
        paddingVertical: 16,
        paddingHorizontal: 24,
        height: 56,
    },
    contactOutlineBtnText: {
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#9CA3AF',
    },
    liveChatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B4A85',
        height: 56,
        borderRadius: 28,
    },
    liveChatBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    }
});
