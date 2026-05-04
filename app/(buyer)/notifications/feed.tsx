import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationFeedScreen() {
    const { type } = useLocalSearchParams<{ type: string }>();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Replace with actual API call to fetch notifications based on type
        // e.g., const response = await notificationsApi.getNotifications({ type });
        // setNotifications(response.items);
        setNotifications([]);
        setLoading(false);
    }, [type]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notification</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="options-outline" size={20} color="#4B5563" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptySubtitle}>Loading notifications...</Text>
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.bellWrapper}>
                        <View style={styles.bellGlow} />
                        <Ionicons name="notifications-outline" size={60} color="#E5E7EB" />
                    </View>
                    <Text style={styles.emptyTitle}>No notification yet</Text>
                    <Text style={styles.emptySubtitle}>Stay tuned for order updates, deals & more</Text>
                </View>
            ) : (
                <ScrollView style={styles.listContainer}>
                    <Text style={styles.sectionHeader}>New</Text>
                    {notifications.map((notif) => (
                        <View key={notif.id} style={styles.notificationCard}>
                            <View style={[styles.iconBox, { backgroundColor: notif.iconBg }]}>
                                <Ionicons name={notif.icon as any} size={20} color={notif.iconColor} />
                            </View>
                            <View style={styles.notificationContent}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.title}>{notif.title}</Text>
                                    <Text style={styles.time}>{notif.time}</Text>
                                </View>
                                <Text style={styles.message}>{notif.message}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    notificationCard: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 20,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    notificationContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
    },
    time: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    message: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 80,
    },
    bellWrapper: {
        position: 'relative',
        marginBottom: 24,
    },
    bellGlow: {
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        borderRadius: 50,
        backgroundColor: '#F9FAFB',
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});
