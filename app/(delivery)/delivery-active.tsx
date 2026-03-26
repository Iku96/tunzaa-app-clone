import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Phone, ArrowLeft, ShoppingCart, Store, User, CircleDollarSign } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import DeliveryBottomNav from '../../src/components/navigation/DeliveryBottomNav';
import { useDeliveryContext, DeliveryRequest } from '../../src/contexts/DeliveryContext';

export default function DeliveryActiveScreen() {
    const router = useRouter();
    const { activeDelivery, togglePickupCompleted } = useDeliveryContext();

    const handleBack = () => {
        router.back();
    };

    const handleViewMap = () => {
        router.push('/(delivery)/delivery-map' as any);
    };

    if (!activeDelivery) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text>No active delivery found.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                        <Text style={{ color: '#425BA4' }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isSinglePickup = activeDelivery.pickupPoints.length === 1;

    // Separate renders for clean code
    const renderSinglePickup = () => {
        const point = activeDelivery.pickupPoints[0];

        return (
            <View style={styles.singleContainer}>
                {/* Pickup Section */}
                <View style={styles.sectionHeader}>
                    <View style={[styles.dot, { backgroundColor: '#01AC00' }]} />
                    <Text style={styles.sectionTitle}>Pickup details (From)</Text>
                </View>

                <View style={styles.leftBorderLine}>
                    <View style={styles.sectionContent}>
                        <View style={styles.detailRow}>
                            <MapPin size={22} color="#4B5563" strokeWidth={1.5} style={styles.detailIcon} />
                            <View style={styles.detailTextContainer}>
                                <Text style={styles.detailLabel}>Location</Text>
                                <Text style={styles.detailValue}>{point.location.specific}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <ShoppingCart size={22} color="#4B5563" strokeWidth={1.5} style={styles.detailIcon} />
                            <View style={styles.detailTextContainer}>
                                <Text style={styles.detailLabel}>Products</Text>
                                <Text style={styles.detailValue}>{point.productName}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Store size={22} color="#4B5563" strokeWidth={1.5} style={styles.detailIcon} />
                            <View style={styles.detailTextContainer}>
                                <Text style={styles.detailLabel}>Shop Name</Text>
                                <Text style={styles.detailValue}>{point.shopName}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.bigCallButton}>
                            <Phone size={18} color="#FFFFFF" />
                            <Text style={styles.bigCallButtonText}>Call shop</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Delivery Section */}
                <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                    <View style={[styles.dot, { backgroundColor: '#425BA4' }]} />
                    <Text style={styles.sectionTitle}>Delivery details (To)</Text>
                </View>

                <View style={[styles.sectionContent, { paddingLeft: 30 }]}>
                    <View style={styles.detailRow}>
                        <MapPin size={22} color="#4B5563" strokeWidth={1.5} style={styles.detailIcon} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Location</Text>
                            <Text style={styles.detailValue}>{activeDelivery.deliveryDetails.location}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <User size={22} color="#4B5563" strokeWidth={1.5} style={styles.detailIcon} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Customer Name</Text>
                            <Text style={styles.detailValue}>{activeDelivery.customerName}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <CircleDollarSign size={22} color="#4B5563" strokeWidth={1.5} style={styles.detailIcon} />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Amount customer pays</Text>
                            <Text style={styles.detailValue}>Tshs {activeDelivery.amount}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.bigCallButton}>
                        <Phone size={18} color="#FFFFFF" />
                        <Text style={styles.bigCallButtonText}>Call customer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderMultiPickup = () => {
        return (
            <>
                <View style={styles.pickupHeader}>
                    <MapPin size={24} color="#000000" strokeWidth={2} />
                    <Text style={styles.pickupLocationText}>{activeDelivery.origin}</Text>
                    <Text style={styles.pickupPointsText}>Pickup points</Text>
                </View>

                <View style={styles.timelineContainer}>
                    {activeDelivery.pickupPoints.map((point, index) => {
                        const isLast = index === activeDelivery.pickupPoints.length - 1;
                        return (
                            <View key={point.id} style={styles.timelineItem}>
                                <TouchableOpacity
                                    style={styles.timelineIconContainer}
                                    onPress={() => togglePickupCompleted(point.id)}
                                >
                                    {point.completed ? (
                                        <Ionicons name="checkmark-circle" size={24} color="#01AC00" style={styles.checkIcon} />
                                    ) : (
                                        <View style={styles.emptyCircle} />
                                    )}
                                    {!isLast && <View style={styles.verticalLine} />}
                                </TouchableOpacity>

                                <View style={styles.timelineContent}>
                                    <View style={styles.textDetails}>
                                        <Text style={styles.shopName}>{point.shopName}</Text>
                                        <Text style={styles.productName}>{point.productName}</Text>
                                    </View>

                                    <TouchableOpacity style={styles.callButton}>
                                        <Phone size={20} color="#000000" fill="#000000" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </>
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={24} color="#000000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order details</Text>
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* View Map Button */}
                    <TouchableOpacity style={styles.viewMapButton} onPress={handleViewMap}>
                        <MapPin size={18} color="#000000" />
                        <Text style={styles.viewMapText}>View map</Text>
                    </TouchableOpacity>

                    {isSinglePickup ? renderSinglePickup() : renderMultiPickup()}
                </ScrollView>

                {/* Bottom Navigation */}
                <DeliveryBottomNav />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        position: 'relative', // To center title independently
    },
    backButton: {
        position: 'absolute',
        left: 20,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 100, // Space for bottom nav
    },
    viewMapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 32,
        gap: 8,
    },
    viewMapText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000000',
    },
    pickupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    pickupLocationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    pickupPointsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 4,
    },
    timelineContainer: {
        paddingLeft: 4,
        paddingTop: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 0, // Margin is handled by padding in content to allow line to stretch
    },
    timelineIconContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 16,
        position: 'relative',
    },
    checkIcon: {
        backgroundColor: '#FFFFFF', // Prevent line from showing through
        zIndex: 2,
    },
    emptyCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#4B5563',
        backgroundColor: '#FFFFFF',
        zIndex: 2,
        marginTop: 2,
    },
    verticalLine: {
        position: 'absolute',
        top: 24, // Start below icon
        bottom: -16, // Extend to next icon
        width: 1,
        backgroundColor: '#E5E7EB',
        zIndex: 1,
    },
    timelineContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 40, // Generous spacing between items
    },
    textDetails: {
        flex: 1,
    },
    shopName: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    productName: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '400',
    },
    callButton: {
        padding: 8,
    },
    // Single Pickup Specific Styles
    singleContainer: {
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 2,
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    sectionContent: {
        paddingLeft: 24,
        position: 'relative',
        paddingBottom: 10,
    },
    leftBorderLine: {
        borderLeftWidth: 1,
        borderColor: '#E5E7EB',
        marginLeft: 6,
        paddingBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    detailIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '400',
    },
    bigCallButton: {
        flexDirection: 'row',
        backgroundColor: '#425BA4',
        borderRadius: 24,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        marginBottom: 20,
        gap: 8,
    },
    bigCallButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
    }
});
