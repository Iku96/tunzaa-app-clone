import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ReceiptScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const orderData = {
        id: id || '1203056',
        date: '25 May 2024',
        time: '14:30',
        customer: 'Khadija Abdallah',
        phone: '+255 768 000 000',
        paymentMethod: 'NMB Bank',
        status: 'Order delivered',
        items: [
            { name: 'Air Jordan Nike', qty: 1, price: 450000 },
        ],
        summary: {
            totalPrice: 450000,
            deliveryFee: 5000,
            taxes: 81000, // 18%
            discount: 0,
            grandTotal: 536000
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US').format(price);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Receipt</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.receiptCard}>
                    {/* Status Badge */}
                    <View style={styles.statusBadgeContainer}>
                        <View style={styles.statusBadge}>
                            <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                            <Text style={styles.statusBadgeText}>{orderData.status}</Text>
                        </View>
                    </View>

                    {/* Order ID & Date */}
                    <View style={styles.receiptHeader}>
                        <Text style={styles.orderIdLabel}>Order ID</Text>
                        <Text style={styles.orderIdValue}>#{orderData.id}</Text>
                        <Text style={styles.receiptDateTime}>{orderData.date} • {orderData.time}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Customer Info */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionLabel}>Customer</Text>
                        <Text style={styles.customerName}>{orderData.customer}</Text>
                        <Text style={styles.customerPhone}>{orderData.phone}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Items */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionLabel}>Product Items</Text>
                        {orderData.items.map((item, idx) => (
                            <View key={idx} style={styles.itemRow}>
                                <View style={styles.itemMain}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.itemQty}>Qty: {item.qty}</Text>
                                </View>
                                <Text style={styles.itemPrice}>Tsh {formatPrice(item.price)}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Payment Summary */}
                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total price</Text>
                            <Text style={styles.summaryValue}>Tsh {formatPrice(orderData.summary.totalPrice)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery fee</Text>
                            <Text style={styles.summaryValue}>Tsh {formatPrice(orderData.summary.deliveryFee)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Taxes (18%)</Text>
                            <Text style={styles.summaryValue}>Tsh {formatPrice(orderData.summary.taxes)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Discount</Text>
                            <Text style={styles.summaryValue}>- Tsh {formatPrice(orderData.summary.discount)}</Text>
                        </View>
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Grand Total</Text>
                            <Text style={styles.grandTotalValue}>Tsh {formatPrice(orderData.summary.grandTotal)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Payment Method */}
                    <View style={styles.paymentMethodSection}>
                        <Text style={styles.sectionLabel}>Payment Method</Text>
                        <View style={styles.methodRow}>
                            <View style={styles.methodIconWrapper}>
                                <Ionicons name="card-outline" size={18} color="#425BA4" />
                            </View>
                            <Text style={styles.methodName}>{orderData.paymentMethod}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.downloadButton}>
                        <Ionicons name="download-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.downloadButtonText}>Download Receipt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                        <Ionicons name="share-social-outline" size={20} color="#425BA4" style={{ marginRight: 8 }} />
                        <Text style={styles.shareButtonText}>Share</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerBrand}>
                    <Text style={styles.footerBrandText}>Tunzaa Version 2.0</Text>
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
        color: '#111827',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    receiptCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        marginBottom: 24,
    },
    statusBadgeContainer: {
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#22C55E',
    },
    receiptHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    orderIdLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    orderIdValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 8,
    },
    receiptDateTime: {
        fontSize: 13,
        color: '#6B7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
    },
    infoSection: {
        gap: 8,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    customerName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    customerPhone: {
        fontSize: 13,
        color: '#6B7280',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    itemMain: {
        flex: 1,
        marginRight: 16,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    itemQty: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    summarySection: {
        gap: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    grandTotalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#425BA4',
    },
    paymentMethodSection: {
        gap: 12,
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    methodIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    actionsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    downloadButton: {
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#425BA4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    downloadButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    shareButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareButtonText: {
        color: '#425BA4',
        fontSize: 15,
        fontWeight: 'bold',
    },
    footerBrand: {
        alignItems: 'center',
        paddingTop: 12,
    },
    footerBrandText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
