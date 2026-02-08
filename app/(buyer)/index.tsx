import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import PromoBanner from '../../src/components/home/PromoBanner';
import CategoryGrid from '../../src/components/home/CategoryGrid';
import ProductCard from '../../src/components/home/ProductCard';

const { width } = Dimensions.get('window');

export default function BuyerHome() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (e) {
            console.error('Error fetching products:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleProductPress = (product: any) => {
        console.log('Product pressed:', product.name);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.userInfo} onPress={() => router.push('/(buyer)/profile')}>
                        <View style={styles.avatarContainer}>
                            {/* Placeholder Avatar - could fetch from user profile */}
                            <Image
                                source={{ uri: 'https://ui-avatars.com/api/?name=User&background=eff6ff&color=425ba4' }}
                                style={styles.avatar}
                            />
                        </View>
                        <View>
                            <Text style={styles.greeting}>Good Morning,</Text>
                            <Text style={styles.userName}>{user?.user_metadata?.full_name || 'User'}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
                            <View style={styles.badge} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            placeholder="Search for products and services"
                            placeholderTextColor="#9CA3AF"
                            style={styles.searchInput}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Promo Banner */}
                    <PromoBanner />

                    {/* Categories */}
                    <CategoryGrid />

                    {/* Recommended for You */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended for You</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <Text style={{ textAlign: 'center', padding: 20 }}>Loading...</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                            {products.length === 0 ? (
                                <Text style={{ padding: 20, color: '#666' }}>No products yet.</Text>
                            ) : (
                                products.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        title={product.name}
                                        price={product.price}
                                        image={product.image_url}
                                        originalPrice={undefined} // Schema doesn't have original price yet
                                    />
                                ))
                            )}
                        </ScrollView>
                    )}

                    {/* Best Matches (Duplicate for now, or fetch different data) */}
                    <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                        <Text style={styles.sectionTitle}>Best Matches</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {products.map(product => (
                            <ProductCard
                                key={`match-${product.id}`}
                                id={`match-${product.id}`}
                                title={product.name}
                                price={product.price}
                                image={product.image_url}
                            />
                        ))}
                    </ScrollView>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    greeting: {
        fontSize: 12,
        color: '#6B7280',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#1F2937',
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: '#425BA4',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    seeAll: {
        fontSize: 14,
        color: '#425BA4',
        fontWeight: '500',
    },
    horizontalList: {
        paddingHorizontal: 20,
        gap: 0, // Gap handled by card margin
    }
});
