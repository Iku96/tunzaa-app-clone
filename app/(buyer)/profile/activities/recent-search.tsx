import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecentSearchScreen() {
    const router = useRouter();

    const mockSearches = [
        { id: '1', name: 'Julia Mneno', joined: '', verified: false, image: 'https://i.pravatar.cc/150?u=1' },
        { id: '2', name: 'Vodacom Shop', joined: 'Joined November 2021', verified: true, image: 'https://1000logos.net/wp-content/uploads/2021/04/Vodacom-logo.png' },
        { id: '3', name: 'Julia Mwema', joined: 'Joined November 2021', verified: true, image: 'https://i.pravatar.cc/150?u=3' },
        { id: '4', name: 'Julia Mwema', joined: 'Joined November 2021', verified: true, image: 'https://i.pravatar.cc/150?u=4' },
        { id: '5', name: 'Julia Mwema', joined: 'Joined November 2021', verified: true, image: 'https://i.pravatar.cc/150?u=5' },
    ];

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
                <TouchableOpacity>
                    <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {mockSearches.map((search) => (
                    <View key={search.id} style={styles.searchItem}>
                        <Image source={{ uri: search.image }} style={styles.avatar} />
                        <View style={styles.infoContainer}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name}>{search.name}</Text>
                                {search.verified && (
                                    <View style={styles.verifiedBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
                                        <Text style={styles.verifiedText}>Verified</Text>
                                    </View>
                                )}
                            </View>
                            {search.joined !== '' && (
                                <Text style={styles.joinedText}>{search.joined}</Text>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
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
});
