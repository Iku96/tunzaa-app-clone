import { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

/**
 * Login with Facebook Screen
 * Matches design: Facebook icon, email + password, T&C checkbox, social buttons
 */
export default function LoginFacebookScreen() {
    const router = useRouter();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleLogin = () => {
        if (!agreedToTerms) {
            alert('Please agree to Terms and Conditions');
            return;
        }
        console.log('Facebook Login:', { phoneNumber, password });
        router.push('/home');
    };

    const handleSocialLogin = (provider: string) => {
        console.log('Social login:', provider);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.contentWrapper}>
                    {/* Header with Back Arrow */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={20} color="#1D1E1F" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Login with Facebook</Text>
                    </View>

                    {/* Facebook Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <FontAwesome name="facebook-f" size={48} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Phone Number Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Phone number"
                            placeholderTextColor="#666666"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />

                        {/* Password Input with Eye Icon */}
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter password"
                                placeholderTextColor="#666666"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Forgot Password Link */}
                        <TouchableOpacity
                            onPress={() => router.push('/forgot-password')}
                            style={styles.forgotPasswordContainer}
                        >
                            <Text style={styles.forgotPassword}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Terms Checkbox */}
                    <TouchableOpacity
                        style={styles.termsContainer}
                        onPress={() => setAgreedToTerms(!agreedToTerms)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: agreedToTerms }}
                    >
                        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                            {agreedToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                        <Text style={styles.termsText}>
                            I agree to the <Text style={styles.termsLink} onPress={() => router.push('/terms')}>Terms and Conditions</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Buttons (exclude Facebook) */}
                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('google')}>
                            <FontAwesome name="google" size={19} color="#EA4335" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('apple')}>
                            <Ionicons name="logo-apple" size={20} color="#1D1E1F" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('x')}>
                            <Text style={styles.xIcon}>𝕏</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text style={styles.signUpLink}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Skip Button - Pinned to Bottom */}
                <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/home')}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Text style={styles.skipArrow}>→</Text>
                </TouchableOpacity>
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
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 20,
        justifyContent: 'space-between',
    },

    contentWrapper: {
        width: '100%',
        maxWidth: 353,
        alignSelf: 'center',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },

    backButton: {
        marginRight: 12,
        padding: 4,
    },

    title: {
        fontFamily: 'System',
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1E1F',
    },

    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },

    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1877F2',
        alignItems: 'center',
        justifyContent: 'center',
    },

    formContainer: {
        gap: 16,
    },

    input: {
        height: 54,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingHorizontal: 16,
        fontFamily: 'System',
        fontSize: 16,
        color: '#1D1E1F',
    },

    passwordContainer: {
        height: 54,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 12,
    },

    passwordInput: {
        flex: 1,
        fontFamily: 'System',
        fontSize: 16,
        color: '#1D1E1F',
    },

    eyeIcon: {
        padding: 4,
    },

    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },

    forgotPassword: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '600',
        color: '#3B5191',
    },

    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
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
        backgroundColor: '#3B5191',
        borderColor: '#3B5191',
    },

    termsText: {
        fontFamily: 'System',
        fontSize: 13,
        color: '#666666',
        flex: 1,
    },

    termsLink: {
        color: '#3B5191',
        fontWeight: '600',
    },

    loginButton: {
        height: 54,
        backgroundColor: '#3B5191',
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    loginButtonText: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },

    dividerText: {
        fontFamily: 'System',
        fontSize: 12,
        color: '#666666',
        marginHorizontal: 12,
    },

    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },

    socialButton: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    xIcon: {
        fontSize: 20,
        color: '#1D1E1F',
        fontWeight: '700',
    },

    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },

    signUpText: {
        fontFamily: 'System',
        fontSize: 14,
        color: '#1D1E1F',
    },

    signUpLink: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '700',
        color: '#3B5191',
    },

    skipButton: {
        width: 190,
        height: 54,
        borderRadius: 1000,
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 18,
        marginTop: 6,
    },

    skipText: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        letterSpacing: -0.24,
        color: '#3B5191',
    },

    skipArrow: {
        fontSize: 20,
        color: '#3B5191',
        lineHeight: 20,
    },
});
