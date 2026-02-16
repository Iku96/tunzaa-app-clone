import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HOTELS = [
    {
        id: '1',
        name: 'Serena Hotel',
        location: 'Dar es salaam, Kinondoni B',
        price: '180,000',
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1571896349842-6e5a51335022?w=500&h=500&fit=crop',
    },
    {
        id: '2',
        name: 'Hyatt Regency',
        location: 'Dar es salaam, Posta',
        price: '250,000',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=500&fit=crop',
    },
    {
        id: '3',
        name: 'Ramada Resort',
        location: 'Dar es salaam, Mbezi',
        price: '200,000',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&h=500&fit=crop',
    },
    {
        id: '4',
        name: 'Johari Rotana',
        location: 'Dar es salaam, Posta',
        price: '300,000',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&h=500&fit=crop',
    },
];

export default function HotelListScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    {/* Search Context */}
                    <View style={styles.searchContext}>
                        <View style={styles.searchRow}>
                            <Ionicons name="location-outline" size={16} color="#4A55A2" />
                            <Text style={styles.searchText}>Dar es Salaam</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>Guests 02</Text>
                            <View style={styles.dot} />
                            <Text style={styles.metaText}>July 02 - July 12</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={20} color="#1F2937" />
                        <Text style={styles.filterText}>Filter</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {HOTELS.map((hotel) => (
                    <TouchableOpacity
                        key={hotel.id}
                        style={styles.card}
                        onPress={() => router.push(`/(buyer)/services/hotels/${hotel.id}`)}
                    >
                        {/* Image Section */}
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: hotel.image }} style={styles.image} />
                            <TouchableOpacity style={styles.heartButton}>
                                <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Details */}
                        <View style={styles.details}>
                            <Text style={styles.price}>
                                Tsh {hotel.price} <Text style={styles.period}>monthly</Text>
                            </Text>

                            <View style={styles.titleRow}>
                                <Text style={styles.name}>{hotel.name}</Text>
                                <View style={styles.rating}>
                                    <Ionicons name="star" size={12} color="#FBBF24" />
                                    <Text style={styles.ratingText}>{hotel.rating}</Text>
                                </View>
                            </View>

                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={14} color="#6B7280" />
                                <Text style={styles.location}>{hotel.location}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerArea: {
        backgroundColor: '#FFFFFF',
        // Shadow for header
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 8,
    },
    backButton: {
        padding: 4,
    },
    searchContext: {
        alignItems: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    searchText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 10,
        color: '#6B7280',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#D1D5DB',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterText: {
        fontSize: 12,
        color: '#1F2937',
        fontWeight: '500',
    },
    listContent: {
        padding: 20,
        gap: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        // No shadow to match clean list look in screenshot 3? 
        // Actually screenshot 3 has shadows.
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 4,
    },
    imageContainer: {
        height: 180,
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heartButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    details: {
        padding: 16,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A55A2',
        marginBottom: 4,
    },
    period: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: 'normal',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4B5563',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 12,
        color: '#6B7280',
    },
});
