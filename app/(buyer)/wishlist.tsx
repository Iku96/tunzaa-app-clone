import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetWishlist, useRemoveFromWishlist, useMoveToCart } from '../../src/services/wishlist';
import { WishlistItem } from '../../src/services/types/wishlist';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useCartCombined } from '../../src/stores/cart';
import * as Burnt from 'burnt';

export default function WishlistScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const userId = user?.user_id || user?.id || '';
    const { data: wishlistData, isLoading, refetch } = useGetWishlist(0, 50, true);
    const { mutate: removeFromWishlist } = useRemoveFromWishlist();
    const { mutateAsync: moveToCart, isPending: isMoving } = useMoveToCart();
    const { addItem, cart: serverCart } = useCartCombined(userId);
    
    const [processingId, setProcessingId] = useState<string | null>(null);

    const items = wishlistData?.items || [];

    const handleRemove = (productId: string) => {
        Alert.alert(
            "Remove from Wishlist",
            "Are you sure you want to remove this item?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        removeFromWishlist({ productId }, {
                            onSuccess: () => {
                                Burnt.toast({ title: "Removed", message: "Item removed from wishlist", preset: "done" });
                                refetch();
                            },
                            onError: () => Alert.alert("Error", "Could not remove item")
                        });
                    }
                }
            ]
        );
    };

    const handleAddToCart = async (item: WishlistItem) => {
        if (!item.product) return;
        setProcessingId(item.product_id);
        try {
            await addItem({
                product_id: item.product_id,
                quantity: 1,
                ...(item.variant_sku ? { sku: item.variant_sku } : {}),
                currency: 'TZS',
            }, item.variant_sku);
            Burnt.toast({ title: "Added!", message: "Item added to cart", preset: "done" });
        } catch (err) {
            Alert.alert("Error", "Could not add item to cart. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleBuyNow = (item: WishlistItem) => {
        if (!item.product) return;
        router.push({
            pathname: '/(buyer)/product/[id]',
            params: { id: item.product_id }
        } as any);
    };

    const renderItem = ({ item }: { item: WishlistItem }) => {
        const product = item.product;
        if (!product) return null;

        const rawImage = product.images?.[0];
        const mainImage = typeof rawImage === 'string' 
            ? rawImage 
            : (rawImage?.url || 'https://via.placeholder.com/300');
            
        const price = product.base_price || 0;
        const salePrice = product.sale_price;
        const isProcessing = processingId === item.product_id;
        const inStock = product.inventory_quantity > 0;

        return (
            <View style={styles.cardContainer}>
                <View style={styles.cardInfoRow}>
                    <TouchableOpacity 
                        style={styles.imageWrapper}
                        onPress={() => handleBuyNow(item)}
                        activeOpacity={0.8}
                    >
                        <Image source={{ uri: mainImage }} style={styles.productImage} />
                        {!inStock && (
                            <View style={styles.outOfStockOverlay}>
                                <Text style={styles.outOfStockText}>Out of Stock</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.detailsWrapper}>
                        <View style={styles.titleRow}>
                            <Text style={styles.productTitle} numberOfLines={2}>{product.name}</Text>
                            <TouchableOpacity style={styles.heartButton} onPress={() => handleRemove(item.product_id)}>
                                <Ionicons name="heart" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.ratingRow}>
                            {[1, 2, 3, 4].map(i => (
                                <Ionicons key={i} name="star" size={14} color="#FBBF24" />
                            ))}
                            <Ionicons name="star-half" size={14} color="#FBBF24" />
                            <Text style={styles.ratingText}>(15)</Text>
                        </View>

                        <View style={styles.priceRow}>
                            <Text style={styles.price}>Tsh {price.toLocaleString()}</Text>
                            {salePrice && salePrice < price && (
                                <Text style={styles.salePrice}>Tsh {salePrice.toLocaleString()}</Text>
                            )}
                        </View>
                        
                        {inStock ? (
                            <Text style={styles.stockText}>In Stock ({product.inventory_quantity})</Text>
                        ) : (
                            <Text style={[styles.stockText, { color: '#EF4444' }]}>Out of Stock</Text>
                        )}
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity 
                        style={[styles.addToCartButton, (!inStock || isProcessing) && styles.disabledButton]}
                        onPress={() => handleAddToCart(item)}
                        disabled={!inStock || isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#425BA4" />
                        ) : (
                            <>
                                <Ionicons name="cart-outline" size={18} color="#425BA4" />
                                <Text style={styles.addToCartText}>Add to Cart</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.buyNowButton, !inStock && styles.disabledBuyButton]}
                        onPress={() => handleBuyNow(item)}
                        disabled={!inStock}
                    >
                        <Text style={styles.buyNowText}>Buy Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Wishlist</Text>
                <View style={{ width: 24 }} />
            </View>

            {items.length > 0 && (
                <View style={styles.subHeader}>
                    <Text style={styles.countText}>{items.length} item{items.length !== 1 ? 's' : ''} saved</Text>
                </View>
            )}

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#425BA4" />
                </View>
            ) : items.length === 0 ? (
                <View style={styles.centerContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="heart-outline" size={48} color="#9CA3AF" />
                    </View>
                    <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
                    <Text style={styles.emptySubtext}>Browse products and tap the heart icon to save items you love</Text>
                    <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(buyer)')}>
                        <Ionicons name="search-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.browseText}>Browse Products</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.wishlist_id || item.product_id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
    },
    countText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 40,
        gap: 14,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardInfoRow: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 14,
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    outOfStockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    detailsWrapper: {
        flex: 1,
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    productTitle: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: '#425BA4',
        paddingRight: 8,
    },
    heartButton: {
        padding: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 4,
    },
    ratingText: {
        fontSize: 11,
        color: '#4B5563',
        marginLeft: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    salePrice: {
        fontSize: 12,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    stockText: {
        fontSize: 11,
        color: '#10B981',
        fontWeight: '500',
        marginTop: 2,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#425BA4',
        backgroundColor: '#FFFFFF',
    },
    addToCartText: {
        color: '#425BA4',
        fontSize: 13,
        fontWeight: '600',
    },
    buyNowButton: {
        flex: 1,
        backgroundColor: '#425BA4',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledBuyButton: {
        backgroundColor: '#9CA3AF',
    },
    buyNowText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    browseButton: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    browseText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    }
});
