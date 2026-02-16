import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../../src/components/navigation/BottomNav';

const { width } = Dimensions.get('window');

// Mock Cart Items
const INITIAL_CART = [
    {
        id: '1',
        name: 'Dinning chair',
        image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&auto=format&fit=crop&q=60',
        rating: 4.8,
        reviews: 50,
        price: 450000,
        deliveryFee: 2500,
        warranty: '1 year warranty',
        quantity: 1
    },
    {
        id: '2',
        name: 'Long Sofa',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60',
        rating: 4.8,
        reviews: 50,
        price: 650000,
        deliveryFee: 2500,
        warranty: '1 year warranty',
        quantity: 1
    },
    {
        id: '3',
        name: 'Nike Air Jordan',
        image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&auto=format&fit=crop&q=60',
        rating: 4.8,
        reviews: 50,
        price: 650000,
        deliveryFee: 2500,
        warranty: '1 year warranty',
        quantity: 1
    }
];

export default function CartScreen() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState(INITIAL_CART);

    const updateQuantity = (id: string, increment: boolean) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = increment ? item.quantity + 1 : Math.max(0, item.quantity - 1);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0)); // Remove if qty becomes 0
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const renderCartItem = (item) => (
        <View key={item.id} style={styles.cartItem}>
            {/* Checkbox Placeholder (Use Ionicons for visual only) */}
            <TouchableOpacity style={styles.checkbox}>
                <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />
            </TouchableOpacity>

            <Image source={{ uri: item.image }} style={styles.itemImage} />

            <View style={styles.itemDetails}>
                <View style={styles.rowBetween}>
                    <Text style={styles.itemName}>{item.name}</Text>

                    {/* Quantity Controls */}
                    <View style={styles.quantityControl}>
                        <TouchableOpacity onPress={() => updateQuantity(item.id, false)} style={styles.qtyButton}>
                            <Ionicons name="remove" size={16} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(item.id, true)} style={[styles.qtyButton, styles.qtyButtonAdd]}>
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
                </View>

                <Text style={styles.priceText}>Tsh {item.price.toLocaleString()}</Text>

                <View style={styles.deliveryRow}>
                    <Ionicons name="location-outline" size={12} color="#6B7280" />
                    <Text style={styles.deliveryText}>Estimated delivery fees: Tsh. {item.deliveryFee.toLocaleString()}</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.changeLocation}>Change delivery location</Text>
                </TouchableOpacity>

                <View style={styles.warrantyRow}>
                    <Ionicons name="shield-checkmark-outline" size={12} color="#6B7280" />
                    <Text style={styles.warrantyText}>{item.warranty}</Text>
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
                    {cartItems.map(renderCartItem)}
                </ScrollView>

                {/* Bottom Total Bar */}
                <View style={styles.bottomBar}>
                    <View>
                        <Text style={styles.itemCountText}>{itemCount} Item</Text>
                        <Text style={styles.subtotalText}>Subtotal: Tsh. {subtotal.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.checkoutButton}
                        onPress={() => router.push('/(buyer)/checkout/order-summary')}
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
