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

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Stats Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarRow}>
                        <View style={styles.statsContainer}>
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.avatar}
                            />
                            <View style={styles.statsTextContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{profileData.followers_count >= 1000 ? `${(profileData.followers_count / 1000).toFixed(1)}K` : profileData.followers_count}</Text>
                                    <Text style={styles.statLabel}>Followers</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{profileData.following_count >= 1000 ? `${(profileData.following_count / 1000).toFixed(1)}K` : profileData.following_count}</Text>
                                    <Text style={styles.statLabel}>Following</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{displayName}</Text>
                            {/* Verified Badge Placeholder */}
                            <View style={styles.verifiedBadge}>
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
                            <Ionicons name="share-social-outline" size={20} color="#4B5563" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Setup Banner */}
                <View style={styles.bannerContainer}>
                    <ProfileSetupBanner progress={0.6} points={53} onPress={() => router.push('/(buyer)/profile/edit')} />
                </View>

                {/* Recommended Section */}
                <View style={styles.recommendedSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended for You</Text>
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
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        paddingBottom: 40,
    },
    profileSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E5E7EB',
        marginRight: 24,
    },
    statsTextContainer: {
        flexDirection: 'row',
        gap: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    userInfo: {
        marginBottom: 16,
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
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    verifiedText: {
        fontSize: 10,
        color: '#0284C7',
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    editProfileButton: {
        flex: 1,
        backgroundColor: '#1E3A8A', // Dark blue
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editProfileButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerContainer: {
        marginBottom: 24,
    },
    recommendedSection: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E3A8A', // Blue color for title based on screenshot
    },
    seeAllText: {
        fontSize: 12,
        color: '#6B7280',
    },
    productsList: {
        paddingRight: 20,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
});
