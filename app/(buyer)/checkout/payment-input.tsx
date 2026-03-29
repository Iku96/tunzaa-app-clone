import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../../src/services/products';
import { mapApiProductToUI } from '../../../src/hooks/useMarketplace';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useCartCombined } from '../../../src/stores/cart';
import { useCreateOrder, usePayOrder } from '../../../src/services/orders';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

// Mock Selected Method (In real app, pass via params or context)
const SELECTED_METHOD = {
    id: 'mpesa',
    name: 'M-Pesa',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png',
};

export default function PaymentInputScreen() {
    const router = useRouter();
    const { productId, amount: paramAmount, order_id } = useLocalSearchParams();
    const { user } = useTunzaaAuth();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: apiProduct, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productsApi.getProductById(productId as string),
        enabled: !!productId,
    });

    const product = apiProduct ? mapApiProductToUI(apiProduct) : null;
    const amount = paramAmount ? new Intl.NumberFormat('en-US').format(Number(paramAmount)) : '125,000'; // Default mock amount if none passed

    // Hooks for checkout
    const { buyNow } = useCartCombined(user?.user_id || '');
    const { mutateAsync: createOrder } = useCreateOrder();
    const { mutateAsync: payOrder } = usePayOrder();

    const handlePayment = async () => {
        if (!user) {
            alert("Missing user details.");
            return;
        }

        if (!phoneNumber) {
            alert("Please enter your M-Pesa phone number.");
            return;
        }

        setIsProcessing(true);
        try {
            if (order_id) {
                // Paying for an existing order (e.g. Installment first payment)
                await payOrder({
                    orderNumber: order_id as string,
                    data: {
                        customer_msisdn: phoneNumber.replace('+', ''),
                        plan_id: 'installment'
                    }
                });
                router.replace(`/(buyer)/order/${order_id}`);
            } else {
                // "Buy Now" Direct Flow
                if (!product) throw new Error("Product data missing");

                const cartData = await buyNow({
                    product_id: product.id,
                    quantity: 1,
                    sku: 'default',
                });

                if (!cartData) throw new Error("Failed to create cart");

                await createOrder({
                    cart_id: cartData.cart_id,
                    shipping_address: {
                        first_name: user?.first_name || 'User',
                        last_name: user?.last_name || '',
                        address_line1: 'Tunzaa Delivery Address',
                        city: 'Dar es salaam',
                        state_province: 'Dar es salaam',
                        country: 'Tanzania',
                        phone: phoneNumber,
                        email: user?.email || '',
                        is_default: true,
                    },
                    delivery_details: {
                        partner_id: 'default_partner', cost: 10000,
                    },
                    payment_details: {
                        method: 'mobile_money', amount: product.price, currency: 'TZS', payment_gateway: 'mpesa',
                    },
                    user_id: user.user_id,
                    delivery_type_id: 'standard',
                });

                alert('Order Created Successfully!');
                router.replace('/(buyer)');
            }
        } catch (error) {
            console.error("Payment Failed:", error);
            alert("Failed to process payment. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select your preferred payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>

                {/* Method Card */}
                <View style={styles.methodCard}>
                    <Image source={{ uri: SELECTED_METHOD.image }} style={styles.methodImage} resizeMode="contain" />
                    <Text style={styles.methodName}>{SELECTED_METHOD.name}</Text>
                </View>

                <Text style={styles.infoText}>
                    You are about to pay <Text style={styles.boldText}>Tsh {amount}</Text> on Tunzaa for the purchase of a <Text style={styles.boldText}>{isLoading ? '...' : (product?.name || 'Nike Air Jordan Series 3')}</Text>.
                </Text>

                <Text style={styles.label}>Phone</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.countryCode}>+255</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Phone number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity style={[styles.payButton, isProcessing && { opacity: 0.7 }]} onPress={handlePayment} disabled={isProcessing}>
                    {isProcessing ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.payButtonText}>Make a Payment</Text>
                    )}
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
        paddingTop: 10,
        marginBottom: 30,
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
        paddingHorizontal: 24,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    methodImage: {
        width: 40,
        height: 40,
        marginRight: 16,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
        marginBottom: 32,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 32,
    },
    countryCode: {
        fontSize: 16,
        color: '#374151',
        marginRight: 12,
        fontWeight: '500',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    payButton: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
