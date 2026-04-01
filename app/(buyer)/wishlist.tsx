import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetWishlist, useRemoveFromWishlist } from '../../src/services/wishlist';
import { WishlistItem } from '../../src/services/types/wishlist';

export default function WishlistScreen() {
    const router = useRouter();
    const { data: wishlistData, isLoading, refetch } = useGetWishlist(0, 50, true);
    const { mutate: removeFromWishlist } = useRemoveFromWishlist();

    const items = wishlistData?.items || [];
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item.product_id));
        }
    };

    const toggleSelectItem = (productId: string) => {
        if (selectedItems.includes(productId)) {
            setSelectedItems(prev => prev.filter((id: string) => id !== productId));
        } else {
            setSelectedItems(prev => [...prev, productId]);
        }
    };

    const handleRemove = (productId: string) => {
        removeFromWishlist({ productId }, {
            onSuccess: () => refetch(),
            onError: () => Alert.alert("Error", "Could not remove item")
        });
    };

    const handleBuyNow = (item: WishlistItem) => {
        if (!item.product) return;
        router.push({
            pathname: '/(buyer)/checkout/set-goal',
            params: {
                productId: item.product_id,
                amount: item.product.sale_price || item.product.base_price || 0
            }
        });
    };

    const renderItem = ({ item }: { item: WishlistItem }) => {
        const product = item.product;
        if (!product) return null;

        const mainImage = product.images?.[0] || 'https://via.placeholder.com/300';
        const price = product.sale_price || product.base_price || 0;
        const isSelected = selectedItems.includes(item.product_id);

        return (
            <View style={styles.cardContainer}>
                <View style={styles.cardInfoRow}>
                    {/* Checkbox & Image */}
                    <View style={styles.leftRow}>
                        <TouchableOpacity 
                            onPress={() => toggleSelectItem(item.product_id)}
                            style={[styles.checkbox, isSelected && styles.checkboxActive]}
                        >
                            {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                        </TouchableOpacity>
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: mainImage }} style={styles.productImage} />
                            <View style={styles.paginationDots}>
                                <View style={[styles.dot, styles.activeDot]} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                            </View>
                        </View>
                    </View>

                    {/* Details */}
                    <View style={styles.detailsWrapper}>
                        <View style={styles.titleRow}>
                            <Text style={styles.productTitle} numberOfLines={2}>{product.name}</Text>
                            <TouchableOpacity onPress={() => handleRemove(item.product_id)}>
                                <Ionicons name="heart" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={12} color="#FBBF24" />
                            <Text style={styles.ratingText}>4.5 (15)</Text>
                        </View>

                        <View style={styles.priceControlsRow}>
                            <Text style={styles.price}>Tsh {price.toLocaleString()}</Text>
                            <View style={styles.qtyRow}>
                                <TouchableOpacity style={styles.qtyBtn}>
                                    <Ionicons name="remove" size={14} color="#6B7280" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>1</Text>
                                <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnAdd]}>
                                    <Ionicons name="add" size={14} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Buy Now Full Width */}
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
                    <TouchableOpacity style={styles.selectAllRow} onPress={toggleSelectAll}>
                        <View style={[styles.checkbox, selectedItems.length === items.length && styles.checkboxActive]}>
                            {selectedItems.length === items.length && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                        </View>
                        <Text style={styles.selectText}>select all items</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#425BA4" />
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
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        flex: 1,
    },
    subHeader: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    selectAllRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selectText: {
        fontSize: 14,
        color: '#6B7280',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#425BA4',
        borderColor: '#425BA4',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 16,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardInfoRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
        alignItems: 'center',
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        position: 'relative',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    paginationDots: {
        position: 'absolute',
        bottom: 8,
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
    },
    activeDot: {
        backgroundColor: '#425BA4',
        width: 8,
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
        fontWeight: 'bold',
        color: '#1F2937',
        paddingRight: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    ratingText: {
        fontSize: 11,
        color: '#6B7280',
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
        color: '#425BA4',
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 2,
    },
    qtyBtn: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyBtnAdd: {
        backgroundColor: '#425BA4',
    },
    qtyText: {
        marginHorizontal: 8,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    buyNowButton: {
        backgroundColor: '#425BA4',
        borderRadius: 12,
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
    },
});
