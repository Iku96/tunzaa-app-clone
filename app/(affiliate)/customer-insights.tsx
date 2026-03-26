import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users } from 'lucide-react-native';

export default function CustomerInsightsScreen() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Customer Profile insight</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.sectionTitle}>Overview</Text>

                {/* Primary Overview Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.totalCustomersHeader}>
                        <Users size={20} color="#FFFFFF" strokeWidth={2.5} />
                        <Text style={styles.totalCustomersValue}>1200</Text>
                    </View>
                    <Text style={styles.totalCustomersLabel}>Total Customers Reached</Text>

                    <View style={styles.innerCardsRow}>
                        <View style={styles.innerCard}>
                            <Text style={styles.innerCardValue}>833</Text>
                            <Text style={styles.innerCardLabel}>Follower Referred</Text>
                        </View>
                        <View style={styles.innerCard}>
                            <Text style={styles.innerCardValue}>32.4%</Text>
                            <Text style={styles.innerCardLabel}>Buyer Converted</Text>
                        </View>
                    </View>
                </View>

                {/* Follower Conversion Insight */}
                <Text style={styles.subtitle}>Follower Conversion Insight</Text>
                
                <View style={styles.progressContainer}>
                    <View style={styles.progressValueRow}>
                        <Text style={styles.progressValueText}>90%</Text>
                        <Text style={styles.progressValueText}>10%</Text>
                    </View>
                    <View style={styles.progressBarWrapper}>
                        <View style={[styles.progressFill, { width: '90%', backgroundColor: '#3A5BA9' }]} />
                        <View style={[styles.progressFill, { width: '10%', backgroundColor: '#F3F4F6' }]} />
                    </View>
                    <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabelText}>Paying Followers</Text>
                        <Text style={styles.progressLabelText}>Non paying - followers</Text>
                    </View>
                </View>

                {/* Divider Line */}
                <View style={styles.divider} />

                {/* Payment Preferences Insight */}
                <Text style={styles.subtitle}>Payment Preferences Insight</Text>

                <View style={styles.payingUsersHeader}>
                    <Users size={20} color="#3A5BA9" />
                    <Text style={styles.payingUsersValue}>1000 <Text style={styles.payingUsersLabel}>Total Paying users</Text></Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressValueRow}>
                        <Text style={styles.progressValueText}>90%</Text>
                        <Text style={styles.progressValueText}>10%</Text>
                    </View>
                    <View style={styles.progressBarWrapper}>
                        <View style={[styles.progressFill, { width: '90%', backgroundColor: '#3A5BA9' }]} />
                        <View style={[styles.progressFill, { width: '10%', backgroundColor: '#F3F4F6' }]} />
                    </View>
                    <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabelText}>Installments paying users(90%)</Text>
                        <Text style={styles.progressLabelText}>One time payment users</Text>
                    </View>
                </View>

                {/* Divider Line */}
                <View style={styles.divider} />

                {/* Spending Insight */}
                <Text style={styles.subtitle}>Spending Insight</Text>
                
                <View style={styles.barChartContainer}>
                    {/* Y Axis line */}
                    <View style={styles.yAxisLine} />
                    
                    <View style={styles.barChartContent}>
                        <View style={styles.barRow}>
                            <View style={[styles.barFill, { width: '85%', backgroundColor: '#3A5BA9' }]} />
                            <Text style={styles.barChartLabel}>52</Text>
                        </View>
                        <View style={styles.barRow}>
                            <View style={[styles.barFill, { width: '65%', backgroundColor: '#059669' }]} />
                            <Text style={styles.barChartLabel}>40%</Text>
                        </View>
                        <View style={styles.barRow}>
                            <View style={[styles.barFill, { width: '45%', backgroundColor: '#6B7280' }]} />
                            <Text style={styles.barChartLabel}>20%</Text>
                        </View>
                        <View style={styles.barRow}>
                            <View style={[styles.barFill, { width: '25%', backgroundColor: '#F3F4F6' }]} />
                            <Text style={styles.barChartLabel}>10%</Text>
                        </View>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    overviewCard: {
        backgroundColor: '#4268C1', // Slightly lighter blue matching Image 1
        borderRadius: 12,
        padding: 24,
        marginBottom: 32,
        alignItems: 'center',
    },
    totalCustomersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    totalCustomersValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    totalCustomersLabel: {
        fontSize: 14,
        color: '#E0E7FF',
        marginBottom: 20,
    },
    innerCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    innerCard: {
        flex: 1,
        backgroundColor: '#5A7ECB', // Even lighter blue for inner rectangles
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 4,
    },
    innerCardValue: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    innerCardLabel: {
        color: '#E0E7FF',
        fontSize: 11,
    },
    progressContainer: {
        marginBottom: 10,
    },
    progressValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressValueText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    progressBarWrapper: {
        flexDirection: 'row',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabelText: {
        fontSize: 11,
        color: '#4B5563',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 24,
        width: '150%',
        alignSelf: 'center', // Bleeds to edges
    },
    payingUsersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    payingUsersValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 8,
    },
    payingUsersLabel: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#4B5563',
    },
    barChartContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    yAxisLine: {
        width: 1,
        backgroundColor: '#D1D5DB',
        marginRight: 10,
    },
    barChartContent: {
        flex: 1,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    barFill: {
        height: 20,
        borderRadius: 4,
    },
    barChartLabel: {
        fontSize: 12,
        color: '#4B5563',
        marginLeft: 8,
    }
});
