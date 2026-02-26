import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHotelById } from '../../../../src/data/hotels';

const { width, height } = Dimensions.get('window');

export default function HotelDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const hotel = getHotelById(id as string);
    const [activeImage, setActiveImage] = useState(0);

    if (!hotel) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="bed-outline" size={64} color="#D1D5DB" />
                    <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 16 }}>Hotel not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                        <Text style={{ color: '#4A55A2', fontWeight: '600' }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Hero Image */}
            <View style={styles.heroContainer}>
                <Image source={{ uri: hotel.images[activeImage] || hotel.images[0] }} style={styles.heroImage} />

                {/* Overlay Header */}
                <SafeAreaView style={styles.headerOverlay} edges={['top']}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="share-social-outline" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="heart-outline" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {hotel.images.map((_, i) => (
                        <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                            <View style={[styles.dot, i === activeImage && styles.activeDot]} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Content Sheet */}
            <View style={styles.contentSheet}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header Info */}
                    <View style={styles.titleSection}>
                        <Text style={styles.price}>Tsh. {hotel.priceLabel}</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.actionBtnSmall}>
                                <Ionicons name="heart-outline" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtnSmall}>
                                <Ionicons name="share-social-outline" size={20} color="#1F2937" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Rating & Location */}
                    <View style={styles.metaRow}>
                        <View style={styles.ratingBox}>
                            {Array.from({ length: Math.floor(hotel.rating) }, (_, i) => (
                                <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                            ))}
                            {hotel.rating % 1 > 0 && <Ionicons name="star-half" size={14} color="#F59E0B" />}
                        </View>
                        <Text style={styles.reviewCount}>{hotel.reviews.toLocaleString()} reviews</Text>
                        <View style={styles.dotSeparator} />
                        <Ionicons name="location" size={14} color="#4A55A2" />
                        <Text style={styles.location}>{hotel.location}, {hotel.city}</Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>
                        {hotel.description}
                    </Text>

                    {/* Amenities */}
                    <Text style={styles.amenitiesTitle}>Amenities</Text>
                    <View style={styles.amenitiesRow}>
                        {hotel.amenities.map((a, i) => (
                            <View key={i} style={styles.amenityChip}>
                                <Ionicons
                                    name={getAmenityIcon(a)}
                                    size={16}
                                    color="#4A55A2"
                                />
                                <Text style={styles.amenityText}>{a}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Map Placeholder */}
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="map-outline" size={32} color="#9CA3AF" />
                        <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Map View</Text>
                    </View>

                </ScrollView>

                {/* Footer Action */}
                <SafeAreaView edges={['bottom']} style={styles.footer}>
                    <View style={styles.footerContent}>
                        <View>
                            <Text style={styles.footerPrice}>Tsh. {hotel.priceLabel}</Text>
                            <Text style={styles.footerPeriod}>per {hotel.pricePeriod === 'nightly' ? 'night' : 'month'}</Text>
                        </View>
                        <TouchableOpacity style={styles.bookButton}>
                            <Text style={styles.bookButtonText}>Book Now</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}

function getAmenityIcon(name: string): any {
    const map: Record<string, string> = {
        'Pool': 'water-outline',
        'Spa': 'flower-outline',
        'Restaurant': 'restaurant-outline',
        'WiFi': 'wifi-outline',
        'Gym': 'barbell-outline',
        'Bar': 'wine-outline',
        'Beach': 'umbrella-outline',
        'Parking': 'car-outline',
        'Conference': 'people-outline',
        'Marina': 'boat-outline',
        'Shopping': 'bag-outline',
        'Rooftop Bar': 'wine-outline',
    };
    return map[name] || 'checkmark-circle-outline';
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    heroContainer: {
        height: height * 0.42,
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    pagination: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
        backgroundColor: '#FFFFFF',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    contentSheet: {
        flex: 1,
        marginTop: -30,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    titleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A55A2',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionBtnSmall: {
        padding: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 6,
    },
    ratingBox: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    dotSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
    },
    location: {
        fontSize: 14,
        color: '#6B7280',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#4B5563',
        marginBottom: 24,
    },
    amenitiesTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    amenitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    amenityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
    },
    amenityText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4A55A2',
    },
    mapPlaceholder: {
        height: 180,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A55A2',
    },
    footerPeriod: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    bookButton: {
        backgroundColor: '#4A55A2',
        height: 52,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#4A55A2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    bookButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});
