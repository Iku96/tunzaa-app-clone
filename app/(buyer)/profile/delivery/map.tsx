import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
// Note: In a real app we'd use react-native-maps. 
// For this UI mockup, we'll use a static map background or a styled placeholder.

const { width } = Dimensions.get('window');

export default function PinLocationScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const results = [
        { id: '1', name: 'Kijitonyama shule', area: 'Dar es salaam, Tanzania', distance: '1.1km' },
        { id: '2', name: 'Kijitonyama shule', area: 'Dar es salaam, Tanzania', distance: '1.1km' },
    ];

    const confirmAddress = () => {
        // Mock returning the address to the previous screen
        router.push({
            pathname: '/(buyer)/profile/delivery/address',
            params: { address: '772M+VJX Shoppers Plaza Masaki, Dar Es Salaam, TZ' }
        });
    };

    return (
        <View style={styles.container}>
            {/* Map Placeholder */}
            <View style={styles.mapPlaceholder}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f67c07a?w=800&h=1200' }}
                    style={styles.mapImage}
                    resizeMode="cover"
                />

                {/* Floating Pin */}
                <View style={styles.pinContainer}>
                    <View style={styles.pinPulse} />
                    <Ionicons name="location" size={40} color="#425BA4" />
                </View>
            </View>

            <SafeAreaView style={styles.overlay} edges={['top']}>
                {/* Header / Search */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="kijitonyama"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Search Results Dropdown (if searching) */}
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsHeader}>Result for "Kijitonyama"</Text>
                    <Text style={styles.resultsCount}>{results.length} Found</Text>

                    {results.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.resultItem}>
                            <View style={styles.resultIconBox}>
                                <Ionicons name="location-outline" size={20} color="#4B5563" />
                            </View>
                            <View style={styles.resultInfo}>
                                <Text style={styles.resultName}>{item.name}</Text>
                                <Text style={styles.resultArea}>{item.area}</Text>
                            </View>
                            <Text style={styles.resultDistance}>{item.distance}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer UI */}
                <View style={styles.footer}>
                    <View style={styles.addressInfoCard}>
                        <View style={styles.addressIconBox}>
                            <Ionicons name="location" size={20} color="#425BA4" />
                        </View>
                        <Text style={styles.addressText} numberOfLines={1}>
                            772M+VJX Shoppers Plaza Masaki, Dar Es Salaam, TZ
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.confirmButton} onPress={confirmAddress}>
                        <Text style={styles.confirmButtonText}>Confirm Address</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Map Controls */}
            <View style={styles.mapControls}>
                <TouchableOpacity style={styles.controlBtn}>
                    <Ionicons name="add" size={24} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn}>
                    <Ionicons name="remove" size={24} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlBtn, { marginTop: 12 }]}>
                    <Ionicons name="navigate-outline" size={20} color="#4B5563" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    mapPlaceholder: {
        ...StyleSheet.absoluteFillObject,
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    pinContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinPulse: {
        position: 'absolute',
        bottom: 4,
        width: 12,
        height: 6,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    overlay: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#1A1A1A',
    },
    resultsContainer: {
        marginHorizontal: 20,
        marginTop: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    resultsHeader: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    resultsCount: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 16,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    resultIconBox: {
        marginRight: 12,
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    resultArea: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    resultDistance: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    footer: {
        position: 'absolute',
        bottom: 34,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    addressInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    addressIconBox: {
        marginRight: 12,
    },
    addressText: {
        fontSize: 13,
        color: '#4B5563',
        flex: 1,
    },
    confirmButton: {
        backgroundColor: '#425BA4',
        borderRadius: 30,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#425BA4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mapControls: {
        position: 'absolute',
        right: 20,
        top: '50%',
        marginTop: 40,
    },
    controlBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
});
