import { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Complete Profile Screen
 * Avatar upload, gender dropdown, date picker, location nav
 */
export default function CompleteProfileScreen() {
    const router = useRouter();

    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [location, setLocation] = useState('');

    const handleContinue = () => {
        console.log('Profile:', { gender, dateOfBirth, location });
        router.push('/home');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.contentWrapper}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Complete your profile</Text>
                        <Text style={styles.subtitle}>
                            Help us personalize your experience
                        </Text>
                    </View>

                    {/* Avatar Upload Placeholder */}
                    <TouchableOpacity style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                        </View>
                        <View style={styles.addIconBadge}>
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarLabel}>Add Profile Photo</Text>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Gender Dropdown (simplified as TextInput for now) */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.dropdownContainer}>
                                <TextInput
                                    style={styles.dropdownInput}
                                    placeholder="Select gender"
                                    placeholderTextColor="#666666"
                                    value={gender}
                                    onChangeText={setGender}
                                />
                                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                            </View>
                        </View>

                        {/* Date of Birth */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <View style={styles.dropdownContainer}>
                                <TextInput
                                    style={styles.dropdownInput}
                                    placeholder="MM/DD/YYYY"
                                    placeholderTextColor="#666666"
                                    value={dateOfBirth}
                                    onChangeText={setDateOfBirth}
                                />
                                <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                            </View>
                        </View>

                        {/* Preferred Location */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Preferred Location</Text>
                            <TouchableOpacity style={styles.locationRow}>
                                <View style={styles.locationContent}>
                                    <Ionicons name="location-outline" size={20} color="#3B5191" />
                                    <Text style={styles.locationText}>
                                        {location || 'Select location'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>

                {/* Skip Button - Pinned to Bottom */}
                <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/home')}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Text style={styles.skipArrow}>→</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 20,
        justifyContent: 'space-between',
    },

    contentWrapper: {
        width: '100%',
        maxWidth: 353,
        alignSelf: 'center',
    },

    header: {
        marginBottom: 32,
    },

    title: {
        fontFamily: 'System',
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1E1F',
        textAlign: 'center',
        marginBottom: 8,
    },

    subtitle: {
        fontFamily: 'System',
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },

    // Avatar
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 12,
        position: 'relative',
    },

    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },

    addIconBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3B5191',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },

    avatarLabel: {
        fontFamily: 'System',
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 24,
    },

    // Form
    formContainer: {
        gap: 20,
        marginBottom: 32,
    },

    inputWrapper: {
        gap: 8,
    },

    label: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '600',
        color: '#1D1E1F',
    },

    dropdownContainer: {
        height: 54,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },

    dropdownInput: {
        flex: 1,
        fontFamily: 'System',
        fontSize: 16,
        color: '#1D1E1F',
    },

    locationRow: {
        height: 54,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },

    locationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    locationText: {
        fontFamily: 'System',
        fontSize: 16,
        color: '#666666',
    },

    continueButton: {
        height: 54,
        backgroundColor: '#3B5191',
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },

    continueButtonText: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    skipButton: {
        width: 190,
        height: 54,
        borderRadius: 1000,
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 18,
        marginTop: 6,
    },

    skipText: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        letterSpacing: -0.24,
        color: '#3B5191',
    },

    skipArrow: {
        fontSize: 20,
        color: '#3B5191',
        lineHeight: 20,
    },
});
