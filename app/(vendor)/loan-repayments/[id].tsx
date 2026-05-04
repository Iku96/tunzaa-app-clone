import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useGetLoanRepaymentPlan } from '@/src/services/loans';

export default function LoanRepaymentPlanScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: plan, isLoading } = useGetLoanRepaymentPlan(id as string);

    const formatCurrency = (amount: number) => {
        return `Tsh ${amount.toLocaleString()}`;
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#425BA4" style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    if (!plan) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Repayment Plan</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Repayment Progress Card */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Repayment Progress</Text>
                        <Text style={styles.progressStep}>{plan.payments_made} of {plan.total_payments} payments</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${plan.progress_percentage}%` }]} />
                    </View>
                    <View style={styles.progressFooter}>
                        <Text style={styles.amountPaid}>{formatCurrency(plan.amount_paid)} paid</Text>
                        <Text style={styles.percentage}>{plan.progress_percentage}%</Text>
                    </View>
                </View>

                {/* Loan Details Box */}
                <View style={styles.detailsBox}>
                    <Text style={styles.detailsTitle}>Loan Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Application ID</Text>
                        <Text style={styles.detailValue}>{plan.application_id}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Interest Rate</Text>
                        <Text style={styles.detailValue}>{plan.interest_rate}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Loan Term</Text>
                        <Text style={styles.detailValue}>{plan.loan_term}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Repayment</Text>
                        <Text style={styles.detailValue}>Tshs {plan.total_repayment.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Action Button */}
                {plan.status === 'completed' ? (
                    <View style={styles.completedButton}>
                        <Text style={styles.completedButtonText}>Completed</Text>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.makePaymentButton}
                        onPress={() => router.push(`/(vendor)/loan-repayments/${id}/pay`)}
                    >
                        <Text style={styles.makePaymentText}>Make Payment</Text>
                    </TouchableOpacity>
                )}

                {/* Scheduled Payments List */}
                <View style={styles.scheduleSection}>
                    <Text style={styles.scheduleTitle}>Scheduled payments</Text>
                    <View style={styles.scheduleList}>
                        {plan.schedule.map((payment) => (
                            <View key={payment.id} style={styles.paymentRow}>
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepText}>{payment.payment_number} of {plan.total_payments}</Text>
                                </View>
                                <Text style={styles.paymentDate}>{payment.due_date}</Text>
                                <Text style={styles.paymentAmount}>Tsh {payment.amount.toLocaleString()}</Text>
                                <View style={[styles.statusTag, payment.status === 'paid' && styles.paidTag]}>
                                    <Text style={[styles.statusTagText, payment.status === 'paid' && styles.paidTagText]}>
                                        {payment.status === 'paid' ? 'Paid' : 'Pay'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
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
        height: 60,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    progressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    progressLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    progressStep: {
        fontSize: 13,
        color: '#6B7280',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 5,
        marginBottom: 12,
    },
    progressBarFill: {
        height: 10,
        backgroundColor: '#425BA4',
        borderRadius: 5,
    },
    progressFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    amountPaid: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    percentage: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    detailsBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
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
        color: '#111827',
    },
    completedButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 32,
    },
    completedButtonText: {
        color: '#D1D5DB',
        fontSize: 16,
        fontWeight: '600',
    },
    makePaymentButton: {
        backgroundColor: '#425BA4',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 32,
    },
    makePaymentText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    scheduleSection: {
        marginBottom: 40,
    },
    scheduleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 20,
    },
    scheduleList: {
        gap: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stepBadge: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        width: 60,
        alignItems: 'center',
    },
    stepText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    paymentDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        marginLeft: 16,
    },
    paymentAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginRight: 16,
    },
    statusTag: {
        borderWidth: 1,
        borderColor: '#425BA4',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 6,
        minWidth: 70,
        alignItems: 'center',
    },
    paidTag: {
        borderColor: '#425BA4',
    },
    statusTagText: {
        color: '#425BA4',
        fontSize: 13,
        fontWeight: '600',
    },
    paidTagText: {
        color: '#425BA4',
    }
});
