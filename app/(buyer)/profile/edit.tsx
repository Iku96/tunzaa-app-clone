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

    const initialName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '');
    const [name, setName] = useState(initialName || '');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone_number || '');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
                    let profile = profiles.find((p: any) => p.role === 'buyer');
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
                    profile_picture: apiMeta.profile_picture || localData.profile_picture || '',
                };

                if (merged.username) setUsername(merged.username);
                if (merged.gender) setGender(merged.gender);
                if (merged.profile_picture) setProfileImage(merged.profile_picture);
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
                const formData = new FormData();
                const fileName = asset.uri.split('/').pop() || 'profile.jpg';
                const fileType = asset.mimeType || 'image/jpeg';

                formData.append('file', {
                    uri: asset.uri,
                    name: fileName,
                    type: fileType,
                } as any);

                const uploadResponse = await documentClient.post('/upload', formData);
                const uploadedUrl = uploadResponse.data?.url || uploadResponse.data?.file_url;

                if (uploadedUrl) {
                    setProfileImage(uploadedUrl);
                    // Update local storage with the server URL
                    if (userId) {
                        const storedExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${userId}`);
                        const localData = storedExtras ? JSON.parse(storedExtras) : {};
                        localData.profile_picture = uploadedUrl;
                        await AsyncStorage.setItem(`${PROFILE_EXTRAS_KEY}_${userId}`, JSON.stringify(localData));
                    }
                    // Also try API metadata save
                    const buyerProfile = user?.profiles?.find((p: any) => p.role === 'buyer') || user?.profiles?.[0];
                    if (userId && buyerProfile?.profile_id) {
                        const meta = (buyerProfile as any).metadata || {};
                        await authApi.updateUserProfile(userId, buyerProfile.profile_id, {
                            metadata: { ...meta, profile_picture: uploadedUrl }
                        }).catch(() => { });
                    }
                    if (refreshProfile) await refreshProfile();
                }
            } catch (uploadError: any) {
                console.warn('[EditProfile] Photo upload failed:', uploadError.message);
                Alert.alert('Upload failed', 'Photo saved locally but could not be uploaded to server.');
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
            // 1. Update first_name / last_name on Tunzaa API
            const nameParts = name.trim().split(' ');
            const first_name = nameParts[0] || '';
            const last_name = nameParts.slice(1).join(' ');

            try {
                console.log('📝 [EditProfile] Attempting to update user via /users/profile');
                await updateProfile({ first_name, last_name, name: name.trim() });
            } catch (err: any) {
                console.warn('⚠️ [EditProfile] /users/profile failed, trying fallback /users/:id', err.message);
                await updateUser({
                    userId: targetUserId,
                    data: { first_name, last_name, name: name.trim() }
                });
            }

            // 2. Save metadata extras to AsyncStorage (always works)
            const storedExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${targetUserId}`);
            const localData = storedExtras ? JSON.parse(storedExtras) : {};
            if (username) localData.username = username;
            if (gender) localData.gender = gender;
            if (dob) localData.date_of_birth = dob;
            await AsyncStorage.setItem(`${PROFILE_EXTRAS_KEY}_${targetUserId}`, JSON.stringify(localData));

            // 3. Also try saving to API metadata (will work once backend is updated)
            const profiles = user?.profiles || [];
            let targetProfile = profiles.find((p: any) => p.role === 'buyer') || profiles[0];
            console.log('👤 [EditProfile] Target Profile:', JSON.stringify(targetProfile, null, 2));
            const updatedMeta = {
                ...(targetProfile?.metadata || {}),
                username: username || undefined,
                gender: gender || undefined,
                date_of_birth: dob || undefined,
            };

            if (targetProfile?.profile_id) {
                await authApi.updateUserProfile(
                    targetUserId,
                    targetProfile.profile_id,
                    { 
                        display_name: name.trim(),
                        metadata: updatedMeta 
                    }
                ).catch((err: any) => {
                    console.warn('[EditProfile] API metadata save failed (not critical):', err.message);
                });
            }

            // 4. Force UI Atomic update
            if (user) {
                const finalUser = JSON.parse(JSON.stringify(user));
                finalUser.first_name = first_name;
                finalUser.last_name = last_name;
                finalUser.name = name.trim();
                
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
                            source={{ uri: profileImage || `https://ui-avatars.com/api/?name=${name || 'User'}&background=eff6ff&color=425ba4` }}
                            style={styles.avatar}
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
                <ProfileSetupBanner progress={0.5} points={50} />

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
