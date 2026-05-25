import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Modal, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { productsApi, Product as ApiProduct } from '../../../src/services/products';
import { categoriesApi, Category as ApiCategory } from '../../../src/services/categories';
import ProductCardVertical from '../../../src/components/product/ProductCardVertical';

import BottomNav from '../../../src/components/navigation/BottomNav';

const { width } = Dimensions.get('window');

export default function CategoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
    const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // --- New States for UI functionality ---
    const [sortMode, setSortMode] = useState<'matches' | 'sales' | 'price'>('matches');
    const [priceSortOrder, setPriceSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showImageSearchModal, setShowImageSearchModal] = useState(false);
    const [showPhotoPermissionModal, setShowPhotoPermissionModal] = useState(false);
    const [filterSort, setFilterSort] = useState<'newest' | 'oldest' | 'priceDesc' | 'priceAsc'>('newest');
    const [nearbyShops, setNearbyShops] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'gallery'>('gallery');
    const [hasColorVariant, setHasColorVariant] = useState(false);

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
                        const approved = res.items.filter((p: any) => p.verification_status === 'approved');

                        // Check if any product has a color variant
                        const hasColor = approved.some((p: any) => {
                            if (p.has_variants && p.variants && Array.isArray(p.variants)) {
                                return p.variants.some((v: any) => {
                                    if (!v.attributes) return false;
                                    const keys = Object.keys(v.attributes).map(k => k.toLowerCase());
                                    return keys.includes('color') || keys.includes('rangi');
                                });
                            }
                            return false;
                        });
                        setHasColorVariant(hasColor);

                        setCategoryProducts(approved.map((p: any) => ({
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

    // --- Processing Products ---
    const getDisplayedProducts = () => {
        let products = [...categoryProducts];

        // Apply Filter Modal sorting
        if (filterSort === 'priceAsc') {
            products.sort((a, b) => a.price - b.price);
        } else if (filterSort === 'priceDesc') {
            products.sort((a, b) => b.price - a.price);
        }

        // Apply Tab Sorting
        if (sortMode === 'price') {
            if (priceSortOrder === 'asc') {
                products.sort((a, b) => a.price - b.price);
            } else {
                products.sort((a, b) => b.price - a.price);
            }
        } else if (sortMode === 'sales') {
            products.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        }

        return products;
    };

    const finalProducts = getDisplayedProducts();

    // --- Modals ---
    const handleImageSearchSelect = () => {
        setShowImageSearchModal(false);
        setShowPhotoPermissionModal(false);
    };

    const renderImageSearchModal = () => (
        <Modal visible={showImageSearchModal} transparent animationType="slide">
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowImageSearchModal(false)} activeOpacity={1}>
                <View style={styles.imageSearchSheet}>
                    <View style={styles.sheetHandle} />
                    <View style={styles.imageSearchIconWrapper}>
                        <Ionicons name="images-outline" size={24} color="#1A1A1A" />
                    </View>
                    <Text style={styles.imageSearchTitle}>Search with an image</Text>

                    <TouchableOpacity style={styles.outlineBtn} onPress={() => {
                        setShowImageSearchModal(false);
                        setShowPhotoPermissionModal(true);
                    }}>
                        <Ionicons name="image-outline" size={20} color="#1A1A1A" style={{ marginRight: 8 }} />
                        <Text style={styles.outlineBtnText}>Choose from your gallery</Text>
                    </TouchableOpacity>

                    <Text style={styles.orText}>or</Text>

                    <TouchableOpacity style={styles.outlineBtn} onPress={handleImageSearchSelect}>
                        <Ionicons name="camera-outline" size={20} color="#1A1A1A" style={{ marginRight: 8 }} />
                        <Text style={styles.outlineBtnText}>Take a photo</Text>
                    </TouchableOpacity>

                    <Text style={styles.imageSearchHelp}>JPG/ PNG/ Max: 25MB Min 332 x 332px</Text>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderPhotoPermissionModal = () => (
        <Modal visible={showPhotoPermissionModal} animationType="slide" transparent>
            <View style={styles.photoPermissionContainer}>
                <View style={styles.permissionHeader}>
                    <Text style={styles.permissionTitle}>This app can only access the photos that you select</Text>
                </View>

                <View style={styles.galleryHeaderRow}>
                    <TouchableOpacity onPress={() => setShowPhotoPermissionModal(false)}>
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.galleryTabs}>
                        <TouchableOpacity style={styles.galleryTabActive}>
                            <Text style={styles.galleryTabTextActive}>Photos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.galleryTab}>
                            <Text style={styles.galleryTabText}>Albums</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.galleryContent}>
                    <Text style={styles.gallerySectionTitle}>Recent</Text>
                    <View style={styles.galleryGrid}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((itm, i) => (
                            <TouchableOpacity key={i} style={styles.galleryThumbWrapper} onPress={handleImageSearchSelect}>
                                <Image style={styles.galleryThumb} source={{ uri: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&q=80` }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );

    const renderFilterModal = () => (
        <Modal visible={showFilterModal} transparent animationType="slide">
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFilterModal(false)} activeOpacity={1}>
                <View style={styles.filterSheet}>
                    <View style={styles.sheetHandle} />
                    <View style={styles.filterHeader}>
                        <Text style={styles.filterTitle}>Filter</Text>
                        <TouchableOpacity style={styles.clearAllBtn} onPress={() => { setFilterSort('newest'); setNearbyShops(false); }}>
                            <Text style={styles.clearAllText}>Clear All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {hasColorVariant && (
                            <TouchableOpacity style={styles.filterRowItem}>
                                <Text style={styles.filterRowLabel}>Color</Text>
                                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}

                        {[
                            { id: 'newest', label: 'Newest' },
                            { id: 'oldest', label: 'Oldest' },
                            { id: 'priceDesc', label: 'Price: High to low' },
                            { id: 'priceAsc', label: 'Price: Low to high' },
                        ].map((opt) => (
                            <TouchableOpacity key={opt.id} style={styles.filterRowItem} onPress={() => setFilterSort(opt.id as any)}>
                                <Text style={[styles.filterRowLabel, filterSort === opt.id && styles.filterRowLabelActive]}>
                                    {opt.label}
                                </Text>
                                <View style={styles.radioContainer}>
                                    {filterSort === opt.id && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        ))}

                        <Text style={styles.filterSectionTitle}>More</Text>

                        <View style={styles.filterRowItem}>
                            <Text style={styles.filterRowLabel}>Nearby shops</Text>
                            <Switch value={nearbyShops} onValueChange={setNearbyShops} trackColor={{ false: '#E5E7EB', true: '#425BA4' }} thumbColor="#FFFFFF" />
                        </View>
                    </ScrollView>

                    <View style={styles.filterFooter}>
                        <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
                            <Text style={styles.applyBtnText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
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
                                <TouchableOpacity onPress={() => setShowImageSearchModal(true)}>
                                    <Ionicons name="camera-outline" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {!isAllCategories && (
                            <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
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
                                <TouchableOpacity style={sortMode === 'matches' ? styles.activeTab : styles.tab} onPress={() => setSortMode('matches')}>
                                    <Ionicons name="caret-up" size={12} color={sortMode === 'matches' ? '#425BA4' : '#1F2937'} />
                                    <Text style={sortMode === 'matches' ? styles.activeTabText : styles.tabText}>Best matches</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={sortMode === 'sales' ? styles.activeTab : styles.tab} onPress={() => setSortMode('sales')}>
                                    <Ionicons name="caret-up" size={12} color={sortMode === 'sales' ? '#425BA4' : '#1F2937'} />
                                    <Text style={sortMode === 'sales' ? styles.activeTabText : styles.tabText}>Top sales</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={sortMode === 'price' ? styles.activeTab : styles.tab} onPress={() => {
                                    if (sortMode === 'price') {
                                        setPriceSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                    } else {
                                        setSortMode('price');
                                        setPriceSortOrder('asc');
                                    }
                                }}>
                                    <Ionicons name={sortMode === 'price' && priceSortOrder === 'desc' ? "caret-down" : "caret-up"} size={12} color={sortMode === 'price' ? '#425BA4' : '#1F2937'} />
                                    <Text style={sortMode === 'price' ? styles.activeTabText : styles.tabText}>Price</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Grid Content */}
                            {loading ? (
                                <ActivityIndicator size="large" color="#425BA4" style={{ padding: 40 }} />
                            ) : (
                                <View style={styles.productGrid}>
                                    {finalProducts.length > 0 ? (
                                        finalProducts.map(p => (
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
                {renderImageSearchModal()}
                {renderPhotoPermissionModal()}
                {renderFilterModal()}
                <BottomNav />
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
    },

    // Modals & Bottom Sheets Common
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    imageSearchSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    imageSearchIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    imageSearchTitle: { fontSize: 16, fontWeight: 'bold', color: '#425BA4', marginBottom: 24 },
    outlineBtn: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },
    outlineBtnText: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
    orText: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
    imageSearchHelp: { fontSize: 11, color: '#9CA3AF', marginTop: 12 },

    photoPermissionContainer: {
        flex: 1,
        backgroundColor: '#111827',
    },
    permissionHeader: {
        backgroundColor: '#1F2937',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 60,
    },
    permissionTitle: { color: '#E5E7EB', fontSize: 14, textAlign: 'center' },
    galleryHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    galleryTabs: {
        flexDirection: 'row',
        backgroundColor: '#374151',
        borderRadius: 20,
        padding: 4,
    },
    galleryTabActive: {
        backgroundColor: '#4B5563',
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 16,
    },
    galleryTab: {
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 16,
    },
    galleryTabTextActive: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    galleryTabText: { color: '#9CA3AF', fontSize: 13 },
    galleryContent: { flex: 1 },
    gallerySectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', padding: 16 },
    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    galleryThumbWrapper: { width: width / 3, aspectRatio: 1, padding: 1 },
    galleryThumb: { width: '100%', height: '100%' },

    filterSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    filterTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
    clearAllBtn: { padding: 8 },
    clearAllText: { fontSize: 13, color: '#6B7280', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 },
    filterRowItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    filterRowLabel: { fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
    filterRowLabelActive: { color: '#1A1A1A' },
    radioContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#425BA4',
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 24,
    },
    filterFooter: { padding: 24, paddingTop: 16, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    applyBtn: { backgroundColor: '#425BA4', paddingVertical: 16, borderRadius: 24, alignItems: 'center' },
    applyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
