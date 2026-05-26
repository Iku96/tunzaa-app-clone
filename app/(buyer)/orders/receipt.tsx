import { useLanguage } from "../../../src/contexts/LanguageContext";
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetOrder } from '../../../src/services/orders';

const { width } = Dimensions.get('window');

export default function ReceiptScreen() {
    const { t } = useLanguage();
    const router = useRouter();
    const { orderId } = useLocalSearchParams();

    const { data: order, isLoading } = useGetOrder(orderId as string, !!orderId);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.receiptHeaderTitle}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#425BA4" style={{ marginTop: 40 }} />
                ) : !order ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                        <Text style={{ marginTop: 16, color: '#6B7280' }}>{t.receiptNotFound}</Text>
                    </View>
                ) : (
                    <View style={styles.receiptCard}>
                        {/* Top Branding Section */}
                        <View style={styles.brandSection}>
                            <Text style={styles.tunzaaLogoText}>TUNZAA</Text>
                            <View style={styles.paymentTypeRow}>
                                <View style={styles.dot} />
                                <Text style={styles.paymentTypeText}>{t.receiptProductPayments}</Text>
                            </View>
                            <Text style={styles.orderNumberText}>{t.receiptPaymentForOrder}{order.order_number || order.order_id?.substring(0, 8)}</Text>
                        </View>

                        <View style={styles.dashedDivider} />

                        <Text style={styles.dateText}>{new Date(order.created_at).toLocaleString()}</Text>

                        {/* Main Receipt Info Rows */}
                        <View style={styles.infoSection}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t.receiptInfoService}</Text>
                                <Text style={styles.infoValue}>Tunzaa Marketplace</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t.receiptInfoMethod}</Text>
                                <Text style={styles.infoValue}>{order.payment_details?.method || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t.receiptInfoProductName}</Text>
                                <Text style={styles.infoValue} numberOfLines={1}>{order.items?.[0]?.name || t.receiptInfoMultiple}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t.receiptInfoAmount}</Text>
                                <Text style={styles.infoValue}>{order.currency} {order.totals?.total?.toLocaleString()}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t.receiptInfoStatus}</Text>
                                <Text style={[styles.statusValue, order.status === 'pending' || order.payment_status === 'pending' ? { color: '#F59E0B' } : {}]}>
                                    {order.payment_status?.toUpperCase() || 'COMPLETED'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.dashedDivider} />

                        {/* Breakdown Section */}
                        <View style={styles.breakdownSection}>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>{t.receiptBreakdownSubtotal}</Text>
                                <Text style={styles.breakdownValue}>{order.currency} {order.totals?.subtotal?.toLocaleString()}</Text>
                            </View>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>{t.receiptBreakdownDiscount}</Text>
                                <Text style={styles.breakdownValue}>{order.currency} {order.totals?.discount?.toLocaleString()}</Text>
                            </View>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>{t.receiptBreakdownTax}</Text>
                                <Text style={styles.breakdownValue}>{order.currency} {order.totals?.tax?.toLocaleString()}</Text>
                            </View>

                            <View style={[styles.breakdownRow, { marginTop: 12 }]}>
                                <Text style={styles.totalLabel}>{t.receiptTotalCosts}</Text>
                                <Text style={styles.totalValue}>{order.currency} {order.totals?.total?.toLocaleString()}</Text>
                            </View>
                        </View>

                        {/* Cutouts on the sides */}
                        <View style={styles.leftCutout} />
                        <View style={styles.rightCutout} />

                        {/* Fixed Button */}
                        <TouchableOpacity style={styles.downloadBtn} onPress={() => router.push('/(buyer)/orders' as any)}>
                            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.downloadBtnText}>{t.receiptDoneBtn}</Text>
                        </TouchableOpacity>

                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Off-white/gray background highlights the white receipt card
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    receiptCard: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderRadius: 16,
        paddingVertical: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        position: 'relative',
    },
    leftCutout: {
        position: 'absolute',
        left: -12,
        top: '60%', // Approximately where the dashed divider is
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    rightCutout: {
        position: 'absolute',
        right: -12,
        top: '60%',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    brandSection: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 24,
    },
    tunzaaLogoText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#425BA4',
        letterSpacing: 2,
        marginBottom: 12,
    },
    paymentTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#425BA4',
        marginRight: 8,
    },
    paymentTypeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#425BA4',
    },
    orderNumberText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
    },
    dashedDivider: {
        height: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
        marginVertical: 24,
        marginHorizontal: 24,
    },
    dateText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'right',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    infoSection: {
        paddingHorizontal: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22C55E', // Green for completed
    },
    breakdownSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    breakdownLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    breakdownValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1F2937',
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    downloadBtn: {
        flexDirection: 'row',
        backgroundColor: '#425BA4',
        borderRadius: 24,
        paddingVertical: 16,
        marginHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    downloadBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
