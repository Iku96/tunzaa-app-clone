import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';

export default function Step1Documents() {
    const router = useRouter();
    const { user } = useAuth();

    const [license, setLicense] = useState('');
    const [tin, setTin] = useState('');
    const [brela, setBrela] = useState('');

    // File states
    const [licenseFile, setLicenseFile] = useState<any>(null);
    const [tinFile, setTinFile] = useState<any>(null);
    const [brelaFile, setBrelaFile] = useState<any>(null);

    const [loading, setLoading] = useState(false);

    const pickDocument = async (setFile: any) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all types, or specific like 'application/pdf' or 'image/*'
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                setFile(result.assets[0]);
            }
        } catch (err) {
            console.error('Unknown error picking document:', err);
        }
    };

    const handleNext = async () => {
        // Validation (optional based on requirements, for now allowing skip/empty)
        setLoading(true);
        try {
            if (user) {
                // Save progress to profile
                // Note: In a real app, we would upload the files to Supabase Storage here 
                // and save the URLs. For now, we save the text numbers.
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        business_license_number: license,
                        tin_number: tin,
                        brela_certificate_number: brela
                    } as any)
                    .eq('id', user.id);

                if (error) throw error;
            }
            router.push('/(merchant)/onboarding/step-2');
        } catch (e) {
            console.error('Error saving step 1:', e);
            alert('Failed to save details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hati Za Biashara</Text>
            <Text style={styles.subtitle}>
                Ni muhimu kuambatanisha hati za biashara kwa usalama zaidi wa akaunti yako.
            </Text>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.card}>
                    <View style={styles.formHeader}>
                        <Ionicons name="cloud-upload-outline" size={20} color="#84CC16" />
                        <Text style={styles.formHeaderText}>Pakia taarifa zifuatazo</Text>
                    </View>

                    {/* License Section */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Leseni ya Biashara</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingiza namba ya leseni"
                            value={license}
                            onChangeText={setLicense}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocument(setLicenseFile)}>
                            <Ionicons name={licenseFile ? "checkmark-circle" : "attach"} size={20} color={licenseFile ? "#84CC16" : "#4B5563"} />
                            <Text style={[styles.uploadText, licenseFile && { color: '#84CC16' }]}>
                                {licenseFile ? licenseFile.name : 'Pakia Leseni (PDF/Picha)'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* TIN Section */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>TIN ya Biashara</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingiza namba ya TIN"
                            keyboardType="numeric"
                            value={tin}
                            onChangeText={setTin}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocument(setTinFile)}>
                            <Ionicons name={tinFile ? "checkmark-circle" : "attach"} size={20} color={tinFile ? "#84CC16" : "#4B5563"} />
                            <Text style={[styles.uploadText, tinFile && { color: '#84CC16' }]}>
                                {tinFile ? tinFile.name : 'Pakia TIN (PDF/Picha)'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* BRELA Section */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Cheti cha usajili BRELA</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingiza namba ya usajili"
                            value={brela}
                            onChangeText={setBrela}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocument(setBrelaFile)}>
                            <Ionicons name={brelaFile ? "checkmark-circle" : "attach"} size={20} color={brelaFile ? "#84CC16" : "#4B5563"} />
                            <Text style={[styles.uploadText, brelaFile && { color: '#84CC16' }]}>
                                {brelaFile ? brelaFile.name : 'Pakia Cheti (PDF/Picha)'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/(merchant)/onboarding/step-2')}>
                        <Text style={styles.skipLink}>Weka baadaye</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.buttonTextOutline}>Rudi</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Inahifadhi...' : 'Endelea'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 10,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    formHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
        marginBottom: 8,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    uploadText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
    },
    skipLink: {
        color: '#EF4444',
        textAlign: 'right',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    backButton: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 30,
        minWidth: 100,
        alignItems: 'center',
    },
    nextButton: {
        backgroundColor: '#84CC16',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 30,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextOutline: {
        color: '#FFFFFF',
        fontSize: 16,
    }
});
