import { useLanguage } from "../../../src/contexts/LanguageContext";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/src/services/orders';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';

import DeliveryRouteCard from '@/components/orders/DeliveryRouteCard';
import DeliveryCompletedCard from '@/components/orders/DeliveryCompletedCard';
import DeliveryReturnCard from '@/components/orders/DeliveryReturnCard';

export default function BuyerDeliveriesScreen() {
    const { t } = useLanguage();
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const userId = user?.user_id || user?.id || '';
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState(t.deliveriesTabOnRoute);

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['userOrders', userId],
        queryFn: () => orderApi.getUserOrders(userId, { limit: 50 }),
        enabled: !!userId
    });

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {[t.deliveriesTabOnRoute, t.deliveriesTabCompleted, t.deliveriesTabReturn].map((tab) => {
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

    const renderOnRouteCard = (item: any) => {
        let statusStep = 0;
        if (item.status === 'in_transit') statusStep = 1;
        
        return (
            <DeliveryRouteCard
                key={item.order_id}
                etaText={t.deliveriesArrivingIn} // MOCKED
                statusStep={statusStep}
                driverName="Simba Courier"
                driverId={item.delivery_details?.partner_id?.slice(0,8) || "N/A"}
                driverRating={4.8}
                driverTrips={124}
                onViewDetailsPress={() => router.push(`/(buyer)/orders/tracking?orderId=${item.order_id}`)}
            />
        );
    };

    const renderCompletedCard = (item: any) => {
        const itemName = item.items?.[0]?.name || t.deliveriesUnknownProduct;
        const itemImage = item.items?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image';
        const address = item.shipping_address;
        const addressStr = address ? `${address.address_line1}, ${address.city}` : t.deliveriesNoAddress;
        const date = new Date(item.updated_at || item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return (
            <DeliveryCompletedCard
                key={item.order_id}
                productName={itemName}
                productImage={itemImage}
                courierName="Simba Courier" // MOCKED until partner details populated
                deliveryAddress={addressStr}
                deliveryTime={date}
                onViewDetailsPress={() => router.push(`/(buyer)/orders/tracking?orderId=${item.order_id}`)}
            />
        );
    };

    const renderReturnCard = (item: any) => {
        const itemName = item.items?.[0]?.name || 'Unknown Product';
        const itemImage = item.items?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image';
        const price = item.totals?.total ? `Tsh ${new Intl.NumberFormat('en-US').format(item.totals.total)}` : 'Tsh 0';

        return (
            <DeliveryReturnCard
                key={item.order_id}
                productName={itemName}
                productPrice={price}
                productImage={itemImage}
                orderId={item.order_number || item.order_id.slice(0, 8)}
                sellerName={t.deliveriesTunzaaVendor}
                returnId={`RET-${item.order_id.slice(0, 6).toUpperCase()}`}
                returnReason={t.deliveriesDefective} // MOCKED
                returnQuantity={1}
                returnStatus={item.status === 'refunded' ? 'completed' : 'requested'}
                onViewDetailsPress={() => {}}
            />
        );
    };

    const orders = ordersData?.items || [];
    const onRouteOrders = orders.filter(o => o.status === 'shipped' || o.status === 'in_transit');
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
    const returnOrders = orders.filter(o => o.status === 'returned' || o.status === 'refunded' || o.status === 'return_requested');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.deliveriesTitle}</Text>
                <View style={{ width: 24 }} />
            </View>

            {renderTabs()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="large" color="#425BA4" />
                        <Text style={{ marginTop: 12, color: '#6B7280' }}>{t.deliveriesLoading}</Text>
                    </View>
                ) : (
                    <>
                        {activeTab === t.deliveriesTabOnRoute && (
                            onRouteOrders.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>{t.deliveriesEmptyOnRoute}</Text>
                                </View>
                            ) : (
                                onRouteOrders.map(renderOnRouteCard)
                            )
                        )}
                        {activeTab === t.deliveriesTabCompleted && (
                            completedOrders.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>{t.deliveriesEmptyCompleted}</Text>
                                </View>
                            ) : (
                                completedOrders.map(renderCompletedCard)
                            )
                        )}
                        {activeTab === t.deliveriesTabReturn && (
                            returnOrders.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>{t.deliveriesEmptyReturn}</Text>
                                </View>
                            ) : (
                                returnOrders.map(renderReturnCard)
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
