import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, LayoutGrid, PlusSquare, MoreHorizontal, Calendar, Maximize2 } from 'lucide-react-native';

// Import our cohesive sidebar menu
import SidebarMenu from '../../src/components/merchant/SidebarMenu';

export default function MerchantDashboardScreen() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Orders Mock Data
    const almostCompletedOrders = [
        { id: '1', product: 'Wireless Charger', orders: '189', percentage: '95%' },
        { id: '2', product: 'Wireless Charger', orders: '189', percentage: '95%' },
    ];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Overlay Sidebar Menu */}
            <SidebarMenu isVisible={isSidebarOpen} onClose={closeSidebar} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>

                    <View style={styles.headerRightRow}>
                        <TouchableOpacity style={styles.headerBtn} onPress={toggleSidebar}>
                            <LayoutGrid size={24} color="#111827" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.headerBtn}>
                            <PlusSquare size={24} color="#111827" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.headerBtn}>
                            <MoreHorizontal size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date Selection Row */}
                <View style={styles.dateSectionContainer}>
                    <View style={styles.dateRow}>
                        <TouchableOpacity style={styles.datePill}>
                            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.dateText}>Jun 25, 2025</Text>
                        </TouchableOpacity>

                        <Text style={styles.dateDash}>-</Text>

                        <TouchableOpacity style={styles.datePill}>
                            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.dateText}>Jun 30, 2025</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.reportText}>Report : Jun 20, 2025 - Jun 30, 2025</Text>
                </View>

                {/* Main Blue Payments Card */}
                <View style={styles.mainBlueCard}>
                    <Text style={styles.mainCardSubtitle}>Total Payments Received</Text>
                    <Text style={styles.mainCardTitle}>Tsh.85,0000</Text>

                    <TouchableOpacity style={styles.historyButton}>
                        <Text style={styles.historyButtonText}>View Transaction History</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary Row */}
                <View style={styles.summaryRow}>
                    {/* Orders Placed */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summarySubtitle}>Total Orders Placed</Text>
                        <Text style={styles.summaryTitle}>158</Text>
                        <TouchableOpacity style={styles.viewDetailsBtn}>
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Completed Orders */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summarySubtitle}>Total Completed Orders</Text>
                        <Text style={styles.summaryTitle}>129</Text>
                        <TouchableOpacity style={styles.viewDetailsBtn}>
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Almost Completed List */}
                <View style={styles.listContainer}>
                    {/* List Header */}
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeaderTitle}>Ten Orders Almost Completed - (75%)</Text>
                        <TouchableOpacity style={styles.expandIconBtn}>
                            <Maximize2 size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Table Headers */}
                    <View style={styles.tableHeadRow}>
                        <Text style={[styles.tableHeadText, { flex: 2 }]}>Product Name</Text>
                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Orders</Text>
                        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>Percentage</Text>
                    </View>

                    {/* Table Rows */}
                    {almostCompletedOrders.map((item, index) => (
                        <View key={item.id} style={[
                            styles.tableRow,
                            index !== almostCompletedOrders.length - 1 && styles.tableRowBorder
                        ]}>
                            <Text style={[styles.tableRowText, { flex: 2 }]} numberOfLines={1}>{item.product}</Text>
                            <Text style={[styles.tableRowText, { flex: 1, textAlign: 'center' }]}>{item.orders}</Text>
                            <Text style={[styles.tableRowText, { flex: 1, textAlign: 'right' }]}>{item.percentage}</Text>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        marginBottom: 10,
    },
    headerBtn: {
        padding: 8,
    },
    headerRightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // Using gap to spread right icons
    },
    dateSectionContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
        paddingRight: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    dateText: {
        fontSize: 12,
        color: '#111827',
        fontWeight: '500',
    },
    dateDash: {
        marginHorizontal: 12,
        color: '#111827',
        fontWeight: '500',
    },
    reportText: {
        fontSize: 10,
        color: '#6B7280',
    },
    mainBlueCard: {
        backgroundColor: '#425BA4', // Tunzaa blueish hue
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    mainCardSubtitle: {
        color: '#E0E7FF',
        fontSize: 14,
        marginBottom: 12,
    },
    mainCardTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    historyButton: {
        borderWidth: 1,
        borderColor: '#93A5CF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
    },
    historyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        alignItems: 'center',
    },
    summarySubtitle: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    viewDetailsBtn: {
        backgroundColor: '#01AC00', // Tunzaa Green
        borderRadius: 8,
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    viewDetailsText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    listContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20,
    },
    listHeader: {
        backgroundColor: '#425BA4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    listHeaderTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    expandIconBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableHeadRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tableHeadText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    tableRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tableRowText: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '500',
    }
});
