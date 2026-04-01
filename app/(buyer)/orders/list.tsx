import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type OrderStatus = 'On Route' | 'Completed' | 'Return Orders';

const MOCK_ORDERS = [
    {
        id: 'ORD1203056',
        status: 'On Route' as OrderStatus,
        productName: 'Air Jordan Nike',
        courier: 'Simba Courier',
        recipient: 'Wasafi Shoppers, Haile Selassie Rd, Dar es Salaam',
        deliveryTime: '07:30 PM',
        driver: {
            name: 'James Robert',
            rating: 4.9,
            distance: '132.16 mi',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60'
        },
        eta: 'Arriving in 25 mins',
        image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&auto=format&fit=crop&q=60'
    },
    {
        id: 'ORD1203057',
        status: 'Completed' as OrderStatus,
        productName: 'Air Jordan Nike',
        courier: 'Simba Courier',
        recipient: 'Wasafi Shoppers, Haile Selassie Rd, Dar es Salaam',
        deliveryTime: '07:30 PM',
        image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&auto=format&fit=crop&q=60'
    },
    {
        id: 'Return ID #45156371',
        status: 'Return Orders' as OrderStatus,
        productName: 'Air Jordan Nike',
        orderId: '#ORD1203056',
        reason: 'Defective product',
        quantity: '2 Items',
        timeline: [
            { id: 1, title: 'Return Requested', date: 'Dec 15, 2024 at 2:30 PM', status: 'completed' },
            { id: 2, title: 'Return Approved', date: 'Dec 18, 2024 at 10:30 AM', status: 'completed' },
            { id: 3, title: 'Product Picked Up', date: 'Today', status: 'current' },
        ],
        image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&auto=format&fit=crop&q=60'
    }
];

export default function DeliveryListScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<OrderStatus>('On Route');

    const filteredOrders = MOCK_ORDERS.filter(order => order.status === activeTab);

    const renderOnRouteOrder = (item: any) => (
        <View style={styles.stateContainer}>
            {/* ETA Banner */}
            <View style={styles.etaBanner}>
                <View style={styles.etaIconContainer}>
                    <Ionicons name="cube" size={24} color="#425BA4" />
                    <View style={styles.clockIconOverlay}>
                        <Ionicons name="time" size={12} color="#FFFFFF" />
                    </View>
                </View>
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.etaTitle}>Package is on its way</Text>
                    <Text style={styles.etaBadge}>{item.eta}</Text>
                </View>
            </View>

            {/* Driver Card */}
            <View style={styles.driverCard}>
                <View style={styles.driverTop}>
                    <Image source={{ uri: item.driver.image }} style={styles.driverImage} />
                    <View style={styles.driverInfo}>
                        <Text style={styles.driverName}>{item.driver.name}</Text>
                        <Text style={styles.driverId}>ID: #ORD15432</Text>
                    </View>
                    <View style={styles.driverStats}>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text style={styles.ratingText}>{item.driver.rating}</Text>
                        </View>
                        <Text style={styles.distanceText}>{item.driver.distance}</Text>
                    </View>
                </View>
                
                <TouchableOpacity style={styles.viewDetailsFull}>
                    <Text style={styles.viewDetailsText}>View all details</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* Simple Track Preview */}
            <View style={styles.trackingPreview}>
                <View style={styles.trackPoint}>
                    <View style={[styles.trackDot, styles.trackDotActive]} />
                    <Text style={[styles.trackLabel, styles.trackLabelActive]}>Picked up</Text>
                </View>
                <View style={styles.trackLine} />
                <View style={styles.trackPoint}>
                    <View style={[styles.trackDot, styles.trackDotActive]} />
                    <Text style={[styles.trackLabel, styles.trackLabelActive]}>In transit</Text>
                </View>
                <View style={styles.trackLine} />
                <View style={styles.trackPoint}>
                    <View style={styles.trackDot} />
                    <Text style={styles.trackLabel}>Delivered</Text>
                </View>
            </View>
        </View>
    );

    const renderCompletedOrder = (item: any) => (
        <View style={styles.stateContainer}>
            <View style={styles.completedCard}>
                <View style={styles.successMarker}>
                    <View style={styles.successCircle}>
                        <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                    </View>
                </View>
                
                <Text style={styles.completedTitle}>Delivery Completed!</Text>

                <View style={styles.detailList}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivered Product:</Text>
                        <Text style={styles.detailValue}>{item.productName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivery Courier:</Text>
                        <Text style={styles.detailValue}>{item.courier}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivered To:</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>{item.recipient}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivery Time:</Text>
                        <Text style={styles.detailValue}>{item.deliveryTime}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.viewMoreDetails}>
                    <Text style={styles.viewMoreText}>View more Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderReturnOrder = (item: any) => (
        <View style={styles.stateContainer}>
            <View style={styles.returnCard}>
                <View style={styles.returnHeader}>
                    <Image source={{ uri: item.image }} style={styles.productThumb} />
                    <View style={styles.returnProductInfo}>
                        <View style={styles.row}>
                            <Text style={styles.productName}>{item.productName}</Text>
                            <Text style={styles.priceTag}>Tsh 450,000</Text>
                        </View>
                        <Text style={styles.orderIdText}>Order ID: {item.orderId}</Text>
                        <Text style={styles.orderIdText}>Size: 42</Text>
                        <Text style={styles.orderIdText}>Seller: Tunzaa Shop</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.viewMoreDetails}>
                    <Text style={styles.viewMoreText}>View all details</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Return ID</Text>
                    <Text style={styles.infoValueBlue}>{item.id.replace('Return ID ', '')}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Reason</Text>
                    <Text style={styles.infoValue}>{item.reason}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Quantity</Text>
                    <Text style={styles.infoValue}>{item.quantity}</Text>
                </View>

                <View style={styles.divider} />

                {/* Vertical Timeline */}
                <View style={styles.vTimeline}>
                    {item.timeline.map((point: any, idx: number) => (
                        <View key={point.id} style={styles.vTimelineItem}>
                            <View style={styles.vTimelineLeft}>
                                <View style={[
                                    styles.vDot,
                                    point.status === 'completed' && styles.vDotCompleted,
                                    point.status === 'current' && styles.vDotCurrent
                                ]}>
                                    {point.status === 'completed' && <Ionicons name="checkmark" size={10} color="#FFFFFF" />}
                                </View>
                                {idx < item.timeline.length - 1 && (
                                    <View style={[
                                        styles.vLine,
                                        point.status === 'completed' && styles.vLineActive
                                    ]} />
                                )}
                            </View>
                            <View style={styles.vTimelineRight}>
                                <Text style={[
                                    styles.vTitle,
                                    point.status === 'current' && styles.vTitleCurrent
                                ]}>{point.title}</Text>
                                <Text style={styles.vDate}>{point.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderOrderItem = ({ item }: { item: any }) => {
        if (activeTab === 'On Route') return renderOnRouteOrder(item);
        if (activeTab === 'Completed') return renderCompletedOrder(item);
        if (activeTab === 'Return Orders') return renderReturnOrder(item);
        return null;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {(['On Route', 'Completed', 'Return Orders'] as OrderStatus[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="cube-outline" size={64} color="#E5E7EB" />
                        <Text style={styles.emptyText}>No orders in {activeTab}</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
            <View style={styles.footerBrand}>
                <Text style={styles.footerBrandText}>Tunzaa Version 2.0</Text>
            </View>
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
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
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#111827',
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
    },
    stateContainer: {
        marginBottom: 20,
    },
    // On Route Styles
    etaBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 20,
        marginBottom: 16,
    },
    etaIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#EEF2FF',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    clockIconOverlay: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#FBBF24',
        borderRadius: 8,
        padding: 2,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    etaTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    etaBadge: {
        fontSize: 12,
        color: '#425BA4',
        fontWeight: '600',
        marginTop: 2,
    },
    driverCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    driverTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    driverInfo: {
        flex: 1,
    },
    driverName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    driverId: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    driverStats: {
        alignItems: 'flex-end',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#B45309',
        marginLeft: 4,
    },
    distanceText: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
    },
    viewDetailsFull: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    viewDetailsText: {
        fontSize: 13,
        color: '#6B7280',
        marginRight: 4,
    },
    trackingPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 8,
    },
    trackPoint: {
        alignItems: 'center',
    },
    trackDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E5E7EB',
        marginBottom: 8,
    },
    trackDotActive: {
        backgroundColor: '#425BA4',
    },
    trackLabel: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    trackLabelActive: {
        color: '#425BA4',
        fontWeight: '600',
    },
    trackLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginBottom: 18,
        marginHorizontal: 4,
    },
    // Completed Styles
    completedCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    successMarker: {
        marginBottom: 20,
    },
    successCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#22C55E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    completedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 24,
    },
    detailList: {
        width: '100%',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
        width: '40%',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    viewMoreDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        width: '100%',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    viewMoreText: {
        fontSize: 13,
        color: '#6B7280',
        marginRight: 4,
    },
    // Return Styles
    returnCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    returnHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productThumb: {
        width: 64,
        height: 64,
        borderRadius: 12,
        marginRight: 16,
    },
    returnProductInfo: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    priceTag: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    orderIdText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
    },
    infoValueBlue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    vTimeline: {
        marginTop: 10,
    },
    vTimelineItem: {
        flexDirection: 'row',
    },
    vTimelineLeft: {
        alignItems: 'center',
        width: 24,
    },
    vDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    vDotCompleted: {
        backgroundColor: '#425BA4',
    },
    vDotCurrent: {
        backgroundColor: '#EEF2FF',
        borderWidth: 2,
        borderColor: '#425BA4',
    },
    vLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 2,
    },
    vLineActive: {
        backgroundColor: '#425BA4',
    },
    vTimelineRight: {
        flex: 1,
        paddingBottom: 20,
        marginLeft: 12,
    },
    vTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    vTitleCurrent: {
        color: '#111827',
    },
    vDate: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
    },
    footerBrand: {
        padding: 20,
        alignItems: 'center',
    },
    footerBrandText: {
        fontSize: 12,
        color: '#9CA3AF',
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
