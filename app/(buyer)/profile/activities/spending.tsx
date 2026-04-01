import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SpendingActivitiesScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Top' | 'Category'>('Top');

    // Mock data for recent activities
    const recentActivities = [
        { id: '1', title: 'iPhone 16 pro Max', date: '2 Aug - 31 Aug', amount: '1,500,000' },
        { id: '2', title: 'iPhone 16 pro Max', date: '2 Aug - 31 Aug', amount: '1,500,000' },
        { id: '3', title: 'Macbook Pro M3', date: '2 Jul - 31 Jul', amount: '4,500,000' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Spending Activities</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Top' && styles.activeTab]}
                        onPress={() => setActiveTab('Top')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Top' && styles.activeTabText]}>
                            Top insight
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Category' && styles.activeTab]}
                        onPress={() => setActiveTab('Category')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Category' && styles.activeTabText]}>
                            Category insight
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Row */}
                <View style={styles.filterRow}>
                    <TouchableOpacity style={styles.dropdownBtn}>
                        <Text style={styles.dropdownText}>Last 30 days ago</Text>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.dateRangeText}>1 Aug - 31 Aug</Text>
                </View>

                {/* Monthly Overview Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Monthly Overview</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Aug 2024</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Total spending</Text>
                            <Text style={styles.statValue}>Tzs 220, 000</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Avg Daily spent</Text>
                            <Text style={styles.statValue}>Tzs 70,000.</Text>
                        </View>
                    </View>
                </View>

                {/* 2x2 Grid Stats */}
                <View style={styles.gridContainer}>
                    {[
                        { label: 'Completed goals', value: '12', trend: '+20%' },
                        { label: 'Goal in progress', value: '12', trend: '+20%' },
                        { label: 'Installments paid', value: '12', trend: '+20%' },
                        { label: 'One time paid', value: '12', trend: '+20%' },
                    ].map((item, idx) => (
                        <View key={idx} style={styles.gridItem}>
                            <View style={styles.gridHeader}>
                                <Text style={styles.gridValue}>{item.value}</Text>
                                <View style={styles.trendBadge}>
                                    <Ionicons name="arrow-up" size={10} color="#425BA4" />
                                    <Text style={styles.trendText}>{item.trend}</Text>
                                </View>
                            </View>
                            <Text style={styles.gridLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Recent Activity List */}
                <View style={styles.recentSection}>
                    <Text style={styles.recentTitle}>Recent Activity</Text>
                    <Text style={styles.recentSubtitle}>Top Spending</Text>

                    {recentActivities.map((activity) => (
                        <TouchableOpacity key={activity.id} style={styles.activityItem}>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityName}>{activity.title}</Text>
                                <View style={styles.activityMetaRow}>
                                    <Text style={styles.activityMeta}>{activity.date}</Text>
                                    <Text style={styles.activityAmount}>Tzs {activity.amount}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
        marginRight: 32,
    },
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#425BA4',
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dropdownText: {
        fontSize: 13,
        color: '#4B5563',
        marginRight: 6,
    },
    dateRangeText: {
        fontSize: 13,
        color: '#4B5563',
    },
    overviewCard: {
        backgroundColor: '#425BA4',
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statCol: {
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 16,
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        marginBottom: 4,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    gridItem: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    gridHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    gridValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    trendText: {
        fontSize: 10,
        color: '#425BA4',
        fontWeight: '600',
        marginLeft: 2,
    },
    gridLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    recentSection: {
        marginTop: 8,
    },
    recentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    recentSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 16,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    activityInfo: {
        flex: 1,
    },
    activityName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    activityMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 16,
    },
    activityMeta: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    activityAmount: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
});
