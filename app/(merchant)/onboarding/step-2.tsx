import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';

export default function Step2Details() {
    const router = useRouter();
    const { user } = useAuth();

    const [shopName, setShopName] = useState('');
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!shopName) {
            alert('Tafadhali weka jina la kampuni');
            return;
        }

        setLoading(true);
        try {
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        business_name: shopName,
                        phone_number: phone,
                        shop_description: description
                    } as any)
                    .eq('id', user.id);

                if (error) throw error;
            }
            router.push('/(merchant)/onboarding/step-3');
        } catch (e) {
            console.error('Error saving step 2:', e);
            alert('Failed to save details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Weka Taarifa Za Duka</Text>
            <Text style={styles.subtitle}>
                Logo, jina la duka na maelezo ya duka ni muhimu katika kuunda duka lako Tunzaa.
            </Text>

            <View style={styles.card}>

                {/* Logo Upload Placeholder */}
                <View style={styles.logoUploadContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>Weka logo*</Text>
                        <TouchableOpacity style={styles.plusButton}>
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Inputs */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Jina la kampuni</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="+255 787 118 486" // Using placeholder to match design/mockup style
                        value={shopName}
                        onChangeText={setShopName}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Weka Maelezo zaidi *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Weka maelezo hapa..."
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>Isizidi maneno 240</Text>
                </View>

                <Text style={styles.requiredText}>Sehemu ya lazima *</Text>
            </View>

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
        marginBottom: 30,
        paddingHorizontal: 30,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        minHeight: 380,
    },
    logoUploadContainer: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: -10,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    logoText: {
        fontSize: 12,
        color: '#6B7280',
    },
    plusButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#425BA4',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
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
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: 4,
    },
    requiredText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        marginBottom: 20,
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
        backgroundColor: '#84CC16', // Lime Green
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
