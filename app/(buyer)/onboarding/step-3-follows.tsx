
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Step3Follows() {
    const router = useRouter();
    const { user } = useAuth();

    // In a real app, this would be fetched from Supabase (e.g., 'popular merchants')
    // For now, we fetch valid merchant profiles or use mock data if none exist
    const [creators, setCreators] = useState<any[]>([]);
    const [following, setFollowing] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        try {
            // Fetch profiles with role 'merchant'
            // Limit to 10 for suggestions
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, business_name')
                .eq('role', 'merchant')
                .limit(10);

            if (error) throw error;

            if (data && data.length > 0) {
                setCreators(data);
            } else {
                // Mock data if no merchants yet
                setCreators([
                    { id: '1', full_name: 'Fashion Hub', business_name: 'Fashion Hub', avatar_url: null },
                    { id: '2', full_name: 'Tech TZ', business_name: 'Tech TZ', avatar_url: null },
                    { id: '3', full_name: 'Mapambo Classic', business_name: 'Mapambo Classic', avatar_url: null },
                ]);
            }
        } catch (e) {
            console.error('Error fetching creators:', e);
            setCreators([
                { id: '1', full_name: 'Fashion Hub', business_name: 'Fashion Hub', avatar_url: null },
                { id: '2', full_name: 'Tech TZ', business_name: 'Tech TZ', avatar_url: null },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = (id: string) => {
        if (following.includes(id)) {
            setFollowing(prev => prev.filter(i => i !== id));
        } else {
            setFollowing(prev => [...prev, id]);
        }
    };

    const handleFinish = async () => {
        // Here we would save the follow relationships to the 'follows' table
        // For now, we just navigate to the home screen

        try {
            if (user && following.length > 0) {
                const followsData = following.map(merchantId => ({
                    follower_id: user.id,
                    following_id: merchantId
                }));

                // Assuming 'follows' table exists
                // const { error } = await supabase.from('follows').insert(followsData);
                // if (error) console.error(error); 
            }
        } catch (e) {
            console.error(e);
        }

        router.replace('/(buyer)');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Fuata Wauzaji Bora</Text>
                    <Text style={styles.subtitle}>Pata updates za bidhaa mpya kutoka kwa wauzaji hawa.</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#425BA4" />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.listContainer}>
                        {creators.map((creator) => {
                            const isFollowing = following.includes(creator.id);
                            return (
                                <View key={creator.id} style={styles.creatorCard}>
                                    <View style={styles.creatorInfo}>
                                        <View style={styles.avatar}>
                                            {creator.avatar_url ? (
                                                <Image source={{ uri: creator.avatar_url }} style={styles.avatarImage} />
                                            ) : (
                                                <Text style={styles.avatarText}>{creator.business_name?.charAt(0) || creator.full_name?.charAt(0) || '?'}</Text>
                                            )}
                                        </View>
                                        <View style={styles.textInfo}>
                                            <Text style={styles.creatorName}>{creator.business_name || creator.full_name}</Text>
                                            <Text style={styles.followersText}>Wafuasi 1.2k</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.followButton, isFollowing && styles.followingButton]}
                                        onPress={() => toggleFollow(creator.id)}
                                    >
                                        <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                                            {isFollowing ? 'Unafuata' : 'Fuata'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </ScrollView>
                )}

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                        <Text style={styles.buttonText}>Maliza</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingBottom: 40,
    },
    creatorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    creatorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    textInfo: {
        justifyContent: 'center',
    },
    creatorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    followersText: {
        fontSize: 13,
        color: '#6B7280',
    },
    followButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#425BA4',
    },
    followingButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    followButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFF',
    },
    followingButtonText: {
        color: '#374151',
    },
    footer: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    finishButton: {
        backgroundColor: '#425BA4',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 30,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
