import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationType = 'payment_success' | 'payment_received' | 'goal_reminder' | 'installment_completed' | 'return_completed' | 'return_transit' | 'return_request';

interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    icon: any;
    iconBg: string;
    iconColor: string;
}

const NOTIFICATIONS: NotificationItem[] = [
    {
        id: '1',
        type: 'payment_success',
        title: 'Payment Successful!',
        message: 'Hello John, your payment of TSh 150,000 for Samsung Galaxy A15 (Order No. #TUZ12345) has been successfully received.\n\nThank you for using Tunzaa, and welcome again!',
        time: '2h ago',
        icon: 'checkmark-circle',
        iconBg: '#FFF7ED',
        iconColor: '#F59E0B',
    },
    {
        id: '2',
        type: 'payment_received',
        title: 'Payment Received',
        message: 'Hello John, we have successfully received your payment of TSh 150,000 for Order No. #TUZ12345.\n\nThank you for choosing Tunzaa Fintech. We appreciate your trust and look forward to serving you again!',
        time: '2h ago',
        icon: 'wallet-outline',
        iconColor: '#F59E0B',
        iconBg: '#FFF7ED',
    },
    {
        id: '3',
        type: 'goal_reminder',
        title: 'Goal Reminder',
        message: 'Hello John, keep moving closer to your shopping goals! 🎯 by adding at least TSh 1,000 to your order (Order #TUZ12345) through Tunzaa.\n\nEnjoy excellent and convenient service. Thank you for using Tunzaa!',
        time: '2h ago',
        icon: 'notifications-outline',
        iconColor: '#F59E0B',
        iconBg: '#FFF7ED',
    },
    {
        id: '4',
        type: 'installment_completed',
        title: 'Installment Completed!',
        message: 'Hello John, congratulations on completed your installment payments of TSh 450,000 for Samsung Galaxy A15 with Order No. #TUZ56789.',
        time: '2h ago',
        icon: 'trophy-outline',
        iconColor: '#F59E0B',
        iconBg: '#FFF7ED',
    },
    {
        id: '5',
        type: 'return_completed',
        title: 'Return Completed',
        message: "Alex Rodrigues's return has been processed. Refund initiated.",
        time: '2h ago',
        icon: 'checkmark-circle',
        iconColor: '#F59E0B',
        iconBg: '#FFF7ED',
    },
    {
        id: '6',
        type: 'return_transit',
        title: 'Return In Transit',
        message: "Michael Chen's return package is on its way. Expected delivery today.",
        time: '2h ago',
        icon: 'cube-outline',
        iconColor: '#F59E0B',
        iconBg: '#FFF7ED',
    },
    {
        id: '7',
        type: 'return_request',
        title: 'Return Request',
        message: "Sarah Johnson wants to return Nike Air Max 270. Reason: Wrong size delivered.",
        time: '2h ago',
        icon: 'arrow-undo-outline',
        iconColor: '#F59E0B',
        iconBg: '#FFF7ED',
    }
];

export default function NotificationFeedScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const type = params.type as string;

    const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
        <View style={styles.notificationCard}>
            <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={18} color={item.iconColor} />
            </View>
            <View style={styles.contentBox}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.cardMessage}>{item.message}</Text>
            </View>
        </View>
    );

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

            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>New</Text>
                <FlatList
                    data={NOTIFICATIONS}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
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
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        paddingHorizontal: 20,
        marginVertical: 16,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    notificationCard: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentBox: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    timeText: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    cardMessage: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
    },
});
