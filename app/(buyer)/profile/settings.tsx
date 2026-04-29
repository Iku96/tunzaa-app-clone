import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { Modal } from 'react-native';
import { SUPPORTED_LANGUAGES } from '../../../src/constants/languages';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useTunzaaAuth();
    const { locale, setLocale, t } = useLanguage();
    const [showLanguageModal, setShowLanguageModal] = React.useState(false);

    const languages = SUPPORTED_LANGUAGES;

    const handleSignOut = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace('/language');
                    }
                }
            ]
        );
    };

    const renderSettingItem = (icon: string, label: string, onPress?: () => void, isLast: boolean = false) => (
        <TouchableOpacity style={[styles.itemContainer, isLast && styles.lastItem]} onPress={onPress}>
            <View style={styles.itemContent}>
                <Ionicons name={icon as any} size={24} color="#4B5563" style={styles.itemIcon} />
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderSettingItem("briefcase-outline", "Your Activities", () => router.push('/(buyer)/profile/activities' as any))}
                {renderSettingItem("notifications-outline", "In-App Notifications", () => router.push('/(buyer)/profile/settings/notifications' as any))}
                {renderSettingItem("construct-outline", "Business tools and control", () => router.push('/(buyer)/profile/tools' as any))}
                {renderSettingItem("alarm-outline", "Reminders", () => router.push('/(buyer)/profile/settings/reminder' as any))}
                {renderSettingItem("cube-outline", "Delivery Method", () => router.push('/(buyer)/profile/delivery' as any))}
                {renderSettingItem("document-text-outline", "Policies", () => router.push('/(buyer)/profile/settings/policies' as any))}
                {renderSettingItem("globe-outline", "Language", () => setShowLanguageModal(true))}
                {renderSettingItem("person-outline", "Account Manager", () => router.push('/(buyer)/profile/manager'))}
                {renderSettingItem("log-out-outline", "Log out", handleSignOut, true)}

                <Modal visible={showLanguageModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Language</Text>
                                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                    <Ionicons name="close" size={24} color="#1F2937" />
                                </TouchableOpacity>
                            </View>
                            {languages.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={styles.langOption}
                                    onPress={() => {
                                        setLocale(lang.code as any);
                                        setShowLanguageModal(false);
                                    }}
                                >
                                    <Text style={[styles.langText, locale === lang.code && styles.langTextActive]}>
                                        {lang.nativeName || lang.name}
                                    </Text>
                                    {locale === lang.code && (
                                        <Ionicons name="checkmark" size={20} color="#425BA4" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Tunzaa Version 2.0</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        paddingVertical: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        // borderBottomWidth: 1,
        // borderBottomColor: '#F3F4F6',
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 16,
    },
    itemLabel: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    footer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    langOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    langText: {
        fontSize: 16,
        color: '#4B5563',
    },
    langTextActive: {
        color: '#425BA4',
        fontWeight: 'bold',
    },
});
