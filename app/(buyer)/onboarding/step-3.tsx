import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shopsApi, Store } from '../../../src/services/shops';

export default function Step3Follows() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const insets = useSafeAreaInsets();

    const [creators, setCreators] = useState<Store[]>([]);
    const [following, setFollowing] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        try {
            const res = await shopsApi.getStores({ is_vendor_active: true });
            setCreators(res.items || []);
        } catch (e) {
            console.error('Failed to load stores:', e);
            setCreators([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = async (merchantId: string) => {
        if (!user) return;

        const isFollowing = following.includes(merchantId);

        // Optimistic UI update
        if (isFollowing) {
            setFollowing(prev => prev.filter(id => id !== merchantId));
        } else {
            setFollowing(prev => [...prev, merchantId]);
        }

        try {
            if (isFollowing) {
                // Delete
                console.log("TODO: migrate to whitelabel API");
            } else {
                // Insert
                console.log("TODO: migrate follow to whitelabel API");
            }
        } catch (e) {
            console.error('Error toggling follow:', e);
            // Revert on error
            if (isFollowing) {
                setFollowing(prev => [...prev, merchantId]);
            } else {
                setFollowing(prev => prev.filter(id => id !== merchantId));
            }
        }
    };

    const handleFinish = () => {
        router.replace('/(buyer)');
    };



    const renderHeader = () => (
        <View>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Follow interesting profiles</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <Text style={styles.searchText}>Search</Text>
            </View>
        </View>
    );

    const renderSectionHeader = (title: string) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    );

    const renderBusinessItem = ({ item }: { item: Store }) => {
        const merchantId = item.store_id || (item as any).id;
        const isFollowing = following.includes(merchantId);
        const name = item.store_name || (item as any).business_name || 'Business';
        const image = item.branding?.logo_url || (item as any).avatar_url || 'https://via.placeholder.com/80';

        return (
            <View style={styles.businessCard}>
                <View style={styles.businessAvatarContainer}>
                    <Image source={{ uri: image }} style={styles.businessAvatar} />
                    <TouchableOpacity onPress={() => toggleFollow(merchantId)} style={styles.addBadge}>
                        <Ionicons
                            name={isFollowing ? "checkmark-circle" : "add"}
                            size={24}
                            color={isFollowing ? "#10B981" : "#FFFFFF"}
                            style={!isFollowing ? { backgroundColor: '#3E4C85', borderRadius: 12, overflow: 'hidden' } : {}}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.businessName} numberOfLines={1}>{name}</Text>
            </View>
        );
    };

    const renderCreatorItem = ({ item }: { item: Store }) => {
        const merchantId = item.store_id || (item as any).id;
        const isFollowing = following.includes(merchantId);
        const name = item.store_name || (item as any).business_name || 'Creator';
        const image = item.branding?.logo_url || (item as any).avatar_url || 'https://via.placeholder.com/100';

        return (
            <View style={styles.creatorCard}>
                <View style={styles.creatorImageContainer}>
                    <Image source={{ uri: image }} style={styles.creatorImage} />
                    <TouchableOpacity onPress={() => toggleFollow(merchantId)} style={styles.addBadgeCreator}>
                        <Ionicons
                            name={isFollowing ? "checkmark-circle" : "add"}
                            size={24}
                            color={isFollowing ? "#10B981" : "#FFFFFF"}
                            style={!isFollowing ? { backgroundColor: '#3E4C85', borderRadius: 12, overflow: 'hidden' } : {}}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.creatorName} numberOfLines={1}>{name}</Text>
            </View>
        );
    };

    const renderNearbyItem = ({ item }: { item: Store }) => {
        const name = item.store_name || (item as any).business_name || 'Nearby';
        const image = item.branding?.logo_url || (item as any).avatar_url || 'https://via.placeholder.com/100';

        return (
            <View style={styles.nearbyCard}>
                <Image source={{ uri: image }} style={styles.nearbyImage} />
                <Text style={styles.nearbyName} numberOfLines={1}>{name}</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {renderHeader()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Discover Businesses */}
                <Text style={styles.sectionTitle}>Discover businesses</Text>
                <FlatList
                    data={creators.slice(0, 4)} // First chunk
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={renderBusinessItem}
                    keyExtractor={item => `biz-${item.store_id || (item as any).id}`}
                />

                {/* Discover Creators */}
                <Text style={styles.sectionTitle}>Discover creators</Text>
                <FlatList
                    data={creators.slice(4, 8)} // Second chunk
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={renderCreatorItem}
                    keyExtractor={item => `creator-${item.store_id || (item as any).id}`}
                />

                {/* Find Nearby Businesses */}
                <Text style={styles.sectionTitle}>Find nearby businesses</Text>
                <FlatList
                    data={creators.slice(8, 12)} // Third chunk
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={renderNearbyItem}
                    keyExtractor={item => `nearby-${item.store_id || (item as any).id}`}
                />

            </ScrollView>

            {/* Footer - Skip Only */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Ionicons name="arrow-forward" size={16} color="#3E4C85" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingTop: 10,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // Light grey
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 25, // Pill shape
        marginBottom: 24,
        gap: 10,
    },
    searchText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 8,
    },
    horizontalList: {
        paddingRight: 20,
        gap: 20, // Increased gap
        marginBottom: 24,
    },

    // Business Item (Circular)
    businessCard: {
        alignItems: 'center',
        width: 80,
    },
    businessAvatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    businessAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F3F4F6',
        resizeMode: 'contain', // Logos usually contain
    },
    addBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    businessName: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },

    // Creator Item (Square/Rounded)
    creatorCard: {
        alignItems: 'center',
        width: 80,
    },
    creatorImageContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    creatorImage: {
        width: 70,
        height: 70,
        borderRadius: 12, // Rounded rect
        backgroundColor: '#F3F4F6',
    },
    addBadgeCreator: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    creatorName: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },

    // Nearby Item (Square Logo/Card)
    nearbyCard: {
        alignItems: 'center',
        width: 100,
    },
    nearbyImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        marginBottom: 8,
    },
    nearbyName: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },

    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
    },
    skipText: {
        color: '#3E4C85',
        fontSize: 16,
        fontWeight: '500',
    },
});
