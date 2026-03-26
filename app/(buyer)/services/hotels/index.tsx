import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllHotels, searchHotels, HOTEL_CITIES, Hotel } from '../../../../src/data/hotels';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function HotelListScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        city?: string;
        guests?: string;
        checkIn?: string;
        checkOut?: string;
    }>();

    // Initialize from URL params or defaults
    const [city, setCity] = useState(params.city || 'Dar es Salaam');
    const [guests, setGuests] = useState(params.guests ? parseInt(params.guests, 10) : 2);
    const [checkIn, setCheckIn] = useState(() => {
        if (params.checkIn) return new Date(params.checkIn);
        const d = new Date(); d.setDate(d.getDate() + 7); return d;
    });
    const [checkOut, setCheckOut] = useState(() => {
        if (params.checkOut) return new Date(params.checkOut);
        const d = new Date(); d.setDate(d.getDate() + 17); return d;
    });

    // Modal for inline filter changes
    const [showSearchModal, setShowSearchModal] = useState(false);

    // Filtered hotels
    const filteredHotels = useMemo(() => {
        return searchHotels({ city, guests });
    }, [city, guests]);

    const formatDate = (date: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}`;
    };

    const renderHotelCard = (hotel: Hotel) => (
        <TouchableOpacity
            key={hotel.id}
            style={styles.card}
            onPress={() => router.push(`/(buyer)/services/hotels/${hotel.id}`)}
        >
            <View style={styles.cardImageContainer}>
                <Image source={{ uri: hotel.images[0] }} style={styles.cardImage} />
                <TouchableOpacity style={styles.heartButton}>
                    <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            <View style={styles.cardDetails}>
                <Text style={styles.cardPrice}>
                    Tsh {hotel.priceLabel} <Text style={styles.cardPeriod}>{hotel.pricePeriod}</Text>
                </Text>
                <Text style={styles.cardName} numberOfLines={1}>{hotel.name}</Text>
                <View style={styles.cardRating}>
                    <Ionicons name="star" size={10} color="#FBBF24" />
                    <Text style={styles.cardRatingText}>{hotel.rating}</Text>
                </View>
                <View style={styles.cardLocation}>
                    <Ionicons name="location-outline" size={12} color="#6B7280" />
                    <Text style={styles.cardLocationText} numberOfLines={1}>{hotel.city}, {hotel.location}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    {/* Search Context — Tappable to open search modal */}
                    <TouchableOpacity style={styles.searchContext} onPress={() => setShowSearchModal(true)}>
                        <View style={styles.searchRow}>
                            <Ionicons name="location-outline" size={16} color="#425BA4" />
                            <Text style={styles.searchText}>{city}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Ionicons name="people-outline" size={12} color="#6B7280" />
                            <Text style={styles.metaText}>Guests {String(guests).padStart(2, '0')}</Text>
                            <View style={styles.dot} />
                            <Text style={styles.metaText}>{formatDate(checkIn)} - {formatDate(checkOut)}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={20} color="#1F2937" />
                        <Text style={styles.filterText}>Filter</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Hotel Grid */}
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {filteredHotels.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="bed-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No hotels found</Text>
                        <Text style={styles.emptySubtitle}>Try a different city or adjust your guest count</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {filteredHotels.map(renderHotelCard)}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* ── Search Modal (Booking.com style) ── */}
            <Modal visible={showSearchModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <SafeAreaView edges={['top']}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                                    <Ionicons name="close" size={24} color="#1F2937" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Search Hotels</Text>
                                <View style={{ width: 24 }} />
                            </View>

                            <ScrollView contentContainerStyle={styles.modalBody}>
                                {/* Location */}
                                <View style={styles.fieldSection}>
                                    <Text style={styles.fieldLabel}>
                                        <Ionicons name="location-outline" size={16} color="#425BA4" /> Destination
                                    </Text>
                                    <View style={styles.cityOptions}>
                                        {HOTEL_CITIES.map((c) => (
                                            <TouchableOpacity
                                                key={c}
                                                style={[styles.cityChip, city === c && styles.cityChipActive]}
                                                onPress={() => setCity(c)}
                                            >
                                                <Text style={[styles.cityChipText, city === c && styles.cityChipTextActive]}>{c}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Dates */}
                                <View style={styles.fieldSection}>
                                    <Text style={styles.fieldLabel}>
                                        <Ionicons name="calendar-outline" size={16} color="#425BA4" /> Dates
                                    </Text>
                                    <View style={styles.dateRow}>
                                        <TouchableOpacity style={styles.dateBox} onPress={() => {
                                            // Simple date increment/decrement for now
                                            const d = new Date(checkIn);
                                            d.setDate(d.getDate() + 1);
                                            if (d < checkOut) setCheckIn(d);
                                        }}>
                                            <Text style={styles.dateLabel}>Check-in</Text>
                                            <Text style={styles.dateValue}>{formatDate(checkIn)}</Text>
                                            <Text style={styles.dateTap}>Tap to change →</Text>
                                        </TouchableOpacity>
                                        <View style={styles.dateDivider} />
                                        <TouchableOpacity style={styles.dateBox} onPress={() => {
                                            const d = new Date(checkOut);
                                            d.setDate(d.getDate() + 1);
                                            setCheckOut(d);
                                        }}>
                                            <Text style={styles.dateLabel}>Check-out</Text>
                                            <Text style={styles.dateValue}>{formatDate(checkOut)}</Text>
                                            <Text style={styles.dateTap}>Tap to change →</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Guests */}
                                <View style={styles.fieldSection}>
                                    <Text style={styles.fieldLabel}>
                                        <Ionicons name="people-outline" size={16} color="#425BA4" /> Guests
                                    </Text>
                                    <View style={styles.guestRow}>
                                        <TouchableOpacity
                                            style={styles.guestBtn}
                                            onPress={() => setGuests(Math.max(1, guests - 1))}
                                        >
                                            <Ionicons name="remove" size={20} color="#425BA4" />
                                        </TouchableOpacity>
                                        <Text style={styles.guestCount}>{guests}</Text>
                                        <TouchableOpacity
                                            style={styles.guestBtn}
                                            onPress={() => setGuests(Math.min(10, guests + 1))}
                                        >
                                            <Ionicons name="add" size={20} color="#425BA4" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Search Button */}
                            <TouchableOpacity
                                style={styles.searchButton}
                                onPress={() => setShowSearchModal(false)}
                            >
                                <Ionicons name="search" size={20} color="#FFFFFF" />
                                <Text style={styles.searchButtonText}>Search Hotels</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </View>
                </View>
            </Modal>
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
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 12,
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
        gap: 6,
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
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        marginBottom: 20,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    cardImageContainer: {
        height: 130,
        width: '100%',
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heartButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(74,85,162,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardDetails: {
        padding: 10,
        gap: 2,
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    cardPeriod: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: 'normal',
    },
    cardName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
    },
    cardRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardRatingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4B5563',
    },
    cardLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    cardLocationText: {
        fontSize: 10,
        color: '#6B7280',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },

    // ── Search Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: 32,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    modalBody: {
        paddingTop: 20,
        paddingBottom: 20,
    },
    fieldSection: {
        marginBottom: 28,
    },
    fieldLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    cityOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    cityChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    cityChipActive: {
        backgroundColor: '#425BA4',
        borderColor: '#425BA4',
    },
    cityChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4B5563',
    },
    cityChipTextActive: {
        color: '#FFFFFF',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        overflow: 'hidden',
    },
    dateBox: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
    },
    dateDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E7EB',
    },
    dateLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    dateTap: {
        fontSize: 9,
        color: '#425BA4',
        marginTop: 4,
    },
    guestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingVertical: 16,
    },
    guestBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#425BA4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guestCount: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        width: 60,
        textAlign: 'center',
    },
    searchButton: {
        flexDirection: 'row',
        backgroundColor: '#425BA4',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 8,
        shadowColor: "#425BA4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    searchButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
