import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, MapPin, Calendar, Search } from 'lucide-react-native';

export default function RecentSearchScreen() {
    const router = useRouter();
    
    // Mock data for new merchant - starts empty
    const [searches, setSearches] = useState<any[]>([]);

    const handleClearAll = () => {
        setSearches([]);
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.searchIconBg}>
                <Search size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No recent searches</Text>
            <Text style={styles.emptyText}>When you search for people or businesses, they will appear here.</Text>
        </View>
    );

    const renderSearchItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.searchItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.itemInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.userName}>{item.name}</Text>
                    {item.verified && (
                        <>
                            <CheckCircle2 size={14} color="#10B981" style={{ marginLeft: 4 }} />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </>
                    )}
                </View>
                {item.location && (
                    <View style={styles.detailRow}>
                        <MapPin size={12} color="#9CA3AF" />
                        <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                )}
                {item.joined && (
                    <View style={styles.detailRow}>
                        <Calendar size={12} color="#9CA3AF" />
                        <Text style={styles.detailText}>Joined {item.joined}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recent search</Text>
                <View style={{ width: 44 }} />
            </View>

            {searches.length > 0 && (
                <View style={styles.listHeader}>
                    <TouchableOpacity onPress={handleClearAll}>
                        <Text style={styles.clearAllText}>Clear all</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={searches}
                renderItem={renderSearchItem}
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
    listHeader: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'flex-end',
    },
    clearAllText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 16,
        flexGrow: 1,
    },
    searchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 16,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    verifiedText: {
        fontSize: 12,
        color: '#425BA4',
        marginLeft: 2,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        gap: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 100,
    },
    searchIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    }
});
