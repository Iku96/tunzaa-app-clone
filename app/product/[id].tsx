import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (id) {
            fetchProductDetails(id as string);
        }
    }, [id]);

    const fetchProductDetails = async (productId: string) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    profiles:merchant_id (
                        full_name,
                        business_name,
                        avatar_url
                    )
                `)
                .eq('id', productId)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            // alert('Error loading product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        // Implement cart logic here
        alert('Added to cart (Demo)');
    };

    const handleBuyNow = () => {
        // Implement checkout flow
        alert('Proceeding to checkout (Demo)');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#425BA4" />
            </View>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Text>Product not found</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ color: '#425BA4', marginTop: 10 }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const merchantName = product.profiles?.business_name || product.profiles?.full_name || 'Merchant';

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header with Back Button (Overlay) */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.overlayBackButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: product.image_url || 'https://via.placeholder.com/400' }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.category}>{product.category}</Text>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#F59E0B" />
                            <Text style={styles.ratingText}>4.8</Text>
                        </View>
                    </View>

                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>Tsh {product.price?.toLocaleString()}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Maelezo</Text>
                    <Text style={styles.description}>{product.description || 'No description available.'}</Text>

                    <View style={styles.divider} />

                    <View style={styles.merchantRow}>
                        <View style={styles.merchantInfo}>
                            <View style={styles.merchantAvatar}>
                                <Text style={styles.merchantInitial}>{merchantName.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.merchantLabel}>Muuzaji</Text>
                                <Text style={styles.merchantName}>{merchantName}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.chatButton}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#425BA4" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                        <Ionicons name="remove" size={20} color="#4B5563" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => setQuantity(quantity + 1)}
                    >
                        <Ionicons name="add" size={20} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
                        <Ionicons name="cart-outline" size={24} color="#425BA4" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
                        <Text style={styles.buyButtonText}>Nunua Sasa</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    overlayBackButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsContainer: {
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        backgroundColor: '#FFFFFF',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    category: {
        fontSize: 14,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#D97706',
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: '#425BA4',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
    },
    merchantRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    merchantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    merchantAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    merchantInitial: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    merchantLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    merchantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    chatButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        padding: 4,
    },
    qtyButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        width: 30,
        textAlign: 'center',
    },
    actionButtons: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
    },
    cartButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyButton: {
        flex: 1,
        height: 50,
        backgroundColor: '#425BA4',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
