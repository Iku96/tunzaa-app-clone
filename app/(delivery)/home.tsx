/**
 * ============================================================================
 * DELIVERY HOME SCREEN (DASHBOARD)
 * ============================================================================
 */

import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import React from 'react';

import DeliveryBottomNav from '../../src/components/navigation/DeliveryBottomNav';
import { useDeliveryContext } from '../../src/contexts/DeliveryContext';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';

const { width } = Dimensions.get('window');

export default function DeliveryHomeScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const { availableRequests, acceptDelivery, rejectDelivery } = useDeliveryContext();
    const [showToast, setShowToast] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    // Delivery Role Bouncer
    useEffect(() => {
        if (user) {
            const isDelivery = user?.profiles?.some((p: any) => ['delivery', 'driver', 'delivery_partner'].includes(p.role.toLowerCase()));
            if (!isDelivery) {
                console.log('🛡️ [DeliveryHome] Access Denied: Not a delivery partner. Redirecting to (buyer).');
                router.replace('/(buyer)');
            }
        }
    }, [user]);

    /** * Name Resolution Logic: 
     * Prioritizes the Delivery-specific name (metadata) over the core account name.
     */
    const partnerName = (() => {
        if (!user) return 'Partner';

        const deliveryProfile = user.profiles?.find((p: any) => p.role === 'delivery_partner' || p.role === 'delivery');

        const profileName = deliveryProfile?.metadata?.partner_name ||
            deliveryProfile?.display_name ||
            deliveryProfile?.displayName ||
            deliveryProfile?.metadata?.business_name;

        if (profileName) return profileName;

        const fullName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return fullName || 'Partner';
    })();

    const handleAccept = (id: string) => {
        acceptDelivery(id);
        router.push('/(delivery)/delivery-preview' as any);
    };

    const handleReject = (id: string) => {
        rejectDelivery(id);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.welcomeText}>Habari, {partnerName}</Text>
                        <Text style={styles.headerTitle}>Delivery requests</Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {availableRequests.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: '#6B7280' }}>Hakuna maombi mapya</Text>
                        </View>
                    ) : (
                        availableRequests.map(request => (
                            <View key={request.id} style={styles.card}>
                                <View style={styles.cardTop}>
                                    <View style={styles.customerInfo}>
                                        <Image source={{ uri: request.customerImage }} style={styles.customerAvatar} />
                                        <View>
                                            <Text style={styles.deliverToText}>Mpelekee</Text>
                                            <Text style={styles.customerName}>{request.customerName}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.amountText}>Tshs {Number(request.amount).toLocaleString()}</Text>
                                </View>

                                <View style={styles.routeContainer}>
                                    <View style={styles.locationNode}>
                                        <Text style={styles.locationLabel}>From</Text>
                                        <Text style={styles.locationName}>{request.origin}</Text>
                                    </View>
                                    <View style={styles.routeLineContainer}>
                                        <View style={styles.routeLine} />
                                        <Ionicons name="bicycle" size={20} color="#000000" />
                                        <View style={styles.routeLine} />
                                    </View>
                                    <View style={[styles.locationNode, { alignItems: 'flex-end' }]}>
                                        <Text style={styles.locationLabel}>To</Text>
                                        <Text style={styles.locationName}>{request.destination}</Text>
                                    </View>
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(request.id)}>
                                        <Text>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(request.id)}>
                                        <Text style={{ color: '#FFFFFF' }}>Accept</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>

                <DeliveryBottomNav />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { paddingVertical: 20, paddingHorizontal: 20, backgroundColor: '#FFFFFF' },
    welcomeText: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
    headerContent: { gap: 4 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
    card: { borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, padding: 16, backgroundColor: '#FFFFFF' },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    customerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6' },
    deliverToText: { fontSize: 12, color: '#6B7280' },
    customerName: { fontSize: 16, fontWeight: '600', color: '#000000' },
    amountText: { fontSize: 18, fontWeight: '600', color: '#425BA4' },
    routeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    locationNode: { flex: 1 },
    locationLabel: { fontSize: 12, color: '#6B7280' },
    locationName: { fontSize: 14, fontWeight: '500', color: '#000000' },
    routeLineContainer: { flexDirection: 'row', alignItems: 'center', flex: 1.5, paddingHorizontal: 10 },
    routeLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB', borderStyle: 'dashed' },
    actionButtons: { flexDirection: 'row', gap: 12 },
    rejectButton: { flex: 1, height: 48, backgroundColor: '#F8F9FA', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    acceptButton: { flex: 1, height: 48, backgroundColor: '#425BA4', borderRadius: 24, alignItems: 'center', justifyContent: 'center' }
});