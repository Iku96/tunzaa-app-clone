import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data if no merchants exist yet for testing
const MOCK_CREATORS = [
    { id: '1', business_name: 'Tunzaa shop', avatar: null },
    { id: '2', business_name: 'Vodacom shop', avatar: null },
    { id: '3', business_name: 'SBM shop', avatar: null },
    { id: '4', business_name: 'Mamie shop', avatar: null },
];

export default function Step3Follows() {
    const router = useRouter();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    const [creators, setCreators] = useState<any[]>([]);
    const [following, setFollowing] = useState<string[]>([]); // Array of merchant IDs
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        try {
            // Fetch profiles where role is merchant (for now assuming we can filter by role derived from somewhere else or just fetch all for demo)
            // Ideally your profiles table would have a role column, or we fetch from auth linkage. 
            // For now, let's fetch profiles that have 'business_name' set (implying merchant)
            const { data, error } = await supabase
                .from('profiles')
                .select('id, business_name')
                .not('business_name', 'is', null)
                .limit(10);

            if (error) throw error;

            if (data && data.length > 0) {
                setCreators(data);
            } else {
                setCreators(MOCK_CREATORS);
            }
        } catch (e) {
            console.error(e);
            setCreators(MOCK_CREATORS);
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
                await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', merchantId);
            } else {
                // Insert
                await supabase
                    .from('follows')
                    .insert({
                        follower_id: user.id,
                        following_id: merchantId
                    });
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

    const renderBusinessItem = ({ item }) => {
        const isFollowing = following.includes(item.id);
        return (
            <View style={styles.businessCard}>
                <View style={styles.businessAvatarContainer}>
                    <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/80' }} style={styles.businessAvatar} />
                    <TouchableOpacity onPress={() => toggleFollow(item.id)} style={styles.addBadge}>
                        <Ionicons
                            name={isFollowing ? "checkmark-circle" : "add-circle"}
                            size={24}
                            color={isFollowing ? "#10B981" : "#3E4C85"}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.businessName} numberOfLines={1}>{item.business_name || 'Business'}</Text>
            </View>
        );
    };

    const renderCreatorItem = ({ item }) => {
        const isFollowing = following.includes(item.id);
        return (
            <View style={styles.creatorCard}>
                <View style={styles.creatorImageContainer}>
                    <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/100' }} style={styles.creatorImage} />
                    <TouchableOpacity onPress={() => toggleFollow(item.id)} style={styles.addBadgeCreator}>
                        <Ionicons
                            name={isFollowing ? "checkmark-circle" : "add-circle"}
                            size={24}
                            color={isFollowing ? "#10B981" : "#3E4C85"}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.creatorName} numberOfLines={1}>{item.business_name || 'Creator'}</Text>
            </View>
        );
    };

    const renderNearbyItem = ({ item }) => (
        <View style={styles.nearbyCard}>
            <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/100' }} style={styles.nearbyImage} />
            {/* Text is inside the image or below? Screenshot 4 'Find nearby' shows square icons (logos). 
                 It seems like a grid of squares or horizontal list of squares.
                 Let's assume horizontal list of square logos.
             */}
            <Text style={styles.nearbyName} numberOfLines={1}>{item.business_name}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {renderHeader()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Discover Businesses */}
                <Text style={styles.sectionTitle}>Discover businesses</Text>
                <FlatList
                    data={creators.slice(0, 4)} // Mock subset
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={renderBusinessItem}
                    keyExtractor={item => `biz-${item.id}`}
                />

                {/* Discover Creators */}
                <Text style={styles.sectionTitle}>Discover creators</Text>
                <FlatList
                    data={creators.slice(0, 4)} // Mock subset
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={renderCreatorItem}
                    keyExtractor={item => `creator-${item.id}`}
                />

                {/* Find Nearby Businesses */}
                <Text style={styles.sectionTitle}>Find nearby businesses</Text>
                <FlatList
                    data={creators.slice(0, 4)} // Mock subset
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={renderNearbyItem}
                    keyExtractor={item => `nearby-${item.id}`}
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
