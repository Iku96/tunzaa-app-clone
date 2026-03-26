import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = ['Pending', 'Reviewed', 'Approved', 'Rejected'];

export default function LoanRequestsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Pending');
    const [searchQuery, setSearchQuery] = useState('');

    const mockRequests = [
        { id: '1', vendor: 'Bill Finance', type: 'Product Capital', amount: 500000, status: 'Pending', date: 'Mar 20, 2025' },
        { id: '2', vendor: 'Bill Finance', type: 'Stock Loan', amount: 1200000, status: 'Approved', date: 'Mar 18, 2025' },
        { id: '3', vendor: 'Bill Finance', type: 'Empower Yourself', amount: 250000, status: 'Rejected', date: 'Mar 15, 2025' },
        { id: '4', vendor: 'Bill Finance', type: 'Product Capital', amount: 450000, status: 'Reviewed', date: 'Mar 12, 2025' },
    ];

    const filteredRequests = mockRequests.filter(req => 
        req.status === activeTab && 
        (req.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
         req.amount.toString().includes(searchQuery))
    );

    const renderRequestItem = ({ item }: { item: typeof mockRequests[0] }) => {
        const getBadgeStyle = (status: string) => {
            switch(status) {
                case 'Pending': return styles.badgePending;
                case 'Approved': return styles.badgeApproved;
                case 'Rejected': return styles.badgeRejected;
                case 'Reviewed': return styles.badgeReviewed;
                default: return {};
            }
        };

        const getStatusTextStyle = (status: string) => {
            switch(status) {
                case 'Pending': return styles.statusPending;
                case 'Approved': return styles.statusApproved;
                case 'Rejected': return styles.statusRejected;
                case 'Reviewed': return styles.statusReviewed;
                default: return {};
            }
        };

        return (
            <TouchableOpacity 
                style={styles.requestCard}
                onPress={() => router.push(`/(merchant)/loans/${item.id}/status?status=${item.status.toLowerCase()}`)}
            >
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.vendorName}>{item.vendor}</Text>
                        <Text style={styles.loanType}>{item.type}</Text>
                    </View>
                    <View style={[styles.statusBadge, getBadgeStyle(item.status)]}>
                        <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>{item.status}</Text>
                    </View>
                </View>
                
                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.amountLabel}>Amount</Text>
                        <Text style={styles.amountValue}>Tsh {item.amount.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Loan Requests</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {TABS.map((tab) => (
                        <TouchableOpacity 
                            key={tab} 
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredRequests}
                keyExtractor={(item) => item.id}
                renderItem={renderRequestItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-outline" size={60} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No {activeTab.toLowerCase()} requests found</Text>
                    </View>
                }
            />
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
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#111827',
    },
    tabsContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        marginBottom: 16,
    },
    tabsScroll: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginRight: 10,
        borderRadius: 20,
    },
    tabActive: {
        backgroundColor: '#3B5998',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: 20,
    },
    requestCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    vendorName: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    loanType: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgePending: { backgroundColor: '#FEF3C7' },
    badgeApproved: { backgroundColor: '#D1FAE5' },
    badgeRejected: { backgroundColor: '#FEE2E2' },
    badgeReviewed: { backgroundColor: '#E0E7FF' },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statusPending: { color: '#D97706' },
    statusApproved: { color: '#059669' },
    statusRejected: { color: '#DC2626' },
    statusReviewed: { color: '#4F46E5' },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    amountLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    amountValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9CA3AF',
    }
});
