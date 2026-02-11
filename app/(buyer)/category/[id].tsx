import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS, CATEGORIES } from '../../../src/data/products';
import ProductCardVertical from '../../../src/components/product/ProductCardVertical';

const { width } = Dimensions.get('window');

// Mock Data for "All Categories" Screen
const ALL_CATEGORIES_DATA = [
    {
        title: 'Essentials',
        items: [
            { id: '1', name: 'Living Room', icon: 'bed-outline' }, // Using 'bed' as proxy for furniture
            { id: '2', name: 'Bedroom Furniture', icon: 'file-tray-full-outline' },
            { id: '3', name: 'Dining Room', icon: 'restaurant-outline' },
            { id: '4', name: 'Office Furniture', icon: 'briefcase-outline' },
        ]
    },
    {
        title: 'Electronics & Gadgets',
        items: [
            { id: '5', name: 'Media Chests', icon: 'desktop-outline' },
            { id: '6', name: 'Entertainment', icon: 'game-controller-outline' },
            { id: '7', name: 'Storage Units', icon: 'cube-outline' }, // 'cube' for storage
            { id: '8', name: 'Lighting', icon: 'bulb-outline' },
        ]
    }
];

export default function CategoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const isAllCategories = id === 'all';
    const categoryName = isAllCategories ? 'All Categories' : (CATEGORIES.find(c => c.id === id)?.name || 'Category');

    // Filter products (mock logic for specific category view)
    const categoryProducts = PRODUCTS.filter(p => p.category === categoryName);

    return (
        <SafeAreaView style={styles.safeArea}>
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
                            />
                            {!isAllCategories && (
                                <TouchableOpacity>
                                    <Ionicons name="camera-outline" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            )}
                        </View>
                        {!isAllCategories && (
                            <TouchableOpacity style={styles.filterBtn}>
                                <Ionicons name="options-outline" size={20} color="#4A55A2" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isAllCategories ? (
                        /* ALL CATEGORIES LAYOUT */
                        <View style={styles.allCatsContainer}>
                            {ALL_CATEGORIES_DATA.map((section, index) => (
                                <View key={index} style={styles.sectionWrapper}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <View style={styles.gridContainer}>
                                        {section.items.map((item) => (
                                            <TouchableOpacity key={item.id} style={styles.gridCard}>
                                                <View style={styles.iconCircle}>
                                                    <Ionicons name={item.icon as any} size={24} color="#4A55A2" />
                                                </View>
                                                <Text style={styles.cardText}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        /* SINGLE CATEGORY PRODUCT GRID LAYOUT */
                        <View style={styles.productGridSection}>
                            {/* Sort Tabs */}
                            <View style={styles.tabsRow}>
                                <TouchableOpacity style={styles.activeTab}>
                                    <Ionicons name="caret-up" size={12} color="#4A55A2" />
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
        color: '#4A55A2',
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
        backgroundColor: '#4A55A2',
        borderRadius: 20,
    },
    goHomeText: {
        color: '#FFFFFF',
        fontWeight: '600',
    }
});
