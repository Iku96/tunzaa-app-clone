import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, Filter, Search } from 'lucide-react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useGetOrderStatusDistribution } from '../../src/services/reports';
import { orderApi, Order } from '../../src/services/orders';
import { useQuery } from '@tanstack/react-query';

const { width } = Dimensions.get('window');

type OrderFilter = 'Completed' | 'Installments' | 'Pending';

export default function OrdersAndSalesScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const [activeFilter, setActiveFilter] = useState<OrderFilter>('Completed');
    
    // Get vendor profile 
    const vendorProfile = user?.profiles?.find(p => p.role === 'vendor' || p.role === 'business') as any;
    const vendorId = vendorProfile?.metadata?.vendor_id || vendorProfile?.vendor_id;

    // Fetch Distribution
    const { data: distributionData, isLoading: distLoading } = useGetOrderStatusDistribution(vendorId);

    // Fetch Orders
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['vendorOrders', vendorId, activeFilter],
        queryFn: () => orderApi.getVendorOrders({
            vendor_id: vendorId,
            status: activeFilter === 'Completed' ? 'delivered' : activeFilter === 'Pending' ? 'pending' : undefined,
            limit: 10
        }),
        enabled: !!vendorId
    });

    // Process Distribution for Chart
    const stats = {
        completed: 0,
        installments: 0,
        pending: 0,
        total: 0
    };

    distributionData?.data.forEach(item => {
        const count = item.order_count || 0;
        stats.total += count;
        if (item.status === 'delivered') stats.completed += count;
        else if (item.status === 'pending') stats.pending += count;
        else stats.installments += count; // Default other to installments for now
    });

    // Donut Chart Logic
    const size = 200;
    const strokeWidth = 35;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const totalForPct = stats.total || 1;
    const completedPct = (stats.completed / totalForPct) * 100;
    const installmentsPct = (stats.installments / totalForPct) * 100;
    const pendingPct = (stats.pending / totalForPct) * 100;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders and sales</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Orders and sales Insight</Text>

                {/* Donut Chart */}
                <View style={styles.chartContainer}>
                    <Svg width={size} height={size}>
                        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                            {completedPct > 0 && (
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke="#01AC00"
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - (completedPct / 100) * circumference}
                                    fill="transparent"
                                />
                            )}
                            {installmentsPct > 0 && (
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke="#425BA4"
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - (installmentsPct / 100) * circumference}
                                    fill="transparent"
                                    rotation={(completedPct / 100) * 360}
                                    origin={`${size / 2}, ${size / 2}`}
                                />
                            )}
                            {pendingPct > 0 && (
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke="#FF4D4D"
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - (pendingPct / 100) * circumference}
                                    fill="transparent"
                                    rotation={((completedPct + installmentsPct) / 100) * 360}
                                    origin={`${size / 2}, ${size / 2}`}
                                />
                            )}
                        </G>
                    </Svg>
                    
                    <View style={styles.chartCenterTextContainer}>
                        <Text style={styles.chartCenterNumber}>{stats.total}</Text>
                        <Text style={styles.chartCenterLabel}>Total Orders Placed on Your Store</Text>
                        <Text style={styles.chartCenterDate}>Summary</Text>
                    </View>
                </View>

                {/* Legend */}
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#01AC00' }]} />
                        <Text style={styles.legendText}>{stats.completed} Completed Orders</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#425BA4' }]} />
                        <Text style={styles.legendText}>{stats.installments} Installments orders</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#FF4D4D' }]} />
                        <Text style={styles.legendText}>{stats.pending} Pending Orders</Text>
                    </View>
                </View>

                {/* Filters Row */}
                <View style={styles.filtersWrapper}>
                    <TouchableOpacity style={styles.timeDropdown}>
                        <Text style={styles.timeText}>Last 10 days ago</Text>
                        <ChevronDown size={14} color="#6B7280" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                    
                    <Text style={styles.dateRangeText}>1 March - June 1</Text>
                </View>

                {/* Filter Selector */}
                <View style={styles.tableFilterHeader}>
                    <Text style={styles.filterByLabel}>Filter by order Type</Text>
                    <TouchableOpacity style={styles.typeDropdown}>
                        <Text style={styles.typeText}>{activeFilter} Orders</Text>
                        <ChevronDown size={14} color="#6B7280" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>

                {/* Quick Tabs (Alternative to dropdown as seen in Figma) */}
                <View style={styles.tabsRow}>
                    {(['Completed', 'Installments', 'Pending'] as OrderFilter[]).map((tab) => (
                        <TouchableOpacity 
                            key={tab} 
                            onPress={() => setActiveFilter(tab)}
                            style={[styles.tab, activeFilter === tab && styles.activeTab]}
                        >
                            <Text style={[styles.tabText, activeFilter === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Table */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Order Number</Text>
                        <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'center' }]}>Product name</Text>
                        <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>
                            {activeFilter === 'Completed' ? 'Total Price' : activeFilter === 'Installments' ? 'Status' : 'Order State'}
                        </Text>
                    </View>

                    {ordersLoading ? (
                        <ActivityIndicator color="#425BA4" style={{ margin: 20 }} />
                    ) : ordersData?.items.length === 0 ? (
                        <Text style={{ textAlign: 'center', margin: 20, color: '#9CA3AF' }}>No orders found</Text>
                    ) : (
                        ordersData?.items.map((item, index) => (
                            <View key={item.order_id} style={[styles.tableRow, index % 2 === 1 && styles.alternateRow]}>
                                <Text style={[styles.tableRowText, { flex: 1 }]}>#{item.order_number.slice(-5)}</Text>
                                <Text style={[styles.tableRowText, { flex: 2, textAlign: 'center' }]} numberOfLines={1}>
                                    {item.items[0]?.name || 'Unknown'}
                                </Text>
                                <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'right' }]}>
                                    {activeFilter === 'Completed' ? `${item.totals.total.toLocaleString()}/=` : item.status}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 24,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 220,
        marginBottom: 20,
        position: 'relative',
    },
    chartCenterTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 140,
    },
    chartCenterNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
    },
    chartCenterLabel: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
    },
    chartCenterDate: {
        fontSize: 9,
        color: '#9CA3AF',
        marginTop: 4,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 30,
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 10,
        color: '#111827',
        fontWeight: '500',
    },
    filtersWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    timeText: {
        fontSize: 12,
        color: '#6B7280',
    },
    dateRangeText: {
        fontSize: 11,
        color: '#6B7280',
    },
    tableFilterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterByLabel: {
        fontSize: 13,
        color: '#374151',
        marginRight: 10,
    },
    typeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    typeText: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '500',
    },
    tabsRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 8,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    activeTab: {
        backgroundColor: '#425BA4',
    },
    tabText: {
        fontSize: 12,
        color: '#6B7280',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    tableContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#F9FAFB',
    },
    tableHeaderText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    alternateRow: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth:1,
        borderBottomColor: '#F3F4F6',
    },
    tableRowText: {
        fontSize: 12,
        color: '#111827',
        fontWeight: '500',
    }
});
