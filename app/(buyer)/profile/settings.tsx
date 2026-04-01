import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

export default function SettingsScreen() {
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
                        router.replace('/language');
                    }
                }
            ]
        );
    };

    const renderSettingItem = (icon: string, label: string, onPress?: () => void) => (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <View style={styles.itemLeft}>
                <View style={styles.iconWrapper}>
                    <Ionicons name={icon as any} size={20} color="#4B5563" />
                </View>
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    {renderSettingItem("briefcase-outline", "Your Activities", () => router.push('/(buyer)/profile/activities' as any))}
                    {renderSettingItem("notifications-outline", "In-App Notifications", () => router.push('/(buyer)/profile/settings/notifications' as any))}
                    {renderSettingItem("construct-outline", "Business tools and control", () => router.push('/(buyer)/profile/tools' as any))}
                    {renderSettingItem("alarm-outline", "Reminders", () => router.push('/(buyer)/profile/settings/reminder' as any))}
                    {renderSettingItem("cube-outline", "Delivery Method", () => router.push('/(buyer)/profile/delivery' as any))}
                    {renderSettingItem("document-text-outline", "Policies", () => router.push('/(buyer)/profile/settings/policies' as any))}
                    {renderSettingItem("globe-outline", "Language")}
                    {renderSettingItem("person-outline", "Account Manager", () => router.push('/(buyer)/profile/manager'))}
                </View>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    <View style={styles.itemLeft}>
                        <View style={[styles.iconWrapper, { backgroundColor: '#FEE2E2' }]}>
                            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        </View>
                        <Text style={[styles.itemLabel, { color: '#EF4444' }]}>Log out</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Tunzaa Version 2.0</Text>
                    <Text style={styles.subVersionText}>Beta Testing Release</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
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
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        paddingTop: 8,
        paddingBottom: 40,
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginTop: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemLabel: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },
    divider: {
        height: 24,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: 'bold',
    },
    subVersionText: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
    },
});
