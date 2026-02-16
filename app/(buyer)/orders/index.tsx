import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../../src/components/navigation/BottomNav';
import PriceTag from '../../../src/components/common/PriceTag';

const ORDERS = [
    {
        id: '986705',
        date: '22 Apr 2025',
        items: [
            {
                name: 'Samsung Galaxy A23 - 6.6" - 128GB ROM - 6GB RAM',
                price: 450000,
                image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60',
            }
        ],
        paidAmount: 292500,
        totalAmount: 450000,
        progress: 0.65,
        status: 'Pending',
        nextInstallment: 157500,
        type: 'installments'
    },
    {
        id: '986707',
        date: '23 Mar 2025',
        items: [
            {
                name: 'LG Double Door Refrigerator - 260L - Silver..',
                price: 1200000,
                image: 'https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=500&auto=format&fit=crop&q=60',
            }
        ],
        paidAmount: 780000,
        totalAmount: 1200000,
        progress: 0.65,
        status: 'Pending',
        nextInstallment: 420000,
        type: 'installments'
    }
];

export default function OrdersScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Pending');

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {['Pending', 'Completed', 'Gift cards'].map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderOrderItem = (order) => (
        <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => router.push(`/(buyer)/orders/${order.id}`)}
            activeOpacity={0.9}
        >
            <View style={styles.orderHeader}>
                <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{order.type}</Text>
                </View>
                <Text style={styles.dateText}>{order.date}</Text>
            </View>

            <View style={styles.itemRow}>
                <Image source={{ uri: order.items[0].image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{order.items[0].name}</Text>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.itemPrice}>Tsh {order.totalAmount.toLocaleString()}</Text>
                </View>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Kiasi kilicholipwa: Tsh {order.paidAmount.toLocaleString()}</Text>
                    <Text style={styles.progressPercent}>{Math.round(order.progress * 100)}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${order.progress * 100}%` }]} />
                </View>
            </View>

            <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Lipa Tsh {order.nextInstallment.toLocaleString()}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A55A2" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Order</Text>
            </View>

            <View style={styles.content}>
                {renderTabs()}

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {activeTab === 'Pending' ? (
                        ORDERS.map(renderOrderItem)
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="documents-outline" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders</Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray background
    },
    header: {
        backgroundColor: '#4A55A2',
        paddingTop: 60,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    activeTab: {
        backgroundColor: '#4A55A2',
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Space for bottom nav
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tagContainer: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: '#4A55A2',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    orderId: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        alignSelf: 'flex-end',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4A55A2',
        borderRadius: 3,
    },
    actionButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 12,
        borderRadius: 24, // Pill shape button
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
    },
});
