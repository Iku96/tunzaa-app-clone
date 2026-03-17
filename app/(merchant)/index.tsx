import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, LayoutGrid, PlusSquare, MoreHorizontal, Calendar, Maximize2 } from 'lucide-react-native';

// Import our cohesive sidebar menu
import SidebarMenu from '../../src/components/merchant/SidebarMenu';

import { useMerchantPulse, PulseOrder } from '../../src/hooks/useMerchantPulse';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { orderApi } from '../../src/services/orders';
import { getAccessToken } from '../../src/utils/storage';
import { API_CONFIG } from '../../src/services/config';
import { 
    useGetVendorGMV, 
    useGetTopPerformingProducts,
    useGetOrderStatusDistribution 
} from '../../src/services/reports';

export default function MerchantDashboardScreen() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [apiTestResult, setApiTestResult] = useState<string | null>(null);
    const [apiTestLoading, setApiTestLoading] = useState(false);

    // Auth context - for debugging
    const { user, isAuthenticated, isLoading: authLoading } = useTunzaaAuth();
    const vendorProfile = user?.profiles?.find((p) => p.role === 'vendor');

    // Redirect if authenticated but no vendor profile
    React.useEffect(() => {
        if (!authLoading && isAuthenticated && !vendorProfile) {
            console.log('⚠️ No vendor profile found, redirecting to onboarding...');
            router.replace('/(merchant)/onboarding/step-2');
        }
    }, [isAuthenticated, vendorProfile, authLoading]);

    // Server Data Integration
    const { orders, loading: pulseLoading, error: pulseError, refetch: refetchPulse } = useMerchantPulse();

    // Report Data Integration
    const vendorId = vendorProfile?.profile_id || '';
    const { 
        data: gmvData, 
        isLoading: gmvLoading, 
        refetch: refetchGMV 
    } = useGetVendorGMV(vendorId, !!vendorId);
    
    const { 
        data: topProductsData, 
        isLoading: productsLoading, 
        refetch: refetchProducts 
    } = useGetTopPerformingProducts(vendorId, !!vendorId);

    const {
        data: statusData,
        isLoading: statusLoading,
        refetch: refetchStatus
    } = useGetOrderStatusDistribution(vendorId, !!vendorId);

    // Derived Metrics from Server Data
    const vendorGmv = gmvData?.data?.[0];
    const totalPayments = vendorGmv?.['orders.total_revenue'] || 0;
    
    // Total orders count from GMV report
    const totalOrdersCount = vendorGmv?.['orders.count'] || 0;
    
    // Completed orders from status distribution
    const completedOrdersCount = statusData?.data?.find(s => s.status.toLowerCase() === 'completed')?.order_count || 0;

    // Sort orders by completion percentage (descending) and take top 10
    const almostCompletedOrders = [...orders]
        .map(o => ({
            ...o,
            percentage: o.total_amount > 0 ? (o.current_amount / o.total_amount) * 100 : 0
        }))
        .filter(o => o.percentage > 0 && o.percentage < 100) // Only in-progress
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);

    const topProducts = topProductsData?.data || [];

    const loading = pulseLoading || gmvLoading || productsLoading || statusLoading;

    const toggleSidebar = () => {
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };


    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Overlay Sidebar Menu */}
            <SidebarMenu isVisible={isSidebarOpen} onClose={closeSidebar} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>


                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBtn} onPress={toggleSidebar}>
                        <LayoutGrid size={24} color="#111827" />
                    </TouchableOpacity>

                    <View style={styles.headerRightRow}>
                        <TouchableOpacity 
                            style={styles.headerBtn}
                            onPress={() => router.push('/(merchant)/add-product')}
                        >
                            <PlusSquare size={24} color="#111827" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.headerBtn}
                            onPress={() => router.push('/(merchant)/settings')}
                        >
                            <MoreHorizontal size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date Selection Row */}
                <View style={styles.dateSectionContainer}>
                    <View style={styles.dateRow}>
                        <TouchableOpacity style={styles.datePill}>
                            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.dateText}>
                                {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.dateDash}>-</Text>

                        <TouchableOpacity style={styles.datePill}>
                            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.dateText}>
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.reportText}>
                        Report : {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} - {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </Text>
                </View>

                {/* Main Blue Payments Card */}
                <View style={styles.mainBlueCard}>
                    <Text style={styles.mainCardSubtitle}>Total Payments Received</Text>
                    <Text style={styles.mainCardTitle}>
                        Tsh.{totalPayments.toLocaleString()}
                    </Text>

                    <TouchableOpacity 
                        style={styles.historyButton}
                        onPress={() => router.push('/(merchant)/live-orders')}
                    >
                        <Text style={styles.historyButtonText}>View Transaction History</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary Row */}
                <View style={styles.summaryRow}>
                    {/* Orders Placed */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summarySubtitle}>Total Orders Placed</Text>
                        <Text style={styles.summaryTitle}>{loading ? '-' : totalOrdersCount}</Text>
                        <TouchableOpacity 
                            style={styles.viewDetailsBtn}
                            onPress={() => router.push('/(merchant)/live-orders')}
                        >
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Completed Orders */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summarySubtitle}>Total Completed Orders</Text>
                        <Text style={styles.summaryTitle}>{loading ? '-' : completedOrdersCount}</Text>
                        <TouchableOpacity 
                            style={styles.viewDetailsBtn}
                            onPress={() => router.push('/(merchant)/live-orders')}
                        >
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Almost Completed List */}
                <View style={styles.listContainer}>
                    {/* List Header */}
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeaderTitle}>
                            {almostCompletedOrders.length} {almostCompletedOrders.length === 1 ? 'Order' : 'Orders'} Almost Completed
                        </Text>
                        <TouchableOpacity style={styles.expandIconBtn}>
                            <Maximize2 size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Table Headers */}
                    <View style={styles.tableHeadRow}>
                        <Text style={[styles.tableHeadText, { flex: 2 }]}>Product Name</Text>
                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Orders</Text>
                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>Percentage</Text>
                    </View>

                    {/* Table Rows */}
                    {pulseLoading ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#6B7280' }}>Loading orders...</Text>
                        </View>
                    ) : almostCompletedOrders.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#6B7280' }}>No active orders found.</Text>
                        </View>
                    ) : (
                        almostCompletedOrders.map((item, index) => (
                            <View key={item.id} style={[
                                styles.tableRow,
                                index !== almostCompletedOrders.length - 1 && styles.tableRowBorder
                            ]}>
                                <Text style={[styles.tableRowText, { flex: 2 }]} numberOfLines={1}>
                                    {item.product?.title || 'Unknown Product'}
                                </Text>
                                <Text style={[styles.tableRowText, { flex: 1, textAlign: 'center' }]}>
                                    {item.product?.quantity || 1}
                                </Text>
                                <Text style={[styles.tableRowText, { flex: 1, textAlign: 'right', color: '#111827' }]}>
                                    {item.percentage.toFixed(0)}%
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Best-Selling Products List */}
                <View style={styles.listContainer}>
                    {/* List Header */}
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeaderTitle}>Best-Selling Products</Text>
                        <TouchableOpacity style={styles.expandIconBtn}>
                            <Maximize2 size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Table Headers */}
                    <View style={styles.tableHeadRow}>
                        <Text style={[styles.tableHeadText, { flex: 2.5 }]}>Product Name</Text>
                        <Text style={[styles.tableHeadText, { flex: 1.5, textAlign: 'right' }]}>Total Orders</Text>
                    </View>

                    {/* Table Rows */}
                    {productsLoading ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#6B7280' }}>Loading reports...</Text>
                        </View>
                    ) : topProducts.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#6B7280' }}>No product data found.</Text>
                        </View>
                    ) : (
                        topProducts.map((item, index) => (
                            <View key={item.product_id} style={[
                                styles.tableRow,
                                index !== topProducts.length - 1 && styles.tableRowBorder
                            ]}>
                                <View style={{ flex: 2.5, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.rankText, { marginRight: 15 }]}>{index + 1}</Text>
                                    <Text style={styles.tableRowText} numberOfLines={1}>
                                        {item.product_name}
                                    </Text>
                                </View>
                                <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'right' }]}>
                                    {item.order_count.toLocaleString()}
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        marginBottom: 10,
    },
    headerBtn: {
        padding: 8,
    },
    headerRightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // Using gap to spread right icons
    },
    dateSectionContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
        paddingRight: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    dateText: {
        fontSize: 12,
        color: '#111827',
        fontWeight: '500',
    },
    dateDash: {
        marginHorizontal: 12,
        color: '#111827',
        fontWeight: '500',
    },
    reportText: {
        fontSize: 10,
        color: '#6B7280',
    },
    mainBlueCard: {
        backgroundColor: '#425BA4', // Tunzaa blueish hue
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    mainCardSubtitle: {
        color: '#E0E7FF',
        fontSize: 14,
        marginBottom: 12,
    },
    mainCardTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    historyButton: {
        borderWidth: 1,
        borderColor: '#93A5CF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
    },
    historyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        alignItems: 'center',
    },
    summarySubtitle: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    viewDetailsBtn: {
        backgroundColor: '#01AC00', // Tunzaa Green
        borderRadius: 8,
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    viewDetailsText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    listContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20,
    },
    listHeader: {
        backgroundColor: '#425BA4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    listHeaderTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    expandIconBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableHeadRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tableHeadText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    tableRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tableRowText: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '500',
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#425BA4', // Ranking numbers in brand blue
        width: 20,
    }
});
