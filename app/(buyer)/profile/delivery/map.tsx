import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const { width, height } = Dimensions.get('window');

export default function DeliveryTrackingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // 0 = Pick/Review, 1 = Assigned Modal, 2 = Active Tracking
    const [trackingState, setTrackingState] = useState(0);
    const [region, setRegion] = useState({
        latitude: -6.7924,
        longitude: 39.2083,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [selectedLocation, setSelectedLocation] = useState({
        latitude: -6.7924,
        longitude: 39.2083,
    });
    const [address, setAddress] = useState('Fetching address...');
    const [isLoading, setIsLoading] = useState(true);
    
    // Date State
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                setIsLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const newCoords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setSelectedLocation(newCoords);
            setRegion({
                ...region,
                ...newCoords,
            });
            reverseGeocode(newCoords.latitude, newCoords.longitude);
            setIsLoading(false);
        })();
    }, []);

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (results.length > 0) {
                const item = results[0];
                const addr = `${item.name || ''} ${item.street || ''}, ${item.city || item.region || ''}`;
                setAddress(addr.trim());
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRegionChangeComplete = (newRegion: any) => {
        // Only update if we are in "Pick" mode (simulated here)
        setSelectedLocation({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
        });
        reverseGeocode(newRegion.latitude, newRegion.longitude);
    };

    const handleConfirm = () => {
        if (trackingState === 0) {
            // If we came from the address form, we should go back with the result
            if (params.mode === 'pick') {
                router.replace({
                    pathname: '/(buyer)/profile/delivery/address',
                    params: { 
                        address: address,
                        lat: selectedLocation.latitude,
                        lng: selectedLocation.longitude
                    }
                });
            } else {
                setTrackingState(1);
            }
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const renderReviewCard = () => (
        <View style={styles.floatingCard}>
            <TouchableOpacity 
                style={styles.dateLabelRow} 
                onPress={() => setShowDatePicker(true)}
            >
                <Ionicons name="calendar-outline" size={16} color="#4B5563" />
                <Text style={styles.dateLabelText}>{format(date, 'EEEE MMMM do')}</Text>
                <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}

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
                        <Text style={styles.locationSubtitle}>{address || 'Mbezi shoppers Kawe'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setTrackingState(0)}>
                        <Ionicons name="create-outline" size={20} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.deliveryCostRow}>
                <Text style={styles.costLabel}>Delivery Cost</Text>
                <Text style={styles.costValue}>Tsh 12,000</Text>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmBtnText}>{params.mode === 'pick' ? 'Confirm Location' : 'Confirm Order'}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderAssignedModal = () => (
        <Modal visible={trackingState === 1} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.successModalCard}>
                    <Ionicons name="bicycle" size={60} color="#425BA4" style={{ marginBottom: 16 }} />
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
                <TouchableOpacity onPress={() => setTrackingState(0)}>
                    <Ionicons name="refresh" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

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
                <View style={styles.driverInfo}>
                    <Text style={styles.driverSub}>Vodacom Shop</Text>
                    <Text style={styles.driverName}>Everest driver</Text>
                </View>
                <View style={styles.amountWrap}>
                    <Text style={styles.amountLabel}>Total amount</Text>
                    <Text style={styles.amountValue}>Tsh 12,000</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Calling...', 'Calling Everest driver...')}>
                <Ionicons name="call" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.callBtnText}>Call the driver</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                onRegionChangeComplete={handleRegionChangeComplete}
            >
                {/* eslint-disable-next-line */}
                {/* @ts-expect-error - react-native-maps Marker type mismatch */}
                <Marker
                    coordinate={selectedLocation}
                    draggable
                    pinColor="#425BA4"
                />
            </MapView>

            <SafeAreaView style={styles.overlay} pointerEvents="box-none" edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {trackingState === 2 ? 'Tracking Order' : 'Review Delivery Details'}
                    </Text>
                </View>

                <View style={styles.bottomContainer}>
                    {trackingState === 0 ? renderReviewCard() : renderTrackingCard()}
                </View>
            </SafeAreaView>

            {renderAssignedModal()}
            
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#425BA4" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    map: {
        width: width,
        height: height,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
        fontSize: 14,
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
