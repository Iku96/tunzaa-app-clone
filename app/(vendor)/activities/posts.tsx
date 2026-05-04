import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useGetProducts } from '../../../src/services/products';
import { Play } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

export default function VendorPostsGridScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth() as any;

    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business') || {} as any;
    const metadata = typeof vendorProfile?.metadata === 'string' ? JSON.parse(vendorProfile.metadata) : (vendorProfile?.metadata || {});
    const vendorId = metadata?.vendor_id || vendorProfile?.profile_id;

    const { data: productsData, isLoading } = useGetProducts({ 
        vendor_id: vendorId,
        limit: 50 
    }, !!vendorId);

    const posts = useMemo(() => (productsData?.items || []).map(p => ({
        id: p.product_id,
        image: typeof p.images?.[0] === 'string' ? p.images[0] : (p.images?.[0] as any)?.url,
        isVideo: false,
    })).filter(p => !!p.image), [productsData]);

    const renderGridItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.gridItem} 
            onPress={() => router.push({
                pathname: '/(vendor)/view-post',
                params: { postId: item.id }
            })}
        >
            <Image source={{ uri: item.image }} style={styles.gridImage} />
            {item.isVideo && (
                <View style={styles.videoBadge}>
                    <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Posts</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : posts.length > 0 ? (
                <FlatList
                    data={posts}
                    renderItem={renderGridItem}
                    keyExtractor={item => item.id}
                    numColumns={3}
                    contentContainerStyle={styles.gridContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="images-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyStateTitle}>No posts yet</Text>
                    <Text style={styles.emptyStateSubtitle}>Your posts will appear here.</Text>
                </View>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContent: {
        paddingTop: 1,
    },
    gridItem: {
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH,
        padding: 1,
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    videoBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});
