import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Alert,
    Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    Activity, 
    Bell, 
    BarChart2, 
    Clock, 
    FileText, 
    Globe, 
    User, 
    LogOut 
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/src/constants/languages';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useTunzaaAuth();
    const { locale, setLocale, t } = useLanguage();
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const languages = SUPPORTED_LANGUAGES;

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out of your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Log Out', 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (e: any) {
                            Alert.alert('Error', e.message || 'Failed to log out');
                        }
                    }
                }
            ]
        );
    };

    const renderSettingRow = (
        icon: React.ReactNode, 
        title: string, 
        onPress: () => void,
        isDestructive: boolean = false
    ) => (
        <TouchableOpacity 
            style={styles.row} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, isDestructive && styles.destructiveIconWrapper]}>
                    {icon}
                </View>
                <Text style={[styles.rowTitle, isDestructive && styles.destructiveText]}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.placeholderBtn} />
            </View>

            {/* Content */}
            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {renderSettingRow(
                    <Activity size={22} color="#1F2937" strokeWidth={1.5} />, 
                    'Your Activities', 
                    () => router.push('/(loan)/activities')
                )}
                {renderSettingRow(
                    <Bell size={22} color="#1F2937" strokeWidth={1.5} />, 
                    'In-App Notifications', 
                    () => router.push('/(loan)/notifications')
                )}
                {renderSettingRow(
                    <BarChart2 size={22} color="#1F2937" strokeWidth={1.5} />, 
                    'Business tools and control', 
                    () => router.push('/(loan)/tools')
                )}
                {renderSettingRow(
                    <Clock size={22} color="#1F2937" strokeWidth={1.5} />, 
                    'Reminders', 
                    () => router.push('/(loan)/reminders')
                )}
                {renderSettingRow(
                    <FileText size={22} color="#1F2937" strokeWidth={1.5} />, 
                    'Policies', 
                    () => router.push('/(loan)/policies')
                )}
                {renderSettingRow(
                    <Globe size={22} color="#1F2937" strokeWidth={1.5} />, 
                    'Language', 
                    () => setShowLanguageModal(true)
                )}
                {renderSettingRow(
                    <User size={22} color="#1F2937" strokeWidth={1.5} />, 
                    'Account Manager', 
                    () => router.push('/(loan)/manager')
                )}
                {renderSettingRow(
                    <LogOut size={22} color="#EF4444" strokeWidth={1.5} />, 
                    'Log out', 
                    handleLogout,
                    true
                )}
            </ScrollView>

            {/* Language Selector Modal */}
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

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Tunzaa Version 2.0</Text>
            </View>
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    placeholderBtn: {
        width: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContainer: {
        paddingTop: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    destructiveIconWrapper: {
        opacity: 0.9,
    },
    rowTitle: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '400',
    },
    destructiveText: {
        color: '#EF4444',
    },
    footer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    footerText: {
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
