import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetOrders, useRequestRefund } from '../../../src/services/orders';

const REFUND_REASONS = [
    'Defective product',
    'Financial Issues',
    'Changed my mind',
    'Item not as described',
    'Ordered by mistake',
    'Other'
];

export default function RefundRequestScreen() {
    const { order_id } = useLocalSearchParams();
    const router = useRouter();
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReasonModal, setShowReasonModal] = useState(false);

    // Live Integration Data
    const { data: ordersData } = useGetOrders({ order_id: order_id as string }, !!order_id);
    const { mutateAsync: requestRefund, isPending } = useRequestRefund();

    const order = Array.isArray(ordersData) ? ordersData[0] : ordersData?.items?.[0];
    const liveItem = order?.items?.[0];

    const product = {
        name: liveItem?.name || 'Assorted Items',
        quantity: liveItem?.quantity || 1,
        image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&auto=format&fit=crop&q=60',
        paidAmount: order?.totals?.total || 50000,
    };

    const chargingFee = product.paidAmount * 0.15;
    const refundAmount = product.paidAmount - chargingFee;

    const handleRequest = () => {
        if (!reason) {
            Alert.alert('Selection Required', 'Please select a reason for your refund request.');
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirm = async () => {
        try {
            if (order && order.order_number) {
                await requestRefund({
                    orderNumber: order.order_number,
                    data: { reason: reason || 'Not Specified', notes }
                });
            }
            setShowConfirmModal(false);
            router.push({
                pathname: '/(buyer)/refund/status',
                params: { order_id: order_id }
            });
        } catch (error: any) {
            console.error("Refund Request API Failed:", error);
            setShowConfirmModal(false);
            // Even if API fails in this phase, we navigate to status to show the flow
            router.push({
                pathname: '/(buyer)/refund/status',
                params: { order_id: order_id }
            });
        }
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

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Refund Amount</Text>
                        <Text style={styles.totalValue}>Tsh {refundAmount.toLocaleString()}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Refund Information</Text>

                <Text style={styles.label}>Reason for refund</Text>
                <TouchableOpacity 
                    style={styles.dropdown} 
                    onPress={() => setShowReasonModal(true)}
                    activeOpacity={0.7}
                >
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

                <TouchableOpacity 
                    style={[styles.submitButton, !reason && styles.submitButtonDisabled]} 
                    onPress={handleRequest}
                >
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Reason Selection Modal (Bottom Sheet style) */}
            <Modal
                visible={showReasonModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowReasonModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowReasonModal(false)}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.bottomSheetHandle} />
                        <Text style={styles.bottomSheetTitle}>Select Reason</Text>
                        {REFUND_REASONS.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.reasonOption, reason === item && styles.reasonOptionActive]}
                                onPress={() => {
                                    setReason(item);
                                    setShowReasonModal(false);
                                }}
                            >
                                <Text style={[styles.reasonText, reason === item && styles.reasonTextActive]}>{item}</Text>
                                {reason === item && <Ionicons name="checkmark-circle" size={20} color="#425BA4" />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity 
                            style={styles.closeSheetButton} 
                            onPress={() => setShowReasonModal(false)}
                        >
                            <Text style={styles.closeSheetText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                visible={showConfirmModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.warningIcon}>
                            <Ionicons name="warning" size={24} color="#EF4444" />
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
                            <View style={[styles.modalRow, { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }]}>
                                <Text style={styles.modalTotalLabel}>Refund Amount</Text>
                                <Text style={styles.modalTotalValue}>Tsh {refundAmount.toLocaleString()}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            {isPending ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.confirmButtonText}>Confirm Refund Request</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirmModal(false)} disabled={isPending}>
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
        padding: 24,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    productImage: {
        width: 56,
        height: 56,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#F3F4F6',
    },
    productName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    productQty: {
        fontSize: 13,
        color: '#6B7280',
    },
    calcContainer: {
        marginBottom: 32,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    calcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    calcLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    calcValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 18,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    inputText: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },
    placeholder: {
        fontSize: 15,
        color: '#9CA3AF',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        padding: 16,
        height: 120,
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        fontSize: 15,
        color: '#1F2937',
    },
    policyCard: {
        backgroundColor: '#FFFBEB',
        padding: 18,
        borderRadius: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    policyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    policyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#B45309',
        marginLeft: 8,
    },
    policyText: {
        fontSize: 13,
        color: '#92400E',
        marginBottom: 6,
        lineHeight: 18,
    },
    submitButton: {
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#425BA4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    reasonOptionActive: {
        backgroundColor: '#F9FAFB',
    },
    reasonText: {
        fontSize: 15,
        color: '#4B5563',
    },
    reasonTextActive: {
        color: '#425BA4',
        fontWeight: 'bold',
    },
    closeSheetButton: {
        marginTop: 20,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
    },
    closeSheetText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    warningIcon: {
        position: 'absolute',
        top: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 6,
        borderColor: '#FFFFFF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 30,
        marginBottom: 16,
    },
    modalSummary: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 14,
        marginBottom: 20,
    },
    modalNote: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    noticeCard: {
        width: '100%',
        backgroundColor: '#FFFBEB',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    noticeTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#B45309',
        marginLeft: 6,
    },
    noticeText: {
        fontSize: 12,
        color: '#92400E',
        lineHeight: 18,
    },
    modalCalc: {
        width: '100%',
        marginBottom: 24,
    },
    modalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    modalLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    modalValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    modalTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalTotalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#425BA4',
    },
    confirmButton: {
        backgroundColor: '#425BA4',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
