import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock Data
const TRANSFER_ORDERS = [
    {
        id: '1',
        name: 'Samsung Galaxy A23',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60',
        orderId: '#OD87652',
        totalPrice: 450000,
        paidAmount: 292500,
        date: '12 Apr 2023',
    },
    {
        id: '2',
        name: 'Samsung Galaxy A23 - 6.6" - 128GB ROM - 6GB RAM',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60',
        orderId: '#OD87652',
        totalPrice: 450000,
        paidAmount: 292500,
        date: '12 Apr 2023',
    },
    {
        id: '3',
        name: 'LG Double Door Refrigerator - 260L - Silver..',
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=500&auto=format&fit=crop&q=60',
        orderId: '#OD87452',
        totalPrice: 1200000,
        paidAmount: 0,
        date: '28 Mar 2023',
    },
];

export default function TransferIndexScreen() {
    const router = useRouter();

    const handleTransfer = (order) => {
        // Pass selected order ID to review screen
        router.push({
            pathname: '/(buyer)/transfer/review',
            params: { fromId: order.id }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transfer Fund</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>Your Order</Text>
                <Text style={styles.description}>Choose the order you want to transfer from</Text>

                <ScrollView contentContainerStyle={styles.list}>
                    {TRANSFER_ORDERS.map((item) => {
                        const progress = item.totalPrice > 0 ? (item.paidAmount / item.totalPrice) : 0;
                        const percentage = Math.round(progress * 100);

                        return (
                            <View key={item.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>Installments</Text>
                                    </View>
                                    <Text style={styles.dateText}>{item.date}</Text>
                                </View>

                                <View style={styles.productRow}>
                                    <Image source={{ uri: item.image }} style={styles.productImage} />
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                                        <Text style={styles.orderId}>Order {item.orderId}</Text>
                                        <Text style={styles.price}>Tsh {item.totalPrice.toLocaleString()}</Text>
                                    </View>
                                </View>

                                <View style={styles.progressSection}>
                                    <View style={styles.progressLabels}>
                                        <Text style={styles.labels}>Kiasi kilicholipwa: Tsh {item.paidAmount.toLocaleString()}</Text>
                                        <Text style={styles.percentageText}>{percentage}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.transferButton}
                                    onPress={() => handleTransfer(item)}
                                >
                                    <Text style={styles.transferButtonText}>Transfer Fund</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    list: {
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#3B82F6',
        fontSize: 10,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    productRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'center',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        transform: [{ rotate: '-12deg' }],
        backgroundColor: '#F3F4F6',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    orderId: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    labels: {
        fontSize: 12,
        color: '#4B5563',
    },
    percentageText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4A55A2',
        borderRadius: 3,
    },
    transferButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
    },
    transferButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
