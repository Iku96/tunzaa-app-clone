import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWishlistStore } from '@/src/stores/wishlist';

const { width } = Dimensions.get('window');
// 3 columns with minimal spacing
const ITEM_SIZE = (width - 4) / 3;

export default function LikesScreen() {
    const router = useRouter();
    const { items: likedItems } = useWishlistStore();

    const renderItem = ({ item }: { item: any }) => {
        const product = item.product || item;
        
        // Handle images array or single image field
        let imageUrl = 'https://via.placeholder.com/400x400?text=No+Image';
        if (product.images && product.images.length > 0) {
            imageUrl = product.images[0].url || product.images[0];
        } else if (product.image) {
            imageUrl = product.image;
        }
        
        return (
            <TouchableOpacity 
                style={styles.imageContainer}
                onPress={() => router.push(`/(buyer)/product/${item.product_id}`)}
            >
                <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.image}
                    defaultSource={{ uri: 'https://via.placeholder.com/400x400?text=Loading...' }}
                />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Likes</Text>
                <View style={{ width: 24 }} />
            </View>

            {likedItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyText}>You haven't liked any products yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={likedItems}
                    keyExtractor={(item) => item.product_id}
                    numColumns={3}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    listContent: {
        paddingTop: 16,
    },
    imageContainer: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        margin: 1, // Small gap between grid items
        backgroundColor: '#F3F4F6',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 16,
    },
});
