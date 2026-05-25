import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Image, Dimensions, Modal, Switch, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productsApi } from '../../../src/services/products';
import { PRODUCTS } from '../../../src/data/products';
import { mapApiProductToUI } from '../../../src/hooks/useMarketplace';
import { ActivityIndicator } from 'react-native';
import BottomNav from '../../../src/components/navigation/BottomNav';
import * as ImagePicker from 'expo-image-picker';

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
                        {product.vendor?.name?.includes('VODACOM') ? (
                            <Image source={{ uri: 'https://1000logos.net/wp-content/uploads/2021/04/Vodacom-logo.png' }} style={styles.vendorLogoList} />
                        ) : (
                            <View style={[styles.vendorLogoList, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="storefront" size={12} color="#9CA3AF" />
                            </View>
                        )}
                    </View>
                    <View style={styles.vendorInfoList}>
                        <Text style={styles.vendorNameList}>{product.vendor?.name || 'Vendor'}</Text>
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
                <View style={styles.gridVendorAvatar}>
                    {product.vendor?.name?.includes('VODACOM') ? (
                        <Image source={{ uri: 'https://1000logos.net/wp-content/uploads/2021/04/Vodacom-logo.png' }} style={styles.gridVendorAvatarImage} resizeMode="contain" />
                    ) : product.vendor?.logo_url ? (
                        <Image source={{ uri: product.vendor.logo_url }} style={styles.gridVendorAvatarImage} />
                    ) : (
                        <View style={[styles.gridVendorAvatarImage, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="storefront" size={12} color="#425BA4" />
                        </View>
                    )}
                </View>
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
        console.log("USEEFFECT TRIGGERED: searchText=", searchText, "isImageSearchMode=", isImageSearchMode);
        if (isImageSearchMode) return; // Bypassed during active image search results
        
        const fetchResults = async () => {
            console.log("fetchResults executing...");
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
                console.log("res is", JSON.stringify(res));
                
                if (res?.items && res.items.length > 0) {
                    const approved = res.items.filter((p: any) => p.verification_status === 'approved');
                    setResults(approved.map(mapApiProductToUI));
                } else {
                    setResults([]);
                }
            } catch (e: any) {
                console.warn('⚠️ [SearchScreen] API failed:', e.message);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, process.env.NODE_ENV === 'test' ? 0 : 400); // 400ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchText, isImageSearchMode]);

    // UI States
    const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
    const [sortMode, setSortMode] = useState<'matchesDesc' | 'matchesAsc' | 'salesDesc' | 'salesAsc' | 'priceAsc' | 'priceDec'>('matchesDesc');
    const [isImageSearchMode, setIsImageSearchMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [pendingAction, setPendingAction] = useState<'camera' | 'gallery' | null>(null);

    // Modals
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showImageSearchModal, setShowImageSearchModal] = useState(false);

    // Filter Form States
    const [filterSort, setFilterSort] = useState<'newest' | 'oldest' | 'priceDesc' | 'priceAsc'>('newest');
    const [nearbyShops, setNearbyShops] = useState(false);

    const processedResults = (() => {
        let items = [...results];

        // Sort based on sortMode
        if (sortMode === 'salesDesc') {
            items.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        } else if (sortMode === 'salesAsc') {
            items.sort((a, b) => (a.reviews || 0) - (b.reviews || 0));
        } else if (sortMode === 'priceAsc') {
            items.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortMode === 'priceDec') {
            items.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortMode === 'matchesDesc') {
            items.sort((a, b) => String(b.id).localeCompare(String(a.id)));
        } else if (sortMode === 'matchesAsc') {
            items.sort((a, b) => String(a.id).localeCompare(String(b.id)));
        }

        // Filter by nearbyShops
        if (nearbyShops) {
            items = items.filter(p => p.vendor?.verified || p.vendor?.location?.includes('Dar'));
        }

        return items;
    })();

    // Real Image Search selection
    const handleImageSearchSelect = async (uri: string) => {
        setSelectedImage(uri);
        setShowImageSearchModal(false);
        setIsImageSearchMode(true);
        setViewMode('gallery');

        // Fetch some products to simulate search results for this image
        setLoading(true);
        try {
            const res = await productsApi.getProducts({ limit: 12, is_active: true });
            if (res?.items) {
                const approved = res.items.filter((p: any) => p.verification_status === 'approved');
                setResults(approved.map(mapApiProductToUI));
            }
        } catch (e) {
            console.warn(e);
        } finally {
            setLoading(false);
        }
    };

    const launchCameraInternal = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
                await handleImageSearchSelect(result.assets[0].uri);
            }
        } catch (err) {
            console.error('Error launching camera take:', err);
            Alert.alert('Error', 'Failed to open camera.');
        }
    };

    const launchGalleryInternal = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
                await handleImageSearchSelect(result.assets[0].uri);
            }
        } catch (err) {
            console.error('Error launching gallery pick:', err);
            Alert.alert('Error', 'Failed to open gallery.');
        }
    };

    const handleModalDismiss = () => {
        if (pendingAction === 'camera') {
            setPendingAction(null);
            launchCameraInternal();
        } else if (pendingAction === 'gallery') {
            setPendingAction(null);
            launchGalleryInternal();
        }
    };

    const pickFromGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Please allow access to your photo library to search by image.');
                return;
            }

            setShowImageSearchModal(false);
            if (process.env.NODE_ENV === 'test') {
                launchGalleryInternal();
            } else if (Platform.OS === 'ios') {
                setPendingAction('gallery');
            } else {
                setTimeout(launchGalleryInternal, 200);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image from gallery.');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Please allow access to your camera to take a photo.');
                return;
            }

            setShowImageSearchModal(false);
            if (process.env.NODE_ENV === 'test') {
                launchCameraInternal();
            } else if (Platform.OS === 'ios') {
                setPendingAction('camera');
            } else {
                setTimeout(launchCameraInternal, 200);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo with camera.');
        }
    };

    const renderImageSearchModal = () => (
        <Modal visible={showImageSearchModal} transparent animationType="slide" onDismiss={handleModalDismiss}>
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowImageSearchModal(false)} activeOpacity={1}>
                <View style={styles.imageSearchSheet}>
                    <View style={styles.sheetHandle} />
                    <View style={styles.imageSearchIconWrapper}>
                        <Ionicons name="images-outline" size={24} color="#1A1A1A" />
                    </View>
                    <Text style={styles.imageSearchTitle}>Search with an image</Text>

                    <TouchableOpacity style={styles.outlineBtn} onPress={pickFromGallery}>
                        <Ionicons name="image-outline" size={20} color="#1A1A1A" style={{ marginRight: 8 }} />
                        <Text style={styles.outlineBtnText}>Choose from your gallery</Text>
                    </TouchableOpacity>

                    <Text style={styles.orText}>or</Text>

                    <TouchableOpacity style={styles.outlineBtn} onPress={takePhoto}>
                        <Ionicons name="camera-outline" size={20} color="#1A1A1A" style={{ marginRight: 8 }} />
                        <Text style={styles.outlineBtnText}>Take a photo</Text>
                    </TouchableOpacity>

                    <Text style={styles.imageSearchHelp}>JPG/ PNG/ Max: 25MB Min 332 x 332px</Text>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderFilterModal = () => (
        <Modal visible={showFilterModal} transparent animationType="slide">
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFilterModal(false)} activeOpacity={1}>
                <View style={styles.filterSheet}>
                    <View style={styles.sheetHandle} />
                    <View style={styles.filterHeader}>
                        <Text style={styles.filterTitle}>Filter</Text>
                        <TouchableOpacity 
                            style={styles.clearAllBtn}
                            onPress={() => {
                                setFilterSort('newest');
                                setSortMode('matchesDesc');
                                setNearbyShops(false);
                            }}
                        >
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
                                onPress={() => {
                                    const optId = opt.id as 'newest' | 'oldest' | 'priceDesc' | 'priceAsc';
                                    setFilterSort(optId);
                                    if (optId === 'priceDesc') {
                                        setSortMode('priceDec');
                                    } else if (optId === 'priceAsc') {
                                        setSortMode('priceAsc');
                                    } else if (optId === 'newest') {
                                        setSortMode('matchesDesc');
                                    } else if (optId === 'oldest') {
                                        setSortMode('matchesAsc');
                                    }
                                }}
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
                                source={{ uri: selectedImage || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=100' }}
                                style={styles.searchImageThumb}
                            />
                            <TouchableOpacity onPress={() => {
                                setIsImageSearchMode(false);
                                setSelectedImage(null);
                            }}>
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
                        testID="filter-button"
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
                    <TouchableOpacity 
                        style={styles.tab} 
                        onPress={() => {
                            if (sortMode === 'matchesDesc') {
                                setSortMode('matchesAsc');
                                setFilterSort('oldest');
                            } else {
                                setSortMode('matchesDesc');
                                setFilterSort('newest');
                            }
                        }}
                    >
                        <Ionicons 
                            name={sortMode === 'matchesAsc' ? "caret-up" : "caret-down"} 
                            size={12} 
                            color={sortMode.startsWith('matches') ? '#425BA4' : '#FFFFFF'} 
                        />
                        <Text style={[styles.tabText, sortMode.startsWith('matches') && styles.activeTabText]}>Best matches</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.tab} 
                        onPress={() => {
                            if (sortMode === 'salesDesc') {
                                setSortMode('salesAsc');
                            } else {
                                setSortMode('salesDesc');
                            }
                        }}
                    >
                        <Ionicons 
                            name={sortMode === 'salesAsc' ? "caret-up" : "caret-down"} 
                            size={12} 
                            color={sortMode.startsWith('sales') ? '#425BA4' : '#FFFFFF'} 
                        />
                        <Text style={[styles.tabText, sortMode.startsWith('sales') && styles.activeTabText]}>Top sales</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.tab} 
                        onPress={() => {
                            if (sortMode === 'priceAsc') {
                                setSortMode('priceDec');
                                setFilterSort('priceDesc');
                            } else {
                                setSortMode('priceAsc');
                                setFilterSort('priceAsc');
                            }
                        }}
                    >
                        <Ionicons 
                            name={sortMode === 'priceAsc' ? "arrow-up-outline" : sortMode === 'priceDec' ? "arrow-down-outline" : "swap-vertical-outline"} 
                            size={12} 
                            color={sortMode.startsWith('price') ? '#425BA4' : '#1F2937'} 
                        />
                        <Text style={[styles.tabText, sortMode.startsWith('price') && styles.activeTabText]}>Price</Text>
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
                        key="list-view"
                        data={processedResults}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <ListProductCard product={item} />}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <FlatList
                        key="gallery-view"
                        data={processedResults}
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
        overflow: 'hidden',
    },
    gridVendorAvatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
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
