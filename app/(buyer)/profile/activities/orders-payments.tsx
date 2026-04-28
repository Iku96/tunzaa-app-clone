import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersPaymentsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders & payments</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Monthly Overview Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Monthly Overview</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>May 2024</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Total one time</Text>
                            <Text style={styles.statValue}>Tzs 22, 000</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Total Installment</Text>
                            <Text style={styles.statValue}>Tzs 70,000.</Text>
                        </View>
                    </View>
                </View>

                {/* Payment distribution */}
                <Text style={styles.sectionTitle}>Payment distribution</Text>

                {/* Custom Donut Chart visualization (Approximation) */}
                <View style={styles.chartContainer}>
                    <View style={styles.donutRing}>
                        <View style={styles.donutInner} />
                    </View>
                </View>

                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                        <Text style={styles.legendText}>Installments (80%)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#425BA4' }]} />
                        <Text style={styles.legendText}>one-time payment (20%)</Text>
                    </View>
                </View>

                {/* Active installments */}
                <Text style={[styles.sectionTitle, { marginTop: 40 }]}>Active installments</Text>

                <View style={styles.installmentCard}>
                    <View style={styles.installmentHeader}>
                        <Text style={styles.productName}>iPhone 16 pro Max</Text>
                        <Text style={styles.productPrice}>Tsh 450,000 / 6 months</Text>
                    </View>
                    <View style={styles.installmentMeta}>
                        <Text style={styles.metaText}>3 of 12 paid  •  Next : Aug 22</Text>
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: '45%' }]} />
                        <Text style={styles.progressText}>45%</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    scrollContent: {
        paddingTop: 16,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    overviewCard: {
        backgroundColor: '#425BA4',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#FFFFFF33',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statCol: {
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#FFFFFF33',
        marginHorizontal: 16,
    },
    statLabel: {
        color: '#E0E7FF',
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 24,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    // Donut chart mockup
    donutRing: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 24,
        borderColor: '#22C55E', // Main color for installments
        borderTopColor: '#425BA4', // Secondary color for one-time
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '45deg' }] // Adjust starting angle
    },
    donutInner: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: '#FFFFFF',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#6B7280',
    },
    installmentCard: {
        marginTop: 16,
    },
    installmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    productPrice: {
        fontSize: 13,
        color: '#6B7280',
    },
    installmentMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    activeBadge: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    activeBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#425BA4',
        borderRadius: 4,
    },
    progressText: {
        position: 'absolute',
        right: 0,
        bottom: -20,
        fontSize: 11,
        color: '#1A1A1A',
        fontWeight: '500',
    }
});
