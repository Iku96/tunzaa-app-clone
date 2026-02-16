import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/contexts/AuthContext';
import BottomNav from '../../../src/components/navigation/BottomNav';

const { width } = Dimensions.get('window');

const SERVICE_CATEGORIES = [
    { id: '1', name: 'Ticket', icon: 'ticket-outline' },
    { id: '2', name: 'Book', icon: 'book-outline' },
    { id: '3', name: 'Plot', icon: 'map-outline' },
    { id: '4', name: 'Flights', icon: 'airplane-outline' },
    { id: '5', name: 'Train', icon: 'train-outline' },
    { id: '6', name: 'Loans', icon: 'cash-outline' },
    { id: '7', name: 'School', icon: 'school-outline' },
    { id: '8', name: 'Marathon', icon: 'walk-outline' },
];

const HOTELS_NEARBY = [
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
];

export default function ServicesScreen() {
    const router = useRouter();
    const { user, profile } = useAuth();

    // Logic to determine display name and image (consistent with Home)
    const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Fredrick John';
    const displayImage = profile?.avatar_url || user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=eff6ff&color=4A55A2`;

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerTop}>
                        <View style={styles.userInfo}>
                            <Image source={{ uri: displayImage }} style={styles.avatar} />
                            <View>
                                <Text style={styles.greeting}>Welcome</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.userName}>{displayName} 👋</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.notificationBtn}>
                            <Ionicons name="notifications-outline" size={24} color="#4A55A2" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar - "Where? Search Destination" */}
                    <TouchableOpacity style={styles.searchContainer} activeOpacity={0.9}>
                        <View>
                            <Text style={styles.searchLabel}>Where?</Text>
                            <Text style={styles.searchPlaceholder}>Search Destination</Text>
                        </View>
                        <View style={styles.searchIconContainer}>
                            <Ionicons name="search" size={20} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                    {SERVICE_CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => {
                            if (cat.name === 'Book' || cat.name === 'Ticket') {
                                router.push('/(buyer)/services/hotels'); // Demo link
                            } else {
                                router.push('/(buyer)/services/hotels'); // Demo link
                            }
                        }}>
                            <View style={styles.iconCircle}>
                                <Ionicons name={cat.icon as any} size={24} color="#4A55A2" />
                            </View>
                            <Text style={styles.categoryName}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Hotel Nearby */}
                <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/(buyer)/services/hotels')}>
                    <Text style={styles.sectionTitle}>Hotel nearby</Text>
                    <Ionicons name="chevron-forward" size={20} color="#1F2937" />
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyList}>
                    {HOTELS_NEARBY.map((hotel) => (
                        <TouchableOpacity
                            key={hotel.id}
                            style={styles.nearbyCard}
                            onPress={() => router.push(`/(buyer)/services/hotels/${hotel.id}`)}
                        >
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
                                <TouchableOpacity style={styles.heartBtn}>
                                    <Ionicons name="heart-outline" size={16} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.priceText}>Tsh {hotel.price} <Text style={styles.periodText}>monthly</Text></Text>
                                <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>

                                <View style={styles.ratingRow}>
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={10} color="#FBBF24" />
                                        <Text style={styles.ratingText}>{hotel.rating}</Text>
                                    </View>
                                </View>

                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={12} color="#6B7280" />
                                    <Text style={styles.locationText} numberOfLines={1}>{hotel.location}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        backgroundColor: '#4A55A2',
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#818CF8',
    },
    greeting: {
        color: '#E0E7FF',
        fontSize: 12,
        marginBottom: 2,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationBtn: {
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
    searchContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    searchLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    searchPlaceholder: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: 'bold',
    },
    searchIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4A55A2', // Primary blue
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingTop: 30,
        paddingBottom: 110,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    viewAll: {
        color: '#4A55A2',
        fontSize: 14,
        fontWeight: '600',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    categoryItem: {
        width: '25%', // 4 columns
        alignItems: 'center',
        marginBottom: 24,
        gap: 10,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6', // Light gray bg
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryName: {
        fontSize: 12,
        color: '#4B5563',
        textAlign: 'center',
        fontWeight: '500',
    },
    nearbyList: {
        paddingHorizontal: 20,
        gap: 16,
        paddingBottom: 20,
    },
    nearbyCard: {
        width: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 4,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 140,
        width: '100%',
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    hotelImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heartBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        padding: 12,
        gap: 4,
    },
    priceText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4A55A2',
    },
    periodText: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: 'normal',
    },
    hotelName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4B5563',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 11,
        color: '#6B7280',
    },
});
