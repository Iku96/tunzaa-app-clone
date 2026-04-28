import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type ActivityItemProps = {
    icon: keyof typeof Ionicons.glyphMap | keyof typeof Feather.glyphMap;
    title: string;
    onPress: () => void;
    iconFamily?: 'Ionicons' | 'Feather';
};

const ActivityItem = ({ icon, title, onPress, iconFamily = 'Ionicons' }: ActivityItemProps) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <View style={styles.itemLeft}>
            {iconFamily === 'Ionicons' ? (
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color="#1F2937" style={styles.icon} />
            ) : (
                <Feather name={icon as keyof typeof Feather.glyphMap} size={22} color="#1F2937" style={styles.icon} />
            )}
            <Text style={styles.itemTitle}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

export default function ActivitiesScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Activity</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.overviewText}>Your Tunzaa Activity Overview</Text>

                <SectionHeader title="Purchased" />
                <ActivityItem
                    icon="bag-outline"
                    title="Shopping activity"
                    onPress={() => router.push('/(buyer)/profile/activities/spending')}
                />

                <SectionHeader title="Engagement" />
                <ActivityItem
                    icon="heart-outline"
                    title="Likes"
                    onPress={() => router.push('/(buyer)/profile/activities/likes')}
                />
                <ActivityItem
                    icon="share-social-outline"
                    title="Share"
                    onPress={() => router.push('/(buyer)/profile/activities/shares')}
                />
                <ActivityItem
                    icon="bookmark-outline"
                    title="Wishlist"
                    onPress={() => router.push('/(buyer)/wishlist')}
                />

                <SectionHeader title="Content" />
                <ActivityItem
                    icon="grid-outline"
                    title="Post"
                    onPress={() => { }}
                />

                <SectionHeader title="Payment" />
                <ActivityItem
                    icon="card-outline"
                    title="Orders & payment"
                    onPress={() => router.push('/(buyer)/profile/activities/orders-payments')}
                />

                <SectionHeader title="How you use Tunzaa" />
                <ActivityItem
                    icon="time-outline"
                    title="Time spent"
                    onPress={() => router.push('/(buyer)/profile/activities/time')}
                />
                <ActivityItem
                    icon="search-outline"
                    title="Recent search"
                    onPress={() => router.push('/(buyer)/profile/activities/recent-search')}
                />

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    scrollContent: {
        paddingTop: 16,
    },
    overviewText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1A1A1A',
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 24,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 16,
    },
    itemTitle: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '400',
    },
    bottomPadding: {
        height: 60,
    }
});
