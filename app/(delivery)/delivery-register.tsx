import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Alert // ✅ Added Alert import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';

export default function DeliveryRegisterScreen() {
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Error states
    const [errors, setErrors] = useState({
        fullName: false,
        phone: false,
        password: false
    });

    // Custom error message for name
    const [nameErrorMsg, setNameErrorMsg] = useState('');

    // ✅ VALIDATION LOGIC
    const isValid = () => {
        const isNameValid = !errors.fullName && fullName.trim().split(' ').length >= 2;
        const isPhoneValid = phone.length === 9;
        const isPasswordValid = password.length >= 6;
        return isNameValid && isPhoneValid && isPasswordValid && !loading;
    };

    const handleNameChange = (text: string) => {
        setFullName(text);

        // 1. Check for invalid characters (numbers/symbols)
        const hasInvalidChars = /[^a-zA-Z\s\-\']/.test(text);

        // 2. Check for single name
        const isSingleName = text.trim().split(' ').length < 2;

        if (hasInvalidChars) {
            setErrors(prev => ({ ...prev, fullName: true }));
            setNameErrorMsg('Jina haliwezi kuwa na namba au alama');
        } else {
            // Reset error if chars are valid (we handle single name error on blur or button press)
            setErrors(prev => ({ ...prev, fullName: false }));
            setNameErrorMsg('');
        }
    };

    const handlePhoneChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        setPhone(cleaned);
        const hasError = cleaned.length > 0 && cleaned.length !== 9;
        setErrors(prev => ({ ...prev, phone: hasError }));
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        const hasError = text.length > 0 && text.length < 6;
        setErrors(prev => ({ ...prev, password: hasError }));
    };

    const handleRegister = async () => {
        // Final check for Full Name (Must be 2 words)
        if (fullName.trim().split(' ').length < 2) {
            setErrors(prev => ({ ...prev, fullName: true }));
            setNameErrorMsg('Tafadhali andika jina kamili (majina mawili)');
            return;
        }

        if (!isValid()) return;

        setLoading(true);
        try {
            // 1. Sign Up (Initiates OTP)
            const { data, error: signUpError } = await supabase.auth.signUp({
                phone: `+255${phone}`,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'delivery',
                    }
                }
            });

            if (signUpError) throw signUpError;

            // ✅ CRITICAL FIX: Removed "if (data.session)" check.
            // Phone Auth does NOT create a session until OTP is verified.
            // We assume success if no error was thrown.

            // 2. Navigate to OTP Screen
            router.push({
                pathname: '/delivery-otp' as any,
                params: {
                    phone: phone,
                    fullName: fullName,
                    password: password
                }
            });

        } catch (e: any) {
            Alert.alert('Hitilafu', e.message || 'Hitilafu imetokea wakati wa kusajili');
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
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.container}>

                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Jisajili</Text>
                            </View>

                            {/* Form */}
                            <View style={styles.formContainer}>

                                {/* Full Name Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Jina kamili</Text>
                                    <TextInput
                                        style={[styles.input, errors.fullName && styles.inputError]}
                                        value={fullName}
                                        onChangeText={handleNameChange}
                                        placeholder="Jeremiah Charles"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                    {/* Show specific name error */}
                                    {(errors.fullName || (fullName.length > 0 && fullName.trim().split(' ').length < 2)) && (
                                        <View style={styles.errorRow}>
                                            <Ionicons name="close-circle" size={16} color="#EF4444" />
                                            <Text style={styles.errorText}>
                                                {nameErrorMsg || 'Tafadhali andika jina kamili (majina mawili)'}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Phone Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Namba ya simu</Text>
                                    <View style={[styles.phoneInputContainer, errors.phone && styles.inputError]}>
                                        <Text style={styles.countryCode}>+255</Text>
                                        <TextInput
                                            style={styles.phoneInput}
                                            value={phone}
                                            onChangeText={handlePhoneChange}
                                            keyboardType="phone-pad"
                                            placeholder="787 118 486"
                                            placeholderTextColor="#9CA3AF"
                                            maxLength={9}
                                        />
                                    </View>
                                    {errors.phone && (
                                        <View style={styles.errorRow}>
                                            <Ionicons name="close-circle" size={16} color="#EF4444" />
                                            <Text style={styles.errorText}>Tafadhali weka namba sahihi (tarakimu 9)</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Neno siri</Text>
                                    <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={password}
                                            onChangeText={handlePasswordChange}
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
                                    {errors.password && (
                                        <View style={styles.errorRow}>
                                            <Ionicons name="close-circle" size={16} color="#EF4444" />
                                            <Text style={styles.errorText}>Neno siri liwe na angalau herufi 6</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Info & Login Link */}
                                <View style={styles.infoRow}>
                                    <Ionicons name="information-circle-outline" size={20} color="#315BA9" />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                        <Text style={styles.infoText}>Zingatia kuweka tarakimu 6 au zaidi</Text>
                                        <TouchableOpacity onPress={() => router.push('/delivery-login' as any)}>
                                            <Text style={styles.loginLink}>Nina Akaunti</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Terms Text */}
                                <Text style={styles.termsText}>
                                    Kwa Kujiandikisha Unakubali <Text style={styles.linkText}>Sheria Na Masharti</Text>
                                    {'\n'}Na <Text style={styles.linkText}>Faragha Sera</Text> Ya Tunzaa Plus. Tazama Notisi
                                    {'\n'}Yetu Ya <Text style={styles.linkText}>Faragha Ya Wauzaji</Text>.
                                </Text>

                            </View>

                            {/* Footer Buttons */}
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[styles.primaryButton, !isValid() && styles.disabledButton]}
                                    onPress={handleRegister}
                                    disabled={!isValid()}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {loading ? 'Inasajili...' : 'Endelea'}
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
        paddingTop: 100,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#315BA9',
        fontFamily: 'Gilroy-Bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'System',
    },
    formContainer: {
        marginBottom: 30,
    },
    inputGroup: {
        marginTop: 16,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        fontWeight: '600',
        color: '#315BA9',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 6,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '500',
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    infoText: {
        fontSize: 13,
        color: '#315BA9',
        marginLeft: 8,
        flex: 1,
    },
    loginLink: {
        fontSize: 13,
        color: '#315BA9',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    termsText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 20,
        textAlign: 'left',
    },
    linkText: {
        color: '#84CC16',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    footer: {
        marginTop: 40,
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
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#9CA3AF',
    },
});