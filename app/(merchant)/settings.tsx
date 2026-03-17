import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
    ChevronRight
} from 'lucide-react-native';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';

export default function MerchantSettingsScreen() {
    const router = useRouter();
    const { logout } = useTunzaaAuth();

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
                        router.replace('/');
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon: Icon, label, onPress, isLast = false }: any) => (
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
            <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <SettingItem 
                    icon={Activity} 
                    label="Your Activities" 
                    onPress={() => router.push('/(merchant)/settings/activity')} 
                />
                <SettingItem 
                    icon={Bell} 
                    label="In-App Notifications" 
                    onPress={() => router.push('/(merchant)/settings/notifications')} 
                />
                <SettingItem 
                    icon={AlarmClock} 
                    label="Reminders" 
                    onPress={() => router.push('/(merchant)/settings/reminders')} 
                />
                <SettingItem 
                    icon={Truck} 
                    label="Delivery Orders" 
                    onPress={() => router.push('/(merchant)/settings/delivery')} 
                />
                <SettingItem 
                    icon={FileText} 
                    label="Policies" 
                    onPress={() => router.push('/(merchant)/settings/policies')} 
                />
                <SettingItem 
                    icon={User} 
                    label="Account Manage" 
                    onPress={() => router.push('/(merchant)/settings/account')} 
                />
                <SettingItem 
                    icon={UserPlus} 
                    label="Invite Friends" 
                    onPress={() => {}} 
                />
                <SettingItem 
                    icon={Globe} 
                    label="Language" 
                    onPress={() => router.push('/language' as any)} 
                />
                <SettingItem 
                    icon={LogOut} 
                    label="Log out" 
                    onPress={handleSignOut}
                    isLast={true}
                />

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
    footer: {
        marginTop: 60,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
});
