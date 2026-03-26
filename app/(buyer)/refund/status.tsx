import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RefundStatusScreen() {
    const router = useRouter();

    // Mock Data
    const refundData = {
        productName: 'Air Jordan Nike',
        status: 'Processing',
        amountPaid: 50000,
        processingFee: 15000,
        refundAmount: 35000,
        requestedDate: 'Dec 15, 2025',
        completedDate: 'Dec 20, 2025',
        requestId: '#UN-84591',
        submittedRes: 'Jan 18, 2024 at 2:30 PM',
        receivingNumber: '07******5678',
        reason: 'Financial Issues',
        senderName: 'Tunzaa Holding Company',
        accountNumber: '0197625525252555',
    };

    const renderTimeline = () => (
        <View style={styles.timelineContainer}>
            <View style={styles.timelineRow}>
                {/* Step 1: Submitted */}
                <View style={styles.timelineStep}>
                    <View style={[styles.stepIcon, styles.stepActive]}>
                        <Ionicons name="documents-outline" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.stepLabel, styles.labelActive]}>Submitted</Text>
                </View>

                {/* Left Line */}
                <View style={[styles.line, styles.lineActive]} />

                {/* Step 2: Processing */}
                <View style={styles.timelineStep}>
                    <View style={[styles.stepIcon, styles.stepProcessing]}>
                        <Ionicons name="sync" size={14} color="#3B82F6" />
                    </View>
                    <Text style={[styles.stepLabel, styles.labelProcessing]}>Processing</Text>
                </View>

                {/* Right Line */}
                <View style={styles.line} />

                {/* Step 3: Completed */}
                <View style={styles.timelineStep}>
                    <View style={styles.stepIconCompleted}>
                        <Ionicons name="checkmark" size={14} color="#D1D5DB" />
                    </View>
                    <Text style={styles.stepLabel}>Completed</Text>
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
                <Text style={styles.headerTitle}>Refund Status</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        {renderTimeline()}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Paid Amount</Text>
                        <Text style={styles.value}>Tsh {refundData.amountPaid.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: '#EF4444' }]}>Charging fee (15%)</Text>
                        <Text style={[styles.value, { color: '#EF4444' }]}>-Tsh {refundData.processingFee.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.row, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Refund Amount</Text>
                        <Text style={styles.totalValue}>Tsh{refundData.refundAmount.toLocaleString()}, 000</Text>
                    </View>

                    {/* Estimated Completion */}
                    <View style={styles.estimatedCard}>
                        <Ionicons name="calendar-outline" size={20} color="#425BA4" />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.estimatedLabel}>Estimated Completion</Text>
                            <Text style={styles.estimatedValue}>January 25, 2024 (72 hours business days)</Text>
                        </View>
                    </View>
                </View>

                {/* Request Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Request Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Request ID</Text>
                        <Text style={styles.detailValue}>{refundData.requestId}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Submitted</Text>
                        <Text style={styles.detailValue}>{refundData.submittedRes}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Receiving number</Text>
                        <Text style={styles.detailValue}>{refundData.receivingNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Reason</Text>
                        <Text style={styles.detailValue}>{refundData.reason}</Text>
                    </View>
                </View>

                {/* Sender Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Sender Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Sender name</Text>
                        <Text style={styles.detailValue}>{refundData.senderName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account number</Text>
                        <Text style={styles.detailValue}>{refundData.accountNumber}</Text>
                    </View>
                </View>

                {/* Help */}
                <View style={styles.helpCard}>
                    <Ionicons name="information-circle-outline" size={20} color="#425BA4" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.helpTitle}>Need Help?</Text>
                        <Text style={styles.helpText}>
                            Refunds will only be processed through the mobile number registered to your Tunzaa account at the time of account creation. This ensures security.
                        </Text>
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
    statusCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#3B82F6',
        fontSize: 12,
        fontWeight: '600',
    },
    timelineContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    timelineStep: {
        alignItems: 'center',
        width: 65,
        zIndex: 2,
    },
    stepIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepActive: {
        backgroundColor: '#22C55E', // Green
    },
    stepProcessing: {
        backgroundColor: '#EFF6FF', // Light blue
    },
    stepIconCompleted: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F3F4F6', // Light gray
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepLabel: {
        fontSize: 11,
        color: '#1F2937',
        textAlign: 'center',
        fontWeight: '500',
    },
    labelActive: {
        color: '#1F2937',
    },
    labelProcessing: {
        color: '#3B82F6',
    },
    line: {
        position: 'absolute',
        top: 14,
        left: '25%', // span between 1 and 2
        width: '25%',
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        zIndex: 0,
    },
    lineActive: {
        left: '20%',
        width: '30%',
        borderStyle: 'solid',
        borderWidth: 0,
        height: 2,
        backgroundColor: '#E5E7EB',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
    },
    value: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1F2937',
    },
    totalRow: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    estimatedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    estimatedLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#425BA4',
        marginBottom: 2,
    },
    estimatedValue: {
        fontSize: 10,
        color: '#6B7280',
    },
    detailsCard: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
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
        fontWeight: '500',
        color: '#1F2937',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    helpCard: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
    },
    helpTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#425BA4',
        marginBottom: 4,
    },
    helpText: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
    },
});
