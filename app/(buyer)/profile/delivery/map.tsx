import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '../../../../src/services/delivery';

const { width, height } = Dimensions.get('window');

export default function DeliveryTrackingScreen() {
    const router = useRouter();
    const { order_id } = useLocalSearchParams();

    // 0 = Review, 1 = Assigned Modal, 2 = Active Tracking
    const [trackingState, setTrackingState] = useState(order_id ? 2 : 0);

    const mapRef = useRef<MapView>(null);

    const { data: delivery, isLoading } = useQuery({
        queryKey: ['delivery', 'order', order_id],
        queryFn: () => deliveryApi.getDeliveryByOrder(order_id as string),
        enabled: !!order_id && trackingState === 2,
        refetchInterval: trackingState === 2 ? 3000 : false, // Poll only if active
    });

    const lastStageLocation = delivery?.stages && delivery.stages.length > 0
        ? delivery.stages[delivery.stages.length - 1].location
        : null;

    const driverLat = lastStageLocation?.lat;
    const driverLng = lastStageLocation?.lng;

    useEffect(() => {
        if (driverLat && driverLng && mapRef.current) {
            mapRef.current.animateCamera({
                center: {
                    latitude: driverLat,
                    longitude: driverLng,
                },
                zoom: 15,
            }, { duration: 1000 });
        }
    }, [driverLat, driverLng]);

    const handleConfirm = () => {
        setTrackingState(1);
    };

    const handleMockDelivered = () => {
        // Navigates to rating flow once "Call driver" is clicked or mock finishes
        router.push('/(buyer)/orders/rate');
    };

    const renderReviewCard = () => (
        <View style={styles.floatingCard}>
            <View style={styles.dateLabelRow}>
                <Ionicons name="calendar-outline" size={16} color="#4B5563" />
                <Text style={styles.dateLabelText}>Thursday January 10th</Text>
            </View>

            <View style={styles.locationTimeline}>
                <View style={styles.timelineItem}>
                    <View style={styles.blueRing} />
                    <View style={styles.timelineContent}>
                        <Text style={styles.locationTitle}>Pickup from store</Text>
                        <Text style={styles.locationSubtitle}>Mwanga shop</Text>
                    </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                    <View style={styles.greenRing} />
                    <View style={styles.timelineContent}>
                        <Text style={styles.locationTitle}>Drop off location</Text>
                        <Text style={styles.locationSubtitle}>Mbezi shoppers Kawe</Text>
                    </View>
                    <Ionicons name="create-outline" size={20} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                </View>
            </View>

            <View style={styles.deliveryCostRow}>
                <Text style={styles.costLabel}>Delivery Cost</Text>
                <Text style={styles.costValue}>Tsh 12,000</Text>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    );

    const renderAssignedModal = () => (
        <Modal visible={trackingState === 1} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.successModalCard}>
                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3209/3209955.png' }} style={styles.scooterIcon} />
                    <Text style={styles.successText}>
                        Your Order successfully assigned. To: <Text style={{ fontWeight: 'bold' }}>Everest driver</Text>
                    </Text>
                    <TouchableOpacity style={styles.okBtn} onPress={() => setTrackingState(2)}>
                        <Text style={styles.okBtnText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderTrackingCard = () => (
        <View style={styles.floatingCard}>
            <View style={styles.trackingHeaderRow}>
                <Text style={styles.trackingTitle}>Your order is being processed</Text>
                <TouchableOpacity onPress={handleMockDelivered}>
                    <Ionicons name="refresh" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

            {/* Horizontal timeline */}
            <View style={styles.horizontalTimeline}>
                <View style={styles.hLine} />
                <View style={[styles.hNode, styles.hNodeActive]}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <View style={[styles.hNode, styles.hNodeCurrent]} />
                <View style={[styles.hNode, styles.hNodePending]} />
            </View>
            <View style={styles.hLabels}>
                <Text style={styles.hLabelTextActive}>Mwanga shop</Text>
                <Text style={styles.hLabelText}>Kawe</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.driverRow}>
                <View style={styles.vodacomLogoMock}>
                    {/* Mock identical to screenshot red vodacom circle icon */}
                    <Image source={{ uri: 'https://1000logos.net/wp-content/uploads/2021/04/Vodacom-logo.png' }} style={{ width: 30, height: 30, borderRadius: 15 }} />
                </View>
                <View style={styles.driverInfo}>
                    <Text style={styles.driverSub}>Vodacom Shop</Text>
                    <Text style={styles.driverName}>Everest driver</Text>
                </View>
                <View style={styles.amountWrap}>
                    <Text style={styles.amountLabel}>Total amount</Text>
                    <Text style={styles.amountValue}>Tsh 12,000</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.callBtn} onPress={handleMockDelivered}>
                <Ionicons name="call" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.callBtnText}>Call the driver</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Map Placeholder */}
            <View style={styles.mapContainer}>
                {trackingState === 2 && delivery ? (
                    <MapView
                        ref={mapRef}
                        style={styles.mapImage}
                        initialRegion={{
                            latitude: driverLat || -6.7924,
                            longitude: driverLng || 39.2083,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                    >
                        {/* Driver Location Marker */}
                        {driverLat && driverLng && (
                            <Marker
                                coordinate={{ latitude: driverLat, longitude: driverLng }}
                                title="Driver"
                                description="Your driver is here"
                            >
                                <Ionicons name="car" size={32} color="#4A55A2" />
                            </Marker>
                        )}

                        {/* Dropoff Location Marker */}
                        {delivery.dropoff_location?.lat && delivery.dropoff_location?.lng && (
                            <Marker
                                coordinate={{
                                    latitude: delivery.dropoff_location.lat,
                                    longitude: delivery.dropoff_location.lng
                                }}
                                title="Dropoff"
                            >
                                <Ionicons name="location" size={36} color="#22C55E" />
                            </Marker>
                        )}

                        {/* Traveled Pinned Route */}
                        {delivery.stages && delivery.stages.length > 0 && (
                            <Polyline
                                coordinates={delivery.stages
                                    .filter((s: any) => s.location && s.location.lat && s.location.lng)
                                    .map((s: any) => ({
                                        latitude: s.location!.lat,
                                        longitude: s.location!.lng
                                    }))}
                                strokeColor="#4A55A2" // Route blue
                                strokeWidth={4}
                            />
                        )}
                    </MapView>
                ) : (
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80' }}
                        style={styles.mapImage}
                    />
                )}
            </View>

            {/* Content Overlays */}
            <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">

                {/* Dynamic Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    {trackingState === 0 && (
                        <Text style={styles.headerTitle}>Review your order before delivery</Text>
                    )}
                </View>

                {/* Bottom Card content */}
                <View style={styles.bottomContainer}>
                    {trackingState === 0 ? renderReviewCard() : renderTrackingCard()}
                </View>

            </SafeAreaView>

            {renderAssignedModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    mapContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#E5E7EB',
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.9,
    },
    mapOverlayLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    mockRouteLine: {
        position: 'absolute',
        top: '35%',
        left: '48%',
        width: 60,
        height: 80,
        borderLeftWidth: 4,
        borderBottomWidth: 4,
        borderColor: '#425BA4',
        borderBottomLeftRadius: 16,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
    },
    bottomContainer: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    floatingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },

    // Review Card Styles
    dateLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 24,
        gap: 8,
    },
    dateLabelText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    locationTimeline: {
        position: 'relative',
        marginBottom: 24,
    },
    timelineLine: {
        position: 'absolute',
        left: 9,
        top: 24,
        bottom: 24,
        width: 2,
        backgroundColor: '#E5E7EB',
        zIndex: 0,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        zIndex: 1,
    },
    blueRing: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 5,
        borderColor: '#E0E7FF',
        backgroundColor: '#425BA4',
        marginRight: 16,
    },
    greenRing: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 5,
        borderColor: '#DCFCE7',
        backgroundColor: '#10B981',
        marginRight: 16,
    },
    timelineContent: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    locationSubtitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    deliveryCostRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        marginBottom: 16,
    },
    costLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    costValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    confirmBtn: {
        backgroundColor: '#425BA4',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    successModalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
    },
    scooterIcon: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    successText: {
        fontSize: 15,
        color: '#1A1A1A',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    okBtn: {
        width: '100%',
        backgroundColor: '#425BA4',
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
    },
    okBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },

    // Tracking Card Styles
    trackingHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    trackingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    horizontalTimeline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        position: 'relative',
        marginBottom: 8,
    },
    hLine: {
        position: 'absolute',
        left: 20,
        right: 20,
        height: 2,
        backgroundColor: '#E5E7EB',
        zIndex: 0,
    },
    hNode: {
        width: 20,
        height: 20,
        borderRadius: 10,
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hNodeActive: {
        backgroundColor: '#425BA4',
    },
    hNodeCurrent: {
        backgroundColor: '#425BA4',
        borderWidth: 4,
        borderColor: '#E0E7FF',
    },
    hNodePending: {
        backgroundColor: '#D1D5DB',
    },
    hLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    hLabelTextActive: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    hLabelText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    driverRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    vodacomLogoMock: {
        marginRight: 12,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    driverInfo: {
        flex: 1,
    },
    driverSub: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2,
    },
    driverName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    amountWrap: {
        alignItems: 'flex-end',
    },
    amountLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2,
    },
    amountValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    callBtn: {
        flexDirection: 'row',
        backgroundColor: '#425BA4',
        borderRadius: 24,
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    callBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
