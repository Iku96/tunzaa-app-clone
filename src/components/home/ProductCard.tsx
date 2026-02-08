import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ProductCardProps {
    id: string;
    image: string | null;
    title: string;
    price: number;
    originalPrice?: number;
    rating?: number;
}

export default function ProductCard({ id, image, title, price, originalPrice, rating = 4.5 }: ProductCardProps) {
    const router = useRouter();

    const handlePress = () => {
        // router.push(`/product/${id}`); // Future implementation
        console.log('Product pressed:', id);
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: image || 'https://via.placeholder.com/150' }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>

                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text style={styles.ratingText}>{rating}</Text>
                </View>

                <Text style={styles.price}>Tsh {price.toLocaleString()}</Text>
                {originalPrice && (
                    <Text style={styles.originalPrice}>Tsh {originalPrice.toLocaleString()}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 160,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginRight: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    imageContainer: {
        width: '100%',
        height: 140,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        marginBottom: 8,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    details: {
        gap: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        height: 40,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        color: '#6B7280',
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    originalPrice: {
        fontSize: 12,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
});
