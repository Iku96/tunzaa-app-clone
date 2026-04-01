import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RefundsScreen() {
    const router = useRouter();

    const mockRefunds = [
        {
            id: 'REF-22345',
            item: 'Samsung Galaxy S22',
            date: '25 May 2024',
            amount: 'Tsh 1,500,000',
            status: 'In Progress',
            image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=200',
        }
    ];

    const renderRefundItem = ({ item }: { item: typeof mockRefunds[0] }) => (
        <TouchableOpacity 
            style={styles.refundCard}
            onPress={() => router.push(`/(buyer)/profile/activities/refund-detail?id=${item.id}` as any)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.refundId}>{item.id}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.item}</Text>
                    <Text style={styles.itemDate}>{item.date}</Text>
                    <Text style={styles.itemAmount}>{item.amount}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refunds & returns</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={mockRefunds}
                keyExtractor={(item) => item.id}
                renderItem={renderRefundItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color="#E5E7EB" />
                        <Text style={styles.emptyText}>No refund requests found</Text>
                    </View>
                }
            />
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    listContent: {
        padding: 20,
    },
    refundCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    refundId: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9CA3AF',
        textTransform: 'uppercase',
    },
    statusBadge: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#D97706',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    itemDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    itemAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 15,
        color: '#9CA3AF',
        marginTop: 16,
    },
});
