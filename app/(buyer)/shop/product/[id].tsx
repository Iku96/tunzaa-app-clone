import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, FlatList, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShop } from '@/src/hooks/useShop';
import { productsApi, Product as ApiProduct } from '@/src/services/products';
import ProductCardVertical from '@/src/components/product/ProductCardVertical';
import { useGetRatingSummary, useGetEntityReviews, useCreateRating, useGetUserRating, useUpdateRating } from '@/src/services/ratings';
import { useCheckWishlistStatus, useAddToWishlist, useRemoveFromWishlist } from '@/src/services/wishlist';
import { useWishlistStore } from '@/src/stores/wishlist';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import ShareSheet from '@/src/components/shop/ShareSheet';

import { useLikesStore } from '@/src/stores/likes';

const { width } = Dimensions.get('window');

export default function ShopProductDetailScreen() {
    const { id, storeId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const scrollRef = React.useRef<ScrollView>(null);
    const reviewsSectionRef = React.useRef<View>(null);
    const { shop, products: storeProducts } = useShop(storeId as string);
    const [product, setProduct] = useState<ApiProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
    const [shareVisible, setShareVisible] = useState(false);
    const [lastTap, setLastTap] = useState<number | null>(null);
    const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [selectedScore, setSelectedScore] = useState(5);
    const [isEditing, setIsEditing] = useState(false);

    // Likes (Social)
    const likesStore = useLikesStore();
    const isLiked = likesStore.isLiked(id as string);

    // Wishlist (Private)
    const wishlistStore = useWishlistStore();
    const isWishlisted = wishlistStore.isInWishlist(id as string);
    const { mutate: addToWishlist } = useAddToWishlist();
    const { mutate: removeFromWishlist } = useRemoveFromWishlist();

    // Dynamic ratings data
    const { data: ratingSummary, refetch: refetchSummary } = useGetRatingSummary(id as string, !!id);
    const { data: reviewsData, refetch: refetchReviews } = useGetEntityReviews(id as string, { limit: 10 });
    const { data: userRating, refetch: refetchUserRating } = useGetUserRating(id as string, user?.user_id || user?.id || '', !!user);
    
    const { mutate: createComment } = useCreateRating();
    const { mutate: updateComment } = useUpdateRating();

    React.useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productsApi.getProductById(id as string);
                setProduct(data);
            } catch (e) {
                console.warn('Failed to fetch product:', e);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const displayImage = React.useMemo(() => {
        if (!product?.images || product.images.length === 0) return 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500';
        const primary = product.images.find(img => typeof img === 'object' && (img as any).is_primary) as any;
        if (primary) return primary.url;
        const first = product.images[0];
        return typeof first === 'string' ? first : (first as any).url;
    }, [product]);

    // Map store products to UIProduct shape for ProductCardVertical
    const mappedStoreProducts = React.useMemo(() => {
        return storeProducts
            .filter(p => (p._id || p.product_id) !== id) // Filter out current product
            .map(p => ({
                id: p._id || p.product_id,
                name: p.name,
                price: p.base_price,
                image: (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any)?.url) || 'https://via.placeholder.com/300',
                rating: 0, // In a real app, we might want to fetch these too
                reviews: 0,
                vendor: {
                    id: shop?.store_id || '',
                    name: shop?.store_name || '',
                    location: shop?.location?.address || '',
                    verified: true
                }
            }));
    }, [storeProducts, shop, id]);

    const bestsellers = React.useMemo(() => mappedStoreProducts.slice(0, 4), [mappedStoreProducts]);
    const newArrivals = React.useMemo(() => [...mappedStoreProducts].reverse().slice(0, 4), [mappedStoreProducts]);

    const handleToggleLike = () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to like products.');
            return;
        }
        if (isLiked) {
            likesStore.removeItem(id as string);
        } else {
            likesStore.addItem(id as string);
            // Optionally track interaction on server
        }
    };

    const handleToggleWishlist = () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to add to wishlist.');
            return;
        }
        if (isWishlisted) {
            wishlistStore.removeItem(id as string);
            removeFromWishlist({ productId: id as string });
        } else {
            const displayImage = product?.images?.[0]?.url || product?.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image';
            const newItem = {
                product_id: id as string,
                product: {
                    product_id: id as string,
                    name: product?.name || 'Product',
                    base_price: product?.base_price || 0,
                    images: [displayImage],
                }
            } as any;
            wishlistStore.addItem(newItem);
            addToWishlist({ product_id: id as string });
            Alert.alert('Saved', 'Product added to your wishlist.');
        }
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        if (lastTap && (now - lastTap) < 300) {
            if (!isLiked) handleToggleLike();
            setLastTap(null);
        } else {
            setLastTap(now);
        }
    };

    const handleComment = () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to comment.');
            return;
        }
        if (userRating) {
            setCommentText(userRating.content);
            setSelectedScore(userRating.score);
            setIsEditing(true);
        } else {
            setCommentText('');
            setSelectedScore(5);
            setIsEditing(false);
        }
        setIsCommentModalVisible(true);
    };
    const handleSubmitComment = () => {
        if (!commentText.trim()) return;

        // Manually find the active profile for avatar lookup to avoid reference errors
        const currentProfile = user?.profiles?.find((p: any) => 
            p.role.toLowerCase() === (user?.activeProfileRole || 'buyer').toLowerCase()
        ) || user?.profiles?.[0];

        // Get user avatar from various possible locations
        const userAvatar = currentProfile?.metadata?.profile_picture ||
                          user?.metadata?.profile_picture || 
                          user?.profile_picture ||
                          user?.photo_url;

        const ratingData = {
            entity_id: id as string,
            entity_type: 'product',
            user_id: user?.user_id || user?.id || '',
            score: selectedScore,
            content: commentText,
            metadata: {
                user_display_name: user?.display_name || user?.name || 'User',
                user_avatar_url: userAvatar || ""
            }
        };

        if (isEditing && userRating) {
            // Troubleshooting 500: Sending only score and content
            updateComment({
                ratingId: userRating.rating_id,
                data: {
                    entity_id: id as string,
                    entity_type: 'product',
                    user_id: user?.user_id || user?.id || '',
                    score: selectedScore,
                    content: commentText,
                    metadata: {
                        user_display_name: user?.display_name || user?.name || 'User',
                        user_avatar_url: userAvatar || ""
                    }
                }
            }, {
                onSuccess: () => {
                    refetchSummary();
                    refetchReviews();
                    refetchUserRating();
                    setIsCommentModalVisible(false);
                },
                onError: () => {
                    Alert.alert('Error', 'Failed to update comment.');
                }
            });
        } else {
            createComment(ratingData, {
                onSuccess: () => {
                    refetchSummary();
                    refetchReviews();
                    refetchUserRating();
                    setCommentText('');
                    setSelectedScore(5);
                    setIsCommentModalVisible(false);
                },
                onError: () => {
                    Alert.alert('Error', 'Failed to post comment.');
                }
            });
        }
    };

    if (isLoading || !product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B5494" />
                    <Text style={{ marginTop: 12, color: '#64748b' }}>Loading product...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Product Stories</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
                {/* Story Card Section */}
                <View style={styles.storyCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.vendorLogoContainer}>
                            <Image 
                                source={{ uri: shop?.branding?.logo_url || 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200' }} 
                                style={styles.vendorLogo} 
                            />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <View style={styles.vendorNameRow}>
                                <Text style={styles.vendorName}>{shop?.store_name || 'Store'}</Text>
                                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                            </View>
                            <Text style={styles.captionText} numberOfLines={2}>
                                {product.description || 'Check out our new collection!'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.mediaContainer} 
                        onPress={handleDoubleTap}
                        activeOpacity={1}
                    >
                        <Image source={{ uri: displayImage }} style={styles.mediaImage} />
                        <TouchableOpacity style={styles.volumeIcon}>
                            <Ionicons name="volume-mute-outline" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                        
                        <View style={styles.paginationRow}>
                            <View style={[styles.dot, styles.activeDot]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                    </TouchableOpacity>

                    {/* View Product Blue Bar */}
                    <TouchableOpacity 
                        style={styles.viewProductBar}
                        onPress={() => router.push(`/(buyer)/product/${product._id || product.product_id}`)}
                    >
                        <Text style={styles.viewProductText}>View Product</Text>
                        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Social Stats Row */}
                    <View style={styles.engagementRow}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleToggleLike}>
                            <Ionicons 
                                name={isLiked ? "heart" : "heart-outline"} 
                                size={24} 
                                color={isLiked ? "#EF4444" : "#1F2937"} 
                            />
                            <Text style={styles.actionText}>{isLiked ? 1 : 0}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleComment}>
                            <Ionicons name="chatbubble-outline" size={24} color="#1F2937" />
                            <Text style={styles.actionText}>{ratingSummary?.total_ratings || 0}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => setShareVisible(true)}>
                            <Ionicons name="paper-plane-outline" size={24} color="#1F2937" />
                            <Text style={styles.actionText}>0</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Ratings & Reviews Accordion */}
                <View 
                    style={styles.section} 
                    ref={reviewsSectionRef}
                    onLayout={() => {}} 
                >
                    <TouchableOpacity 
                        style={styles.accordionHeader}
                        onPress={() => setIsReviewsExpanded(!isReviewsExpanded)}
                    >
                        <Text style={styles.sectionTitle}>Ratings and Reviews</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ flexDirection: 'row' }}>
                                {[1,2,3,4,5].map(s => (
                                    <Ionicons 
                                        key={s} 
                                        name="star" 
                                        size={14} 
                                        color={s <= (ratingSummary?.average_rating || 0) ? "#F59E0B" : "#E5E7EB"} 
                                    />
                                ))}
                            </View>
                            <Ionicons 
                                name={isReviewsExpanded ? "chevron-up" : "chevron-down"} 
                                size={20} 
                                color="#1F2937" 
                            />
                        </View>
                    </TouchableOpacity>
                    
                    {isReviewsExpanded && (
                        <View style={styles.reviewsContent}>
                            <View style={styles.ratingSummary}>
                                <Text style={styles.bigRating}>{ratingSummary?.average_rating?.toFixed(1) || '0.0'}</Text>
                                <View style={styles.starsRow}>
                                    {[1,2,3,4,5].map(s => (
                                        <Ionicons 
                                            key={s} 
                                            name="star" 
                                            size={16} 
                                            color={s <= (ratingSummary?.average_rating || 0) ? "#F59E0B" : "#E5E7EB"} 
                                        />
                                    ))}
                                </View>
                                <Text style={{ color: '#6B7280', fontSize: 14 }}>
                                    ({ratingSummary?.total_ratings || 0} {ratingSummary?.total_ratings === 1 ? 'review' : 'reviews'})
                                </Text>
                            </View>
                            
                            {/* User's Own Review */}
                            {userRating && (
                                <View style={styles.reviewItem}>
                                    <View style={styles.reviewAvatar}>
                                        <Image 
                                            source={{ uri: (user?.metadata?.profile_picture || userRating.metadata?.user_avatar_url) || 
                                                           `https://ui-avatars.com/api/?name=${user?.display_name || 'User'}&background=EFF6FF&color=425BA4` }} 
                                            style={styles.avatarImage} 
                                        />
                                    </View>
                                    <View style={styles.reviewMain}>
                                        <View style={styles.reviewHeader}>
                                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={styles.reviewerName}>
                                                    {user?.display_name || user?.name || 'User'}
                                                </Text>
                                                {userRating.status === 'pending' && (
                                                    <View style={styles.pendingBadge}>
                                                        <Text style={styles.pendingBadgeText}>Pending Approval</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={styles.reviewDate}>Today</Text>
                                                <TouchableOpacity onPress={handleComment} style={styles.editBtn}>
                                                    <Ionicons name="create-outline" size={16} color="#4B5563" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={styles.starsRowSmall}>
                                            {[1,2,3,4,5].map(s => (
                                                <Ionicons 
                                                    key={s} 
                                                    name="star" 
                                                    size={12} 
                                                    color={s <= userRating.score ? "#F59E0B" : "#E5E7EB"} 
                                                />
                                            ))}
                                        </View>
                                        <Text style={styles.reviewText}>{userRating.content}</Text>
                                        
                                        {/* Vendor Reply Display */}
                                        {userRating.metadata?.vendor_reply && (
                                            <View style={styles.buyerVendorReplyBox}>
                                                <View style={styles.vendorReplyHeader}>
                                                    <Ionicons name="business" size={14} color="#3B5494" />
                                                    <Text style={styles.vendorReplyLabel}>Response from Seller</Text>
                                                </View>
                                                <Text style={styles.vendorReplyText}>{userRating.metadata.vendor_reply}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Real Reviews List */}
                            {((reviewsData?.items && reviewsData.items.length > 0) || userRating) ? (
                                reviewsData?.items
                                    ?.filter((r: any) => r.rating_id !== userRating?.rating_id)
                                    .map((review: any) => (
                                    <View key={review.rating_id} style={styles.reviewItem}>
                                        <View style={styles.reviewerAvatar}>
                                            <Image 
                                                source={{ uri: review.metadata?.user_avatar_url || 
                                                               `https://ui-avatars.com/api/?name=${review.metadata?.user_display_name || review.user_display_name || 'User'}&background=3B82F6&color=FFFFFF` }} 
                                                style={styles.avatarImage} 
                                            />
                                        </View>
                                        <View style={styles.reviewMain}>
                                            <View style={styles.reviewHeader}>
                                                <Text style={styles.reviewerName}>
                                                    {review.metadata?.user_display_name || review.user_display_name || 'User'}
                                                </Text>
                                                <Text style={styles.reviewDate}>
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <View style={styles.starsRowSmall}>
                                                {[1,2,3,4,5].map(s => (
                                                    <Ionicons 
                                                        key={s} 
                                                        name="star" 
                                                        size={12} 
                                                        color={s <= review.score ? "#F59E0B" : "#E5E7EB"} 
                                                    />
                                                ))}
                                            </View>
                                            <Text style={styles.reviewText}>{review.content}</Text>

                                            {/* Vendor Reply Display */}
                                            {review.metadata?.vendor_reply && (
                                                <View style={styles.buyerVendorReplyBox}>
                                                    <View style={styles.vendorReplyHeader}>
                                                        <Ionicons name="business" size={14} color="#3B5494" />
                                                        <Text style={styles.vendorReplyLabel}>Response from Seller</Text>
                                                    </View>
                                                    <Text style={styles.vendorReplyText}>{review.metadata.vendor_reply}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={{ textAlign: 'center', color: '#6B7280', paddingVertical: 20 }}>
                                    No reviews yet for this product.
                                </Text>
                            )}

                            <View style={styles.disclaimerBox}>
                                <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                                <Text style={styles.disclaimerText}>
                                    The reviews displayed here are shared by buyers based on their personal experiences
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Bestsellers Section */}
                {bestsellers.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Bestsellers from this store</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMore}>See more</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                            {bestsellers.map(item => (
                                <View key={item.id} style={styles.horizontalItem}>
                                    <ProductCardVertical product={item} />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* New Arrivals Section */}
                {newArrivals.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>New Arrivals</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMore}>See more</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                            {newArrivals.map(item => (
                                <View key={item.id} style={styles.horizontalItem}>
                                    <ProductCardVertical product={item} />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </ScrollView>

            <ShareSheet
                visible={shareVisible}
                onClose={() => setShareVisible(false)}
                id={id as string}
                type="product"
                title={product.name}
                image={displayImage}
            />

            {/* Comment Modal */}
            <Modal
                visible={isCommentModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsCommentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.commentModalContent}>
                        <View style={styles.commentModalHeader}>
                            <Text style={styles.commentModalTitle}>
                                {isEditing ? 'Edit Review' : 'Add Comment'}
                            </Text>
                            <TouchableOpacity onPress={() => setIsCommentModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalStarsRow}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <TouchableOpacity key={s} onPress={() => setSelectedScore(s)}>
                                    <Ionicons 
                                        name={s <= selectedScore ? "star" : "star-outline"} 
                                        size={32} 
                                        color={s <= selectedScore ? "#F59E0B" : "#D1D5DB"} 
                                        style={{ marginRight: 8 }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <TextInput
                            style={styles.commentInput}
                            placeholder="What do you think about this product?"
                            multiline
                            value={commentText}
                            onChangeText={setCommentText}
                            autoFocus
                        />
                        
                        <TouchableOpacity 
                            style={[styles.postCommentBtn, !commentText.trim() && styles.postCommentBtnDisabled]}
                            onPress={handleSubmitComment}
                            disabled={!commentText.trim()}
                        >
                            <Text style={styles.postCommentBtnText}>Post</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3B5494',
    },
    storyCard: {
        backgroundColor: '#FFFFFF',
    },
    cardHeader: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 16,
    },
    vendorLogoContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    vendorLogo: {
        width: '100%',
        height: '100%',
    },
    headerTextContainer: {
        flex: 1,
    },
    vendorNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    vendorName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    captionText: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
    mediaContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    mediaImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    volumeIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    paginationRow: {
        position: 'absolute',
        bottom: 16,
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
    },
    activeDot: {
        width: 16,
        backgroundColor: '#3B5494',
    },
    viewProductBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#3B5494',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    viewProductText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    engagementRow: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 24,
        gap: 24,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    section: {
        paddingVertical: 16,
        borderTopWidth: 8,
        borderTopColor: '#F8FAFC',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    seeMore: {
        fontSize: 13,
        color: '#3B5494',
        fontWeight: '500',
    },
    horizontalList: {
        paddingLeft: 20,
        paddingRight: 10,
    },
    horizontalItem: {
        width: 160,
        marginRight: 12,
    },
    bestsellerList: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    commentModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 300,
    },
    commentModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    commentModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalStarsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    commentInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1F2937',
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    postCommentBtn: {
        backgroundColor: '#1E40AF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    postCommentBtnDisabled: {
        backgroundColor: '#9CA3AF',
    },
    postCommentBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewsContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    ratingSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    buyerVendorReplyBox: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#3B5494',
    },
    vendorReplyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    vendorReplyLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3B5494',
    },
    vendorReplyText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    bigRating: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    userReviewItem: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pendingBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    pendingBadgeText: {
        fontSize: 10,
        color: '#F59E0B',
        fontWeight: 'bold',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#425BA4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    reviewMain: {
        flex: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    reviewDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    starsRowSmall: {
        flexDirection: 'row',
        gap: 1,
        marginBottom: 8,
    },
    reviewText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
    },
    disclaimerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    }
});
