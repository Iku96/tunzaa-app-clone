import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function SettingsScreen() {
    const router = useRouter();
    const { signOut } = useAuth();

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
                        await signOut();
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    const renderSettingItem = (icon: string, label: string, onPress?: () => void, isLast: boolean = false) => (
        <TouchableOpacity style={[styles.itemContainer, isLast && styles.lastItem]} onPress={onPress}>
            <View style={styles.itemContent}>
                <Ionicons name={icon} size={24} color="#4B5563" style={styles.itemIcon} />
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
                <View style={{ width: 32 }} /> {/* Spacer for centering */}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderSettingItem("briefcase-outline", "Your Activities")}
                {renderSettingItem("notifications-outline", "In-App Notifications")}
                {renderSettingItem("construct-outline", "Business tools and control", () => router.push('/(buyer)/profile/tools'))}
                {renderSettingItem("alarm-outline", "Reminders")}
                {renderSettingItem("cube-outline", "Delivery Method")}
                {renderSettingItem("document-text-outline", "Policies")}
                {renderSettingItem("globe-outline", "Language")}
                {renderSettingItem("person-outline", "Account Manager")}
                {renderSettingItem("log-out-outline", "Log out", handleSignOut, true)}

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
});
