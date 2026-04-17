import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateOrder } from '../../../src/services/orders';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useCartCombined } from '../../../src/stores/cart';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

const PAYMENT_METHODS = [
    {
        id: 'card',
        name: 'Card Payment',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png', // Generic/Mastercard
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
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Halopesa_logo.png', // Placeholder or valid URL
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
        image: 'https://via.placeholder.com/40x40?text=Mix', // Placeholder
        type: 'other'
    }
];

export default function PaymentMethodScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');

    const { user } = useTunzaaAuth();
    const userId = user?.user_id || user?.id || '';
    const { cart } = useCartCombined(userId);
    const createOrderMutation = useCreateOrder();
    const [isLoading, setIsLoading] = useState(false);

    const handleSelect = (method: typeof PAYMENT_METHODS[0]) => {
        if (selectedId === method.id) {
            setSelectedId(null); // Toggle collapse
        } else {
            setSelectedId(method.id);
        }
    };

    const handleMakePayment = async () => {
        if (!phoneNumber) {
            alert("Please enter a phone number");
            return;
        }

        if (!cart?.cart_id) {
            alert("Cart is empty or not loaded");
            return;
        }

        try {
            setIsLoading(true);
            const subtotal = cart.items.reduce((sum, item) => sum + ((item.unit_price || item.sale_price || 0) * item.quantity), 0);
            const total = subtotal + 10000 + (subtotal * 0.18); // Delivery + tax

            const result = await createOrderMutation.mutateAsync({
                cart_id: cart.cart_id,
                shipping_address: {
                    first_name: user?.name || 'Buyer',
                    last_name: 'Name',
                    address_line1: '123 Delivery Street',
                    city: 'Dar es Salaam',
                    state_province: 'Dar',
                    country: 'TZ',
                    phone: phoneNumber,
                    email: user?.email || '',
                    is_default: true,
                },
                delivery_details: {
                    partner_id: 'mock-partner', // Static mockup until courier tracking is implemented
                    cost: 10000, 
                },
                payment_details: {
                    method: selectedId || 'mobile_money',
                    amount: total,
                    currency: 'TZS',
                    payment_gateway: 'selcom',
                },
                user_id: userId,
                delivery_type_id: 'standard',
           });
           alert("Order placed successfully!");
           router.push('/(buyer)/orders/'); // Route to tracking dashboard
        } catch (e: any) {
            alert("Checkout failed: " + e.message);
        } finally {
            setIsLoading(false);
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
                                            You are about to pay Tsh 35,000 on Tunzaa for the purchase of a Smart Watch Series 5.
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

                                        <TouchableOpacity style={[styles.makePaymentButton, isLoading && { opacity: 0.7 }]} onPress={handleMakePayment} disabled={isLoading}>
                                            {isLoading ? (
                                                <ActivityIndicator color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.makePaymentButtonText}>Make a Payment</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
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
        fontWeight: 'bold', // Semi-bold looks better
        color: '#1F2937',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    methodsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden', // Ensures first/last children stay inside rounded corners
    },
    methodWrapper: {
        // Wrapper contains both the clickable row and expanded content
    },
    methodDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
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
        backgroundColor: '#F9FAFB',
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
        color: '#1F2937', // Optional: could be theme blue if needed
        fontWeight: '600',
    },
    expandedContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    expandedDescText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600', // Semi-bold for label
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
    },
    countryCodeBox: {
        backgroundColor: '#F9FAFB',
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
        backgroundColor: '#425BA4', // Theme blue
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    makePaymentButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
