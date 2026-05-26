import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetUserOrders } from '@/src/services/orders';
import { useAuth } from '@/context/auth';
import { format, isSameMonth, subDays, isAfter, startOfDay, eachDayOfInterval, isSameDay } from 'date-fns';
import CalendarModal from '@/src/components/merchant/CalendarModal';
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';

export default function SpendingActivitiesScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'Top' | 'Category'>('Top');
    const [dateFilter, setDateFilter] = useState('Last 30 days');
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [customDate, setCustomDate] = useState<Date | null>(null);

    const { data: ordersData, isLoading } = useGetUserOrders(user?.id || '', { limit: 50 });
    const allOrders = ordersData?.items || [];

    // Filter orders based on selection
    const filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        
        if (customDate) {
            return format(orderDate, 'yyyy-MM-dd') === format(customDate, 'yyyy-MM-dd');
        }

        switch (dateFilter) {
            case 'Last 7 days':
                return isAfter(orderDate, startOfDay(subDays(now, 7)));
            case 'Last 30 days':
                return isAfter(orderDate, startOfDay(subDays(now, 30)));
            case 'Last 90 days':
                return isAfter(orderDate, startOfDay(subDays(now, 90)));
            default:
                return true;
        }
    });

    const orders = filteredOrders;

    // Calculate Monthly Metrics
    const now = new Date();
    const monthlyOrders = orders.filter(o => isSameMonth(new Date(o.created_at), now));
    const totalMonthlySpending = monthlyOrders.reduce((sum, o) => sum + o.totals.total, 0);
    const avgDailySpent = totalMonthlySpending > 0 ? totalMonthlySpending / now.getDate() : 0;

    // Calculate Grid Stats
    const completedGoals = orders.filter(o => o.status === 'completed' && o.payment_details.method === 'tunzaa').length;
    const goalsInProgress = orders.filter(o => (o.status === 'processing' || o.status === 'pending') && o.payment_details.method === 'tunzaa').length;
    const oneTimePaid = orders.filter(o => o.payment_details.method !== 'tunzaa' && o.status === 'completed').length;
    const totalInstallmentsPaidCount = orders.filter(o => o.payment_details.method === 'tunzaa' && o.status === 'completed').length; 

    // Category Breakdown Logic
    const categoryData: Record<string, { total: number, color: string }> = {};
    const COLORS = ['#425BA4', '#FBBF24', '#84CC16', '#EC4899', '#06B6D4', '#8B5CF6'];
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const categoryName = item.categories?.[0]?.name || 'Uncategorized';
            if (!categoryData[categoryName]) {
                categoryData[categoryName] = { 
                    total: 0, 
                    color: COLORS[Object.keys(categoryData).length % COLORS.length] 
                };
            }
            categoryData[categoryName].total += item.total;
        });
    });

    const categoryArray = Object.entries(categoryData).map(([name, data]) => ({
        name,
        ...data,
        percentage: totalMonthlySpending > 0 ? (data.total / totalMonthlySpending) * 100 : 0
    })).sort((a, b) => b.total - a.total);

    // Monthly Trend Data (Last 7 days for simplicity in chart)
    const trendDays = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
    });
    const trendData = trendDays.map(day => {
        const dayTotal = orders
            .filter(o => isSameDay(new Date(o.created_at), day))
            .reduce((sum, o) => sum + o.totals.total, 0);
        return {
            label: format(day, 'EEE'),
            value: dayTotal
        };
    });
    const maxTrendValue = Math.max(...trendData.map(d => d.value), 1000);

    // Recent Activity mapping
    const recentActivities = orders.slice(0, 5).map(order => ({
        id: order.order_id,
        title: order.items[0]?.name || 'Unknown Item',
        date: format(new Date(order.created_at), 'd MMM'),
        amount: order.totals.total.toLocaleString(),
        status: order.status
    }));

    const renderTopInsight = () => (
        <>
            {/* Monthly Overview Card */}
            <View style={styles.overviewCard}>
                <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Monthly Overview</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{format(now, 'MMM yyyy')}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCol}>
                        <Text style={styles.statLabel}>Total spending</Text>
                        <Text style={styles.statValue}>Tzs {totalMonthlySpending.toLocaleString()}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCol}>
                        <Text style={styles.statLabel}>Avg Daily spent</Text>
                        <Text style={styles.statValue}>Tzs {Math.round(avgDailySpent).toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {/* 2x2 Grid Stats */}
            <View style={styles.gridContainer}>
                {[
                    { label: 'Completed goals', value: completedGoals.toString(), trend: '+0%' },
                    { label: 'Goal in progress', value: goalsInProgress.toString(), trend: '+0%' },
                    { label: 'Installments paid', value: totalInstallmentsPaidCount.toString(), trend: '+0%' },
                    { label: 'One time paid', value: oneTimePaid.toString(), trend: '+0%' },
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

                {isLoading ? (
                    <Text style={styles.loadingText}>Loading activities...</Text>
                ) : recentActivities.length === 0 ? (
                    <Text style={styles.emptyText}>No recent spending activity found.</Text>
                ) : (
                    recentActivities.map((activity) => (
                        <TouchableOpacity key={activity.id} style={styles.activityItem} onPress={() => router.push(`/(buyer)/profile/activities/orders-payments`)}>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityName}>{activity.title}</Text>
                                <Text style={styles.activityMeta}>
                                    {activity.date} • Tzs {activity.amount}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </>
    );

    const renderCategoryInsight = () => (
        <View style={styles.categoryContainer}>
            {/* Donut Chart Section */}
            <View style={styles.chartCard}>
                <View style={styles.donutWrapper}>
                    <Svg width={200} height={200} viewBox="0 0 200 200">
                        <G rotation="-90" origin="100, 100">
                            {categoryArray.length === 0 ? (
                                <Circle
                                    cx="100"
                                    cy="100"
                                    r="70"
                                    stroke="#F3F4F6"
                                    strokeWidth="20"
                                    fill="transparent"
                                />
                            ) : (
                                (() => {
                                    let cumulativePercent = 0;
                                    return categoryArray.map((cat, i) => {
                                        const strokeDasharray = `${(cat.percentage * 440) / 100} 440`;
                                        const strokeDashoffset = - (cumulativePercent * 440) / 100;
                                        cumulativePercent += cat.percentage;
                                        return (
                                            <Circle
                                                key={i}
                                                cx="100"
                                                cy="100"
                                                r="70"
                                                stroke={cat.color}
                                                strokeWidth="20"
                                                strokeDasharray={strokeDasharray}
                                                strokeDashoffset={strokeDashoffset}
                                                fill="transparent"
                                            />
                                        );
                                    });
                                })()
                            )}
                        </G>
                        <SvgText
                            x="100"
                            y="95"
                            textAnchor="middle"
                            fontSize="12"
                            fill="#6B7280"
                        >
                            Total Spending
                        </SvgText>
                        <SvgText
                            x="100"
                            y="115"
                            textAnchor="middle"
                            fontSize="16"
                            fontWeight="bold"
                            fill="#111827"
                        >
                            {`Tzs ${totalMonthlySpending.toLocaleString()}`}
                        </SvgText>
                    </Svg>
                </View>

                {/* Spending Summary Text */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Total Tzs last 30 days</Text>
                    <View style={styles.summaryValueRow}>
                        <Text style={styles.summaryValue}>Tzs {totalMonthlySpending.toLocaleString()}</Text>
                        <View style={styles.growthBadge}>
                            <Text style={styles.growthText}>0% from previous period</Text>
                        </View>
                    </View>
                </View>

                {/* Legend */}
                <View style={styles.legendContainer}>
                    {categoryArray.map((cat, i) => (
                        <View key={i} style={styles.legendItem}>
                            <View style={styles.legendLeft}>
                                <View style={[styles.dot, { backgroundColor: cat.color }]} />
                                <Text style={styles.legendName}>{cat.name}</Text>
                            </View>
                            <Text style={styles.legendPercent}>{cat.percentage.toFixed(1)}%</Text>
                        </View>
                    ))}
                    {categoryArray.length === 0 && <Text style={styles.emptyLegend}>No category data</Text>}
                </View>
            </View>

            {/* Monthly Trend Section */}
            <View style={styles.trendCard}>
                <Text style={styles.trendTitle}>Monthly trend</Text>
                <View style={styles.barChartContainer}>
                    {trendData.map((d, i) => (
                        <View key={i} style={styles.barColumn}>
                            <View style={styles.barWrapper}>
                                <View 
                                    style={[
                                        styles.bar, 
                                        { height: `${(d.value / maxTrendValue) * 100}%` }
                                    ]} 
                                />
                            </View>
                            <Text style={styles.barLabel}>{d.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

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
                    <TouchableOpacity 
                        style={styles.dropdownBtn} 
                        onPress={() => setIsDropdownVisible(true)}
                    >
                        <Text style={styles.dropdownText}>{customDate ? format(customDate, 'MMM d, yyyy') : dateFilter}</Text>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.dateRangeText}>
                        {customDate ? 'Selected Date' : `${format(subDays(new Date(), dateFilter === 'Last 7 days' ? 7 : 30), 'd MMM')} - ${format(new Date(), 'd MMM')}`}
                    </Text>
                </View>

                {/* Dropdown Selection Modal */}
                <Modal
                    visible={isDropdownVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsDropdownVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setIsDropdownVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.dropdownMenu}>
                                {['Last 7 days', 'Last 30 days', 'Last 90 days', 'All time', 'Custom Range'].map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setIsDropdownVisible(false);
                                            if (item === 'Custom Range') {
                                                setIsCalendarVisible(true);
                                            } else {
                                                setDateFilter(item);
                                                setCustomDate(null);
                                            }
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            (dateFilter === item && !customDate) && styles.activeDropdownItemText
                                        ]}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <CalendarModal 
                    isVisible={isCalendarVisible}
                    onClose={() => setIsCalendarVisible(false)}
                    onSelectDate={(date) => {
                        setCustomDate(date);
                        setDateFilter('Custom');
                        setIsCalendarVisible(false);
                    }}
                />

                {activeTab === 'Top' ? renderTopInsight() : renderCategoryInsight()}
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
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
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
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#FFFFFF33',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
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
        height: 40,
        backgroundColor: '#FFFFFF33',
        marginHorizontal: 16,
    },
    statLabel: {
        color: '#E0E7FF',
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 20,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    gridHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 12,
    },
    gridValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#425BA4',
        marginRight: 8,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
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
        marginBottom: 40,
    },
    recentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    recentSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 16,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
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
    activityMeta: {
        fontSize: 12,
        color: '#6B7280',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#6B7280',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownMenu: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#374151',
    },
    activeDropdownItemText: {
        color: '#425BA4',
        fontWeight: 'bold',
    },
    // Category Insight Styles
    categoryContainer: {
        marginBottom: 40,
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    donutWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    summaryContainer: {
        marginBottom: 24,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    growthBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    growthText: {
        fontSize: 10,
        color: '#6B7280',
    },
    legendContainer: {
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    legendName: {
        fontSize: 13,
        color: '#374151',
    },
    legendPercent: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '500',
    },
    emptyLegend: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontStyle: 'italic',
        marginTop: 10,
    },
    trendCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    trendTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 20,
    },
    barChartContainer: {
        flexDirection: 'row',
        height: 150,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    barColumn: {
        alignItems: 'center',
        width: '12%',
    },
    barWrapper: {
        height: '100%',
        width: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    bar: {
        width: '100%',
        backgroundColor: '#425BA4',
        borderRadius: 4,
    },
    barLabel: {
        fontSize: 10,
        color: '#9CA3AF',
    },
});
