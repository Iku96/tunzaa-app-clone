import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo } from 'react';
import { productsApi, Product as ApiProduct } from '../../../src/services/products';
import { useCartCombined, useAddToCart } from '../../../src/stores/cart';
import { useCheckWishlistStatus, useAddToWishlist, useRemoveFromWishlist } from '../../../src/services/wishlist';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useGetRatingSummary } from '../../../src/services/ratings';
import { recommendationsApi } from '../../../src/services/recommendations';
import ProductCardVertical from '../../../src/components/product/ProductCardVertical';
import ShareSheet from '../../../src/components/shop/ShareSheet';
import { useSearchHistory } from '../../../src/stores/searchHistory';

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isAuthenticated, user } = useTunzaaAuth();
    const [loading, setLoading] = useState(true);
    
    console.log('[ProductDetail] Render. ID:', id, 'Authenticated:', isAuthenticated);
    
    // Product interaction state
    const [activeIndex, setActiveIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [shareVisible, setShareVisible] = useState(false);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Full API product data
    const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);

    const { 
        cart: serverCart, 
        addItem,
        isAdding: isAddingToCartOptimistic
    } = useCartCombined(user?.user_id || user?.id || 'guest');
    const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productsApi.getProductById(id as string);
                setApiProduct(data);
                console.log('✅ [ProductDetail] Loaded product from API:', data.name);
                console.log('🆔 [ProductDetail] Product SKU:', data.sku);
                console.log('🖼️ [ProductDetail] Product Images:', JSON.stringify(data.images));
                console.log('🔢 [ProductDetail] Product Variants:', JSON.stringify(data.variants));
            } catch (e: any) {
                console.warn('⚠️ [ProductDetail] API failed:', e.message);
                setApiProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Derive display values from raw API data
    const product = useMemo(() => {
        if (!apiProduct) return null;
        const imageUrl = apiProduct.images?.[0]
            ? (typeof apiProduct.images[0] === 'string' ? apiProduct.images[0] : apiProduct.images[0].url)
            : 'https://via.placeholder.com/300x300?text=No+Image';
        const productImages = apiProduct.images?.length
            ? apiProduct.images.map(i => typeof i === 'string' ? i : i.url)
            : [imageUrl];

        return {
            id: apiProduct.product_id || apiProduct._id,
            name: apiProduct.name,
            price: apiProduct.base_price_raw || apiProduct.base_price || 0,
            salePrice: apiProduct.sale_price_raw || apiProduct.sale_price || null,
            image: imageUrl,
            images: productImages,
            description: apiProduct.description || '',
            shortDescription: apiProduct.short_description || '',
            sku: apiProduct.sku || '',
            tags: apiProduct.tags || [],
            inventory: apiProduct.inventory_quantity ?? 0,
            inventoryTracking: apiProduct.inventory_tracking ?? false,
            weight: apiProduct.weight || 0,
            dimensions: apiProduct.dimensions || null,
            hasVariants: apiProduct.has_variants || false,
            variants: apiProduct.variants || null,
            variantAttributes: apiProduct.variant_attributes || null,
            requiresShipping: apiProduct.requires_shipping ?? true,
            verificationStatus: apiProduct.verification_status || 'pending',
            vendor: {
                id: apiProduct.store_id || apiProduct.store?.store_id || '1',
                name: apiProduct.store?.store_name || apiProduct.store?.name || 'Vendor',
                location: apiProduct.store?.address || apiProduct.store?.city || '',
                logo: apiProduct.store?.logo_url || apiProduct.store?.logo || null,
                createdAt: apiProduct.store?.created_at || null,
            },
        };
    }, [apiProduct]);
    
    useEffect(() => {
        if (product) {
            console.log('📦 [ProductDetail] Derived Product:', JSON.stringify({
                id: product.id,
                name: product.name,
                image: product.image,
                imageCount: product.images.length
            }));
        }
    }, [product]);
    
    const { addItem: addToHistory } = useSearchHistory();

    // Save to history when product is loaded
    useEffect(() => {
        if (product) {
            addToHistory({
                id: product.id,
                name: product.name,
                avatar: product.image,
                location: product.vendor?.location || '',
                type: 'product'
            });
        }
    }, [product]);

    // Extract available sizes and colors from variant_attributes
    const sizes = useMemo(() => {
        if (!product?.variantAttributes) return [];
        const sizeAttr = product.variantAttributes.size || product.variantAttributes.Size || product.variantAttributes.sizes;
        if (Array.isArray(sizeAttr)) return sizeAttr.map(String);
        return [];
    }, [product?.variantAttributes]);

    const colors = useMemo(() => {
        if (!product?.variantAttributes) return [];
        const colorAttr = product.variantAttributes.color || product.variantAttributes.Color || product.variantAttributes.colors;
        if (Array.isArray(colorAttr)) return colorAttr.map(String);
        return [];
    }, [product?.variantAttributes]);

    // Build product specs from real data
    const specs = useMemo(() => {
        if (!product) return [];
        const entries: { label: string; value: string }[] = [];

        if (product.shortDescription) entries.push({ label: 'Summary', value: product.shortDescription });
        if (product.sku) entries.push({ label: 'SKU', value: product.sku });
        if (product.weight) entries.push({ label: 'Weight', value: `${product.weight} kg` });
        if (product.dimensions?.length && product.dimensions?.width && product.dimensions?.height) {
            entries.push({ label: 'Dimensions', value: `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height} cm` });
        }
        if (product.tags.length > 0) entries.push({ label: 'Tags', value: product.tags.join(', ') });
        if (product.inventoryTracking) entries.push({ label: 'In Stock', value: `${product.inventory} units` });
        if (!product.requiresShipping) entries.push({ label: 'Shipping', value: 'Digital / No shipping required' });

        return entries;
    }, [product]);
    // Wishlist logic
    const { data: wishlistStatus } = useCheckWishlistStatus(product?.id || '', undefined, !!product?.id);
    const { mutate: addToWishlist, isPending: isAddingToWishlist } = useAddToWishlist();
    const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();

    // Rating summary
    const { data: ratingSummary } = useGetRatingSummary(product?.id || '', !!product?.id);

    // Recommendations
    const { data: similarRes } = useQuery({
        queryKey: ['similar-products', product?.id],
        queryFn: () => recommendationsApi.getSimilarItems(product?.id || '', { count: 6 }),
        enabled: !!product?.id
    });

    const { data: boughtTogetherRes } = useQuery({
        queryKey: ['bought-together', product?.id],
        queryFn: () => recommendationsApi.getPersonalizedRecommendations(user?.user_id || 'guest', { 
            scenario: 'frequently-bought-together',
            filters: { product_id: product?.id } 
        }),
        enabled: !!product?.id
    });

    const similarProducts = similarRes?.recommendations || [];
    const boughtTogether = boughtTogetherRes?.recommendations || [];

    const isWishlisted = wishlistStatus?.is_wishlisted || false;
    const isWishlistLoading = isAddingToWishlist || isRemoving;

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
                                    <Image 
                                        source={{ uri: imgUrl }} 
                                        style={styles.image} 
                                        resizeMode="contain"
                                        onLoad={() => console.log(`🖼️ [ProductDetail] Image loaded successfully: ${imgUrl.substring(0, 50)}...`)}
                                        onError={(e) => console.error(`❌ [ProductDetail] Image load failed for ${imgUrl.substring(0, 50)}...:`, e.nativeEvent.error)}
                                    />
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
                            <View>
                                <Text style={styles.price}>
                                    Tsh. {new Intl.NumberFormat('en-US').format(product.price)}
                                </Text>
                                {product.salePrice && product.salePrice < product.price && (
                                    <Text style={styles.originalPrice}>
                                        Tsh. {new Intl.NumberFormat('en-US').format(product.salePrice)}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={toggleWishlist} disabled={isWishlistLoading}>
                                    <Ionicons
                                        name={isWishlisted ? "heart" : "heart-outline"}
                                        size={20}
                                        color={isWishlisted ? "#EF4444" : "#6B7280"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => setShareVisible(true)}>
                                    <Ionicons name="share-social-outline" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Delivery Info */}
                        {product.requiresShipping && (
                            <View style={styles.deliveryContainer}>
                                <View style={styles.deliveryRow}>
                                    <Ionicons name="location-outline" size={16} color="#4B5563" />
                                    <Text style={styles.deliveryText}>Delivery available for this item</Text>
                                </View>
                                <TouchableOpacity onPress={() => router.push('/(buyer)/profile/delivery/address')}>
                                    <Text style={styles.changeLocationText}>Set delivery location</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Two-Column Info Layout */}
                        <View style={styles.infoRow}>
                            {/* Left Column: Product Info */}
                            <View style={styles.leftInfoCol}>
                                <Text style={styles.productTitle}>{product.name}</Text>
                                {product.verificationStatus !== 'approved' && (
                                    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 }}>
                                        <Text style={{ color: '#D97706', fontSize: 12, fontWeight: 'bold' }}>Pending Approval</Text>
                                    </View>
                                )}
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={14} color="#D97706" />
                                    <Text style={styles.ratingText}>
                                        {ratingSummary?.average_rating?.toFixed(1) || '0.0'}
                                    </Text>
                                    <View style={styles.dividerPipe} />
                                    <Text style={styles.soldText}>
                                        {ratingSummary?.total_ratings || 0} {ratingSummary?.total_ratings === 1 ? 'review' : 'reviews'}
                                    </Text>
                                </View>
                                {product.inventoryTracking && (
                                    <View style={[styles.ratingContainer, { marginTop: 4 }]}>
                                        <Ionicons name="cube-outline" size={14} color={product.inventory > 0 ? '#10B981' : '#EF4444'} />
                                        <Text style={[styles.soldText, { color: product.inventory > 0 ? '#10B981' : '#EF4444' }]}>
                                            {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Right Column: Vendor Info */}
                            <TouchableOpacity
                                style={styles.rightInfoCol}
                                onPress={() => router.push({ pathname: '/(buyer)/shop/[id]', params: { id: product.vendor.id || '1' } })}
                            >
                                {product.vendor.logo ? (
                                    <Image source={{ uri: product.vendor.logo }} style={styles.vendorLogoImage} />
                                ) : (
                                    <View style={styles.vendorLogoContainer}>
                                        <Ionicons name="storefront-outline" size={18} color="white" />
                                    </View>
                                )}
                                <View style={styles.vendorDetails}>
                                    <Text style={styles.vendorName}>{product.vendor.name}</Text>
                                    {product.vendor.createdAt && (
                                        <Text style={styles.vendorSub}>
                                            Supplier since {new Date(product.vendor.createdAt).getFullYear()}
                                        </Text>
                                    )}
                                    {product.vendor.location ? (
                                        <View style={styles.vendorLocRow}>
                                            <Ionicons name="location-outline" size={10} color="#6B7280" />
                                            <Text style={styles.vendorLocText}>{product.vendor.location}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Description Section */}
                        {product.description ? (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.specsTitle}>Description</Text>
                                <Text style={styles.descriptionText}>{product.description}</Text>
                            </View>
                        ) : null}

                        {/* Specifications Section (from real data) */}
                        {specs.length > 0 && (
                            <View style={styles.specsContainer}>
                                <Text style={styles.specsTitle}>Product details</Text>
                                {specs.map((spec, idx) => (
                                    <View key={idx} style={styles.specRow}>
                                        <Text style={styles.specLabel}>{spec.label}</Text>
                                        <Text style={styles.specValue}>{spec.value}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Sizes — only shown if API provides variant sizes */}
                        {sizes.length > 0 && (
                            <View style={styles.pillsContainer}>
                                {sizes.map(size => (
                                    <TouchableOpacity 
                                        key={size}
                                        style={[styles.pill, selectedSize === size && styles.pillSelected]}
                                        onPress={() => setSelectedSize(size)}
                                    >
                                        <Text style={[styles.pillText, selectedSize === size && styles.pillTextSelected]}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Color Picker — only shown if API provides variant colors */}
                        {colors.length > 0 && (
                            <View style={styles.pickerBox}>
                                <Text style={styles.pickerLabel}>Color</Text>
                                <View style={styles.colorDots}>
                                    {colors.map(c => (
                                        <TouchableOpacity 
                                            key={c}
                                            style={[
                                                styles.colorDot, 
                                                { backgroundColor: resolveColor(c) }, 
                                                selectedColor === c && styles.colorDotSelected
                                            ]}
                                            onPress={() => setSelectedColor(c)}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Quantity Picker */}
                        <View style={styles.pickerBox}>
                            <Text style={styles.pickerLabel}>Quantity</Text>
                            <View style={styles.quantityControls}>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                                    <Ionicons name="remove" size={20} color="#4B5563" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{quantity}</Text>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                                    <Ionicons name="add" size={20} color="#425BA4" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Accordions */}
                        <View style={styles.accordionsWrapper}>
                            {/* Recommendation Section */}
                            <TouchableOpacity 
                                style={styles.accordionRow}
                                onPress={() => toggleSection('recommendation')}
                            >
                                <View style={styles.accordionTitles}>
                                    <Text style={styles.accordionTitle}>Recommendation</Text>
                                    <Text style={styles.accordionSubtitle}>Other Buyer Bought</Text>
                                </View>
                                <Ionicons 
                                    name={expandedSections['recommendation'] ? "chevron-down" : "chevron-forward"} 
                                    size={20} 
                                    color="#1F2937" 
                                />
                            </TouchableOpacity>
                            {expandedSections['recommendation'] && (
                                <View style={styles.expandedSection}>
                                    {boughtTogether.length > 0 ? (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProducts}>
                                            {boughtTogether.map((item: any) => (
                                                <TouchableOpacity 
                                                    key={item.item_id} 
                                                    style={styles.miniCard}
                                                    onPress={() => router.push(`/(buyer)/product/${item.item_id}`)}
                                                >
                                                    <Image source={{ uri: item.image_url }} style={styles.miniCardImage} />
                                                    <Text style={styles.miniCardTitle} numberOfLines={1}>{item.title}</Text>
                                                    <Text style={styles.miniCardPrice}>Tsh. {item.price?.toLocaleString() || '0'}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <Text style={styles.emptyText}>No recommendations yet</Text>
                                    )}
                                </View>
                            )}
                            
                            {/* Similar Products Section */}
                            <TouchableOpacity 
                                style={styles.accordionRow}
                                onPress={() => toggleSection('similar')}
                            >
                                <View style={styles.accordionTitles}>
                                    <Text style={styles.accordionTitle}>Similar product from other supplier</Text>
                                </View>
                                <Ionicons 
                                    name={expandedSections['similar'] ? "chevron-down" : "chevron-forward"} 
                                    size={20} 
                                    color="#1F2937" 
                                />
                            </TouchableOpacity>
                            {expandedSections['similar'] && (
                                <View style={styles.expandedSection}>
                                    {similarProducts.length > 0 ? (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProducts}>
                                            {similarProducts.map((item: any) => (
                                                <TouchableOpacity 
                                                    key={item.item_id} 
                                                    style={styles.miniCard}
                                                    onPress={() => router.push(`/(buyer)/product/${item.item_id}`)}
                                                >
                                                    <Image source={{ uri: item.image_url }} style={styles.miniCardImage} />
                                                    <Text style={styles.miniCardTitle} numberOfLines={1}>{item.title}</Text>
                                                    <Text style={styles.miniCardPrice}>Tsh. {item.price?.toLocaleString() || '0'}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <Text style={styles.emptyText}>No similar products found</Text>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity 
                                style={styles.accordionRow}
                                onPress={() => toggleSection('reviews')}
                            >
                                <View style={styles.accordionTitles}>
                                    <Text style={styles.accordionTitle}>Ratings and Reviews</Text>
                                </View>
                                <Ionicons 
                                    name={expandedSections['reviews'] ? "chevron-down" : "chevron-forward"} 
                                    size={20} 
                                    color="#1F2937" 
                                />
                            </TouchableOpacity>
                            {expandedSections['reviews'] && (
                                <View style={styles.expandedSection}>
                                    <View style={styles.reviewSummary}>
                                        <Text style={styles.bigRating}>{ratingSummary?.average_rating?.toFixed(1) || '0.0'}</Text>
                                        <View style={{ marginLeft: 12 }}>
                                            <View style={styles.starRow}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Ionicons 
                                                        key={s} 
                                                        name={s <= (ratingSummary?.average_rating || 0) ? "star" : "star-outline"} 
                                                        size={16} 
                                                        color="#D97706" 
                                                    />
                                                ))}
                                            </View>
                                            <Text style={styles.reviewCount}>{ratingSummary?.total_ratings || 0} Ratings</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.viewAllReviews}
                                        onPress={() => router.push({ 
                                            pathname: '/(buyer)/shop/product/[id]', 
                                            params: { id: id as string, storeId: product.vendor.id } 
                                        })}
                                    >
                                        <Text style={styles.viewAllText}>View All Reviews</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TouchableOpacity 
                                style={styles.accordionRow}
                                onPress={() => toggleSection('policy')}
                            >
                                <View style={styles.accordionTitles}>
                                    <Text style={styles.accordionTitle}>Return & Refund Policy</Text>
                                </View>
                                <Ionicons 
                                    name={expandedSections['policy'] ? "chevron-down" : "chevron-forward"} 
                                    size={20} 
                                    color="#1F2937" 
                                />
                            </TouchableOpacity>
                            {expandedSections['policy'] && (
                                <View style={styles.expandedSection}>
                                    <Text style={styles.policyText}>
                                        Items can be returned within 7 days of delivery if they are in original condition and packaging. 
                                        Refunds are processed within 3-5 business days after inspection.
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={{ height: 160 }} />
                    </View>
                </ScrollView>

                {/* Sticky Action Bar */}
                <View style={styles.actionBar}>
                    <View style={styles.actionBarContent}>
                        {product?.verificationStatus !== 'approved' ? (
                            <View style={{ flex: 1, backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                                <Text style={{ color: '#D97706', fontWeight: 'bold' }}>Product Pending Approval</Text>
                                <Text style={{ color: '#92400E', fontSize: 12, marginTop: 4 }}>This product cannot be purchased until approved.</Text>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[styles.cartButton, (isAddingToCartOptimistic || isAddingToCart) && styles.buttonDisabled]}
                                    onPress={async () => {
                                        console.log('🖱️ [Add to Cart] Button pressed. IsAuthenticated:', isAuthenticated);
                                        if (!isAuthenticated) {
                                            router.push('/login');
                                            return;
                                        }
                                        console.log('🛒 [Add to Cart] Server Cart state:', JSON.stringify(serverCart));
                                        await addItem({
                                            product_id: product?.id || '',
                                            quantity: quantity,
                                            sku: selectedSize ? `UK-${selectedSize}` : (product?.sku || ''),
                                            currency: 'TZS',
                                        }, selectedSize ? `UK-${selectedSize}` : (product?.sku || ''));
                                        
                                        Alert.alert('Success', 'Item added to cart!');
                                    }}
                                    disabled={isAddingToCartOptimistic || isAddingToCart}
                                >
                                    {isAddingToCartOptimistic ? (
                                        <ActivityIndicator size="small" color="#425BA4" />
                                    ) : (
                                        <Ionicons name="cart-outline" size={24} color="#425BA4" />
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.buyButton, (isAddingToCartOptimistic || isAddingToCart) && styles.buttonDisabled]}
                                    onPress={async () => {
                                        console.log('🖱️ [Buy Now] Button pressed. IsAuthenticated:', isAuthenticated);
                                        if (!isAuthenticated) {
                                            router.push('/login');
                                            return;
                                        }
                                        
                                        if (isAddingToCart) return;

                                        if (!serverCart?.cart_id) {
                                            router.push({ pathname: '/(buyer)/cart/summary', params: { productId: product?.id } });
                                            return;
                                        }

                                        try {
                                            console.log('🛒 [Buy Now] Triggering addToCart mutation...');
                                            await addToCart({
                                                cartId: serverCart.cart_id,
                                                item: {
                                                    product_id: product?.id || '',
                                                    quantity: quantity,
                                                    sku: selectedSize ? `UK-${selectedSize}` : (product?.sku || ''),
                                                    currency: 'TZS',
                                                }
                                            });
                                            router.push('/(buyer)/cart/summary');
                                        } catch (error) {
                                            console.error('Failed to add to cart:', error);
                                        }
                                    }}
                                    activeOpacity={0.9}
                                    disabled={isAddingToCartOptimistic || isAddingToCart}
                                >
                                    <Text style={styles.buyButtonText}>Buy Now</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>

            {product && (
                <ShareSheet 
                    visible={shareVisible} 
                    onClose={() => setShareVisible(false)} 
                    id={product.id}
                    type="product"
                    title={product.name}
                    image={product.image}
                />
            )}
        </SafeAreaView>
    );
}

// Color name mapping for non-hex color values from the API
const COLOR_NAME_MAP: Record<string, string> = {
    red: '#EF4444', blue: '#3B82F6', green: '#22C55E', black: '#1F2937',
    white: '#F9FAFB', yellow: '#EAB308', pink: '#EC4899', purple: '#A855F7',
    orange: '#F97316', brown: '#92400E', gray: '#6B7280', grey: '#6B7280',
    navy: '#1E3A8A', beige: '#D4C9A8', gold: '#D97706', silver: '#94A3B8',
};

const resolveColor = (c: string): string => {
    if (c.startsWith('#') || c.startsWith('rgb')) return c;
    return COLOR_NAME_MAP[c.toLowerCase()] || '#6B7280';
};

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
    originalPrice: {
        fontSize: 16,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        marginTop: -4,
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
    vendorLogoImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
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
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    actionBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cartButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buyButton: {
        flex: 1,
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
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
    descriptionContainer: {
        marginTop: 24,
    },
    descriptionText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
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
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
    },
    pill: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
    },
    pillSelected: {
        backgroundColor: '#425BA4',
    },
    pillText: {
        fontSize: 12,
        color: '#6B7280',
    },
    pillTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    pickerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 12,
        marginTop: 16,
    },
    pickerLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    colorDots: {
        flexDirection: 'row',
        gap: 8,
    },
    colorDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    colorDotSelected: {
        borderWidth: 2,
        borderColor: '#10B981', // green ring to show selected
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#425BA4',
    },
    accordionsWrapper: {
        marginTop: 24,
    },
    accordionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    accordionTitles: {
        flex: 1,
    },
    accordionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    accordionSubtitle: {
        fontSize: 12,
        color: '#425BA4',
        marginTop: 4,
    },
    expandedSection: {
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    horizontalProducts: {
        gap: 12,
        paddingBottom: 8,
    },
    miniCard: {
        width: 120,
        gap: 4,
    },
    miniCardImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    miniCardTitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1F2937',
    },
    miniCardPrice: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    emptyText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingVertical: 20,
    },
    reviewSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    bigRating: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    starRow: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewCount: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    viewAllReviews: {
        alignItems: 'center',
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 8,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#425BA4',
    },
    policyText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 20,
    },
});
