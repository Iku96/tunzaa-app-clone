import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../data/products';
import { useCheckWishlistStatus, useAddToWishlist, useRemoveFromWishlist } from '../../services/wishlist';
import { ActivityIndicator } from 'react-native';
import PriceTag from '../common/PriceTag';
import VendorBadge from '../common/VendorBadge';

interface ProductCardHorizontalProps {
    product: Product;
}

export default function ProductCardHorizontal({ product }: ProductCardHorizontalProps) {
    const router = useRouter();

    // Wishlist logic
    const { data: wishlistStatus } = useCheckWishlistStatus(product.id, undefined, !!product.id);
    const { mutate: addToWishlist, isPending: isAdding } = useAddToWishlist();
    const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();

    const isWishlisted = wishlistStatus?.is_wishlisted || false;
    const isWishlistLoading = isAdding || isRemoving;

    const handleToggleWishlist = () => {
        if (!product.id) return;
        if (isWishlisted) {
            removeFromWishlist({ productId: product.id });
        } else {
            addToWishlist({ product_id: product.id });
        }
    };

    const handlePress = () => {
        router.push(`/(buyer)/product/${product.id}`);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: product.image }} style={styles.image} />
                <TouchableOpacity style={styles.favButton} onPress={handleToggleWishlist} disabled={isWishlistLoading}>
                    {isWishlistLoading ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <Ionicons
                            name={isWishlisted ? "heart" : "heart-outline"}
                            size={18}
                            color={isWishlisted ? "#EF4444" : "#9CA3AF"}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Details Section */}
            <View style={styles.detailsContainer}>
                <View style={styles.headerRow}>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color="#FBBF24" />
                        <Text style={styles.ratingText}>{product.rating} ({product.reviews})</Text>
                    </View>
                </View>

                <Text style={styles.title} numberOfLines={2}>{product.name}</Text>

                <View style={styles.specsContainer}>
                    {product.specs?.slice(0, 2).map((spec, index) => (
                        <Text key={index} style={styles.specText}>{spec}</Text>
                    ))}
                    {product.specs && product.specs.length > 2 && <Text style={styles.specText}>...</Text>}
                </View>

                <View style={styles.vendorRow}>
                    <VendorBadge 
                        name={product.vendor.name} 
                        location={product.vendor.location} 
                        onPress={() => router.push(`/(buyer)/shop/${product.vendor.id}`)}
                    />
                </View>

                <View style={styles.priceRow}>
                    <PriceTag price={product.price} size={16} bold />
                    {product.originalPrice && (
                        <Text style={styles.originalPrice}>
                            Tsh. {new Intl.NumberFormat('en-US').format(product.originalPrice)}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        // Shadow (Flat UI - kept minimal border instead as per request, but slight elevation helps separability)
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
    },
    detailsContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '600',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 4,
        marginBottom: 4,
    },
    specsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    specText: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    vendorRow: {
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    originalPrice: {
        fontSize: 12,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
});
