import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourierSelectionScreen() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'courier' | 'pickup'>('courier');
    const [selectedCourier, setSelectedCourier] = useState<string | null>('simba');

    const renderProgressStepper = () => (
        <View style={styles.stepperContainer}>
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                    <Ionicons name="checkmark" size={14} color="#4A55A2" />
                </View>
                <Text style={[styles.stepText, styles.stepTextCompleted]}>STEP 1</Text>
                <Text style={styles.stepSubText}>Choose Method</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                    <View style={styles.stepCircleActiveInner} />
                </View>
                <Text style={[styles.stepText, styles.stepTextActive]}>STEP 2</Text>
                <Text style={styles.stepSubText}>Choose courier</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
                <View style={styles.stepCircle}>
                    <Text style={styles.stepNumber}>3</Text>
                </View>
                <Text style={styles.stepText}>STEP 3</Text>
                <Text style={styles.stepSubText}>New address</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Delivery method</Text>
                    <View style={{ width: 40 }} />
                </View>

                {renderProgressStepper()}

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Choose Your Delivery Method</Text>
                        <Text style={styles.sectionSubtitle}>Select how you want to receive your order</Text>
                    </View>

                    {/* Radio Options */}
                    <TouchableOpacity
                        style={[styles.radioCard, selectedMethod === 'courier' && styles.radioCardSelected]}
                        onPress={() => setSelectedMethod('courier')}
                    >
                        <View style={styles.radioOuter}>
                            {selectedMethod === 'courier' && <View style={styles.radioInner} />}
                        </View>
                        <View style={styles.radioTextContainer}>
                            <Text style={styles.radioTitle}>Courier Delivery</Text>
                            <Text style={styles.radioSubtitle}>Delivered to your address by our agent</Text>
                            <View style={styles.etaRow}>
                                <Ionicons name="time-outline" size={14} color="#3B82F6" />
                                <Text style={styles.etaText}>Estimated delivery: 24-48 hours</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.radioCard, selectedMethod === 'pickup' && styles.radioCardSelected]}
                        onPress={() => setSelectedMethod('pickup')}
                    >
                        <View style={styles.radioOuter}>
                            {selectedMethod === 'pickup' && <View style={styles.radioInner} />}
                        </View>
                        <View style={styles.radioTextContainer}>
                            <Text style={styles.radioTitle}>Self Pickup</Text>
                            <Text style={styles.radioSubtitle}>Collect from a designated Simba courier point</Text>
                            <View style={styles.etaRow}>
                                <Ionicons name="cube-outline" size={14} color="#6B7280" />
                                <Text style={styles.pickupEtaText}>Available for pickup</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Couriers List (only applies if courier delivery selected) */}
                    {selectedMethod === 'courier' && (
                        <View style={styles.courierSection}>
                            <Text style={styles.courierTitle}>Select your preferred delivery company</Text>

                            <TouchableOpacity
                                style={[styles.courierCard, selectedCourier === 'simba' && styles.courierCardSelected]}
                                onPress={() => setSelectedCourier('simba')}
                            >
                                <View style={styles.courierLogoBox}>
                                    <Image
                                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Simba_logo.png/640px-Simba_logo.png' }} // Placeholder
                                        style={styles.courierLogo}
                                        resizeMode="contain"
                                    />
                                    <Text style={[styles.courierLogoText, { fontSize: 10, color: 'red', fontWeight: 'bold' }]}>SIMBA</Text>
                                    <Text style={[styles.courierLogoText, { fontSize: 6, color: 'blue' }]}>LOGISTICS</Text>
                                </View>
                                <View style={styles.courierInfo}>
                                    <Text style={styles.courierName}>Simba Courier</Text>
                                    <Text style={styles.courierType}>For small/medium packages</Text>
                                    <View style={styles.etaRow}>
                                        <Ionicons name="time-outline" size={12} color="#3B82F6" />
                                        <Text style={styles.etaTextSmall}>Estimated delivery: 24-48 hours</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.courierCard, selectedCourier === 'another' && styles.courierCardSelected]}
                                onPress={() => setSelectedCourier('another')}
                            >
                                <View style={styles.courierLogoBox}>
                                    <Text style={[styles.courierLogoText, { fontSize: 10, color: 'red', fontWeight: 'bold' }]}>SIMBA</Text>
                                    <Text style={[styles.courierLogoText, { fontSize: 6, color: 'blue' }]}>LOGISTICS</Text>
                                </View>
                                <View style={styles.courierInfo}>
                                    <Text style={styles.courierName}>Simba Courier</Text>
                                    <Text style={styles.courierType}>For medium/large packages</Text>
                                    <View style={styles.etaRow}>
                                        <Ionicons name="time-outline" size={12} color="#3B82F6" />
                                        <Text style={styles.etaTextSmall}>Estimated delivery: 24-48 hours</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Information Banner */}
                    <View style={styles.infoBanner}>
                        <View style={styles.infoRow}>
                            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
                            <Text style={styles.infoTitle}>Delivery Information</Text>
                        </View>
                        <Text style={styles.infoText}>
                            All delivery options include real-time tracking and notifications. Delivery times may vary based on your location and product availability.
                        </Text>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => router.push('/(buyer)/checkout/delivery/address')}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 40,
    },
    step: {
        alignItems: 'center',
        width: 80,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
    },
    stepCircleCompleted: {
        borderColor: '#EFF6FF',
        backgroundColor: '#EFF6FF',
    },
    stepCircleActive: {
        borderColor: '#EFF6FF',
        backgroundColor: '#EFF6FF',
    },
    stepCircleActiveInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4A55A2',
    },
    stepNumber: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    stepText: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '600',
        marginBottom: 2,
    },
    stepTextCompleted: {
        color: '#4B5563',
    },
    stepTextActive: {
        color: '#4A55A2',
    },
    stepSubText: {
        fontSize: 10,
        color: '#6B7280',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#F3F4F6',
        marginHorizontal: -10,
        marginBottom: 20, // offset circle height
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionHeader: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    radioCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    radioCardSelected: {
        borderColor: '#4A55A2',
        borderWidth: 1.5,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4A55A2',
    },
    radioTextContainer: {
        flex: 1,
    },
    radioTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    radioSubtitle: {
        fontSize: 13,
        color: '#4B5563',
        marginBottom: 8,
    },
    etaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
    },
    etaText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
    },
    etaTextSmall: {
        fontSize: 10,
        color: '#3B82F6',
        fontWeight: '500',
    },
    pickupEtaText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    courierSection: {
        marginTop: 8,
        marginBottom: 16,
    },
    courierTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    courierCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },
    courierCardSelected: {
        borderColor: '#4A55A2',
        borderWidth: 1.5,
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    courierLogoBox: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    courierLogo: {
        width: 24,
        height: 24,
    },
    courierLogoText: {
        textAlign: 'center',
    },
    courierInfo: {
        flex: 1,
    },
    courierName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    courierType: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 6,
    },
    infoBanner: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
        marginLeft: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#60A5FA',
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        paddingBottom: 30, // Extra padding for safe area logic
    },
    continueButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: "#4A55A2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
