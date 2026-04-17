import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MapPin, Phone, ArrowLeft } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import DeliveryBottomNav from '../../src/components/navigation/DeliveryBottomNav';

const { width, height } = Dimensions.get('window');

// Mock route coordinates
const ROUTE_START = { latitude: -6.8161, longitude: 39.2804 }; // Kariakoo approx
const ROUTE_END = { latitude: -6.8000, longitude: 39.2900 };   // Destination approx
const MOCK_POLYLINE = [
    ROUTE_START,
    { latitude: -6.8100, longitude: 39.2820 },
    { latitude: -6.8050, longitude: 39.2850 },
    ROUTE_END
];

export default function DeliveryMapScreen() {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header - Overlaid on map */}
            <SafeAreaView edges={['top']} style={styles.headerSafe}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={24} color="#000000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Delivery details</Text>
                </View>
            </SafeAreaView>

            {/* Map View - Blocked by Backend */}
            <View style={[styles.map, { backgroundColor: '#E5E7EB', padding: 20, paddingTop: 100, alignItems: 'center' }]}>
                <View style={{
                     backgroundColor: '#FEE2E2',
                     padding: 24,
                     borderRadius: 16,
                     alignItems: 'center',
                     width: '100%',
                     borderWidth: 1,
                     borderColor: '#FCA5A5'
                }}>
                    <Ionicons name="map-outline" size={48} color="#EF4444" style={{ marginBottom: 12 }} />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#B91C1C', marginBottom: 8 }}>
                        Live Map Routing Blocked
                    </Text>
                    <Text style={{ fontSize: 14, color: '#991B1B', textAlign: 'center', marginBottom: 16 }}>
                        The backend lacks the active polling API required to stream real-time GPS coordinates for delivery partners. Hardcoded map lines have been removed per execution rules.
                    </Text>
                    
                    <View style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, width: '100%' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#7F1D1D', marginBottom: 4 }}>Required Endpoint:</Text>
                        <Text style={{ fontFamily: 'Courier', fontSize: 11, color: '#7F1D1D' }}>GET /delivery/tasks/{'{taskId}'}/route</Text>
                        <Text style={{ fontFamily: 'Courier', fontSize: 11, color: '#7F1D1D', marginTop: 4 }}>Response: Array of Coordinate vectors</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Sheet Card */}
            <View style={[styles.bottomSheet, { height: '35%' }]}>
                {/* Drag Handle */}
                <View style={styles.dragHandleContainer}>
                    <View style={styles.dragHandle} />
                </View>

                {/* Pickup Header */}
                <View style={styles.pickupHeader}>
                    <MapPin size={24} color="#000000" strokeWidth={2} />
                    <Text style={styles.pickupLocationText}>Pending Route info</Text>
                    <Text style={styles.pickupPointsText}>Pickup points</Text>
                </View>

                <View style={[styles.pickupItemCard, { opacity: 0.5 }]}>
                    <View style={styles.pickupItemIcon}>
                        <Ionicons name="checkmark-circle" size={24} color="#9CA3AF" />
                        <View style={styles.itemVerticalLine} />
                    </View>

                    <View style={styles.pickupItemContent}>
                        <View style={styles.textDetails}>
                            <Text style={styles.shopName}>Live shop data required</Text>
                            <Text style={styles.productName}>Awaiting Task Binding</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNavWrapper}>
                <DeliveryBottomNav />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Fallback
    },
    headerSafe: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#FFFFFF', // Need solid background for header
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        position: 'relative',
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
    map: {
        width: width,
        height: height,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1, // Under everything else
    },
    // Markers
    startMarkerContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 120, // Tall enough to hold tooltip + line
        width: 150,
    },
    tooltipContainer: {
        alignItems: 'center',
        marginBottom: -10, // overlap line
    },
    tooltip: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tooltipText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    tooltipConnector: {
        width: 2,
        height: 30,
        backgroundColor: '#425BA4',
    },
    scooterMarkerCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(59, 89, 152, 0.2)', // Semi-transparent outer ring
        alignItems: 'center',
        justifyContent: 'center',
    },
    scooterMarkerInner: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#425BA4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    endMarkerContainer: {
        alignItems: 'center',
    },
    endTooltip: {
        backgroundColor: '#01AC00',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    endTooltipText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 18,
    },
    endTooltipSubText: {
        color: '#FFFFFF',
        fontSize: 10,
        lineHeight: 12,
    },
    endDotContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#01AC00',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    endDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#01AC00',
    },
    // Bottom Sheet
    bottomSheet: {
        position: 'absolute',
        bottom: 80, // Above bottom nav
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    dragHandleContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    dragHandle: {
        width: 48,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
    },
    pickupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    pickupLocationText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    pickupPointsText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 4,
    },
    pickupItemCard: {
        flexDirection: 'row',
        paddingLeft: 4,
    },
    pickupItemIcon: {
        alignItems: 'center',
        marginRight: 16,
        paddingTop: 2,
    },
    itemVerticalLine: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E7EB',
        marginTop: 4,
        marginBottom: -20, // To bleed downwards
    },
    pickupItemContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    textDetails: {
        flex: 1,
    },
    shopName: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
    },
    productName: {
        fontSize: 15,
        color: '#000000',
        fontWeight: '500',
    },
    callButton: {
        padding: 8,
    },
    // Bottom Nav Wrapper
    bottomNavWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    }
});
