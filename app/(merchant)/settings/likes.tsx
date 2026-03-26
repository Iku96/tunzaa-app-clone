import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Layers, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

export default function LikesAnalyticsScreen() {
    const router = useRouter();

    // New account: starts with zero data
    const likedPosts: any[] = [];

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Heart size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No likes yet</Text>
            <Text style={styles.emptySubtitle}>Posts that customers like will appear here.</Text>
        </View>
    );

    const renderGridItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => router.push({
                pathname: '/(merchant)/view-post',
                params: { postId: item.id }
            })}
        >
            <Image source={{ uri: item.image }} style={styles.gridImage} />
            
            {item.isMultiple && (
                <View style={styles.multipleBadge}>
                    <Layers size={14} color="#FFFFFF" />
                </View>
            )}
            
            {item.isVideo && (
                <View style={styles.videoBadge}>
                    <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
                </View>
            )}

            <View style={styles.likesOverlay}>
                <Text style={styles.likesText}>{item.likes} likes</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Likes</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={likedPosts}
                renderItem={renderGridItem}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={styles.gridContent}
                ListEmptyComponent={renderEmptyState}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
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
    multipleBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    videoBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
    },
    likesOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingVertical: 2,
        alignItems: 'center',
    },
    likesText: {
        color: '#FFFFFF',
        fontSize: 10,
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
