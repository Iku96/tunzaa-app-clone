import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useI18n } from '@/hooks/useI18n';
import { useAuth } from '@/context/auth';
import { useUpdateUser } from '@/services/auth';
import { languages } from '@/stores/preferences';
import * as Burnt from 'burnt';

export default function LanguageScreen() {
    const router = useRouter();
    const { t, language, changeLanguage } = useI18n();
    const { user } = useAuth();
    const updateUserMutation = useUpdateUser();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleLanguageSelect = async (langCode: any) => {
        setIsUpdating(true);
        try {
            // Update local app language immediately
            changeLanguage(langCode);
            
            // Sync with backend if user is logged in
            if (user) {
                // Tunzaa backend usually expects en, fr, or sw. If it's a new language, we send it anyway or default to en. 
                // The buyer side LanguageSelector just sends it if it's en/fr/sw.
                const preferredLang = ["en", "fr", "sw"].includes(langCode) ? langCode : "en";
                const nameParts = user.name?.split(" ") || [];
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";

                await updateUserMutation.mutateAsync({
                    userId: user.user_id || user.id,
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        preferred_language: preferredLang,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to sync preferred language to backend", error);
            // We don't block the user from changing local language even if backend fails
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isUpdating}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('account.language') || 'Language'}</Text>
                <View style={styles.headerRight}>
                    {isUpdating && <ActivityIndicator color="#3B4A85" />}
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.list}>
                    {languages.map((lang) => (
                        <TouchableOpacity 
                            key={lang.code} 
                            style={styles.langItem}
                            onPress={() => handleLanguageSelect(lang.code)}
                            disabled={isUpdating}
                            activeOpacity={0.7}
                        >
                            <View style={styles.langInfo}>
                                <Text style={styles.langFlag}>{lang.flag}</Text>
                                <Text style={styles.langName}>{lang.name}</Text>
                            </View>
                            {language === lang.code && (
                                <Check size={24} color="#3B4A85" strokeWidth={2.5} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
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
    headerRight: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    langInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    langFlag: {
        fontSize: 24,
        marginRight: 16,
    },
    langName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    }
});
