import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MapPin, ShoppingCart, Store, User, CircleDollarSign } from 'lucide-react-native';
import DeliveryBottomNav from '../../src/components/navigation/DeliveryBottomNav';
import { useDeliveryContext } from '../../src/contexts/DeliveryContext';

export default function DeliveryPreviewScreen() {
    const router = useRouter();
    const { activeDelivery } = useDeliveryContext();

    const handleStartDelivery = () => {
        router.push('/(delivery)/delivery-active' as any);
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

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Delivery</Text>
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.timelineContainer}>
                        {/* Dynamic Pickup Sections */}
                        {activeDelivery.pickupPoints.map((point, index) => (
                            <View key={point.id} style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.dot, { backgroundColor: '#01AC00' }]} />
                                    <Text style={styles.sectionTitle}>
                                        Pickup details {activeDelivery.pickupPoints.length > 1 ? `(${index + 1})` : '(From)'}
                                    </Text>
                                </View>

                                {/* The line connecting pickup to next node */}
                                <View style={styles.leftBorderLine}>
                                    <View style={styles.sectionContent}>
                                        <View style={styles.detailRow}>
                                            <MapPin size={22} color="#4B5563" strokeWidth={1.5} style={styles.detailIcon} />
                                            <View style={styles.detailTextContainer}>
                                                <Text style={styles.detailLabel}>Location</Text>
                                                <Text style={styles.detailValue}>
                                                    {point.location.specific}, {point.location.area}
                                                </Text>
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
                                    </View>
                                </View>
                            </View>
                        ))}

                        {/* Delivery Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                {/* Negative margin to align with the border line from the previous section */}
                                <View style={[styles.dot, { backgroundColor: '#425BA4', marginLeft: 0 }]} />
                                <Text style={styles.sectionTitle}>Delivery details (To)</Text>
                            </View>

                            {/* No left border on delivery section since it's the last stop */}
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
                            </View>
                        </View>
                    </View>

                    {/* Start Delivery Button */}
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStartDelivery}
                    >
                        <Text style={styles.startButtonText}>Start delivery</Text>
                    </TouchableOpacity>
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
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
        paddingTop: 10,
        paddingBottom: 100, // Space for bottom nav
    },
    timelineContainer: {
        position: 'relative',
        marginLeft: 10, // Indent for the timeline
    },
    // The continuous line that connects the dots
    timelineLine: {
        position: 'absolute',
        top: 24, // Start below the first dot
        bottom: 0, // Stretch to the bottom or let content define it?
        // Actually, better to define the line within the pickup section
    },
    section: {
        marginBottom: 0, // Removed margin to keep line continuous
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 2, // Keep dot above the line
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 10,
        // Optional outline if needed to match design perfectly
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    sectionContent: {
        paddingLeft: 24, // Indent the content
        position: 'relative',
        paddingBottom: 10,
    },
    // This provides the actual vertical line
    leftBorderLine: {
        borderLeftWidth: 1,
        borderColor: '#E5E7EB',
        marginLeft: 6, // Aligns perfectly center with the 14px dot (6 + 1 + 7?) No, 14px dot / 2 = 7px center. 
        paddingBottom: 30, // Space before the next dot
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    detailIcon: {
        marginRight: 12,
        marginTop: 4,
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
    startButton: {
        backgroundColor: '#425BA4', // Dark blue from screenshot
        borderRadius: 24,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    }
});
