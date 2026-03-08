import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { getAllHotels, HOTEL_CITIES } from '../../../src/data/hotels';
import BottomNav from '../../../src/components/navigation/BottomNav';

// Safe import for DateTimePicker to avoid crash if native module is missing
let DateTimePicker: any = null;
try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
    console.warn('Native DateTimePicker not found, using fallback.');
}

const { width } = Dimensions.get('window');

// Service-specific categories (these are NOT product categories)
const SERVICE_CATEGORIES = [
    { id: '1', name: 'Ticket', icon: 'ticket-outline' },
    { id: '2', name: 'Book', icon: 'book-outline' },
    { id: '3', name: 'Plot', icon: 'map-outline' },
    { id: '4', name: 'Flights', icon: 'airplane-outline' },
    { id: '5', name: 'Trains', icon: 'train-outline' },
    { id: '6', name: 'Loans', icon: 'cash-outline' },
    { id: '7', name: 'School', icon: 'school-outline' },
    { id: '8', name: 'Marathon', icon: 'walk-outline' },
];

export default function ServicesScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();

    const hotels = getAllHotels();

    // Search modal state
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [city, setCity] = useState('Dar es Salaam');
    const [guests, setGuests] = useState(2);
    const [checkIn, setCheckIn] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 7); return d;
    });
    const [checkOut, setCheckOut] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 17); return d;
    });
    const [showDatePicker, setShowDatePicker] = useState<'checkin' | 'checkout' | null>(null);

    const formatDate = (date: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}`;
    };

    const handleSearch = () => {
        setShowSearchModal(false);
        router.push({
            pathname: '/(buyer)/services/hotels',
            params: {
                city,
                guests: String(guests),
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
            },
        });
    };

    const displayName = user
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
        : 'User';
    const displayImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=4A55A2`;

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.userInfo} onPress={() => router.push('/(buyer)/profile')}>
                            <Image source={{ uri: displayImage }} style={styles.avatar} />
                            <View>
                                <Text style={styles.greeting}>Welcome</Text>
                                <Text style={styles.userName}>{displayName} 👋</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(buyer)/notifications')}>
                            <Ionicons name="notifications-outline" size={24} color="#4A55A2" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar → opens search modal */}
                    <TouchableOpacity
                        style={styles.searchContainer}
                        activeOpacity={0.9}
                        onPress={() => setShowSearchModal(true)}
                    >
                        <View>
                            <Text style={styles.searchLabel}>Where?</Text>
                            <Text style={styles.searchPlaceholder}>Search Destination</Text>
                        </View>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                    {SERVICE_CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => {
                            router.push('/(buyer)/services/hotels');
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
                    {hotels.slice(0, 4).map((hotel) => (
                        <TouchableOpacity
                            key={hotel.id}
                            style={styles.nearbyCard}
                            onPress={() => router.push(`/(buyer)/services/hotels/${hotel.id}`)}
                        >
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: hotel.images[0] }} style={styles.hotelImage} />
                                <TouchableOpacity style={styles.heartBtn}>
                                    <Ionicons name="heart-outline" size={16} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.priceText}>Tsh {hotel.priceLabel} <Text style={styles.periodText}>{hotel.pricePeriod}</Text></Text>
                                <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>

                                <View style={styles.ratingRow}>
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={10} color="#FBBF24" />
                                        <Text style={styles.ratingText}>{hotel.rating}</Text>
                                    </View>
                                </View>

                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={12} color="#6B7280" />
                                    <Text style={styles.locationText} numberOfLines={1}>{hotel.city}, {hotel.location}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ── Search Modal (Booking.com style) ── */}
            <Modal visible={showSearchModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <SafeAreaView edges={['top']}>
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
                                        <Ionicons name="location-outline" size={16} color="#4A55A2" /> Destination
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
                                        <Ionicons name="calendar-outline" size={16} color="#4A55A2" /> Dates
                                    </Text>
                                    <View style={styles.dateRow}>
                                        <TouchableOpacity style={styles.dateBox} onPress={() => setShowDatePicker('checkin')}>
                                            <Text style={styles.dateLabel}>Check-in</Text>
                                            <Text style={styles.dateValue}>{formatDate(checkIn)}</Text>
                                        </TouchableOpacity>
                                        <View style={styles.dateDivider} />
                                        <TouchableOpacity style={styles.dateBox} onPress={() => setShowDatePicker('checkout')}>
                                            <Text style={styles.dateLabel}>Check-out</Text>
                                            <Text style={styles.dateValue}>{formatDate(checkOut)}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {showDatePicker && (
                                        DateTimePicker ? (
                                            <DateTimePicker
                                                value={showDatePicker === 'checkin' ? checkIn : checkOut}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                                                minimumDate={showDatePicker === 'checkout' ? checkIn : new Date()}
                                                onChange={(event: any, selectedDate?: Date) => {
                                                    if (Platform.OS === 'android') setShowDatePicker(null);
                                                    if (selectedDate) {
                                                        if (showDatePicker === 'checkin') {
                                                            setCheckIn(selectedDate);
                                                            // Push checkout if needed
                                                            if (selectedDate >= checkOut) {
                                                                const newCheckout = new Date(selectedDate);
                                                                newCheckout.setDate(newCheckout.getDate() + 1);
                                                                setCheckOut(newCheckout);
                                                            }
                                                        } else {
                                                            setCheckOut(selectedDate);
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : (
                                            /* Simple JS Fallback if native module is missing */
                                            <View style={styles.fallbackPicker}>
                                                <Text style={styles.fallbackTitle}>
                                                    Adjust {showDatePicker === 'checkin' ? 'Check-in' : 'Check-out'} Date:
                                                </Text>
                                                <View style={styles.fallbackRow}>
                                                    <TouchableOpacity
                                                        style={styles.fallbackBtn}
                                                        onPress={() => {
                                                            const d = new Date(showDatePicker === 'checkin' ? checkIn : checkOut);
                                                            d.setDate(d.getDate() - 1);
                                                            if (showDatePicker === 'checkin') {
                                                                if (d >= new Date()) setCheckIn(d);
                                                            } else {
                                                                if (d > checkIn) setCheckOut(d);
                                                            }
                                                        }}
                                                    >
                                                        <Ionicons name="remove-circle-outline" size={32} color="#4A55A2" />
                                                    </TouchableOpacity>
                                                    <Text style={styles.fallbackValue}>
                                                        {formatDate(showDatePicker === 'checkin' ? checkIn : checkOut)}
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={styles.fallbackBtn}
                                                        onPress={() => {
                                                            const d = new Date(showDatePicker === 'checkin' ? checkIn : checkOut);
                                                            d.setDate(d.getDate() + 1);
                                                            if (showDatePicker === 'checkin') {
                                                                setCheckIn(d);
                                                                if (d >= checkOut) {
                                                                    const next = new Date(d);
                                                                    next.setDate(next.getDate() + 1);
                                                                    setCheckOut(next);
                                                                }
                                                            } else {
                                                                setCheckOut(d);
                                                            }
                                                        }}
                                                    >
                                                        <Ionicons name="add-circle-outline" size={32} color="#4A55A2" />
                                                    </TouchableOpacity>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.fallbackDone}
                                                    onPress={() => setShowDatePicker(null)}
                                                >
                                                    <Text style={styles.fallbackDoneText}>Done</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    )}
                                    {showDatePicker && Platform.OS === 'ios' && DateTimePicker && (
                                        <TouchableOpacity
                                            style={{ alignSelf: 'center', marginTop: 8 }}
                                            onPress={() => setShowDatePicker(null)}
                                        >
                                            <Text style={{ color: '#4A55A2', fontWeight: '600' }}>Done</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Guests */}
                                <View style={styles.fieldSection}>
                                    <Text style={styles.fieldLabel}>
                                        <Ionicons name="people-outline" size={16} color="#4A55A2" /> Guests
                                    </Text>
                                    <View style={styles.guestRow}>
                                        <TouchableOpacity
                                            style={styles.guestBtn}
                                            onPress={() => setGuests(Math.max(1, guests - 1))}
                                        >
                                            <Ionicons name="remove" size={20} color="#4A55A2" />
                                        </TouchableOpacity>
                                        <Text style={styles.guestCount}>{guests}</Text>
                                        <TouchableOpacity
                                            style={styles.guestBtn}
                                            onPress={() => setGuests(Math.min(10, guests + 1))}
                                        >
                                            <Ionicons name="add" size={20} color="#4A55A2" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>

                            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                                <Ionicons name="search" size={20} color="#FFFFFF" />
                                <Text style={styles.searchButtonText}>Search Hotels</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </View>
                </View>
            </Modal>

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
        width: '25%',
        alignItems: 'center',
        marginBottom: 24,
        gap: 10,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
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

    // ── Search Modal Styles ──
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
        backgroundColor: '#4A55A2',
        borderColor: '#4A55A2',
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
        color: '#4A55A2',
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
        borderColor: '#4A55A2',
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
        backgroundColor: '#4A55A2',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 8,
        shadowColor: '#4A55A2',
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

    // ── Fallback Picker Styles ──
    fallbackPicker: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
        alignItems: 'center',
    },
    fallbackTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    fallbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 16,
    },
    fallbackBtn: {
        padding: 4,
    },
    fallbackValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        minWidth: 80,
        textAlign: 'center',
    },
    fallbackDone: {
        backgroundColor: '#4A55A2',
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
    },
    fallbackDoneText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
});
