import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Mock data lookup (would normally call API)
const GET_HOTEL = (id: string) => {
    return {
        id,
        name: 'Serena Hotel',
        location: 'Goba, Dar es salaam',
        price: '35,000',
        rating: 4.5,
        reviews: 3278,
        description: 'Armani Hotel Dubai is a luxurious 5-star hotel located within the iconic Burj Khalifa, occupying floors concourse... Read More',
        images: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&fit=crop', // Big Hero
            'https://images.unsplash.com/photo-1571896349842-6e5a51335022?w=500&fit=crop',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&fit=crop',
        ]
    };
};

export default function HotelDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const hotel = GET_HOTEL(id as string);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Hero Image Swiper (Static for now) */}
            <View style={styles.heroContainer}>
                <Image source={{ uri: hotel.images[0] }} style={styles.heroImage} />

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

                {/* Pagination Dots (Mock) */}
                <View style={styles.pagination}>
                    <View style={[styles.dot, styles.activeDot]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>

            {/* Content Sheet */}
            <View style={styles.contentSheet}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header Info */}
                    <View style={styles.titleSection}>
                        <Text style={styles.price}>Tsh. {hotel.price}</Text>
                        <View style={styles.actions}>
                            {/* Actions moved to top header in design? Screenshot 2 shows Price large, then heart/share small next to it? 
                               Actually screenshot 2 shows Price on the left, heart/share on the right IN THE WHITE CARD.
                            */}
                            <TouchableOpacity style={styles.actionBtnSmall}>
                                <Ionicons name="heart" size={20} color="#E5E7EB" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtnSmall}>
                                <Ionicons name="share-social-outline" size={20} color="#1F2937" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Meta */}
                    <View style={styles.metaRow}>
                        <View style={styles.ratingBox}>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Ionicons name="star-half" size={14} color="#F59E0B" />
                        </View>
                        <Text style={styles.reviewCount}>{hotel.reviews} reviews</Text>
                        <View style={styles.dotSeparator} />
                        <Text style={styles.location}>{hotel.location}</Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>
                        {hotel.description} <Text style={styles.readMore}>Read More</Text>
                    </Text>

                    {/* Amenities / Map / Etc (Placeholder) */}
                    <View style={{ height: 200, backgroundColor: '#F3F4F6', borderRadius: 16, marginTop: 24, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#9CA3AF' }}>Map View Placeholder</Text>
                    </View>

                </ScrollView>

                {/* Footer Action */}
                <SafeAreaView edges={['bottom']} style={styles.footer}>
                    <TouchableOpacity style={styles.bookButton}>
                        <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    heroContainer: {
        height: height * 0.45,
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
        bottom: 40, // Above the sheet
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
        transform: [{ translateY: -1 }], // alignment fix
    },
    contentSheet: {
        flex: 1,
        marginTop: -30, // Overlap
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
        gap: 8,
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
    },
    readMore: {
        color: '#4A55A2',
        fontWeight: '600',
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
    bookButton: {
        backgroundColor: '#4A55A2',
        height: 56,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});
