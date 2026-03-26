import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useTunzaaAuth } from '../src/contexts/TunzaaAuthContext';
import { useLanguage } from '../src/contexts/LanguageContext';

/**
 * Sign In Screen (Welcome Back)
 * Matches screenshot pixel-perfectly with responsive maxWidth layout
 */
export default function LoginScreen() {
    const { t } = useLanguage();
    const router = useRouter();
    const { role: targetRole } = useLocalSearchParams<{ role?: string }>();

    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login: tunzaaLogin, signInWithGoogle, signInWithApple } = useTunzaaAuth();

    const handleLogin = async () => {
        if (!agreedToTerms) {
            Alert.alert('Terms Required', 'Please agree to Terms and Conditions');
            return;
        }
        if (!usernameOrEmail || !password) {
            Alert.alert('Missing Fields', 'Please enter your identifier and password');
            return;
        }

        setLoading(true);
        try {
            // Determine if input is a phone number or email
            const isPhone = !usernameOrEmail.includes('@');
            const identifier = isPhone && !usernameOrEmail.startsWith('+')
                ? `+255${usernameOrEmail.replace(/^0/, '')}`
                : usernameOrEmail;

            const response = await tunzaaLogin(identifier, password, isPhone);
            console.log('✅ Login success:', response.name);

            // Check if we have pending merchant onboarding data
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const hasPending = await AsyncStorage.getItem('TEMP_ONBOARDING_SHOP_NAME');
            
            if (hasPending && (response.activeProfileRole || response.active_profile_role) !== 'vendor') {
                console.log('🏗️ [Login] Found pending onboarding, directing to finish registration...');
                router.replace('/(merchant)/onboarding/step-5' as any);
                return;
            }

            // Navigate based on user role and context intent
            const serverRole = response.activeProfileRole || response.active_profile_role;
            const hasVendorProfile = response.profiles?.some((p: any) => p.role === 'vendor');
            
            console.log(`🧭 [Login] Redirecting. Target: ${targetRole}, Server: ${serverRole}, HasVendor: ${hasVendorProfile}`);

            if (targetRole === 'merchant' && hasVendorProfile) {
                router.replace('/(merchant)' as any);
            } else if (serverRole === 'vendor') {
                router.replace('/(merchant)' as any);
            } else {
                router.replace('/(buyer)' as any);
            }
        } catch (e: any) {
            console.error('❌ Login error:', e);
            Alert.alert('Login Failed', e.message || 'Error signing in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setLoading(true);
        try {
            let response;
            if (provider === 'google') {
                response = await signInWithGoogle();
            } else if (provider === 'apple') {
                response = await signInWithApple();
            } else {
                Alert.alert('Not Available', `${provider} login is not yet supported.`);
                setLoading(false);
                return;
            }

            if (response) {
                console.log('✅ Social login success:', response.name);
                const serverRole = response.activeProfileRole || response.active_profile_role;
                const hasVendorProfile = response.profiles?.some((p: any) => p.role === 'vendor');
                
                if (targetRole === 'merchant' && hasVendorProfile) {
                    router.replace('/(merchant)' as any);
                } else if (serverRole === 'vendor') {
                    router.replace('/(merchant)' as any);
                } else {
                    router.replace('/(buyer)' as any);
                }
            }
        } catch (e: any) {
            console.error('❌ Social login error:', e);
            Alert.alert('Login Error', e.message || `Failed to sign in with ${provider}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <View style={styles.contentWrapper}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>{t.loginTitle}</Text>
                                <Text style={styles.subtitle}>{t.loginSubtitle}</Text>
                            </View>

                            {/* Logo */}
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../assets/blue-tunzaa-logo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Form */}
                            <View style={styles.formContainer}>
                                {/* Username/Email Input */}
                                <TextInput
                                    style={styles.input}
                                    placeholder={t.loginInputPlaceholder}
                                    placeholderTextColor="#9CA3AF"
                                    value={usernameOrEmail}
                                    onChangeText={setUsernameOrEmail}
                                    autoCapitalize="none"
                                />

                                {/* Password Input with Eye Icon */}
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder={t.loginPasswordPlaceholder}
                                        placeholderTextColor="#9CA3AF"
                                        value={password}
                                        onChangeText={setPassword}
                                        autoCapitalize="none" secureTextEntry={!showPassword}
                                        autoCapitalize="none"
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
                                    <Text style={styles.forgotPassword}>{t.loginForgotPassword}</Text>
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
                                    {t.loginAgreedTerms.split('Terms and Conditions')[0]}
                                    <Text style={styles.termsLink} onPress={() => router.push('/terms')}>
                                        {t.registerTermsLink}
                                    </Text>
                                    {t.loginAgreedTerms.split('Terms and Conditions')[1]}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                                <Text style={styles.loginButtonText}>{t.loginButton}</Text>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>{t.loginOrContinue}</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Social Buttons */}
                            <View style={styles.socialContainer}>
                                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('google')}>
                                    <FontAwesome name="google" size={20} color="#EA4335" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('apple')}>
                                    <Ionicons name="logo-apple" size={22} color="#1D1E1F" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('facebook')}>
                                    <FontAwesome name="facebook-f" size={20} color="#1877F2" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('x')}>
                                    <FontAwesome5 name="twitter" size={20} color="#1D1E1F" />
                                </TouchableOpacity>
                            </View>

                            {/* Sign Up Link */}
                            <View style={styles.signUpContainer}>
                                <TouchableOpacity onPress={() => router.push('/register')} className="flex-row items-center">
                                    <Text style={styles.signUpText}>{t.loginNoAccount}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Skip Button - Pinned to Bottom */}
                        <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(buyer)')}>
                            <Text style={styles.skipText}>{t.loginSkip}</Text>
                            <Text style={styles.skipArrow}>→</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Root
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scrollContent: {
        flexGrow: 1,
    },

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 20,
        justifyContent: 'space-between',
        paddingBottom: 20,
    },

    // Content wrapper - responsive with maxWidth
    contentWrapper: {
        width: '100%',
        maxWidth: 353,
        alignSelf: 'center',
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },

    title: {
        fontFamily: 'System',
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 28,
        color: '#1D1E1F',
        textAlign: 'center',
    },

    subtitle: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '400',
        color: '#666666',
        textAlign: 'center',
        marginTop: 6,
    },

    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },

    logo: {
        width: 170,
        height: 60,
    },

    // Form
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

    // Password Input with Eye
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

    // Forgot Password
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

    // Terms Checkbox
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

    // Login Button
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

    // Divider
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

    // Social Buttons
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },

    socialButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Sign Up Link
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

    // Skip Button - Bottom Pinned
    skipButton: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        paddingBottom: 20,
        marginTop: 16,
    },

    skipText: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '500',
        color: '#3B5191',
        marginRight: 8,
    },

    skipArrow: {
        fontSize: 16,
        color: '#3B5191',
        fontWeight: '500',
    },
});
