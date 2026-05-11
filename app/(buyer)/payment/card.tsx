import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useCreateOrder } from '@/src/services/orders';
import { useInitiatePayment, useCheckPaymentStatus } from '@/src/services/payments';
import { useGetBuyerProfile } from '@/src/services/buyers';
import { useClearCart } from '@/src/stores/cart';
import * as Burnt from "burnt";

export default function CardPaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useTunzaaAuth();
    
    // Form State
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState(user?.name || '');
    
    // Status State
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // API Hooks
    const { mutateAsync: createOrder } = useCreateOrder();
    const { mutateAsync: initiatePayment } = useInitiatePayment();
    const { data: buyerProfile } = useGetBuyerProfile(user?.user_id || '');
    const { mutateAsync: clearCart } = useClearCart();

    const displayAmount = params.amount ? Number(params.amount) : 0;

    const handleProcessPayment = async () => {
        if (!cardNumber || cardNumber.length < 16) {
            Burnt.toast({ title: "Invalid Card", message: "Please enter a valid card number", preset: "error" });
            return;
        }
        if (!expiryDate || !expiryDate.includes('/')) {
            Burnt.toast({ title: "Invalid Expiry", message: "Please use MM/YY format", preset: "error" });
            return;
        }
        if (cvv.length < 3) {
            Burnt.toast({ title: "Invalid CVV", message: "Please enter a valid CVV", preset: "error" });
            return;
        }

        setIsProcessing(true);
        try {
            const cartId = params.cartId as string;
            
            // 1. Resolve Address (Same logic as phone.tsx)
            let shippingAddress = {
                address_line1: 'Default Address',
                city: 'Dar es Salaam',
                state_province: 'Dar es Salaam',
                country: 'Tanzania',
                phone: user?.phone_number || '',
                email: user?.email || '',
                is_default: true,
                first_name: user?.first_name || user?.name?.split(' ')[0] || 'Customer',
                last_name: user?.last_name || user?.name?.split(' ')[1] || '',
            };

            // 2. Create Order
            const orderPayload = {
                cart_id: cartId,
                shipping_address: shippingAddress,
                delivery_details: {
                    partner_id: (params.partnerId as string) || "tunzaa_default",
                    cost: 10000
                },
                payment_details: {
                    method: 'credit_card',
                    amount: displayAmount,
                    currency: "TZS",
                    payment_gateway: "tunzaa_pay"
                },
                user_id: user?.user_id || '',
                delivery_type_id: (params.deliveryType as string) || "standard",
            };

            const order = await createOrder(orderPayload);
            
            // 3. Initiate Payment
            // Note: Currently API uses customer_msisdn for all, we pass it but backend handles card link
            const paymentRes = await initiatePayment({
                orderId: order.order_number, // Use order_number instead of UUID order_id
                data: {
                    customer_msisdn: user?.phone_number || '',
                }
            });

            if (paymentRes?.success) {
                // For card, we might need to redirect to a webview, 
                // but if we want it "working" as a demo/flow:
                if (cartId) await clearCart({ cartId });
                setSuccessModalVisible(true);
            } else {
                throw new Error("Payment failed");
            }
        } catch (error) {
            console.error(error);
            Burnt.toast({ title: "Payment Failed", message: "Could not process card. Please try mobile money.", preset: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const matched = cleaned.match(/.{1,4}/g);
        return matched ? matched.join(' ') : cleaned;
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length > 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Card Details</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.cardVisual}>
                        <View style={styles.cardChip} />
                        <Text style={styles.cardVisualNumber}>
                            {cardNumber ? formatCardNumber(cardNumber) : 'XXXX XXXX XXXX XXXX'}
                        </Text>
                        <View style={styles.cardBottom}>
                            <View>
                                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                                <Text style={styles.cardValue}>{cardName || 'YOUR NAME'}</Text>
                            </View>
                            <View>
                                <Text style={styles.cardLabel}>EXPIRES</Text>
                                <Text style={styles.cardValue}>{expiryDate || 'MM/YY'}</Text>
                            </View>
                            <Image source={require('@/assets/images/payment/visa.png')} style={styles.cardTypeIcon} />
                        </View>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Card Name</Text>
                            <Input
                                placeholder="Name on card"
                                value={cardName}
                                onChangeText={setCardName}
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Card Number</Text>
                            <Input
                                placeholder="0000 0000 0000 0000"
                                value={formatCardNumber(cardNumber)}
                                onChangeText={(t) => setCardNumber(t.replace(/\s/g, ''))}
                                keyboardType="numeric"
                                maxLength={19}
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Expiry Date</Text>
                                <Input
                                    placeholder="MM/YY"
                                    value={expiryDate}
                                    onChangeText={(t) => setExpiryDate(formatExpiry(t))}
                                    keyboardType="numeric"
                                    maxLength={5}
                                    style={styles.input}
                                />
                            </View>
                            <View style={{ width: 16 }} />
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>CVV</Text>
                                <Input
                                    placeholder="000"
                                    value={cvv}
                                    onChangeText={setCvv}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    secureTextEntry
                                    style={styles.input}
                                />
                            </View>
                        </View>

                        <View style={styles.secureBadge}>
                            <Ionicons name="lock-closed" size={14} color="#6B7280" />
                            <Text style={styles.secureText}>Your payment is secure and encrypted</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Payment</Text>
                        <Text style={styles.totalValue}>Tsh {new Intl.NumberFormat('en-US').format(displayAmount)}</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.payButton, isProcessing && styles.payButtonDisabled]} 
                        onPress={handleProcessPayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.payButtonText}>Pay Now</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <Modal visible={isSuccessModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIconCircle}>
                            <Ionicons name="checkmark" size={40} color="#FFFFFF" />
                        </View>
                        <Text style={styles.successTitle}>Payment Successful!</Text>
                        <Text style={styles.successMessage}>
                            Your card payment has been processed successfully. 
                            You can now track your order in the orders section.
                        </Text>
                        <TouchableOpacity style={styles.doneButton} onPress={() => {
                            setSuccessModalVisible(false);
                            router.push('/(buyer)/orders');
                        }}>
                            <Text style={styles.doneButtonText}>Go to Orders</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    cardVisual: {
        width: '100%',
        height: 200,
        backgroundColor: '#1F2937',
        borderRadius: 20,
        padding: 24,
        justifyContent: 'space-between',
        marginBottom: 32,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cardChip: {
        width: 45,
        height: 35,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        opacity: 0.8,
    },
    cardVisualNumber: {
        color: '#FFFFFF',
        fontSize: 22,
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginVertical: 20,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    cardLabel: {
        color: '#9CA3AF',
        fontSize: 10,
        marginBottom: 4,
    },
    cardValue: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardTypeIcon: {
        width: 50,
        height: 30,
        resizeMode: 'contain',
    },
    form: {
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 10,
    },
    secureText: {
        fontSize: 12,
        color: '#6B7280',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    payButton: {
        backgroundColor: '#425BA4',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    // Success Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        alignItems: 'center',
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#059669',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    doneButton: {
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
