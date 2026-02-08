import { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';
import { Ionicons, FontAwesome, FontAwesome6 } from '@expo/vector-icons';

/**
 * Registration Screen (Figma-accurate)
 * 
 * Layout:
 * - SafeAreaView with space-between (top content + bottom Skip)
 * - White inputs instead of gray
 * - Divider with horizontal lines
 * - Wordmark logo (wide, not square)
 * - Blue Skip button pinned to bottom
 * - Social icons using Ionicons
 */
export default function RegisterScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    const [firstName, setFirstName] = useState('');
    const [secondName, setSecondName] = useState('');
    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleCreateAccount = () => {
        // TODO: Implement registration with Supabase
        if (!agreedToTerms) {
            alert('Please agree to Terms and Conditions');
            return;
        }
        console.log('Creating account:', { firstName, secondName, phoneOrEmail });
        router.push('/home');
    };

    const handleSocialLogin = (provider: string) => {
        // TODO: Implement social login
        console.log('Social login:', provider);
    };

    const handleLogin = () => {
        router.push('/login');
    };

    const handleSkip = () => {
        router.push('/home');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Top section */}
                <View>
                    {/* Back Button */}
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={22} color="#111827" />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Create an account</Text>
                        <Text style={styles.subtitle}>Please fill in your details to get started</Text>
                    </View>

                    {/* Logo (wordmark) */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/blue-tunzaa-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Inputs */}
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your first name"
                            placeholderTextColor="#9CA3AF"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your second name"
                            placeholderTextColor="#9CA3AF"
                            value={secondName}
                            onChangeText={setSecondName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number or email"
                            placeholderTextColor="#9CA3AF"
                            value={phoneOrEmail}
                            onChangeText={setPhoneOrEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Terms */}
                    <TouchableOpacity
                        style={styles.termsContainer}
                        onPress={() => setAgreedToTerms(!agreedToTerms)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: agreedToTerms }}
                    >
                        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                            {agreedToTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                        <Text style={styles.termsText}>
                            I agree to the <Text style={styles.termsLink}>Terms and Conditions</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Create button */}
                    <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount}>
                        <Text style={styles.createButtonText}>Create Account</Text>
                    </TouchableOpacity>

                    {/* Divider with lines */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social */}
                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('google')}>
                            <FontAwesome name="google" size={20} color="#EA4335" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('apple')}>
                            <Ionicons name="logo-apple" size={22} color="#111827" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('facebook')}>
                            <FontAwesome name="facebook-f" size={20} color="#1877F2" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('x')}>
                            <FontAwesome6 name="x-twitter" size={20} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    {/* Login */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={handleLogin}>
                            <Text style={styles.loginLink}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom section: Skip pinned */}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Text style={styles.skipArrow}>→</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 18,
        justifyContent: 'space-between',
    },

    backButton: {
        alignSelf: 'flex-start',
        padding: 8,
        marginTop: 6,
    },

    header: {
        alignItems: 'center',
        marginTop: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        marginTop: 6,
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
    },

    logoContainer: {
        alignItems: 'center',
        marginTop: 22,
        marginBottom: 18,
    },
    // wordmark shape (wide, short) - bigger to match Figma
    logo: {
        width: 170,
        height: 60,
    },

    formContainer: {
        gap: 16,
        marginTop: 6,
    },
    input: {
        height: 54,
        backgroundColor: '#FFFFFF',   // Figma white inputs
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#111827',
    },

    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#425BA4',
        borderColor: '#425BA4',
    },
    termsText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,  // Better baseline alignment
    },
    termsLink: {
        color: '#425BA4',
        textDecorationLine: 'underline',
    },

    createButton: {
        height: 58,
        marginTop: 18,
        backgroundColor: '#425BA4',
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 12,
        color: '#9CA3AF',   // Lighter like Figma
    },

    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 14,
        marginBottom: 18,
    },
    socialButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    loginText: {
        fontSize: 13,
        color: '#111827',     // Darker like Figma
        fontWeight: '600',
    },
    loginLink: {
        fontSize: 13,
        color: '#425BA4',
        fontWeight: '700',
    },

    skipButton: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        paddingBottom: 18,
        marginTop: 6,
    },
    skipText: {
        fontSize: 15,
        color: '#425BA4',
        marginRight: 8,
        fontWeight: '600',
    },
    skipArrow: {
        fontSize: 15,
        color: '#425BA4',
        fontWeight: '600',
    },
});
