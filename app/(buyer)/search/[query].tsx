import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Image, Dimensions, Modal, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productsApi } from '../../../src/services/products';
import { PRODUCTS } from '../../../src/data/products';
import { mapApiProductToUI } from '../../../src/hooks/useMarketplace';
import { ActivityIndicator } from 'react-native';
import BottomNav from '../../../src/components/navigation/BottomNav';

const { width } = Dimensions.get('window');

// Helper to format price
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
};

// Custom Product Card for List View
const ListProductCard = ({ product }: { product: typeof PRODUCTS[0] }) => {
    const router = useRouter();
    return (
        <TouchableOpacity style={styles.listCard} onPress={() => router.push(`/(buyer)/product/${product.id}` as any)}>
            <View style={styles.listCardImageWrapper}>
                <Image source={{ uri: product.image }} style={styles.listCardImage} />
            </View>
            <View style={styles.listCardDetails}>
                <View style={styles.listCardHeader}>
                    <Text style={styles.listCardTitle} numberOfLines={1}>{product.name}</Text>
                </View>
                <Text style={styles.listCardPrice}>Tsh. {formatPrice(product.price)}</Text>
                <Text style={styles.listCardSpecs} numberOfLines={2}>
                    Specifications: {product.specs ? product.specs.join(', ') : 'Water resistant, Accelerometer, Display: 44mm, ...'}
                </Text>
                <View style={styles.listCardVendorContainer}>
                    <View style={styles.vendorLogoWrap}>
                        {product.vendor.name.includes('VODACOM') ? (
                            <Image source={{ uri: 'https://1000logos.net/wp-content/uploads/2021/04/Vodacom-logo.png' }} style={styles.vendorLogoList} />
                        ) : (
                            <View style={[styles.vendorLogoList, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="storefront" size={12} color="#9CA3AF" />
                            </View>
                        )}
                    </View>
                    <View style={styles.vendorInfoList}>
                        <Text style={styles.vendorNameList}>{product.vendor.name}</Text>
                        <Text style={styles.vendorMetaList}>Supplier since 2024</Text>
                        <View style={styles.locationRowList}>
                            <Ionicons name="location-outline" size={10} color="#425BA4" />
                            <Text style={styles.locationTextList}>Dar, Mikocheni</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Custom Product Card for Gallery View
const GridProductCard = ({ product }: { product: typeof PRODUCTS[0] }) => {
    const router = useRouter();
    return (
        <TouchableOpacity style={styles.gridCard} onPress={() => router.push(`/(buyer)/product/${product.id}` as any)}>
            <View style={styles.gridImageWrapper}>
                <Image source={{ uri: product.image }} style={styles.gridImage} />
                <TouchableOpacity style={styles.gridHeartIcon}>
                    <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>
                <Image
                    source={{ uri: product.vendor.name.includes('VODACOM') ? 'https://1000logos.net/wp-content/uploads/2021/04/Vodacom-logo.png' : 'https://i.pravatar.cc/100?u=' + product.id }}
                    style={styles.gridVendorAvatar}
                />
            </View>
            <View style={styles.gridCardDetails}>
                <View style={styles.gridRatingRow}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text style={styles.gridRatingText}>4.8 <Text style={{ color: '#9CA3AF' }}>(56)</Text></Text>
                </View>
                <Text style={styles.gridCardTitle} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.gridCardPrice}>Tsh. {formatPrice(product.price)}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default function SearchScreen() {
    const { query } = useLocalSearchParams();
    const router = useRouter();
    const [searchText, setSearchText] = useState((query === 'all' ? '' : query as string) || '');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]); // Dynamic results

    // Fetch dynamic data
    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                // If query is empty, maybe fetch recent or generic
                const searchQuery = searchText.trim();
                let res;
                if (searchQuery) {
                    res = await productsApi.searchProducts(searchQuery, { limit: 30 });
                } else {
                    res = await productsApi.getProducts({ limit: 30, is_active: true });
                }
                
                if (res?.items && res.items.length > 0) {
                    setResults(res.items.map(mapApiProductToUI));
                } else {
                    setResults([]);
                }
            } catch (e: any) {
                console.warn('⚠️ [SearchScreen] API failed:', e.message);
                // Optional fallback to static if absolutely necessary, but empty is better
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 400); // 400ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchText]);

    // UI States
    const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
    const [sortMode, setSortMode] = useState<'matches' | 'sales' | 'price'>('matches');
    const [isImageSearchMode, setIsImageSearchMode] = useState(false);

    // Modals
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showImageSearchModal, setShowImageSearchModal] = useState(false);
    const [showPhotoPermissionModal, setShowPhotoPermissionModal] = useState(false);

    // Filter Form States
    const [filterSort, setFilterSort] = useState<'newest' | 'oldest' | 'priceDesc' | 'priceAsc'>('newest');
    const [nearbyShops, setNearbyShops] = useState(false);

    // Mock an Image Search selection
    const handleImageSearchSelect = () => {
        setShowImageSearchModal(false);
        setIsImageSearchMode(true);
        setViewMode('gallery');
        setShowPhotoPermissionModal(false); // Make sure this is closed if coming from gallery
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
                {/* Simulated native permission overlay header */}
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
                    {/* Mock grid of device photos */}
                    <View style={styles.galleryGrid}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((itm, i) => (
                            <TouchableOpacity key={i} style={styles.galleryThumbWrapper} onPress={handleImageSearchSelect}>
                                <Image
                                    style={styles.galleryThumb}
                                    source={{ uri: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&q=80` }}
                                />
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
                        <TouchableOpacity style={styles.clearAllBtn}>
                            <Text style={styles.clearAllText}>Clear All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Color Dropdown */}
                        <TouchableOpacity style={styles.filterRowItem}>
                            <Text style={styles.filterRowLabel}>Color</Text>
                            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                        </TouchableOpacity>

                        {/* Sort Radios */}
                        {[
                            { id: 'newest', label: 'Newest' },
                            { id: 'oldest', label: 'Oldest' },
                            { id: 'priceDesc', label: 'Price: High to low' },
                            { id: 'priceAsc', label: 'Price: Low to high' },
                        ].map((opt) => (
                            <TouchableOpacity
                                key={opt.id}
                                style={styles.filterRowItem}
                                onPress={() => setFilterSort(opt.id as any)}
                            >
                                <Text style={[styles.filterRowLabel, filterSort === opt.id && styles.filterRowLabelActive]}>
                                    {opt.label}
                                </Text>
                                <View style={styles.radioContainer}>
                                    {filterSort === opt.id && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        ))}

                        <Text style={styles.filterSectionTitle}>More</Text>

                        {/* Nearby Shops */}
                        <View style={styles.filterRowItem}>
                            <Text style={styles.filterRowLabel}>Nearby shops</Text>
                            <Switch
                                value={nearbyShops}
                                onValueChange={setNearbyShops}
                                trackColor={{ false: '#E5E7EB', true: '#425BA4' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {/* View As */}
                        <View style={styles.viewAsContainer}>
                            <Text style={styles.filterRowLabel}>View as</Text>
                            <View style={styles.viewAsToggles}>
                                <TouchableOpacity
                                    style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleActive]}
                                    onPress={() => setViewMode('list')}
                                >
                                    <Ionicons name="list" size={16} color={viewMode === 'list' ? '#425BA4' : '#9CA3AF'} />
                                    <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>List</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.viewToggleBtn, viewMode === 'gallery' && styles.viewToggleActive]}
                                    onPress={() => setViewMode('gallery')}
                                >
                                    <Ionicons name="grid-outline" size={16} color={viewMode === 'gallery' ? '#425BA4' : '#9CA3AF'} />
                                    <Text style={[styles.viewToggleText, viewMode === 'gallery' && styles.viewToggleTextActive]}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    {isImageSearchMode ? (
                        <View style={styles.imageResultHeader}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=100' }}
                                style={styles.searchImageThumb}
                            />
                            <TouchableOpacity onPress={() => setIsImageSearchMode(false)}>
                                <Ionicons name="close" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.searchBar}>
                            <Ionicons name="search-outline" size={20} color="#1A1A1A" />
                            <TextInput
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Smart watch"
                                placeholderTextColor="#9CA3AF"
                                style={styles.searchInput}
                            />
                            <TouchableOpacity onPress={() => setShowImageSearchModal(true)}>
                                <Ionicons name="camera-outline" size={22} color="#1A1A1A" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.filterBtn, showFilterModal && styles.filterBtnActive]}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Ionicons name="funnel-outline" size={18} color={showFilterModal ? '#FFFFFF' : '#1A1A1A'} />
                        {showFilterModal && <Text style={styles.filterBtnTextActive}>Filter</Text>}
                    </TouchableOpacity>
                </View>

                {/* Info Text (only in Image Search Mode) */}
                {isImageSearchMode && (
                    <Text style={styles.imageSearchCountText}>123 items</Text>
                )}

                {/* Sort Tabs Row */}
                <View style={[styles.tabsRow, isImageSearchMode && { justifyContent: 'flex-start', gap: 24, paddingHorizontal: 20 }]}>
                    <TouchableOpacity style={styles.tab} onPress={() => setSortMode('matches')}>
                        <Ionicons name="caret-up" size={12} color={sortMode === 'matches' ? '#425BA4' : '#FFFFFF'} />
                        <Text style={[styles.tabText, sortMode === 'matches' && styles.activeTabText]}>Best matches</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => setSortMode('sales')}>
                        <Ionicons name="caret-up" size={12} color={sortMode === 'sales' ? '#425BA4' : '#FFFFFF'} />
                        <Text style={[styles.tabText, sortMode === 'sales' && styles.activeTabText]}>Top sales</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => setSortMode('price')}>
                        <Ionicons name="swap-vertical-outline" size={12} color="#1F2937" />
                        <Text style={[styles.tabText, sortMode === 'price' && styles.activeTabText]}>Price</Text>
                    </TouchableOpacity>

                    {/* View Toggle Icon explicitly in Image Mode Toolbar as seen in screenshot */}
                    {isImageSearchMode && (
                        <TouchableOpacity style={[styles.filterBtn, { marginLeft: 'auto', width: 44, height: 44, borderRadius: 22 }]} onPress={() => setViewMode(viewMode === 'list' ? 'gallery' : 'list')}>
                            <Ionicons name="options-outline" size={18} color="#425BA4" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* List or Grid */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#425BA4" />
                    </View>
                ) : results.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                        <Ionicons name="search-outline" size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
                        <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>No products found matching "{searchText}".</Text>
                    </View>
                ) : viewMode === 'list' ? (
                    <FlatList
                        data={results}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <ListProductCard product={item} />}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.gridRow}
                        renderItem={({ item }) => <GridProductCard product={item} />}
                        contentContainerStyle={styles.gridContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Modals */}
            {renderImageSearchModal()}
            {renderPhotoPermissionModal()}
            {renderFilterModal()}
            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        gap: 12,
    },
    backButton: { padding: 4 },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        gap: 10,
    },
    searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A' },
    imageResultHeader: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 4,
        height: 48,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    searchImageThumb: {
        width: 32,
        height: 32,
        borderRadius: 6,
    },
    filterBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    filterBtnActive: {
        backgroundColor: '#425BA4',
        borderColor: '#425BA4',
        width: 'auto',
        paddingHorizontal: 16,
        borderRadius: 24,
    },
    filterBtnTextActive: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    imageSearchCountText: {
        paddingHorizontal: 20,
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: 32,
        marginBottom: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    tabText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
    activeTabText: { color: '#425BA4', fontWeight: 'bold' },
    listContent: { paddingHorizontal: 16, paddingBottom: 24 },

    // List Card styling matching specific search screenshot
    listCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    listCardImageWrapper: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        marginRight: 16,
    },
    listCardImage: { width: '100%', height: '100%', borderRadius: 12 },
    listCardDetails: { flex: 1, justifyContent: 'center' },
    listCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    listCardTitle: { fontSize: 15, fontWeight: '500', color: '#1A1A1A' },
    listCardPrice: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
    listCardSpecs: { fontSize: 11, color: '#9CA3AF', marginBottom: 8, lineHeight: 16 },
    listCardVendorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    vendorLogoWrap: { width: 24, height: 24, borderRadius: 12, overflow: 'hidden' },
    vendorLogoList: { width: '100%', height: '100%' },
    vendorInfoList: { flex: 1 },
    vendorNameList: { fontSize: 10, fontWeight: 'bold', color: '#1A1A1A' },
    vendorMetaList: { fontSize: 9, color: '#6B7280', marginBottom: 2 },
    locationRowList: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    locationTextList: { fontSize: 9, color: '#4B5563' },

    // Grid System
    gridContent: { paddingHorizontal: 16, paddingBottom: 24 },
    gridRow: { justifyContent: 'space-between', marginBottom: 16 },
    gridCard: {
        width: (width - 48) / 2, // 2 columns with padding and gap
        backgroundColor: '#FFFFFF',
    },
    gridImageWrapper: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        marginBottom: 12,
        position: 'relative',
    },
    gridImage: { width: '100%', height: '100%', borderRadius: 16 },
    gridHeartIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    gridVendorAvatar: {
        position: 'absolute',
        bottom: -12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
    },
    gridCardDetails: { paddingHorizontal: 4, paddingBottom: 8 },
    gridRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    gridRatingText: { fontSize: 11, fontWeight: '600', color: '#1A1A1A' },
    gridCardTitle: { fontSize: 13, fontWeight: '500', color: '#1A1A1A', marginBottom: 4, lineHeight: 18 },
    gridCardPrice: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },

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

    // Image Search Modals
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

    // Photo selection gallery (mock custom screen acting as modal)
    photoPermissionContainer: {
        flex: 1,
        backgroundColor: '#111827', // Dark background for native gallery feel
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

    // Filter Modal
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
    viewAsContainer: { paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    viewAsToggles: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 8, padding: 4 },
    viewToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    viewToggleActive: { backgroundColor: '#FFFFFF', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    viewToggleText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
    viewToggleTextActive: { color: '#425BA4', fontWeight: 'bold' },
    filterFooter: { padding: 24, paddingTop: 16, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    applyBtn: { backgroundColor: '#425BA4', paddingVertical: 16, borderRadius: 24, alignItems: 'center' },
    applyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
