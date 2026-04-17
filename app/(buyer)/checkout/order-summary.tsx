import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartCombined } from '../../../src/stores/cart';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

const { width } = Dimensions.get('window');

export default function OrderSummaryScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const userId = user?.user_id || user?.id || '';
    const { cart, isLoading } = useCartCombined(userId);

    const cartItems = cart?.items || [];
    const subtotal = cartItems.reduce((sum, item) => sum + ((item.unit_price || item.sale_price || 0) * item.quantity), 0);
    const discount = 0;
    const deliveryFees = 10000;
    const tax = subtotal * 0.18; // 18% VAT estimation
    const totalCosts = subtotal + deliveryFees + tax - discount;

    const renderSummaryItem = (item: any) => {
        const price = item.unit_price || item.sale_price || 0;
        const name = item.product_name || 'Product';
        const image = item.image_url || 'https://via.placeholder.com/300x300?text=No+Image';

        return (
            <View key={item.item_id || item.product_id} style={styles.itemRow}>
                <Image source={{ uri: image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                    <View style={styles.nameRow}>
                        <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
                    </View>
                    <Text style={styles.itemPrice}>Tsh. {price.toLocaleString()}</Text>

                    <View style={styles.qtyRow}>
                        <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
                    </View>
                </View>
            </View>
        );
    };

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
                {isLoading ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#425BA4" />
                        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading summary...</Text>
                    </View>
                ) : (
                    <>
                        {/* Summary Items List */}
                        {cartItems.map(renderSummaryItem)}

                        <Text style={styles.orderTitle}>Order({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</Text>

                        <View style={styles.orderListContainer}>
                            {cartItems.map((item) => (
                                <View key={`list-${item.item_id || item.product_id}`} style={styles.orderListItem}>
                                    <Text style={styles.orderListLabel}>Product</Text>
                                    <Text style={styles.orderListValue} numberOfLines={1}>{(item.product_name || '').toLowerCase()}</Text>
                                </View>
                            ))}

                            <View style={styles.orderListItem}>
                                <Text style={styles.orderListLabel}>Price</Text>
                                <Text style={styles.orderListValue}>Tsh. {subtotal.toLocaleString()}</Text>
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
                    </>
                )}
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={styles.installmentButton}
                    onPress={() => router.push('/(buyer)/product/installment-plan')} // Navigate to Installment Plan
                >
                    <Text style={styles.installmentTitle}>Installment</Text>
                    <Text style={styles.installmentSubtitle}>T.cost 10,000 Tsh/wki</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.fullPaymentButton}
                    onPress={() => router.push('/(buyer)/checkout/payment-method')} // Navigate to Payment Method
                >
                    <Text style={styles.fullPaymentText}>Full Payment</Text>
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
