import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Star, Trash2, Plus, Minus } from 'lucide-react-native';

export default function WishlistAnalyticsScreen() {
    const router = useRouter();

    // New account: starts with zero data
    const wishlistedItems: any[] = [];

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Heart size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No wishlisted items</Text>
            <Text style={styles.emptySubtitle}>Products customers save for later will appear here.</Text>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.productCard}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            
            <View style={styles.productInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Heart size={20} color="#EF4444" fill="#EF4444" />
                </View>
                
                <View style={styles.ratingRow}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
                </View>
                
                <View style={styles.priceRow}>
                    <Text style={styles.priceText}>Tsh {item.price.toLocaleString()}</Text>
                    
                    <View style={styles.quantityControls}>
                        <TouchableOpacity style={styles.qtyBtn}>
                            <Trash2 size={16} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>1</Text>
                        <TouchableOpacity style={[styles.qtyBtn, styles.plusBtn]}>
                            <Plus size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <TouchableOpacity style={styles.buyNowBtn}>
                    <Text style={styles.buyNowText}>Promote This Item</Text>
                </TouchableOpacity>

                <View style={styles.analyticsBadge}>
                    <Text style={styles.analyticsText}>{item.wishlistCount} people wishlisted this</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Most Wishlisted</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.subHeader}>
                <Text style={styles.subHeaderText}>Items customers have wishlisted</Text>
            </View>

            <FlatList
                data={wishlistedItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    subHeader: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '400',
    },
    listContent: {
        paddingHorizontal: 16,
        gap: 16,
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        padding: 4,
        gap: 8,
    },
    qtyBtn: {
        padding: 4,
    },
    plusBtn: {
        backgroundColor: '#425BA4',
        borderRadius: 12,
    },
    qtyText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    buyNowBtn: {
        backgroundColor: '#425BA4',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    buyNowText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    analyticsBadge: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    analyticsText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    }
});
