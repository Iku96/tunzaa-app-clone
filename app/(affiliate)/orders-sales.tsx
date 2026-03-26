import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import Svg, { G, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_SIZE = 200;
const RADIUS = 80;
const STROKE_WIDTH = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MOCK_ORDERS = [
    { id: '1', number: '#321', product: '2 Mugs', price: 'Tsh 2,500,000/=' },
    { id: '2', number: '#322', product: '2 JBL speakers', price: '970,000/=' },
    { id: '3', number: '#323', product: 'Kitchen Set', price: 'Tsh 1,200,000/=' },
];

export default function OrdersAndSalesScreen() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    // Calculate Donut Segments
    // Total: 70 (40 + 20 + 10)
    const completed = 40;
    const installments = 20;
    const pending = 10;
    const total = completed + installments + pending;

    const completedPercentage = (completed / total) * CIRCUMFERENCE;
    const installmentsPercentage = (installments / total) * CIRCUMFERENCE;
    const pendingPercentage = (pending / total) * CIRCUMFERENCE;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders and sales</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.sectionTitle}>Orders and sales Insight</Text>

                {/* Chart Section */}
                <View style={styles.chartWrapper}>
                    <View style={styles.chartContainer}>
                        <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
                            <G rotation="-90" origin={`${CHART_SIZE / 2}, ${CHART_SIZE / 2}`}>
                                {/* Completed (Green) */}
                                <Circle
                                    cx={CHART_SIZE / 2}
                                    cy={CHART_SIZE / 2}
                                    r={RADIUS}
                                    stroke="#059669"
                                    strokeWidth={STROKE_WIDTH}
                                    strokeDasharray={`${completedPercentage} ${CIRCUMFERENCE}`}
                                    fill="none"
                                />
                                {/* Installments (Gray) */}
                                <Circle
                                    cx={CHART_SIZE / 2}
                                    cy={CHART_SIZE / 2}
                                    r={RADIUS}
                                    stroke="#6B7280"
                                    strokeWidth={STROKE_WIDTH}
                                    strokeDasharray={`${installmentsPercentage} ${CIRCUMFERENCE}`}
                                    strokeDashoffset={-completedPercentage}
                                    fill="none"
                                />
                                {/* Pending (Red) */}
                                <Circle
                                    cx={CHART_SIZE / 2}
                                    cy={CHART_SIZE / 2}
                                    r={RADIUS}
                                    stroke="#DC2626"
                                    strokeWidth={STROKE_WIDTH}
                                    strokeDasharray={`${pendingPercentage} ${CIRCUMFERENCE}`}
                                    strokeDashoffset={-(completedPercentage + installmentsPercentage)}
                                    fill="none"
                                />
                            </G>
                        </Svg>
                        <View style={styles.chartCenterInfo}>
                            <Text style={styles.chartTotalValue}>{total}</Text>
                            <Text style={styles.chartTotalLabel}>Total Orders from Resold Products</Text>
                            <Text style={styles.chartDateRange}>1 march - 10 March</Text>
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
                            <Text style={styles.legendText}>40 Completed orders</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
                            <Text style={styles.legendText}>20 Installments orders</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                            <Text style={styles.legendText}>10 pending Orders</Text>
                        </View>
                    </View>
                </View>

                {/* Filters */}
                <View style={styles.filtersRow}>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Text style={styles.filterBtnText}>Last 10 days ago</Text>
                        <ChevronDown size={16} color="#4B5563" />
                    </TouchableOpacity>
                    <Text style={styles.rangeText}>1 March - June 1</Text>
                </View>

                <View style={styles.typeFilterRow}>
                    <Text style={styles.typeFilterLabel}>Filter by order Type</Text>
                    <TouchableOpacity style={styles.typeDropdown}>
                        <Text style={styles.typeDropdownText}>Completed Orders</Text>
                        <ChevronDown size={20} color="#111827" />
                    </TouchableOpacity>
                </View>

                {/* History Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Order Number</Text>
                        <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Product name</Text>
                        <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Sale Price</Text>
                    </View>

                    {MOCK_ORDERS.map((order) => (
                        <View key={order.id} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{order.number}</Text>
                            <Text style={[styles.tableCell, { flex: 1.5 }]}>{order.product}</Text>
                            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>{order.price}</Text>
                        </View>
                    ))}
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
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 24,
    },
    chartWrapper: {
        alignItems: 'center',
        marginBottom: 32,
    },
    chartContainer: {
        width: CHART_SIZE,
        height: CHART_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    chartCenterInfo: {
        position: 'absolute',
        width: RADIUS * 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartTotalValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    chartTotalLabel: {
        fontSize: 11,
        color: '#4B5563',
        textAlign: 'center',
        marginVertical: 4,
    },
    chartDateRange: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 11,
        color: '#4B5563',
    },
    filtersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    filterBtnText: {
        fontSize: 12,
        color: '#4B5563',
        marginRight: 6,
    },
    rangeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    typeFilterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    typeFilterLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    typeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minWidth: 180,
        justifyContent: 'space-between',
    },
    typeDropdownText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    tableHeaderText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    tableCell: {
        fontSize: 13,
        color: '#111827',
    }
});
