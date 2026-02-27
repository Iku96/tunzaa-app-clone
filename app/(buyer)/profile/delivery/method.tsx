import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChooseDeliveryMethodScreen() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'courier' | 'pickup' | null>(null);

    const renderProgressStepper = () => (
        <View style={styles.stepperContainer}>
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                    <Ionicons name="apps-outline" size={14} color="#425BA4" />
                </View>
                <Text style={[styles.stepText, styles.stepTextActive]}>STEP 1</Text>
                <Text style={styles.stepSubText}>Choose Method</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
                <View style={styles.stepCircle}>
                    <Ionicons name="person-outline" size={14} color="#9CA3AF" />
                </View>
                <Text style={styles.stepText}>STEP 2</Text>
                <Text style={styles.stepSubText}>Choose courier</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
                <View style={styles.stepCircle}>
                    <Ionicons name="document-text-outline" size={14} color="#9CA3AF" />
                </View>
                <Text style={styles.stepText}>STEP 3</Text>
                <Text style={styles.stepSubText}>Save address</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose Your Courier</Text>
                <View style={{ width: 24 }} />
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
                    <View style={[styles.radioOuter, selectedMethod === 'courier' && styles.radioOuterSelected]}>
                        {selectedMethod === 'courier' && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.radioTextContainer}>
                        <Text style={styles.radioTitle}>Courier Delivery</Text>
                        <Text style={styles.radioSubtitle}>Delivered to your address by our agent</Text>
                        <View style={styles.etaRow}>
                            <Ionicons name="time-outline" size={14} color="#425BA4" />
                            <Text style={styles.etaText}>Estimated delivery: 24-48 hours</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.radioCard, selectedMethod === 'pickup' && styles.radioCardSelected]}
                    onPress={() => setSelectedMethod('pickup')}
                >
                    <View style={[styles.radioOuter, selectedMethod === 'pickup' && styles.radioOuterSelected]}>
                        {selectedMethod === 'pickup' && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.radioTextContainer}>
                        <Text style={styles.radioTitle}>Self Pickup</Text>
                        <Text style={styles.radioSubtitle}>Collect from a designated store or collection point yourself.</Text>
                        <View style={styles.etaRow}>
                            <Ionicons name="cube-outline" size={14} color="#9CA3AF" />
                            <Text style={[styles.etaText, { color: '#6B7280' }]}>Ready for pickup within 2 hours</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Information Banner */}
                <View style={styles.infoBanner}>
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle" size={18} color="#425BA4" />
                        <Text style={styles.infoTitle}>Delivery Information</Text>
                    </View>
                    <Text style={styles.infoText}>
                        All delivery options include real-time tracking and notifications. Delivery times may vary based on your location and product availability.
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedMethod && styles.continueButtonDisabled]}
                    onPress={() => router.push('/(buyer)/profile/delivery/courier')}
                    disabled={!selectedMethod}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        color: '#1A1A1A',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        paddingHorizontal: 30,
    },
    step: {
        alignItems: 'center',
        width: 80,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    stepCircleActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#E0E7FF',
    },
    stepText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
        marginBottom: 2,
    },
    stepTextActive: {
        color: '#425BA4',
    },
    stepSubText: {
        fontSize: 9,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#F3F4F6',
        marginTop: -32,
    },
    scrollContent: {
        paddingHorizontal: 24,
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
        fontSize: 13,
        color: '#6B7280',
    },
    radioCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
    },
    radioCardSelected: {
        borderColor: '#425BA4',
        borderWidth: 1.5,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    radioOuterSelected: {
        borderColor: '#425BA4',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#425BA4',
    },
    radioTextContainer: {
        flex: 1,
    },
    radioTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    radioSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 18,
    },
    etaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    etaText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#425BA4',
    },
    infoBanner: {
        backgroundColor: '#F0F4FF',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    infoText: {
        fontSize: 12,
        color: '#425BA4',
        lineHeight: 18,
        opacity: 0.8,
    },
    footer: {
        padding: 24,
        paddingBottom: 34,
    },
    continueButton: {
        backgroundColor: '#425BA4',
        borderRadius: 30,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
