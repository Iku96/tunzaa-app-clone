import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useMarketplace } from '../../src/hooks/useMarketplace';
import PriceTag from '../../src/components/common/PriceTag';
import PromoBannerCarousel from '../../src/components/home/PromoBannerCarousel';
import { useBanners } from '../../src/services/tenant';
import ProductCardVertical from '../../src/components/product/ProductCardVertical';

const { width } = Dimensions.get('window');

import BottomNav from '../../src/components/navigation/BottomNav';

export default function BuyerHome() {
    const { user } = useTunzaaAuth();
    const router = useRouter();
    const { products, categories, loading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useMarketplace();
    const { data: banners, isLoading: bannersLoading } = useBanners();

    // User display info from Tunzaa auth
    const displayName = user
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
        : 'User';
    const displayImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=4A55A2`;

    const handleProductPress = (id: string) => {
        router.push(`/(buyer)/product/${id}`);
    };

    const handleCategoryPress = (id: string) => {
        router.push(`/(buyer)/category/${id}`);
    };

    const handleSearchPress = () => {
        router.push('/(buyer)/search/all');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A55A2" />

            {/* Extended Blue Header */}
            <View style={styles.headerContainer}>
                <SafeAreaView>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.userInfo} onPress={() => router.push('/(buyer)/profile')}>
                            <Image
                                source={{ uri: displayImage }}
                                style={styles.avatar}
                            />
                            <View>
                                <Text style={styles.greeting}>Welcome</Text>
                                <Text style={styles.userName}>{displayName} 👋</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.headerIcons}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(buyer)/chat')}>
                                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(buyer)/notifications')}>
                                <Ionicons name="notifications" size={24} color="#FBBF24" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar - Positioned just below profile inside the blue area */}
                    <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress} activeOpacity={0.9}>
                        <Ionicons name="search-outline" size={20} color="#6B7280" />
                        <Text style={styles.searchPlaceholder}>Search for products and services</Text>
                        <View style={{ flex: 1 }} />
                        <Ionicons name="camera-outline" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
                scrollEventThrottle={400}
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const paddingToBottom = 200;
                    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }
                }}
            >
                {/* Promo Banner Carousel */}
                <PromoBannerCarousel banners={banners} loading={bannersLoading} />

                {/* Categories */}
                <View style={styles.categoriesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <TouchableOpacity onPress={() => router.push('/(buyer)/category/all')}>
                            <Text style={styles.seeAll}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {loading && categories.length === 0 ? (
                        <ActivityIndicator size="small" color="#4A55A2" style={{ padding: 20 }} />
                    ) : (
                        <View style={styles.categoriesGrid}>
                            {categories.map((cat, index) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={styles.categoryItem}
                                    onPress={() => handleCategoryPress(cat.id)}
                                >
                                    <View style={[styles.categoryIconCircle, { backgroundColor: index % 2 === 0 ? '#EFF6FF' : '#F3F4F6' }]}>
                                        <Ionicons name={cat.icon as any} size={22} color="#4A55A2" />
                                    </View>
                                    <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Recommended */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended for You</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {loading && products.length === 0 ? (
                        <ActivityIndicator size="large" color="#4A55A2" style={{ padding: 40 }} />
                    ) : products.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: '#6B7280', fontSize: 14 }}>No products available yet.</Text>
                        </View>
                    ) : (
                        <View style={styles.recommendedGrid}>
                            {products.map(product => (
                                <View key={product.id} style={styles.productCard}>
                                    <ProductCardVertical product={product} />
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {isFetchingNextPage && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#4A55A2" />
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        backgroundColor: '#4A55A2',
        paddingHorizontal: 20,
        paddingBottom: 30, // Increased padding bottom for spacious feel
        borderBottomLeftRadius: 32, // More rounded
        borderBottomRightRadius: 32,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24, // Spacing between profile and search
        marginTop: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48, // Slightly larger
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#818CF8',
    },
    greeting: {
        fontSize: 13,
        color: '#E0E7FF',
        fontWeight: '500',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16, // Softer radius
        paddingHorizontal: 16,
        height: 52, // Taller touch target
        gap: 12,
        // Optional internal shadow or distinct feel
    },
    searchPlaceholder: {
        color: '#6B7280',
        fontSize: 15,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingTop: 24, // Spacing from header
        paddingBottom: 110,
    },

    categoriesSection: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20, // Larger title
        fontWeight: 'bold',
        color: '#1F2937',
    },
    seeAll: {
        fontSize: 14,
        color: '#4A55A2',
        fontWeight: '600',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 24,
    },
    categoryItem: {
        width: '18%', // 5 columns
        alignItems: 'center',
        gap: 8,
    },
    categoryIconCircle: {
        width: 56, // Larger touch target
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryName: {
        fontSize: 12,
        color: '#374151',
        textAlign: 'center',
        fontWeight: '500',
    },
    sectionContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    recommendedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    productCard: {
        width: (width - 56) / 2, // 2 column grid
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 8,
        paddingBottom: 8,
    },
    productImageContainer: {
        width: '100%',
        height: 160, // Taller images
        borderRadius: 20, // Match card radius
        backgroundColor: '#F3F4F6',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heartButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 6,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productInfo: {
        gap: 6,
        paddingHorizontal: 4,
    },
    productTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
});
