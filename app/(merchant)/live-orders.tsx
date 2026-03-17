import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, Filter } from 'lucide-react-native';
import Svg, { G, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

type OrderFilter = 'Completed' | 'Installments' | 'Pending';

export default function OrdersAndSalesScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<OrderFilter>('Completed');

    // Donut Chart Logic
    const size = 180;
    const strokeWidth = 35;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // Percentages (Mock for UI)
    const completed = 65;
    const installments = 25;
    const pending = 10;

    // Table Data based on filter
    const getTableData = () => {
        if (activeFilter === 'Completed') {
            return [
                { id: '321', name: '2 Mugs', time: '10/07/2026' },
                { id: '322', name: '2 LG Speakers', time: 'Installments' },
            ];
        } else if (activeFilter === 'Installments') {
            return [
                { id: '121', name: '2 Mugs', price: '140,000/=' },
                { id: '122', name: '2 LG Speakers', price: '25,000/=' },
            ];
        } else {
            return [
                { id: '221', name: '2 Mugs', status: 'Blocked' },
                { id: '222', name: '2 LG Speakers', status: 'Installments' },
            ];
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders and sales</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Orders and sales Insight</Text>

                {/* Donut Chart */}
                <View style={styles.chartContainer}>
                    <Svg width={size} height={size}>
                        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#01AC00"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={0}
                                fill="transparent"
                            />
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#425BA4"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (installments / 100) * circumference}
                                fill="transparent"
                                rotation={(completed / 100) * 360}
                                origin={`${size / 2}, ${size / 2}`}
                            />
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#FF4D4D"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (pending / 100) * circumference}
                                fill="transparent"
                                rotation={((completed + installments) / 100) * 360}
                                origin={`${size / 2}, ${size / 2}`}
                            />
                        </G>
                    </Svg>
                    
                    <View style={styles.chartCenterTextContainer}>
                        <Text style={styles.chartCenterNumber}>164</Text>
                        <Text style={styles.chartCenterLabel}>Total Orders Placed on Your Store</Text>
                        <Text style={styles.chartCenterDate}>1 March - 10 March</Text>
                    </View>
                </View>

                {/* Legend */}
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#01AC00' }]} />
                        <Text style={styles.legendText}>65 Completed Orders</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#425BA4' }]} />
                        <Text style={styles.legendText}>25 Installments orders</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#FF4D4D' }]} />
                        <Text style={styles.legendText}>Pending Orders</Text>
                    </View>
                </View>

                {/* Filters Row */}
                <View style={styles.filtersWrapper}>
                    <TouchableOpacity style={styles.timeDropdown}>
                        <Text style={styles.timeText}>Last 10 days ago</Text>
                        <ChevronDown size={14} color="#6B7280" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                    
                    <Text style={styles.dateRangeText}>1 March - June 1</Text>
                </View>

                {/* Filter Selector */}
                <View style={styles.tableFilterHeader}>
                    <Text style={styles.filterByLabel}>Filter by order Type</Text>
                    <TouchableOpacity style={styles.typeDropdown}>
                        <Text style={styles.typeText}>{activeFilter} Orders</Text>
                        <ChevronDown size={14} color="#6B7280" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>

                {/* Quick Tabs (Alternative to dropdown as seen in Figma) */}
                <View style={styles.tabsRow}>
                    {(['Completed', 'Installments', 'Pending'] as OrderFilter[]).map((tab) => (
                        <TouchableOpacity 
                            key={tab} 
                            onPress={() => setActiveFilter(tab)}
                            style={[styles.tab, activeFilter === tab && styles.activeTab]}
                        >
                            <Text style={[styles.tabText, activeFilter === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Table */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Order Number</Text>
                        <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'center' }]}>Product name</Text>
                        <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>
                            {activeFilter === 'Completed' ? 'Expected delivery Time' : activeFilter === 'Installments' ? 'Price' : 'Order State'}
                        </Text>
                    </View>

                    {getTableData().map((item, index) => (
                        <View key={item.id} style={[styles.tableRow, index % 2 === 1 && styles.alternateRow]}>
                            <Text style={[styles.tableRowText, { flex: 1 }]}>#{item.id}</Text>
                            <Text style={[styles.tableRowText, { flex: 2, textAlign: 'center' }]}>{item.name}</Text>
                            <Text style={[styles.tableRowText, { flex: 1.5, textAlign: 'right' }]}>
                                {(item as any).time || (item as any).price || (item as any).status}
                            </Text>
                        </View>
                    ))}
                </View>

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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 24,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 220,
        marginBottom: 20,
        position: 'relative',
    },
    chartCenterTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 140,
    },
    chartCenterNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
    },
    chartCenterLabel: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
    },
    chartCenterDate: {
        fontSize: 9,
        color: '#9CA3AF',
        marginTop: 4,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 30,
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 10,
        color: '#111827',
        fontWeight: '500',
    },
    filtersWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    timeText: {
        fontSize: 12,
        color: '#6B7280',
    },
    dateRangeText: {
        fontSize: 11,
        color: '#6B7280',
    },
    tableFilterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterByLabel: {
        fontSize: 13,
        color: '#374151',
        marginRight: 10,
    },
    typeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    typeText: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '500',
    },
    tabsRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 8,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    activeTab: {
        backgroundColor: '#425BA4',
    },
    tabText: {
        fontSize: 12,
        color: '#6B7280',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    tableContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#F9FAFB',
    },
    tableHeaderText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    alternateRow: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth:1,
        borderBottomColor: '#F3F4F6',
    },
    tableRowText: {
        fontSize: 12,
        color: '#111827',
        fontWeight: '500',
    }
});
