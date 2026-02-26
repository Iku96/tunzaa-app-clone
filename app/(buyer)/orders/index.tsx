import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../../src/components/navigation/BottomNav';
import PriceTag from '../../../src/components/common/PriceTag';

import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useGetOrders } from '../../../src/services/orders';
import { ActivityIndicator } from 'react-native';

export default function OrdersScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const [activeTab, setActiveTab] = useState('Pending');

    // Fetch user orders
    const { data: ordersData, isLoading } = useGetOrders(
        { user_id: user?.user_id },
        !!user?.user_id
    );

    const apiOrders = Array.isArray(ordersData) ? ordersData : (ordersData?.items || []);

    const mappedOrders = apiOrders.map(o => {
        const total = o.totals?.total || 0;
        const paid = o.payment_details?.amount || 0;
        const progress = total > 0 ? (paid / total) : 0;

        return {
            id: o.order_id || o.order_number,
            date: new Date(o.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            items: o.items?.length > 0 ? o.items.map(i => ({
                name: i.name,
                price: i.unit_price,
                image: i.metadata?.image || 'https://via.placeholder.com/150?text=Order',
            })) : [{ name: 'Unknown Item', price: 0, image: 'https://via.placeholder.com/150?text=Wait' }],
            paidAmount: paid,
            totalAmount: total,
            progress: progress > 1 ? 1 : progress,
            status: o.status || 'Pending',
            nextInstallment: Math.max(0, total - paid),
            type: o.payment_details?.method === 'installment' ? 'installments' : 'full payment'
        };
    });

    const displayOrders = mappedOrders.filter(o => {
        if (activeTab === 'Pending') return o.status.toLowerCase() !== 'completed';
        if (activeTab === 'Completed') return o.status.toLowerCase() === 'completed';
        return false;
    });

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
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Order</Text>
                </View>
            </SafeAreaView>

            <View style={styles.content}>
                {renderTabs()}

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {isLoading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color="#4A55A2" />
                            <Text style={styles.emptyText}>Loading orders...</Text>
                        </View>
                    ) : displayOrders.length > 0 ? (
                        displayOrders.map(renderOrderItem)
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
    headerSafe: {
        backgroundColor: '#4A55A2',
    },
    header: {
        backgroundColor: '#4A55A2',
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
