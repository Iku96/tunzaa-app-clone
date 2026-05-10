import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useCreateOrder } from '@/src/services/orders';
import { useInitiatePayment, useCheckPaymentStatus, useCreateInstallmentPlan } from '@/src/services/payments';
import { useGetBuyerProfile } from '@/src/services/buyers';
import { useClearCart } from '@/src/stores/cart';
import * as Burnt from "burnt";
import { format, addDays } from 'date-fns';

// Network details mapping
const NETWORK_DETAILS: Record<string, { name: string, icon: any }> = {
    mpesa: { name: 'M-Pesa', icon: require('@/assets/images/payment/mpesa.jpeg') },
    tigopesa: { name: 'Tigo-Pesa', icon: require('@/assets/images/payment/tigopesa.png') },
    airtel: { name: 'Airtel Money', icon: require('@/assets/images/payment/airtel.png') },
    halopesa: { name: 'Halopesa', icon: require('@/assets/images/payment/halopesa.png') },
    nmb: { name: 'NMB', icon: require('@/assets/images/placeholder.png') },
    crdb: { name: 'CRDB', icon: require('@/assets/images/placeholder.png') },
    default: { name: 'Mobile Money', icon: require('@/assets/images/placeholder.png') }
};

// Map network selections to valid API payment method enum values
const NETWORK_TO_METHOD: Record<string, string> = {
    mpesa: 'mobile_money',
    tigopesa: 'mobile_money',
    airtel: 'mobile_money',
    halopesa: 'mobile_money',
    nmb: 'bank_transfer',
    crdb: 'bank_transfer',
    card: 'credit_card',
    default: 'mobile_money'
};

// Map network selections to payment gateway identifiers
const NETWORK_TO_GATEWAY: Record<string, string> = {
    mpesa: 'mpesa',
    tigopesa: 'tigopesa',
    airtel: 'airtel',
    halopesa: 'halopesa',
    nmb: 'nmb',
    crdb: 'crdb',
    default: 'tunzaa_pay'
};

export default function EnterPhoneScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useTunzaaAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Payment Process State
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

    const selectedNetwork = (params.selectedNetwork as string) || 'default';
    const networkInfo = NETWORK_DETAILS[selectedNetwork] || NETWORK_DETAILS['default'];
    
    const displayAmount = params.amount ? Number(params.amount) : 35000;
    const paymentMethod = params.paymentMethod as string;

    // Polling Payment Status
    const { data: paymentStatus } = useCheckPaymentStatus(transactionId || '', !!transactionId);

    React.useEffect(() => {
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

            // 1. Resolve Address
            let shippingAddress = null;
            if (buyerProfile?.delivery_address) {
                const found = buyerProfile.delivery_address.find(a => a.address_id === addressId);
                if (found) {
                    shippingAddress = {
                        address_line1: found.address_line1,
                        city: 'Dar es Salaam', // Defaulting as needed or fetch from found
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

            // Fallback address if not found
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
                    cost: 10000 // default or passed
                },
                payment_details: {
                    method: NETWORK_TO_METHOD[selectedNetwork] || 'mobile_money',
                    amount: displayAmount,
                    currency: "TZS",
                    payment_gateway: NETWORK_TO_GATEWAY[selectedNetwork] || 'tunzaa_pay'
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
                    total_amount: displayAmount,
                    payment_frequency: (params.installmentFrequency as "daily" | "weekly" | "monthly" | "custom") || "daily",
                    start_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // Tomorrow in local time
                    end_date: (params.installmentTargetDate as string) || format(addDays(new Date(), 2), 'yyyy-MM-dd'),
                });
                planId = plan?.plan?.plan_id?.toString();
            }

            // 4. Initiate Payment
            const paymentRes = await initiatePayment({
                orderId: order.order_number, // Use order_number instead of UUID order_id
                data: {
                    customer_msisdn: phoneNumber.startsWith('0') ? '255' + phoneNumber.substring(1) : phoneNumber,
                    plan_id: planId
                }
            });

            if (paymentRes?.success) {
                setTransactionId(paymentRes.transactionID);
                // Keep the confirmation modal visible with the spinner while we poll
            } else {
                throw new Error("Payment initiation failed");
            }
        } catch (error) {
            console.error(error);
            Burnt.toast({
                title: "Payment Failed",
                message: "We couldn't process your payment. Please try again.",
                preset: "error",
            });
            setConfirmModalVisible(false);
            setIsProcessing(false);
        } finally {
            // We don't set isProcessing(false) here because we want to show 
            // the spinner while polling if the transaction was initiated successfully
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
                <Text style={styles.headerTitle}>Enter Phone number</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.networkBadge}>
                    <View style={styles.networkIconContainer}>
                        <Image source={networkInfo.icon} style={styles.networkIcon} />
                    </View>
                    <View>
                        <Text style={styles.networkName}>{networkInfo.name}</Text>
                        <Text style={styles.networkStatus}>Secure Mobile Payment</Text>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Enter Phone number</Text>
                    <Input
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />
                </View>

                <Text style={styles.subtext}>
                    A push notification will be sent to the phone number
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.payButton} onPress={handleMakePaymentClick}>
                    <Text style={styles.payButtonText}>Make payment</Text>
                </TouchableOpacity>
            </View>

            {/* Confirmation Modal */}
            <Modal visible={isConfirmModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModalContent}>
                        <Ionicons name="phone-portrait-outline" size={48} color="#425BA4" style={{ marginBottom: 16 }} />
                        <Text style={styles.confirmModalTitle}>
                            DO YOU WANT TO PAY TZS {new Intl.NumberFormat('en-US').format(displayAmount)} TO TUNZAA fintech?
                        </Text>
                        <Text style={styles.confirmModalSubtitle}>
                            Enter {networkInfo.name} Pin to confirm
                        </Text>
                        
                        {isProcessing ? (
                            <ActivityIndicator size="large" color="#425BA4" style={{ marginVertical: 20 }} />
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    networkBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    networkIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    networkIcon: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },
    networkName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    networkStatus: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 0, // Assuming ui/input has its own borders, customize if needed
        height: 56,
    },
    subtext: {
        fontSize: 14,
        color: '#6B7280',
    },
    footer: {
        padding: 20,
    },
    payButton: {
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confirmModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    confirmModalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    confirmModalSubtitle: {
        fontSize: 14,
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
        fontSize: 16,
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        backgroundColor: '#425BA4',
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
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
        backgroundColor: '#059669', // Green
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
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
