import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type UsageTab = 'daily' | 'weekly';

export default function TimeUsageScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<UsageTab>('daily');

    // In a real app, this would come from an API or local tracking
    // For now, we follow the "zero-state" policy for new accounts
    const hasData = false; 

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Clock size={64} color="#E5E7EB" strokeWidth={1.5} />
            <Text style={styles.emptyValue}>0M</Text>
            <Text style={styles.emptySubtext}>
                No usage data recorded for {activeTab === 'daily' ? 'today' : 'this week'} yet.
            </Text>
            
            <View style={styles.chartArea}>
                <View style={styles.chartLine} />
                <View style={[styles.chartLine, { top: '50%' }]} />
                <View style={styles.daysRow}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <Text key={i} style={styles.dayLabel}>{day}</Text>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderChart = () => {
        // Placeholder for when we eventually have real data
        return renderEmptyState();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Time usage</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.tabContainer}>
                <View style={styles.segmentedControl}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
                        onPress={() => setActiveTab('daily')}
                    >
                        <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>Daily Spent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'weekly' && styles.activeTab]}
                        onPress={() => setActiveTab('weekly')}
                    >
                        <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>Weekly Spent</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.dateLabel}>{activeTab === 'daily' ? 'Today' : '10 Aug - Aug 15'}</Text>
                
                {hasData ? renderChart() : renderEmptyState()}
            </View>
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
    tabContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#425BA4',
    },
    tabText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    dateLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 24,
    },
    emptyContainer: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    emptyValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 8,
    },
    chartArea: {
        width: '100%',
        height: 200,
        marginTop: 60,
        position: 'relative',
    },
    chartLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#F3F4F6',
        top: '25%',
    },
    daysRow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    dayLabel: {
        fontSize: 12,
        color: '#9CA3AF',
    }
});
