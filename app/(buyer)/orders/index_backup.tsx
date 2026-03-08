import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../../src/components/navigation/BottomNav';

export default function DeliveryOrdersScreen() {
    const router = useRouter();
    // Using 'Pending' to represent 'On Route' for the mock
    const [activeTab, setActiveTab] = useState('Pending');

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
            {/* Bottom divider line for unselected tabs */}
            <View style={styles.tabsBorderLine} />
            <View style={[
                styles.activeTabUnderline,
                {
                    left: activeTab === 'Pending' ? 20 : (activeTab === 'Completed' ? 120 : 220),
                    width: activeTab === 'Pending' ? 64 : (activeTab === 'Completed' ? 82 : 100),
                }
            ]} />
        </View>
    );

    const renderPendingCards = () => (
        <View style={styles.cardsWrapper}>
            {/* Map Card */}
            <View style={styles.card}>
                <TouchableOpacity style={styles.mapButton}>
                    <Text style={styles.mapButtonText}>View on map</Text>
                </TouchableOpacity>

                <View style={styles.routeContainer}>
                    {/* Vertical line connection */}
                    <View style={styles.verticalLine} />

                    {/* From Row */}
                    <View style={styles.addressRow}>
                        <View style={styles.greenDot} />
                        <View style={styles.addressInfo}>
                            <Text style={styles.addressLabel}>From:</Text>
                            <Text style={styles.addressName}>Mwanga shop collection</Text>
                            <Text style={styles.addressDetail}>Makumbusho bus stand</Text>
                            <Text style={styles.addressTime}>Picked up at 02:22 PM</Text>
                        </View>
                    </View>

                    {/* To Row */}
                    <View style={[styles.addressRow, { marginTop: 24 }]}>
                        <Ionicons name="location-outline" size={16} color="#425BA4" style={styles.bluePin} />
                        <View style={styles.addressInfo}>
                            <Text style={styles.addressLabel}>To:</Text>
                            <Text style={styles.addressName}>Diana Wamboseri</Text>
                            <Text style={styles.addressDetail}>Mbezi Shoppers, Kawe Road</Text>
                            <Text style={styles.addressTime}>Drop-off expected time: 01:20 PM</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.viewStatusBtn}>
                    <Text style={styles.viewStatusText}>View delivery status</Text>
                    <Ionicons name="chevron-down" size={16} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            {/* Driver Progress Card */}
            <View style={styles.card}>
                <View style={styles.driverHeader}>
                    <View style={styles.truckIconWrapper}>
                        <Ionicons name="bus" size={20} color="#FFFFFF" />
                    </View>
                    <View>
                        <Text style={styles.truckTitle}>Package is on its way</Text>
                        <Text style={styles.truckSubtitle}>Arriving in 25 mins</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.deliveryProgressBar}>
                    <View style={[styles.progressSegment, styles.progressFilled]} />
                    <View style={[styles.progressSegment, styles.progressFilled]} />
                    <View style={[styles.progressSegment, styles.progressEmpty]} />
                </View>
                <View style={styles.progressLabels}>
                    <Text style={[styles.progressLabelText, styles.progressLabelActive]}>Picked up</Text>
                    <Text style={[styles.progressLabelText, styles.progressLabelActive]}>In transit</Text>
                    <Text style={styles.progressLabelText}>Delivered</Text>
                </View>

                {/* Driver Info */}
                <View style={styles.driverProfile}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }} style={styles.driverImage} />
                    <View style={styles.driverInfoText}>
                        <Text style={styles.driverName}>James Robert</Text>
                        <Text style={styles.driverId}>ID: #DRV8432</Text>
                    </View>
                    <View style={styles.driverRating}>
                        <Ionicons name="star" size={14} color="#FBBF24" />
                        <Text style={styles.ratingNumber}>4.9</Text>
                        <Text style={styles.tripsText}>100 trips</Text>
                    </View>
                    <TouchableOpacity style={styles.callDriverBtn}>
                        <Ionicons name="call" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.viewStatusBtn, { marginTop: 16 }]}>
                    <Text style={styles.viewStatusText}>View all details</Text>
                    <Ionicons name="chevron-down" size={16} color="#1A1A1A" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCompletedCard = () => (
        <View style={styles.cardsWrapper}>
            <View style={styles.card}>
                <View style={styles.completedHeader}>
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={40} color="#22C55E" />
                    </View>
                    <Text style={styles.completedTitle}>Delivery Completed!</Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Delivered Product:</Text>
                    <Text style={styles.detailValue}>Air Jordan Nike</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Delivery Courier:</Text>
                    <Text style={styles.detailValue}>James Courier</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Delivered To:</Text>
                    <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>Msasani Shoppers, Haile Road, Dar es Salaam</Text>
                </View>
                <View style={[styles.detailsRow, { marginTop: 12 }]}>
                    <Text style={styles.detailLabel}>Delivery Time:</Text>
                    <Text style={styles.detailValue}>01:20 PM</Text>
                </View>

                <TouchableOpacity style={[styles.viewStatusBtn, { marginTop: 24 }]}>
                    <Text style={styles.viewStatusText}>View more details</Text>
                    <Ionicons name="chevron-down" size={16} color="#1A1A1A" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderReturnCard = () => (
        <View style={styles.cardsWrapper}>
            <View style={styles.card}>
                <View style={styles.returnProductHeader}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1528701800487-ba01fea498c0?w=100&h=100&fit=crop' }} style={styles.returnImage} />
                    <View style={styles.returnProductInfo}>
                        <Text style={styles.returnProductName}>Air Jordan Nike</Text>
                        <Text style={styles.returnProductPrice}>Tsh 45,000</Text>
                        <Text style={styles.returnOrderId}>Order ID #ORD123456</Text>
                        <Text style={styles.returnOrderMeta}>Size: 42</Text>
                        <Text style={styles.returnOrderMeta}>Seller: Tunzaa Shop</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.viewStatusBtn}>
                    <Text style={styles.viewStatusText}>View all details</Text>
                    <Ionicons name="chevron-down" size={16} color="#1A1A1A" />
                </TouchableOpacity>

                <View style={[styles.divider, { marginVertical: 20 }]} />

                <View style={styles.returnIdRow}>
                    <Text style={styles.returnIdLabel}>Return ID</Text>
                    <Text style={styles.returnIdValue}>#45156071</Text>
                </View>

                <Text style={styles.returnReasonLabel}>Reason</Text>
                <Text style={styles.returnReasonValue}>Defective product</Text>

                <Text style={styles.returnQtyLabel}>quantity</Text>
                <Text style={styles.returnQtyValue}>2 items</Text>

                {/* Vertical Timeline */}
                <View style={styles.timelineContainer}>
                    <View style={styles.timelineItem}>
                        <View style={styles.timelineLineActive} />
                        <View style={styles.timelineCheckCircle}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Return Requested</Text>
                            <Text style={styles.timelineDate}>Dec 10, 2024 at 1:30 PM</Text>
                        </View>
                        <Text style={styles.timelineAgo}>2 days ago</Text>
                    </View>

                    <View style={styles.timelineItem}>
                        <View style={styles.timelineLineActive} />
                        <View style={styles.timelineCheckCircle}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Return Approved</Text>
                            <Text style={styles.timelineDate}>Dec 10, 2024 at 10:15 AM</Text>
                        </View>
                        <Text style={styles.timelineAgo}>1 days ago</Text>
                    </View>

                    <View style={styles.timelineItem}>
                        <View style={styles.timelineCheckCircle}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Product Picked Up</Text>
                            <Text style={styles.timelineDate}>Dec 15, 2024 at 10:15 AM</Text>
                        </View>
                        <Text style={styles.timelineAgo}>Today</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Orders</Text>
                <View style={{ width: 24 }} />
            </View>

            {renderTabs()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'Pending' && renderPendingCards()}
                {activeTab === 'Completed' && renderCompletedCard()}
                {activeTab === 'Return Orders' && renderReturnCard()}
            </ScrollView>
            <BottomNav />
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
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        paddingBottom: 0,
        position: 'relative',
    },
    tabsBorderLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    activeTabUnderline: {
        position: 'absolute',
        bottom: 0,
        height: 2,
        backgroundColor: '#1A1A1A',
        borderRadius: 2,
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
    },
    activeTab: {},
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#1A1A1A',
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 110,
    },
    cardsWrapper: {
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    mapButton: {
        backgroundColor: '#EEF2FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    mapButtonText: {
        color: '#425BA4',
        fontSize: 12,
        fontWeight: '600',
    },
    routeContainer: {
        position: 'relative',
        paddingLeft: 8,
        marginBottom: 24,
    },
    verticalLine: {
        position: 'absolute',
        left: 12,
        top: 24,
        bottom: 24,
        width: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#22C55E',
        marginTop: 4,
        marginRight: 16,
        zIndex: 1,
    },
    bluePin: {
        marginRight: 12,
        marginLeft: -3,
        marginTop: 2,
        zIndex: 1,
    },
    addressInfo: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    addressName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    addressDetail: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    addressTime: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    viewStatusBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        gap: 4,
    },
    viewStatusText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    // Driver progress styles
    driverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    truckIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#34D399', // Mint green
        justifyContent: 'center',
        alignItems: 'center',
    },
    truckTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    truckSubtitle: {
        fontSize: 13,
        color: '#34D399',
        fontWeight: '500',
    },
    deliveryProgressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressSegment: {
        height: 6,
        borderRadius: 3,
        flex: 1,
        marginHorizontal: 2,
    },
    progressFilled: {
        backgroundColor: '#34D399',
    },
    progressEmpty: {
        backgroundColor: '#E5E7EB',
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    progressLabelText: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    progressLabelActive: {
        color: '#4B5563',
        fontWeight: '500',
    },
    driverProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
    },
    driverImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    driverInfoText: {
        flex: 1,
    },
    driverName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    driverId: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 2,
    },
    driverRating: {
        alignItems: 'center',
        marginRight: 16,
    },
    ratingNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    tripsText: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    callDriverBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#425BA4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Completed styles
    completedHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    checkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    completedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    // Return styles
    returnProductHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        gap: 16,
    },
    returnImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    returnProductInfo: {
        flex: 1,
    },
    returnProductName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    returnProductPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        alignSelf: 'flex-end',
        position: 'absolute',
        right: 0,
        top: 0,
    },
    returnOrderId: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 2,
    },
    returnOrderMeta: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    returnIdRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    returnIdLabel: {
        fontSize: 13,
        color: '#4B5563',
    },
    returnIdValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    returnReasonLabel: {
        fontSize: 13,
        color: '#4B5563',
        marginBottom: 4,
    },
    returnReasonValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    returnQtyLabel: {
        fontSize: 13,
        color: '#4B5563',
        marginBottom: 4,
    },
    returnQtyValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 24,
    },
    timelineContainer: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
        position: 'relative',
    },
    timelineLineActive: {
        position: 'absolute',
        left: 9,
        top: 24,
        bottom: -24,
        width: 2,
        backgroundColor: '#425BA4',
        zIndex: 0,
    },
    timelineCheckCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#425BA4',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        marginRight: 16,
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    timelineDate: {
        fontSize: 11,
        color: '#6B7280',
    },
    timelineAgo: {
        fontSize: 11,
        color: '#6B7280',
    },
});
