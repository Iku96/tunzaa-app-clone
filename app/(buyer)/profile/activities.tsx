import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

type Activity = {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    time: string;
    color: string;
};

// Activities will be populated from order history, wishlist changes, profile updates, etc.
// For now we show a summary of the user's recent activity based on available data.
export default function ActivitiesScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();

    const activities: Activity[] = [
        {
            id: '1',
            icon: 'person-circle-outline',
            title: 'Account Created',
            description: 'Welcome to Tunzaa! Your account was created successfully.',
            time: user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : 'Recently',
            color: '#22C55E',
        },
        {
            id: '2',
            icon: 'cart-outline',
            title: 'Browsing Products',
            description: 'You\'ve been exploring products and categories on Tunzaa.',
            time: 'Today',
            color: '#4A55A2',
        },
        {
            id: '3',
            icon: 'heart-outline',
            title: 'Wishlist Activity',
            description: 'Check your wishlist to see saved items.',
            time: 'Recent',
            color: '#EF4444',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Activities</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {activities.map((activity, index) => (
                    <View key={activity.id} style={styles.activityCard}>
                        <View style={[styles.iconCircle, { backgroundColor: activity.color + '15' }]}>
                            <Ionicons name={activity.icon} size={24} color={activity.color} />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <Text style={styles.activityDesc}>{activity.description}</Text>
                            <Text style={styles.activityTime}>{activity.time}</Text>
                        </View>
                        {index < activities.length - 1 && <View style={styles.timeline} />}
                    </View>
                ))}

                <View style={styles.emptyFooter}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="time-outline" size={32} color="#9CA3AF" />
                    </View>
                    <Text style={styles.emptyText}>
                        More activities will appear here as you shop, order, and interact with vendors.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    content: { padding: 20, paddingBottom: 40 },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
        position: 'relative',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    activityContent: { flex: 1 },
    activityTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
    activityDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 4 },
    activityTime: { fontSize: 11, color: '#9CA3AF' },
    timeline: {
        position: 'absolute',
        left: 23,
        top: 52,
        width: 2,
        height: 24,
        backgroundColor: '#E5E7EB',
    },
    emptyFooter: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 18,
    },
});
