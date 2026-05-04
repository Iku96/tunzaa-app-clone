import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchHistory } from '../../../../src/stores/searchHistory';

export default function RecentSearchScreen() {
    const router = useRouter();
    const { history, removeItem, clearAll } = useSearchHistory();

    const handlePress = (item: any) => {
        if (item.type === 'shop') {
            router.push(`/(buyer)/shop/${item.id}` as any);
        } else if (item.type === 'product') {
            router.push(`/(buyer)/product/${item.id}` as any);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recent search</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.clearAllRow}>
                <TouchableOpacity onPress={clearAll}>
                    <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.searchItem} onPress={() => handlePress(item)}>
                        {item.avatar ? (
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name={item.type === 'shop' ? 'storefront' : 'cube'} size={24} color="#9CA3AF" />
                            </View>
                        )}
                        <View style={styles.infoContainer}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name}>{item.name}</Text>
                                {item.isVerified && (
                                    <View style={styles.verifiedBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
                                        <Text style={styles.verifiedText}>Verified</Text>
                                    </View>
                                )}
                            </View>
                            {(item.joinedDate || item.location) && (
                                <Text style={styles.joinedText}>
                                    {[item.location, item.joinedDate ? `Joined ${item.joinedDate}` : null].filter(Boolean).join(' • ')}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                            <Ionicons name="close" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color="#E5E7EB" />
                        <Text style={styles.emptyText}>No recent searches</Text>
                    </View>
                )}
            />
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
    clearAllRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    clearAllText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 40,
    },
    searchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        marginLeft: 16,
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    name: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
        marginRight: 6,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    verifiedText: {
        fontSize: 11,
        color: '#3B82F6',
        fontWeight: '500',
        marginLeft: 2,
    },
    joinedText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    removeBtn: {
        padding: 4,
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
