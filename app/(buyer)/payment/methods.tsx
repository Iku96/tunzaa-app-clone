import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Image, Modal, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useCreateOrder } from '@/src/services/orders';
import { useInitiatePayment, useCheckPaymentStatus, useCreateInstallmentPlan } from '@/src/services/payments';
import { useGetBuyerProfile } from '@/src/services/buyers';
import { useClearCart, useCartCombined } from '@/src/stores/cart';
import * as Burnt from "burnt";
import { format, addDays } from 'date-fns';

const PAYMENT_METHODS = [
    { id: 'card', name: 'Card Payment', type: 'card', icon: require('@/assets/images/payment/visa.png') }, 
    { id: 'mpesa', name: 'M-Pesa', type: 'mobile', icon: require('@/assets/images/payment/mpesa.jpeg') },
    { id: 'airtel', name: 'Airtel Money', type: 'mobile', icon: require('@/assets/images/payment/airtel.png') },
    { id: 'halopesa', name: 'Halopesa', type: 'mobile', icon: require('@/assets/images/payment/halopesa.png') },
    { id: 'tpesa', name: 'T-Pesa', type: 'mobile', icon: require('@/assets/images/payment/tpesa.png') },
    { id: 'mixpesa', name: 'Mix by Pesa', type: 'mobile', icon: require('@/assets/images/payment/mixpesa.png') },
];

const NETWORK_TO_METHOD: Record<string, string> = {
    mpesa: 'mobile_money',
    airtel: 'mobile_money',
    halopesa: 'mobile_money',
    tpesa: 'mobile_money',
    mixpesa: 'mobile_money',
    card: 'credit_card',
    default: 'mobile_money'
};

const NETWORK_TO_GATEWAY: Record<string, string> = {
    mpesa: 'mpesa',
    airtel: 'airtel',
    halopesa: 'halopesa',
    tpesa: 'tpesa',
    mixpesa: 'mixpesa',
    default: 'tunzaa_pay'
};

export default function PaymentMethodsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useTunzaaAuth();

    const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Payment Process States
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // API Hooks
    const { mutateAsync: createOrder } = useCreateOrder();
    const { mutateAsync: initiatePayment } = useInitiatePayment();
    const { data: buyerProfile } = useGetBuyerProfile(user?.user_id || '');
    const { mutateAsync: clearCart } = useClearCart();
    const { mutateAsync: createInstallmentPlan } = useCreateInstallmentPlan();

    const { cart } = useCartCombined(user?.user_id || user?.id || '');
    const primaryItemName = cart?.items?.[0]?.product_name || params.productName || 'Smart Watch Series 5';

    const paymentMethod = params.paymentMethod as string;
    const isInstallment = paymentMethod === 'tunzaa_instalments';
    const totalOrderAmount = params.amount ? Number(params.amount) : 35000;
    const displayAmount = isInstallment && params.installmentPerPayment ? Number(params.installmentPerPayment) : totalOrderAmount;

    // Polling Payment Status
    const { data: paymentStatus } = useCheckPaymentStatus(transactionId || '', !!transactionId);

    useEffect(() => {
        if (paymentStatus) {
            if (paymentStatus.data.status === 'COMPLETED') {
                const cartId = params.cartId as string;
                if (cartId) {
                    clearCart({ cartId }).catch(console.error);
                }
                setConfirmModalVisible(false);
                setSuccessModalVisible(true);
            } else if (paymentStatus.data.status === 'FAILED') {
                setConfirmModalVisible(false);
                setTransactionId(null);
                setIsProcessing(false);
                Burnt.toast({
                    title: "Payment Failed",
                    message: "The payment was cancelled or failed. Please try again.",
                    preset: "error",
                });
            }
        }
    }, [paymentStatus]);

    const handleSelectMethod = (methodId: string) => {
        if (methodId === 'card') {
            router.push({
                pathname: '/(buyer)/payment/card',
                params: { ...params }
            });
            return;
        }

        // Expand inline accordion
        if (expandedMethod === methodId) {
            setExpandedMethod(null);
        } else {
            setExpandedMethod(methodId);
        }
    };

    const handleMakePaymentClick = () => {
        if (!phoneNumber || phoneNumber.length < 9) {
            Burnt.toast({
                title: "Invalid Phone",
                message: "Please enter a valid phone number",
                preset: "error",
            });
            return;
        }
        setConfirmModalVisible(true);
    };

    const processPayment = async () => {
        setIsProcessing(true);
        try {
            const addressId = params.addressId as string;
            const cartId = params.cartId as string;
            const methodId = expandedMethod || 'default';

            // 1. Resolve Address
            let shippingAddress = null;
            if (buyerProfile?.delivery_address) {
                const found = buyerProfile.delivery_address.find(a => a.address_id === addressId);
                if (found) {
                    shippingAddress = {
                        address_line1: found.address_line1,
                        city: 'Dar es Salaam',
                        state_province: 'Dar es Salaam',
                        country: 'Tanzania',
                        phone: user?.phone_number || '',
                        email: user?.email || '',
                        is_default: true,
                        first_name: user?.first_name || user?.name?.split(' ')[0] || '',
                        last_name: user?.last_name || user?.name?.split(' ')[1] || '',
                    };
                }
            }

            if (!shippingAddress) {
                shippingAddress = {
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
            }

            // 2. Create Order
            const orderPayload = {
                cart_id: cartId,
                shipping_address: shippingAddress,
                delivery_details: {
                    partner_id: (params.partnerId as string) || "tunzaa_default",
                    cost: 10000
                },
                payment_details: {
                    method: NETWORK_TO_METHOD[methodId] || 'mobile_money',
                    amount: totalOrderAmount,
                    currency: "TZS",
                    payment_gateway: NETWORK_TO_GATEWAY[methodId] || 'tunzaa_pay'
                },
                user_id: user?.user_id || '',
                delivery_type_id: (params.deliveryType as string) || "standard",
            };

            const order = await createOrder(orderPayload);
            
            // 3. Create Installment Plan (if applicable)
            let planId;
            if (paymentMethod === 'tunzaa_instalments') {
                const plan = await createInstallmentPlan({
                    customer: {
                        first_name: user?.first_name || user?.name?.split(' ')[0] || 'Customer',
                        last_name: user?.last_name || user?.name?.split(' ')[1] || '',
                        phone: user?.phone_number || '',
                        address: shippingAddress.address_line1 || 'Tanzania',
                    },
                    name: `Installment for Order ${order.order_number}`,
                    description: `Payment for order ${order.order_number}`,
                    total_amount: totalOrderAmount,
                    payment_frequency: (params.installmentFrequency as "daily" | "weekly" | "monthly" | "custom") || "daily",
                    start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
                    end_date: (params.installmentTargetDate as string) || format(addDays(new Date(), 2), 'yyyy-MM-dd'),
                    ...(params.installmentFrequency === 'custom' && params.installmentCustomInterval 
                        ? { custom_interval: Number(params.installmentCustomInterval) } 
                        : {})
                });
                planId = plan?.plan?.plan_id?.toString();
            }

            // 4. Initiate Payment
            const paymentRes = await initiatePayment({
                orderId: order.order_number,
                data: {
                    customer_msisdn: phoneNumber.startsWith('0') ? '255' + phoneNumber.substring(1) : phoneNumber,
                    plan_id: planId
                }
            });

            if (paymentRes?.success) {
                setTransactionId(paymentRes.transactionID);
            } else {
                throw new Error("Payment initiation failed");
            }
        } catch (error: any) {
            console.error(error);
            const errorMessage = error?.response?.data?.detail?.non_field_errors?.[0] 
                || error?.response?.data?.detail 
                || error?.message 
                || "We couldn't process your payment. Please try again.";
            
            setConfirmModalVisible(false);
            setIsProcessing(false);
            
            setTimeout(() => {
                Burnt.toast({
                    title: "Payment Failed",
                    message: typeof errorMessage === 'string' ? errorMessage : "Payment failed. Please try again.",
                    preset: "error",
                });
            }, 500);
        }
    };

    const handleSuccessDone = () => {
        setSuccessModalVisible(false);
        router.push('/(buyer)/orders');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select your preferred payment</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.methodsBorderContainer}>
                    {PAYMENT_METHODS.map((method, index) => {
                        const isExpanded = expandedMethod === method.id;
                        const isLast = index === PAYMENT_METHODS.length - 1;
                        return (
                            <View key={method.id} style={[styles.methodItemWrapper, !isLast && styles.methodItemSeparator]}>
                                <TouchableOpacity
                                    style={styles.methodRow}
                                    onPress={() => handleSelectMethod(method.id)}
                                >
                                    <View style={styles.methodLeft}>
                                        <View style={styles.iconContainer}>
                                            <Image source={method.icon} style={styles.methodIcon} />
                                        </View>
                                        <Text style={styles.methodName}>{method.name}</Text>
                                    </View>
                                    {method.type === 'card' ? (
                                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                    ) : (
                                        <Ionicons name={isExpanded ? "chevron-down" : "chevron-forward"} size={20} color="#9CA3AF" />
                                    )}
                                </TouchableOpacity>

                                {/* Accordion expanded content */}
                                {isExpanded && method.type === 'mobile' && (
                                    <View style={styles.expandedContent}>
                                        <Text style={styles.promptText}>
                                            You are about to pay TZS {new Intl.NumberFormat('en-US').format(displayAmount)} on Tunzaa for the purchase of a {primaryItemName}.
                                        </Text>

                                        <Text style={styles.inputLabel}>Phone</Text>
                                        <View style={styles.phoneInputContainer}>
                                            <View style={styles.countryCodeBox}>
                                                <Text style={styles.countryCodeText}>+255</Text>
                                            </View>
                                            <TextInput
                                                placeholder="Enter Phone number"
                                                placeholderTextColor="#9CA3AF"
                                                value={phoneNumber}
                                                onChangeText={setPhoneNumber}
                                                keyboardType="phone-pad"
                                                style={styles.textInput}
                                            />
                                        </View>

                                        <TouchableOpacity style={styles.makePaymentBtn} onPress={handleMakePaymentClick}>
                                            <Text style={styles.makePaymentBtnText}>Make a Payment</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal visible={isConfirmModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModalContent}>
                        <Ionicons name="phone-portrait-outline" size={48} color="#3B5191" style={{ marginBottom: 16 }} />
                        <Text style={styles.confirmModalTitle}>
                            DO YOU WANT TO PAY TZS {new Intl.NumberFormat('en-US').format(displayAmount)} TO TUNZAA fintech?
                        </Text>
                        <Text style={styles.confirmModalSubtitle}>
                            Enter PIN on your phone to confirm the transaction
                        </Text>
                        
                        {isProcessing ? (
                            <ActivityIndicator size="large" color="#3B5191" style={{ marginVertical: 20 }} />
                        ) : (
                            <View style={styles.confirmModalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmModalVisible(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.confirmBtn} onPress={processPayment}>
                                    <Text style={styles.confirmBtnText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal visible={isSuccessModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIconCircle}>
                            <Ionicons name="checkmark" size={40} color="#FFFFFF" />
                        </View>
                        <Text style={styles.successTitle}>Congratulations {user?.first_name || user?.name?.split(' ')[0]}!</Text>
                        <Text style={styles.successMessage}>
                            You've successfully completed the first payment towards your goal! 
                            Keep up the great work. We've sent a detailed receipt to your email 
                            address for your records.
                        </Text>
                        <TouchableOpacity style={styles.doneButton} onPress={handleSuccessDone}>
                            <Text style={styles.doneButtonText}>Done</Text>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 24,
    },
    methodsBorderContainer: {
        borderWidth: 1,
        borderColor: '#3B5191',
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    methodItemWrapper: {
        backgroundColor: '#FFFFFF',
    },
    methodItemSeparator: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 16,
    },
    methodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    methodIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    methodName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    expandedContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 4,
        backgroundColor: '#FAFBFD',
    },
    promptText: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        height: 54,
        overflow: 'hidden',
        marginBottom: 16,
    },
    countryCodeBox: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        height: '100%',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    countryCodeText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#4B5563',
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 16,
        fontSize: 17,
        color: '#1F2937',
        height: '100%',
    },
    makePaymentBtn: {
        backgroundColor: '#3B5191',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    makePaymentBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    confirmModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    confirmModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    confirmModalSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    confirmModalActions: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#4B5563',
        fontWeight: 'bold',
        fontSize: 18,
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        backgroundColor: '#3B5191',
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    doneButton: {
        backgroundColor: '#3B5191',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

