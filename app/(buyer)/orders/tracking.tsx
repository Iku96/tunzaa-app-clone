import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetOrder } from '../../../src/services/orders';

const { width, height } = Dimensions.get('window');

export default function TrackingScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams();

    // Use useGetOrder with refetchInterval to poll for updates
    const { data: orderResponse, isLoading } = useGetOrder(orderId as string, !!orderId);

    // Map order status to steps
    // Status can be: 'pending', 'processing', 'shipped', 'delivered', etc.
    let statusStep = 0;
    const status = orderResponse?.status?.toLowerCase();
    
    if (status === 'shipped' || status === 'in_transit' || status === 'processing') {
        statusStep = 1;
    } else if (status === 'delivered' || status === 'completed') {
        statusStep = 2;
    }

    // When delivered, route to rate screen
    useEffect(() => {
        if (statusStep === 2) {
            const timer = setTimeout(() => {
                router.push({ pathname: '/(buyer)/orders/rate', params: { orderId } });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [statusStep, orderId, router]);

    return (
        <View style={styles.container}>
            {/* Map Placeholder - Blocked by Backend */}
            <View style={styles.mapBlockedContainer}>
                <Ionicons name="map-outline" size={48} color="#9CA3AF" />
                <Text style={styles.mapBlockedTitle}>Map Tracking Blocked</Text>
                <Text style={styles.mapBlockedText}>
                    Missing backend endpoint for live delivery coordinate polling. (Task marked as blocked).
                </Text>
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View style={styles.etaBubble}>
                        <Text style={styles.etaTitle}>Live Status Polling</Text>
                        <Text style={styles.etaSubtitle}>Connected to API</Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* Bottom Sheet Card */}
            <View style={styles.bottomSheet}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#425BA4" />
                ) : (
                    <>
                        <Text style={styles.statusTitle}>
                            {statusStep === 0 ? 'Order Placed' : statusStep === 1 ? 'Your order is being prepared' : 'Order Delivered'}
                        </Text>
                        <Text style={styles.statusSubtitle}>
                            {statusStep === 0 ? 'Checking availability' : statusStep === 1 ? 'Driver is assigned' : 'Enjoy your product!'}
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
                            {/* Generic driver icon since we don't have driver data attached to order endpoint yet */}
                            <View style={[styles.driverImage, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="person" size={24} color="#9CA3AF" />
                            </View>
                            <View style={styles.driverDetails}>
                                <Text style={styles.driverName}>Pending Assignment</Text>
                                <Text style={styles.driverRole}>Live driver data missing in API</Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    mapBlockedContainer: {
         width: width,
         height: height * 0.6,
         position: 'absolute',
         top: 0,
         backgroundColor: '#E5E7EB',
         justifyContent: 'center',
         alignItems: 'center',
         padding: 20,
    },
    mapBlockedTitle: {
         fontSize: 16,
         fontWeight: 'bold',
         color: '#4B5563',
         marginTop: 10,
    },
    mapBlockedText: {
         fontSize: 12,
         color: '#6B7280',
         textAlign: 'center',
         marginTop: 5,
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
        backgroundColor: '#425BA4',
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
        backgroundColor: '#425BA4',
    },
    stepLabel: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    activeStepLabel: {
        color: '#425BA4',
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
        backgroundColor: '#425BA4',
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
});
