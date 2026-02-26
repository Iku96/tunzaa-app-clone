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

export default function MerchantDashboardScreen() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const [apiTestResult, setApiTestResult] = useState<string | null>(null);
    const [apiTestLoading, setApiTestLoading] = useState(false);

    // Auth context - for debugging
    const { user, isAuthenticated } = useTunzaaAuth();
    const vendorProfile = user?.profiles?.find((p) => p.role === 'vendor');

    // Server Data Integration
    const { orders, loading, error, newPaymentAlert, refetch } = useMerchantPulse();

    // Direct API test - bypasses the hook to isolate issues
    const testApiConnection = async () => {
        setApiTestLoading(true);
        setApiTestResult(null);
        try {
            // Step 1: Check token
            const token = await getAccessToken();
            if (!token) {
                setApiTestResult('❌ STEP 1 FAIL: No access token in storage. You need to log in first.');
                setApiTestLoading(false);
                return;
            }
            setApiTestResult(`✅ Step 1: Token found (${token.substring(0, 20)}...)`);

            // Step 2: Check vendor ID
            if (!vendorProfile?.profile_id) {
                setApiTestResult(prev => prev + `\n❌ STEP 2 FAIL: No vendor profile found. Profiles: ${JSON.stringify(user?.profiles?.map(p => p.role))}`);
                setApiTestLoading(false);
                return;
            }
            setApiTestResult(prev => prev + `\n✅ Step 2: Vendor ID = ${vendorProfile.profile_id}`);

            // Step 3: Make the actual API call
            const url = `${API_CONFIG.BASE_URL}/orders/vendor/${vendorProfile.profile_id}/orders?limit=5`;
            setApiTestResult(prev => prev + `\n⏳ Step 3: Calling ${url}`);

            const response = await orderApi.getVendorOrders({
                vendor_id: vendorProfile.profile_id,
                limit: 5
            });

            setApiTestResult(prev => prev + `\n✅ Step 3: Response received!` +
                `\n   Type: ${typeof response}` +
                `\n   Keys: ${response ? Object.keys(response).join(', ') : 'null'}` +
                `\n   Items: ${Array.isArray(response?.items) ? response.items.length + ' orders' : 'NOT AN ARRAY: ' + typeof response?.items}` +
                `\n   Total: ${response?.total ?? 'N/A'}` +
                `\n   Raw (first 300): ${JSON.stringify(response).substring(0, 300)}`);

        } catch (e: any) {
            const errMsg = e?.message || String(e);
            const apiErr = (e as any)?.apiError;
            setApiTestResult(prev => (prev || '') +
                `\n❌ STEP 3 FAIL: ${errMsg}` +
                (apiErr ? `\n   API Error: ${JSON.stringify(apiErr)}` : '') +
                `\n   Full: ${JSON.stringify(e).substring(0, 300)}`);
        } finally {
            setApiTestLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Derived Metrics from Server Data
    const totalPayments = orders.reduce((sum, order) => sum + (order.current_amount || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.current_amount >= o.total_amount).length;

    // Sort orders by completion percentage (descending) and take top 10
    const almostCompletedOrders = [...orders]
        .map(o => ({
            ...o,
            percentage: o.total_amount > 0 ? (o.current_amount / o.total_amount) * 100 : 0
        }))
        .filter(o => o.percentage > 0 && o.percentage < 100) // Only in-progress
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);


    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Overlay Sidebar Menu */}
            <SidebarMenu isVisible={isSidebarOpen} onClose={closeSidebar} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ===== DEBUG BANNER (tap to toggle) ===== */}
                <TouchableOpacity
                    onPress={() => setShowDebug(!showDebug)}
                    style={{ backgroundColor: '#1E293B', borderRadius: 8, padding: 12, marginBottom: 10 }}
                >
                    <Text style={{ color: '#FBBF24', fontWeight: 'bold', fontSize: 13 }}>{'🔍 DATA DEBUG'} {showDebug ? '(tap to hide)' : '(tap to show)'}</Text>
                    {showDebug && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={{ color: '#FFF', fontSize: 11 }}>Auth: {isAuthenticated ? '✅ Logged in' : '❌ NOT logged in'}</Text>
                            <Text style={{ color: '#FFF', fontSize: 11 }}>User ID: {user?.id || user?.user_id || 'null'}</Text>
                            <Text style={{ color: '#FFF', fontSize: 11 }}>Name: {user?.name || 'null'}</Text>
                            <Text style={{ color: '#FFF', fontSize: 11 }}>Profiles: {user?.profiles?.map(p => `${p.role}:${p.profile_id?.substring(0, 8)}..`).join(', ') || 'none'}</Text>
                            <Text style={{ color: '#FFF', fontSize: 11 }}>Vendor Profile ID: {vendorProfile?.profile_id || '❌ NOT FOUND'}</Text>
                            <Text style={{ color: '#FFF', fontSize: 11, marginTop: 4 }}>API Status: {loading ? '⏳ Loading...' : error ? '❌ ' + error : '✅ ' + orders.length + ' orders fetched'}</Text>
                            {error && <Text style={{ color: '#EF4444', fontSize: 11, marginTop: 2 }}>Error Detail: {error}</Text>}

                            {/* Action Buttons */}
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={testApiConnection}
                                    disabled={apiTestLoading}
                                    style={{ backgroundColor: '#3B82F6', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 14 }}
                                >
                                    {apiTestLoading
                                        ? <ActivityIndicator size="small" color="#FFF" />
                                        : <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>🧪 Test API</Text>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => refetch()}
                                    style={{ backgroundColor: '#10B981', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 14 }}
                                >
                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>🔄 Refetch</Text>
                                </TouchableOpacity>
                            </View>

                            {/* API Test Result */}
                            {apiTestResult && (
                                <View style={{ backgroundColor: '#0F172A', borderRadius: 6, padding: 10, marginTop: 8 }}>
                                    <Text style={{ color: '#A5F3FC', fontSize: 10, fontFamily: 'monospace' }}>{apiTestResult}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>

                    <View style={styles.headerRightRow}>
                        <TouchableOpacity style={styles.headerBtn} onPress={toggleSidebar}>
                            <LayoutGrid size={24} color="#111827" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.headerBtn}>
                            <PlusSquare size={24} color="#111827" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.headerBtn}>
                            <MoreHorizontal size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date Selection Row */}
                <View style={styles.dateSectionContainer}>
                    <View style={styles.dateRow}>
                        <TouchableOpacity style={styles.datePill}>
                            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.dateText}>Jun 25, 2025</Text>
                        </TouchableOpacity>

                        <Text style={styles.dateDash}>-</Text>

                        <TouchableOpacity style={styles.datePill}>
                            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.dateText}>Jun 30, 2025</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.reportText}>Report : Jun 20, 2025 - Jun 30, 2025</Text>
                </View>

                {/* Main Blue Payments Card */}
                <View style={styles.mainBlueCard}>
                    <Text style={styles.mainCardSubtitle}>Total Payments Received</Text>
                    <Text style={styles.mainCardTitle}>
                        Tsh.{totalPayments.toLocaleString()}
                    </Text>

                    <TouchableOpacity style={styles.historyButton}>
                        <Text style={styles.historyButtonText}>View Transaction History</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary Row */}
                <View style={styles.summaryRow}>
                    {/* Orders Placed */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summarySubtitle}>Total Orders Placed</Text>
                        <Text style={styles.summaryTitle}>{loading ? '-' : totalOrders}</Text>
                        <TouchableOpacity style={styles.viewDetailsBtn}>
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Completed Orders */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summarySubtitle}>Total Completed Orders</Text>
                        <Text style={styles.summaryTitle}>{loading ? '-' : completedOrders}</Text>
                        <TouchableOpacity style={styles.viewDetailsBtn}>
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Almost Completed List */}
                <View style={styles.listContainer}>
                    {/* List Header */}
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeaderTitle}>Ten Orders Almost Completed - (75%)</Text>
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
                    {loading ? (
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
                                {/* 'Orders' column repurposed as Target Amount in this dynamic view */}
                                <Text style={[styles.tableRowText, { flex: 1, textAlign: 'center' }]}>
                                    {(item.total_amount / 1000).toFixed(0)}k
                                </Text>
                                <Text style={[styles.tableRowText, { flex: 1, textAlign: 'right' }]}>
                                    {item.percentage.toFixed(0)}%
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
    }
});
