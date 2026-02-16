import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';

export default function DeliveryLoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saveInfo, setSaveInfo] = useState(false);

    const handleLogin = async () => {
        if (!phone || !password) {
            alert('Tafadhali jaza taarifa zote');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                phone: `+255${phone}`, // Assuming +255 prefix logic
                password: password,
            });

            if (error) throw error;

            // Success -> Navigate to home/dashboard
            alert('Umeingia kikamilifu!');
            // router.replace('/(delivery)/home'); // TODO: Create home screen
        } catch (e: any) {
            alert(e.message || 'Namba ya simu au neno siri si sahihi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.container}>

                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Ingia</Text>
                            </View>

                            {/* Form */}
                            <View style={styles.formContainer}>

                                {/* Phone Number */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Namba ya simu</Text>
                                    <View style={styles.phoneInputContainer}>
                                        <Text style={styles.countryCode}>+255</Text>
                                        <TextInput
                                            style={styles.phoneInput}
                                            value={phone}
                                            onChangeText={setPhone}
                                            keyboardType="phone-pad"
                                            placeholder="787 118 486"
                                            placeholderTextColor="#9CA3AF"
                                            maxLength={9}
                                        />
                                    </View>
                                </View>

                                {/* Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Neno siri</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            placeholder="••••••"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={24}
                                                color="#315BA9"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Options Row */}
                                <View style={styles.optionsRow}>
                                    <TouchableOpacity
                                        style={styles.checkboxContainer}
                                        onPress={() => setSaveInfo(!saveInfo)}
                                    >
                                        <View style={[styles.checkbox, saveInfo && styles.checkboxChecked]}>
                                            {saveInfo && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                                        </View>
                                        <Text style={styles.checkboxLabel}>Hifadhi taarifa</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity>
                                        <Text style={styles.forgotPassword}>Umesahau neno siri?</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Sign Up Link */}
                                <View style={styles.signUpContainer}>
                                    <TouchableOpacity onPress={() => router.push('/delivery-register' as any)}>
                                        <Text style={styles.signUpLink}>Fungua Akaunti</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Footer Buttons */}
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={handleLogin}
                                    disabled={loading}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {loading ? 'Inaingia...' : 'Endelea'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={() => router.back()}
                                >
                                    <Text style={styles.secondaryButtonText}>Rudi</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 80,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#315BA9',
        fontFamily: 'Gilroy-Bold',
    },
    formContainer: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    countryCode: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '500',
        marginRight: 8,
    },
    phoneInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#315BA9',
        fontWeight: '600',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 24,
        color: '#315BA9',
        fontWeight: '600',
        letterSpacing: 4,
    },
    eyeIcon: {
        padding: 4,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxChecked: {
        backgroundColor: '#315BA9',
        borderColor: '#315BA9',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#315BA9',
    },
    forgotPassword: {
        fontSize: 14,
        color: '#315BA9',
        fontWeight: '600',
    },
    signUpContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    signUpLink: {
        fontSize: 16,
        color: '#315BA9',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    footer: {
        marginTop: 'auto',
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#315BA9',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#315BA9',
        fontSize: 16,
        fontWeight: '600',
    },
});
