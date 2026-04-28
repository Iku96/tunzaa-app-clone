import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useShop } from '../../../src/hooks/useShop';
import { mapApiProductToUI } from '../../../src/hooks/useMarketplace';
import ProductCardVertical from '../../../src/components/product/ProductCardVertical';
import CertificateModal from '../../../src/components/shop/CertificateModal';
import BusinessMenuSheet from '../../../src/components/shop/BusinessMenuSheet';
import ShareSheet from '../../../src/components/shop/ShareSheet';

const { width } = Dimensions.get('window');

export default function ShopProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { shop, products, loading, error } = useShop(id as string);
    
    const [activeTab, setActiveTab] = useState<'GRID' | 'STORIES'>('GRID');
    const [certModalVisible, setCertModalVisible] = useState(false);
    const [certType, setCertType] = useState<'LICENSE' | 'TIN' | 'BRELA' | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [shareVisible, setShareVisible] = useState(false);

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
                            source={{ uri: shop.branding?.logo_url || 'https://via.placeholder.com/100x100?text=Shop' }} 
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

                {/* Shop Title & Badges */}
                <View style={styles.titleSection}>
                    <View style={styles.nameRow}>
                        <View>
                            <View style={styles.shopNameRow}>
                                <Text style={styles.shopName}>{shop.store_name}</Text>
                                {shop.is_active && (
                                    <>
                                        <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginLeft: 4 }} />
                                        <Text style={styles.verifiedLabel}>Verified</Text>
                                    </>
                                )}
                            </View>
                            
                            {/* Detailed Metadata List */}
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
                                <View style={styles.metaRowWithLink}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="bicycle-outline" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>
                                            Est. Delivery Fees: {shop.metadata?.delivery_fee ? `Tsh. ${shop.metadata.delivery_fee.toLocaleString()}` : 'Tsh. 0'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity>
                                        <Text style={styles.metaLink}>Change delivery location</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.metaItem} onPress={() => handleOpenCert('TIN')}>
                                    <Ionicons name="images-outline" size={14} color="#6B7280" />
                                    <Text style={styles.metaText}>
                                        {shop.metadata?.certificates_count || 0} Certificates verified
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Right Side Badges */}
                        <View style={styles.rightBadges}>
                            {shop.is_featured && (
                                <View style={styles.tierBadge}>
                                    <Ionicons name="diamond" size={14} color="#2DD4BF" />
                                    <Text style={styles.tierText}>{shop.metadata?.tier || 'Diamond'}</Text>
                                </View>
                            )}
                            {shop.metadata?.distance && (
                                <View style={styles.distanceBadge}>
                                    <Ionicons name="navigate-outline" size={14} color="#6B7280" />
                                    <Text style={styles.distanceText}>{shop.metadata.distance}km from you</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Primary Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.primaryActionBtn}>
                        <Text style={styles.primaryActionText}>Contact</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryActionBtn}>
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
                        <Ionicons name="play-circle-outline" size={28} color={activeTab === 'STORIES' ? '#1E3A8A' : '#9CA3AF'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'GRID' && styles.activeTab]} 
                        onPress={() => setActiveTab('GRID')}
                    >
                        <Ionicons name="grid-outline" size={24} color={activeTab === 'GRID' ? '#1E3A8A' : '#9CA3AF'} />
                    </TouchableOpacity>
                </View>

                {/* Content Grid */}
                {activeTab === 'GRID' ? (
                    <View style={styles.productGrid}>
                        {mappedProducts.map(product => (
                            <ProductCardVertical key={product.id} product={product} />
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
                                    <View style={styles.storyMediaContainer}>
                                        <Image source={{ uri: banner.image_url }} style={styles.storyImage} />
                                        <TouchableOpacity style={styles.playCenterBtn}>
                                            <Ionicons name="play" size={40} color="#FFFFFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.muteBtn}>
                                            <Ionicons name="volume-mute-outline" size={20} color="#FFFFFF" />
                                        </TouchableOpacity>
                                        
                                        {/* Pagination inside story */}
                                        <View style={styles.storyPagination}>
                                            <View style={[styles.storyDot, styles.storyDotActive]} />
                                            <View style={styles.storyDot} />
                                            <View style={styles.storyDot} />
                                            <View style={styles.storyDot} />
                                        </View>
                                    </View>
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
                type={certType} 
            />
            <BusinessMenuSheet 
                visible={menuVisible} 
                onClose={() => setMenuVisible(false)} 
            />
            <ShareSheet 
                visible={shareVisible} 
                onClose={() => setShareVisible(false)} 
                title={shop.store_name}
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
    metaRowWithLink: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: width - 40,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    metaLink: {
        fontSize: 11,
        color: '#1E3A8A',
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    rightBadges: {
        alignItems: 'flex-end',
        gap: 12,
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
        fontSize: 12,
        color: '#1E3A8A',
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
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    }
});
