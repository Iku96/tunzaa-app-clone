import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimeUsageScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly'>('Daily');

    // Mock chart data
    const chartData = [
        { day: 'S', value: 40 },
        { day: 'M', value: 20 },
        { day: 'T', value: 60 },
        { day: 'W', value: 50 },
        { day: 'T', value: 30 },
        { day: 'F', value: 10 },
        { day: 'S', value: 25 },
    ];

    const maxVal = Math.max(...chartData.map(d => d.value)) || 1;

    return (
        <SafeAreaView style={styles.safeArea}>
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
                        <Text style={[styles.tabText, activeTab === 'Daily' && styles.activeTabText]}>Daily spent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Weekly' && styles.activeTab]}
                        onPress={() => setActiveTab('Weekly')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Weekly' && styles.activeTabText]}>Weekly Spent</Text>
                    </TouchableOpacity>
                </View>

                {/* Circular timer UI */}
                <View style={styles.timerContainer}>
                    <Text style={styles.timerSubtitle}>Today</Text>
                    <View style={styles.circularProgress}>
                        <View style={styles.innerCircle}>
                            <Ionicons name="time-outline" size={32} color="#1A1A1A" />
                            <Text style={styles.timeValue}>32M</Text>
                        </View>
                    </View>
                    <Text style={styles.insightText}>
                        You spent 5.3 hours on average for the past 7 days
                    </Text>
                </View>

                {/* Bar Chart */}
                <View style={styles.chartContainer}>
                    {chartData.map((data, idx) => (
                        <View key={idx} style={styles.barCol}>
                            <View style={styles.barTrack}>
                                <View style={[
                                    styles.barFill, 
                                    { height: `${(data.value / maxVal) * 100}%` },
                                    data.day === 'W' && styles.activeBar
                                ]} />
                            </View>
                            <Text style={styles.dayLabel}>{data.day}</Text>
                        </View>
                    ))}
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
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
        marginBottom: 48,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#425BA4',
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
    timerContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    timerSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 24,
    },
    circularProgress: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    innerCircle: {
        alignItems: 'center',
    },
    timeValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 8,
    },
    insightText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 40,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 140,
        paddingHorizontal: 10,
        marginBottom: 40,
    },
    barCol: {
        alignItems: 'center',
        width: 30,
    },
    barTrack: {
        width: 12,
        height: 100,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        justifyContent: 'flex-end',
        marginBottom: 12,
    },
    barFill: {
        width: '100%',
        backgroundColor: '#CBD5E1',
        borderRadius: 6,
    },
    activeBar: {
        backgroundColor: '#425BA4',
    },
    dayLabel: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
