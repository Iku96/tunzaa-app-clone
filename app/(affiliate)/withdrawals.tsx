import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const MOCK_WITHDRAWALS = [
    {
        id: 'WD789121',
        amount: 'Tsh 500,000',
        date: 'Dec 10, 2024',
        status: 'Pending',
        method: 'Bank Transfer',
        requestDate: 'March 15, 2024',
    },
    {
        id: 'WD789122',
        amount: 'Tsh 250,000',
        date: 'Nov 22, 2024',
        status: 'Completed',
        method: 'Bank Transfer',
        requestDate: 'Nov 18, 2024',
    }
];

export default function WithdrawalsHistoryScreen() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    const handleViewDetails = (id: string) => {
        router.push(`/(affiliate)/withdrawal-${id}` as any);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Withdraw Status</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.list}>
                    {MOCK_WITHDRAWALS.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.card}
                            onPress={() => handleViewDetails(item.id)}
                        >
                            <View style={styles.cardTopRow}>
                                <Text style={styles.amountText}>{item.amount}</Text>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: item.status === 'Pending' ? '#DCFCE7' : '#F3F4F6' }
                                ]}>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: item.status === 'Pending' ? '#22C55E' : '#9CA3AF' }
                                    ]} />
                                    <Text style={[
                                        styles.statusText,
                                        { color: item.status === 'Pending' ? '#166534' : '#4B5563' }
                                    ]}>{item.status}</Text>
                                </View>
                            </View>

                            <View style={styles.cardMidRow}>
                                <Text style={styles.dateText}>{item.date}</Text>
                                <Text style={styles.idText}>ID: #{item.id}</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.cardBottomRow}>
                                <Text style={styles.methodText}>{item.method}</Text>
                                <Text style={styles.requestDateText}>Request Date: {item.requestDate}</Text>
                            </View>
                        </TouchableOpacity>
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
    list: {
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    amountText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardMidRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    dateText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    idText: {
        fontSize: 13,
        color: '#6B7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 16,
    },
    cardBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    methodText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    requestDateText: {
        fontSize: 12,
        color: '#6B7280',
    }
});
