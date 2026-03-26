import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoanStatusScreen() {
    const router = useRouter();
    const { id, status = 'approved' } = useLocalSearchParams(); // status can be 'approved', 'rejected', or 'pending'

    const isApproved = status === 'approved';
    const isRejected = status === 'rejected';
    const isPending = status === 'pending';

    const timeline = [
        { title: 'Loan Submitted', date: '2025-03-20', done: true },
        { title: 'Under Review', date: '2025-03-21', done: true },
        { 
            title: isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Final Decision', 
            date: isPending ? 'Pending' : '2025-03-22', 
            done: !isPending,
            current: true,
            failed: isRejected
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Application Status</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                {/* Status Hero */}
                <View style={[styles.statusHero, isApproved ? styles.heroApproved : isRejected ? styles.heroRejected : styles.heroPending]}>
                    <View style={[styles.statusIconCircle, isApproved ? styles.iconCircleApproved : isRejected ? styles.iconCircleRejected : styles.iconCirclePending]}>
                        <Ionicons 
                            name={isApproved ? "checkmark" : isRejected ? "close" : "time-outline"} 
                            size={40} 
                            color="#FFFFFF" 
                        />
                    </View>
                    <Text style={styles.statusTitle}>
                        {isApproved ? 'Application Approved!' : isRejected ? 'Application Rejected' : 'Under Review'}
                    </Text>
                    <Text style={styles.statusSubtitle}>
                        {isApproved 
                            ? 'Your loan for Tsh 500,000 has been approved. Please set up your repayment schedule to receive funds.' 
                            : isRejected 
                            ? 'We are sorry, but your application was not successful at this time. Please see details below or contact support.'
                            : 'Our team is reviewing your shop performance. You will be notified once a decision is made.'}
                    </Text>
                </View>

                {/* Loan Details Card */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Application ID</Text>
                        <Text style={styles.detailValue}>#{id || 'LN-84391'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Provider</Text>
                        <Text style={styles.detailValue}>Bill Finance</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Requested Amount</Text>
                        <Text style={styles.detailValue}>Tsh 500,000</Text>
                    </View>
                </View>

                {/* Timeline Section */}
                <View style={styles.timelineSection}>
                    <Text style={styles.sectionLabel}>Timeline</Text>
                    {timeline.map((step, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={styles.timelineIndicators}>
                                <View style={[
                                    styles.timelineDot, 
                                    step.done ? (step.failed ? styles.dotFailed : styles.dotDone) : styles.dotPending
                                ]}>
                                    {step.done && !step.failed && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                                    {step.failed && <Ionicons name="close" size={12} color="#FFFFFF" />}
                                </View>
                                {index < timeline.length - 1 && <View style={[styles.timelineLine, step.done && styles.lineDone]} />}
                            </View>
                            <View style={styles.timelineText}>
                                <Text style={[styles.stepTitle, step.current && styles.stepTitleCurrent]}>{step.title}</Text>
                                <Text style={styles.stepDate}>{step.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.footer}>
                    {isApproved && (
                        <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={() => router.push(`/(merchant)/loans/${id}/schedule`)}
                        >
                            <Text style={styles.primaryButtonText}>Setup Repayments</Text>
                        </TouchableOpacity>
                    )}
                    {isRejected && (
                        <TouchableOpacity 
                            style={styles.secondaryButton}
                            onPress={() => router.push('/(merchant)/index')}
                        >
                            <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
                        </TouchableOpacity>
                    )}
                    {!isApproved && !isRejected && (
                        <TouchableOpacity 
                            style={styles.secondaryButton}
                            onPress={() => router.replace('/(merchant)/index')}
                        >
                            <Text style={styles.secondaryButtonText}>Check Status Later</Text>
                        </TouchableOpacity>
                    )}
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
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        padding: 24,
    },
    statusHero: {
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        marginBottom: 32,
    },
    heroApproved: {
        backgroundColor: '#F0FDF4',
    },
    heroRejected: {
        backgroundColor: '#FEF2F2',
    },
    heroPending: {
        backgroundColor: '#EFF6FF',
    },
    statusIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircleApproved: {
        backgroundColor: '#22C55E',
    },
    iconCircleRejected: {
        backgroundColor: '#EF4444',
    },
    iconCirclePending: {
        backgroundColor: '#3B82F6',
    },
    statusTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    statusSubtitle: {
        fontSize: 15,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 22,
    },
    detailsCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
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
    timelineSection: {
        marginBottom: 40,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
    },
    timelineItem: {
        flexDirection: 'row',
        height: 70,
    },
    timelineIndicators: {
        width: 30,
        alignItems: 'center',
        marginRight: 16,
    },
    timelineDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    dotDone: {
        backgroundColor: '#22C55E',
    },
    dotFailed: {
        backgroundColor: '#EF4444',
    },
    dotPending: {
        backgroundColor: '#D1D5DB',
        borderWidth: 2,
        borderColor: '#9CA3AF',
    },
    timelineLine: {
        position: 'absolute',
        top: 24,
        bottom: 0,
        width: 2,
        backgroundColor: '#E5E7EB',
    },
    lineDone: {
        backgroundColor: '#22C55E',
    },
    timelineText: {
        flex: 1,
        paddingTop: 2,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    stepTitleCurrent: {
        color: '#111827',
    },
    stepDate: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 4,
    },
    footer: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#3B5998',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#4B5563',
        fontSize: 16,
        fontWeight: '600',
    }
});
