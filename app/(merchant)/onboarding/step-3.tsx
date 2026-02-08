import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';

export default function Step3Location() {
    const router = useRouter();
    const { user } = useAuth();

    // In a real app, these would be dropdowns/selects
    const [region, setRegion] = useState('');
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');
    const [extraInfo, setExtraInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        setLoading(true);
        try {
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        region,
                        district,
                        ward,
                        onboarding_step: 'completed'
                    } as any)
                    .eq('id', user.id);

                if (error) throw error;
            }
            // For MVP, we finish here and go to dashboard
            router.replace('/(merchant)/live-orders');
        } catch (e) {
            console.error('Error saving step 3:', e);
            alert('Failed to save details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Eneo La Duka</Text>
            <Text style={styles.subtitle}>
                Wezesha wateja kufata bidhaa kwa urahisi kwa kuweka eneo la duka lako.
            </Text>

            <View style={styles.card}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mkoa</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Chagua Mkoa"
                        value={region}
                        onChangeText={setRegion}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Wilaya</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Chagua Wilaya"
                        value={district}
                        onChangeText={setDistrict}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kata</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Chagua Kata"
                        value={ward}
                        onChangeText={setWard}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Maelezo ya ziada</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nyumba ya shule..."
                        value={extraInfo}
                        onChangeText={setExtraInfo}
                    />
                </View>

                <Text style={styles.helperLink}>Una Duka zaidi ya eneo moja? <Text style={{ color: '#425BA4' }}>Ongeza Duka</Text></Text>
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
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        minHeight: 350,
    },
    inputGroup: {
        marginBottom: 24, // Universal spacing
    },
    label: {
        fontSize: 14, // Increased size
        fontWeight: '500',
        color: '#374151', // Gray-700
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB', // Gray-300
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827', // Gray-900
        backgroundColor: '#FFFFFF',
    },
    helperLink: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 12,
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
