import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { PRODUCTS, CATEGORIES } from '../../src/data/products';
import PriceTag from '../../src/components/common/PriceTag';

const { width } = Dimensions.get('window');

const BottomNav = () => {
    const router = useRouter();
    return (
        <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => { }}>
                <Ionicons name="home" size={24} color="#FFFFFF" />
                <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/cart/summary')}>
                <Ionicons name="basket-outline" size={24} color="#FFFFFF" />
                <Text style={styles.navText}>Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/cart/summary')}>
                <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
                <Text style={styles.navText}>Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="grid-outline" size={24} color="#FFFFFF" />
                <Text style={styles.navText}>Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/profile')}>
                <Ionicons name="person-outline" size={24} color="#FFFFFF" />
                <Text style={styles.navText}>Account</Text>
            </TouchableOpacity>
        </View>
    );
};

export default function BuyerHome() {
    const { user, profile } = useAuth();
    const router = useRouter();

    // Logic to determine display name and image
    // Priority: Profile (DB) -> User Metadata (Google/Auth) -> Placeholder
    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'User';
    // For image, valid URL -> Google/Auth URL -> UI Avatars
    const displayImage = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || `https://ui-avatars.com/api/?name=${displayName}&background=eff6ff&color=4A55A2`;

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
                <SafeAreaView edges={['top']}>
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
                        <TouchableOpacity style={styles.notifButton}>
                            <Ionicons name="notifications" size={24} color="#FBBF24" />
                        </TouchableOpacity>
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
            >
                {/* Promo Banner - Overlapping slightly or just below with spacing */}
                <View style={styles.bannerContainer}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerText}>UP TO 80% OFF</Text>
                    </View>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1598327770691-7f0ad7d76b16?w=500&auto=format&fit=crop&q=60' }}
                        style={styles.bannerImage}
                        resizeMode="contain"
                    />
                    <View style={styles.bannerDecor} />
                </View>

                {/* Categories */}
                <View style={styles.categoriesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <TouchableOpacity onPress={() => router.push('/(buyer)/category/all')}>
                            <Text style={styles.seeAll}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map((cat, index) => (
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
                </View>

                {/* Recommended */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended for You</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.recommendedGrid}>
                        {PRODUCTS.map(product => (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.productCard}
                                onPress={() => handleProductPress(product.id)}
                            >
                                <View style={styles.productImageContainer}>
                                    <Image source={{ uri: product.image }} style={styles.productImage} />
                                    <TouchableOpacity style={styles.heartButton}>
                                        <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productTitle} numberOfLines={1}>{product.name}</Text>
                                    <PriceTag price={product.price} size={14} bold />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

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
    notifButton: {
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
    bannerContainer: {
        marginHorizontal: 20,
        height: 160,
        borderRadius: 24,
        backgroundColor: '#6366F1',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 32, // More breathing room
        flexDirection: 'row',
        // Shadow for depth
        shadowColor: "#4A55A2",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    bannerDecor: {
        position: 'absolute',
        top: -60,
        right: -40,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    bannerContent: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    bannerText: {
        fontSize: 32, // Larger, more impactful
        fontWeight: '900',
        color: '#FFFFFF',
        width: 180,
        lineHeight: 38,
    },
    bannerImage: {
        width: 160,
        height: 180,
        position: 'absolute',
        right: 0,
        bottom: 0,
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
    // Bottom Nav Styles
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90, // Taller
        backgroundColor: '#4A55A2',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start', // Icons top aligned
        paddingTop: 16, // Push icons down slightly
        borderTopLeftRadius: 30, // More curve
        borderTopRightRadius: 30,
        // Shadow to separate from content if overlapping
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 20,
    },
    navItem: {
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
    },
    navText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    }
});
