import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRODUCTS } from '../../../src/data/products';
import VendorBadge from '../../../src/components/common/VendorBadge';

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Product</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Product Image */}
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />

                        {/* Pagination Pill */}
                        <View style={styles.paginationPill}>
                            <View style={[styles.dot, styles.activeDot]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        {/* Price and Actions Row */}
                        <View style={styles.priceActionsRow}>
                            <Text style={styles.price}>
                                Tsh. {new Intl.NumberFormat('en-US').format(product.price)}
                            </Text>
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Ionicons name="heart-outline" size={20} color="#6B7280" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Ionicons name="share-social-outline" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Delivery Info */}
                        <View style={styles.deliveryContainer}>
                            <View style={styles.deliveryRow}>
                                <Ionicons name="location-outline" size={16} color="#4B5563" />
                                <Text style={styles.deliveryText}>Estimated delivery Fees: <Text style={{ fontWeight: 'bold' }}>Tsh. 2,500</Text></Text>
                            </View>
                            <TouchableOpacity>
                                <Text style={styles.changeLocationText}>Change delivery location</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Two-Column Info Layout */}
                        <View style={styles.infoRow}>
                            {/* Left Column: Product Info */}
                            <View style={styles.leftInfoCol}>
                                <Text style={styles.productTitle}>{product.name}</Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={14} color="#D97706" />
                                    <Text style={styles.ratingText}>{product.rating}</Text>
                                    <View style={styles.dividerPipe} />
                                    <Text style={styles.soldText}>239 units sold</Text>
                                </View>
                            </View>

                            {/* Right Column: Vendor Info */}
                            <View style={styles.rightInfoCol}>
                                <View style={styles.vendorLogoContainer}>
                                    <Ionicons name="phone-portrait-outline" size={18} color="white" />
                                    <View style={styles.mpesaBadge}>
                                        <Text style={styles.mpesaText}>m-pesa</Text>
                                    </View>
                                </View>
                                <View style={styles.vendorDetails}>
                                    <Text style={styles.vendorName}>{product.vendor.name}</Text>
                                    <Text style={styles.vendorSub}>Supplier since 2024</Text>
                                    <View style={styles.vendorLocRow}>
                                        <Ionicons name="location-outline" size={10} color="#6B7280" />
                                        <Text style={styles.vendorLocText}>{product.vendor.location}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{ height: 100 }} />
                    </View>
                </ScrollView>

                {/* Sticky Action Bar */}
                <View style={styles.actionBar}>
                    <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => router.push({ pathname: '/(buyer)/cart/summary', params: { productId: product.id } })}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                    </TouchableOpacity>
                </View>
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
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    imageContainer: {
        width: width,
        height: height * 0.65,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    image: {
        width: '90%',
        height: '100%',
    },
    paginationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // Light gray pill
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB', // Gray-300
    },
    activeDot: {
        width: 20, // Pill shaped active dot
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1F2937', // Dark blue/black
    },
    contentContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    priceActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A55A2', // Deep Brand Blue
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        // Subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    deliveryContainer: {
        marginBottom: 24,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    deliveryText: {
        fontSize: 13,
        color: '#4B5563',
    },
    changeLocationText: {
        fontSize: 12,
        color: '#4A55A2',
        fontWeight: '500',
        marginLeft: 24, // Align with text above (icon width + gap)
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    leftInfoCol: {
        flex: 1,
        paddingRight: 12,
    },
    productTitle: {
        fontSize: 18, // "Long Sofa"
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#D97706', // Gold star color
    },
    dividerPipe: {
        width: 1,
        height: 12,
        backgroundColor: '#D1D5DB',
    },
    soldText: {
        fontSize: 13,
        fontWeight: 'normal',
        color: '#D97706',
    },
    rightInfoCol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        maxWidth: '50%',
    },
    vendorLogoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DC2626', // Brand Red
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    mpesaBadge: {
        position: 'absolute',
        bottom: 0,
        right: -2,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 3,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#DC2626',
    },
    mpesaText: {
        fontSize: 6,
        color: '#DC2626',
        fontWeight: 'bold',
    },
    vendorDetails: {
        justifyContent: 'center',
    },
    vendorName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1F2937',
        textTransform: 'uppercase',
    },
    vendorSub: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 2,
    },
    vendorLocRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    vendorLocText: {
        fontSize: 10,
        color: '#4B5563',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 20,
        paddingBottom: 40, // Safe area handling
    },
    buyButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30, // Rounded pill
        alignItems: 'center',
        // Shadow
        shadowColor: "#4A55A2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
