import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchHistoryStore, SearchHistoryItem } from '../../../src/stores/searchHistory';

const { width } = Dimensions.get('window');

const SearchItem = ({ item, onRemove }: { item: SearchHistoryItem; onRemove: (id: string) => void }) => {
    const router = useRouter();

    const handlePress = () => {
        if (item.type === 'shop') {
            router.push(`/(buyer)/shop/${item.id}` as any);
        } else if (item.type === 'product') {
            router.push(`/(buyer)/product/${item.id}` as any);
        }
    };

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={handlePress} activeOpacity={0.7}>
            <View style={styles.itemLeft}>
                <View style={styles.avatarContainer}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name={item.type === 'shop' ? 'storefront' : 'person'} size={24} color="#9CA3AF" />
                        </View>
                    )}
                </View>
                <View style={styles.itemInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.isVerified && (
                            <Ionicons name="checkmark-circle" size={16} color="#425BA4" style={styles.verifiedBadge} />
                        )}
                        {item.isVerified && (
                            <Text style={styles.verifiedText}>Verified</Text>
                        )}
                    </View>
                    
                    {item.location && (
                        <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={14} color="#D1D5DB" style={styles.metaIcon} />
                            <Text style={styles.metaText}>{item.location}</Text>
                        </View>
                    )}
                    
                    {item.joinedDate && (
                        <View style={styles.metaRow}>
                            <Ionicons name="briefcase-outline" size={14} color="#D1D5DB" style={styles.metaIcon} />
                            <Text style={styles.metaText}>Joined {item.joinedDate}</Text>
                        </View>
                    )}
                </View>
            </View>
            <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeButton}>
                <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export default function RecentSearchesScreen() {
    const router = useRouter();
    const { history, clearAll, removeItem } = useSearchHistoryStore();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recent search</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={clearAll}>
                        <Text style={styles.clearAllText}>Clear all</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <SearchItem item={item} onRemove={removeItem} />}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={48} color="#E5E7EB" />
                            <Text style={styles.emptyText}>No recent searches</Text>
                        </View>
                    )}
                />
            </View>
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
        borderBottomColor: '#F9FAFB',
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
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    clearAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginRight: 8,
    },
    verifiedBadge: {
        marginRight: 4,
    },
    verifiedText: {
        fontSize: 12,
        color: '#425BA4',
        fontWeight: '500',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    metaIcon: {
        marginRight: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    removeButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#9CA3AF',
    },
});
