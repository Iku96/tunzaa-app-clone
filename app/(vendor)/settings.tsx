import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    ShieldCheck, 
    ChevronRight,
    Store,
    Lock,
    LogOut
} from 'lucide-react-native';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';

export default function VendorSettingsScreen() {
    const router = useRouter();
    const { logout } = useTunzaaAuth();

    const menuItems = [
        {
            id: 'profile',
            title: 'Business Profile',
            subtitle: 'Edit business name, logo, and categories',
            icon: <Store size={24} color="#3A5BA9" />,
            iconBg: '#EEF2FF',
            onPress: () => router.push('/(vendor)/edit-business')
        },
        {
            id: 'verification',
            title: 'Business Verification',
            subtitle: 'Manage your documents and KYC status',
            icon: <ShieldCheck size={24} color="#10B981" />,
            iconBg: '#F0FDF4',
            onPress: () => router.push('/(vendor)/edit-business') // Direct to documents section
        },
        {
            id: 'security',
            title: 'Security',
            subtitle: 'Password and account security',
            icon: <Lock size={24} color="#F59E0B" />,
            iconBg: '#FFFBEB',
            onPress: () => router.push('/(vendor)/account/details')
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>BUSINESS MANAGEMENT</Text>
                    {menuItems.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
                                {item.icon}
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>ACCOUNT</Text>
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => logout()}
                    >
                        <View style={[styles.menuIconContainer, { backgroundColor: '#FEF2F2' }]}>
                            <LogOut size={24} color="#EF4444" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={[styles.menuTitle, { color: '#EF4444' }]}>Logout</Text>
                            <Text style={styles.menuSubtitle}>Sign out of your account</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    section: {
        paddingTop: 32,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 16,
    },
    menuIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
    },
});

