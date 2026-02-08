
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Step1Profile() {
    const router = useRouter();
    const { user } = useAuth();

    // States
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [location, setLocation] = useState('');
    const [profileImage, setProfileImage] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                setProfileImage(result.assets[0]);
            }
        } catch (err) {
            console.error('Error picking image:', err);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            const updates: any = {
                gender,
                date_of_birth: dob, // Ensure YYYY-MM-DD format in real app
                delivery_location: location,
                // In real app, upload image to storage and get URL
                // avatar_url: uploadedUrl 
            };

            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);

                if (error) throw error;
            }

            router.push('/(buyer)/onboarding/step-2-interests');
        } catch (e: any) {
            console.error('Error saving profile:', e);
            Alert.alert('Error', 'Failed to save profile details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Kamilisha Wasifu Wako</Text>
                    <Text style={styles.subtitle}>Tueleze kidogo kukuhusu ili, tukuhudumie vyema.</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Profile Image Picker */}
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="camera" size={32} color="#9CA3AF" />
                                </View>
                            )}
                            <View style={styles.editIcon}>
                                <Ionicons name="pencil" size={14} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.imageText}>Weka picha ya wasifu</Text>
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Jinsia</Text>
                        <View style={styles.genderContainer}>
                            {['Male', 'Female', 'Other'].map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.genderButton, gender === g && styles.genderButtonSelected]}
                                    onPress={() => setGender(g)}
                                >
                                    <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>
                                        {g === 'Male' ? 'Mwanaume' : g === 'Female' ? 'Mwanamke' : 'Nyingine'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* DOB Input (Text for now) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tarehe ya Kuzaliwa</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#9CA3AF"
                            value={dob}
                            onChangeText={setDob}
                        />
                    </View>

                    {/* Location Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mahali unapoishi (Wilaya/Mkoa)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mfano: Kinondoni, Dar es Salaam"
                            placeholderTextColor="#9CA3AF"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Inahifadhi...' : 'Endelea'}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
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
        paddingHorizontal: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    imageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#425BA4',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    imageText: {
        marginTop: 12,
        fontSize: 14,
        color: '#425BA4',
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFF',
        alignItems: 'center',
    },
    genderButtonSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: '#425BA4',
    },
    genderText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    genderTextSelected: {
        color: '#425BA4',
        fontWeight: '600',
    },
    footer: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    nextButton: {
        backgroundColor: '#425BA4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
