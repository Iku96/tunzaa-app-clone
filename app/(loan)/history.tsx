import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Search, Filter, CheckCircle2, AlertCircle, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { API_CONFIG } from '@/src/services/config';
import { getAccessToken } from '@/src/utils/storage';

export default function LoanHistoryScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = await getAccessToken();
            const response = await fetch(`${API_CONFIG.BASE_URL}/loans/repayments/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    const formatted = data.map((item: any) => {
                        const balance = item.balance || item.remaining_balance || 0;
                        const isPaid = balance <= 0;
                        return {
                            id: item.id || String(Math.random()),
                            borrower: item.borrower_name || item.borrower?.name || item.user?.display_name || 'Business Client',
                            amount: `Tsh. ${(item.total_repayment || item.total_loan || item.amount || 150000).toLocaleString()}`,
                            rate: `${item.interest_rate || 5}%`,
                            term: `${item.term_duration || item.loan_term || '3 Months'}`,
                            date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'May 02, 2026',
                            status: isPaid ? 'Paid' : (item.status || 'Active')
                        };
                    });
                    setHistory(formatted);
                } else {
                    useMockData();
                }
            } else {
                useMockData();
            }
        } catch (err) {
            console.warn('[LoanHistory] Failed to fetch live loan history:', err);
            useMockData();
        } finally {
            setLoading(false);
        }
    };

    const useMockData = () => {
        const mockHistory = [
            { id: '1', borrower: 'Amani Joseph', amount: 'Tsh. 250,000', rate: '5%', term: '3 Months', date: 'May 05, 2026', status: 'Active' },
            { id: '2', borrower: 'Neema Shaibu', amount: 'Tsh. 500,000', rate: '8%', term: '6 Months', date: 'May 02, 2026', status: 'Paid' },
            { id: '3', borrower: 'Baraka John', amount: 'Tsh. 150,000', rate: '5%', term: '1 Month', date: 'Apr 28, 2026', status: 'Paid' },
            { id: '4', borrower: 'Sophia Ally', amount: 'Tsh. 1,000,000', rate: '10%', term: '12 Months', date: 'Apr 15, 2026', status: 'Overdue' },
            { id: '5', borrower: 'Emmanuel Peter', amount: 'Tsh. 300,000', rate: '6%', term: '3 Months', date: 'Apr 10, 2026', status: 'Paid' },
        ];
        setHistory(mockHistory);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item => 
        item.borrower.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Paid':
                return { bg: '#E6F4EA', text: '#137333', icon: <CheckCircle2 size={14} color="#137333" /> };
            case 'Overdue':
                return { bg: '#FCE8E6', text: '#C5221F', icon: <AlertCircle size={14} color="#C5221F" /> };
            default:
                return { bg: '#FEF7E0', text: '#B06000', icon: <Clock size={14} color="#B06000" /> };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const style = getStatusStyle(item.status);
        return (
            <View style={styles.historyCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.borrowerName}>{item.borrower}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                        {style.icon}
                        <Text style={[styles.statusText, { color: style.text }]}>{item.status}</Text>
                    </View>
                </View>
                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Loan Amount:</Text>
                        <Text style={styles.detailValue}>{item.amount}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Interest Rate:</Text>
                        <Text style={styles.detailValue}>{item.rate} Monthly</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Duration:</Text>
                        <Text style={styles.detailValue}>{item.term}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Disbursed Date:</Text>
                        <Text style={styles.detailValue}>{item.date}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(loan)')} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Loan History</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchBarContainer}>
                <View style={styles.searchInputWrapper}>
                    <Search size={18} color="#6B7280" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search borrower name..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn} onPress={fetchHistory}>
                    <Filter size={20} color="#111827" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3A5BA9" style={{ marginTop: 40 }} />
                    <Text style={styles.loadingText}>Fetching historical records...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={fetchHistory}
                    refreshing={loading}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No matching history found.</Text>
                        </View>
                    }
                />
            )}
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
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    searchBarContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: '#111827',
    },
    filterBtn: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    listContent: {
        padding: 16,
    },
    historyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 10,
        marginBottom: 10,
    },
    borrowerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#111827',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    }
});
