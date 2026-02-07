import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';

/**
 * Registration Screen
 * 
 * Specs from Figma:
 * - Container: Fixed width 353px, top 89px, left 20px
 * - Title: "Create an account" with subtitle
 * - Logo: Blue Tunzaa logo (centered)
 * - Form inputs: First name, Second name, Phone/Email
 * - Terms checkbox with link
 * - Create Account button (blue #425BA4)
 * - Social login buttons (Google, Apple, Facebook, X)
 * - "Already have an account? Log in" link
 * - Skip button at bottom
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Create an account</Text>
                    <Text style={styles.subtitle}>Please fill in your details to get started</Text>
                </View>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/blue-tunzaa-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                        accessibilityLabel="Tunzaa Logo"
                    />
                </View>

                {/* Form Inputs */}
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your first name"
                        placeholderTextColor="#9CA3AF"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter your second name"
                        placeholderTextColor="#9CA3AF"
                        value={secondName}
                        onChangeText={setSecondName}
                        autoCapitalize="words"
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

                {/* Terms Checkbox */}
                <TouchableOpacity
                    style={styles.termsContainer}
                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: agreedToTerms }}
                >
                    <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                        {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.termsText}>
                        I agree to the{' '}
                        <Text style={styles.termsLink}>Terms and Conditions</Text>
                    </Text>
                </TouchableOpacity>

                {/* Create Account Button */}
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateAccount}
                    accessibilityLabel="Create Account"
                    accessibilityRole="button"
                >
                    <Text style={styles.createButtonText}>Create Account</Text>
                </TouchableOpacity>

                {/* Social Login Divider */}
                <Text style={styles.dividerText}>or continue with</Text>

                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('google')}
                        accessibilityLabel="Continue with Google"
                    >
                        <Text style={styles.socialIcon}>G</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('apple')}
                        accessibilityLabel="Continue with Apple"
                    >
                        <Text style={styles.socialIcon}></Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('facebook')}
                        accessibilityLabel="Continue with Facebook"
                    >
                        <Text style={styles.socialIcon}>f</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('x')}
                        accessibilityLabel="Continue with X"
                    >
                        <Text style={styles.socialIcon}>X</Text>
                    </TouchableOpacity>
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={handleLogin}>
                        <Text style={styles.loginLink}>Log in</Text>
                    </TouchableOpacity>
                </View>

                {/* Skip Button */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    accessibilityLabel="Skip registration"
                >
                    <Text style={styles.skipText}>Skip</Text>
                    <Text style={styles.skipArrow}>→</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20, // Left spec
        paddingTop: 89, // Top spec from Figma
        width: 353, // Fixed width from Figma
        alignSelf: 'center',
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 8,
        marginBottom: 16,
    },
    backArrow: {
        fontSize: 24,
        color: '#1F2937',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 111,
        height: 111,
    },
    formContainer: {
        gap: 16,
        marginBottom: 16,
    },
    input: {
        height: 56,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#1F2937',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#425BA4',
        borderColor: '#425BA4',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    termsText: {
        fontSize: 14,
        color: '#6B7280',
    },
    termsLink: {
        color: '#425BA4',
        textDecorationLine: 'underline',
    },
    createButton: {
        height: 56,
        backgroundColor: '#425BA4',
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    socialButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialIcon: {
        fontSize: 20,
        color: '#1F2937',
    },
    loginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    loginText: {
        fontSize: 14,
        color: '#6B7280',
    },
    loginLink: {
        fontSize: 14,
        color: '#425BA4',
        fontWeight: '600',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    skipText: {
        fontSize: 16,
        color: '#425BA4',
        marginRight: 4,
    },
    skipArrow: {
        fontSize: 16,
        color: '#425BA4',
    },
});
