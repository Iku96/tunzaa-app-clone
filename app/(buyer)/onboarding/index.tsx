import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadApi } from '../../../src/services/upload';
import { getAvatarUrl, cleanseImageUrl, isValidUrl } from '../../../src/utils/images';
import { authApi } from '../../../src/services/auth';
import { GooglePlacesAutocompleteComponent, LocationData } from '../../../components/ui/google-places-autocomplete';
import * as Location from 'expo-location';

const PROFILE_EXTRAS_KEY = '@tunzaa_profile_extras';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - i);

export default function CompleteProfileScreen() {
    const router = useRouter();
    const { user, refreshProfile } = useTunzaaAuth();

    const initialName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User');
    const [firstName] = useState(user?.first_name || 'User');
    
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [location, setLocation] = useState('');
    const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    // UI state
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    // Date picker state
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedYear, setSelectedYear] = useState(1997);

    const handleDateConfirm = () => {
        const day = String(selectedDay).padStart(2, '0');
        const month = String(selectedMonth + 1).padStart(2, '0');
        const formatted = `${day}/${month}/${selectedYear}`;
        setDob(formatted);
        setShowDatePicker(false);
    };

    const pickImage = async () => {
        try {
            const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permResult.granted) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.[0]) return;
            const asset = result.assets[0];
            setProfileImage(asset.uri);
            setUploadingPhoto(true);

            try {
                const fileName = asset.uri.split('/').pop() || 'profile.jpg';
                const fileType = asset.mimeType || 'image/jpeg';
                const uploadResponse = await uploadApi.uploadFile(asset.uri, fileName, fileType);
                let uploadedUrl = uploadResponse?.fileCDNUrl || uploadResponse?.fileUrl || uploadResponse?.url;
                
                if (uploadedUrl) {
                    uploadedUrl = cleanseImageUrl(uploadedUrl);
                    if (isValidUrl(uploadedUrl)) {
                        setProfileImage(uploadedUrl!);
                    }
                }
            } catch (e) {
                console.error('Upload failed', e);
            } finally {
                setUploadingPhoto(false);
            }
        } catch (e) {
            console.error('Image picker error:', e);
        }
    };

    const handleContinue = async () => {
        setIsSubmitting(true);
        try {
            const targetUserId = user?.user_id || user?.id;
            let updatedMeta: Record<string, any> = {};
            
            if (targetUserId) {
                const profiles = user?.profiles || [];
                let targetProfile = profiles.find((p: any) => p.role?.toLowerCase() === 'buyer') || profiles[0];
                
                updatedMeta = {
                    ...(targetProfile?.metadata || {}),
                    gender: gender || undefined,
                    date_of_birth: dob || undefined,
                    preferred_location: location || undefined,
                    location_coords: locationCoords,
                    profile_picture: cleanseImageUrl(profileImage || undefined),
                };

                // Persist to AsyncStorage (workaround: backend doesn't save metadata yet)
                try {
                    const existingExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${targetUserId}`);
                    const existing = existingExtras ? JSON.parse(existingExtras) : {};
                    await AsyncStorage.setItem(`${PROFILE_EXTRAS_KEY}_${targetUserId}`, JSON.stringify({
                        ...existing,
                        ...updatedMeta,
                    }));
                } catch (storageErr) {
                    console.warn('[Onboarding] AsyncStorage write failed:', storageErr);
                }

                // Still attempt the API calls (they'll work once backend is fixed)
                try {
                    await authApi.updateUser(targetUserId, { 
                        first_name: user?.first_name || '',
                        last_name: user?.last_name || '',
                        email: user?.email || undefined,
                        phone_number: user?.phone_number || undefined,
                        display_name: user?.display_name || undefined,
                        name: user?.name || undefined,
                        metadata: updatedMeta 
                    });
                    if (targetProfile?.profile_id) {
                        await authApi.updateUserProfile(targetUserId, targetProfile.profile_id, { metadata: updatedMeta });
                    }
                    if (refreshProfile) await refreshProfile();
                } catch (apiErr) {
                    console.warn('[Onboarding] API metadata update failed (non-blocking):', apiErr);
                }
            }
            router.push({ pathname: '/(buyer)/onboarding/interests', params: { incomingMeta: JSON.stringify(updatedMeta || {}) } });
        } catch (e) {
            console.error('Update failed', e);
            router.push('/(buyer)/onboarding/interests');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        router.push('/(buyer)/onboarding/interests');
    };

    const handleUseCurrentLocation = async () => {
        setIsFetchingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                setIsFetchingLocation(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;
            setLocationCoords({ lat: latitude, lng: longitude });

            // Reverse geocode to get a readable name
            const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (geocode) {
                const readableLocation = [geocode.street, geocode.city, geocode.region].filter(Boolean).join(', ');
                setLocation(readableLocation || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } else {
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
        } catch (error) {
            console.error('Error fetching location:', error);
            alert('Failed to get current location. Please try again or enter manually.');
        } finally {
            setIsFetchingLocation(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1D1E1F" />
                </TouchableOpacity>
                <Text style={styles.title}>Complete your profile</Text>
            </View>
            
            <Text style={styles.subtitle}>Hey {firstName}, let's add a few more details</Text>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {profileImage ? (
                            <Image
                                source={{ uri: cleanseImageUrl(profileImage) }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="person" size={70} color="#9CA3AF" />
                            </View>
                        )}
                        <TouchableOpacity style={styles.cameraButton} onPress={pickImage} disabled={uploadingPhoto}>
                            {uploadingPhoto ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form fields */}
                <View style={styles.formContainer}>
                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowGenderPicker(true)}>
                        <Text style={[styles.inputText, !gender && styles.placeholderText]}>{gender || 'Choose gender'}</Text>
                        <Ionicons name="chevron-down" size={20} color="#1D1E1F" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
                        <Text style={[styles.inputText, !dob && styles.placeholderText]}>{dob || 'Date of birth'}</Text>
                        <Ionicons name="calendar-outline" size={20} color="#1D1E1F" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowLocationPicker(true)}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.inputText, !location && styles.placeholderText, { flex: 1, paddingRight: 10 }]}>{location || 'Preferred delivery location'}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#1D1E1F" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.currentLocationBtn} onPress={handleUseCurrentLocation} disabled={isFetchingLocation}>
                        {isFetchingLocation ? (
                            <ActivityIndicator size="small" color="#425BA4" style={{ marginRight: 8 }} />
                        ) : (
                            <Ionicons name="location-outline" size={20} color="#425BA4" style={{ marginRight: 8 }} />
                        )}
                        <Text style={styles.currentLocationText}>
                            {isFetchingLocation ? 'Locating...' : 'Use Current Location'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Continue */}
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueText}>Continue</Text>}
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
                <Ionicons name="arrow-forward" size={16} color="#3B5191" />
            </TouchableOpacity>

            {/* Modals from edit profile */}
            <Modal visible={showGenderPicker} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGenderPicker(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Select Gender</Text>
                        {GENDER_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[styles.optionRow, gender === option && styles.optionRowSelected]}
                                onPress={() => {
                                    setGender(option);
                                    setShowGenderPicker(false);
                                }}
                            >
                                <Text style={[styles.optionText, gender === option && styles.optionTextSelected]}>{option}</Text>
                                {gender === option && <Ionicons name="checkmark-circle" size={22} color="#3E4C85" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showDatePicker} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.datePickerContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Select Date of Birth</Text>
                        <View style={styles.dateRow}>
                            <View style={styles.dateColumn}>
                                <Text style={styles.dateColumnLabel}>Day</Text>
                                <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                    {DAYS.map((d) => (
                                        <TouchableOpacity key={d} style={[styles.dateItem, selectedDay === d && styles.dateItemSelected]} onPress={() => setSelectedDay(d)}>
                                            <Text style={[styles.dateItemText, selectedDay === d && styles.dateItemTextSelected]}>{d}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <View style={styles.dateColumn}>
                                <Text style={styles.dateColumnLabel}>Month</Text>
                                <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                    {MONTHS.map((m, i) => (
                                        <TouchableOpacity key={m} style={[styles.dateItem, selectedMonth === i && styles.dateItemSelected]} onPress={() => setSelectedMonth(i)}>
                                            <Text style={[styles.dateItemText, selectedMonth === i && styles.dateItemTextSelected]}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <View style={styles.dateColumn}>
                                <Text style={styles.dateColumnLabel}>Year</Text>
                                <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                    {YEARS.map((y) => (
                                        <TouchableOpacity key={y} style={[styles.dateItem, selectedYear === y && styles.dateItemSelected]} onPress={() => setSelectedYear(y)}>
                                            <Text style={[styles.dateItemText, selectedYear === y && styles.dateItemTextSelected]}>{y}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.dateConfirmButton} onPress={handleDateConfirm}>
                            <Text style={styles.dateConfirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={showLocationPicker} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLocationPicker(false)}>
                    <View style={[styles.modalContent, { height: '80%' }]} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Search Location</Text>
                        <View style={{ flex: 1, zIndex: 1, marginTop: 10 }}>
                            <GooglePlacesAutocompleteComponent
                                placeholder="Enter city, neighborhood, or landmark"
                                onLocationSelected={(loc: LocationData) => {
                                    // Use the specific address/description rather than the broad city/administrative area
                                    const displayLoc = loc.address || loc.city || 'Unknown Location';
                                    setLocation(displayLoc);
                                    setShowLocationPicker(false);
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
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6, marginTop: 20, position: 'relative' },
    backButton: { position: 'absolute', left: 16, padding: 8, zIndex: 1 },
    title: { fontSize: 24, fontWeight: '700', color: '#1D1E1F', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 40, marginTop: 8 },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    avatarSection: { alignItems: 'center', marginBottom: 50 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#F3F4F6' },
    cameraButton: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#3B5191', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
    formContainer: { gap: 20, marginBottom: 40 },
    inputBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, paddingHorizontal: 20, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
    inputText: { fontSize: 16, color: '#1D1E1F' },
    placeholderText: { color: '#9CA3AF' },
    continueButton: { height: 60, backgroundColor: '#3B5191', borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    continueText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
    skipButton: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', paddingBottom: 20, paddingTop: 20 },
    skipText: { fontSize: 17, fontWeight: '500', color: '#3B5191', marginRight: 8 },
    
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24, paddingTop: 12 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
    optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
    optionRowSelected: { backgroundColor: '#EFF6FF' },
    optionText: { fontSize: 16, color: '#374151' },
    optionTextSelected: { color: '#3E4C85', fontWeight: '600' },
    
    // Date Picker Styles
    datePickerContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24, paddingTop: 12 },
    dateRow: { flexDirection: 'row', height: 200, gap: 12, marginBottom: 16 },
    dateColumn: { flex: 1 },
    dateColumnLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', textAlign: 'center', marginBottom: 8 },
    dateScroll: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12 },
    dateItem: { paddingVertical: 10, alignItems: 'center' },
    dateItemSelected: { backgroundColor: '#3E4C85', borderRadius: 8, marginHorizontal: 4 },
    dateItemText: { fontSize: 15, color: '#374151' },
    dateItemTextSelected: { color: '#FFFFFF', fontWeight: '600' },
    dateConfirmButton: { backgroundColor: '#3E4C85', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
    dateConfirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    currentLocationBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
    currentLocationText: { color: '#425BA4', fontSize: 14, fontWeight: '600' }
});
