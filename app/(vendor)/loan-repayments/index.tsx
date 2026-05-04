import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, CreditCard } from 'lucide-react-native';
import { useGetLoanRepayments, LoanRepaymentPlan } from '@/src/services/loans';

export default function LoanRepaymentsIndex() {
    const router = useRouter();
    const { data: repayments, isLoading } = useGetLoanRepayments();

    const formatCurrency = (amount: number) => {
        return `Tsh ${amount.toLocaleString()}`;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Repayments Track</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <ActivityIndicator size="large" color="#425BA4" style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.listContainer}>
                        {repayments?.map((plan: LoanRepaymentPlan) => (
                            <TouchableOpacity 
                                key={plan.id} 
                                style={styles.card}
                                onPress={() => router.push(`/(vendor)/loan-repayments/${plan.id}`)}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconBox}>
                                        <CreditCard size={20} color="#425BA4" />
                                    </View>
                                    <View style={styles.headerText}>
                                        <Text style={styles.loanId}>{plan.application_id}</Text>
                                        <Text style={styles.providerName}>{plan.provider_name}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, plan.status === 'completed' && styles.completedBadge]}>
                                        <Text style={[styles.statusText, plan.status === 'completed' && styles.completedStatusText]}>
                                            {plan.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.progressSection}>
                                    <View style={styles.progressRow}>
                                        <Text style={styles.progressLabel}>Repayment Progress</Text>
                                        <Text style={styles.progressValue}>{plan.progress_percentage}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${plan.progress_percentage}%` }]} />
                                    </View>
                                    <Text style={styles.amountPaidText}>
                                        {formatCurrency(plan.amount_paid)} paid
                                    </Text>
                                </View>

                                <View style={styles.cardFooter}>
                                    <TouchableOpacity 
                                        style={styles.payNowBtn}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            router.push(`/(vendor)/loan-repayments/${plan.id}/pay`);
                                        }}
                                    >
                                        <Text style={styles.payNowText}>Pay Now</Text>
                                    </TouchableOpacity>
                                    <View style={styles.detailsLink}>
                                        <Text style={styles.viewDetailsText}>View Repayment Plan</Text>
                                        <ChevronRight size={16} color="#425BA4" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
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
        height: 60,
        paddingHorizontal: 8,
        backgroundColor: '#FFFFFF',
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
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    listContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    loanId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    providerName: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#FFFBEB',
    },
    completedBadge: {
        backgroundColor: '#ECFDF5',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#D97706',
    },
    completedStatusText: {
        color: '#059669',
    },
    progressSection: {
        marginBottom: 20,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    progressValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginBottom: 8,
    },
    progressBarFill: {
        height: 8,
        backgroundColor: '#425BA4',
        borderRadius: 4,
    },
    amountPaidText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    payNowBtn: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    payNowText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    detailsLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#425BA4',
        marginRight: 4,
    }
});
