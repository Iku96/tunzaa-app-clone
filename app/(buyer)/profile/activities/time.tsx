import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimeUsageScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly'>('Daily');

    // Mock bar chart data
    const chartData = [
        { day: 'M', height: 20 },
        { day: 'T', height: 0 },
        { day: 'W', height: 0 },
        { day: 'T', height: 0 },
        { day: 'F', height: 0 },
        { day: 'S', height: 0 },
        { day: 'S', height: 0 },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Time usage</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Daily' && styles.activeTab]}
                        onPress={() => setActiveTab('Daily')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Daily' && styles.activeTabText]}>
                            Daily Spent
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Weekly' && styles.activeTab]}
                        onPress={() => setActiveTab('Weekly')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Weekly' && styles.activeTabText]}>
                            Weekly Spent
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Today Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.todayText}>Today</Text>
                    <View style={styles.clockIconContainer}>
                        <Ionicons name="time-outline" size={32} color="#1A1A1A" />
                    </View>
                    <Text style={styles.timeValue}>20m</Text>
                    <Text style={styles.descriptionText}>
                        Average time this you spent looking for the items you want.
                    </Text>
                </View>

                {/* Chart Area */}
                <View style={styles.chartContainer}>
                    {/* Y-axis guidelines */}
                    <View style={styles.guidelines}>
                        <View style={styles.guidelineRow}>
                            <Text style={styles.yAxisLabel}></Text>
                            <View style={styles.line} />
                        </View>
                        <View style={styles.guidelineRow}>
                            <Text style={styles.yAxisLabel}></Text>
                            <View style={styles.line} />
                        </View>
                    </View>

                    {/* Bars */}
                    <View style={styles.barsContainer}>
                        {chartData.map((data, idx) => (
                            <View key={idx} style={styles.barColumn}>
                                <View style={styles.barTrack}>
                                    {data.height > 0 && (
                                        <View style={[styles.barFill, { height: `${data.height}%` }]} />
                                    )}
                                </View>
                                <Text style={[styles.xAxisLabel, data.height > 0 && styles.activeXAxisLabel]}>
                                    {data.day}
                                </Text>
                            </View>
                        ))}
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
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 4,
        marginBottom: 32,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#4A55A2',
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    summaryContainer: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 32,
    },
    todayText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    clockIconContainer: {
        marginBottom: 8,
    },
    timeValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
    },
    chartContainer: {
        height: 200,
        position: 'relative',
        marginTop: 24,
    },
    guidelines: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 30, // Leave room for X-axis labels
        justifyContent: 'space-between',
    },
    guidelineRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    yAxisLabel: {
        width: 10,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#F3F4F6', // very faint lines
    },
    barsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 170, // Matches space above X-axis
    },
    barColumn: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        width: 30,
    },
    barTrack: {
        width: 12,
        height: 140, // Max bar height
        justifyContent: 'flex-end',
    },
    barFill: {
        width: '100%',
        backgroundColor: '#4A55A2',
        borderRadius: 4,
    },
    xAxisLabel: {
        marginTop: 12,
        fontSize: 12,
        color: '#9CA3AF',
    },
    activeXAxisLabel: {
        color: '#4A55A2',
        fontWeight: '600',
    },
});
