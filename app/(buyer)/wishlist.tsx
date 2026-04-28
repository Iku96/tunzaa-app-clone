import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetWishlist, useRemoveFromWishlist, WishlistItem } from '../../src/services/wishlist';

export default function WishlistScreen() {
    const router = useRouter();
    const { data: wishlistData, isLoading, refetch } = useGetWishlist(0, 50, true);
    const { mutate: removeFromWishlist } = useRemoveFromWishlist();

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
                            onSuccess: () => refetch(),
                            onError: () => Alert.alert("Error", "Could not remove item")
                        });
                    }
                }
            ]
        );
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

        return (
            <View style={styles.cardContainer}>
                <View style={styles.cardInfoRow}>
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: mainImage }} style={styles.productImage} />
                        <View style={styles.paginationDots}>
                            <View style={[styles.dot, styles.activeDot]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                    </View>

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

                        <View style={styles.priceControlsRow}>
                            <Text style={styles.price}>Tsh {price.toLocaleString()}</Text>
                            <View style={styles.qtyRow}>
                                <TouchableOpacity style={styles.qtyButton} onPress={() => handleRemove(item.product_id)}>
                                    <Ionicons name="remove" size={16} color="#6B7280" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>1</Text>
                                <TouchableOpacity style={[styles.qtyButton, styles.qtyButtonAdd]}>
                                    <Ionicons name="add" size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.buyNowButton} onPress={() => handleBuyNow(item)}>
                    <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
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
                    <Text style={styles.selectText}>select all items</Text>
                </View>
            )}

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#425BA4" />
                </View>
            ) : items.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="heart-dislike-outline" size={64} color="#9CA3AF" />
                    <Text style={styles.emptyText}>Your wishlist is empty</Text>
                    <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(buyer)')}>
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
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    selectText: {
        fontSize: 14,
        color: '#6B7280',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        gap: 16,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardInfoRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 16,
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
    paginationDots: {
        position: 'absolute',
        bottom: 8,
        flexDirection: 'row',
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF80',
    },
    activeDot: {
        backgroundColor: '#FFFFFF',
        width: 14,
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
    priceControlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 2,
    },
    qtyButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyButtonAdd: {
        backgroundColor: '#425BA4',
    },
    qtyText: {
        marginHorizontal: 8,
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    buyNowButton: {
        backgroundColor: '#425BA4',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buyNowText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    browseText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});
