import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';

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

    const renderItem = ({ item }: { item: any }) => {
        const isFollowing = following.includes(item.id);
        return (
            <View style={styles.creatorItem}>
                {/* Avatar Placeholder */}
                <View style={[styles.avatar, { backgroundColor: '#F3F4F6' }]}>
                    {/* In real app, Image source={{uri: item.avatar_url}} */}
                    <Text style={styles.avatarInitial}>
                        {(item.business_name || 'U')[0].toUpperCase()}
                    </Text>
                </View>

                <View style={styles.creatorInfo}>
                    <Text style={styles.creatorName}>{item.business_name || 'Business'}</Text>
                    {/* Optional category or subtitle */}
                    <Text style={styles.creatorCategory}>Official Store</Text>
                </View>

                <TouchableOpacity onPress={() => toggleFollow(item.id)}>
                    {isFollowing ? (
                        <Ionicons name="checkmark-circle" size={32} color="#425BA4" />
                    ) : (
                        <Ionicons name="add-circle" size={32} color="#425BA4" />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Follow interesting profiles</Text>
                <View style={{ width: 24 }} />
            </View>

            <Text style={styles.sectionTitle}>Discover businesses</Text>

            <FlatList
                data={creators}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2} // Grid layout as per design
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={() => (
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.sectionTitle}>Discover creators</Text>
                        {/* Placeholder for creators section if different from businesses */}
                        <View style={styles.creatorItem}>
                            <View style={[styles.avatar, { backgroundColor: '#F3F4F6' }]}><Text>MD</Text></View>
                            <View style={styles.creatorInfo}><Text style={styles.creatorName}>Mama Dee</Text></View>
                            <Ionicons name="add-circle" size={32} color="#425BA4" />
                        </View>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    sectionTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 80,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    creatorItem: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 16,
        // Shadow/Elevation
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 2,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarInitial: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    creatorInfo: {
        alignItems: 'center',
        marginBottom: 8,
    },
    creatorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 2,
    },
    creatorCategory: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    skipText: {
        color: '#425BA4',
        fontSize: 16,
        fontWeight: '600',
    },
});
