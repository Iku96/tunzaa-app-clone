import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data struct mimicking the screenshot
const DEFAULT_LOAN_DATA = {
    id: '#LN-84391',
    progress: { paid_payments: 5, total_payments: 5, amount_paid: 250000, percentage: 100 },
    details: { interest_rate: '5.00% / month', loan_term: '3 Months', total_repayment: 'Tshs 575,000' },
    installments: [
        { id: 1, date: '12/04/2025', amount: 50000, status: 'Paid' },
        { id: 2, date: '12/05/2025', amount: 50000, status: 'Paid' },
        { id: 3, date: '12/06/2025', amount: 50000, status: 'Paid' },
        { id: 4, date: '12/07/2025', amount: 50000, status: 'Paid' },
        { id: 5, date: '12/08/2025', amount: 50000, status: 'Paid' },
    ]
};

export default function RepaymentPlanScreen() {
    const router = useRouter();
    const { id, amount_paid, paid_payments, percentage } = useLocalSearchParams();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Dynamic overlay from params if available, else use fallback
    const loanData = {
        ...DEFAULT_LOAN_DATA,
        id: id ? `#LN-${id}` : DEFAULT_LOAN_DATA.id,
        progress: {
            ...DEFAULT_LOAN_DATA.progress,
            amount_paid: amount_paid ? Number(amount_paid) : DEFAULT_LOAN_DATA.progress.amount_paid,
            percentage: percentage ? Number(percentage) : DEFAULT_LOAN_DATA.progress.percentage,
            paid_payments: paid_payments ? Number(paid_payments) : DEFAULT_LOAN_DATA.progress.paid_payments
        }
    };

    const isFullyPaid = loanData.progress.percentage === 100;

    useEffect(() => {
        if (isFullyPaid) {
            setShowSuccessModal(true);
        }
    }, [isFullyPaid]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Repayment Plan</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                {/* Progress Card */}
                <View style={styles.progressCard}>
                    <View style={styles.rowSpaceBetween}>
                        <Text style={styles.progressLabel}>Repayment Progress</Text>
                        <Text style={styles.progressCount}>{loanData.progress.paid_payments} of {loanData.progress.total_payments} payments</Text>
                    </View>
                    
                    <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${loanData.progress.percentage}%` }]} />
                    </View>
                    
                    <View style={styles.rowSpaceBetween}>
                        <Text style={styles.paidAmountText}>Tsh {loanData.progress.amount_paid.toLocaleString()} paid</Text>
                        <Text style={styles.paidPercentText}>{loanData.progress.percentage}%</Text>
                    </View>
                </View>

                {/* Loan Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.detailsCardTitle}>Loan Details</Text>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Application ID</Text>
                        <Text style={styles.detailValue}>{loanData.id}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Interest Rate</Text>
                        <Text style={styles.detailValue}>{loanData.details.interest_rate}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Loan Term</Text>
                        <Text style={styles.detailValue}>{loanData.details.loan_term}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Repayment</Text>
                        <Text style={styles.detailValue}>{loanData.details.total_repayment}</Text>
                    </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity 
                    style={[styles.actionButton, isFullyPaid && styles.actionButtonDisabled]} 
                    disabled={isFullyPaid}
                    onPress={() => router.push(`/(merchant)/loans/${id || '84391'}/payment-selection`)}
                >
                    <Text style={styles.actionButtonText}>
                        {isFullyPaid ? 'Completed' : 'Pay amount'}
                    </Text>
                </TouchableOpacity>

                {/* Scheduled Payments */}
                <Text style={styles.sectionTitle}>Scheduled payments</Text>
                
                <View style={styles.paymentsList}>
                    {loanData.installments.map((item, index) => (
                        <View key={item.id} style={styles.paymentItem}>
                            <View style={[styles.indexBadge, item.status === 'Paid' ? styles.indexBadgePaid : styles.indexBadgePending]}>
                                <Text style={[styles.indexBadgeText, item.status === 'Paid' ? styles.indexBadgeTextPaid : styles.indexBadgeTextPending]}>
                                    {index + 1} of {loanData.progress.total_payments}
                                </Text>
                            </View>
                            
                            <View style={styles.paymentMain}>
                                <Text style={styles.paymentDate}>{item.date}</Text>
                                <Text style={styles.paymentAmount}>Tsh {item.amount.toLocaleString()}</Text>
                            </View>
                            
                            <TouchableOpacity style={[styles.statusButton, item.status === 'Paid' ? styles.statusButtonPaid : styles.statusButtonPending]}>
                                <Text style={[styles.statusButtonText, item.status === 'Paid' ? styles.statusButtonTextPaid : styles.statusButtonTextPending]}>
                                    {item.status}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                
            </ScrollView>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeModal} onPress={() => setShowSuccessModal(false)}>
                            <Ionicons name="close" size={24} color="#111827" />
                        </TouchableOpacity>

                        <Text style={styles.congratsEmoji}>🎉</Text>
                        <Text style={styles.modalTitle}>Congratulations</Text>
                        
                        <Text style={styles.modalDescription}>
                            You've completed all repayments for Loan ID {loanData.id}. 
                            Tunzaa has settled your loan with Bill Finance. Your loan is now closed.
                        </Text>
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
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        padding: 24,
    },
    progressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    rowSpaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    progressCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    progressBarTrack: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginVertical: 16,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3B5998',
        borderRadius: 4,
    },
    paidAmountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    paidPercentText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    detailsCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    actionButton: {
        backgroundColor: '#3B5998',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 32,
    },
    actionButtonDisabled: {
        backgroundColor: '#F3F4F6',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4B5563',
        marginBottom: 20,
    },
    paymentsList: {
        gap: 16,
    },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    indexBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 16,
    },
    indexBadgePaid: {
        backgroundColor: '#3B5998',
    },
    indexBadgePending: {
        backgroundColor: '#EFF6FF',
    },
    indexBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    indexBadgeTextPaid: {
        color: '#FFFFFF',
    },
    indexBadgeTextPending: {
        color: '#3B5998',
    },
    paymentMain: {
        flex: 1,
    },
    paymentDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    paymentAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusButtonPaid: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
    },
    statusButtonPending: {
        backgroundColor: '#FFFFFF',
        borderColor: '#3B5998',
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusButtonTextPaid: {
        color: '#9CA3AF',
    },
    statusButtonTextPending: {
        color: '#3B5998',
    },
    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        alignItems: 'center',
    },
    closeModal: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        padding: 4,
    },
    congratsEmoji: {
        fontSize: 40,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    modalDescription: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
    }
});
