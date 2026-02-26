import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMarketplace } from '../../src/hooks/useMarketplace';
import { authApi } from '../../src/services/auth';
import ProductCard from '../../src/components/product/ProductCardVertical';
import PromoBannerCarousel from '../../src/components/home/PromoBannerCarousel';
import { useBanners } from '../../src/services/tenant';

const { width } = Dimensions.get('window');
const PROFILE_EXTRAS_KEY = '@tunzaa_profile_extras';

export default function AccountScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const { products } = useMarketplace();
    const { data: banners, isLoading: bannersLoading } = useBanners();

    const [profileData, setProfileData] = useState({
        username: '',
        location: 'Dar es Salaam',
        profile_picture: '',
    });

    // Load profile metadata on focus
    useFocusEffect(
        React.useCallback(() => {
            const loadProfileData = async () => {
                try {
                    const userId = user?.user_id || user?.id;
                    if (!userId) return;

                    const storedExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${userId}`);
                    const localData = storedExtras ? JSON.parse(storedExtras) : {};

                    let apiMeta: Record<string, any> = {};
                    try {
                        const userData = await authApi.getUserDetails(userId);
                        const profiles = userData?.profiles || [];
                        let profile = profiles.find((p: any) => p.role === 'buyer') || profiles[0];
                        apiMeta = profile?.metadata || {};
                    } catch (e) {
                        // Ignore
                    }

                    setProfileData({
                        username: apiMeta.username || localData.username || '',
                        location: apiMeta.location || localData.location || 'Dar es Salaam',
                        profile_picture: apiMeta.profile_picture || localData.profile_picture || '',
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

    const avatarUrl = profileData.profile_picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=425ba4`;


    const renderProductItem = ({ item }: { item: any }) => (
        <View style={{ width: 160, marginRight: 12 }}>
            <ProductCard product={item} />
        </View>
    );

    // Order status actions
    const orderActions = [
        { icon: 'car-outline' as const, label: 'Shipped', route: '/(buyer)/orders' },
        { icon: 'archive-outline' as const, label: 'Received', route: '/(buyer)/orders' },
        { icon: 'return-down-back-outline' as const, label: 'Return', route: '/(buyer)/orders' },
    ];

    // Quick actions
    const quickActions = [
        { icon: 'heart-outline' as const, label: 'Wishlist', route: '/(buyer)/wishlist' },
        { icon: 'receipt-outline' as const, label: 'Refund', route: '/(buyer)/refund' },
        { icon: 'gift-outline' as const, label: 'Gift Card', route: '/(buyer)/services' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── User Header ── */}
                <View style={styles.userHeader}>
                    <View style={styles.userHeaderLeft}>
                        <TouchableOpacity onPress={() => router.push('/(buyer)/profile')}>
                            <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
                        </TouchableOpacity>
                        <View style={styles.userHeaderInfo}>
                            <View style={styles.nameVerifiedRow}>
                                <Text style={styles.headerName}>{displayName}</Text>
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            </View>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={12} color="#6B7280" />
                                <Text style={styles.locationText}>{profileData.location}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerIconBtn}>
                            <Ionicons name="notifications-outline" size={22} color="#1F2937" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerIconBtn}
                            onPress={() => router.push('/(buyer)/profile/settings' as any)}
                        >
                            <Ionicons name="ellipsis-horizontal" size={22} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Profile Completion Bar ── */}
                {(() => {
                    const fields = [
                        !!user?.first_name,
                        !!user?.last_name,
                        !!user?.email,
                        !!user?.phone_number,
                        !!profileData.username,
                        !!profileData.location,
                        !!profileData.profile_picture,
                        !!user?.is_verified,
                    ];
                    const filled = fields.filter(Boolean).length;
                    const percent = Math.round((filled / fields.length) * 100);

                    return percent < 100 ? (
                        <TouchableOpacity
                            style={styles.completionBar}
                            onPress={() => router.push('/(buyer)/profile/edit' as any)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.completionContent}>
                                <Ionicons name="person-circle-outline" size={20} color="#4A55A2" />
                                <View style={styles.completionTextCol}>
                                    <Text style={styles.completionTitle}>
                                        Complete your profile – {percent}%
                                    </Text>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${percent}%` }]} />
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    ) : null;
                })()}

                {/* ── Featured Banner ── */}
                <PromoBannerCarousel banners={banners} loading={bannersLoading} />

                {/* ── Order Status ── */}
                <View style={styles.orderStatusRow}>
                    {orderActions.map((action, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.orderStatusItem}
                            onPress={() => router.push(action.route as any)}
                        >
                            <View style={styles.orderStatusIcon}>
                                <Ionicons name={action.icon} size={28} color="#4A55A2" />
                            </View>
                            <Text style={styles.orderStatusLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Offer Banner ── */}
                <View style={styles.offerBanner}>
                    <View style={styles.offerLeft}>
                        <View style={styles.coinBadge}>
                            <Ionicons name="cash-outline" size={16} color="#FBBF24" />
                            <Text style={styles.coinText}>Coin: Tsh40</Text>
                        </View>
                        <Text style={styles.offerClaimText}>Claim Offer</Text>
                    </View>
                    <TouchableOpacity style={styles.collectButton}>
                        <Text style={styles.collectButtonText}>Collect</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Quick Actions ── */}
                <View style={styles.quickActionsRow}>
                    {quickActions.map((action, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.quickActionItem}
                            onPress={() => router.push(action.route as any)}
                        >
                            <View style={styles.quickActionIcon}>
                                <Ionicons name={action.icon} size={26} color="#4A55A2" />
                            </View>
                            <Text style={styles.quickActionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Divider ── */}
                <View style={styles.divider} />

                {/* ── Discover More Deals ── */}
                <View style={styles.dealsSection}>
                    <Text style={styles.dealsSectionTitle}>Discover More Deals</Text>
                    <FlatList
                        horizontal
                        data={products.slice(0, 8)}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.dealsListContent}
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
    scrollContent: {
        paddingBottom: 110,
    },

    // ── User Header ──
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    userHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E5E7EB',
        marginRight: 12,
    },
    userHeaderInfo: {
        flex: 1,
    },
    nameVerifiedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    verifiedText: {
        fontSize: 11,
        color: '#22C55E',
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerIconBtn: {
        padding: 6,
    },

    // ── Order Status ──
    orderStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    orderStatusItem: {
        alignItems: 'center',
        gap: 8,
    },
    orderStatusIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#F3F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderStatusLabel: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },

    // ── Offer Banner ──
    offerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    offerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    coinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    coinText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4A55A2',
    },
    offerClaimText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    collectButton: {
        backgroundColor: '#4A55A2',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    collectButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },

    // ── Quick Actions ──
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    quickActionItem: {
        alignItems: 'center',
        gap: 8,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#F3F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },

    // ── Divider ──
    divider: {
        height: 6,
        backgroundColor: '#F3F4F6',
        marginBottom: 20,
    },

    // ── Discover More Deals ──
    dealsSection: {
        paddingLeft: 20,
        marginBottom: 24,
    },
    dealsSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    dealsListContent: {
        paddingRight: 20,
    },

    // ── Profile Completion Bar ──
    completionBar: {
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    completionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    completionTextCol: {
        flex: 1,
    },
    completionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 6,
    },
    progressTrack: {
        height: 6,
        borderRadius: 3,
        backgroundColor: '#DBEAFE',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: '#4A55A2',
    },
});
