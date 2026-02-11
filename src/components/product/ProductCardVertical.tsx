import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../data/products';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 2; // 20px padding * 2 + 16px gap

interface ProductCardVerticalProps {
    product: Product;
}

export default function ProductCardVertical({ product }: ProductCardVerticalProps) {
    const router = useRouter();

    const handlePress = () => {
        router.push(`/(buyer)/product/${product.id}`);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />

                {/* Heart Icon - Top Right */}
                <TouchableOpacity style={styles.heartButton}>
                    <Ionicons name="heart-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Pagination Dots - Bottom Center */}
                <View style={styles.paginationDots}>
                    <View style={[styles.dot, styles.activeDot]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.ratingText}>{product.rating} ({product.reviews})</Text>
                </View>

                <Text style={styles.title} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.price}>Tsh. {new Intl.NumberFormat('en-US').format(product.price)}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginBottom: 24,
    },
    imageContainer: {
        width: '100%',
        height: 170, // Slightly shorter to match square-ish look
        borderRadius: 24, // More rounded
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 12,
    },
    image: {
        width: '85%',
        height: '85%',
    },
    heartButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.6)', // Slightly transparent or white
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        // No shadow in screenshot, looks flat or very subtle
    },
    paginationDots: {
        position: 'absolute',
        bottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#DBEAFE', // Light blue/gray inactive
    },
    activeDot: {
        backgroundColor: '#1E3A8A', // Darker blue active
        width: 20, // Pill shape
        height: 6,
    },
    details: {
        gap: 4,
        paddingHorizontal: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    ratingText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    title: {
        fontSize: 15, // Not too large
        fontWeight: 'bold',
        color: '#1F2937',
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E3A8A', // Deep blue
        marginTop: 2,
    }
});
