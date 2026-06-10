import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Phone, ChevronDown, Truck, Bike, CheckCircle } from 'lucide-react-native';
import { useGetVendorOrders } from '@/src/services/order-management';
import { useProfileDetails } from '@/hooks/useProfileDetails';
import type { Order } from '@/src/services/types/orders';

type Tab = 'Pending' | 'Completed' | 'Return Orders';

export default function DeliveryOrdersScreen() {
    const router = useRouter();
    const { vendorDetails } = useProfileDetails();
    const VENDOR_ID = vendorDetails?.vendor_id || '';
    
    const [activeTab, setActiveTab] = useState<Tab>('Pending');
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

    const { data: ordersData, isLoading, error } = useGetVendorOrders(
        { vendor_id: VENDOR_ID, limit: 100 },
        !!VENDOR_ID
    );

    const toggleExpand = (orderId: string) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const orders = ordersData?.items || [];

    const pendingOrders = orders.filter(o => ['pending', 'processing', 'confirmed'].includes(o.status.toLowerCase()));
    const completedOrders = orders.filter(o => ['completed', 'delivered'].includes(o.status.toLowerCase()));
    const returnOrders = orders.filter(o => ['cancelled', 'refunded', 'returned'].includes(o.status.toLowerCase()));

    const formatCurrency = (amount: number, currency: string = "TZS") => {
        if (currency === "TZS") {
            return `Tsh ${amount.toLocaleString()}`;
        }
        return `${currency} ${amount.toLocaleString()}`;
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderPendingCard = (order: Order) => {
        const address = order.shipping_address;
        const item = order.items?.[0]; // Assuming first item for summary
        const shippingFee = order.totals.shipping || 0;
        const isExpanded = expandedOrders[order.order_id];

        return (
            <View key={order.order_id} style={styles.card}>
                {/* Drop-off Location Section */}
                <View style={styles.sectionHeader}>
                    <MapPin size={20} color="#111827" />
                    <Text style={styles.sectionTitle}>Drop-off Location</Text>
                </View>
                
                <View style={styles.customerRow}>
                    <View>
                        <Text style={styles.customerName}>{address?.first_name} {address?.last_name}</Text>
                        <Text style={styles.customerRole}>Customer</Text>
                    </View>
                    <TouchableOpacity style={styles.callBtn}>
                        <Phone size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.addressBox}>
                    <Text style={styles.addressText}>{address?.address_line1}</Text>
                    <Text style={styles.addressText}>{address?.city}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity 
                        style={styles.viewDetailsBtn}
                        onPress={() => toggleExpand(order.order_id)}
                    >
                        <Text style={styles.viewDetailsText}>
                            {isExpanded ? 'Hide details' : 'View more details'}
                        </Text>
                        <ChevronDown size={16} color="#111827" style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={{
                            backgroundColor: '#425BA4',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 8,
                            justifyContent: 'center',
                        }}
                        onPress={() => router.push(`/(vendor)/orders/${order.order_id}` as any)}
                    >
                        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>
                            Manage Order
                        </Text>
                    </TouchableOpacity>
                </View>

                {isExpanded && (
                    <>
                        {/* Order Summary Section */}
                        <Text style={styles.subSectionTitle}>Order Summary</Text>
                        {order.items?.map((orderItem) => (
                            <View key={orderItem.item_id} style={styles.orderSummaryBox}>
                                <View style={styles.productImagePlaceholder}>
                                    {/* Placeholder for product image */}
                                </View>
                                <View style={styles.productDetails}>
                                    <View style={styles.productHeaderRow}>
                                        <Text style={styles.productName} numberOfLines={1}>{orderItem.name}</Text>
                                        <Text style={styles.productPrice}>{formatCurrency(orderItem.total, order.currency)}</Text>
                                    </View>
                                    <Text style={styles.orderIdText}>Order ID: #{order.order_number}</Text>
                                    {/* <Text style={styles.orderIdText}>Size: 42</Text> */}
                                </View>
                            </View>
                        ))}

                        {/* Delivery Fees Section */}
                        <View style={styles.sectionHeaderWithMargin}>
                            <Truck size={20} color="#111827" />
                            <Text style={styles.sectionTitle}>Delivery Fees</Text>
                        </View>
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Delivery Fee</Text>
                            <Text style={styles.feeAmount}>{formatCurrency(shippingFee, order.currency)}</Text>
                        </View>
                        <View style={styles.feePaidBox}>
                            <View style={styles.userIconSmall} />
                            <Text style={styles.feePaidText}>Delivery fee paid by customer.</Text>
                        </View>

                        {/* Courier Assignment Section */}
                        <View style={styles.sectionHeaderWithMargin}>
                            <Bike size={20} color="#111827" />
                            <Text style={styles.sectionTitle}>Courier Assignment</Text>
                        </View>
                        {/* Add courier details here when available from backend */}
                        <Text style={styles.courierInfoText}>Pending assignment...</Text>
                    </  >
                )}
            </View>
        );
    };

    const renderCompletedCard = (order: Order) => {
        const address = order.shipping_address;
        const item = order.items?.[0];
        const time = order.fulfilled_at || order.updated_at;

        return (
            <View key={order.order_id} style={styles.card}>
                <View style={styles.completedHeader}>
                    <View style={styles.checkIconWrapper}>
                        <CheckCircle size={32} color="#4ade80" />
                    </View>
                    <Text style={styles.completedTitle}>Delivery Completed!</Text>
                </View>

                <View style={styles.detailsList}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivered Product:</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>{item?.name || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Customer name:</Text>
                        <Text style={styles.detailValue}>{address?.first_name} {address?.last_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivered To:</Text>
                        <Text style={styles.detailValueRight}>
                            {address?.address_line1}, {address?.city}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivery Time:</Text>
                        <Text style={styles.detailValue}>{formatTime(time)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivery Courier:</Text>
                        <Text style={styles.detailValue}>Simba Courier</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderReturnCard = (order: Order) => {
        // Simplified return card
        const item = order.items?.[0];
        return (
            <View key={order.order_id} style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Returned / Refunded</Text>
                </View>
                <Text style={styles.orderIdText}>Order ID: #{order.order_number}</Text>
                <Text style={styles.productName}>{item?.name}</Text>
                <Text style={styles.productPrice}>{formatCurrency(order.totals.total, order.currency)}</Text>
            </View>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#3B4A85" style={styles.loader} />;
        }
        if (error) {
            return <Text style={styles.errorText}>Failed to load orders.</Text>;
        }

        let displayOrders: Order[] = [];
        let renderCardFn = renderPendingCard;

        if (activeTab === 'Pending') {
            displayOrders = pendingOrders;
            renderCardFn = renderPendingCard;
        } else if (activeTab === 'Completed') {
            displayOrders = completedOrders;
            renderCardFn = renderCompletedCard;
        } else {
            displayOrders = returnOrders;
            renderCardFn = renderReturnCard;
        }

        if (displayOrders.length === 0) {
            return <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders found.</Text>;
        }

        return (
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {displayOrders.map(order => renderCardFn(order))}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Orders</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {(['Pending', 'Completed', 'Return Orders'] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {renderContent()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light grey background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#111827',
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#111827',
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    loader: {
        marginTop: 40,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#EF4444',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#6B7280',
        fontSize: 16,
    },

    // Card Common Styles
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionHeaderWithMargin: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginLeft: 8,
    },

    // Pending Card Styles
    customerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    customerRole: {
        fontSize: 13,
        color: '#6B7280',
    },
    callBtn: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#3B4A85',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    addressText: {
        fontSize: 13,
        color: '#374151',
        marginBottom: 4,
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    viewDetailsText: {
        fontSize: 14,
        color: '#111827',
        marginRight: 4,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
        marginBottom: 12,
    },
    orderSummaryBox: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    productImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
        marginRight: 12,
    },
    productDetails: {
        flex: 1,
    },
    productHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    productName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    orderIdText: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    feeLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    feeAmount: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    feePaidBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFCCB',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    userIconSmall: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#4D7C0F',
        marginRight: 8,
    },
    feePaidText: {
        fontSize: 13,
        color: '#4D7C0F',
        fontWeight: '500',
    },
    courierInfoText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
    },

    // Completed Card Styles
    completedHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    checkIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    completedTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    detailsList: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    detailValueRight: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
        lineHeight: 18,
    }
});
