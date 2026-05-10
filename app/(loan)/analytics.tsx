import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, DollarSign, Users, ShieldAlert, Percent, Award, ArrowUpRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_CONFIG } from '@/src/services/config';
import { getAccessToken } from '@/src/utils/storage';

const { width } = Dimensions.get('window');

export default function LoanAnalyticsScreen() {
    const router = useRouter();

    const [outstandingAmount, setOutstandingAmount] = React.useState<number>(18450000);
    const [activeBorrowersCount, setActiveBorrowersCount] = React.useState<number>(124);
    const [repaymentRate, setRepaymentRate] = React.useState<number>(98.4);

    React.useEffect(() => {
        let isMounted = true;
        const fetchRepayments = async () => {
            try {
                const token = await getAccessToken();
                const response = await fetch(`${API_CONFIG.BASE_URL}/loans/repayments/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok && isMounted) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        let totalPaid = 0;
                        let totalOut = 0;
                        const uniqueBorrowers = new Set<string>();

                        data.forEach((item: any) => {
                            totalPaid += item.amount_paid || item.collected_amount || 0;
                            totalOut += item.balance || item.remaining_balance || 0;
                            if (item.borrower_name || item.name) {
                                uniqueBorrowers.add(item.borrower_name || item.name);
                            }
                        });

                        setOutstandingAmount(totalOut);
                        if (uniqueBorrowers.size > 0) {
                            setActiveBorrowersCount(uniqueBorrowers.size);
                        }

                        const totalPortfolio = totalPaid + totalOut;
                        if (totalPortfolio > 0) {
                            const rate = (totalPaid / totalPortfolio) * 100;
                            setRepaymentRate(parseFloat(rate.toFixed(1)));
                        }
                    }
                }
            } catch (err) {
                console.warn('[Analytics] Failed to fetch live analytics repayments:', err);
            }
        };
        fetchRepayments();
        return () => { isMounted = false; };
    }, []);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/(loan)')} style={styles.backButton}>
                <ArrowLeft size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Loan Analytics</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const renderCard = (icon: React.ReactNode, title: string, value: string, subtitle: string, trendColor: string, trendText: string) => (
        <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>{icon}</View>
                <View style={[styles.trendBadge, { backgroundColor: trendColor === 'green' ? '#ECFDF5' : '#FEF2F2' }]}>
                    <ArrowUpRight size={14} color={trendColor === 'green' ? '#10B981' : '#EF4444'} />
                    <Text style={[styles.trendText, { color: trendColor === 'green' ? '#10B981' : '#EF4444' }]}>{trendText}</Text>
                </View>
            </View>
            <Text style={styles.cardValue}>{value}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.heroSection}>
                    <Text style={styles.heroLabel}>Portfolio Performance</Text>
                    <Text style={styles.heroValue}>{repaymentRate >= 95 ? 'Excellent' : repaymentRate >= 80 ? 'Healthy' : 'Needs Attention'}</Text>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${repaymentRate}%` }]} />
                    </View>
                    <Text style={styles.heroSubtitle}>Your repayment rate is {repaymentRate}% this month, above the industry average.</Text>
                </View>

                <View style={styles.grid}>
                    {renderCard(
                        <DollarSign size={22} color="#425BA4" />,
                        "Outstanding Portfolio",
                        `Tsh. ${outstandingAmount.toLocaleString()}`,
                        "Active principal in market",
                        "green",
                        "+12.4%"
                    )}
                    {renderCard(
                        <Percent size={22} color="#01AC00" />,
                        "Average Interest Yield",
                        "8.5%",
                        "Weighted average yield",
                        "green",
                        "Stable"
                    )}
                    {renderCard(
                        <Users size={22} color="#8B5CF6" />,
                        "Active Borrowers",
                        `${activeBorrowersCount}`,
                        "Clients with active loans",
                        "green",
                        "+8.2%"
                    )}
                    {renderCard(
                        <ShieldAlert size={22} color="#EF4444" />,
                        "Portfolio at Risk (PAR)",
                        "1.6%",
                        "Delinquent past 30 days",
                        "red",
                        "-0.4%"
                    )}
                </View>

                {/* Cashflow Chart Visualization */}
                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Projected Monthly Collections</Text>
                    <View style={styles.chartPlaceholder}>
                        <View style={styles.barContainer}>
                            <View style={[styles.bar, { height: 60 }]} />
                            <Text style={styles.barLabel}>Mar</Text>
                        </View>
                        <View style={styles.barContainer}>
                            <View style={[styles.bar, { height: 90 }]} />
                            <Text style={styles.barLabel}>Apr</Text>
                        </View>
                        <View style={styles.barContainer}>
                            <View style={[styles.bar, { height: 130, backgroundColor: '#01AC00' }]} />
                            <Text style={styles.barLabel}>May</Text>
                        </View>
                        <View style={styles.barContainer}>
                            <View style={[styles.bar, { height: 100 }]} />
                            <Text style={styles.barLabel}>Jun</Text>
                        </View>
                        <View style={styles.barContainer}>
                            <View style={[styles.bar, { height: 150 }]} />
                            <Text style={styles.barLabel}>Jul</Text>
                        </View>
                    </View>
                </View>

                {/* Recommendations */}
                <View style={styles.recommendationsSection}>
                    <Text style={styles.sectionTitle}>Business Insights</Text>
                    <View style={styles.recommendationCard}>
                        <Award size={24} color="#F59E0B" style={styles.insightIcon} />
                        <View style={styles.insightContent}>
                            <Text style={styles.insightTitle}>High-Demand Tier</Text>
                            <Text style={styles.insightDesc}>Loans between Tsh. 100K - 500K have the fastest turnaround and lowest default rate.</Text>
                        </View>
                    </View>
                </View>

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
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    heroSection: {
        backgroundColor: '#425BA4',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
    },
    heroLabel: {
        color: '#E0E7FF',
        fontSize: 14,
        fontWeight: '500',
    },
    heroValue: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    progressContainer: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        marginVertical: 12,
    },
    progressBar: {
        width: '94%',
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 3,
    },
    heroSubtitle: {
        color: '#E0E7FF',
        fontSize: 13,
        lineHeight: 18,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    analyticsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        width: (width - 50) / 2,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    trendText: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 2,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    chartSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    chartPlaceholder: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 180,
        paddingTop: 10,
    },
    barContainer: {
        alignItems: 'center',
    },
    bar: {
        width: 24,
        backgroundColor: '#3A5BA9',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        marginBottom: 8,
    },
    barLabel: {
        fontSize: 11,
        color: '#6B7280',
    },
    recommendationsSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    recommendationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    insightIcon: {
        marginTop: 2,
        marginRight: 12,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    insightDesc: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
    },
});
