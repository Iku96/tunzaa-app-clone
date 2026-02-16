import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    amount: number;
    onPaymentSuccess: () => void;
}

const PAYMENT_METHODS = [
    { id: 'card', name: 'Card Payment', icon: 'card-outline', color: '#1F2937' },
    { id: 'mpesa', name: 'M-Pesa', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png', color: '#E60000' },
    { id: 'airtel', name: 'Airtel Money', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Airtel_logo.svg/1200px-Airtel_logo.svg.png', color: '#E60000' },
    { id: 'halopesa', name: 'HaloPesa', image: 'https://halotel.co.tz/themes/halotel/assets/images/halopesa_logo.png', color: '#F37021' },
    { id: 'tigo', name: 'T-Pesa', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Tigo_logo.svg/1200px-Tigo_logo.svg.png', color: '#00377B' },
];

export default function PaymentModal({ visible, onClose, amount, onPaymentSuccess }: PaymentModalProps) {
    const [step, setStep] = useState<'select' | 'pin'>('select');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [pin, setPin] = useState('');

    const router = useRouter();

    const handleMethodSelect = (id: string) => {
        setSelectedMethod(id);
        if (['mpesa', 'airtel', 'halopesa', 'tigo'].includes(id)) {
            onClose();
            router.push('/(buyer)/checkout/payment-input');
        } else {
            setStep('pin');
        }
    };

    const handlePay = () => {
        // Simulate payment processing for Card or other methods handled here
        setTimeout(() => {
            setStep('select');
            setPin('');
            setSelectedMethod(null);
            onPaymentSuccess();
        }, 1500);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {step === 'select' ? (
                        <>
                            <View style={styles.header}>
                                <Text style={styles.title}>Select your preferred payment</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color="#1F2937" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={styles.methodsList}>
                                {PAYMENT_METHODS.map((method) => (
                                    <TouchableOpacity
                                        key={method.id}
                                        style={styles.methodItem}
                                        onPress={() => handleMethodSelect(method.id)}
                                    >
                                        <View style={styles.iconContainer}>
                                            {method.image ? (
                                                <Image source={{ uri: method.image }} style={styles.methodImage} resizeMode="contain" />
                                            ) : (
                                                <Ionicons name={method.icon as any} size={24} color={method.color} />
                                            )}
                                        </View>
                                        <Text style={styles.methodName}>{method.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    ) : (
                        <View style={styles.pinContainer}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Confirm Payment</Text>
                                <TouchableOpacity onPress={() => setStep('select')}>
                                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.pinLabel}>
                                DO YOU WANT TO PAY TSH {amount.toLocaleString()} TO TUNZAA FINTECH?
                                Enter {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name} PIN to confirm
                            </Text>

                            <TextInput
                                style={styles.pinInput}
                                value={pin}
                                onChangeText={setPin}
                                placeholder="Enter PIN"
                                secureTextEntry
                                keyboardType="numeric"
                                autoFocus
                            />

                            <View style={styles.pinActions}>
                                <TouchableOpacity onPress={() => setStep('select')}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handlePay}>
                                    <Text style={styles.sendText}>Send</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        height: '60%', // Adjust as needed
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    methodsList: {
        gap: 12,
    },
    methodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    methodImage: {
        width: 40,
        height: 40,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    pinContainer: {
        flex: 1,
    },
    pinLabel: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 20,
        lineHeight: 20,
    },
    pinInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#4A55A2',
        fontSize: 18,
        paddingVertical: 8,
        marginBottom: 40,
    },
    pinActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 24,
    },
    cancelText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    sendText: {
        fontSize: 16,
        color: '#4A55A2',
        fontWeight: 'bold',
    },
});
