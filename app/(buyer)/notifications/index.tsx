import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../../src/components/navigation/BottomNav';

export default function NotificationHubScreen() {
    const router = useRouter();

    const categories = [
        {
            id: 'orders',
            title: 'Orders',
            description: 'Order status, tracking updates, dispute progress and more',
            icon: 'reader-outline',
            iconColor: '#10B981',
            iconBg: '#ECFDF5',
        },
        {
            id: 'promotions',
            title: 'Promotions',
            description: 'Discounts, sales announcements, price alerts and more',
            icon: 'pricetag-outline',
            iconColor: '#F59E0B',
            iconBg: '#FFFBEB',
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#F0F4FA' }]}>
                    <Ionicons name="settings-outline" size={20} color="#425BA4" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={styles.categoryCard}
                        onPress={() => router.push({
                            pathname: '/(buyer)/notifications/feed',
                            params: { type: cat.id }
                        })}
                    >
                        <View style={[styles.iconBox, { backgroundColor: cat.iconBg }]}>
                            <Ionicons name={cat.icon as any} size={22} color={cat.iconColor} />
                        </View>
                        <View style={styles.categoryInfo}>
                            <Text style={styles.categoryTitle}>{cat.title}</Text>
                            <Text style={styles.categoryDesc}>{cat.description}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={styles.emptyState}>
                    <View style={styles.bellWrapper}>
                        <View style={styles.bellGlow} />
                        <Ionicons name="notifications-outline" size={60} color="#F3F4F6" />
                    </View>
                    <Text style={styles.emptyTitle}>No notification yet</Text>
                    <Text style={styles.emptySubtitle}>Stay tuned for order updates, deals & more</Text>
                </View>
            </View>
            <BottomNav />
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
    content: {
        flex: 1,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    categoryDesc: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
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
