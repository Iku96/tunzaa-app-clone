import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCardVertical from '../../../src/components/product/ProductCardVertical';
import CertificateModal from '../../../src/components/shop/CertificateModal';
import BusinessMenuSheet from '../../../src/components/shop/BusinessMenuSheet';
import ShareSheet from '../../../src/components/shop/ShareSheet';
import { useShop } from '../../../src/hooks/useShop';
import { mapApiProductToUI } from '../../../src/hooks/useMarketplace';

const { width } = Dimensions.get('window');

// Mock Data for Shop matching the screenshot
// Fallback stories if none provided by API
const FALLBACK_STORIES = [
    { id: 1, title: 'Summer vibes', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=600&fit=crop', type: 'video' },
    { id: 2, title: 'New Arrival', image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&h=600&fit=crop', type: 'image' },
];

export default function ShopProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { shop, products, loading, error } = useShop(id);
    const [activeTab, setActiveTab] = useState<'STORIES' | 'GRID'>('GRID'); // Default to GRID since stories not frequently used yet
    const [isFollowing, setIsFollowing] = useState(false);

    // Modals & Sheets
    const [certificateModalVisible, setCertificateModalVisible] = useState(false);
    const [certificateType, setCertificateType] = useState<'LICENSE' | 'TIN' | 'BRELA' | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [shareVisible, setShareVisible] = useState(false);

    // Map API products to UI products
    const shopProducts = products.map(mapApiProductToUI);

    const handleViewCertificate = (type: 'LICENSE' | 'TIN' | 'BRELA') => {
        setMenuVisible(false);
        setTimeout(() => { // Small delay for modal transition
            setCertificateType(type);
            setCertificateModalVisible(true);
        }, 300);
    };

    const renderStoryCard = ({ item }: { item: any }) => (
        <View style={styles.storyCardLarge}>
            <Image source={{ uri: item.image }} style={styles.storyCardImage} />
            <View style={styles.storyOverlay}>
                <View style={styles.storyHeader}>
                    <Image source={{ uri: shop?.branding?.logo_url || 'https://via.placeholder.com/150' }} style={styles.storyAvatar} />
                    <View>
                        <Text style={styles.storyShopName}>{shop?.store_name || 'Shop'}</Text>
                        <Text style={styles.storyTime}>2 hrs ago</Text>
                    </View>
                </View>
                <View style={styles.storyFooter}>
                    <Text style={styles.storyCaption} numberOfLines={2}>
                        {item.title} with our new collection. #Tunzaa #Deals
                    </Text>
                    {item.type === 'video' && (
                        <View style={styles.playButton}>
                            <Ionicons name="play" size={24} color="#FFFFFF" />
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header / Nav */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.navTitle}></Text>
                <TouchableOpacity style={styles.navActionBtn} onPress={() => setMenuVisible(true)}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#425BA4" />
                </View>
            ) : error || !shop ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'red' }}>{error || 'Shop not found'}</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                        <Text style={{ color: '#425BA4' }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Profile Header Info */}
                    <View style={styles.profileHeader}>
                        {/* Top Row: Logo & Stats */}
                        <View style={styles.profileTopRow}>
                            <View style={styles.logoContainer}>
                                <Image source={{ uri: shop?.branding?.logo_url || 'https://via.placeholder.com/150' }} style={styles.profileLogo} resizeMode="contain" />
                                {shop?.is_featured && (
                                    <View style={styles.verifiedBadgeLarge}>
                                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                    </View>
                                )}
                            </View>

                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>0</Text>
                                    <Text style={styles.statLabel}>Profile visitor</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <TouchableOpacity style={styles.statItem} onPress={() => { /* Navigate to followers */ }}>
                                    <Text style={styles.statValue}>{shop?.followers_count || 0}</Text>
                                    <Text style={styles.statLabel}>Followers</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Shop Details */}
                        <View style={styles.shopDetails}>
                            <View style={styles.nameRow}>
                                <Text style={styles.shopName}>{shop?.store_name}</Text>
                                {shop?.is_featured && <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 4 }} />}
                                <Text style={styles.verifiedText}>Verified</Text>

                                <View style={{ flex: 1 }} />

                                <View style={styles.diamondBadge}>
                                    <Ionicons name="diamond" size={12} color="#3B82F6" />
                                    <Text style={styles.diamondText}>Supplier</Text>
                                </View>
                            </View>

                            {/* Metadata Rows */}
                            <View style={styles.metaRow}>
                                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                <Text style={styles.metaText}>Joined {new Date(shop?.created_at).getFullYear() || 'N/A'}</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <Ionicons name="location-outline" size={14} color="#6B7280" />
                                <Text style={styles.metaText}>{shop?.branding?.about_html || 'Location not provided'}</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <Ionicons name="bicycle-outline" size={14} color="#6B7280" />
                                <Text style={styles.metaText}>Delivery Available</Text>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>See details</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.metaRow}>
                                <View style={styles.tinBadge}>
                                    <Ionicons name="document-text" size={10} color="#6B7280" />
                                    <Text style={styles.tinText}>Verified Shop</Text>
                                </View>
                            </View>

                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity style={styles.primaryBtn}>
                                <Text style={styles.primaryBtnText}>Contact</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.outlineBtn}>
                                <Text style={styles.outlineBtnText}>Refund & Policy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.iconBtn} onPress={() => setShareVisible(true)}>
                                <Ionicons name="share-social-outline" size={20} color="#1F2937" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tabItem, activeTab === 'STORIES' && styles.tabItemActive]}
                            onPress={() => setActiveTab('STORIES')}
                        >
                            <Ionicons
                                name={activeTab === 'STORIES' ? "caret-forward-circle" : "caret-forward-circle-outline"}
                                size={24}
                                color={activeTab === 'STORIES' ? "#EA4335" : "#9CA3AF"} // Red play button style
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabItem, activeTab === 'GRID' && styles.tabItemActive]}
                            onPress={() => setActiveTab('GRID')}
                        >
                            <Ionicons
                                name={activeTab === 'GRID' ? "grid" : "grid-outline"}
                                size={24}
                                color={activeTab === 'GRID' ? "#1F2937" : "#9CA3AF"}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Content Area */}
                    <View style={styles.contentArea}>
                        {activeTab === 'STORIES' ? (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Product Stories</Text>
                                    <TouchableOpacity>
                                        <Text style={styles.seeMoreText}>See more</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={shop?.banners?.length ? shop.banners.map(b => ({ ...b, image: b.image_url, type: 'image' })) : FALLBACK_STORIES}
                                    renderItem={renderStoryCard}
                                    keyExtractor={item => item.id.toString()}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.storiesList}
                                    pagingEnabled // Snap to card
                                    snapToInterval={width * 0.8 + 16}
                                    decelerationRate="fast"
                                />
                            </View>
                        ) : (
                            <View style={styles.productsGrid}>
                                {shopProducts.map((item: any) => (
                                    <View key={item.id} style={styles.gridItem}>
                                        <ProductCardVertical product={item} />
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                </ScrollView>
            )}

            {/* Modals */}
            <CertificateModal
                visible={certificateModalVisible}
                onClose={() => setCertificateModalVisible(false)}
                type={certificateType}
            />

            <BusinessMenuSheet
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onViewCertificate={handleViewCertificate}
            />

            <ShareSheet
                visible={shareVisible}
                onClose={() => setShareVisible(false)}
                shopName={shop?.store_name || 'Store'}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
        marginLeft: -4, // Align flush left
    },
    navTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    navActionBtn: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileHeader: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    profileTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align top
        marginBottom: 16,
    },
    logoContainer: {
        position: 'relative',
    },
    profileLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF', // Ensure logo has background
    },
    verifiedBadgeLarge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#3B82F6', // Blue Badge
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginLeft: 20,
        marginTop: 10, // Visually align with logo centerish
    },
    statItem: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E5E7EB',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    shopDetails: {
        marginBottom: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    shopName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginRight: 4,
    },
    verifiedText: {
        fontSize: 12,
        color: '#3B82F6',
        marginLeft: 2,
        fontWeight: '500',
    },
    diamondBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    diamondText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
        flexWrap: 'wrap',
    },
    metaText: {
        fontSize: 13,
        color: '#4B5563',
    },
    metaTextSmall: {
        fontSize: 12,
        color: '#6B7280',
    },
    linkText: {
        fontSize: 13,
        color: '#3B82F6',
        textDecorationLine: 'underline',
    },
    tinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    tinText: {
        fontSize: 10,
        color: '#4B5563',
        fontWeight: '600',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: '#425BA4', // Brand Blue
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    outlineBtn: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineBtnText: {
        color: '#1F2937',
        fontWeight: '600',
        fontSize: 14,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#FFFFFF', // Or faint grey
        borderWidth: 1,
        borderColor: '#F3F4F6', // Very subtle border
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        marginBottom: 16,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabItemActive: {
        borderBottomColor: '#1F2937', // Active tab indicator color
    },

    // Content
    contentArea: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    seeMoreText: {
        fontSize: 14,
        color: '#3B82F6',
    },

    // Stories
    storiesList: {
        paddingHorizontal: 20,
        gap: 16,
        paddingBottom: 20,
    },
    storyCardLarge: {
        width: width * 0.8, // Partial width to show peek of next card
        height: 450, // Tall card
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
    },
    storyCardImage: {
        width: '100%',
        height: '100%',
        opacity: 0.9,
    },
    storyOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.1)', // Subtle gradient overlay ideally
    },
    storyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    storyAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    storyShopName: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    storyTime: {
        color: '#EEE',
        fontSize: 12,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    storyFooter: {
        marginBottom: 8,
    },
    storyCaption: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    playButton: {
        position: 'absolute',
        top: -200, // Roughly center of card
        left: '42%',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },

    // Grid
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
    },
    gridItem: {
        width: '50%',
        padding: 8,
    },
});
