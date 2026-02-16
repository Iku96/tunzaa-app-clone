import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Mock Map Image
const MAP_IMAGE = 'https://media.wired.com/photos/59269cd37034dc5f91bec0f1/master/pass/GoogleMapTA.jpg';

export default function TrackingScreen() {
    const router = useRouter();
    const [statusStep, setStatusStep] = useState(1); // 0: Pending, 1: In Transit, 2: Delivered

    // Simulate progress for demo
    useEffect(() => {
        const timer = setTimeout(() => {
            if (statusStep < 2) {
                setStatusStep(prev => prev + 1);
            } else {
                // Navigate to Rate screen when delivered
                setTimeout(() => {
                    router.push('/(buyer)/orders/rate');
                }, 3000);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [statusStep]);

    return (
        <View style={styles.container}>
            {/* Map Placeholder */}
            <Image source={{ uri: MAP_IMAGE }} style={styles.mapImage} resizeMode="cover" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View style={styles.etaBubble}>
                        <Text style={styles.etaTitle}>Arrive by 13:50</Text>
                        <Text style={styles.etaSubtitle}>20 - 30 min</Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* Bottom Sheet Card */}
            <View style={styles.bottomSheet}>
                <Text style={styles.statusTitle}>
                    {statusStep === 0 ? 'Order Placed' : statusStep === 1 ? 'Your order is being prepared' : 'Order Delivered'}
                </Text>
                <Text style={styles.statusSubtitle}>
                    {statusStep === 0 ? 'Checking availability' : statusStep === 1 ? 'Arrives between 11:35 PM - 12:05 AM' : 'Enjoy your product!'}
                </Text>

                {/* Status Steps */}
                <View style={styles.stepsContainer}>
                    <View style={styles.stepItem}>
                        <View style={[styles.stepIcon, statusStep >= 0 && styles.activeStepIcon]}>
                            <Ionicons name="receipt-outline" size={16} color={statusStep >= 0 ? '#FFFFFF' : '#9CA3AF'} />
                        </View>
                        <Text style={[styles.stepLabel, statusStep >= 0 && styles.activeStepLabel]}>Placed</Text>
                    </View>
                    <View style={[styles.stepLine, statusStep >= 1 && styles.activeStepLine]} />
                    <View style={styles.stepItem}>
                        <View style={[styles.stepIcon, statusStep >= 1 && styles.activeStepIcon]}>
                            <Ionicons name="bicycle-outline" size={16} color={statusStep >= 1 ? '#FFFFFF' : '#9CA3AF'} />
                        </View>
                        <Text style={[styles.stepLabel, statusStep >= 1 && styles.activeStepLabel]}>InTransit</Text>
                    </View>
                    <View style={[styles.stepLine, statusStep >= 2 && styles.activeStepLine]} />
                    <View style={styles.stepItem}>
                        <View style={[styles.stepIcon, statusStep >= 2 && styles.activeStepIcon]}>
                            <Ionicons name="home-outline" size={16} color={statusStep >= 2 ? '#FFFFFF' : '#9CA3AF'} />
                        </View>
                        <Text style={[styles.stepLabel, statusStep >= 2 && styles.activeStepLabel]}>Delivered</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.driverInfo}>
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Vodacom_Logo_2020.jpg' }} // Mock Logo
                        style={styles.driverImage}
                    />
                    <View style={styles.driverDetails}>
                        <Text style={styles.driverName}>Vodacom Shop</Text>
                        <Text style={styles.driverRole}>Supplier since 2024</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.contactButton}>
                    <Ionicons name="call-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.contactButtonText}>Contact Shop</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    mapImage: {
        width: width,
        height: height * 0.6,
        position: 'absolute',
        top: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    etaBubble: {
        backgroundColor: '#4A55A2',
        padding: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginLeft: 40,
    },
    etaTitle: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    etaSubtitle: {
        color: '#E0E7FF',
        fontSize: 12,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    statusSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    stepItem: {
        alignItems: 'center',
        width: 60,
    },
    stepIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    activeStepIcon: {
        backgroundColor: '#4A55A2',
    },
    stepLabel: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    activeStepLabel: {
        color: '#4A55A2',
        fontWeight: '600',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#F3F4F6',
        marginBottom: 14, // align with icon center
        marginHorizontal: -10,
        zIndex: -1,
    },
    activeStepLine: {
        backgroundColor: '#4A55A2',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 20,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    driverImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    driverRole: {
        fontSize: 12,
        color: '#6B7280',
    },
    contactButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

});
