import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetUserOrders } from '@/src/services/orders';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { format, isSameMonth } from 'date-fns';

export default function VendorOrdersPaymentsScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const { data: ordersData, isLoading } = useGetUserOrders(user?.user_id || '');
    const orders = ordersData?.items || [];

    const now = new Date();
    
    // Distribution Calculations
    const oneTimeOrders = orders.filter(o => !o.payment_details?.method?.toLowerCase().includes('tunzaa'));
    const installmentOrders = orders.filter(o => o.payment_details?.method?.toLowerCase().includes('tunzaa'));
    
    const totalOneTime = oneTimeOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    const totalInstallments = installmentOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    const grandTotal = totalOneTime + totalInstallments;
    
    const installmentPercent = grandTotal > 0 ? (totalInstallments / grandTotal) * 100 : 0;
    const oneTimePercent = grandTotal > 0 ? (totalOneTime / grandTotal) * 100 : 0;

    const activeInstallments = installmentOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders & payments</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.overviewCard}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Monthly Overview</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{format(now, 'MMM yyyy')}</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Total one time</Text>
                            <Text style={styles.statValue}>Tzs {totalOneTime.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Total Installment</Text>
                            <Text style={styles.statValue}>Tzs {totalInstallments.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Payment distribution</Text>

                <View style={styles.chartContainer}>
                    <View style={[styles.donutRing, { borderTopColor: oneTimePercent > 0 ? '#425BA4' : '#22C55E' }]}>
                        <View style={styles.donutInner} />
                    </View>
                </View>

                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                        <Text style={styles.legendText}>Installments ({Math.round(installmentPercent)}%)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#425BA4' }]} />
                        <Text style={styles.legendText}>One-time ({Math.round(oneTimePercent)}%)</Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 40 }]}>Active installments</Text>

                {isLoading ? (
                    <ActivityIndicator size="small" color="#425BA4" style={{ marginTop: 20 }} />
                ) : activeInstallments.length === 0 ? (
                    <Text style={styles.emptyText}>No active installments found.</Text>
                ) : (
                    activeInstallments.map((order) => (
                        <View key={order.order_id} style={styles.installmentCard}>
                            <View style={styles.installmentHeader}>
                                <Text style={styles.productName}>{order.items[0]?.name || 'Shopping Item'}</Text>
                                <Text style={styles.productPrice}>Tzs {order.totals.total.toLocaleString()}</Text>
                            </View>
                            <View style={styles.installmentMeta}>
                                <Text style={styles.metaText}>Created on {format(new Date(order.created_at), 'MMM d, yyyy')}</Text>
                                <View style={styles.activeBadge}>
                                    <Text style={styles.activeBadgeText}>{order.status}</Text>
                                </View>
                            </View>

                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: order.status === 'completed' ? '100%' : '40%' }]} />
                                <Text style={styles.progressText}>{order.status === 'completed' ? '100%' : 'In Progress'}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
    backButton: { padding: 4, marginLeft: -4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    scrollContent: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 40 },
    overviewCard: { backgroundColor: '#425BA4', borderRadius: 16, padding: 20, marginBottom: 32 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    badge: { backgroundColor: '#FFFFFF33', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },
    statsRow: { flexDirection: 'row', alignItems: 'center' },
    statCol: { flex: 1 },
    statDivider: { width: 1, height: 40, backgroundColor: '#FFFFFF33', marginHorizontal: 16 },
    statLabel: { color: '#E0E7FF', fontSize: 12, marginBottom: 4 },
    statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 24 },
    chartContainer: { alignItems: 'center', marginVertical: 16 },
    donutRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 24, borderColor: '#22C55E', borderTopColor: '#425BA4', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '45deg' }] },
    donutInner: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#FFFFFF' },
    legendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    legendText: { fontSize: 12, color: '#6B7280' },
    installmentCard: { marginTop: 16 },
    installmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    productName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    productPrice: { fontSize: 13, color: '#6B7280' },
    installmentMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    metaText: { fontSize: 12, color: '#6B7280' },
    activeBadge: { backgroundColor: '#425BA4', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    activeBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
    progressBarContainer: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, flexDirection: 'row', alignItems: 'center', position: 'relative' },
    progressBarFill: { height: '100%', backgroundColor: '#425BA4', borderRadius: 4 },
    progressText: { position: 'absolute', right: 0, bottom: -20, fontSize: 11, color: '#1A1A1A', fontWeight: '500' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#9CA3AF', fontStyle: 'italic' },
});
