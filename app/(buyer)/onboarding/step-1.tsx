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
