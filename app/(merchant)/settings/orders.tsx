import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, ChevronRight } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function OrdersPaymentsScreen() {
    const router = useRouter();

    // New account: starts with zero data
    const distribution = [
        { label: 'Installments', value: 0, color: '#10B981' },
        { label: 'one-time payment', value: 0, color: '#425BA4' },
    ];

    const activeInstallments: any[] = [];

    const renderDonutChart = () => {
        const size = 200;
        const strokeWidth = 30;
        const center = size / 2;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;

        let currentOffset = 0;

        return (
            <View style={styles.chartContainer}>
                <Svg width={size} height={size}>
                    {distribution.map((item, index) => {
                        const strokeDashoffset = circumference - (item.value / 100) * circumference;
                        const rotation = (currentOffset / 100) * 360;
                        currentOffset += item.value;
                        return (
                            <Circle
                                key={index}
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                transform={`rotate(${rotation}, ${center}, ${center})`}
                                fill="transparent"
                            />
                        );
                    })}
                </Svg>
                
                {/* Legend */}
                <View style={styles.legendContainer}>
                    {distribution.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                            <Text style={styles.legendLabel}>{item.label} ({item.value}%)</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders & payments</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Monthly Overview Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.overviewHeader}>
                        <Text style={styles.overviewTitle}>Monthly Overview</Text>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateBadgeText}>May 2025</Text>
                        </View>
                    </View>
                    <View style={styles.overviewStats}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Total one-time</Text>
                            <Text style={styles.statValue}>Tzs 0</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Total Installments</Text>
                            <Text style={styles.statValue}>Tzs 0</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Distribution */}
                <Text style={styles.sectionTitle}>Payment distribution</Text>
                {renderDonutChart()}

                {/* Active Installments */}
                <Text style={styles.sectionTitle}>Active Installments</Text>
                {activeInstallments.length > 0 ? activeInstallments.map((item) => (
                    <View key={item.id} style={styles.installmentCard}>
                        {/* ... existing card code ... */}
                    </View>
                )) : (
                    <View style={styles.emptyInstallmentWrapper}>
                        <Text style={styles.emptyInstallmentText}>You have no active installment plans.</Text>
                    </View>
                )}

                {/* Payment Insights */}
                <Text style={styles.sectionTitle}>Payment Insights</Text>
                <Text style={styles.insightText}>
                    Insights will appear here once you start receiving payments.
                </Text>

                <View style={styles.reminderCard}>
                    <View style={styles.reminderHeader}>
                        <Bell size={18} color="#425BA4" />
                        <Text style={styles.reminderTitle}>Payment Reminder</Text>
                    </View>
                    <Text style={styles.reminderText}>
                        Your next installment for "Apple MacBook Pro" is due on August 15. continue your payment to reach
                    </Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    overviewCard: {
        backgroundColor: '#425BA4',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    overviewTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    dateBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dateBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    overviewStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 4,
    },
    statLabel: {
        color: '#E5E7EB',
        fontSize: 12,
        marginBottom: 8,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 12,
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        gap: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendLabel: {
        fontSize: 12,
        color: '#4B5563',
    },
    installmentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    installmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    paidInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    paidText: {
        fontSize: 12,
        color: '#6B7280',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 6,
    },
    nextDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    priceInfo: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 13,
        color: '#111827',
        marginBottom: 4,
    },
    activeBadge: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 20,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#425BA4',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'right',
    },
    insightText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 20,
    },
    reminderCard: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#425BA4',
    },
    reminderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reminderTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 8,
    },
    reminderText: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
    },
    emptyInstallmentWrapper: {
        padding: 30,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    emptyInstallmentText: {
        fontSize: 14,
        color: '#6B7280',
    }
});
