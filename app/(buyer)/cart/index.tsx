import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../../src/components/navigation/BottomNav';
import { useCartCombined, useCartTotals } from '../../../src/stores/cart';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

const { width } = Dimensions.get('window');

export default function CartScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();

    // Remote + Optimistic Cart State
    const {
        cart,
        isLoading,
        updateCartItemQuantity,
        removeCartItemMutation
    } = useCartCombined(user?.user_id || '');

    const { data: totalsData } = useCartTotals(cart?.cart_id || '');

    const updateQuantity = (cartItem: any, increment: boolean) => {
        const currentQty = cartItem.quantity;
        const newQty = increment ? currentQty + 1 : Math.max(0, currentQty - 1);

        if (newQty === 0 && cart) {
            removeCartItemMutation.mutate({
                cartId: cart.cart_id,
                item: {
                    item_id: cartItem.item_id,
                    product_id: cartItem.product_id,
                    variant_id: cartItem.variant_id,
                    quantity: cartItem.quantity,
                    unit_price: cartItem.unit_price,
                    added_at: cartItem.added_at,
                    metadata: cartItem.metadata
                }
            });
        } else {
            updateCartItemQuantity(cartItem.product_id, cartItem.metadata?.sku, newQty);
        }
    };

    const subtotal = totalsData?.subtotal || cart?.items.reduce((sum, item) => sum + ((item.unit_price || 0) * item.quantity), 0) || 0;
    const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const renderCartItem = (item: any) => (
        <View key={item.item_id || item.product_id} style={styles.cartItem}>
            <TouchableOpacity style={styles.checkbox}>
                <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />
            </TouchableOpacity>

            <Image source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&auto=format&fit=crop&q=60' }} style={styles.itemImage} />

            <View style={styles.itemDetails}>
                <View style={styles.rowBetween}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.product_name || item.name || 'Product Item'}</Text>

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

                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text style={styles.ratingText}>4.8 (50)</Text>
                </View>

                <Text style={styles.priceText}>Tsh {item.unit_price?.toLocaleString() || 0}</Text>

                <View style={styles.deliveryRow}>
                    <Ionicons name="location-outline" size={12} color="#6B7280" />
                    <Text style={styles.deliveryText}>Estimated delivery fees: Tsh. 2,500</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.changeLocation}>Change delivery location</Text>
                </TouchableOpacity>

                <View style={styles.warrantyRow}>
                    <Ionicons name="shield-checkmark-outline" size={12} color="#6B7280" />
                    <Text style={styles.warrantyText}>1 year warranty</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shopping Cart</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <View style={styles.contentContainer}>
                {/* Select All Row */}
                <View style={styles.selectAllRow}>
                    <Text style={styles.selectAllText}>Select all items</Text>
                </View>

                <ScrollView contentContainerStyle={styles.cartList}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#4A55A2" style={{ marginTop: 40 }} />
                    ) : cart?.items?.length ? (
                        cart.items.map(renderCartItem)
                    ) : (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Ionicons name="cart-outline" size={48} color="#9CA3AF" />
                            <Text style={{ marginTop: 16, color: '#6B7280' }}>Your cart is empty</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Total Bar */}
                <View style={styles.bottomBar}>
                    <View>
                        <Text style={styles.itemCountText}>{itemCount} Item</Text>
                        <Text style={styles.subtotalText}>Subtotal: Tsh. {subtotal.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.checkoutButton}
                        onPress={() => router.push('/(buyer)/checkout/delivery/method')}
                    >
                        <Text style={styles.checkoutButtonText}>Proceed to checkout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4A55A2',
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
        paddingBottom: 100, // Space for bottom bar
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A55A2',
        flex: 1,
        marginRight: 8,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 2,
    },
    qtyButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    qtyButtonAdd: {
        backgroundColor: '#4A55A2',
    },
    qtyText: {
        marginHorizontal: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        color: '#F59E0B',
        fontWeight: '500',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
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
    changeLocation: {
        fontSize: 10,
        color: '#4A55A2',
        marginBottom: 8,
        marginLeft: 16,
    },
    warrantyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    warrantyText: {
        fontSize: 10,
        color: '#6B7280',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0, // Above bottom nav
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 80, // Adjust for BottomNav
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
