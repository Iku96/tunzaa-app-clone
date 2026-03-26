import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    Activity, 
    Bell, 
    AlarmClock, 
    Truck, 
    FileText, 
    User, 
    UserPlus, 
    Globe, 
    LogOut,
    ChevronRight,
    Check
} from 'lucide-react-native';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../../src/constants/languages';

export default function MerchantSettingsScreen() {
    const router = useRouter();
    const { logout } = useTunzaaAuth();
    const { locale, setLocale, t } = useLanguage();
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

    const handleSignOut = async () => {
        Alert.alert(
            t.settingsLogoutConfirmTitle,
            t.settingsLogoutConfirmMessage,
            [
                { text: t.onboardingStep1Back, style: "cancel" },
                {
                    text: t.settingsLogout,
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        // Navigation is handled by MerchantLayout's auth guard
                    }
                }
            ]
        );
    };

    const handleLanguageSelect = async (code: string) => {
        await setLocale(code);
        setIsLanguageModalVisible(false);
    };

    const SettingItem = ({ icon: Icon, label, onPress, isLast = false, value }: any) => (
        <TouchableOpacity 
            style={[styles.itemContainer, isLast && styles.lastItem]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.itemLeft}>
                <View style={styles.iconWrapper}>
                    <Icon size={22} color="#111827" strokeWidth={1.5} />
                </View>
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <View style={styles.itemRight}>
                {value && <Text style={styles.itemValue}>{value}</Text>}
                <ChevronRight size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    const currentLanguageName = SUPPORTED_LANGUAGES.find(l => l.code === locale)?.nativeName || 'English';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.settingsTitle}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <SettingItem 
                    icon={Activity} 
                    label={t.settingsActivities} 
                    onPress={() => router.push('/(merchant)/settings/activity')} 
                />
                <SettingItem 
                    icon={Bell} 
                    label={t.settingsNotifications} 
                    onPress={() => router.push('/(merchant)/settings/notifications')} 
                />
                <SettingItem 
                    icon={AlarmClock} 
                    label={t.settingsReminders} 
                    onPress={() => router.push('/(merchant)/settings/reminders')} 
                />
                <SettingItem 
                    icon={Truck} 
                    label={t.settingsDelivery} 
                    onPress={() => router.push('/(merchant)/settings/delivery')} 
                />
                <SettingItem 
                    icon={FileText} 
                    label={t.settingsPolicies} 
                    onPress={() => router.push('/(merchant)/settings/policies')} 
                />
                <SettingItem 
                    icon={User} 
                    label={t.settingsAccount} 
                    onPress={() => router.push('/(merchant)/settings/account')} 
                />
                <SettingItem 
                    icon={UserPlus} 
                    label={t.settingsInvite} 
                    onPress={() => router.push('/(merchant)/settings/invite-friends' as any)} 
                />
                <SettingItem 
                    icon={Globe} 
                    label={t.settingsLanguage} 
                    value={currentLanguageName}
                    onPress={() => setIsLanguageModalVisible(true)} 
                />
                
                <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
                    <LogOut size={22} color="#EF4444" strokeWidth={1.5} />
                    <Text style={styles.logoutText}>{t.settingsLogout}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>{t.settingsVersion}</Text>
                </View>
            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                visible={isLanguageModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t.languageScreenChoosePreferred}</Text>
                            <TouchableOpacity onPress={() => setIsLanguageModalVisible(false)}>
                                <Text style={styles.closeBtn}>{t.roleScreenBack}</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.languageList}>
                            {SUPPORTED_LANGUAGES.map((lang) => {
                                const isSelected = locale === lang.code;
                                return (
                                    <TouchableOpacity 
                                        key={lang.code}
                                        style={[styles.languagePill, isSelected && styles.languagePillSelected]}
                                        onPress={() => handleLanguageSelect(lang.code)}
                                    >
                                        <Text style={[styles.languageName, isSelected && styles.languageNameSelected]}>
                                            {lang.nativeName || lang.name}
                                        </Text>
                                        {isSelected && <Check size={20} color="#FFFFFF" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        flex: 1,
    },
    scrollContent: {
        paddingTop: 12,
        paddingBottom: 40,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 24,
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 24,
        alignItems: 'center',
        marginRight: 16,
    },
    itemLabel: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemValue: {
        fontSize: 14,
        color: '#6B7280',
        marginRight: 8,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        marginLeft: 16,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeBtn: {
        fontSize: 16,
        color: '#425BA4',
        fontWeight: '600',
    },
    languageList: {
        padding: 16,
    },
    languagePill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        marginBottom: 12,
    },
    languagePillSelected: {
        backgroundColor: '#425BA4',
    },
    languageName: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    languageNameSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
