import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TransferReviewScreen() {
    const router = useRouter();
    const { fromId } = useLocalSearchParams();
    const [isChecked, setIsChecked] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Mock Data
    const fromOrder = {
        name: 'Samsung Galaxy A23',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60',
        currentBalance: 350000,
        newBalance: 0,
        plan: 'Installments plan 3 months',
        date: '12 Apr 2023'
    };

    const toOrder = {
        name: 'LG Double Door Refrigerator',
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=500&auto=format&fit=crop&q=60',
        currentBalance: 0,
        newBalance: 350000,
        plan: 'Installments plan 6 months',
        date: '28 Mar 2023'
    };

    const transferAmount = 350000;
    const netAdjustment = 350000;

    const handleTransfer = () => {
        if (!isChecked) return;
        setShowSuccessModal(true);
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        router.push('/(buyer)/transfer/status');
    };

    const renderProductCard = (label, order, isSource) => (
        <View style={styles.section}>
            <Text style={styles.sectionLabel}>{label}</Text>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.blueLine} />
                    <View style={{ flex: 1 }}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.productName}>{order.name}</Text>
                            <Text style={styles.dateText}>{order.date}</Text>
                        </View>
                        <Text style={styles.planText}>{order.plan}</Text>
                    </View>
                </View>

                <View style={styles.productContent}>
                    <Image source={{ uri: order.image }} style={styles.productImage} />
                    <View style={styles.balanceInfo}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.balanceLabel}>Current Contribution</Text>
                            <Text style={styles.balanceValue}>TSH {order.currentBalance.toLocaleString()}</Text>
                        </View>
                        <View style={styles.rowBetween}>
                            <Text style={styles.balanceLabel}>New Balance After Transfer</Text>
                            <Text style={[styles.balanceValue, isSource ? styles.redText : styles.greenText]}>
                                TSH {order.newBalance.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Transfer Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.description}>
                    Confirm the details below before completing your transfer request
                </Text>

                {renderProductCard('FROM', fromOrder, true)}

                {/* Arrow Icon */}
                <View style={styles.arrowContainer}>
                    <View style={styles.arrowCircle}>
                        <Ionicons name="arrow-down" size={24} color="#FFFFFF" />
                    </View>
                </View>

                {renderProductCard('TO', toOrder, false)}

                {/* Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Transfer Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Transfer Amount</Text>
                        <Text style={styles.summaryValue}>TSH {transferAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Net Amount to LG Double Door</Text>
                        <Text style={styles.summaryValue}>TSH {netAdjustment.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Disclaimer */}
                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setIsChecked(!isChecked)}
                >
                    <View style={[styles.checkbox, isChecked && styles.checked]}>
                        {isChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.disclaimerText}>
                        I confirm that this transfer is final and I understand once submitted can't be reversed.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.submitButton, !isChecked && styles.disabledButton]}
                    onPress={handleTransfer}
                    disabled={!isChecked}
                >
                    <Text style={styles.submitButtonText}>Transfer Fund</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={handleCloseSuccess}>
                            <Ionicons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>

                        <Image
                            source={{ uri: toOrder.image }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />

                        <View style={styles.successBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
                            <Text style={styles.successTitle}>
                                Your transfer request has been submitted successfully.
                            </Text>
                        </View>

                        <View style={styles.modalSummary}>
                            <Text style={styles.modalLabel}>Amount Transferred: <Text style={{ fontWeight: 'bold' }}>Tsh {transferAmount.toLocaleString()}</Text></Text>
                            <Text style={styles.modalLabel}>New Balance applied to: <Text style={{ fontWeight: 'bold' }}>{toOrder.name}</Text></Text>
                        </View>

                        <View style={styles.modalBalanceRow}>
                            <Text style={styles.modalBalanceLabel}>New Balance After Transfer</Text>
                            <Text style={styles.modalBalanceValue}>TSH {toOrder.newBalance.toLocaleString()}</Text>
                        </View>

                        <View style={styles.modalFooter}>
                            <Text style={styles.modalFooterTitle}>Transfer Summary</Text>
                            <View style={styles.modalFooterRow}>
                                <Text style={styles.modalFooterLabel}>Transfer Amount</Text>
                                <Text style={styles.modalFooterValue}>TSH {transferAmount.toLocaleString()}</Text>
                            </View>
                            <View style={styles.modalFooterRow}>
                                <Text style={styles.modalFooterLabel}>Net Amount to LG Double Door</Text>
                                <Text style={styles.modalFooterValue}>TSH {netAdjustment.toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
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
    description: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 20,
    },
    section: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 8,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    blueLine: {
        width: 4,
        backgroundColor: '#3B82F6',
        borderRadius: 2,
        marginRight: 8,
        height: '100%',
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    dateText: {
        fontSize: 10,
        color: '#9CA3AF',
        marginLeft: 8,
    },
    planText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    productContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
        transform: [{ rotate: '-10deg' }],
        backgroundColor: '#F3F4F6',
    },
    balanceInfo: {
        flex: 1,
        gap: 4,
    },
    balanceLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    balanceValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
    },
    redText: { color: '#EF4444' },
    greenText: { color: '#22C55E' },
    arrowContainer: {
        alignItems: 'center',
        marginVertical: -10, // Overlap
        zIndex: 1,
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4A55A2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    summaryContainer: {
        marginTop: 24,
        marginBottom: 24,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
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
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checked: {
        backgroundColor: '#4A55A2',
        borderColor: '#4A55A2',
    },
    disclaimerText: {
        fontSize: 12,
        color: '#6B7280',
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
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
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 4,
    },
    modalImage: {
        width: 80,
        height: 80,
        marginBottom: 16,
        resizeMode: 'contain',
    },
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    successTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        flex: 1,
    },
    modalSummary: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
        gap: 4,
    },
    modalLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    modalBalanceRow: {
        backgroundColor: '#4A55A2',
        width: '100%',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    modalBalanceLabel: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    modalBalanceValue: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    modalFooter: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
    },
    modalFooterTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    modalFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    modalFooterLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    modalFooterValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
    },
});
