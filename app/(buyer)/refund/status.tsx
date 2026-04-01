import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RefundStatusScreen() {
    const router = useRouter();
    const { order_id } = useLocalSearchParams();

    // Mock Data based on screenshots
    const refundData = {
        productName: 'Air Jordan Nike',
        status: 'Processing',
        amountPaid: 50000,
        processingFee: 7500, // 15% of 50000
        refundAmount: 42500,
        returnId: '#45156371',
        reason: 'Defective product',
        quantity: '2 Items',
        timeline: [
            { id: 1, title: 'Return Requested', date: 'Dec 15, 2024 at 2:30 PM', status: 'completed' },
            { id: 2, title: 'Return Approved', date: 'Dec 18, 2024 at 10:30 AM', status: 'completed' },
            { id: 3, title: 'Product Picked Up', date: 'Today', status: 'current' },
        ],
    };

    const renderTimeline = () => (
        <View style={styles.timelineContainer}>
            {refundData.timeline.map((item, index) => (
                <View key={item.id} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                        <View style={[
                            styles.dot, 
                            item.status === 'completed' && styles.dotCompleted,
                            item.status === 'current' && styles.dotCurrent
                        ]}>
                            {item.status === 'completed' && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                        </View>
                        {index < refundData.timeline.length - 1 && (
                            <View style={[
                                styles.connector,
                                item.status === 'completed' && styles.connectorCompleted
                            ]} />
                        )}
                    </View>
                    <View style={styles.timelineRight}>
                        <Text style={[
                            styles.timelineTitle,
                            item.status === 'current' && styles.timelineTitleCurrent
                        ]}>{item.title}</Text>
                        <Text style={styles.timelineDate}>{item.date}</Text>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refund Status</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Product Detail Card */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View style={styles.productImagePlaceholder}>
                            <Ionicons name="basket-outline" size={24} color="#425BA4" />
                        </View>
                        <View style={styles.productHeaderInfo}>
                            <View style={styles.row}>
                                <Text style={styles.productName}>{refundData.productName}</Text>
                                <Text style={styles.priceText}>Tsh {refundData.amountPaid.toLocaleString()}</Text>
                            </View>
                            <Text style={styles.subText}>Order ID: #ORD123456</Text>
                            <Text style={styles.subText}>Size: 42</Text>
                            <Text style={styles.subText}>Seller: Tunzaa Shop</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.detailsLink}>
                        <Text style={styles.detailsLinkText}>View all details</Text>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Return ID</Text>
                        <Text style={styles.infoValueBlue}>{refundData.returnId}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Reason</Text>
                        <Text style={styles.infoValue}>{refundData.reason}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Quantity</Text>
                        <Text style={styles.infoValue}>{refundData.quantity}</Text>
                    </View>

                    <View style={styles.divider} />

                    {renderTimeline()}
                </View>

                {/* Calculation Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Refund Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Amount Paid</Text>
                        <Text style={styles.summaryValue}>Tsh {refundData.amountPaid.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: '#EF4444' }]}>Charging Fee (15%)</Text>
                        <Text style={[styles.summaryValue, { color: '#EF4444' }]}>-Tsh {refundData.processingFee.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }]}>
                        <Text style={styles.totalLabel}>Total Refund</Text>
                        <Text style={styles.totalValue}>Tsh {refundData.refundAmount.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.helpBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#425BA4" />
                    <Text style={styles.helpText}>
                        Refunds are processed within 3-5 business days once the item has been picked up and verified.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productImagePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    productHeaderInfo: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    subText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    detailsLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        marginBottom: 8,
    },
    detailsLinkText: {
        fontSize: 13,
        color: '#6B7280',
        marginRight: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
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
    infoValueBlue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    timelineContainer: {
        marginTop: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    timelineLeft: {
        alignItems: 'center',
        width: 32,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotCompleted: {
        backgroundColor: '#425BA4',
    },
    dotCurrent: {
        backgroundColor: '#EEF2FF',
        borderWidth: 2,
        borderColor: '#425BA4',
    },
    connector: {
        width: 2,
        flex: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 2,
    },
    connectorCompleted: {
        backgroundColor: '#425BA4',
    },
    timelineRight: {
        flex: 1,
        paddingBottom: 24,
        marginLeft: 12,
    },
    timelineTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    timelineTitleCurrent: {
        color: '#1F2937',
    },
    timelineDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    helpBox: {
        flexDirection: 'row',
        backgroundColor: '#EEF2FF',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    helpText: {
        fontSize: 12,
        color: '#425BA4',
        flex: 1,
        lineHeight: 18,
    },
});
