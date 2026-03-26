import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterBottomSheet from './filter-bottom-sheet';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 24 padding on sides, 16 gap between = (width - 48 - 16) / 2, or just standard 2 col

// Mock Data
const PRODUCTS = [
    {
        id: '1',
        name: 'iPhone 14 Pro max',
        price: 'Tsh. 2,200,000',
        rating: 4.8,
        reviews: 136,
        image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=500&auto=format&fit=crop&q=60', // Mock iPhone image
    },
    {
        id: '2',
        name: 'iPhone 14 Pro max',
        price: 'Tsh. 2,300,500',
        rating: 4.8,
        reviews: 136,
        image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=500&auto=format&fit=crop&q=60',
    },
    {
        id: '3',
        name: 'iPhone 14 Pro max',
        price: 'Tsh. 2,300,500',
        rating: 4.8,
        reviews: 136,
        image: 'https://images.unsplash.com/photo-1434493789847-2f02bffa9b20?w=500&auto=format&fit=crop&q=60', // Mock Smartwatch
    },
    {
        id: '4',
        name: 'LED Curve',
        price: 'Tsh. 2,100,500',
        rating: 4.8,
        reviews: 136,
        image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60', // Mock TV/Monitor
    },
];

export default function BestsellersScreen() {
    const router = useRouter();
    const [activeSort, setActiveSort] = useState('Best matches');
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const handleFilterPress = () => {
        setIsFilterVisible(true);
    };

    const renderSortTabs = () => (
        <View style={styles.sortContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
                <TouchableOpacity
                    style={styles.sortTab}
                    onPress={() => setActiveSort('Best matches')}
                >
                    <Text style={[styles.sortText, activeSort === 'Best matches' && styles.activeSortText]}>
                        Best matches
                    </Text>
                    {activeSort === 'Best matches' && <Ionicons name="caret-up" size={14} color="#1F2937" style={styles.sortIcon} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sortTab}
                    onPress={() => setActiveSort('Top sales')}
                >
                    <Text style={[styles.sortText, activeSort === 'Top sales' && styles.activeSortText]}>
                        Top sales
                    </Text>
                    <Ionicons name="caret-up" size={14} color={activeSort === 'Top sales' ? "#1F2937" : "#9CA3AF"} style={styles.sortIcon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sortTab}
                    onPress={() => setActiveSort('Price')}
                >
                    <Text style={[styles.sortText, activeSort === 'Price' && styles.activeSortText]}>
                        Price
                    </Text>
                    <Ionicons name="caret-up" size={14} color={activeSort === 'Price' ? "#1F2937" : "#9CA3AF"} style={styles.sortIcon} />
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
                <Ionicons name="options-outline" size={20} color="#425BA4" />
            </TouchableOpacity>
        </View>
    );

    const renderProduct = (item: typeof PRODUCTS[0]) => (
        <View key={item.id} style={styles.card}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <TouchableOpacity style={styles.favoriteBtn}>
                    <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#F5A623" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.reviewsText}>({item.reviews})</Text>
                </View>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bestsellers</Text>
                <View style={{ width: 40 }} />
            </View>

            {renderSortTabs()}

            <ScrollView contentContainerStyle={styles.gridContainer}>
                <View style={styles.grid}>
                    {PRODUCTS.map(renderProduct)}
                </View>
            </ScrollView>

            <FilterBottomSheet
                visible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sortScroll: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
    },
    sortTab: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    sortText: {
        fontSize: 13,
        color: '#6B7280',
        marginRight: 4,
    },
    activeSortText: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    sortIcon: {
        marginTop: 2,
    },
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    gridContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH - 4, // slight adjustment for perfect fit
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: CARD_WIDTH,
        backgroundColor: '#F8FAFC',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 4,
    },
    cardContent: {
        padding: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingText: {
        fontSize: 11,
        color: '#4B5563',
        marginLeft: 4,
    },
    reviewsText: {
        fontSize: 11,
        color: '#9CA3AF',
        marginLeft: 2,
    },
    productName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    price: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '600',
    },
});
