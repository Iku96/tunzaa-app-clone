import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/src/services/orders';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import VendorDeliveryCard from '@/components/orders/VendorDeliveryCard';

export default function VendorDeliveriesScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const vendorId = user?.user_id || user?.id || '';
    const [activeTab, setActiveTab] = useState('Pending');

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['vendorDeliveries', vendorId],
        queryFn: () => orderApi.getVendorOrders({ vendor_id: vendorId, limit: 50 }),
        enabled: !!vendorId
    });

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {['Pending', 'Completed', 'Return Orders'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, isActive && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderPendingCard = (item: any) => {
        const address = item.shipping_address;
        const customerName = address ? `${address.first_name} ${address.last_name}` : 'Unknown Customer';
        const address1 = address ? `${address.address_line1}${address.address_line2 ? `, ${address.address_line2}` : ''}` : 'No Address';
        const address2 = address ? `${address.city}, ${address.country}` : '';
        
        return (
            <VendorDeliveryCard
                key={item.order_id}
                customerName={customerName}
                addressLine1={address1}
                addressLine2={address2}
                onCallPress={() => {
                    if (address?.phone) {
                        // Import Linking inside here to avoid top-level issues if not needed
                        const { Linking } = require('react-native');
                        Linking.openURL(`tel:${address.phone}`);
                    }
                }}
                onViewDetailsPress={() => router.push(`/(merchant)/orders/${item.order_id}`)}
            />
        );
    };

    const orders = ordersData?.items || [];
    const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'completed' && o.status !== 'returned' && o.status !== 'refunded' && o.status !== 'return_requested');
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
    const returnOrders = orders.filter(o => o.status === 'returned' || o.status === 'refunded' || o.status === 'return_requested');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Orders</Text>
                <View style={{ width: 24 }} />
            </View>

            {renderTabs()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="large" color="#425BA4" />
                        <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading deliveries...</Text>
                    </View>
                ) : (
                    <>
                        {activeTab === 'Pending' && (
                            pendingOrders.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No pending delivery orders</Text>
                                </View>
                            ) : (
                                pendingOrders.map(renderPendingCard)
                            )
                        )}
                        {activeTab === 'Completed' && (
                            completedOrders.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No completed delivery orders</Text>
                                </View>
                            ) : (
                                completedOrders.map(renderPendingCard) // Reuse pending layout for completed for now, or build a specific completed card
                            )
                        )}
                        {activeTab === 'Return Orders' && (
                            returnOrders.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No return orders</Text>
                                </View>
                            ) : (
                                returnOrders.map(renderPendingCard) // Reuse layout for returns for now
                            )
                        )}
                    </>
                )}
            </ScrollView>
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
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#1F2937',
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#1F2937',
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 110,
        backgroundColor: '#F3F4F6',
        minHeight: '100%',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
});
