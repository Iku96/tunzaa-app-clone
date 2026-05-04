import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useGetLoanRepaymentPlan, useProcessLoanPayment } from '@/src/services/loans';

const PAYMENT_METHODS = [
    { id: 'mpesa', name: 'M-Pesa', logo: 'https://seeklogo.com/images/M/m-pesa-logo-7E6133B44B-seeklogo.com.png' },
    { id: 'halopesa', name: 'Halopesa', logo: 'https://halopesa.co.tz/wp-content/uploads/2021/04/halopesa-logo.png' },
    { id: 'tpesa', name: 'T-Pesa', logo: 'https://ttcl.co.tz/wp-content/uploads/2022/02/tpesa.png' },
    { id: 'mixpesa', name: 'Mix by Pesa', logo: 'https://seeklogo.com/images/M/mix-by-pesa-logo-8A1B5E8B9D-seeklogo.com.png' },
];

export default function LoanPaymentSelectionScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: plan, isLoading } = useGetLoanRepaymentPlan(id as string);
    const processPaymentMutation = useProcessLoanPayment();

    const [selectedMethod, setSelectedMethod] = useState<string | null>('mpesa');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Get the next pending or overdue payment amount
    const nextPayment = plan?.schedule.find(s => s.status === 'pending' || s.status === 'overdue');
    const amountToPay = nextPayment?.amount || 50000; // Fallback to 50k if no pending payment found

    const handleMakePayment = () => {
        if (!phoneNumber) return;
        setPin(''); // Reset PIN when opening
        setShowPinModal(true);
    };

    const handleConfirmPayment = async () => {
        if (pin.length < 4) return;
        
        try {
            await processPaymentMutation.mutateAsync({
                loanId: id,
                methodId: selectedMethod,
                phone: phoneNumber,
                pin: pin,
                amount: amountToPay
            });
            setShowPinModal(false);
            setIsSuccess(true);
            
            // Give user a moment to see success or just go back
            setTimeout(() => {
                router.replace(`/(vendor)/loan-repayments/${id}`);
            }, 1500);
        } catch (error) {
            console.error('Payment failed:', error);
            alert("Payment failed. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
                <ActivityIndicator size="large" color="#425BA4" />
            </View>
        );
    }

    if (isSuccess) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 24 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Text style={{ fontSize: 40 }}>✅</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>Payment Successful!</Text>
                <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 }}>
                    Your payment of TZS {amountToPay.toLocaleString()} has been processed successfully. Your loan balance has been updated.
                </Text>
            </View>
        );
    }

    const currentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select your preferred payment</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.methodsList}>
                    {PAYMENT_METHODS.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                            <View key={method.id} style={styles.methodWrapper}>
                                <TouchableOpacity 
                                    style={[styles.methodCard, isSelected && styles.selectedCard]}
                                    onPress={() => setSelectedMethod(method.id)}
                                    activeOpacity={0.7}
                                >
                                    <Image source={{ uri: method.logo }} style={styles.methodLogo} resizeMode="contain" />
                                    <Text style={styles.methodName}>{method.name}</Text>
                                </TouchableOpacity>

                                {isSelected && (
                                    <View style={styles.expandedSection}>
                                        <Text style={styles.paymentInfoText}>
                                            You are about to repay <Text style={{ fontWeight: 'bold' }}>TZS {amountToPay.toLocaleString()}</Text> for Loan ID <Text style={{ fontWeight: 'bold' }}>{plan?.application_id}</Text> ({plan?.provider_name}). The payment will be processed securely through Tunzaa.
                                        </Text>
                                        
                                        <Text style={styles.inputLabel}>Phone</Text>
                                        <View style={styles.phoneInputRow}>
                                            <View style={styles.countryCodeBox}>
                                                <Text style={styles.countryCodeText}>+255</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.phoneInput}
                                                placeholder="Enter Phone number"
                                                keyboardType="phone-pad"
                                                value={phoneNumber}
                                                onChangeText={setPhoneNumber}
                                                placeholderTextColor="#9CA3AF"
                                            />
                                        </View>

                                        <TouchableOpacity 
                                            style={[styles.payButton, !phoneNumber && styles.payButtonDisabled]}
                                            onPress={handleMakePayment}
                                            disabled={!phoneNumber}
                                        >
                                            {processPaymentMutation.isPending ? (
                                                <ActivityIndicator color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.payButtonText}>Make a Payment</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* PIN Modal (Styled like Screenshot 2) */}
            <Modal
                visible={showPinModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.pinModalContent}>
                        <Text style={styles.pinModalTitle}>
                            DO YOU WANT TO PAY TZS {amountToPay.toLocaleString()} TO TUNZAA Fintech?{"\n\n"}
                            Enter {currentMethod?.name} Pin to confirm
                        </Text>
                        
                        <TextInput 
                            style={styles.pinInput}
                            secureTextEntry={true}
                            keyboardType="numeric"
                            value={pin}
                            onChangeText={setPin}
                            autoFocus={true}
                            maxLength={4}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={styles.modalActionBtn} 
                                onPress={() => setShowPinModal(false)}
                            >
                                <Text style={[styles.modalActionText, { color: '#6B7280' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.modalActionBtn} 
                                onPress={handleConfirmPayment}
                                disabled={pin.length < 4}
                            >
                                <Text style={[styles.modalActionText, { color: pin.length >= 4 ? '#425BA4' : '#9CA3AF' }]}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 8,
        backgroundColor: '#FFFFFF',
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    methodsList: {
        gap: 12,
    },
    methodWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        height: 72,
    },
    selectedCard: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    methodLogo: {
        width: 40,
        height: 40,
        marginRight: 16,
        borderRadius: 8,
    },
    methodName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    expandedSection: {
        padding: 20,
    },
    paymentInfoText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    phoneInputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    countryCodeBox: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        justifyContent: 'center',
    },
    countryCodeText: {
        fontSize: 15,
        color: '#6B7280',
    },
    phoneInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 48,
        fontSize: 15,
        color: '#111827',
    },
    payButton: {
        backgroundColor: '#425BA4',
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
    },
    payButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    pinModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    pinModalTitle: {
        fontSize: 15,
        color: '#111827',
        lineHeight: 22,
        marginBottom: 16,
    },
    pinInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        height: 40,
        fontSize: 18,
        marginBottom: 24,
        color: '#111827',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 24,
    },
    modalActionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    modalActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    }
});
