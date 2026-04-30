import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    UserCircle2, 
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
            onPress: () => router.push('/(vendor)/edit-business')
        },
        {
            id: 'verification',
            title: 'Business Verification',
            subtitle: 'Manage your documents and KYC status',
            icon: <ShieldCheck size={24} color="#10B981" />,
            onPress: () => router.push('/(vendor)/account/details') // Linking to details for now as it handles KYC/docs
        },
        {
            id: 'security',
            title: 'Security',
            subtitle: 'Password and account security',
            icon: <Lock size={24} color="#F59E0B" />,
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

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Management</Text>
                    {menuItems.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuIconContainer}>
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
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => logout()}
                    >
                        <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
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
        paddingTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
});
