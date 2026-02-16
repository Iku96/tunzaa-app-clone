import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock Product Data (In real app, fetch or pass via params)
const PRODUCT = {
    name: 'Long Sofa',
    totalPrice: 46000,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60',
    tax: 46000, // Total Price: Tax 46,000 as per screenshot label
};

export default function InstallmentPlanScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // State
    const [completionDate, setCompletionDate] = useState('20/02/2026');
    const [frequency, setFrequency] = useState('Every day');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Mock calculation
    const goalAmount = 5000;

    const handleContinue = () => {
        setShowSuccessModal(true);
    };

    const handleMakePayment = () => {
        setShowSuccessModal(false);
        // Navigate to payment selection/input
        router.push('/(buyer)/checkout/payment-input');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Set an Installment Goal</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.subtitle}>
                    You're about to start an installment goal.
                </Text>
                <Text style={styles.priceLabel}>
                    Total Price: <Text style={styles.priceValue}>Tzs {PRODUCT.totalPrice.toLocaleString()}</Text>
                </Text>

                {/* Product Card */}
                <View style={styles.productCard}>
                    <Image source={{ uri: PRODUCT.image }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{PRODUCT.name}</Text>
                        <Text style={styles.productPrice}>Tzs {PRODUCT.totalPrice.toLocaleString()}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Goal duration: 5 months</Text>
                        </View>
                    </View>
                </View>

                {/* Date Selection */}
                <Text style={styles.label}>When do you want to complete your payment?</Text>
                <Text style={styles.helperText}>Schedule your time</Text>

                <TouchableOpacity style={styles.inputButton}>
                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                    <Text style={styles.inputText}>{completionDate}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Frequency Selection */}
                <Text style={styles.label}>How often do you want to pay?</Text>

                <View style={styles.frequencyContainer}>
                    {['Every day', 'Every week', 'After 3 days'].map((freq) => (
                        <TouchableOpacity
                            key={freq}
                            style={[
                                styles.freqButton,
                                frequency === freq && styles.freqButtonActive
                            ]}
                            onPress={() => setFrequency(freq)}
                        >
                            <Text style={[
                                styles.freqText,
                                frequency === freq && styles.freqTextActive
                            ]}>{freq}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom Frequency Option */}
                <View style={styles.customFreqRow}>
                    <Text style={styles.customFreqLabel}>After 3 days</Text>
                    <TouchableOpacity>
                        <Text style={styles.setOwnTime}>Set your own time</Text>
                    </TouchableOpacity>
                </View>


                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeModal}
                            onPress={() => setShowSuccessModal(false)}
                        >
                            <Ionicons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>

                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                        </View>

                        <Text style={styles.modalTitle}>Great Progress Femi!</Text>
                        <Text style={styles.modalText}>
                            You've set a goal for <Text style={styles.boldText}>{PRODUCT.name}</Text>
                        </Text>
                        <Text style={styles.modalText}>
                            To reach Your goal, you'll need to pay <Text style={styles.highlightText}>Tzs. {goalAmount.toLocaleString()}</Text> every 3 days until June 30,2025
                        </Text>

                        <TouchableOpacity style={styles.modalButton} onPress={handleMakePayment}>
                            <Text style={styles.modalButtonText}>Make a Payment</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        paddingTop: 10,
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    priceLabel: {
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 24,
    },
    priceValue: {
        fontWeight: 'bold',
    },
    productCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A55A2',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    badge: {
        backgroundColor: '#1E3A8A',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '500',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    helperText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
    },
    inputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        marginBottom: 32,
    },
    inputText: {
        flex: 1,
        marginLeft: 12,
        color: '#1F2937',
        fontSize: 16,
    },
    frequencyContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    freqButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    freqButtonActive: {
        borderColor: '#4A55A2',
        backgroundColor: '#EFF6FF',
    },
    freqText: {
        fontSize: 12,
        color: '#6B7280',
    },
    freqTextActive: {
        color: '#4A55A2',
        fontWeight: '600',
    },
    customFreqRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 40,
    },
    customFreqLabel: {
        color: '#1F2937',
        fontSize: 14,
    },
    setOwnTime: {
        color: '#4A55A2',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    continueButton: {
        backgroundColor: '#1E3A8A', // Dark blue footer button
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    closeModal: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    checkCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#1E3A8A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F59E0B', // Gold/Orange color
        marginBottom: 16,
    },
    modalText: {
        fontSize: 14,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 22,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    highlightText: {
        color: '#4A55A2',
        fontWeight: 'bold',
    },
    modalButton: {
        backgroundColor: '#1E3A8A',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 24,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
