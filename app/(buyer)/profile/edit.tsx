import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useUpdateUser, useUpdateProfile, authApi } from '../../../src/services/auth';
import ProfileSetupBanner from '../../../src/components/profile/ProfileSetupBanner';
import { ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { documentClient } from '../../../src/services/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfileCompletion } from '../../../src/hooks/useProfileCompletion';
import { getAvatarUrl, isValidUrl, cleanseImageUrl } from '../../../src/utils/images';
import { uploadApi } from '../../../src/services/upload';
import { API_CONFIG } from '../../../src/services/config';
import * as Location from 'expo-location';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - i);

// AsyncStorage key for profile extras (gender, dob, profile picture)
const PROFILE_EXTRAS_KEY = '@tunzaa_profile_extras';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, refreshProfile, saveAuthResponse } = useTunzaaAuth();
    const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUser();
    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
    const isPending = isUpdatingUser || isUpdatingProfile;
    const { percentage } = useProfileCompletion();

    const initialName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '');
    const [name, setName] = useState(initialName || '');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone_number || '');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [location, setLocation] = useState('');
    const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    // UI state
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Date picker state
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedYear, setSelectedYear] = useState(1997);

    // Load profile data — AsyncStorage first (instant), then API metadata as merge
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userId = user?.user_id || user?.id;
                if (!userId) return;

                // 1. Load from AsyncStorage (instant, always works)
                const storedExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${userId}`);
                const localData = storedExtras ? JSON.parse(storedExtras) : {};

                // 2. Load from API metadata (may be empty if backend hasn't been updated)
                let apiMeta: Record<string, any> = {};
                try {
                    const userData = await authApi.getUserDetails(userId);
                    const profiles = userData?.profiles || [];
                    let profile = profiles.find((p: any) => p.role?.toLowerCase() === 'buyer');
                    if (!profile && profiles.length > 0) profile = profiles[0];
                    apiMeta = profile?.metadata || {};
                } catch (e) {
                    console.warn('[EditProfile] API fetch failed, using local data only');
                }

                // 3. Merge: API takes priority if non-empty, otherwise use local
                const merged = {
                    username: apiMeta.username || localData.username || '',
                    gender: apiMeta.gender || localData.gender || '',
                    date_of_birth: apiMeta.date_of_birth || localData.date_of_birth || '',
                    preferred_location: apiMeta.preferred_location || localData.preferred_location || '',
                    location_coords: apiMeta.location_coords || localData.location_coords || null,
                    profile_picture: apiMeta.profile_picture || localData.profile_picture || '',
                };

                if (merged.username) setUsername(merged.username);
                if (merged.gender) setGender(merged.gender);
                if (merged.profile_picture) setProfileImage(merged.profile_picture);
                if (merged.preferred_location) setLocation(merged.preferred_location);
                if (merged.location_coords) setLocationCoords(merged.location_coords);
                if (merged.date_of_birth) {
                    setDob(merged.date_of_birth);
                    const parts = merged.date_of_birth.split('/');
                    if (parts.length === 3) {
                        setSelectedDay(parseInt(parts[0]) || 1);
                        setSelectedMonth(parseInt(parts[1]) - 1 || 0);
                        setSelectedYear(parseInt(parts[2]) || 1997);
                    }
                }
            } catch (e) {
                console.warn('[EditProfile] Failed to load profile:', e);
            }
        };
        loadProfile();
    }, [user]);

    // ---- Date Picker Confirm ----
    const handleDateConfirm = () => {
        const day = String(selectedDay).padStart(2, '0');
        const month = String(selectedMonth + 1).padStart(2, '0');
        const formatted = `${day}/${month}/${selectedYear}`;
        setDob(formatted);
        setShowDatePicker(false);
    };

    // ---- Location Picker ----
    const handleUseCurrentLocation = async () => {
        setIsFetchingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Please allow access to your location to use this feature.');
                setIsFetchingLocation(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;
            setLocationCoords({ lat: latitude, lng: longitude });

            const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (geocode) {
                const readableLocation = [geocode.street, geocode.city, geocode.region].filter(Boolean).join(', ');
                setLocation(readableLocation || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } else {
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
        } catch (error) {
            console.error('Error fetching location:', error);
            Alert.alert('Error', 'Failed to get current location. Please try again or enter manually.');
        } finally {
            setIsFetchingLocation(false);
        }
    };

    // ---- Profile Photo Picker ----
    const pickImage = async () => {
        try {
            const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permResult.granted) {
                Alert.alert('Permission needed', 'Please allow access to your photo library to change your profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.[0]) return;

            const asset = result.assets[0];
            setProfileImage(asset.uri);

            // Save locally immediately
            const userId = user?.user_id || user?.id;
            if (userId) {
                const storedExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${userId}`);
                const localData = storedExtras ? JSON.parse(storedExtras) : {};
                localData.profile_picture = asset.uri;
                await AsyncStorage.setItem(`${PROFILE_EXTRAS_KEY}_${userId}`, JSON.stringify(localData));
            }

            // Try upload to server in background
            setUploadingPhoto(true);
            try {
                const fileName = asset.uri.split('/').pop() || 'profile.jpg';
                const fileType = asset.mimeType || 'image/jpeg';

                console.log('📸 [EditProfile] Starting upload for:', fileName);
                const uploadResponse = await uploadApi.uploadFile(asset.uri, fileName, fileType);
                console.log('📸 [EditProfile] Full Upload Response:', JSON.stringify(uploadResponse, null, 2));
                
                // Aggressive extraction and cleaning of the URL
                let uploadedUrl = uploadResponse?.fileCDNUrl || uploadResponse?.fileUrl;

                // If we only have 'url', check if it's an upload-only presigned URL (common in Linode/S3 configs)
                if (!uploadedUrl && uploadResponse?.url) {
                    if (uploadResponse.url.includes('PutObject') || uploadResponse.url.includes('X-Amz-Signature')) {
                        console.log('⚠️ [EditProfile] URL appears to be a restricted presigned URL. Attempting to clean...');
                        // Strategy A: Strip query params if it's an S3-like URL (might work if bucket is public-read)
                        const cleanUrl = uploadResponse.url.split('?')[0];
                        
                        // Strategy B: Use the ID to construct a gateway-proxied URL (most reliable in Tunzaa)
                        if (uploadResponse.id) {
                            uploadedUrl = `${API_CONFIG.BASE_URL}/documents/${uploadResponse.id}`;
                            console.log('🔗 [EditProfile] Using ID-based Gateway URL:', uploadedUrl);
                        } else {
                            uploadedUrl = cleanUrl;
                            console.log('🔗 [EditProfile] Using Cleaned URL:', uploadedUrl);
                        }
                    } else {
                        uploadedUrl = uploadResponse.url;
                    }
                }

                // Final fallback to filePath or ID if still nothing
                if (!uploadedUrl && uploadResponse?.id) {
                    uploadedUrl = `${API_CONFIG.BASE_URL}/documents/${uploadResponse.id}`;
                } else if (!uploadedUrl && uploadResponse?.filePath) {
                    const baseUrl = API_CONFIG.BASE_URL.endsWith('/') ? API_CONFIG.BASE_URL.slice(0, -1) : API_CONFIG.BASE_URL;
                    uploadedUrl = `${baseUrl}${uploadResponse.filePath}`;
                }

                console.log('🔗 [EditProfile] Final Resolved URL:', uploadedUrl);

                uploadedUrl = cleanseImageUrl(uploadedUrl);

                if (isValidUrl(uploadedUrl)) {
                    setProfileImage(uploadedUrl!);
                    
                    // Update local storage immediately
                    if (userId) {
                        const storedExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${userId}`);
                        const localData = storedExtras ? JSON.parse(storedExtras) : {};
                        localData.profile_picture = uploadedUrl;
                        await AsyncStorage.setItem(`${PROFILE_EXTRAS_KEY}_${userId}`, JSON.stringify(localData));
                    }

                    // Sync to API Metadata
                    const buyerProfile = user?.profiles?.find((p: any) => p.role === 'buyer') || user?.profiles?.[0];
                    if (userId && buyerProfile?.profile_id) {
                        const meta = (buyerProfile as any).metadata || {};
                        const newMeta = { ...meta, profile_picture: uploadedUrl };
                        
                        console.log('🔄 [EditProfile] Syncing avatar to server profile metadata...');
                        
                        // Use a Promise.all to ensure both sources are updated
                        try {
                            await Promise.all([
                                authApi.updateUserProfile(userId, buyerProfile.profile_id, {
                                    metadata: newMeta
                                }),
                                authApi.updateUser(userId, {
                                    metadata: newMeta
                                }).catch(e => console.log('⚠️ [EditProfile] User object metadata update failed (non-critical):', e.message))
                            ]);
                            console.log('✅ [EditProfile] Server metadata sync successful');
                        } catch (syncErr: any) {
                            console.error('❌ [EditProfile] Profile metadata sync failed:', syncErr.message);
                            Alert.alert('Persistence Error', 'Photo uploaded but could not be linked to your profile on the server.');
                        }
                    }
                    
                    if (refreshProfile) await refreshProfile();
                } else {
                    console.warn('⚠️ [EditProfile] Upload succeeded but returned invalid URL format:', uploadedUrl);
                    Alert.alert('Upload Error', 'The server returned an unrecognized image path format. Please contact support.');
                }
            } catch (uploadError: any) {
                console.error('❌ [EditProfile] Photo upload failed:', uploadError.message);
                Alert.alert('Upload failed', `Failed to upload photo to server: ${uploadError.message}`);
            } finally {
                setUploadingPhoto(false);
            }
        } catch (e) {
            console.error('[EditProfile] Image picker error:', e);
        }
    };

    // ---- Save ----
    const handleSave = async () => {
        console.log('👤 [EditProfile] Full User Object:', JSON.stringify(user, null, 2));
        console.log('🔍 [EditProfile] User object IDs:', { id: user?.id, user_id: user?.user_id });
        const targetUserId = user?.user_id || user?.id;
        if (!targetUserId) {
            Alert.alert('Error', 'No user session found. Please log in again.');
            return;
        }

        try {
            // Prepare Metadata for sync
            const profiles = user?.profiles || [];
            let targetProfile = profiles.find((p: any) => p.role?.toLowerCase() === 'buyer') || profiles[0];
            const updatedMeta = {
                ...(targetProfile?.metadata || {}),
                username: username || undefined,
                gender: gender || undefined,
                date_of_birth: dob || undefined,
                preferred_location: location || undefined,
                location_coords: locationCoords,
                profile_picture: cleanseImageUrl(profileImage || targetProfile?.metadata?.profile_picture || undefined),
            };

            // 1. Update first_name / last_name on Tunzaa API
            const nameParts = name.trim().split(' ');
            const first_name = nameParts[0] || '';
            const last_name = nameParts.slice(1).join(' ');
            
            // 3. Update User Object (First Name, Last Name, Metadata)
            const updatePayload = {
                first_name,
                last_name,
                email: email.trim(), // Fix: Include email in update
                display_name: name.trim(),
                name: name.trim(),
                metadata: updatedMeta // Include metadata here for global persistence
            };

            console.log('📝 [EditProfile] Updating user object with metadata...');
            await authApi.updateUser(targetUserId, updatePayload)
                .then(() => console.log('✅ [EditProfile] User object updated'))
                .catch(err => console.warn('⚠️ [EditProfile] User object update failed:', err.message));

            // 2. Save metadata extras to AsyncStorage (always works)
            const storedExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${targetUserId}`);
            const localData = storedExtras ? JSON.parse(storedExtras) : {};
            if (username) localData.username = username;
            if (gender) localData.gender = gender;
            if (dob) localData.date_of_birth = dob;
            if (location) localData.preferred_location = location;
            if (locationCoords) localData.location_coords = locationCoords;
            await AsyncStorage.setItem(`${PROFILE_EXTRAS_KEY}_${targetUserId}`, JSON.stringify(localData));

            // 3. Also try saving to API metadata
            console.log('👤 [EditProfile] Target Profile:', JSON.stringify(targetProfile, null, 2));

            if (targetProfile?.profile_id) {
                console.log('🔄 [EditProfile] Updating metadata via updateUserProfile...');
                await authApi.updateUserProfile(
                    targetUserId,
                    targetProfile.profile_id,
                    { 
                        display_name: name.trim(),
                        metadata: updatedMeta 
                    }
                ).then(() => {
                    console.log('✅ [EditProfile] Metadata sync successful');
                }).catch((err: any) => {
                    console.warn('❌ [EditProfile] API metadata sync failed:', err.message);
                });
            }

            // 4. Force UI Atomic update
            if (user) {
                const finalUser = JSON.parse(JSON.stringify(user));
                finalUser.first_name = first_name;
                finalUser.last_name = last_name;
                finalUser.name = name.trim();
                finalUser.email = email.trim();
                const pIndex = finalUser.profiles.findIndex((p: any) => p.profile_id === targetProfile?.profile_id);
                if (pIndex > -1) {
                    finalUser.profiles[pIndex].display_name = name.trim();
                    finalUser.profiles[pIndex].metadata = updatedMeta;
                }
                if (saveAuthResponse) await saveAuthResponse(finalUser);
            }

            // 5. Optionally refresh from backend if successful
            if (refreshProfile) {
                await refreshProfile();
            }

            Alert.alert('Success', 'Profile updated successfully!');
            router.back();
        } catch (error: any) {
            console.error('[EditProfile] Save error:', error);
            Alert.alert('Error', error.message || 'Failed to update profile.');
        }
    };

    // ---- Editable Row ----
    const renderEditableRow = (
        label: string,
        value: string,
        setValue: (text: string) => void,
        options?: { keyboardType?: any; editable?: boolean; placeholder?: string }
    ) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setValue}
                    editable={options?.editable !== false}
                    placeholder={options?.placeholder || `Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={options?.keyboardType}
                />
                <Ionicons name="pencil" size={20} color="#6B7280" />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit profile</Text>
                <TouchableOpacity onPress={handleSave} style={styles.iconButton} disabled={isPending}>
                    {isPending ? <ActivityIndicator size="small" color="#1F2937" /> : <Ionicons name="checkmark" size={24} color="#1F2937" />}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Image */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: getAvatarUrl(profileImage || '', name || 'User') }}
                            style={styles.avatar}
                            onError={(e) => console.error('🖼️ [EditProfile] Image Load Error:', e.nativeEvent.error, 'for URL:', profileImage)}
                        />
                        <TouchableOpacity style={styles.cameraButton} onPress={pickImage} disabled={uploadingPhoto}>
                            {uploadingPhoto ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Ionicons name="camera" size={16} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Banner */}
                {percentage < 100 && (
                    <ProfileSetupBanner progress={percentage / 100} points={100 - percentage} />
                )}

                {/* Form */}
                <View style={styles.form}>
                    {renderEditableRow('Name', name, setName)}
                    {renderEditableRow('Username', username, setUsername)}

                    {/* Date of Birth — tappable to open picker */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date of birth</Text>
                        <TouchableOpacity
                            style={styles.inputWrapper}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={[styles.inputValue, !dob && styles.placeholder]}>
                                {dob || 'DD/MM/YYYY'}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {renderEditableRow('Email address', email, setEmail, { keyboardType: 'email-address' })}
                    {renderEditableRow('Phone number', phone, setPhone, { keyboardType: 'phone-pad' })}

                    {/* Gender — tappable dropdown */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Gender</Text>
                        <TouchableOpacity
                            style={styles.inputWrapper}
                            onPress={() => setShowGenderPicker(true)}
                        >
                            <Text style={[styles.inputValue, !gender && styles.placeholder]}>
                                {gender || 'Choose gender'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Location */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Preferred delivery location</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Enter location"
                                placeholderTextColor="#9CA3AF"
                            />
                            <Ionicons name="location-outline" size={20} color="#6B7280" />
                        </View>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }} onPress={handleUseCurrentLocation} disabled={isFetchingLocation}>
                            {isFetchingLocation ? (
                                <ActivityIndicator size="small" color="#425BA4" style={{ marginRight: 6 }} />
                            ) : (
                                <Ionicons name="navigate-circle-outline" size={18} color="#425BA4" style={{ marginRight: 6 }} />
                            )}
                            <Text style={{ color: '#425BA4', fontSize: 14, fontWeight: '600' }}>
                                {isFetchingLocation ? 'Locating...' : 'Use Current Location'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* ========== Gender Picker Modal ========== */}
            <Modal visible={showGenderPicker} transparent animationType="slide">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGenderPicker(false)}
                >
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
                                <Text style={[styles.optionText, gender === option && styles.optionTextSelected]}>
                                    {option}
                                </Text>
                                {gender === option && (
                                    <Ionicons name="checkmark-circle" size={22} color="#3E4C85" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ========== Date Picker Modal ========== */}
            <Modal visible={showDatePicker} transparent animationType="slide">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                >
                    <View style={styles.datePickerContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Select Date of Birth</Text>

                        {/* Day / Month / Year selectors */}
                        <View style={styles.dateRow}>
                            {/* Day */}
                            <View style={styles.dateColumn}>
                                <Text style={styles.dateColumnLabel}>Day</Text>
                                <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                    {DAYS.map((d) => (
                                        <TouchableOpacity
                                            key={d}
                                            style={[styles.dateItem, selectedDay === d && styles.dateItemSelected]}
                                            onPress={() => setSelectedDay(d)}
                                        >
                                            <Text style={[styles.dateItemText, selectedDay === d && styles.dateItemTextSelected]}>
                                                {d}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Month */}
                            <View style={styles.dateColumn}>
                                <Text style={styles.dateColumnLabel}>Month</Text>
                                <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                    {MONTHS.map((m, i) => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[styles.dateItem, selectedMonth === i && styles.dateItemSelected]}
                                            onPress={() => setSelectedMonth(i)}
                                        >
                                            <Text style={[styles.dateItemText, selectedMonth === i && styles.dateItemTextSelected]}>
                                                {m}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Year */}
                            <View style={styles.dateColumn}>
                                <Text style={styles.dateColumnLabel}>Year</Text>
                                <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                                    {YEARS.map((y) => (
                                        <TouchableOpacity
                                            key={y}
                                            style={[styles.dateItem, selectedYear === y && styles.dateItemSelected]}
                                            onPress={() => setSelectedYear(y)}
                                        >
                                            <Text style={[styles.dateItemText, selectedYear === y && styles.dateItemTextSelected]}>
                                                {y}
                                            </Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1F2937',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#EFF6FF',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3E4C85',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    form: {
        marginTop: 16,
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingVertical: 14,
    },
    label: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        paddingVertical: 0,
    },
    inputValue: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    placeholder: {
        color: '#9CA3AF',
    },
    // ---- Modals ----
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
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 4,
    },
    optionRowSelected: {
        backgroundColor: '#EFF6FF',
    },
    optionText: {
        fontSize: 16,
        color: '#374151',
    },
    optionTextSelected: {
        color: '#3E4C85',
        fontWeight: '600',
    },
    // ---- Date Picker ----
    datePickerContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 12,
    },
    dateRow: {
        flexDirection: 'row',
        height: 200,
        gap: 12,
        marginBottom: 16,
    },
    dateColumn: {
        flex: 1,
    },
    dateColumnLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    dateScroll: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    dateItem: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    dateItemSelected: {
        backgroundColor: '#3E4C85',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    dateItemText: {
        fontSize: 15,
        color: '#374151',
    },
    dateItemTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    dateConfirmButton: {
        backgroundColor: '#3E4C85',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    dateConfirmText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
