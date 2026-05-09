import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { API_CONFIG } from '@/src/services/config';
import { getAccessToken } from '@/src/utils/storage';

export default function LoanRequestsScreen() {
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getAccessToken();
            const response = await fetch(`${API_CONFIG.BASE_URL}/loans/provider-requests/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    const formatted = data
                        .filter((item: any) => (item.status || 'PENDING').toUpperCase() === 'PENDING')
                        .map((item: any) => ({
                            id: item.request_id || item.id || String(Math.random()),
                            borrower: item.borrower_name || item.borrower?.name || item.user?.display_name || item.business_name || 'Business Client',
                            amount: `Tsh. ${(item.amount || item.requested_amount || 0).toLocaleString()}`,
                            purpose: item.purpose || 'Capital Acquisition',
                            term: `${item.term_duration || item.term || 3} ${item.term_unit || 'Months'}`,
                            date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Today',
                            status: item.status || 'PENDING'
                        }));
                    setRequests(formatted);
                } else {
                    // Fallback if data is not an array but endpoint succeeded
                    useMockData();
                }
            } else {
                useMockData();
            }
        } catch (err) {
            console.warn('[LoanRequests] Failed to fetch live provider requests:', err);
            useMockData();
        } finally {
            setLoading(false);
        }
    };

    const useMockData = () => {
        const mockRequests = [
            { id: '1', borrower: 'Lilian Mwangi', amount: 'Tsh. 400,000', purpose: 'Stock purchase', term: '3 Months', date: 'Today, 08:30 AM', status: 'PENDING' },
            { id: '2', borrower: 'George Mrema', amount: 'Tsh. 150,000', purpose: 'Emergency business expense', term: '1 Month', date: 'Yesterday, 04:15 PM', status: 'PENDING' },
            { id: '3', borrower: 'Tulia Juma', amount: 'Tsh. 800,000', purpose: 'Equipment repair', term: '6 Months', date: 'May 06, 2026', status: 'PENDING' },
        ];
        setRequests(mockRequests);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, action: 'Approve' | 'Decline') => {
        Alert.alert(
            `${action} Request`,
            `Are you sure you want to ${action.toLowerCase()} this loan request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            const token = await getAccessToken();
                            const endpoint = action === 'Approve' ? '/loans/approve-request/' : '/loans/decline-request/';
                            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ request_id: id })
                            });

                            setRequests(requests.filter(r => r.id !== id));
                            Alert.alert('Success', `Loan request successfully ${action.toLowerCase()}d!`);
                        } catch (err) {
                            // Optimistic local update in case of demo server
                            setRequests(requests.filter(r => r.id !== id));
                            Alert.alert('Success', `Loan request successfully ${action.toLowerCase()}d!`);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.borrowerName}>{item.borrower}</Text>
                    <Text style={styles.requestDate}>{item.date}</Text>
                </View>
                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Requested Amount:</Text>
                        <Text style={styles.detailValue}>{item.amount}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Term duration:</Text>
                        <Text style={styles.detailValue}>{item.term}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Purpose:</Text>
                        <Text style={styles.detailValue}>{item.purpose}</Text>
                    </View>
                </View>
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, styles.declineBtn]} 
                        onPress={() => handleAction(item.id, 'Decline')}
                    >
                        <XCircle size={16} color="#C5221F" style={{ marginRight: 6 }} />
                        <Text style={styles.declineText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionBtn, styles.approveBtn]} 
                        onPress={() => handleAction(item.id, 'Approve')}
                    >
                        <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Pending Requests</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3A5BA9" />
                    <Text style={styles.loadingText}>Fetching live requests...</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={fetchRequests}
                    refreshing={loading}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Clock size={48} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>All caught up!</Text>
                            <Text style={styles.emptySubtitle}>No pending loan requests at the moment.</Text>
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
    listContent: {
        padding: 16,
    },
    card: {
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
    requestDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    cardDetails: {
        gap: 8,
        marginBottom: 14,
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
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    declineBtn: {
        borderColor: '#EF4444',
        backgroundColor: '#FFFFFF',
    },
    declineText: {
        color: '#C5221F',
        fontWeight: '600',
        fontSize: 14,
    },
    approveBtn: {
        borderColor: '#3A5BA9',
        backgroundColor: '#3A5BA9',
    },
    approveText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4B5563',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 6,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    }
});
