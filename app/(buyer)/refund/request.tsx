import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RefundRequestScreen() {
    const router = useRouter();
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Mock Data
    const product = {
        name: 'AIR JORDAN NIKE',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&auto=format&fit=crop&q=60',
        paidAmount: 50000,
    };

    const chargingFee = product.paidAmount * 0.15;
    const refundAmount = product.paidAmount - chargingFee;

    const handleRequest = () => {
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        setShowConfirmModal(false);
        router.push('/(buyer)/refund/status');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request for Fund</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Product Card */}
                <View style={styles.productCard}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    <View>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productQty}>Quantity: {product.quantity}</Text>
                    </View>
                </View>

                {/* Calculation */}
                <View style={styles.calcContainer}>
                    <View style={styles.calcRow}>
                        <Text style={styles.calcLabel}>Paid Amount</Text>
                        <Text style={styles.calcValue}>Tsh {product.paidAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.calcRow}>
                        <Text style={[styles.calcLabel, { color: '#EF4444' }]}>Charging Fee (15%)</Text>
                        <Text style={[styles.calcValue, { color: '#EF4444' }]}>-Tsh {chargingFee.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.calcRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Refund Amount</Text>
                        <Text style={styles.totalValue}>Tsh{refundAmount.toLocaleString()}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Refund Information</Text>

                <Text style={styles.label}>Reason for refund</Text>
                <TouchableOpacity style={styles.dropdown}>
                    <Text style={reason ? styles.inputText : styles.placeholder}>
                        {reason || 'Select a reason'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>

                <Text style={styles.label}>Additional notes (optional)</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Tell us more about your refund request..."
                    multiline
                    numberOfLines={4}
                    value={notes}
                    onChangeText={setNotes}
                    textAlignVertical="top"
                />

                {/* Refund Policy Warning */}
                <View style={styles.policyCard}>
                    <View style={styles.policyHeader}>
                        <Ionicons name="alert-circle" size={20} color="#B45309" />
                        <Text style={styles.policyTitle}>Refund Policy</Text>
                    </View>
                    <Text style={styles.policyText}>• Refunds incur a 15% processing deduction</Text>
                    <Text style={styles.policyText}>• Refund requests are non-cancellable once submitted</Text>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleRequest}>
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                visible={showConfirmModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.warningIcon}>
                            <Ionicons name="warning" size={32} color="#EF4444" />
                        </View>
                        <Text style={styles.modalTitle}>Confirm Refund Request</Text>

                        <View style={styles.modalSummary}>
                            <View style={styles.modalRow}>
                                <Text style={styles.modalLabel}>Refund Amount</Text>
                                <Text style={styles.modalValue}>Tsh {refundAmount.toLocaleString()}</Text>
                            </View>
                            <Text style={styles.modalNote}>After charging fees 15% deducted</Text>
                        </View>

                        <View style={styles.noticeCard}>
                            <View style={styles.noticeHeader}>
                                <Ionicons name="information-circle" size={16} color="#B45309" />
                                <Text style={styles.noticeTitle}>Important Notice</Text>
                            </View>
                            <Text style={styles.noticeText}>
                                This action cannot be undone. Once confirmed, your refund request will be processed and cannot be cancelled.
                            </Text>
                        </View>

                        <View style={styles.modalCalc}>
                            <View style={styles.modalRow}>
                                <Text style={styles.modalLabel}>Paid Amount</Text>
                                <Text style={styles.modalValue}>Tsh {product.paidAmount.toLocaleString()}</Text>
                            </View>
                            <View style={styles.modalRow}>
                                <Text style={[styles.modalLabel, { color: '#EF4444' }]}>Charging Fee (15%)</Text>
                                <Text style={[styles.modalValue, { color: '#EF4444' }]}>-Tsh {chargingFee.toLocaleString()}</Text>
                            </View>
                            <View style={[styles.modalRow, { marginTop: 8 }]}>
                                <Text style={styles.modalTotalLabel}>Refund Amount</Text>
                                <Text style={styles.modalTotalValue}>Tsh{refundAmount.toLocaleString()}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>Confirm Refund Request</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirmModal(false)}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
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
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    productQty: {
        fontSize: 12,
        color: '#6B7280',
    },
    calcContainer: {
        marginBottom: 24,
    },
    calcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    calcLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    calcValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A55A2',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
    },
    inputText: {
        fontSize: 14,
        color: '#1F2937',
    },
    placeholder: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        height: 100,
        marginBottom: 24,
        backgroundColor: '#F9FAFB',
        fontSize: 14,
    },
    policyCard: {
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    policyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    policyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#B45309',
        marginLeft: 8,
    },
    policyText: {
        fontSize: 12,
        color: '#92400E',
        marginBottom: 4,
        marginLeft: 4,
    },
    submitButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    warningIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    modalSummary: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    modalNote: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    noticeCard: {
        width: '100%',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    noticeTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#B45309',
        marginLeft: 4,
    },
    noticeText: {
        fontSize: 12,
        color: '#92400E',
        lineHeight: 16,
    },
    modalCalc: {
        width: '100%',
        marginBottom: 24,
    },
    modalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    modalLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    modalValue: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1F2937',
    },
    modalTotalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4A55A2',
    },
    confirmButton: {
        backgroundColor: '#4A55A2',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 12,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#1F2937',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
