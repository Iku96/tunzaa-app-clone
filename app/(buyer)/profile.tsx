import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileSetupBanner from '../../src/components/profile/ProfileSetupBanner';
import ProductCard from '../../src/components/product/ProductCardVertical';
import { useMarketplace } from '../../src/hooks/useMarketplace';
import { authApi } from '../../src/services/auth';

const PROFILE_EXTRAS_KEY = '@tunzaa_profile_extras';

export default function ProfileScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const { products } = useMarketplace();

    const [profileData, setProfileData] = useState({
        username: '',
        location: 'Dar es Salaam', // Default
        followers_count: 0,
        following_count: 0,
        profile_picture: ''
    });

    // Load profile metadata
    useFocusEffect(
        React.useCallback(() => {
            const loadProfileData = async () => {
                try {
                    const userId = user?.user_id || user?.id;
                    if (!userId) return;

                    // 1. Local data
                    const storedExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${userId}`);
                    const localData = storedExtras ? JSON.parse(storedExtras) : {};

                    // 2. API data
                    let apiMeta: Record<string, any> = {};
                    try {
                        const userData = await authApi.getUserDetails(userId);
                        const profiles = userData?.profiles || [];
                        let profile = profiles.find((p: any) => p.role === 'buyer') || profiles[0];
                        apiMeta = profile?.metadata || {};
                    } catch (e) {
                        // Ignore API error, use local
                    }

                    // 3. Merge
                    setProfileData({
                        username: apiMeta.username || localData.username || '',
                        location: apiMeta.location || localData.location || 'Dar es Salaam',
                        followers_count: apiMeta.followers_count || 0,
                        following_count: apiMeta.following_count || 0,
                        profile_picture: apiMeta.profile_picture || localData.profile_picture || ''
                    });

                } catch (e) {
                    // Ignore
                }
            };
            loadProfileData();
        }, [user])
    );

    const displayName = user
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Tunzaa User'
        : 'Tunzaa User';

    const headerTitle = profileData.username || displayName;
    const avatarUrl = profileData.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=425ba4`;

    const handleShareProfile = () => {
        Alert.alert('Share Profile', 'Sharing functionality coming soon!');
    };

    const renderProductItem = ({ item }: { item: any }) => (
        <View style={{ flex: 1, maxWidth: '50%', paddingHorizontal: 6, marginBottom: 16 }}>
            <ProductCard product={item} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{headerTitle}</Text>
                <TouchableOpacity onPress={() => router.push('/(buyer)/profile/settings')} style={styles.iconButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Stats Section */}
                <View style={styles.profileSection}>
                    <View style={styles.topRow}>
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {profileData.followers_count >= 1000 ? `${(profileData.followers_count / 1000).toFixed(1)}K` : profileData.followers_count}
                                </Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {profileData.following_count >= 1000 ? `${(profileData.following_count / 1000).toFixed(1)}K` : profileData.following_count}
                                </Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{displayName}</Text>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={14} color="#60A5FA" />
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        </View>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color="#6B7280" />
                            <Text style={styles.locationText}>{profileData.location}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                            style={styles.editProfileButton}
                            onPress={() => router.push('/(buyer)/profile/edit')}
                        >
                            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShareProfile}>
                            <Ionicons name="share-social-outline" size={20} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Setup Banner */}
                <View style={styles.bannerContainer}>
                    <ProfileSetupBanner progress={0.6} points={53} onPress={() => router.push('/(buyer)/profile/edit')} />
                </View>

                {/* Promo Banner from Screenshot */}
                <View style={styles.promoBannerContainer}>
                    <View style={styles.promoBanner}>
                        <View style={styles.promoContent}>
                            <Text style={styles.promoTitle}>UP TO 80% OFF</Text>
                            <View style={styles.promoActions}>
                                <TouchableOpacity style={styles.promoButton}>
                                    <Ionicons name="gift-outline" size={14} color="#425BA4" />
                                    <Text style={styles.promoButtonText}>Claim Offer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.promoButton, styles.promoButtonOutline]}>
                                    <Text style={styles.promoButtonTextWhite}>Collect</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60' }} 
                            style={styles.promoImage} 
                        />
                    </View>
                </View>

                {/* Shortcuts Grid */}
                <View style={styles.shortcutsGrid}>
                    <View style={styles.shortcutRow}>
                        <TouchableOpacity style={styles.shortcutItem}>
                            <View style={styles.shortcutIconContainer}>
                                <Ionicons name="bus-outline" size={24} color="#4B5563" />
                            </View>
                            <Text style={styles.shortcutLabel}>Shipped</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutItem}>
                            <View style={styles.shortcutIconContainer}>
                                <Ionicons name="cube-outline" size={24} color="#4B5563" />
                            </View>
                            <Text style={styles.shortcutLabel}>Received</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutItem} onPress={() => router.push('/(buyer)/orders/list')}>
                            <View style={styles.shortcutIconContainer}>
                                <Ionicons name="arrow-undo-outline" size={24} color="#4B5563" />
                            </View>
                            <Text style={styles.shortcutLabel}>Return</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.shortcutRow}>
                        <TouchableOpacity style={styles.shortcutItem}>
                            <View style={styles.shortcutIconContainer}>
                                <Ionicons name="heart-outline" size={24} color="#4B5563" />
                            </View>
                            <Text style={styles.shortcutLabel}>Wishlist</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutItem} onPress={() => router.push('/(buyer)/refund')}>
                            <View style={styles.shortcutIconContainer}>
                                <Ionicons name="refresh-outline" size={24} color="#4B5563" />
                            </View>
                            <Text style={styles.shortcutLabel}>Refund</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutItem}>
                            <View style={styles.shortcutIconContainer}>
                                <Ionicons name="gift-outline" size={24} color="#4B5563" />
                            </View>
                            <Text style={styles.shortcutLabel}>Gift Card</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recommended Section */}
                <View style={styles.recommendedSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Discover More Deals</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={products.slice(0, 10)}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        scrollEnabled={false}
                        contentContainerStyle={styles.productsList}
                    />
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        paddingBottom: 40,
    },
    profileSection: {
        paddingHorizontal: 20,
        paddingTop: 16,
        marginBottom: 20,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 32,
        paddingRight: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    userInfo: {
        marginBottom: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 8,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    verifiedText: {
        fontSize: 11,
        color: '#60A5FA',
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 4,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    editProfileButton: {
        flex: 1,
        backgroundColor: '#425BA4',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#425BA4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    editProfileButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    shareButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    promoBannerContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    promoBanner: {
        backgroundColor: '#425BA4',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
    },
    promoContent: {
        flex: 1,
    },
    promoTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    promoActions: {
        flexDirection: 'row',
        gap: 8,
    },
    promoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    promoButtonOutline: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    promoButtonText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    promoButtonTextWhite: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    promoImage: {
        width: 100,
        height: 120,
        borderRadius: 12,
        transform: [{ rotate: '15deg' }, { translateY: 10 }],
    },
    shortcutsGrid: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    shortcutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    shortcutItem: {
        alignItems: 'center',
        width: '30%',
    },
    shortcutIconContainer: {
        marginBottom: 8,
    },
    shortcutLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    recommendedSection: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    seeAllText: {
        fontSize: 13,
        color: '#6B7280',
    },
    productsList: {
        paddingBottom: 20,
    },
});
