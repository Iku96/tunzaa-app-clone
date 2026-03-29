import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartCombined, useCartTotals } from '../../../src/stores/cart';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useCreateOrder } from '../../../src/services/orders';

const { width } = Dimensions.get('window');

export default function OrderSummaryScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const { cart } = useCartCombined(user?.user_id || '');
    const { data: totalsData } = useCartTotals(cart?.cart_id || '');
    const createOrderMutation = useCreateOrder();

    const summaryItems = cart?.items || [];

    const subtotal = totalsData?.subtotal || summaryItems.reduce((sum, item) => sum + ((item.unit_price || 0) * item.quantity), 0);
    const discount = totalsData?.discount || 0;
    const deliveryFees = 2500; // Mock standard delivery fee
    const tax = totalsData?.tax || Math.floor(subtotal * 0.18);
    const totalCosts = subtotal - discount + deliveryFees + tax;

    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const handleCreateOrder = async (paymentType: 'full' | 'installment') => {
        if (!cart || !user) return;
        setIsCreatingOrder(true);
        try {
            const payload = {
                cart_id: cart.cart_id,
                user_id: user.user_id,
                delivery_type_id: "standard",
                shipping_address: {
                    first_name: user.first_name || "Guest",
                    last_name: user.last_name || "User",
                    phone: user.phone_number || "+255000000000",
                    email: user.email || "guest@tunzaa.com",
                    city: "Dar es Salaam",
                    country: "Tanzania",
                    address_line1: "172 Nda Mkojoma Road",
                    state_province: "Dar es Salaam",
                    is_default: true,
                    lat: "-6.7924",
                    lng: "39.2083"
                },
                delivery_details: {
                    partner_id: "dp_001",
                    cost: deliveryFees
                },
                payment_details: {
                    method: paymentType === 'full' ? 'mobile_money' : 'installment',
                    amount: totalCosts,
                    currency: "TZS",
                    payment_gateway: "tunzaa_internal"
                }
            };

            const order = await createOrderMutation.mutateAsync(payload);

            if (paymentType === 'full') {
                router.push(`/(buyer)/checkout/payment-method?order_id=${order.order_number}`);
            } else {
                router.push(`/(buyer)/product/installment-plan?order_id=${order.order_number}`);
            }
        } catch (error) {
            console.error("Order Creation Failed: ", error);
            alert("Failed to create order. Please try again.");
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const renderSummaryItem = (item: any) => (
        <View key={item.item_id || item.product_id} style={styles.itemRow}>
            <Image source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&auto=format&fit=crop&q=60' }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <View style={styles.nameRow}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.product_name || item.name}</Text>
                    {/* Optional Tag placeholder */}
                </View>
                <Text style={styles.itemPrice}>Tsh. {item.unit_price?.toLocaleString() || 0}</Text>

                <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyButton}>
                        <Ionicons name="remove" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity style={[styles.qtyButton, styles.qtyButtonAdd]}>
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Summary</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Single Card Header item per screenshot */}
                {summaryItems.length > 0 && renderSummaryItem(summaryItems[0])}

                <Text style={styles.orderTitle}>Order ({summaryItems.length} item{summaryItems.length !== 1 ? 's' : ''})</Text>

                <View style={styles.orderListContainer}>
                    {summaryItems.map((item) => (
                        <View key={item.item_id || item.product_id} style={styles.orderListItem}>
                            <Text style={styles.orderListLabel}>Product</Text>
                            <Text style={styles.orderListValue} numberOfLines={1}>{item.product_name || (item as any).name}</Text>
                        </View>
                    ))}

                    <View style={styles.orderListItem}>
                        <Text style={styles.orderListLabel}>Price</Text>
                        <Text style={styles.orderListValue}>Tsh. {subtotal.toLocaleString()}</Text>
                    </View>

                    <View style={styles.orderListItem}>
                        <Text style={styles.orderListLabel}>Quantity</Text>
                        <Text style={styles.orderListValue}>Items {summaryItems.length > 0 ? summaryItems[0].quantity : 0}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Subtotal</Text>
                    <Text style={styles.costValue}>Tsh. {subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Discount</Text>
                    <Text style={styles.costValue}>Tsh. {discount}</Text>
                </View>
                <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Delivery Fees</Text>
                    <Text style={styles.costValue}>Tsh. {deliveryFees.toLocaleString()}</Text>
                </View>
                <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Tax (18%)</Text>
                    <Text style={styles.costValue}>Tsh. {tax.toLocaleString()}</Text>
                </View>

                <View style={[styles.costRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total costs</Text>
                    <Text style={styles.totalValue}>Tsh. {totalCosts.toLocaleString()}</Text>
                </View>
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={styles.installmentButton}
                    onPress={() => handleCreateOrder('installment')}
                    disabled={isCreatingOrder}
                >
                    <Text style={styles.installmentTitle}>Installment</Text>
                    <Text style={styles.installmentSubtitle}>T.cost 10,000 Tsh/wk</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.fullPaymentButton}
                    onPress={() => handleCreateOrder('full')}
                    disabled={isCreatingOrder}
                >
                    {isCreatingOrder ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.fullPaymentText}>Full Payment</Text>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    orderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 24,
        marginBottom: 16,
    },
    orderListContainer: {
        gap: 16,
    },
    orderListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderListLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    orderListValue: {
        fontSize: 14,
        color: '#1A1A1A',
        maxWidth: '60%',
        textAlign: 'right',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
    },
    itemDetails: {
        flex: 1,
    },
    nameRow: {
        marginBottom: 4,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#425BA4',
        marginBottom: 2,
    },
    tag: {
        fontSize: 10,
        color: '#425BA4', // Blue
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        marginTop: 4,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        alignSelf: 'flex-start',
        borderRadius: 6,
        padding: 2,
    },
    qtyButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    qtyButtonAdd: {
        backgroundColor: '#425BA4',
    },
    qtyText: {
        marginHorizontal: 12,
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    deleteButton: {
        padding: 8,
        alignSelf: 'flex-end',
        marginBottom: 4,
    },
    divider: {
        height: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
        marginVertical: 16,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    costLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    costValue: {
        fontSize: 14,
        color: '#1A1A1A',
    },
    totalRow: {
        marginTop: 12,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        color: '#6B7280',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    bottomActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    installmentButton: {
        flex: 1,
        backgroundColor: '#22C55E', // Green
        paddingVertical: 10,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    installmentTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    installmentSubtitle: {
        color: '#FFFFFF',
        fontSize: 10,
    },
    fullPaymentButton: {
        flex: 1,
        backgroundColor: '#425BA4', // Blue
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullPaymentText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
