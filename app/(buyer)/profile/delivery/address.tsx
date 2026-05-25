import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../../src/contexts/TunzaaAuthContext';
import { useGetBuyerProfile, useUpdateBuyerProfile } from '../../../../src/services/buyers';
import { DeliveryAddress } from '../../../../src/services/types/buyers';
import { GooglePlacesAutocompleteComponent, LocationData } from '../../../../components/ui/google-places-autocomplete';
import { useMapPickerStore } from '../../../../stores/map-picker';

export default function AddDeliveryAddressScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useTunzaaAuth();
    
    // API Data
    const { data: profile, isLoading: profileLoading } = useGetBuyerProfile(user?.user_id || user?.id || '');
    const { mutate: updateProfile, isPending: isSaving } = useUpdateBuyerProfile();

    // Accordion State
    const [expandedType, setExpandedType] = useState<'apartment' | 'house' | 'office' | 'hotel' | null>(null);

    // Apartment Form Fields
    const [aptAddress, setAptAddress] = useState('');
    const [aptName, setAptName] = useState('');
    const [aptStreet, setAptStreet] = useState('');
    const [aptFloor, setAptFloor] = useState('');
    const [aptNote, setAptNote] = useState('');
    const [aptLat, setAptLat] = useState('');
    const [aptLng, setAptLng] = useState('');

    // House Form Fields
    const [houseAddress, setHouseAddress] = useState('');
    const [houseStreet, setHouseStreet] = useState('');
    const [houseNo, setHouseNo] = useState('');
    const [houseCity, setHouseCity] = useState('');
    const [houseNote, setHouseNote] = useState('');
    const [houseLat, setHouseLat] = useState('');
    const [houseLng, setHouseLng] = useState('');

    // Office Form Fields
    const [officeAddress, setOfficeAddress] = useState('');
    const [officeBusiness, setOfficeBusiness] = useState('');
    const [officeStreet, setOfficeStreet] = useState('');
    const [officeFloor, setOfficeFloor] = useState('');
    const [officeNote, setOfficeNote] = useState('');
    const [officeLat, setOfficeLat] = useState('');
    const [officeLng, setOfficeLng] = useState('');

    // Hotel Form Fields
    const [hotelAddress, setHotelAddress] = useState('');
    const [hotelName, setHotelName] = useState('');
    const [hotelStreet, setHotelStreet] = useState('');
    const [hotelNote, setHotelNote] = useState('');
    const [hotelLat, setHotelLat] = useState('');
    const [hotelLng, setHotelLng] = useState('');

    // Search Modal States
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchActiveType, setSearchActiveType] = useState<'apartment' | 'house' | 'office' | 'hotel' | null>(null);

    const handleLocationSelected = (loc: LocationData, type: 'apartment' | 'house' | 'office' | 'hotel') => {
        const selectedAddress = loc.address || loc.city || `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
        const lat = String(loc.latitude);
        const lng = String(loc.longitude);
        const city = loc.city || 'Dar Es Salaam';

        const addrParts = selectedAddress.split(',');
        const guessedStreet = addrParts[0] ? addrParts[0].trim() : selectedAddress;
        const guessedSecond = addrParts[1] ? addrParts[1].trim() : '';

        if (type === 'apartment') {
            setAptAddress(selectedAddress);
            setAptLat(lat);
            setAptLng(lng);
            if (!aptStreet) setAptStreet(guessedStreet);
            if (!aptName && guessedSecond) setAptName(guessedSecond);
        } else if (type === 'house') {
            setHouseAddress(selectedAddress);
            setHouseLat(lat);
            setHouseLng(lng);
            setHouseCity(city || guessedSecond || 'Dar Es Salaam');
            if (!houseStreet) setHouseStreet(guessedStreet);
        } else if (type === 'office') {
            setOfficeAddress(selectedAddress);
            setOfficeLat(lat);
            setOfficeLng(lng);
            if (!officeStreet) setOfficeStreet(guessedStreet);
            if (!officeBusiness && guessedSecond) setOfficeBusiness(guessedSecond);
        } else if (type === 'hotel') {
            setHotelAddress(selectedAddress);
            setHotelLat(lat);
            setHotelLng(lng);
            if (!hotelStreet) setHotelStreet(guessedStreet);
            if (!hotelName && guessedSecond) setHotelName(guessedSecond);
        }
        setShowSearchModal(false);
    };

    // Populate address and lat/lng when returning from map via Zustand store
    const mapPickerResult = useMapPickerStore((s) => s.result);
    const clearMapPickerResult = useMapPickerStore((s) => s.clearResult);

    useEffect(() => {
        if (mapPickerResult) {
            const selectedAddress = mapPickerResult.address;
            const lat = mapPickerResult.lat;
            const lng = mapPickerResult.lng;
            const city = mapPickerResult.city;
            const type = mapPickerResult.type;

            const addrParts = selectedAddress.split(',');
            const guessedStreet = addrParts[0] ? addrParts[0].trim() : selectedAddress;
            const guessedSecond = addrParts[1] ? addrParts[1].trim() : '';

            if (type === 'apartment') {
                setAptAddress(selectedAddress);
                setAptLat(lat);
                setAptLng(lng);
                setExpandedType('apartment');
                if (!aptStreet) setAptStreet(guessedStreet);
                if (!aptName && guessedSecond) setAptName(guessedSecond);
            } else if (type === 'house') {
                setHouseAddress(selectedAddress);
                setHouseLat(lat);
                setHouseLng(lng);
                setHouseCity(city || guessedSecond || 'Dar Es Salaam');
                setExpandedType('house');
                if (!houseStreet) setHouseStreet(guessedStreet);
            } else if (type === 'office') {
                setOfficeAddress(selectedAddress);
                setOfficeLat(lat);
                setOfficeLng(lng);
                setExpandedType('office');
                if (!officeStreet) setOfficeStreet(guessedStreet);
                if (!officeBusiness && guessedSecond) setOfficeBusiness(guessedSecond);
            } else if (type === 'hotel') {
                setHotelAddress(selectedAddress);
                setHotelLat(lat);
                setHotelLng(lng);
                setExpandedType('hotel');
                if (!hotelStreet) setHotelStreet(guessedStreet);
                if (!hotelName && guessedSecond) setHotelName(guessedSecond);
            }

            // Clear the store so it only processes once
            clearMapPickerResult();
        }
    }, [mapPickerResult]);

    const handleSaveAddress = (type: 'apartment' | 'house' | 'office' | 'hotel') => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in to save addresses.');
            return;
        }

        let newAddress: DeliveryAddress;

        if (type === 'apartment') {
            if (!aptStreet.trim() || !aptName.trim()) {
                Alert.alert('Error', 'Please enter apartment name and street name.');
                return;
            }
            newAddress = {
                title: 'Apartment',
                address_line1: `${aptFloor ? aptFloor + ', ' : ''}${aptName}, ${aptStreet}`.trim(),
                land_mark: aptNote,
                city: params.city ? String(params.city) : 'Dar Es Salaam',
                state_province: params.city ? String(params.city) : 'Dar Es Salaam',
                country: 'Tanzania',
                lat: aptLat || undefined,
                lng: aptLng || undefined,
            };
        } else if (type === 'house') {
            if (!houseStreet.trim() || !houseNo.trim() || !houseCity.trim()) {
                Alert.alert('Error', 'Please enter street name, house number, and city.');
                return;
            }
            newAddress = {
                title: 'House',
                address_line1: `House No: ${houseNo}, Street: ${houseStreet}`.trim(),
                land_mark: houseNote,
                city: houseCity,
                state_province: houseCity,
                country: 'Tanzania',
                lat: houseLat || undefined,
                lng: houseLng || undefined,
            };
        } else if (type === 'office') {
            if (!officeStreet.trim() || !officeBusiness.trim()) {
                Alert.alert('Error', 'Please enter business name and street name.');
                return;
            }
            newAddress = {
                title: 'Office',
                address_line1: `${officeFloor ? officeFloor + ', ' : ''}${officeBusiness}, ${officeStreet}`.trim(),
                land_mark: officeNote,
                city: params.city ? String(params.city) : 'Dar Es Salaam',
                state_province: params.city ? String(params.city) : 'Dar Es Salaam',
                country: 'Tanzania',
                lat: officeLat || undefined,
                lng: officeLng || undefined,
            };
        } else { // hotel
            if (!hotelStreet.trim() || !hotelName.trim()) {
                Alert.alert('Error', 'Please enter hotel name and street name.');
                return;
            }
            newAddress = {
                title: 'Hotel',
                address_line1: `${hotelName}, ${hotelStreet}`.trim(),
                land_mark: hotelNote,
                city: params.city ? String(params.city) : 'Dar Es Salaam',
                state_province: params.city ? String(params.city) : 'Dar Es Salaam',
                country: 'Tanzania',
                lat: hotelLat || undefined,
                lng: hotelLng || undefined,
            };
        }

        const currentAddresses = profile?.delivery_address || [];
        
        updateProfile({
            userId: user.user_id || user.id,
            data: {
                user_id: user.user_id || user.id,
                tenant_id: profile?.tenant_id || user.tenant_id || '',
                contact_email: profile?.contact_email || user.email || '',
                contact_phone: profile?.contact_phone || user.phone_number || '',
                delivery_address: [...currentAddresses, newAddress],
                default_delivery_address: newAddress.address_line1
            }
        }, {
            onSuccess: () => {
                Alert.alert('Success', 'Address saved successfully!', [
                    { text: 'OK', onPress: () => router.replace('/(buyer)/profile/delivery/saved') }
                ]);
            },
            onError: (err) => {
                console.error('Failed to save address:', err);
                Alert.alert('Error', 'Failed to save address. Please try again.');
            }
        });
    };

    const toggleAccordion = (type: 'apartment' | 'house' | 'office' | 'hotel') => {
        setExpandedType(expandedType === type ? null : type);
    };

    if (profileLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#425BA4" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Choose delivery type</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.subHeader}>
                    <Text style={styles.subHeaderDescription}>
                        This helps us deliver your product more accurately.
                    </Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Apartment Option */}
                    <View style={[styles.card, expandedType === 'apartment' && styles.cardActive]}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleAccordion('apartment')}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="business-outline" size={20} color="#425BA4" />
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <Text style={styles.cardTitle}>Apartment</Text>
                                <Text style={styles.cardSubtitle}>multi-unit residential building</Text>
                            </View>
                            <Ionicons name={expandedType === 'apartment' ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
                        </TouchableOpacity>

                        {expandedType === 'apartment' && (
                            <View style={styles.cardBody}>
                                <View style={styles.locationSearchRow}>
                                    <TouchableOpacity
                                        style={styles.searchBarBtn}
                                        onPress={() => {
                                            setSearchActiveType('apartment');
                                            setShowSearchModal(true);
                                        }}
                                    >
                                        <Ionicons name="search-outline" size={20} color="#3B5191" />
                                        <Text style={[styles.searchBarText, !aptAddress && styles.searchBarPlaceholder]} numberOfLines={1}>
                                            {aptAddress || "Search your delivery address"}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="map-picker-btn-apartment"
                                        style={styles.mapIconButton}
                                        onPress={() => router.push({
                                            pathname: '/(buyer)/profile/delivery/map',
                                            params: { mode: 'pick', type: 'apartment' }
                                        })}
                                    >
                                        <Ionicons name="map-outline" size={22} color="#3B5191" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter apartment name"
                                    placeholderTextColor="#9CA3AF"
                                    value={aptName}
                                    onChangeText={setAptName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter street name"
                                    placeholderTextColor="#9CA3AF"
                                    value={aptStreet}
                                    onChangeText={setAptStreet}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="E.g., Apt 2B, 3rd Floor"
                                    placeholderTextColor="#9CA3AF"
                                    value={aptFloor}
                                    onChangeText={setAptFloor}
                                />

                                <Text style={styles.formLabel}>Delivery Note</Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="E.g., Please leave at the door or knock instead of ringing the bell"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    value={aptNote}
                                    onChangeText={setAptNote}
                                />

                                <TouchableOpacity
                                    style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                                    onPress={() => handleSaveAddress('apartment')}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save Address</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* House Option */}
                    <View style={[styles.card, expandedType === 'house' && styles.cardActive]}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleAccordion('house')}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="home-outline" size={20} color="#425BA4" />
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <Text style={styles.cardTitle}>House</Text>
                                <Text style={styles.cardSubtitle}>Single residential building</Text>
                            </View>
                            <Ionicons name={expandedType === 'house' ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
                        </TouchableOpacity>

                        {expandedType === 'house' && (
                            <View style={styles.cardBody}>
                                <View style={styles.locationSearchRow}>
                                    <TouchableOpacity
                                        style={styles.searchBarBtn}
                                        onPress={() => {
                                            setSearchActiveType('house');
                                            setShowSearchModal(true);
                                        }}
                                    >
                                        <Ionicons name="search-outline" size={20} color="#3B5191" />
                                        <Text style={[styles.searchBarText, !houseAddress && styles.searchBarPlaceholder]} numberOfLines={1}>
                                            {houseAddress || "Search your delivery address"}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="map-picker-btn-house"
                                        style={styles.mapIconButton}
                                        onPress={() => router.push({
                                            pathname: '/(buyer)/profile/delivery/map',
                                            params: { mode: 'pick', type: 'house' }
                                        })}
                                    >
                                        <Ionicons name="map-outline" size={22} color="#3B5191" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Street name"
                                    placeholderTextColor="#9CA3AF"
                                    value={houseStreet}
                                    onChangeText={setHouseStreet}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter House No."
                                    placeholderTextColor="#9CA3AF"
                                    value={houseNo}
                                    onChangeText={setHouseNo}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="City"
                                    placeholderTextColor="#9CA3AF"
                                    value={houseCity}
                                    onChangeText={setHouseCity}
                                />

                                <Text style={styles.formLabel}>Delivery Note*</Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="E.g., Please leave at the door or knock instead of ringing the bell"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    value={houseNote}
                                    onChangeText={setHouseNote}
                                />

                                <TouchableOpacity
                                    style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                                    onPress={() => handleSaveAddress('house')}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save Address</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Office Option */}
                    <View style={[styles.card, expandedType === 'office' && styles.cardActive]}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleAccordion('office')}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="briefcase-outline" size={20} color="#425BA4" />
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <Text style={styles.cardTitle}>Office</Text>
                                <Text style={styles.cardSubtitle}>Workplace with entry restrictions</Text>
                            </View>
                            <Ionicons name={expandedType === 'office' ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
                        </TouchableOpacity>

                        {expandedType === 'office' && (
                            <View style={styles.cardBody}>
                                <View style={styles.locationSearchRow}>
                                    <TouchableOpacity
                                        style={styles.searchBarBtn}
                                        onPress={() => {
                                            setSearchActiveType('office');
                                            setShowSearchModal(true);
                                        }}
                                    >
                                        <Ionicons name="search-outline" size={20} color="#3B5191" />
                                        <Text style={[styles.searchBarText, !officeAddress && styles.searchBarPlaceholder]} numberOfLines={1}>
                                            {officeAddress || "Search your delivery address"}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="map-picker-btn-office"
                                        style={styles.mapIconButton}
                                        onPress={() => router.push({
                                            pathname: '/(buyer)/profile/delivery/map',
                                            params: { mode: 'pick', type: 'office' }
                                        })}
                                    >
                                        <Ionicons name="map-outline" size={22} color="#3B5191" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter the business name"
                                    placeholderTextColor="#9CA3AF"
                                    value={officeBusiness}
                                    onChangeText={setOfficeBusiness}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Street name"
                                    placeholderTextColor="#9CA3AF"
                                    value={officeStreet}
                                    onChangeText={setOfficeStreet}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="E.g., 3rd Floor"
                                    placeholderTextColor="#9CA3AF"
                                    value={officeFloor}
                                    onChangeText={setOfficeFloor}
                                />

                                <Text style={styles.formLabel}>Delivery Note*</Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="E.g., Please leave at the door or knock instead of ringing the bell"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    value={officeNote}
                                    onChangeText={setOfficeNote}
                                />

                                <TouchableOpacity
                                    style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                                    onPress={() => handleSaveAddress('office')}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save Address</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Hotel Option */}
                    <View style={[styles.card, expandedType === 'hotel' && styles.cardActive]}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleAccordion('hotel')}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="business-outline" size={20} color="#425BA4" />
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <Text style={styles.cardTitle}>Hotel</Text>
                                <Text style={styles.cardSubtitle}>Lodging, Motel or resort</Text>
                            </View>
                            <Ionicons name={expandedType === 'hotel' ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
                        </TouchableOpacity>

                        {expandedType === 'hotel' && (
                            <View style={styles.cardBody}>
                                <View style={styles.locationSearchRow}>
                                    <TouchableOpacity
                                        style={styles.searchBarBtn}
                                        onPress={() => {
                                            setSearchActiveType('hotel');
                                            setShowSearchModal(true);
                                        }}
                                    >
                                        <Ionicons name="search-outline" size={20} color="#3B5191" />
                                        <Text style={[styles.searchBarText, !hotelAddress && styles.searchBarPlaceholder]} numberOfLines={1}>
                                            {hotelAddress || "Search your delivery address"}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        testID="map-picker-btn-hotel"
                                        style={styles.mapIconButton}
                                        onPress={() => router.push({
                                            pathname: '/(buyer)/profile/delivery/map',
                                            params: { mode: 'pick', type: 'hotel' }
                                        })}
                                    >
                                        <Ionicons name="map-outline" size={22} color="#3B5191" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Hotel name"
                                    placeholderTextColor="#9CA3AF"
                                    value={hotelName}
                                    onChangeText={setHotelName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Street name"
                                    placeholderTextColor="#9CA3AF"
                                    value={hotelStreet}
                                    onChangeText={setHotelStreet}
                                />

                                <Text style={styles.formLabel}>Delivery Note*</Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="E.g., Please leave at the door or knock instead of ringing the bell"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    value={hotelNote}
                                    onChangeText={setHotelNote}
                                />

                                <TouchableOpacity
                                    style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                                    onPress={() => handleSaveAddress('hotel')}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save Address</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Search Modal */}
            <Modal visible={showSearchModal} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSearchModal(false)}>
                    <View style={[styles.modalContent, { height: '80%' }]} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Search Location</Text>
                        
                        <View style={{ flex: 1, zIndex: 1, marginTop: 10 }}>
                            <GooglePlacesAutocompleteComponent
                                placeholder="Enter city, neighborhood, or landmark"
                                onLocationSelected={(loc: LocationData) => {
                                    if (searchActiveType) {
                                        handleLocationSelected(loc, searchActiveType);
                                    }
                                }}
                            />
                        </View>

                        
                    </View>
                </TouchableOpacity>
            </Modal>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
    },
    subHeader: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    subHeaderDescription: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardActive: {
        borderColor: '#425BA4',
        borderWidth: 1.5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTitleContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    cardSubtitle: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 2,
    },
    cardBody: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: '#FCFDFE',
    },
    locationSearchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    searchBarBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF2FC',
        paddingHorizontal: 16,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D2DBF0',
    },
    searchBarText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#3B5191',
        fontWeight: '500',
    },
    searchBarPlaceholder: {
        color: '#9CA3AF',
    },
    mapIconButton: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: '#EFF2FC',
        borderWidth: 1,
        borderColor: '#D2DBF0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        backgroundColor: '#EFF2FC',
        borderWidth: 1,
        borderColor: '#D2DBF0',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#3B5191',
        fontWeight: '500',
        marginBottom: 16,
    },
    formLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    textArea: {
        backgroundColor: '#EFF2FC',
        borderWidth: 1,
        borderColor: '#D2DBF0',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#3B5191',
        fontWeight: '500',
        height: 100,
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: '#425BA4',
        borderRadius: 26,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 12,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    pickOnMapBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 16,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C7D2FE',
        marginTop: 16,
        marginBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    pickOnMapText: {
        color: '#425BA4',
        fontSize: 14,
        fontWeight: '600',
    },
});
