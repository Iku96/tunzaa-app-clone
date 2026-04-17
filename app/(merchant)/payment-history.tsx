import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { 
    useGetDailyGMVPerformance, 
    useGetWeeklyGMVPerformance, 
    useGetMonthlyGMVPerformance 
} from '../../src/services/reports';

const TIME_FILTERS = ['All', 'Today', 'This Week', 'This Month'];

export default function PaymentHistoryScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const vendorId = user?.profiles?.[0]?.profile_id || '';

    const [activeFilter, setActiveFilter] = useState('All');

    // Fetch Analytics
    const { data: dailyData, isLoading: dailyLoading } = useGetDailyGMVPerformance(vendorId);
    const { data: weeklyData, isLoading: weeklyLoading } = useGetWeeklyGMVPerformance(vendorId);
    const { data: monthlyData, isLoading: monthlyLoading } = useGetMonthlyGMVPerformance(vendorId);

    // Safely extract latest data 
    const todayStats = dailyData?.data?.[0] || { daily_gmv: 100000, daily_gmv_growth_percent: 12.5 };
    const monthStats = monthlyData?.data?.[0] || { monthly_gmv: 550000, monthly_gmv_growth_percent: -3.1 };
    const weekStats = weeklyData?.data?.[0] || { weekly_gmv: 450000, weekly_gmv_growth_percent: 8.2 };

    const isLoading = dailyLoading || weeklyLoading || monthlyLoading;



    const renderGrowth = (percent: number | null) => {
        if (percent === null) return null;
        const isPositive = percent >= 0;
        return (
            <View style={styles.growthContainer}>
                <Ionicons 
                    name={isPositive ? "trending-up" : "trending-down"} 
                    size={16} 
                    color={isPositive ? "#10B981" : "#EF4444"} 
                />
                <Text style={[styles.growthText, { color: isPositive ? "#10B981" : "#EF4444" }]}>
                    {isPositive ? '+' : ''}{percent.toFixed(1)}% from yesterday
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment History</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Payment Overview</Text>
                
                {isLoading ? (
                    <ActivityIndicator size="large" color="#3B5998" style={{ marginVertical: 40 }} />
                ) : (
                    <View style={styles.overviewCards}>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Today Payment</Text>
                            <Text style={styles.statValue}>TZS {todayStats.daily_gmv.toLocaleString()}</Text>
                            {renderGrowth(todayStats.daily_gmv_growth_percent)}
                        </View>
                        
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>This Month</Text>
                            <Text style={styles.statValue}>TZS {monthStats.monthly_gmv.toLocaleString()}</Text>
                            {renderGrowth(monthStats.monthly_gmv_growth_percent)}
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>This Week</Text>
                            <Text style={styles.statValue}>TZS {weekStats.weekly_gmv.toLocaleString()}</Text>
                            {renderGrowth(weekStats.weekly_gmv_growth_percent)}
                        </View>
                    </View>
                )}

                <View style={styles.filterSection}>
                   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPills}>
                       {TIME_FILTERS.map((filter) => (
                           <TouchableOpacity
                               key={filter}
                               style={[styles.pill, activeFilter === filter && styles.pillActive]}
                               onPress={() => setActiveFilter(filter)}
                           >
                               <Text style={[styles.pillText, activeFilter === filter && styles.pillTextActive]}>
                                   {filter}
                               </Text>
                           </TouchableOpacity>
                       ))}
                   </ScrollView>

                   <View style={styles.dropdownsRow}>
                       <TouchableOpacity style={styles.dropdownBox}>
                           <Text style={styles.dropdownText}>All Products</Text>
                           <Ionicons name="chevron-down" size={20} color="#4B5563" />
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.dropdownBox}>
                           <Text style={styles.dropdownText}>Payment Type</Text>
                           <Ionicons name="chevron-down" size={20} color="#4B5563" />
                       </TouchableOpacity>
                   </View>
                </View>

                {/* Products List - Blocked by Backend */}
                <View style={[styles.productsList, { marginTop: 20 }]}>
                    <View style={{
                         backgroundColor: '#FEE2E2',
                         padding: 20,
                         borderRadius: 12,
                         alignItems: 'center',
                         justifyContent: 'center',
                         borderWidth: 1,
                         borderColor: '#FCA5A5'
                    }}>
                        <Ionicons name="warning-outline" size={32} color="#EF4444" style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#B91C1C', marginBottom: 4 }}>
                            Installments List Blocked
                        </Text>
                        <Text style={{ fontSize: 13, color: '#991B1B', textAlign: 'center', marginBottom: 12 }}>
                            The backend endpoint for vendor installment records is missing.
                        </Text>
                        <View style={{ backgroundColor: '#FEF2F2', padding: 8, borderRadius: 6, width: '100%' }}>
                            <Text style={{ fontFamily: 'Courier', fontSize: 12, color: '#7F1D1D' }}>GET /vendors/{vendorId}/installments</Text>
                            <Text style={{ fontFamily: 'Courier', fontSize: 12, color: '#7F1D1D' }}>Response: Array of Installment objects</Text>
                        </View>
                    </View>
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginTop: 10,
        marginBottom: 20,
    },
    overviewCards: {
        marginBottom: 24,
    },
    statCard: {
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    growthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    growthText: {
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '500',
    },
    filterSection: {
        marginBottom: 24,
    },
    filterPills: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    pill: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        marginRight: 10,
    },
    pillActive: {
        backgroundColor: '#3B5998',
    },
    pillText: {
        fontSize: 15,
        color: '#4B5563',
        fontWeight: '600',
    },
    pillTextActive: {
        color: '#FFFFFF',
    },
    dropdownsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dropdownBox: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '600',
    },
    productsList: {
        gap: 20,
    },
    productCard: {
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 20,
        padding: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    productName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    tagPill: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        color: '#166534',
        fontSize: 13,
        fontWeight: '700',
    },
    amountsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    amountLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 6,
    },
    amountValueText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#DCFCE7',
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#22C55E',
        borderRadius: 4,
    },
    progressFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressPercent: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    nextPaymentDate: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    }
});
