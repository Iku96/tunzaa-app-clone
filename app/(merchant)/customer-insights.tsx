import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useGetVendorGMV } from '../../src/services/reports';

export default function CustomerInsightsScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const vendorId = user?.profiles?.[0]?.profile_id || '';
    
    // Attempt to get followers from profile metadata (fallback to Figma value)
    const followersCount = user?.profiles?.[0]?.metadata?.followers_count || 1200;

    // Fetch vendor GMV to use actual order count as a proxy for paying users
    const { data: gmvData, isLoading } = useGetVendorGMV(vendorId);
    
    // Calculate total paying users. If API fails, fallback to Figma value (1000)
    const totalPayingUsers = gmvData?.data?.[0]?.['orders.count'] || 1000;
    
    // Ensure we don't have > 100% conversion due to mock/fallback data misalignments
    const cappedPayingUsers = Math.min(totalPayingUsers, followersCount);
    
    // Calculate percentages
    const payingPercentage = Math.round((cappedPayingUsers / Math.max(followersCount, 1)) * 100);
    const nonPayingPercentage = 100 - payingPercentage;
    
    // Hardcoded Payment Preferences (no endpoint for payment methods used by buyers yet)
    const cardPercentage = 90;
    const mobilePercentage = 10;

    // SVG Donut Chart Configuration
    const radius = 90;
    const strokeWidth = 35;
    const circumference = 2 * Math.PI * radius;
    // Calculate strokeDasharray to split the circle into segments
    const payingStrokeDashoffset = circumference - (payingPercentage / 100) * circumference;
    // We adjust the rotation to start Red at the top left as per Figma
    const rotation = -90; 

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Customer Profile insight</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.sectionTitle}>Overview</Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#3B5998" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        <View style={styles.followerSummary}>
                            <View style={styles.followerCountRow}>
                                <Ionicons name="people-outline" size={20} color="#1F2937" style={{ marginRight: 8 }} />
                                <Text style={styles.followerCountText}>{followersCount.toLocaleString()} Followers</Text>
                            </View>
                            <Text style={styles.followerDescText}>
                                {payingPercentage}% of your followers have made a purchase from your store.
                            </Text>
                        </View>

                        {/* Donut Chart */}
                        <View style={styles.chartContainer}>
                            <Svg height={250} width={250} viewBox={`0 0 250 250`}>
                                <G rotation={rotation} origin="125, 125">
                                    {/* Green: Paying Followers (Full circle underneath, stroked over) */}
                                    <Circle
                                        cx="125"
                                        cy="125"
                                        r={radius}
                                        stroke="#10B981" // Green
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                    />
                                    {/* Red/Brown: Non-Paying Followers (Overlapped segment) */}
                                    <Circle
                                        cx="125"
                                        cy="125"
                                        r={radius}
                                        stroke="#C2410C" // Dark orange/red
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - (nonPayingPercentage / 100) * circumference}
                                    />
                                </G>
                            </Svg>

                            <View style={styles.legendRow}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                    <Text style={styles.legendText}>{payingPercentage}% Paying Followers</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: '#C2410C' }]} />
                                    <Text style={styles.legendText}>{nonPayingPercentage}% Non Paying Followers</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Follower Conversion Insight */}
                        <View style={styles.insightSection}>
                            <Text style={styles.sectionTitle}>Follower Conversion Insight</Text>
                            
                            <View style={styles.barLabelsRow}>
                                <Text style={styles.barLabelBold}>{payingPercentage}%</Text>
                                <Text style={styles.barLabelBold}>{nonPayingPercentage}%</Text>
                            </View>

                            <View style={styles.horizontalBarTrack}>
                                <View style={[styles.horizontalBarFill, { width: `${payingPercentage}%`, backgroundColor: '#3B5998' }]} />
                            </View>
                            
                            <View style={styles.barLabelsRow}>
                                <Text style={styles.barLabelSmall}>Paying Followers</Text>
                                <Text style={styles.barLabelSmall}>Non paying - followers</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Payment Preferences Insight */}
                        <View style={styles.insightSection}>
                            <Text style={styles.sectionTitle}>Payment Preferences Insight</Text>

                            <View style={styles.followerCountRow}>
                                <Ionicons name="people-outline" size={20} color="#1F2937" style={{ marginRight: 8 }} />
                                <Text style={styles.followerCountText}>{cappedPayingUsers.toLocaleString()}</Text>
                                <Text style={[styles.barLabelSmall, { marginLeft: 6, alignSelf: 'center', marginTop: 2 }]}>Total Paying users</Text>
                            </View>

                            <View style={[styles.barLabelsRow, { marginTop: 20 }]}>
                                <Text style={styles.barLabelBold}>{cardPercentage}%</Text>
                                <Text style={styles.barLabelBold}>{mobilePercentage}%</Text>
                            </View>

                            <View style={[styles.horizontalBarTrack, { backgroundColor: '#F3F4F6' }]}>
                                <View style={[styles.horizontalBarFill, { width: `${cardPercentage}%`, backgroundColor: '#3B5998' }]} />
                            </View>

                            {/* Assuming styling based on Figma cut-off */}
                        </View>
                    </>
                )}
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
        backgroundColor: '#FFFFFF',
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
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 20,
    },
    followerSummary: {
        alignItems: 'center',
        marginBottom: 32,
    },
    followerCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    followerCountText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    followerDescText: {
        fontSize: 15,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        width: '100%',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
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
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 24,
        marginHorizontal: -24, 
    },
    insightSection: {
        marginBottom: 16,
    },
    barLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    barLabelBold: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    barLabelSmall: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    horizontalBarTrack: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    horizontalBarFill: {
        height: '100%',
        borderRadius: 4,
    }
});
