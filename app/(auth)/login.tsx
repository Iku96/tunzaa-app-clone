/**
 * ============================================================================
 * MAIN LOGIN SCREEN (TUNZAA 2.0 RESTORED)
 * ============================================================================
 */

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
import { Ionicons, FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global Contexts
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { formatPhoneNumber } from '@/src/utils/phone';

export default function LoginScreen() {
    const { t } = useLanguage();
    const router = useRouter();

    // Check if the user was directed here with a specific role intent (e.g., ?role=merchant)
    const { role: targetRole, phone_number: prefilledPhone } = useLocalSearchParams<{ 
        role?: string,
        phone_number?: string 
    }>();

    // ------------------------------------------------------------------------
    // STATE MANAGEMENT
    // ------------------------------------------------------------------------
    const [usernameOrEmail, setUsernameOrEmail] = useState(prefilledPhone || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    // Destructure auth methods from global context
    const { login: tunzaaLogin, signInWithGoogle, signInWithApple } = useTunzaaAuth();

    // ------------------------------------------------------------------------
    // STANDARD LOGIN HANDLER
    // ------------------------------------------------------------------------
    const handleLogin = async () => {
        // Pre-flight validation
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
            // Determine if input is a phone number or email to format it correctly for the backend
            const trimmedInput = usernameOrEmail.trim();
            const isPhone = !trimmedInput.includes('@');
            const identifier = isPhone ? formatPhoneNumber(trimmedInput) : trimmedInput;

            const portalTarget = targetRole === 'merchant' ? 'merchant'
                               : targetRole === 'delivery' ? 'delivery'
                               : targetRole === 'winga' ? 'affiliate'
                               : targetRole === 'loan' ? 'loan'
                               : targetRole === 'buyer' ? 'buyer'
                               : undefined;

            const response = await tunzaaLogin(identifier, password, isPhone, portalTarget);
            console.log('✅ Login success:', response?.name || response?.first_name);

            // Explicitly update LAST_PORTAL so we don't accidentally get redirected
            // to a previously logged-in portal (like merchant) when logging in as buyer.
            const finalPortalTarget = targetRole === 'merchant' ? 'merchant'
                                    : targetRole === 'delivery' ? 'delivery'
                                    : targetRole === 'winga' ? 'winga'
                                    : 'buyer';
            await AsyncStorage.setItem('LAST_PORTAL', finalPortalTarget);

            // Edge case: Pending merchant onboarding
            const hasPending = await AsyncStorage.getItem('TEMP_ONBOARDING_SHOP_NAME');
            if (hasPending) {
                const serverRole = (response?.activeProfileRole || response?.active_profile_role || '').toLowerCase();
                if (serverRole !== 'vendor') {
                    console.log('🏗️ [Login] Marking pending onboarding for splash redirect...');
                    await AsyncStorage.setItem('HAS_PENDING_MERCHANT_ONBOARDING', 'true');
                }
            }

            // Explicitly route to the root splash screen so it can decide which dashboard to load
            router.replace('/');
        } catch (e: any) {
            console.warn('❌ Login error:', e.message || e);
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
                const portalTarget = targetRole === 'merchant' ? 'merchant'
                                   : targetRole === 'delivery' ? 'delivery'
                                   : targetRole === 'loan' ? 'loan'
                                   : 'buyer';
                await AsyncStorage.setItem('LAST_PORTAL', portalTarget);
            }
        } catch (e: any) {
            console.error('❌ Social login error:', e);
            Alert.alert('Login Error', e.message || `Failed to sign in with ${provider}.`);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------
    if (targetRole === 'winga') {
        return (
            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={[styles.scrollContent, { justifyContent: 'center' }]}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.contentWrapper, { paddingHorizontal: 24, paddingVertical: 40 }]}>
                            {/* Title: Welcome Back */}
                            <Text style={{ fontSize: 24, fontWeight: '700', color: '#1D1E1F', textAlign: 'center', marginBottom: 6 }}>
                                Welcome Back
                            </Text>

                            {/* Subtitle: Enter your details to sign in */}
                            <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 30 }}>
                                Enter your details to sign in
                            </Text>

                            {/* Centered Logo: TUNZAA */}
                            <View style={{ alignItems: 'center', marginBottom: 40 }}>
                                <Image
                                    source={require('@/assets/blue-tunzaa-logo.png')}
                                    style={{ width: 180, height: 60 }}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Form Inputs */}
                            <View style={{ gap: 16 }}>
                                {/* Phone Input */}
                                <TextInput
                                    style={{ height: 56, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1D1E1F' }}
                                    placeholder="Enter +255xxx xxx xxx"
                                    placeholderTextColor="#9CA3AF"
                                    value={usernameOrEmail}
                                    onChangeText={setUsernameOrEmail}
                                    keyboardType="phone-pad"
                                />

                                {/* Password Input */}
                                <View style={{ height: 56, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 12 }}>
                                    <TextInput
                                        style={{ flex: 1, fontSize: 16, color: '#1D1E1F' }}
                                        placeholder="Enter password"
                                        placeholderTextColor="#9CA3AF"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="password"
                                        textContentType="password"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Forgot Password on the right */}
                                <TouchableOpacity
                                    onPress={() => router.push('/forgot-password')}
                                    style={{ alignSelf: 'flex-end', marginTop: 4 }}
                                >
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#425BA4' }}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Terms Checkbox */}
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 24 }}
                                onPress={() => setAgreedToTerms(!agreedToTerms)}
                            >
                                <View style={[{ width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#EFF3F9', marginRight: 10, alignItems: 'center', justifyContent: 'center' }, agreedToTerms && { backgroundColor: '#425BA4', borderColor: '#425BA4' }]}>
                                    {agreedToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                                </View>
                                <Text style={{ fontSize: 13, lineHeight: 18, color: '#4B5563', flex: 1 }}>
                                    I have read agree to Tunzaa{" "}
                                    <Text style={{ color: '#425BA4', fontWeight: '500' }}>Terms and Conditions of use, privacy policy, and return policy</Text>
                                </Text>
                            </TouchableOpacity>

                            {/* Button: Log In */}
                            <TouchableOpacity 
                                style={{ height: 54, backgroundColor: '#425BA4', borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: 32 }} 
                                onPress={handleLogin} 
                                disabled={loading}
                            >
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
                                    {loading ? '...' : 'Log In'}
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

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
                                    source={require('@/assets/blue-tunzaa-logo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Form */}
                            <View style={styles.formContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t.loginInputPlaceholder}
                                    placeholderTextColor="#9CA3AF"
                                    value={usernameOrEmail}
                                    onChangeText={setUsernameOrEmail}
                                    autoCapitalize="none"
                                />

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder={t.loginPasswordPlaceholder}
                                        placeholderTextColor="#9CA3AF"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="password"
                                        textContentType="password"
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
                                    I agree to the <Text style={styles.termsLink}>Terms and Conditions</Text>
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                                <Text style={styles.loginButtonText}>{loading ? '...' : t.loginButton}</Text>
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
                            </View>

                            {/* Sign Up Link */}
                            <View style={styles.signUpContainer}>
                                <TouchableOpacity onPress={() => router.push('/register')} className="flex-row items-center">
                                    <Text style={styles.signUpText}>Don't have an account? <Text style={{ color: '#425BA4', fontWeight: '600' }}>Sign up</Text></Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Skip Button */}
                        <TouchableOpacity style={styles.skipButton} onPress={async () => {
                            await AsyncStorage.setItem('LAST_PORTAL', 'buyer');
                            router.replace('/(buyer)');
                        }}>
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
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { flexGrow: 1 },
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 40, justifyContent: 'space-between', paddingBottom: 20 },
    contentWrapper: { width: '100%', maxWidth: 353, alignSelf: 'center' },
    header: { alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '700', color: '#1D1E1F', textAlign: 'center' },
    subtitle: { fontSize: 14, fontWeight: '400', color: '#666666', textAlign: 'center', marginTop: 6 },
    logoContainer: { alignItems: 'center', marginBottom: 24 },
    logo: { width: 220, height: 75 },
    formContainer: { gap: 16 },
    input: { height: 54, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1D1E1F' },
    passwordContainer: { height: 54, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 12 },
    passwordInput: { flex: 1, fontSize: 16, color: '#1D1E1F' },
    eyeIcon: { padding: 4 },
    forgotPasswordContainer: { alignSelf: 'flex-end', marginTop: 8 },
    forgotPassword: { fontSize: 14, fontWeight: '600', color: '#425BA4' },
    termsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#EFF3F9', marginRight: 10, alignItems: 'center', justifyContent: 'center' },
    checkboxChecked: { backgroundColor: '#425BA4', borderColor: '#425BA4' },
    termsText: { fontSize: 13, color: '#666666', flex: 1 },
    termsLink: { color: '#425BA4', fontWeight: '600' },
    loginButton: { height: 54, backgroundColor: '#425BA4', borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    loginButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    dividerText: { fontSize: 12, color: '#666666', marginHorizontal: 12 },
    socialContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
    socialButton: { flex: 1, height: 52, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
    signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    signUpText: { fontSize: 14, color: '#1D1E1F' },
    skipButton: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', paddingBottom: 20, marginTop: 16 },
    skipText: { fontSize: 16, fontWeight: '500', color: '#425BA4', marginRight: 8 },
    skipArrow: { fontSize: 16, color: '#425BA4', fontWeight: '500' },
});
