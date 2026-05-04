import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    ChevronRight,
    Activity,
    Bell,
    BarChart3,
    Clock,
    Truck,
    FileText,
    Languages,
    LogOut,
    User
} from 'lucide-react-native';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useI18n } from '@/hooks/useI18n';

export default function VendorSettingsScreen() {
    const router = useRouter();
    const { logout, user } = useTunzaaAuth();
    const { t } = useI18n();

    const handleInviteFriends = async () => {
        try {
            const result = await Share.share({
                message: 'Join me on Tunzaa Marketplace! Buy and sell products with ease.',
                url: 'https://tunzaa.co.tz',
                title: 'Invite to Tunzaa'
            });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const menuItems = [
        {
            id: 'activities',
            title: t('settings.your_activities'),
            icon: <Activity size={24} color="#1F2937" strokeWidth={1.5} />,
            onPress: () => router.push('/(vendor)/activities')
        },
        {
            id: 'notifications',
            title: t('settings.in_app_notifications'),
            icon: <Bell size={24} color="#1F2937" strokeWidth={1.5} />,
            onPress: () => router.push('/(vendor)/notification-settings')
        },
        {
            id: 'business_tools',
            title: t('settings.business_tools'),
            icon: <BarChart3 size={24} color="#1F2937" strokeWidth={1.5} />,
            onPress: () => router.push('/(vendor)/business-tools') 
        },
        {
            id: 'reminders',
            title: t('settings.reminders'),
            icon: <Clock size={24} color="#1F2937" strokeWidth={1.5} />,
            onPress: () => router.push('/(vendor)/reminders')
        },
        {
            id: 'delivery',
            title: t('settings.delivery_orders'),
            icon: <Truck size={24} color="#1F2937" strokeWidth={1.5} />,
            onPress: () => router.push('/(vendor)/delivery-orders')
        },
        {
            id: 'policies',
            title: t('settings.policies'),
            icon: <FileText size={24} color="#1F2937" strokeWidth={1.5} />,
            onPress: () => router.push('/(vendor)/policies')
        },
        {
            id: 'language',
            title: t('settings.language'),
            icon: <Languages size={24} color="#1F2937" strokeWidth={1.5} />,
            onPress: () => router.push('/(vendor)/vendor-language')
        },
        {
            id: 'account',
            title: t('settings.account_manager'),
            icon: <FileText size={24} color="#1F2937" strokeWidth={1.5} />,
            onPress: () => router.push('/(vendor)/account-manager')
        },
        {
            id: 'logout',
            title: t('settings.log_out'),
            icon: <LogOut size={24} color="#1F2937" strokeWidth={1.5} />,
            onPress: () => logout()
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.settings')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.menuList}>
                    {menuItems.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.menuItem}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.iconWrapper}>
                                {item.icon}
                            </View>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <ChevronRight size={20} color="#1F2937" strokeWidth={1} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Version Footer */}
            <View style={styles.footer}>
                <Text style={styles.versionText}>{t('settings.version')}</Text>
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
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },
    menuList: {
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
    },
    iconWrapper: {
        marginRight: 16,
        width: 32,
        alignItems: 'center',
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '400',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '400',
    }
});
