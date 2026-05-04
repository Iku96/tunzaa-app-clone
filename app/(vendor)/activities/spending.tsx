import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useGetUserOrders } from '@/src/services/orders';
import { format, isSameMonth, subDays, isAfter, startOfDay, eachDayOfInterval, isSameDay } from 'date-fns';

const { width } = Dimensions.get('window');

const DATE_OPTIONS = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
];

export default function VendorSpendingActivitiesScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const [activeTab, setActiveTab] = useState<'Top' | 'Category'>('Top');
    const [dateFilter, setDateFilter] = useState('Last 30 days');
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const userId = user?.user_id || '';
    const { data: ordersData, isLoading } = useGetUserOrders(userId, { limit: 100 });
    const allOrders = ordersData?.items || [];

    // Filter orders based on selection
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const selectedOption = DATE_OPTIONS.find(opt => opt.label === dateFilter);
        let daysToSubtract = selectedOption?.days || 30;

        const threshold = startOfDay(subDays(now, daysToSubtract));
        return allOrders.filter(order => isAfter(new Date(order.created_at), threshold));
    }, [allOrders, dateFilter]);

    // Metrics Calculation
    const metrics = useMemo(() => {
        const now = new Date();
        const monthlyOrders = filteredOrders.filter(o => isSameMonth(new Date(o.created_at), now));
        const totalSpending = filteredOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
        const monthlySpending = monthlyOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
        
        const dayOfMonth = now.getDate();
        const avgDailySpent = monthlySpending / (dayOfMonth || 1);

        const completed = filteredOrders.filter(o => o.status === 'completed').length;
        const inProgress = filteredOrders.filter(o => o.status === 'processing' || o.status === 'pending').length;
        const installments = filteredOrders.filter(o => o.payment_details?.method?.toLowerCase().includes('tunzaa') || o.payment_details?.method?.toLowerCase().includes('installment')).length;
        const oneTime = filteredOrders.filter(o => !o.payment_details?.method?.toLowerCase().includes('tunzaa')).length;

        return {
            totalSpending,
            monthlySpending,
            avgDailySpent,
            completed,
            inProgress,
            installments,
            oneTime
        };
    }, [filteredOrders]);

    // Category Breakdown Logic
    const categoryArray = useMemo(() => {
        const categoryData: Record<string, { total: number, color: string }> = {};
        const COLORS = ['#10B981', '#6B7280', '#EF4444', '#FBBF24', '#8B5CF6', '#EC4899'];
        
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const categoryName = (item as any).category_name || 'Others';
                if (!categoryData[categoryName]) {
                    categoryData[categoryName] = { 
                        total: 0, 
                        color: COLORS[Object.keys(categoryData).length % COLORS.length] 
                    };
                }
                categoryData[categoryName].total += item.total || 0;
            });
        });

        const total = metrics.totalSpending || 1;
        return Object.entries(categoryData).map(([name, data]) => ({
            name,
            ...data,
            percentage: (data.total / total) * 100
        })).sort((a, b) => b.total - a.total);
    }, [filteredOrders, metrics.totalSpending]);

    // Trend Logic
    const trendData = useMemo(() => {
        const days = 16; 
        const interval = eachDayOfInterval({
            start: subDays(new Date(), days - 1),
            end: new Date()
        });

        return interval.map(day => {
            const dayTotal = filteredOrders
                .filter(o => isSameDay(new Date(o.created_at), day))
                .reduce((sum, o) => sum + (o.totals?.total || 0), 0);
            return dayTotal;
        });
    }, [filteredOrders]);

    const maxTrend = Math.max(...trendData, 1);

    const renderTopInsight = () => (
        <View style={styles.tabContent}>
            <View style={styles.monthlyCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderText}>Monthly Overview</Text>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>{format(new Date(), 'MMM yyyy')}</Text>
                    </View>
                </View>

                <View style={styles.mainStatsRow}>
                    <View style={styles.mainStatBox}>
                        <Text style={styles.mainStatLabel}>Total Spending</Text>
                        <Text style={styles.mainStatValue}>Tzs {metrics.totalSpending.toLocaleString()}</Text>
                    </View>
                    <View style={styles.mainStatBox}>
                        <Text style={styles.mainStatLabel}>Avg. Daily Usage</Text>
                        <Text style={styles.mainStatValue}>Tzs {Math.round(metrics.avgDailySpent).toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsGrid}>
                {[
                    { label: 'Completed goals', value: metrics.completed.toString(), trend: '0%' },
                    { label: 'Goal in progress', value: metrics.inProgress.toString(), trend: '0%' },
                    { label: 'Installments paid', value: metrics.installments.toString(), trend: '0%' },
                    { label: 'One time paid', value: metrics.oneTime.toString(), trend: '0%' },
                ].map((item, index) => (
                    <View key={index} style={styles.gridItem}>
                        <View style={styles.gridItemTop}>
                            <Text style={styles.gridItemValue}>{item.value}</Text>
                            <View style={styles.trendBadge}>
                                <Ionicons name="arrow-up" size={12} color="#425BA4" />
                                <Text style={styles.trendText}>{item.trend}</Text>
                            </View>
                        </View>
                        <Text style={styles.gridItemLabel}>{item.label}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Recent Activity</Text>
                <Text style={styles.recentSubtitle}>Top Spending</Text>

                {filteredOrders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No spending activity found for this period.</Text>
                    </View>
                ) : (
                    filteredOrders.slice(0, 5).map((order, i) => (
                        <TouchableOpacity key={order.order_id} style={styles.activityItem}>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityName} numberOfLines={1}>
                                    {order.items[0]?.name || 'Shopping Order'}
                                </Text>
                                <Text style={styles.activityMeta}>
                                    {format(new Date(order.created_at), 'd MMM')} • Tzs {order.totals.total.toLocaleString()}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#1F2937" />
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </View>
    );

    const renderCategoryInsight = () => (
        <View style={styles.tabContent}>
            <View style={styles.categoryHeader}>
                <Text style={styles.categoryDate}>{dateFilter}</Text>
                <Text style={styles.categoryTotal}>TZS {metrics.totalSpending.toLocaleString()}</Text>
                <View style={styles.periodGrowth}>
                    <Ionicons name="arrow-up" size={14} color="#425BA4" />
                    <Text style={styles.growthText}>0% from previous period</Text>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <Svg width={220} height={220} viewBox="0 0 200 200">
                    <G rotation="-90" origin="100, 100">
                        {categoryArray.length === 0 ? (
                            <Circle cx="100" cy="100" r="80" stroke="#F3F4F6" strokeWidth="24" fill="transparent" />
                        ) : (
                            (() => {
                                let cumulativePercent = 0;
                                return categoryArray.map((cat, i) => {
                                    const strokeDasharray = `${(cat.percentage * 502) / 100} 502`;
                                    const strokeDashoffset = -(cumulativePercent * 502) / 100;
                                    cumulativePercent += cat.percentage;
                                    return (
                                        <Circle
                                            key={i}
                                            cx="100"
                                            cy="100"
                                            r="80"
                                            stroke={cat.color}
                                            strokeWidth="24"
                                            strokeDasharray={strokeDasharray}
                                            strokeDashoffset={strokeDashoffset}
                                            fill="transparent"
                                        />
                                    );
                                });
                            })()
                        )}
                    </G>
                    <SvgText x="100" y="105" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111827">
                        TZS {metrics.totalSpending.toLocaleString()}
                    </SvgText>
                </Svg>

                <View style={styles.legend}>
                    {categoryArray.slice(0, 3).map((cat, i) => (
                        <View key={i} style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: cat.color }]} />
                            <Text style={styles.legendText}>{cat.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.trendSection}>
                <Text style={styles.trendTitle}>MONTHLY TREND</Text>
                <View style={styles.barChart}>
                    {trendData.map((hValue, i) => {
                        const h = (hValue / maxTrend) * 120;
                        return (
                            <View key={i} style={styles.barContainer}>
                                <View style={[styles.bar, { height: Math.max(h, 4), backgroundColor: hValue > 0 ? '#425BA4' : '#F3F4F6' }]} />
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );

    const startDate = subDays(new Date(), DATE_OPTIONS.find(opt => opt.label === dateFilter)?.days || 30);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Spending Activities</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#425BA4" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Tabs */}
                    <View style={styles.tabsWrapper}>
                        <View style={styles.tabsContainer}>
                            <TouchableOpacity 
                                style={[styles.tab, activeTab === 'Top' && styles.activeTab]}
                                onPress={() => setActiveTab('Top')}
                            >
                                <Text style={[styles.tabText, activeTab === 'Top' && styles.activeTabText]}>Top Insight</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.tab, activeTab === 'Category' && styles.activeTab]}
                                onPress={() => setActiveTab('Category')}
                            >
                                <Text style={[styles.tabText, activeTab === 'Category' && styles.activeTabText]}>Category Inisght</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Date Filter */}
                    <View style={styles.filterRow}>
                        <TouchableOpacity 
                            style={styles.datePicker}
                            onPress={() => setIsPickerVisible(true)}
                        >
                            <Text style={styles.datePickerText}>{dateFilter}</Text>
                            <Ionicons name="chevron-down" size={16} color="#1F2937" />
                        </TouchableOpacity>
                        <Text style={styles.dateRange}>
                            {format(startDate, 'd MMM')} - {format(new Date(), 'd MMM')}
                        </Text>
                    </View>

                    {activeTab === 'Top' ? renderTopInsight() : renderCategoryInsight()}
                </ScrollView>
            )}

            {/* Date Picker Modal */}
            <Modal
                visible={isPickerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsPickerVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsPickerVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.pickerContent}>
                            <Text style={styles.pickerTitle}>Select Time Range</Text>
                            {DATE_OPTIONS.map((option) => (
                                <TouchableOpacity 
                                    key={option.label}
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setDateFilter(option.label);
                                        setIsPickerVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.pickerItemText,
                                        dateFilter === option.label && styles.activePickerText
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {dateFilter === option.label && (
                                        <Ionicons name="checkmark" size={20} color="#425BA4" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    tabsWrapper: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
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
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 20,
    },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    datePickerText: {
        fontSize: 13,
        color: '#1F2937',
    },
    dateRange: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    tabContent: {
        paddingHorizontal: 20,
    },
    monthlyCard: {
        backgroundColor: '#425BA4',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    cardHeaderText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    dateBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    dateBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    mainStatsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    mainStatBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 16,
    },
    mainStatLabel: {
        color: '#E0E7FF',
        fontSize: 12,
        marginBottom: 8,
    },
    mainStatValue: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    gridItem: {
        width: (width - 52) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    gridItemTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    gridItemValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 2,
    },
    trendText: {
        fontSize: 11,
        color: '#425BA4',
        fontWeight: '700',
    },
    gridItemLabel: {
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '500',
    },
    recentSection: {
        marginBottom: 40,
    },
    recentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    recentSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
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
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    activityMeta: {
        fontSize: 12,
        color: '#6B7280',
    },
    // Category Insight Styles
    categoryHeader: {
        marginBottom: 32,
    },
    categoryDate: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    categoryTotal: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    periodGrowth: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    growthText: {
        fontSize: 13,
        color: '#6B7280',
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
        marginTop: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        color: '#1F2937',
        fontWeight: '500',
    },
    trendSection: {
        marginBottom: 40,
    },
    trendTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 20,
        letterSpacing: 1,
    },
    barChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 120,
    },
    barContainer: {
        width: '5%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: 10,
        borderRadius: 5,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    pickerContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
        textAlign: 'center',
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    pickerItemText: {
        fontSize: 16,
        color: '#4B5563',
    },
    activePickerText: {
        color: '#425BA4',
        fontWeight: 'bold',
    }
});
