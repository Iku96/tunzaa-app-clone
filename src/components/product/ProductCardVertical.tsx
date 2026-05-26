import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCheckWishlistStatus, useAddToWishlist, useRemoveFromWishlist } from '../../services/wishlist';
import { useWishlistStore } from '../../stores/wishlist';
import { ActivityIndicator } from 'react-native';
import VendorBadge from '../common/VendorBadge';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 2; // 20px padding * 2 + 16px gap

/** The mapped UI product shape produced by useMarketplace */
interface UIProduct {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviews: number;
    vendor?: { id: string; name: string; location: string; verified: boolean };
    specs?: string[];
    description?: string;
    category?: string;
}

interface ProductCardVerticalProps {
    product: UIProduct;
}

import { useGetRatingSummary } from '../../services/ratings';

export default function ProductCardVertical({ product }: ProductCardVerticalProps) {
    const router = useRouter();
    const { data: summary } = useGetRatingSummary(product.id, !!product.id);

    const displayRating = summary?.average_rating !== undefined ? summary.average_rating.toFixed(1) : (product.rating || '0.0');
    const displayReviews = summary?.total_ratings !== undefined ? summary.total_ratings : (product.reviews || 0);

    // Wishlist logic
    const { isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(product.id);
    const { mutate: addToWishlist, isPending: isAdding } = useAddToWishlist();
    const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();

    const isWishlistLoading = isAdding || isRemoving;

    const handleToggleWishlist = () => {
        if (!product.id) return;
        const wishlistStore = useWishlistStore.getState();
        
        if (isWishlisted) {
            // Optimistic remove
            wishlistStore.removeItem(product.id);
            removeFromWishlist({ productId: product.id });
        } else {
            // Optimistic add
            const newItem = {
                product_id: product.id,
                product: {
                    product_id: product.id,
                    name: product.name,
                    base_price: product.price,
                    images: [product.image],
                }
            } as any;
            wishlistStore.addItem(newItem);
            addToWishlist({ product_id: product.id });
        }
    };

    const handlePress = () => {
        router.push(`/(buyer)/product/${product.id}`);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: product.image || 'https://via.placeholder.com/300x300?text=No+Image' }} style={styles.image} resizeMode="contain" />

                {/* Heart Icon - Top Right */}
                <TouchableOpacity style={styles.heartButton} onPress={handleToggleWishlist} disabled={isWishlistLoading}>
                    {isWishlistLoading ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <Ionicons
                            name={isWishlisted ? "heart" : "heart-outline"}
                            size={20}
                            color={isWishlisted ? "#EF4444" : "#9CA3AF"}
                        />
                    )}
                </TouchableOpacity>

                {/* Pagination Dots - Bottom Center */}
                <View style={styles.paginationDots}>
                    <View style={[styles.dot, styles.activeDot]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.ratingText}>{displayRating} ({displayReviews})</Text>
                </View>

                <Text style={styles.title} numberOfLines={1}>{product.name}</Text>
                
                {product.vendor && (
                    <View style={styles.vendorRow}>
                        <VendorBadge 
                            name={product.vendor.name} 
                            location={product.vendor.location} 
                            showIcon={false}
                            onPress={() => router.push(`/(buyer)/shop/${product.vendor?.id}`)}
                        />
                    </View>
                )}

                <Text style={styles.price}>Tsh. {new Intl.NumberFormat('en-US').format(product.price)}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginBottom: 24,
    },
    imageContainer: {
        width: '100%',
        height: 170, // Slightly shorter to match square-ish look
        borderRadius: 24, // More rounded
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 12,
    },
    image: {
        width: '85%',
        height: '85%',
    },
    heartButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.6)', // Slightly transparent or white
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        // No shadow in screenshot, looks flat or very subtle
    },
    paginationDots: {
        position: 'absolute',
        bottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#DBEAFE', // Light blue/gray inactive
    },
    activeDot: {
        backgroundColor: '#1E3A8A', // Darker blue active
        width: 20, // Pill shape
        height: 6,
    },
    details: {
        gap: 4,
        paddingHorizontal: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    ratingText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    title: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#1F2937',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E3A8A', // Deep blue
        marginTop: 2,
    },
    vendorRow: {
        marginTop: 4,
        marginBottom: 2,
    }
});
