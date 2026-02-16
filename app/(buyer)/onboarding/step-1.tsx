<<<<<<< HEAD
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Need to install if we want native picker, utilizing text input for now or simplified date picker if available

export default function Step1Profile() {
    const router = useRouter();
    const { user } = useAuth();

    // State
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState(''); // Text input for MVP: YYYY-MM-DD
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        setLoading(true);
        try {
            if (user) {
                // Formatting DOB if needed, assuming user enters YYYY-MM-DD for now
                const updates: any = {
                    gender,
                    delivery_location: location,
                };
                if (dob) updates.date_of_birth = dob;

                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);

                if (error) throw error;
            }
            router.push('/(buyer)/onboarding/step-2');
        } catch (e) {
            console.error('Error saving profile:', e);
            alert('Failed to save details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Complete your profile</Text>
                <Text style={styles.subtitle}>
                    Hey there, let's add a few more details about you.
                </Text>

                {/* Avatar Upload */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={60} color="#E5E7EB" />
                        <TouchableOpacity style={styles.cameraButton}>
                            <Ionicons name="camera" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Choose gender</Text>
                        <View style={styles.genderRow}>
                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'Male' && styles.genderOptionSelected]}
                                onPress={() => setGender('Male')}
                            >
                                <Text style={[styles.genderText, gender === 'Male' && styles.genderTextSelected]}>Male</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'Female' && styles.genderOptionSelected]}
                                onPress={() => setGender('Female')}
                            >
                                <Text style={[styles.genderText, gender === 'Female' && styles.genderTextSelected]}>Female</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                value={dob}
                                onChangeText={setDob}
                                placeholderTextColor="#9CA3AF"
                            />
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Preferred delivery location</Text>
                        <TouchableOpacity style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Select location"
                                value={location}
                                onChangeText={setLocation}
                                placeholderTextColor="#9CA3AF"
                                editable={true} // In real app, maybe opens a modal
                            />
                            <Ionicons name="chevron-forward" size={20} color="#6B7280" style={styles.inputIcon} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleNext} disabled={loading}>
                        <Text style={styles.continueButtonText}>{loading ? 'Saving...' : 'Continue'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(buyer)/onboarding/step-2')}>
                        <Text style={styles.skipText}>Skip</Text>
                        <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#425BA4',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    form: {
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    genderRow: {
        flexDirection: 'row',
        gap: 12,
    },
    genderOption: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    genderOptionSelected: {
        borderColor: '#425BA4',
        backgroundColor: '#EFF6FF',
    },
    genderText: {
        color: '#1F2937',
        fontWeight: '500',
    },
    genderTextSelected: {
        color: '#425BA4',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    inputIcon: {
        paddingRight: 12,
    },
    footer: {
        gap: 20,
        alignItems: 'center',
        marginBottom: 40,
    },
    continueButton: {
        width: '100%',
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    skipText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
});
=======
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Need to install if we want native picker, utilizing text input for now or simplified date picker if available

export default function Step1Profile() {
    const router = useRouter();
    const { user } = useAuth();

    // State
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        setLoading(true);
        try {
            if (user) {
                const updates: any = {
                    gender,
                    delivery_location: location,
                };
                if (dob) updates.date_of_birth = dob;

                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);

                if (error) throw error;
            }
            router.push('/(buyer)/onboarding/step-2');
        } catch (e) {
            console.error('Error saving profile:', e);
            alert('Failed to save details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Header - Back Button Only */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>

                {/* Typography Block */}
                <View style={styles.textBlock}>
                    <Text style={styles.title}>Complete your profile</Text>
                    <Text style={styles.subtitle}>
                        Hey John, let’s add a few more details
                    </Text>
                </View>

                {/* Avatar Component */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={64} color="#A3A3A3" />
                        <TouchableOpacity style={styles.editBadge}>
                            <Ionicons name="camera" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    {/* Gender */}
                    <TouchableOpacity style={styles.inputField}>
                        <Text style={[styles.inputText, !gender && styles.placeholderText]}>
                            {gender || 'Choose gender'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666666" />
                    </TouchableOpacity>

                    {/* Date of Birth */}
                    <View style={styles.inputField}>
                        <Text style={[styles.inputText, !dob && styles.placeholderText]}>
                            {dob || 'Date of birth'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#666666" />
                        <TextInput
                            style={styles.hiddenInput}
                            value={dob}
                            onChangeText={setDob}
                        />
                    </View>

                    {/* Location */}
                    <TouchableOpacity style={styles.inputField}>
                        <Text style={[styles.inputText, !location && styles.placeholderText]}>
                            {location || 'Preferred delivery location'}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#666666" />
                        <TextInput
                            style={styles.hiddenInput}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Footer Actions - Pushed to bottom outside scroll if desired, or at bottom of scroll. Spec says 'Footer Actions'. 
                 Usually sticky footer is better for onboarding. */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.continueButton} onPress={handleNext} disabled={loading}>
                    <Text style={styles.continueButtonText}>{loading ? 'Saving...' : 'Continue'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(buyer)/onboarding/step-2')}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Ionicons name="arrow-forward" size={16} color="#3E4C85" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 60, // Basic safe area
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 120, // Space for footer
    },
    header: {
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
        marginLeft: -4, // Align with grid
    },
    textBlock: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold', // Semi-Bold or Bold
        color: '#1A1A1A', // Dark Charcoal
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666666', // Muted Grey
        textAlign: 'center',
        fontWeight: '400',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F0F0F0', // Light Grey
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0, // 4 o'clock position approx
        backgroundColor: '#3E4C85', // Primary Indigo
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    form: {
        gap: 16, // Vertical spacing between fields
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB', // Light grey border
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        height: 56,
    },
    inputText: {
        fontSize: 15,
        color: '#1A1A1A',
        flex: 1,
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    hiddenInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        alignItems: 'center',
        gap: 20,
    },
    continueButton: {
        width: '100%',
        backgroundColor: '#3E4C85', // Primary Indigo
        paddingVertical: 18,
        borderRadius: 30, // Highly rounded
        alignItems: 'center',
        shadowColor: "#3E4C85",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
    },
    skipText: {
        color: '#3E4C85', // Primary Indigo
        fontSize: 16,
        fontWeight: '500',
    },
});
>>>>>>> a87b5473653da7e83b76f489de7bf8d133b2f9b3
