import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import DeliveryBottomNav from '../../src/components/navigation/DeliveryBottomNav';

const { width } = Dimensions.get('window');

// Mock data structured for the delivery requests
const MOCK_REQUESTS = [
    {
        id: '1',
        customerName: 'Juma Said',
        customerImage: 'https://i.pravatar.cc/150?img=47', // Fallback avatar if needed
        amount: '15,000',
        origin: 'Kigogo',
        destination: 'Mbezi'
    },
    {
        id: '2',
        customerName: 'Juma Said',
        customerImage: 'https://i.pravatar.cc/150?img=47',
        amount: '15,000',
        origin: 'Kigogo',
        destination: 'Mbezi'
    }
];

export default function DeliveryHomeScreen() {
    const [requests, setRequests] = useState(MOCK_REQUESTS);
    const [showToast, setShowToast] = useState(false);

    const handleAccept = (id: string) => {
        // Handle accept logic here
        console.log('Accepted request', id);
    };

    const handleReject = (id: string) => {
        // Remove the rejected item from the list
        setRequests(prev => prev.filter(req => req.id !== id));

        // Show the toast message
        setShowToast(true);

        // Auto hide toast after 3 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const handleUndo = () => {
        // In a real app we'd keep track of the deleted item and restore it
        // For now, simply hide the toast
        setShowToast(false);
        // And optionally fetch the requests again
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Delivery requests</Text>
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {requests.map(request => (
                        <View key={request.id} style={styles.card}>
                            {/* Top row: Customer info + Amount */}
                            <View style={styles.cardTop}>
                                <View style={styles.customerInfo}>
                                    <Image
                                        source={{ uri: request.customerImage }}
                                        style={styles.customerAvatar}
                                    />
                                    <View>
                                        <Text style={styles.deliverToText}>Deliver to</Text>
                                        <Text style={styles.customerName}>{request.customerName}</Text>
                                    </View>
                                </View>
                                <Text style={styles.amountText}>Tshs {request.amount}</Text>
                            </View>

                            {/* Middle row: Route */}
                            <View style={styles.routeContainer}>
                                <View style={styles.locationNode}>
                                    <Text style={styles.locationLabel}>From</Text>
                                    <Text style={styles.locationName}>{request.origin}</Text>
                                </View>

                                <View style={styles.routeLineContainer}>
                                    <View style={styles.routeLine} />
                                    <View style={styles.routeIconWrapper}>
                                        <Ionicons name="bicycle" size={20} color="#000000" />
                                    </View>
                                    <View style={styles.routeLine} />
                                </View>

                                <View style={[styles.locationNode, { alignItems: 'flex-end' }]}>
                                    <Text style={styles.locationLabel}>To</Text>
                                    <Text style={styles.locationName}>{request.destination}</Text>
                                </View>
                            </View>

                            {/* Bottom row: Actions */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={() => handleReject(request.id)}
                                >
                                    <Text style={styles.rejectButtonText}>Reject</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => handleAccept(request.id)}
                                >
                                    <Text style={styles.acceptButtonText}>Accept</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Toast Notification for Rejection */}
                {showToast && (
                    <View style={styles.toastContainer}>
                        <View style={styles.toast}>
                            <Text style={styles.toastText}>Delivery order rejected</Text>
                            <TouchableOpacity onPress={handleUndo}>
                                <Text style={styles.undoText}>Undo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

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
        paddingBottom: 100, // Extra space at bottom
        gap: 16,
    },
    card: {
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        // Optional subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    customerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
    },
    deliverToText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    amountText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#315BA9', // Tunzaa blue
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    locationNode: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    locationName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000',
    },
    routeLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1.5,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    routeLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    routeIconWrapper: {
        paddingHorizontal: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    rejectButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#F8F9FA',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000000',
    },
    acceptButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#3B5998', // Matching the darker blue from screenshot
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    toastContainer: {
        position: 'absolute',
        bottom: 100, // Above bottom nav
        left: 20,
        right: 20,
        zIndex: 50,
    },
    toast: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toastText: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '400',
    },
    undoText: {
        fontSize: 15,
        color: '#315BA9',
        fontWeight: '500',
    }
});
