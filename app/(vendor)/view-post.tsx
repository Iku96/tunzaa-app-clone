import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, MessageCircle, Send, VolumeX, CheckCircle2 } from 'lucide-react-native';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useGetProducts } from '../../src/services/products';
import { useGetRatingSummary, useGetEntityRatings, useUpdateRating } from '../../src/services/ratings';
import { useLikesStore } from '../../src/stores/likes';
import { useSharesStore } from '../../src/stores/shares';

const { width } = Dimensions.get('window');

// Individual post component that fetches its own engagement data
function PostCard({ item, vendorName, logoUrl, isVerified, onViewInsights, onOpenComments }: {
    item: { id: string; image: string; description: string; images: any[] };
    vendorName: string;
    logoUrl: string | undefined;
    isVerified: boolean;
    onViewInsights: (postId: string) => void;
    onOpenComments: (postId: string) => void;
}) {
    const router = useRouter();
    
    // Fetch real engagement data per product
    const { data: ratingSummary } = useGetRatingSummary(item.id, !!item.id);
    const likesStore = useLikesStore();
    const sharesStore = useSharesStore();
    
    // Count likes for this product from local store
    const isLiked = likesStore.isLiked(item.id);
    // Count shares for this product from local store
    const shareCount = sharesStore.items.filter(s => s.id === item.id).length;
    
    const commentsCount = ratingSummary?.total_ratings || 0;

    const formatNumber = (num: number) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <View style={styles.postContainer}>
            {/* Post Header */}
            <View style={styles.postHeader}>
                <View style={styles.avatarContainer}>
                    {logoUrl ? (
                        <Image source={{ uri: logoUrl }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: '#EF4444' }]} />
                    )}
                </View>
                <View style={styles.postHeaderInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.vendorName}>{vendorName}</Text>
                        {isVerified && <CheckCircle2 size={16} color="#10B981" style={{ marginLeft: 4 }} />}
                    </View>
                    <Text style={styles.postCaption} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>
            </View>

            {/* Post Media */}
            <View style={styles.mediaContainer}>
                <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
                <TouchableOpacity style={styles.muteBtn}>
                    <VolumeX size={20} color="#E5E7EB" />
                </TouchableOpacity>
                {/* Pagination dots based on actual image count */}
                <View style={styles.pagination}>
                    {(item.images || [item.image]).slice(0, 4).map((_, i) => (
                        <View key={i} style={[styles.dot, i === 0 && styles.activeDot]} />
                    ))}
                </View>
            </View>

            {/* Post Actions */}
            <View style={styles.postActionsContainer}>
                <TouchableOpacity 
                    style={styles.insightsBtn}
                    onPress={() => onViewInsights(item.id)}
                >
                    <Text style={styles.insightsBtnText}>View Insights</Text>
                </TouchableOpacity>

                <View style={styles.interactionRow}>
                    <TouchableOpacity style={styles.interactionBtn}>
                        <Heart size={24} color={isLiked ? "#EF4444" : "#111827"} fill={isLiked ? "#EF4444" : "none"} />
                        <Text style={styles.interactionText}>{formatNumber(isLiked ? 1 : 0)}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.interactionBtn} onPress={() => onOpenComments(item.id)}>
                        <MessageCircle size={24} color="#111827" />
                        <Text style={styles.interactionText}>{formatNumber(commentsCount)}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.interactionBtn}>
                        <Send size={24} color="#111827" />
                        <Text style={styles.interactionText}>{formatNumber(shareCount)}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export default function ViewPostScreen() {
    const router = useRouter();
    const { postId } = useLocalSearchParams();
    const { user } = useTunzaaAuth() as any;
    
    // Vendor data
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business') || {} as any;
    const vendorId = vendorProfile?.metadata?.vendor_id || vendorProfile?.profile_id;
    const displayName = vendorProfile?.metadata?.business_name || vendorProfile?.display_name || vendorProfile?.displayName || user?.first_name || 'Vendor';
    const logoUrl = vendorProfile?.metadata?.logo_url || vendorProfile?.metadata?.image_url || vendorProfile?.branding?.logo_url;
    
    const kycMetadataStatus = vendorProfile?.metadata?.verification_status || vendorProfile?.metadata?.kyc_status;
    const isVerified = vendorProfile?.kyc?.verified === true || 
                      kycMetadataStatus === 'approved' || 
                      kycMetadataStatus === 'verified' ||
                      vendorProfile?.metadata?.is_verified === true ||
                      vendorProfile?.metadata?.is_verified === 'true';

    // Fetch products
    const { data: productsData, isLoading } = useGetProducts({ 
        vendor_id: vendorId,
        limit: 50 
    }, !!vendorId);

    const flatListRef = useRef<FlatList>(null);

    const posts = useMemo(() => (productsData?.items || []).map(p => ({
        id: p.product_id,
        image: typeof p.images?.[0] === 'string' ? p.images[0] : (p.images?.[0] as any)?.url,
        images: p.images || [],
        description: p.description || p.name,
    })).filter(p => !!p.image), [productsData]);

    // Comments Modal State
    const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);
    const [replyText, setReplyText] = React.useState('');
    const [replyingToRatingId, setReplyingToRatingId] = React.useState<string | null>(null);
    
    const { data: commentsData, refetch: refetchComments } = useGetEntityRatings(
        selectedPostId as string, 
        { limit: 50 }, 
        !!selectedPostId
    );
    const { mutate: submitReply, isPending: isSubmittingReply } = useUpdateRating();

    const handleOpenComments = (id: string) => {
        setSelectedPostId(id);
    };

    const handleCloseComments = () => {
        setSelectedPostId(null);
        setReplyingToRatingId(null);
        setReplyText('');
    };

    const handleSubmitReply = () => {
        if (!replyText.trim() || !replyingToRatingId) return;

        submitReply({
            ratingId: replyingToRatingId,
            data: {
                metadata: {
                    vendor_reply: replyText.trim(),
                    vendor_reply_at: new Date().toISOString()
                }
            }
        }, {
            onSuccess: () => {
                setReplyText('');
                setReplyingToRatingId(null);
                refetchComments();
            }
        });
    };

    // Scroll to the selected post when loaded
    useEffect(() => {
        if (!isLoading && posts.length > 0 && postId && flatListRef.current) {
            const index = posts.findIndex(p => p.id === postId);
            if (index >= 0) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index, animated: false });
                }, 100);
            }
        }
    }, [isLoading, postId, posts.length]);

    const handleViewInsights = (id: string) => {
        router.push({
            pathname: '/(vendor)/product-insight',
            params: { postId: id }
        });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const renderPost = ({ item }: { item: typeof posts[0] }) => (
        <PostCard 
            item={item}
            vendorName={displayName}
            logoUrl={logoUrl}
            isVerified={isVerified}
            onViewInsights={handleViewInsights}
            onOpenComments={handleOpenComments}
        />
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                {renderHeader()}
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
            <FlatList
                ref={flatListRef}
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPost}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                getItemLayout={(data, index) => (
                    {length: 650, offset: 650 * index, index}
                )}
                onScrollToIndexFailed={(info) => {
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    }, 500);
                }}
            />

            {/* Comments Modal */}
            {selectedPostId && (
                <View style={StyleSheet.absoluteFill}>
                    <TouchableOpacity 
                        style={styles.modalOverlay} 
                        activeOpacity={1} 
                        onPress={handleCloseComments}
                    />
                    <View style={styles.commentsSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Comments</Text>
                        
                        <FlatList
                            data={(commentsData?.items || []).filter(item => item.content && item.content.trim() !== '')}
                            keyExtractor={item => item.rating_id}
                            renderItem={({ item }) => (
                                <View style={styles.commentItem}>
                                    <View style={styles.commentHeader}>
                                        <View style={styles.commentAvatar}>
                                            <Image 
                                                source={{ 
                                                    uri: (item.metadata?.user_avatar_url && item.metadata.user_avatar_url.startsWith('http')) 
                                                        ? item.metadata.user_avatar_url 
                                                        : `https://ui-avatars.com/api/?name=${item.metadata?.user_display_name || (item as any).user_display_name || 'User'}&background=3B82F6&color=FFFFFF` 
                                                }} 
                                                style={styles.avatarImage} 
                                            />
                                        </View>
                                        <View style={styles.commentInfo}>
                                            <Text style={styles.commenterName}>
                                                {item.metadata?.user_display_name || (item as any).user_display_name || 'Buyer'}
                                            </Text>
                                            <Text style={styles.commentDate}>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.commentContent}>{item.content}</Text>
                                    
                                    {/* Vendor Reply Display */}
                                    {item.metadata?.vendor_reply ? (
                                        <View style={styles.vendorReplyBox}>
                                            <Text style={styles.vendorReplyLabel}>Your Response:</Text>
                                            <Text style={styles.vendorReplyText}>{item.metadata.vendor_reply}</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity 
                                            style={styles.replyButton}
                                            onPress={() => setReplyingToRatingId(item.rating_id)}
                                        >
                                            <Text style={styles.replyButtonText}>Reply</Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* Reply Input Box */}
                                    {replyingToRatingId === item.rating_id && (
                                        <View style={styles.replyInputBox}>
                                            <React.Fragment>
                                                <TextInput
                                                    style={styles.replyInput}
                                                    placeholder="Write your response..."
                                                    value={replyText}
                                                    onChangeText={setReplyText}
                                                    autoFocus
                                                />
                                                <View style={styles.replyActions}>
                                                    <TouchableOpacity onPress={() => setReplyingToRatingId(null)}>
                                                        <Text style={styles.cancelReplyText}>Cancel</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity 
                                                        style={[styles.submitReplyBtn, !replyText.trim() && { opacity: 0.5 }]}
                                                        onPress={handleSubmitReply}
                                                        disabled={!replyText.trim() || isSubmittingReply}
                                                    >
                                                        <Text style={styles.submitReplyText}>
                                                            {isSubmittingReply ? 'Sending...' : 'Send'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </React.Fragment>
                                        </View>
                                    )}
                                </View>
                            )}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyCommentsText}>No comments yet.</Text>
                            )}
                            contentContainerStyle={styles.commentsListContent}
                        />
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 40,
    },
    postContainer: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 24,
    },
    postHeader: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 20,
        marginBottom: 16,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    postHeaderInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    vendorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    postCaption: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    mediaContainer: {
        width: width,
        height: width,
        position: 'relative',
        backgroundColor: '#F9FAFB',
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    muteBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
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
        backgroundColor: '#4B5563',
    },
    postActionsContainer: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    insightsBtn: {
        marginBottom: 20,
    },
    insightsBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    interactionRow: {
        flexDirection: 'row',
        gap: 24,
    },
    interactionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    interactionText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    commentsSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    commentsListContent: {
        paddingBottom: 40,
    },
    commentItem: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        marginRight: 10,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    commentInfo: {
        flex: 1,
    },
    commenterName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    commentDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    commentContent: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 8,
    },
    replyButton: {
        alignSelf: 'flex-start',
    },
    replyButtonText: {
        fontSize: 13,
        color: '#3B5494',
        fontWeight: '600',
    },
    vendorReplyBox: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    vendorReplyLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3B5494',
        marginBottom: 4,
    },
    vendorReplyText: {
        fontSize: 14,
        color: '#374151',
    },
    replyInputBox: {
        marginTop: 12,
    },
    replyInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 8,
    },
    replyActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 16,
    },
    cancelReplyText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    submitReplyBtn: {
        backgroundColor: '#3B5494',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    submitReplyText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyCommentsText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 40,
    },
});
