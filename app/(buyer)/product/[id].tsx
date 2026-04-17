import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { productsApi, Product as ApiProduct } from '../../../src/services/products';
import VendorBadge from '../../../src/components/common/VendorBadge';
import { useCheckWishlistStatus, useAddToWishlist, useRemoveFromWishlist } from '../../../src/services/wishlist';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useTunzaaAuth();
    const [loading, setLoading] = useState(true);

    // Product data - try API first, fall back to static
    const [product, setProduct] = useState<{
        id: string; name: string; price: number; image: string; images: string[];
        rating: number; vendor: { id: string; name: string; location: string };
    } | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const apiProduct = await productsApi.getProductById(id as string);
                const imageUrl = apiProduct.images?.[0]
                    ? (typeof apiProduct.images[0] === 'string' ? apiProduct.images[0] : apiProduct.images[0].url)
                    : 'https://via.placeholder.com/300x300?text=No+Image';
                const productImages = apiProduct.images?.length
                    ? apiProduct.images.map(i => typeof i === 'string' ? i : i.url)
                    : [imageUrl];

                setProduct({
                    id: apiProduct.product_id || apiProduct._id,
                    name: apiProduct.name,
                    price: apiProduct.base_price_raw || apiProduct.base_price || 0,
                    image: imageUrl,
                    images: productImages,
                    rating: 0,
                    vendor: {
                        id: apiProduct.store_id || apiProduct.store?.store_id || '1',
                        name: apiProduct.store?.store_name || 'Vendor',
                        location: '',
                    },
                });
                console.log('✅ [ProductDetail] Loaded product from API:', apiProduct.name);
            } catch (e: any) {
                console.warn('⚠️ [ProductDetail] API failed:', e.message);
                setProduct(null); // Explicitly clear any stale product
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);
    // Wishlist logic
    const { data: wishlistStatus } = useCheckWishlistStatus(product?.id || '', undefined, !!product?.id);
    const { mutate: addToWishlist, isPending: isAdding } = useAddToWishlist();
    const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();

    const isWishlisted = wishlistStatus?.is_wishlisted || false;
    const isWishlistLoading = isAdding || isRemoving;

    const toggleWishlist = () => {
        if (!product?.id) return;
        if (isWishlisted) {
            removeFromWishlist({ productId: product.id });
        } else {
            addToWishlist({ product_id: product.id });
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#425BA4" />
                    <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading product...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
                    <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 16 }}>Product not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Product</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Product Image */}
                    <View style={styles.imageContainer}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                                setActiveIndex(index);
                            }}
                        >
                            {product.images.map((imgUrl, idx) => (
                                <View key={idx} style={{ width, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={{ uri: imgUrl }} style={styles.image} resizeMode="contain" />
                                </View>
                            ))}
                        </ScrollView>

                        {/* Pagination Pill */}
                        <View style={styles.paginationPill}>
                            {product.images.map((_, idx) => (
                                <View key={idx} style={[styles.dot, idx === activeIndex && styles.activeDot]} />
                            ))}
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        {/* Price and Actions Row */}
                        <View style={styles.priceActionsRow}>
                            <Text style={styles.price}>
                                Tsh. {new Intl.NumberFormat('en-US').format(product.price)}
                            </Text>
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={toggleWishlist} disabled={isWishlistLoading}>
                                    <Ionicons
                                        name={isWishlisted ? "heart" : "heart-outline"}
                                        size={20}
                                        color={isWishlisted ? "#EF4444" : "#6B7280"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Ionicons name="share-social-outline" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Delivery Info */}
                        <View style={styles.deliveryContainer}>
                            <View style={styles.deliveryRow}>
                                <Ionicons name="location-outline" size={16} color="#4B5563" />
                                <Text style={styles.deliveryText}>Estimated delivery Fees: <Text style={{ fontWeight: 'bold' }}>Tsh. 2,500</Text></Text>
                            </View>
                            <TouchableOpacity>
                                <Text style={styles.changeLocationText}>Change delivery location</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Two-Column Info Layout */}
                        <View style={styles.infoRow}>
                            {/* Left Column: Product Info */}
                            <View style={styles.leftInfoCol}>
                                <Text style={styles.productTitle}>{product.name}</Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={14} color="#D97706" />
                                    <Text style={styles.ratingText}>{product.rating}</Text>
                                    <View style={styles.dividerPipe} />
                                    <Text style={styles.soldText}>239 units sold</Text>
                                </View>
                            </View>

                            {/* Right Column: Vendor Info */}
                            <TouchableOpacity
                                style={styles.rightInfoCol}
                                onPress={() => router.push({ pathname: '/(buyer)/shop/[id]', params: { id: product.vendor.id || '1' } })}
                            >
                                <View style={styles.vendorLogoContainer}>
                                    <Ionicons name="phone-portrait-outline" size={18} color="white" />
                                    <View style={styles.mpesaBadge}>
                                        <Text style={styles.mpesaText}>m-pesa</Text>
                                    </View>
                                </View>
                                <View style={styles.vendorDetails}>
                                    <Text style={styles.vendorName}>{product.vendor.name}</Text>
                                    <Text style={styles.vendorSub}>Supplier since 2024</Text>
                                    <View style={styles.vendorLocRow}>
                                        <Ionicons name="location-outline" size={10} color="#6B7280" />
                                        <Text style={styles.vendorLocText}>{product.vendor.location}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Specifications Section */}
                        <View style={styles.specsContainer}>
                            <Text style={styles.specsTitle}>Specification</Text>
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Screen Size</Text>
                                <Text style={styles.specValue}>39.5 Inches</Text>
                            </View>
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Brand</Text>
                                <Text style={styles.specValue}>Hisense</Text>
                            </View>
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Display Technology</Text>
                                <Text style={styles.specValue}>FHD 1080p, LED, LCD</Text>
                            </View>
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Resolution</Text>
                                <Text style={styles.specValue}>1080p</Text>
                            </View>
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Refresh Rate</Text>
                                <Text style={styles.specValue}>60 Hz</Text>
                            </View>
                        </View>

                        <View style={{ height: 120 }} />
                    </View>
                </ScrollView>

                {/* Sticky Action Bar */}
                <View style={styles.actionBar}>
                    <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => {
                            if (!isAuthenticated) {
                                import('react-native').then(rn => {
                                    rn.Alert.alert(
                                        'Account Required',
                                        'Please login or create an account to buy items.',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Login', onPress: () => router.push('/login') },
                                            { text: 'Create Account', onPress: () => router.push('/register') }
                                        ]
                                    );
                                });
                                return;
                            }
                            router.push({ pathname: '/(buyer)/cart/summary', params: { productId: product.id } });
                        }}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.buyButtonText}>Add To Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
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
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    imageContainer: {
        width: width,
        height: height * 0.65,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    image: {
        width: '90%',
        height: '100%',
    },
    paginationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // Light gray pill
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB', // Gray-300
    },
    activeDot: {
        width: 20, // Pill shaped active dot
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1F2937', // Dark blue/black
    },
    contentContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    priceActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#425BA4', // Deep Brand Blue
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        // Subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    deliveryContainer: {
        marginBottom: 24,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    deliveryText: {
        fontSize: 13,
        color: '#4B5563',
    },
    changeLocationText: {
        fontSize: 12,
        color: '#425BA4',
        fontWeight: '500',
        marginLeft: 24, // Align with text above (icon width + gap)
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    leftInfoCol: {
        flex: 1,
        paddingRight: 12,
    },
    productTitle: {
        fontSize: 16, // Screenshot shows it slightly smaller than price
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#D97706', // Gold star color
    },
    dividerPipe: {
        width: 1,
        height: 12,
        backgroundColor: '#D1D5DB',
    },
    soldText: {
        fontSize: 13,
        fontWeight: 'normal',
        color: '#D97706',
    },
    rightInfoCol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        maxWidth: '50%',
    },
    vendorLogoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DC2626', // Brand Red
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    mpesaBadge: {
        position: 'absolute',
        bottom: 0,
        right: -2,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 3,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#DC2626',
    },
    mpesaText: {
        fontSize: 6,
        color: '#DC2626',
        fontWeight: 'bold',
    },
    vendorDetails: {
        justifyContent: 'center',
    },
    vendorName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1F2937',
        textTransform: 'uppercase',
    },
    vendorSub: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 2,
    },
    vendorLocRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    vendorLocText: {
        fontSize: 10,
        color: '#4B5563',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 34, // Safe area handling
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    buyButton: {
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 30, // Rounded pill
        alignItems: 'center',
        // Shadow
        shadowColor: "#425BA4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    specsContainer: {
        marginTop: 24,
    },
    specsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    specRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    specLabel: {
        width: 140, // Fixed width to align values nicely
        fontSize: 12,
        color: '#1F2937',
        fontWeight: '500', // Slightly heavier, like mockup
    },
    specValue: {
        flex: 1,
        fontSize: 12,
        color: '#6B7280',
    },
});
