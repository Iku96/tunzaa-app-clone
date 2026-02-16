import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import BottomNav from '../../../src/components/navigation/BottomNav';
import PaymentModal from '../../../src/components/orders/PaymentModal';

const { width } = Dimensions.get('window');

// Mock Data - should be fetched based on ID
const MOCK_ORDER = {
    id: '986705',
    date: '12 April 2025',
    items: [
        {
            name: 'Long Sofa',
            price: 12000, // Using small numbers as per screenshot example
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60',
            quantity: 1
        }
    ],
    paidAmount: 12000,
    pendingAmount: 0,
    totalAmount: 12000,
    progress: 1.0, // 100%
    status: 'Completed',
};

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);

    // In a real app, fetch order by ID here. Using mock for now.
    const order = MOCK_ORDER;
    const isCompleted = order.progress >= 1;

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
            <StatusBar barStyle="light-content" backgroundColor="#4A55A2" />

            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order</Text>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Main Card */}
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
                                    stroke="#4A55A2"
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
                                <Text style={styles.progressLabel}>Paid</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.productName}>{order.items[0].name}</Text>
                    <Text style={styles.orderNumber}>Order number #{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Order details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Amount paid</Text>
                        <Text style={[styles.detailValue, { color: '#22C55E' }]}>Tzs {order.paidAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pending amount</Text>
                        <Text style={[styles.detailValue, { color: '#EF4444' }]}>Tzs {order.pendingAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Amount</Text>
                        <Text style={styles.detailValue}>Tzs {order.totalAmount.toLocaleString()}</Text>
                    </View>

                    {isCompleted ? (
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push('/(buyer)/orders/delivery')}
                        >
                            <Text style={styles.primaryButtonText}>Receive your product</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => setPaymentModalVisible(true)}
                        >
                            <Text style={styles.primaryButtonText}>Pay Installment</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push('/(buyer)/orders/receipt')}
                    >
                        <Text style={styles.secondaryButtonText}>View receipt</Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: '#4A55A2', // Blue background for top half
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
        color: '#4A55A2',
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
        color: '#4A55A2',
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
        backgroundColor: '#4A55A2',
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
