import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle2, Info, Upload } from 'lucide-react-native';

export default function WithdrawalDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Commission Withdrawal Status</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Stepper */}
                <View style={styles.stepperContainer}>
                    <View style={styles.stepItem}>
                        <View style={[styles.stepIcon, styles.stepIconActive]}>
                            <Upload size={20} color="#FFFFFF" />
                        </View>
                        <Text style={styles.stepLabel}>Submitted</Text>
                    </View>
                    
                    <View style={styles.stepLine} />

                    <View style={styles.stepItem}>
                        <View style={[styles.stepIcon, styles.stepIconProcessing]}>
                            <Clock size={20} color="#3A5BA9" />
                        </View>
                        <Text style={styles.stepLabel}>Processing</Text>
                    </View>

                    <View style={styles.stepLine} />

                    <View style={styles.stepItem}>
                        <View style={styles.stepIcon}>
                            <CheckCircle2 size={20} color="#D1D5DB" />
                        </View>
                        <Text style={styles.stepLabel}>Completed</Text>
                    </View>
                </View>

                {/* Amount Breakdown Card */}
                <View style={styles.amountCard}>
                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Requested Amount</Text>
                        <Text style={styles.amountValue}>Tsh 50,000</Text>
                    </View>
                    <View style={styles.amountRow}>
                        <Text style={styles.feeLabel}>Service Fee (15%)</Text>
                        <Text style={styles.feeValue}>-Tsh 15,000</Text>
                    </View>
                    
                    <View style={styles.amountDivider} />

                    <View style={styles.amountRow}>
                        <Text style={styles.payoutLabel}>Payout Amount</Text>
                        <Text style={styles.payoutValue}>Tsh 35, 000</Text>
                    </View>

                    <View style={styles.estimateBox}>
                        <View style={styles.estimateIconBg}>
                            <Clock size={16} color="#3A5BA9" />
                        </View>
                        <View style={styles.estimateTextContent}>
                            <Text style={styles.estimateTitle}>Estimated Completion</Text>
                            <Text style={styles.estimateDate}>January 25, 2024 (within 3 business days))</Text>
                        </View>
                    </View>
                </View>

                {/* Request Details Section */}
                <View style={styles.detailsGroup}>
                    <Text style={styles.groupTitle}>Request Details</Text>
                    <View style={styles.detailsBox}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Request ID</Text>
                            <Text style={styles.detailValue}>ID: #{id || 'WD789121'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Submitted</Text>
                            <Text style={styles.detailValue}>Jan 18, 2024 at 2:30 PM</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Receiving number</Text>
                            <Text style={styles.detailValue}>07*****5678</Text>
                        </View>
                    </View>
                </View>

                {/* Sender Details Section */}
                <View style={styles.detailsGroup}>
                    <Text style={styles.groupTitle}>sender Details</Text>
                    <View style={styles.detailsBox}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Sender name</Text>
                            <Text style={styles.detailValue}>Tunzaa Holding Company</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Account number</Text>
                            <Text style={styles.detailValue}>0197625525252555</Text>
                        </View>
                    </View>
                </View>

                {/* Help Box */}
                <View style={styles.helpBox}>
                    <Info size={20} color="#3A5BA9" style={styles.helpIcon} />
                    <View style={styles.helpContent}>
                        <Text style={styles.helpTitle}>Need Help?</Text>
                        <Text style={styles.helpText}>
                            Your commission will be sent directly to the withdrawal method you selected when submitting your request (e.g., mobile money, bank account, or other supported method). This ensures your payout goes to your preferred channel, while still maintaining security and.
                        </Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
    },
    headerIconBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    stepItem: {
        alignItems: 'center',
    },
    stepIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    stepIconActive: {
        backgroundColor: '#059669',
    },
    stepIconProcessing: {
        backgroundColor: '#F0F4FC',
        borderWidth: 1,
        borderColor: '#3A5BA9',
    },
    stepLabel: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 8,
        marginTop: -20, // Align with icons
    },
    amountCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 24,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
    },
    amountLabel: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    amountValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
    },
    feeLabel: {
        fontSize: 14,
        color: '#DC2626',
    },
    feeValue: {
        fontSize: 14,
        color: '#DC2626',
        fontWeight: '600',
    },
    amountDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    payoutLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    payoutValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3A5BA9',
    },
    estimateBox: {
        flexDirection: 'row',
        backgroundColor: '#F0F4FC',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        alignItems: 'center',
    },
    estimateIconBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    estimateTextContent: {
        flex: 1,
    },
    estimateTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#3A5BA9',
        marginBottom: 4,
    },
    estimateDate: {
        fontSize: 11,
        color: '#4B5563',
    },
    detailsGroup: {
        marginBottom: 24,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    detailsBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    detailValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    helpBox: {
        flexDirection: 'row',
        backgroundColor: '#F0F4FC',
        borderRadius: 16,
        padding: 20,
        marginTop: 10,
    },
    helpIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    helpContent: {
        flex: 1,
    },
    helpTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#3A5BA9',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 20,
    }
});
