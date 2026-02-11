import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
// Extending mock data locally to match the specific screenshot details if needed, 
// or mapping existing PRODUCTS to match the visual. 
import { PRODUCTS } from '../../../src/data/products';

// Helper to format price
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
};

// Custom Product Card for Search Result to match the screenshot exactly
const SearchProductCard = ({ product }: { product: typeof PRODUCTS[0] }) => {
    const router = useRouter();
    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => router.push(`/(buyer)/product/${product.id}`)}
            activeOpacity={0.8}
        >
            <View style={styles.cardImageWrapper}>
                <Image source={{ uri: product.image }} style={styles.cardImage} />
                {/* No heart icon in this specific screenshot card view, but can keep if desired. Screenshot doesn't show it clearly on the card itself, usually top right. Leaving out for exact match or keeping subtle. Expected: Clean image on left. */}
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{product.name}</Text>
                </View>

                <Text style={styles.cardPrice}>Tsh. {formatPrice(product.price)}</Text>

                <Text style={styles.cardSpecs} numberOfLines={2}>
                    Specification: {product.specs ? product.specs.join(', ') : 'Water resistant, Accelerometer, Display: 44mm...'}
                </Text>

                <View style={styles.vendorContainer}>
                    {/* Vendor Logo Placeholder/Icon */}
                    <View style={styles.vendorLogo}>
                        {product.vendor.name.includes('VODACOM') ? (
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 8 }}>M</Text> // Mocking M-Pesa logo color
                        ) : (
                            <Ionicons name="business" size={12} color="#FFFFFF" />
                        )}
                    </View>

                    <View style={styles.vendorInfo}>
                        <Text style={styles.vendorName}>{product.vendor.name}</Text>
                        <Text style={styles.vendorMeta}>Supplier since 2024</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={10} color="#4A55A2" />
                            <Text style={styles.locationText}>{product.vendor.location}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function SearchScreen() {
    const { query } = useLocalSearchParams();
    const router = useRouter();
    const [searchText, setSearchText] = useState(query as string || '');
    const [filterVisible, setFilterVisible] = useState(false);

    // Filter logic
    const results = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.category.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#1F2937" />
                        <TextInput
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Smart watch" // Matches screenshot
                            placeholderTextColor="#9CA3AF"
                            style={styles.searchInput}
                        />
                        <TouchableOpacity>
                            <Ionicons name="camera-outline" size={22} color="#1F2937" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
                        <Ionicons name="options-outline" size={20} color="#4A55A2" />
                    </TouchableOpacity>
                </View>

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

                {/* Results List */}
                <FlatList
                    data={results}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <SearchProductCard product={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No results found found.</Text>
                        </View>
                    }
                />
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 8,
        gap: 12,
    },
    backButton: {
        paddingRight: 4,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // Light gray
        borderRadius: 16, // Pill shape/Rounded
        paddingHorizontal: 16,
        height: 52, // Taller
        gap: 10,
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
        backgroundColor: '#F3F4F6', // Same gray
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: 30, // Identifying spacing from screenshot
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
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    emptyState: {
        paddingTop: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
    },

    // Card Styles
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Slight shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    cardImageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardImage: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
    },
    cardDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '500', // Regular/Medium matches screenshot better than Bold
        color: '#1F2937',
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4A55A2',
        marginBottom: 6,
    },
    cardSpecs: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 12,
        lineHeight: 16,
    },
    vendorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 8,
    },
    vendorLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'red', // Mocking branding color from screenshot (red circular logo)
        alignItems: 'center',
        justifyContent: 'center',
    },
    vendorInfo: {
        flex: 1,
    },
    vendorName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    vendorMeta: {
        fontSize: 9,
        color: '#6B7280',
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    locationText: {
        fontSize: 9,
        color: '#4B5563',
    }
});
