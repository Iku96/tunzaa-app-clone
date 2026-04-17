import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../../src/components/navigation/BottomNav';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useCartCombined } from '../../../src/stores/cart';
import { CartItem } from '../../../src/services/cart';

const { width } = Dimensions.get('window');

export default function CartScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const userId = user?.user_id || user?.id || '';
    const { cart, isLoading, updateCartItemQuantity, removeCartItemMutation } = useCartCombined(userId);

    const updateQuantity = async (item: CartItem, increment: boolean) => {
        if (!cart) return;
        const newQty = increment ? item.quantity + 1 : Math.max(0, item.quantity - 1);
        if (newQty === 0) {
            await removeCartItemMutation.mutateAsync({
                cartId: cart.cart_id,
                item: {
                    item_id: item.item_id,
                    product_id: item.product_id,
                    variant_id: item.variant_id || null,
                    quantity: item.quantity,
                    unit_price: item.unit_price || 0,
                    added_at: item.added_at,
                    metadata: item.metadata
                }
            });
        } else {
            await updateCartItemQuantity(item.product_id, item.metadata?.sku, newQty);
        }
    };

    const cartItems = cart?.items || [];
    const subtotal = cartItems.reduce((sum, item) => sum + ((item.unit_price || item.sale_price || 0) * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const renderCartItem = (item: CartItem) => {
        const price = item.unit_price || item.sale_price || 0;
        const name = item.product_name || 'Product';
        const image = item.image_url || 'https://via.placeholder.com/300x300?text=No+Image';

        return (
            <View key={item.item_id || item.product_id} style={styles.cartItem}>
                <TouchableOpacity style={styles.checkbox}>
                    <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />
                </TouchableOpacity>

                <Image source={{ uri: image }} style={styles.itemImage} />

                <View style={styles.itemDetails}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.itemName} numberOfLines={2}>{name}</Text>

                        <View style={styles.quantityControl}>
                            <TouchableOpacity onPress={() => updateQuantity(item, false)} style={styles.qtyButton}>
                                <Ionicons name="remove" size={16} color="#6B7280" />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                            <TouchableOpacity onPress={() => updateQuantity(item, true)} style={[styles.qtyButton, styles.qtyButtonAdd]}>
                                <Ionicons name="add" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.priceText}>Tsh {price.toLocaleString()}</Text>

                    <View style={styles.deliveryRow}>
                        <Ionicons name="location-outline" size={12} color="#6B7280" />
                        <Text style={styles.deliveryText}>Estimated delivery available</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shopping Cart</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <View style={styles.contentContainer}>
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#425BA4" />
                    </View>
                ) : cartItems.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
                        <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>Your cart is empty.</Text>
                        <TouchableOpacity style={{ marginTop: 24, padding: 12, backgroundColor: '#425BA4', borderRadius: 24 }} onPress={() => router.push('/(buyer)')}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.selectAllRow}>
                            <Text style={styles.selectAllText}>Select all items</Text>
                        </View>

                        <ScrollView contentContainerStyle={styles.cartList}>
                            {cartItems.map(renderCartItem)}
                        </ScrollView>

                        <View style={styles.bottomBar}>
                            <View>
                                <Text style={styles.itemCountText}>{itemCount} Item{itemCount !== 1 ? 's' : ''}</Text>
                                <Text style={styles.subtotalText}>Subtotal: Tsh. {subtotal.toLocaleString()}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.checkoutButton}
                                onPress={() => router.push('/(buyer)/checkout/delivery/method')}
                            >
                                <Text style={styles.checkoutButtonText}>Proceed to checkout</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#425BA4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    selectAllRow: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    selectAllText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    cartList: {
        padding: 20,
        paddingBottom: 100,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    checkbox: {
        marginRight: 12,
        marginTop: 4,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
    },
    itemDetails: {
        flex: 1,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#425BA4',
        flex: 1,
        marginRight: 8,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 2,
        marginLeft: 8,
    },
    qtyButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    qtyButtonAdd: {
        backgroundColor: '#425BA4',
    },
    qtyText: {
        marginHorizontal: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        marginTop: 4,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        gap: 4,
    },
    deliveryText: {
        fontSize: 10,
        color: '#6B7280',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 80,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    itemCountText: {
        fontSize: 12,
        color: '#6B7280',
    },
    subtotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    checkoutButton: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
    },
    checkoutButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
