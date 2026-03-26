import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAYMENT_METHODS = [
    {
        id: 'card',
        name: 'Card Payment',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png', 
        type: 'card'
    },
    {
        id: 'mpesa',
        name: 'M-Pesa',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png',
        type: 'mobile_money'
    },
    {
        id: 'airtel',
        name: 'Airtel Money',
        image: 'https://seeklogo.com/images/A/airtel-money-logo-52F3318E06-seeklogo.com.png',
        type: 'mobile_money'
    },
    {
        id: 'halopesa',
        name: 'Halopesa',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Halopesa_logo.png',
        type: 'mobile_money'
    },
    {
        id: 'tigo',
        name: 'T-Pesa',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Tigo_logo.svg/1200px-Tigo_logo.svg.png',
        type: 'mobile_money'
    },
    {
        id: 'mix',
        name: 'Mix by Pesa',
        image: 'https://via.placeholder.com/40x40?text=Mix',
        type: 'other'
    }
];

export default function PaymentSelectionScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const loanId = id ? `#LN-${id}` : '#LN-84391';
    
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSelect = (method: typeof PAYMENT_METHODS[0]) => {
        if (selectedId === method.id) {
            setSelectedId(null);
        } else {
            setSelectedId(method.id);
        }
    };

    const handleMakePayment = () => {
        if (!phoneNumber) {
            alert("Please enter a phone number");
            return;
        }
        
        // Simulating API call
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setShowSuccessModal(true);
        }, 1500);
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        // Route back to the repayment plan, updating the params to show successful payment
        router.push({
            pathname: `/(merchant)/loans/${id || '84391'}/repayment-plan` as any,
            params: {
                amount_paid: 250000,
                percentage: 100,
                paid_payments: 5
            }
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select your preferred payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.methodsContainer}>
                        {PAYMENT_METHODS.map((method, index) => {
                            const isExpanded = selectedId === method.id;
                            const isLast = index === PAYMENT_METHODS.length - 1;

                            return (
                                <View key={method.id} style={[styles.methodWrapper, !isLast && styles.methodDivider]}>
                                    <TouchableOpacity
                                        style={styles.methodCard}
                                        onPress={() => handleSelect(method)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.methodInfo}>
                                            <View style={styles.iconContainer}>
                                                <Image source={{ uri: method.image }} style={styles.methodImage} resizeMode="contain" />
                                            </View>
                                            <Text style={[styles.methodName, isExpanded && styles.methodNameActive]}>{method.name}</Text>
                                        </View>
                                        {!isExpanded && (
                                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                                        )}
                                    </TouchableOpacity>

                                    {/* Expanded Content Area */}
                                    {isExpanded && method.type === 'mobile_money' && (
                                        <View style={styles.expandedContent}>
                                            <Text style={styles.expandedDescText}>
                                                You are about to repay Tsh 50,000 for Loan ID {loanId} (Bill Finance). The payment will be processed securely through Tunzaa.
                                            </Text>

                                            <Text style={styles.inputLabel}>Phone</Text>
                                            <View style={styles.phoneInputContainer}>
                                                <View style={styles.countryCodeBox}>
                                                    <Text style={styles.countryCodeText}>+255</Text>
                                                </View>
                                                <TextInput
                                                    style={styles.phoneInput}
                                                    placeholder="Enter Phone number"
                                                    placeholderTextColor="#9CA3AF"
                                                    keyboardType="phone-pad"
                                                    value={phoneNumber}
                                                    onChangeText={setPhoneNumber}
                                                />
                                            </View>

                                            <TouchableOpacity 
                                                style={[styles.makePaymentButton, isVerifying && styles.makePaymentButtonDisabled]} 
                                                onPress={handleMakePayment}
                                                disabled={isVerifying}
                                            >
                                                <Text style={styles.makePaymentButtonText}>
                                                    {isVerifying ? "Processing..." : "Make a Payment"}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseSuccess}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseSuccess}>
                            <Ionicons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        
                        <Text style={styles.modalTitle}>🎉 Payment Successful</Text>
                        
                        <Text style={styles.modalDescription}>
                            Your repayment of Tsh 35,000 for Loan ID {loanId} has been received by Tunzaa. 
                            We'll update your repayment schedule and notify Bill Finance.
                        </Text>
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
        paddingVertical: 12,
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    methodsContainer: {
        backgroundColor: '#F9FAFB', // Slight grey from Figma
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#3B5998', // Blue outline
        overflow: 'hidden',
    },
    methodWrapper: {
        backgroundColor: '#F9FAFB',
    },
    methodDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16, // Space between cards
        borderRadius: 8,
    },
    methodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
    },
    methodImage: {
        width: 32,
        height: 32,
    },
    methodName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    methodNameActive: {
        color: '#1F2937',
    },
    expandedContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    expandedDescText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
        backgroundColor: '#FFFFFF'
    },
    countryCodeBox: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    countryCodeText: {
        fontSize: 14,
        color: '#6B7280',
    },
    phoneInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
    },
    makePaymentButton: {
        backgroundColor: '#3B5998', // Theme blue
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    makePaymentButtonDisabled: {
        opacity: 0.7,
    },
    makePaymentButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalCloseButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginTop: 20,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 15,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 10,
    }
});
