import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo, useEffect } from 'react';
import { useShop } from '../../../src/hooks/useShop';
import { mapApiProductToUI } from '../../../src/hooks/useMarketplace';
import ProductCardVertical from '../../../src/components/product/ProductCardVertical';
import CertificateModal from '../../../src/components/shop/CertificateModal';
import BusinessMenuSheet from '../../../src/components/shop/BusinessMenuSheet';
import ShareSheet from '../../../src/components/shop/ShareSheet';
import ContactSheet from '../../../src/components/shop/ContactSheet';
import { useWishlistStore } from '../../../src/stores/wishlist';
import { useAddToWishlist, useRemoveFromWishlist } from '../../../src/services/wishlist';
import { useSearchHistory } from '../../../src/stores/searchHistory';

const { width } = Dimensions.get('window');

export default function ShopProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { shop, products, loading, error } = useShop(id as string);
    
    const [activeTab, setActiveTab] = useState<'GRID' | 'STORIES'>('GRID');
    const [certModalVisible, setCertModalVisible] = useState(false);
    const [certType, setCertType] = useState<'LICENSE' | 'TIN' | 'BRELA' | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [contactVisible, setContactVisible] = useState(false);
    const [shareVisible, setShareVisible] = useState(false);
    const { addItem: addToHistory } = useSearchHistory();

    // Save to history when shop is loaded
    useEffect(() => {
        if (shop) {
            addToHistory({
                id: shop.store_id || (id as string),
                name: shop.store_name,
                avatar: shop.branding?.logo_url,
                location: shop.metadata?.location || '',
                joinedDate: shop.created_at ? new Date(shop.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
                isVerified: shop.is_active,
                type: 'shop'
            });
        }
    }, [shop, id]);

    // Wishlist Logic for Stories
    const { isInWishlist, addItem, removeItem } = useWishlistStore();
    const { mutate: addToWishlist } = useAddToWishlist();
    const { mutate: removeFromWishlist } = useRemoveFromWishlist();

    const handleLikeStory = (banner: any) => {
        // Try to extract product_id from destination_url (e.g. /product/123)
        const productId = banner.destination_url?.split('/').pop();
        if (!productId) return;

        const isLiked = isInWishlist(productId);
        if (isLiked) {
            removeItem(productId);
            removeFromWishlist({ productId });
        } else {
            const newItem = {
                product_id: productId,
                product: {
                    product_id: productId,
                    name: banner.title || 'Product',
                    images: [banner.image_url],
                    base_price: 0 // We don't have the price here easily
                }
            } as any;
            addItem(newItem);
            addToWishlist({ product_id: productId });
        }
    };

    const mappedProducts = useMemo(() => {
        return products.map(mapApiProductToUI);
    }, [products]);

    const handleOpenCert = (type: 'LICENSE' | 'TIN' | 'BRELA') => {
        setCertType(type);
        setCertModalVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#425BA4" />
            </View>
        );
    }

    if (error || !shop) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
                <Text style={styles.errorText}>{error || 'Shop not found'}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const logoUri = shop.branding?.logo_url || shop.metadata?.logo_url || shop.metadata?.avatar;
    const validLogoUri = logoUri && logoUri.trim() !== '' ? logoUri : 'https://via.placeholder.com/100x100?text=Shop';

    const certs = shop.metadata?.verification_documents || [];
    const certCount = Array.isArray(certs) ? certs.length : Object.keys(certs).length;
    const displayCertCount = Math.max(0, certCount - 1);
    const firstCertType = Array.isArray(certs) && certs.length > 0 ? (certs[0].type || 'TIN') : 'TIN';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setShareVisible(true)}>
                        <Ionicons name="share-social-outline" size={24} color="#1F2937" style={{ marginRight: 16 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header Row */}
                <View style={styles.profileTopRow}>
                    <View style={styles.logoContainer}>
                        <Image 
                            source={{ uri: validLogoUri }} 
                            style={styles.logo} 
                        />
                    </View>
                    <View style={styles.topStatsRow}>
                        <View style={styles.topStatItem}>
                            <Text style={styles.topStatValue}>{shop.metadata?.profile_visitors || '0'}</Text>
                            <Text style={styles.topStatLabel}>Profile visitor</Text>
                        </View>
                        <View style={styles.topStatItem}>
                            <Text style={styles.topStatValue}>{shop.followers_count?.toLocaleString() || '0'}</Text>
                            <Text style={styles.topStatLabel}>Followers</Text>
                        </View>
                    </View>
                </View>

                {/* Shop Title & Meta Section */}
                <View style={styles.titleSection}>
                    <View style={styles.nameRow}>
                        <View style={{ flex: 1 }}>
                            <View style={styles.shopNameRow}>
                                <Text style={styles.shopName}>{shop.store_name}</Text>
                                {shop.is_active && (
                                    <>
                                        <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginLeft: 4 }} />
                                        <Text style={styles.verifiedLabel}>Verified</Text>
                                    </>
                                )}
                            </View>
                            
                            <View style={styles.metaAndDistanceRow}>
                                {/* Left Side Meta List */}
                                <View style={styles.metaList}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>
                                            Joined {shop.created_at ? new Date(shop.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
                                        </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="location-outline" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>{shop.metadata?.location || 'Location not specified'}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="bicycle-outline" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>
                                            Est. Delivery Fees: Tsh. {shop.metadata?.delivery_fee?.toLocaleString() || '0'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.metaItem} onPress={() => {
                                        // Pass the first cert type to the modal, or just open menu if multiple
                                        if (certCount > 1) {
                                            setMenuVisible(true);
                                        } else {
                                            handleOpenCert(firstCertType);
                                        }
                                    }}>
                                        <Ionicons name="images-outline" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>
                                            {firstCertType} Certificate {displayCertCount > 0 ? `and ${displayCertCount} more` : ''}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Right Side Badges & Distance */}
                                <View style={styles.rightBadgesContainer}>
                                    {shop.is_featured && (
                                        <View style={styles.tierBadge}>
                                            <Ionicons name="diamond" size={14} color="#2DD4BF" />
                                            <Text style={styles.tierText}>{shop.metadata?.tier || 'Diamond'}</Text>
                                        </View>
                                    )}
                                    
                                    <View style={styles.distanceSection}>
                                        <View style={styles.distanceBadge}>
                                            <Ionicons name="navigate-outline" size={14} color="#6B7280" />
                                            <Text style={styles.distanceText}>{shop.metadata?.distance || '2'}km from you</Text>
                                        </View>
                                        <TouchableOpacity>
                                            <Text style={styles.metaLink}>Change delivery location</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Primary Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.primaryActionBtn} onPress={() => setContactVisible(true)}>
                        <Text style={styles.primaryActionText}>Contact</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => router.push({ pathname: '/(buyer)/shop/policy', params: { id: shop.store_id || id } })}>
                        <Text style={styles.secondaryActionText}>Refund & Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareCircleBtn} onPress={() => setShareVisible(true)}>
                        <Ionicons name="share-social-outline" size={20} color="#1F2937" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'STORIES' && styles.activeTab]} 
                        onPress={() => setActiveTab('STORIES')}
                    >
                        <Ionicons name="play-circle-outline" size={32} color={activeTab === 'STORIES' ? '#1E3A8A' : '#9CA3AF'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'GRID' && styles.activeTab]} 
                        onPress={() => setActiveTab('GRID')}
                    >
                        <Ionicons name="grid-outline" size={28} color={activeTab === 'GRID' ? '#1E3A8A' : '#9CA3AF'} />
                    </TouchableOpacity>
                </View>

                {/* Content Grid */}
                {activeTab === 'GRID' ? (
                    <View style={styles.instagramGrid}>
                        {mappedProducts.map(product => (
                            <TouchableOpacity 
                                key={product.id} 
                                style={styles.gridImageContainer}
                                onPress={() => router.push({ pathname: '/(buyer)/shop/product/[id]', params: { id: product.id, storeId: id } })}
                            >
                                <Image source={{ uri: product.image }} style={styles.gridImage} />
                                {product.has_variants && (
                                    <View style={styles.gridIconOverlay}>
                                        <Ionicons name="layers-outline" size={16} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                        {mappedProducts.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No products found</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.storiesContainer}>
                        <View style={styles.storiesHeader}>
                            <Text style={styles.storiesTitle}>Product Stories</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMoreText}>See more</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {shop.banners?.length > 0 ? (
                            shop.banners.map((banner, index) => (
                                <View key={index} style={styles.storyCard}>
                                    {/* Story Identity Header */}
                                    <View style={styles.storyUserHeader}>
                                        <Image 
                                            source={{ uri: shop.branding?.logo_url }} 
                                            style={styles.storyLogo} 
                                        />
                                        <View style={styles.storyUserInfo}>
                                            <View style={styles.storyUserNameRow}>
                                                <Text style={styles.storyUserName}>{shop.store_name}</Text>
                                                <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginLeft: 4 }} />
                                            </View>
                                            <Text style={styles.storyDescription} numberOfLines={2}>
                                                {banner.title || 'Summer vibes with our new denim collection. Perfect for those sunny days ahead! #SummerStyle'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Large Media Component */}
                                    <TouchableOpacity 
                                        style={styles.storyMediaContainer}
                                        onPress={() => {
                                            const prodId = banner.destination_url?.split('/').pop();
                                            if (prodId) {
                                                router.push({ 
                                                    pathname: '/(buyer)/shop/product/[id]', 
                                                    params: { id: prodId, storeId: id } 
                                                });
                                            }
                                        }}
                                    >
                                        <Image source={{ uri: banner.image_url }} style={styles.storyImage} />
                                        <TouchableOpacity style={styles.playCenterBtn}>
                                            <Ionicons name="play" size={40} color="#FFFFFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.muteBtn}>
                                            <Ionicons name="volume-mute-outline" size={20} color="#FFFFFF" />
                                        </TouchableOpacity>
                                        
                                        {/* Instagram-style Like Button */}
                                        <TouchableOpacity 
                                            style={styles.storyLikeBtn}
                                            onPress={() => handleLikeStory(banner)}
                                        >
                                            <Ionicons 
                                                name={isInWishlist(banner.destination_url?.split('/').pop() || '') ? "heart" : "heart-outline"} 
                                                size={32} 
                                                color={isInWishlist(banner.destination_url?.split('/').pop() || '') ? "#EF4444" : "#FFFFFF"} 
                                            />
                                        </TouchableOpacity>

                                        {/* Pagination inside story */}
                                        <View style={styles.storyPagination}>
                                            <View style={[styles.storyDot, styles.storyDotActive]} />
                                            <View style={styles.storyDot} />
                                            <View style={styles.storyDot} />
                                            <View style={styles.storyDot} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No promotional stories found</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <CertificateModal 
                visible={certModalVisible} 
                onClose={() => setCertModalVisible(false)} 
                type={certType as any} 
                imageUri={shop.metadata?.verification_documents?.find((d: any) => d.type === certType)?.url}
            />
            <BusinessMenuSheet 
                visible={menuVisible} 
                onClose={() => setMenuVisible(false)} 
                onViewCertificate={handleOpenCert}
                documents={shop.metadata?.verification_documents}
            />
            <ContactSheet 
                visible={contactVisible} 
                onClose={() => setContactVisible(false)} 
                shopName={shop.store_name}
                shopPhone={shop.metadata?.contact_phone || '+255700000000'}
            />
            <ShareSheet 
                visible={shareVisible} 
                onClose={() => setShareVisible(false)} 
                id={shop.store_id}
                type="shop"
                title={shop.store_name}
                image={shop.branding?.logo_url || ''}
            />
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
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileTopRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        padding: 2,
        borderWidth: 2,
        borderColor: '#F3F4F6',
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
    },
    topStatsRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 30,
        paddingRight: 10,
    },
    topStatItem: {
        alignItems: 'center',
    },
    topStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    topStatLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    titleSection: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    shopNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    shopName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    verifiedLabel: {
        fontSize: 14,
        color: '#1E3A8A',
        fontWeight: '600',
        marginLeft: 4,
    },
    metaList: {
        gap: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaAndDistanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    metaText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    metaLink: {
        fontSize: 11,
        color: '#425BA4',
        fontWeight: '500',
        textDecorationLine: 'underline',
        marginTop: 2,
    },
    rightBadgesContainer: {
        alignItems: 'flex-end',
        gap: 16,
    },
    distanceSection: {
        alignItems: 'flex-end',
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F0FDFA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tierText: {
        fontSize: 13,
        color: '#2DD4BF',
        fontWeight: 'bold',
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distanceText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 24,
        gap: 12,
        alignItems: 'center',
    },
    primaryActionBtn: {
        flex: 1,
        height: 48,
        backgroundColor: '#3B5494', // Muted Blue from screenshot
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryActionText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryActionBtn: {
        flex: 1,
        height: 48,
        backgroundColor: '#3B5494',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryActionText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    shareCircleBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 24,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#6B7280',
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        paddingTop: 16,
        justifyContent: 'space-between',
    },
    storiesContainer: {
        paddingTop: 16,
    },
    storiesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    storiesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    seeMoreText: {
        fontSize: 14,
        color: '#1E3A8A',
        fontWeight: '600',
    },
    storyCard: {
        width: '100%',
        marginBottom: 24,
    },
    storyUserHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 12,
        alignItems: 'center',
    },
    storyLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    storyUserInfo: {
        flex: 1,
        marginLeft: 12,
    },
    storyUserNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storyUserName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    storyDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
        lineHeight: 16,
    },
    storyMediaContainer: {
        width: width - 40,
        height: 500,
        borderRadius: 24,
        marginHorizontal: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
    },
    storyImage: {
        width: '100%',
        height: '100%',
    },
    playCenterBtn: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -30,
        marginTop: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    muteBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    storyPagination: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    storyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    storyDotActive: {
        backgroundColor: '#FFFFFF',
        width: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
        textAlign: 'center',
    },
    backBtn: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#1E3A8A',
        borderRadius: 24,
    },
    backBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        width: '100%',
        paddingVertical: 40,
        alignItems: 'center',
    },
    instagramGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 2,
    },
    gridImageContainer: {
        width: width / 3,
        height: width / 3,
        padding: 1,
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridIconOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
    }
});
