import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { orderApi, usePayOrder } from '../../../src/services/orders';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

const { height } = Dimensions.get('window');

export default function OrderDashboardScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useTunzaaAuth();

    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    // Polling Mechanism State
    const [isPolling, setIsPolling] = useState(false);
    const [hasPaidInstallment, setHasPaidInstallment] = useState(false); // To trigger success animation when poll goes from true -> false

    const { data: ordersResponse, refetch, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => orderApi.getOrders({ order_id: id as string }),
        enabled: !!id,
        refetchInterval: isPolling ? 3000 : false, // 3-second polling mechanism
    });

    // We get elements as array or object, safely extract
    const orderData = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse?.items;
    const order = orderData && orderData.length > 0 ? orderData[0] : null;

    const payOrderMutation = usePayOrder();

    useEffect(() => {
        // Stop polling when payment status succeeds
        if (isPolling && order) {
            if (order.payment_status === 'paid' || order.payment_status === 'partially_paid') {
                setIsPolling(false);
                setIsSuccessModalVisible(true);
            }
        }
    }, [order, isPolling]);

    const CircleProgress = ({ percentage }: { percentage: number }) => {
        const size = 100;
        const strokeWidth = 10;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={size} height={size}>
                    <Circle
                        stroke="#F0F4F8"
                        fill="none"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <Circle
                        stroke="#2F48AE" // Deep blue matching screenshot
                        fill="none"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </Svg>
                <View style={styles.progressTextContainer}>
                    <Text style={styles.progressPercentageText}>{percentage}%</Text>
                    <Text style={styles.progressLabelText}>Paid</Text>
                </View>
            </View>
        );
    };

    const handlePaymentSelect = async (methodName: string) => {
        setIsPaymentModalVisible(false);
        if (!order || !user?.phone_number) {
            alert("Missing user phone number or order details");
            return;
        }

        try {
            await payOrderMutation.mutateAsync({
                orderNumber: order.order_id,
                data: { customer_msisdn: user.phone_number.replace('+', ''), plan_id: 'installment' }
            });
            setIsPolling(true); // Begin heavy 3s polling
            setHasPaidInstallment(true);
        } catch (error) {
            console.error("Installment push failed:", error);
            alert("Failed to push installment request");
        }
    };

    const handleSuccessClose = () => {
        setIsSuccessModalVisible(false);
    };

    const renderPaymentModal = () => (
        <Modal visible={isPaymentModalVisible} animationType="slide" transparent>
            <View style={styles.bottomSheetOverlay}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsPaymentModalVisible(false)} />
                <View style={styles.bottomSheetContent}>
                    <View style={styles.bottomSheetHandle} />
                    <Text style={styles.bottomSheetTitle}>Select your preferred payment</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {[
                            { name: 'M-Pesa', logo: 'https://1000logos.net/wp-content/uploads/2021/04/Vodacom-logo.png' },
                            { name: 'Tigo Pesa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Tigo_logo.svg/1024px-Tigo_logo.svg.png' },
                            { name: 'Airtel Money', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Airtel_logo_2010.svg/512px-Airtel_logo_2010.svg.png' },
                            { name: 'Halo Pesa', logo: 'https://halotel.co.tz/assets/images/logo.png' },
                        ].map((method, index) => (
                            <TouchableOpacity key={index} style={styles.paymentMethodRow} onPress={() => handlePaymentSelect(method.name)}>
                                <View style={styles.paymentMethodLogoWrap}>
                                    <Image source={{ uri: method.logo }} style={styles.paymentMethodLogo} resizeMode="contain" />
                                </View>
                                <Text style={styles.paymentMethodName}>{method.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderSuccessModal = () => (
        <Modal visible={isSuccessModalVisible} transparent={true} animationType="fade">
            <View style={styles.successModalOverlay}>
                <View style={styles.successModalContent}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={handleSuccessClose}
                    >
                        <Ionicons name="close" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <Text style={styles.successModalTitle}>🎉 Congratulation Pam!!</Text>
                    <Text style={styles.successModalText}>
                        You have successfully completed your installment payment for the <Text style={{ fontWeight: 'bold' }}>NIKE AIR JORDAN</Text>
                    </Text>

                    <View style={styles.successModalBox}>
                        <Text style={styles.successModalBoxText}>
                            You are about to make an payment. Tunzaa gives you the ability to pay in installments or the full amount at once, according to your convenience start with any amount to improve positive purchasing habit
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (isLoading && !order) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Loading order...</Text>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Order not found</Text>
            </SafeAreaView>
        );
    }

    const orderItem = order.items?.[0]; // Get primary item
    const paymentProgress = order.payment_status === 'paid' ? 100 : order.payment_status === 'partially_paid' ? 50 : 0;
    const isFullyPaid = paymentProgress === 100;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header Area (Blue Background) */}
            <View style={styles.headerBackground}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Tracking</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
                {/* Overlapping White Tracking Card */}
                <View style={styles.trackingCard}>

                    {/* Top Row: Image & Progress Ring */}
                    <View style={styles.trackingTopRow}>
                        <Image source={{ uri: (orderItem as any)?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=300' }} style={styles.productImage} />
                        <CircleProgress percentage={paymentProgress} />
                    </View>

                    {/* Product Basic Info */}
                    <View style={styles.productInfoSection}>
                        <Text style={styles.productName} numberOfLines={2}>{(orderItem as any)?.name || (orderItem as any)?.product_name || 'Product Item'}</Text>
                        <Text style={styles.metaValue}>#{order.order_number}</Text>
                        <Text style={styles.dateText}>{new Date(order.created_at || Date.now()).toLocaleDateString()}</Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Order Details Breakdown */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.detailsTitle}>Order details</Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Subtotal</Text>
                            <Text style={[styles.detailValue, { color: '#22C55E' }]}>Tsh {order.totals.subtotal?.toLocaleString()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tax & Fees</Text>
                            <Text style={[styles.detailValue, { color: '#22C55E' }]}>Tsh {order.totals.tax?.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.detailRow, { marginTop: 8 }]}>
                            <Text style={[styles.detailLabel, { fontWeight: 'bold' }]}>Total amount</Text>
                            <Text style={[styles.detailValue, { color: '#2F48AE', fontWeight: 'bold', fontSize: 16 }]}>Tsh {order.totals.total?.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Dynamic Action Buttons */}
                    {isFullyPaid ? (
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={() => router.push(`/(buyer)/profile/delivery/map?order_id=${order.order_id}`)}
                            >
                                <Text style={styles.primaryBtnText}>Live Delivery Map</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.outlineBtn}
                                onPress={() => router.push('/(buyer)/orders/rate')}
                            >
                                <Text style={styles.outlineBtnText}>Rate delivery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.outlineBtn, { marginTop: 12, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}
                                onPress={() => router.push({
                                    pathname: '/(buyer)/refund/request',
                                    params: { order_id: id as string }
                                })}
                            >
                                <Text style={[styles.outlineBtnText, { color: '#EF4444' }]}>Request Refund</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.payBtn, isPolling && { opacity: 0.7 }]}
                            onPress={() => !isPolling && setIsPaymentModalVisible(true)}
                        >
                            <Text style={styles.payBtnText}>
                                {isPolling ? 'Awaiting Payment Approval...' : 'Pay Installment: Tsh 10,000'}
                            </Text>
                        </TouchableOpacity>
                    )}

                </View>
            </ScrollView>

            {/* Bottom Nav Mock (From screenshots, this screen has bottom tabs) */}
            <View style={styles.bottomNavMock}>
                <Ionicons name="home" size={24} color="#2F48AE" />
                <Ionicons name="grid-outline" size={24} color="#9CA3AF" />
                <Ionicons name="briefcase-outline" size={24} color="#9CA3AF" />
                <Ionicons name="person-outline" size={24} color="#9CA3AF" />
            </View>

            {renderPaymentModal()}
            {renderSuccessModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // To seamlessly blend the bottom if card is short
    },
    headerBackground: {
        backgroundColor: '#4A55A2', // Match theme blue
        height: 180,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        paddingTop: 70, // Offset to overlap the blue header
        paddingBottom: 80, // Clearance for bottom nav
    },
    trackingCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        minHeight: height - 150, // Fill remaining space safely
        padding: 24,
        zIndex: 1,
        // Elevation for the top curve shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    trackingTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Center vertically Image vs Circle
        marginBottom: 24,
    },
    productImage: {
        width: 140,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
    },
    progressTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressPercentageText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2F48AE',
    },
    progressLabelText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    productInfoSection: {
        marginBottom: 20,
    },
    productName: {
        fontSize: 18,
        color: '#1F2937',
        marginBottom: 8,
    },
    metaValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A55A2',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 20,
    },
    detailsSection: {
        marginBottom: 32,
    },
    detailsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Action Buttons
    actionButtonsContainer: {
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: '#22C55E', // Green perfectly matching "Receive your product"
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    outlineBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#22C55E', // Green outline
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    outlineBtnText: {
        color: '#22C55E',
        fontSize: 16,
        fontWeight: 'bold',
    },
    payBtn: {
        backgroundColor: '#4A55A2',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    payBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Bottom Nav Mock
    bottomNavMock: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingBottom: 24, // Safe area styling mock
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        zIndex: 10,
    },

    // Payment Modal Bottom Sheet
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    bottomSheetContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '60%',
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    bottomSheetTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 24,
        textAlign: 'left',
    },
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    paymentMethodLogoWrap: {
        width: 32,
        height: 32,
        marginRight: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    paymentMethodLogo: {
        width: '80%',
        height: '80%',
    },
    paymentMethodName: {
        fontSize: 15,
        color: '#1A1A1A',
    },

    // Success Modal
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        position: 'relative',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
        zIndex: 10,
    },
    successModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 20,
    },
    successModalText: {
        fontSize: 14,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    successModalBox: {
        backgroundColor: '#EFF6FF', // Light blue bg
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    successModalBoxText: {
        fontSize: 13,
        color: '#60A5FA', // Blue text matching screenshot
        lineHeight: 20,
        textAlign: 'center',
    },
});
