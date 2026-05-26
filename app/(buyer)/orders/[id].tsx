import { useLanguage } from "../../../src/contexts/LanguageContext";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import BottomNav from '../../../src/components/navigation/BottomNav';
import PaymentModal from '../../../src/components/orders/PaymentModal';

import { useGetOrder } from '../../../src/services/orders';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

export default function OrderDetailsScreen() {
    const { t } = useLanguage();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);

    // Fetch order by ID
    const { data: apiOrder, isLoading } = useGetOrder(id as string, !!id);

    const isCompleted = apiOrder?.status?.toLowerCase() === 'completed' || (apiOrder && apiOrder.payment_details?.amount >= apiOrder.totals?.total);

    const total = apiOrder?.totals?.total || 0;
    const paid = apiOrder?.payment_details?.amount || 0;
    const progress = total > 0 ? (paid / total) : 0;

    const order = {
        id: apiOrder?.order_id || apiOrder?.order_number || id,
        date: new Date(apiOrder?.created_at || Date.now()).toLocaleDateString('en-GB'),
        items: apiOrder?.items?.length > 0 ? apiOrder.items.map(i => ({
            name: i.name,
            price: i.unit_price,
            image: i.product_image?.url || i.metadata?.image || 'https://via.placeholder.com/500?text=Order',
            quantity: i.quantity
        })) : [{ name: t.orderDetailsLoadingItem, price: 0, image: 'https://via.placeholder.com/500', quantity: 1 }],
        paidAmount: paid,
        pendingAmount: Math.max(0, total - paid),
        totalAmount: total,
        progress: progress > 1 ? 1 : progress,
        status: apiOrder?.status || t.orderDetailsStatusPending,
    };

    // Circular Progress Props
    const size = 120;
    const strokeWidth = 10;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (order.progress * circumference);

    const handlePaymentSuccess = () => {
        setPaymentModalVisible(false);
        // Navigate to success or update state
        router.push('/(buyer)/orders/success');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#425BA4" />

            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t.ordersHeaderTitle}</Text>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                        <ActivityIndicator size="large" color="#425BA4" />
                        <Text style={{ marginTop: 10, color: '#6B7280' }}>{t.summaryLoadingOrder}</Text>
                    </View>
                ) : !apiOrder ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
                        <Text style={{ marginTop: 10, color: '#6B7280' }}>{t.orderDetailsNotFound}</Text>
                    </View>
                ) : (
                    <View style={styles.card}>
                        <View style={styles.productRow}>
                            <Image source={{ uri: order.items[0].image }} style={styles.productImage} />
                            <View style={styles.progressContainer}>
                                <Svg width={size} height={size}>
                                    <Circle
                                        stroke="#E5E7EB"
                                        fill="none"
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        strokeWidth={strokeWidth}
                                    />
                                    <Circle
                                        stroke="#425BA4"
                                        fill="none"
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={progressOffset}
                                        strokeLinecap="round"
                                        transform={`rotate(-90 ${center} ${center})`}
                                    />
                                </Svg>
                                <View style={styles.progressTextContainer}>
                                    <Text style={styles.progressText}>{Math.round(order.progress * 100)}%</Text>
                                    <Text style={styles.progressLabel}>{t.orderDetailsProgressPaid}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.productName}>{order.items[0].name}</Text>
                        <Text style={styles.orderNumber}>{t.orderDetailsNumberPrefix}{order.id}</Text>
                        <Text style={styles.orderDate}>{order.date}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>{t.orderDetailsSectionTitle}</Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t.orderDetailsAmountPaid}</Text>
                            <Text style={[styles.detailValue, { color: '#22C55E' }]}>Tzs {order.paidAmount.toLocaleString()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t.orderDetailsPendingAmount}</Text>
                            <Text style={[styles.detailValue, { color: '#EF4444' }]}>Tzs {order.pendingAmount.toLocaleString()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t.orderDetailsTotalAmount}</Text>
                            <Text style={styles.detailValue}>Tzs {order.totalAmount.toLocaleString()}</Text>
                        </View>

                        {isCompleted ? (
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => router.push('/(buyer)/orders/delivery')}
                            >
                                <Text style={styles.primaryButtonText}>{t.orderDetailsReceiveBtn}</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => setPaymentModalVisible(true)}
                            >
                                <Text style={styles.primaryButtonText}>{t.orderDetailsPayInstallmentBtn}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push('/(buyer)/orders/receipt')}
                        >
                            <Text style={styles.secondaryButtonText}>{t.orderDetailsViewReceiptBtn}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <BottomNav />

            {/* Payment Modal/Overlay could be here or navigated to */}
            <PaymentModal
                visible={paymentModalVisible}
                onClose={() => setPaymentModalVisible(false)}
                amount={order.pendingAmount || 1000} // Mock amount
                onPaymentSuccess={handlePaymentSuccess}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#425BA4', // Blue background for top half
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    scrollContent: {
        flexGrow: 1,
        backgroundColor: '#F3F4F6', // Gray background for content
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 32,
        paddingHorizontal: 20,
        paddingBottom: 100,
        marginTop: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        alignItems: 'center',
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    },
    productImage: {
        width: 120,
        height: 100,
        resizeMode: 'contain',
    },
    progressContainer: {
        position: 'relative',
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressTextContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    progressLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    orderNumber: {
        fontSize: 14,
        color: '#425BA4',
        alignSelf: 'flex-start',
        fontWeight: '600',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        color: '#9CA3AF',
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        width: '100%',
        marginBottom: 20,
    },
    sectionTitle: {
        alignSelf: 'flex-start',
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    primaryButton: {
        backgroundColor: '#425BA4',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#22C55E', // Green for View Receipt
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
