import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    ChevronDown, 
    ChevronRight,
    TrendingUp
} from 'lucide-react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { useGetVendorOrders } from '../../../src/services/orders';
import { useGetVendorGMV, useGetDailyGMVPerformance } from '../../../src/services/reports';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

const { width } = Dimensions.get('window');

type TabType = 'top' | 'category';

export default function SpendingActivityScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth() as any;
    const [activeTab, setActiveTab] = useState<TabType>('top');
    const [timeRange, setTimeRange] = useState('Last 30 days ago');
    const [isRangeOpen, setIsRangeOpen] = useState(false);

    // Extract vendor ID
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business') || {};
    const vendorId = vendorProfile?.metadata?.vendor_id || vendorProfile?.vendor_id || vendorProfile?.profile_id;

    // Fetch dynamic data
    const { data: gmvData, isLoading: isGMVLoading } = useGetVendorGMV(vendorId, !!vendorId);
    const { data: dailyPerformance, isLoading: isPerfLoading } = useGetDailyGMVPerformance(vendorId, !!vendorId && activeTab === 'category');
    const { data: vendorOrders, isLoading: isOrdersLoading } = useGetVendorOrders({ vendor_id: vendorId, limit: 10 }, !!vendorId);

    const vendorStats = gmvData?.data?.[0] || {
        "orders.count": 0,
        "orders.total_revenue": 0,
        "orders.avg_order_value": 0
    };

    const isLoading = isGMVLoading || isOrdersLoading;

    // Formatted Dates for display (matches mockup "1 Aug - 31 Aug")
    const dateRangeLabel = useMemo(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const format = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        
        if (timeRange === 'Today') return format(now);
        if (timeRange === 'Last 7 days') {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return `${format(sevenDaysAgo)} - ${format(now)}`;
        }
        
        return `${format(firstDay)} - ${format(lastDay)}`;
    }, [timeRange]);

    const handleRangeSelect = (range: string) => {
        setTimeRange(range);
        setIsRangeOpen(false);
    };

    const StatCard = ({ title, value, percentage }: { title: string, value: string | number, percentage: string }) => (
        <View style={styles.statCard}>
            <View style={styles.statTopRow}>
                <Text style={styles.statValue}>{value}</Text>
                <View style={styles.percentageBadge}>
                    <TrendingUp size={12} color="#3A5BA9" />
                    <Text style={styles.percentageText}>{percentage}</Text>
                </View>
            </View>
            <Text style={styles.statLabel}>{title}</Text>
        </View>
    );

    const renderTopInsight = () => (
        <View style={styles.tabContent}>
            {/* Monthly Overview Card */}
            <View style={styles.overviewCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Monthly Overview</Text>
                    <View style={styles.monthTag}>
                        <Text style={styles.monthTagText}>
                            {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.overviewRows}>
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Total Spending</Text>
                        <Text style={styles.overviewValue}>
                            Tzs {vendorStats['orders.total_revenue']?.toLocaleString() || '0'}
                        </Text>
                    </View>
                    <View style={styles.overviewItem}>
                        <Text style={styles.overviewLabel}>Avg. Daily Usage</Text>
                        <Text style={styles.overviewValue}>
                            Tzs {(vendorStats['orders.avg_order_value'] / 30)?.toFixed(0).toLocaleString() || '0'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Grid Stats */}
            <View style={styles.statsGrid}>
                <StatCard title="Completed goals" value={vendorStats['orders.count'] || 0} percentage="20%" />
                <StatCard title="Goal in progress" value="0" percentage="0%" />
                <StatCard title="Installments paid" value="0" percentage="0%" />
                <StatCard title="One time paid" value="0" percentage="0%" />
            </View>

            {/* Recent Activity */}
            <View style={styles.recentSection}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <Text style={styles.sectionSubtitle}>Top Spending</Text>
                
                {isLoading ? (
                    <ActivityIndicator size="small" color="#3A5BA9" style={{ marginTop: 20 }} />
                ) : vendorOrders?.items && vendorOrders.items.length > 0 ? (
                    vendorOrders.items.map((order: any) => (
                        <TouchableOpacity key={order.order_id} style={styles.spendingItem}>
                            <View style={styles.spendingInfo}>
                                <Text style={styles.spendingName}>{order.items[0]?.name || 'Unknown Product'}</Text>
                                <Text style={styles.spendingDate}>
                                    {new Date(order.created_at).toLocaleDateString()} • Tsh {order.totals.total.toLocaleString()}
                                </Text>
                            </View>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyActivity}>
                        <Text style={styles.emptyActivityText}>No recent activity yet</Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderCategoryInsight = () => {
        const radius = 70;
        const strokeWidth = 30;
        const center = radius + strokeWidth;
        const circumference = 2 * Math.PI * radius;
        
        // Use real category breakdown if available, else zero-state
        const data = [
            { label: 'Electronics', color: '#01AC00', percent: 0 },
            { label: 'Services', color: '#6B7280', percent: 0 },
            { label: 'Home Appliances', color: '#C23A22', percent: 0 },
        ];

        let currentOffset = 0;

        return (
            <View style={styles.tabContent}>
                <View style={styles.periodSummary}>
                    <Text style={styles.periodLabel}>Last 30 days</Text>
                    <Text style={styles.periodValue}>
                        TZS {vendorStats['orders.total_revenue']?.toLocaleString() || '0'}
                    </Text>
                    <View style={styles.periodGrowth}>
                        <TrendingUp size={14} color="#3A5BA9" />
                        <Text style={styles.growthText}>0% from previous period</Text>
                    </View>
                </View>

                {/* Donut Chart */}
                <View style={styles.chartContainer}>
                    <Svg width={center * 2} height={center * 2}>
                        <G rotation="-90" origin={`${center}, ${center}`}>
                            {/* Gray background circle for 0 state */}
                            <Circle
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke="#F3F4F6"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                            />
                            {data.map((item, index) => {
                                if (item.percent === 0) return null;
                                const strokeDashoffset = circumference - (item.percent / 100) * circumference;
                                const rotation = (currentOffset / 100) * 360;
                                currentOffset += item.percent;
                                return (
                                    <Circle
                                        key={index}
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        stroke={item.color}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        transform={`rotate(${rotation}, ${center}, ${center})`}
                                        fill="transparent"
                                    />
                                );
                            })}
                        </G>
                    </Svg>
                    <View style={styles.chartCenterText}>
                        <Text style={styles.chartAmount}>
                            TZS {vendorStats['orders.total_revenue']?.toLocaleString() || '0'}
                        </Text>
                    </View>
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    {data.map((item) => (
                        <View key={item.label} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                            <Text style={styles.legendLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Monthly Trend */}
                <View style={styles.trendSection}>
                    <Text style={styles.trendTitle}>MONTHLY TREND</Text>
                    {isPerfLoading ? (
                        <ActivityIndicator size="small" color="#3A5BA9" />
                    ) : (
                        <View style={styles.barChart}>
                            {/* Render bars based on gmv performance or empty state */}
                            {(dailyPerformance?.data?.slice(-10) || Array(10).fill({ daily_gmv: 0 })).map((h: any, i: number) => {
                                const height = Math.min(100, (h.daily_gmv / (vendorStats['orders.total_revenue'] || 1)) * 100) || 5;
                                return (
                                    <View key={i} style={styles.barContainer}>
                                        <View style={[styles.bar, { height: height }]} />
                                        <View style={styles.barBg} />
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Spending Activities</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Segmented Tab Bar (Pill Style from Mockup) */}
            <View style={styles.tabBarContainer}>
                <View style={styles.segmentedTabBar}>
                    <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'top' && styles.activeTabItem]}
                        onPress={() => setActiveTab('top')}
                    >
                        <Text style={[styles.tabText, activeTab === 'top' && styles.activeTabText]}>Top Insight</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'category' && styles.activeTabItem]}
                        onPress={() => setActiveTab('category')}
                    >
                        <Text style={[styles.tabText, activeTab === 'category' && styles.activeTabText]}>Category Inisght</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Filter Section */}
                <View style={styles.filterSection}>
                    <TouchableOpacity 
                        style={styles.rangeSelector}
                        onPress={() => setIsRangeOpen(true)}
                    >
                        <Text style={styles.rangeText}>{timeRange}</Text>
                        <ChevronDown size={18} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.rangeDates}>{dateRangeLabel}</Text>
                </View>

                {activeTab === 'top' ? renderTopInsight() : renderCategoryInsight()}
            </ScrollView>

            <Modal
                visible={isRangeOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsRangeOpen(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setIsRangeOpen(false)}
                >
                    <View style={styles.modalContent}>
                        {['Today', 'Last 7 days', 'Last 30 days ago'].map((range) => (
                            <TouchableOpacity 
                                key={range} 
                                style={styles.modalItem}
                                onPress={() => handleRangeSelect(range)}
                            >
                                <Text style={[styles.modalItemText, timeRange === range && styles.activeModalItemText]}>{range}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
    },
    tabBarContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    segmentedTabBar: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    tabItem: {
        flex: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTabItem: {
        backgroundColor: '#425BA4',
    },
    tabText: {
        fontSize: 15,
        color: '#4B5563',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    filterSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    rangeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        gap: 8,
    },
    rangeText: {
        fontSize: 14,
        color: '#6B7280',
    },
    rangeDates: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    tabContent: {
        paddingHorizontal: 20,
    },
    overviewCard: {
        backgroundColor: '#425BA4',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '400',
    },
    monthTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    monthTagText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    overviewRows: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    overviewItem: {
        flex: 1,
    },
    overviewLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
        marginBottom: 10,
    },
    overviewValue: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 52) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    statTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    percentageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    percentageText: {
        fontSize: 11,
        color: '#3A5BA9',
        fontWeight: 'bold',
        marginLeft: 2,
    },
    statLabel: {
        fontSize: 13,
        color: '#4B5563',
    },
    recentSection: {
        marginTop: 10,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 20,
    },
    spendingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    spendingInfo: {
        flex: 1,
    },
    spendingName: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
        marginBottom: 4,
    },
    spendingDate: {
        fontSize: 13,
        color: '#6B7280',
    },
    emptyActivity: {
        padding: 40,
        alignItems: 'center',
    },
    emptyActivityText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    periodSummary: {
        marginBottom: 30,
    },
    periodLabel: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 10,
    },
    periodValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 10,
    },
    periodGrowth: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    growthText: {
        fontSize: 13,
        color: '#6B7280',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        position: 'relative',
    },
    chartCenterText: {
        position: 'absolute',
        alignItems: 'center',
    },
    chartAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 20,
        marginVertical: 40,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendLabel: {
        fontSize: 13,
        color: '#4B5563',
    },
    trendSection: {
        paddingBottom: 40,
    },
    trendTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#9CA3AF',
        marginBottom: 30,
        letterSpacing: 1,
    },
    barChart: {
        flexDirection: 'row',
        height: 160,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
        position: 'relative',
        marginHorizontal: 3,
    },
    bar: {
        width: 14,
        backgroundColor: '#425BA4',
        borderRadius: 7,
        maxHeight: '100%',
        zIndex: 1,
    },
    barBg: {
        position: 'absolute',
        bottom: 0,
        width: 14,
        height: '100%',
        backgroundColor: '#F3F4F6',
        borderRadius: 7,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    modalItemText: {
        fontSize: 16,
        color: '#111827',
    },
    activeModalItemText: {
        color: '#425BA4',
        fontWeight: 'bold',
    }
});
