import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { productsApi, Product as ApiProduct } from '../../../src/services/products';
import { categoriesApi, Category as ApiCategory } from '../../../src/services/categories';
import ProductCardVertical from '../../../src/components/product/ProductCardVertical';

const { width } = Dimensions.get('window');

export default function CategoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
    const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchText]);

    const isAllCategories = id === 'all';
    const categoryName = isAllCategories ? 'All Categories' : 'Category';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (isAllCategories) {
                    // Fetch all categories from API
                    const res = await categoriesApi.getCategories();
                    if (res?.items?.length > 0) {
                        setApiCategories(res.items.filter(c => c.is_active));
                        console.log(`\u2705 [Category] Loaded ${res.items.length} categories from API`);
                    }
                } else {
                    // Fetch products for this category
                    const res = await productsApi.getProducts({ 
                        category_id: id as string, 
                        limit: 30, 
                        is_active: true,
                        query: debouncedSearch || undefined
                    });
                    if (res?.items?.length > 0) {
                        console.log(`\u2705 [Category] Loaded ${res.items.length} products for category ${id}`);
                        setCategoryProducts(res.items.map(p => ({
                            id: p.product_id || p._id,
                            name: p.name,
                            price: p.base_price_raw || p.base_price || 0,
                            image: p.images?.[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url) : 'https://via.placeholder.com/300x300?text=No+Image',
                            rating: 0,
                            reviews: 0,
                            vendor: {
                                id: p.store_id || p.store?.store_id || '1',
                                name: p.store?.store_name || 'Vendor',
                                location: '',
                                verified: true
                            },
                            category: categoryName,
                        })));
                    } else {
                        setCategoryProducts([]);
                    }
                }
            } catch (e: any) {
                console.warn('⚠️ [Category] API failed, using static fallback:', e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, debouncedSearch]);

    const displayedCategories = apiCategories;
    const filteredCategories = displayedCategories.filter((c: any) => 
        (c.name || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, isAllCategories && styles.headerCentered]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{categoryName}</Text>
                    {isAllCategories ? <View style={{ width: 24 }} /> : <View style={{ width: 24 }} />}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search-outline" size={20} color="#6B7280" />
                            <TextInput
                                placeholder={isAllCategories ? "Search for categories" : "Smart watch"}
                                placeholderTextColor="#9CA3AF"
                                style={styles.searchInput}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {!isAllCategories && (
                                <TouchableOpacity>
                                    <Ionicons name="camera-outline" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {!isAllCategories && (
                            <TouchableOpacity style={styles.filterBtn}>
                                <Ionicons name="options-outline" size={20} color="#425BA4" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isAllCategories ? (
                        /* ALL CATEGORIES LAYOUT */
                        loading ? (
                            <ActivityIndicator size="large" color="#425BA4" style={{ padding: 40 }} />
                        ) : (
                            <View style={styles.allCatsContainer}>
                                <View style={styles.gridContainer}>
                                    {filteredCategories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.category_id || cat.id}
                                            style={styles.gridCard}
                                            onPress={() => router.push(`/(buyer)/category/${cat.category_id || cat.id}`)}
                                        >
                                            <View style={styles.iconCircle}>
                                                <Ionicons name={(cat.icon as any) || 'grid-outline'} size={24} color="#425BA4" />
                                            </View>
                                            <Text style={styles.cardText}>{cat.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )
                    ) : (
                        /* SINGLE CATEGORY PRODUCT GRID LAYOUT */
                        <View style={styles.productGridSection}>
                            {/* Sort Tabs */}
                            <View style={styles.tabsRow}>
                                <TouchableOpacity style={styles.activeTab}>
                                    <Ionicons name="caret-up" size={12} color="#425BA4" />
                                    <Text style={styles.activeTabText}>Best matches</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.tab}>
                                    <Ionicons name="caret-up" size={12} color="#1F2937" />
                                    <Text style={styles.tabText}>Top sales</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.tab}>
                                    <Ionicons name="swap-vertical-outline" size={12} color="#1F2937" />
                                    <Text style={styles.tabText}>Price</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Grid Content */}
                            {loading ? (
                                <ActivityIndicator size="large" color="#425BA4" style={{ padding: 40 }} />
                            ) : (
                                <View style={styles.productGrid}>
                                    {categoryProducts.length > 0 ? (
                                        categoryProducts.map(p => (
                                            <ProductCardVertical key={p.id} product={p} />
                                        ))
                                    ) : (
                                        <View style={styles.emptyContainer}>
                                            <Text style={styles.emptyText}>No products found in this category.</Text>
                                            <TouchableOpacity style={styles.goHomeBtn} onPress={() => router.push('/(buyer)')}>
                                                <Text style={styles.goHomeText}>Go Home</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
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
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerCentered: {
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
    },
    filterBtn: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // All Categories Styles
    allCatsContainer: {
        paddingHorizontal: 20,
    },
    sectionWrapper: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 16,
    },
    gridCard: {
        width: (width - 56) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        height: 120,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    // Product List Styles
    productGridSection: {
        marginBottom: 40,
    },
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeTab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activeTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#425BA4',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tabText: {
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '500',
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    emptyContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 40,
        gap: 16,
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
    },
    goHomeBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#425BA4',
        borderRadius: 20,
    },
    goHomeText: {
        color: '#FFFFFF',
        fontWeight: '600',
    }
});
