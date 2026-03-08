import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// In a real app we'd use react-native-maps.
// We use a placeholder image for the map as per typical Expo bare-minimum MVP setups
// since setting up native maps requires extra config.

const { width, height } = Dimensions.get('window');

const SEARCH_RESULTS = [
    { id: '1', title: 'Kijitonyama shule', subtitle: 'Dar es salaam, Tanzania', distance: '1.2km' },
    { id: '2', title: 'Kijitonyama shule', subtitle: 'Dar es salaam, Tanzania', distance: '1.2m' }, // likely meant km in UI
];

export default function MapScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('kijitonyama');
    const [showResults, setShowResults] = useState(true);

    const handleConfirm = () => {
        // Pass the string address back to the address form screen
        router.push({
            pathname: '/(buyer)/checkout/delivery/address',
            params: { location: "172 Nda Mkojoma Road, Maki Dar Es Salaam, TZ" }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header Actions */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search area"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#D1D5DB" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Search Results */}
                {showResults && searchQuery.length > 0 && (
                    <View style={styles.resultsContainer}>
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultMatchText}>Result for "{searchQuery}"</Text>
                            <Text style={styles.resultCountText}>{SEARCH_RESULTS.length} found</Text>
                        </View>

                        {SEARCH_RESULTS.map((result) => (
                            <TouchableOpacity key={result.id} style={styles.resultItem}>
                                <View style={styles.resultIconWrapper}>
                                    <Ionicons name="location-outline" size={20} color="#6B7280" />
                                </View>
                                <View style={styles.resultTextWrapper}>
                                    <Text style={styles.resultTitle}>{result.title}</Text>
                                    <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                                </View>
                                <Text style={styles.resultDistance}>{result.distance}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Map Area */}
                <View style={styles.mapContainer}>
                    {/* Placeholder Map Image */}
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=60' }}
                        style={styles.mapImage}
                        resizeMode="cover"
                        blurRadius={1}
                    />

                    {/* Fake Map Overlays / Roads styling */}
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.7)' }]} />

                    {/* Map Pin Center */}
                    <View style={styles.centerPinContainer}>
                        <View style={styles.pinWrapper}>
                            <Ionicons name="location" size={40} color="#4A55A2" />
                            <View style={styles.pinDot} />
                        </View>
                    </View>

                    {/* Map Controls */}
                    <View style={styles.mapControls}>
                        <TouchableOpacity style={styles.controlButton}>
                            <Ionicons name="add" size={20} color="#4B5563" />
                        </TouchableOpacity>
                        <View style={styles.controlDivider} />
                        <TouchableOpacity style={styles.controlButton}>
                            <Ionicons name="remove" size={20} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.myLocationButton}>
                        <Ionicons name="navigate" size={20} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                {/* Bottom Sheet Card */}
                <View style={styles.bottomCard}>
                    <View style={styles.addressRow}>
                        <Ionicons name="location" size={22} color="#4A55A2" style={styles.addressIcon} />
                        <Text style={styles.addressText} numberOfLines={2}>
                            172 Nda Mkojoma Road, Maki Dar Es Salaam, TZ
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmButtonText}>Confirm Address</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        zIndex: 10,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
    },
    resultsContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        zIndex: 5,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        paddingBottom: 16,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultMatchText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    resultCountText: {
        fontSize: 12,
        color: '#6B7280',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    resultIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resultTextWrapper: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 2,
    },
    resultSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    resultDistance: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#E5E7EB',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    centerPinContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinWrapper: {
        alignItems: 'center',
        transform: [{ translateY: -20 }], // Adjust so tip is at center
    },
    pinDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#1E3A8A', // Darker blue base
        marginTop: -6, // overlapping base of icon
    },
    mapControls: {
        position: 'absolute',
        right: 16,
        bottom: 80, // Above bottom card area
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    controlButton: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    myLocationButton: {
        position: 'absolute',
        left: 16,
        bottom: 80,
        backgroundColor: '#FFFFFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    addressIcon: {
        marginRight: 12,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
        lineHeight: 20,
    },
    confirmButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
