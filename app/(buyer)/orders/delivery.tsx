import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Mock Map Image (Replace with actual MapView later)
const MAP_IMAGE = 'https://media.wired.com/photos/59269cd37034dc5f91bec0f1/master/pass/GoogleMapTA.jpg';

export default function DeliverySetupScreen() {
    const router = useRouter();
    const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');

    return (
        <View style={styles.container}>
            {/* Map Placeholder */}
            <Image source={{ uri: MAP_IMAGE }} style={styles.mapImage} resizeMode="cover" />

            {/* Content Overlay */}
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Review your order before delivery</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Drop-off Location Bubble on Map */}
                <View style={styles.mapBubble}>
                    <View style={styles.bubbleContent}>
                        <Text style={styles.bubbleTitle}>Drop-off location</Text>
                        <Text style={styles.bubbleSubtitle}>Picked up at 2:35 PM</Text>
                    </View>
                    <View style={styles.bubbleArrow} />
                </View>
            </SafeAreaView>

            {/* Bottom Sheet Card */}
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />

                <View style={styles.timeInfo}>
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                    <Text style={styles.timeText}>Estimated delivery time</Text>
                    <Text style={styles.timeValue}>30 - 40 min</Text>
                </View>

                <View style={styles.divider} />

                {/* Delivery Type Selection */}
                <View style={styles.deliveryTypes}>
                    <TouchableOpacity
                        style={[styles.typeOption, deliveryType === 'standard' && styles.activeType]}
                        onPress={() => setDeliveryType('standard')}
                    >
                        <View style={styles.radioCircle}>
                            {deliveryType === 'standard' && <View style={styles.radioInner} />}
                        </View>
                        <View>
                            <Text style={styles.typeTitle}>Standard</Text>
                            <Text style={styles.typeTime}>30 - 40 min</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.typeOption, deliveryType === 'express' && styles.activeType]}
                        onPress={() => setDeliveryType('express')}
                    >
                        <View style={styles.radioCircle}>
                            {deliveryType === 'express' && <View style={styles.radioInner} />}
                        </View>
                        <View>
                            <Text style={styles.typeTitle}>Express</Text>
                            <Text style={styles.typeTime}>20 - 30 min</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Address Section */}
                <View style={styles.addressSection}>
                    <View style={styles.addressRow}>
                        <View style={styles.addressIcon}>
                            <Ionicons name="location-outline" size={20} color="#4A55A2" />
                        </View>
                        <View style={styles.addressDetails}>
                            <Text style={styles.addressLabel}>Postal Address</Text>
                            <Text style={styles.addressValue} numberOfLines={1}>Dar es salaam, Kariakoo</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>

                    <View style={styles.addressRow}>
                        <View style={styles.addressIcon}>
                            <Ionicons name="navigate-outline" size={20} color="#4A55A2" />
                        </View>
                        <View style={styles.addressDetails}>
                            <Text style={styles.addressLabel}>Drop-off Address</Text>
                            <Text style={styles.addressValue} numberOfLines={1}>Delivery address: Wasafi Shoppers, Haile..</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </View>

                {/* Driver Call Section */}
                <TouchableOpacity style={styles.callDriver}>
                    <Ionicons name="call-outline" size={20} color="#4B5563" />
                    <Text style={styles.callText}>Call Driver</Text>
                </TouchableOpacity>

                <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Delivery Cost</Text>
                    <Text style={styles.costValue}>Tsh. 10,300</Text>
                </View>

                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => router.push('/(buyer)/orders/success')}
                >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
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
        height: height * 0.5, // Occupy top half
        position: 'absolute',
        top: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        backgroundColor: 'rgba(255,255,255,0.8)', // Semitransparent bg for visibility
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        overflow: 'hidden',
    },
    mapBubble: {
        position: 'absolute',
        top: 150,
        left: width * 0.4,
        alignItems: 'center',
    },
    bubbleContent: {
        backgroundColor: '#4A55A2',
        padding: 12,
        borderRadius: 12,
        marginBottom: -2,
    },
    bubbleTitle: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    bubbleSubtitle: {
        color: '#E0E7FF',
        fontSize: 10,
    },
    bubbleArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#4A55A2',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        paddingBottom: 40,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    timeText: {
        flex: 1,
        marginLeft: 8,
        color: '#6B7280',
        fontSize: 14,
    },
    timeValue: {
        fontWeight: 'bold',
        color: '#1F2937',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    deliveryTypes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    typeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    activeType: {
        borderColor: '#4A55A2',
        backgroundColor: '#EFF6FF',
    },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#4A55A2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4A55A2',
    },
    typeTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    typeTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    addressSection: {
        gap: 16,
        marginBottom: 24,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addressIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressDetails: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    addressValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    callDriver: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    callText: {
        color: '#4B5563',
        fontWeight: '500',
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        alignItems: 'center',
    },
    costLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    costValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    confirmButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
