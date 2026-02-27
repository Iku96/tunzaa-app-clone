import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';

export default function OrderDashboardScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Automatically show the success modal when reaching this page
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(true);

    const product = {
        name: 'Nike Air Jordan',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60', // Placeholder
        orderNumber: '#986705',
        quantity: 1,
        date: '12 April 2025',
        paid: 3273,
        pending: 8727,
        total: 12000,
        progress: 30 // Percentage
    };

    const CircleProgress = ({ percentage }: { percentage: number }) => {
        const size = 120;
        const strokeWidth = 12;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={size} height={size}>
                    {/* Background Circle */}
                    <Circle
                        stroke="#F0F4F8"
                        fill="none"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress Circle */}
                    <Circle
                        stroke="#2F48AE" // Deep blue
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

    const renderSuccessModal = () => (
        <Modal visible={isSuccessModalVisible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setIsSuccessModalVisible(false)}
                    >
                        <Ionicons name="close" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>🎉Congratulation Femi!</Text>
                    <Text style={styles.modalText}>
                        You've successfully made your first installment payment for the <Text style={{ fontWeight: 'bold' }}>NIKE AIR JORDAN</Text>. Keep it up you're on your way to owning your goal!
                    </Text>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header Area (Blue Background) */}
            <View style={styles.headerBackground}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push('/(buyer)')} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} bounces={false}>

                {/* Overlapping White Tracking Card */}
                <View style={styles.trackingCard}>

                    {/* Top Row: Image & Progress Ring */}
                    <View style={styles.trackingTopRow}>
                        <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                        <CircleProgress percentage={product.progress} />
                    </View>

                    {/* Product Basic Info */}
                    <View style={styles.productInfoSection}>
                        <Text style={styles.productName}>{product.name.toUpperCase()}</Text>

                        <View style={styles.orderMetaRow}>
                            <View>
                                <Text style={styles.metaLabel}>Order number</Text>
                                <Text style={styles.metaValue}>{product.orderNumber}</Text>
                                <Text style={styles.metaLabel}>Quantity {product.quantity}</Text>
                            </View>
                            <Text style={styles.dateText}>{product.date}</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Order Details Breakdown */}
                    <View style={styles.detailsSection}>
                        <Text style={styles.detailsTitle}>Order details</Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Amount paid</Text>
                            <Text style={[styles.detailValue, { color: '#22C55E' }]}>Tsh {product.paid.toLocaleString()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Pending amount</Text>
                            <Text style={[styles.detailValue, { color: '#F59E0B' }]}>Tsh {product.pending.toLocaleString()}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Total amount</Text>
                            <Text style={[styles.detailValue, { color: '#1F2937' }]}>Tsh {product.total.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Footer Info Box */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoBoxText}>
                            You are about to make a payment. Tunzaa gives you the ability to pay in installments or the full amount at once, according to your convenience start with any amount to improve positive purchasing habit
                        </Text>
                    </View>
                </View>

            </ScrollView>

            {renderSuccessModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerBackground: {
        backgroundColor: '#2F48AE', // Deep blue top
        height: 200, // Enough height for the overlapping card
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
        paddingTop: 80, // Offset to overlap the blue header
        paddingBottom: 40,
    },
    trackingCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        minHeight: 500, // Fill remaining space
        padding: 24,
        zIndex: 1,
    },
    trackingTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    productImage: {
        width: 130,
        height: 100,
        borderRadius: 12,
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    orderMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    metaLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    metaValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#425BA4',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
    },
    divider: {
        height: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
        marginVertical: 24,
    },
    detailsSection: {
        marginBottom: 32,
    },
    detailsTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    infoBoxText: {
        fontSize: 12,
        color: '#9CA3AF',
        lineHeight: 18,
        textAlign: 'justify',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
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
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 20, // Space for close button
    },
    modalText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
});
