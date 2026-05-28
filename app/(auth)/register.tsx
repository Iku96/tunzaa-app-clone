/**
 * ============================================================================
 * REGISTRATION SCREEN (TUNZAA 2.0 RESTORED)
 * ============================================================================
 */

import { useState, useEffect } from 'react';
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
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { formatPhoneNumber } from '@/src/utils/phone';

export default function RegisterScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    const params = useLocalSearchParams<{ 
        role: 'buyer' | 'merchant' | 'delivery' | 'loan' | 'winga', 
        pendingOnboarding: string,
        step: string,
        first_name: string,
        last_name: string,
        phone_number: string,
        email?: string,
    }>();
    const userRole = params.role || 'buyer';
    const pendingOnboarding = params.pendingOnboarding || '';
    const currentStep = params.step || '1';

    const [firstName, setFirstName] = useState(params.first_name || '');
    const [secondName, setSecondName] = useState(params.last_name || '');
    const [phone, setPhone] = useState(params.phone_number || '');
    const [email, setEmail] = useState(params.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const { requestOTP, register, signInWithGoogle, signInWithApple, updateUser } = useTunzaaAuth();

    const handleBack = () => {
        router.back();
    };

    const handleCreateAccount = async () => {
        if (!agreedToTerms) {
            Alert.alert(t.alertsRegisterTermsRequiredTitle, t.alertsRegisterTermsRequiredMsg);
            return;
        }
        if (userRole === 'winga') {
            if (!phone) {
                Alert.alert(t.alertsRegisterMissingFieldTitle, t.alertsRegisterMissingFieldMsg);
                return;
            }
        } else {
            if (!phone || !email || !firstName || !secondName) {
                Alert.alert(t.alertsRegisterMissingFieldsTitle, t.alertsRegisterMissingFieldsMsg);
                return;
            }
            const isEmailValid = email.includes('@') && email.includes('.');
            if (!isEmailValid) {
                Alert.alert(t.alertsRegisterInvalidEmailTitle, t.alertsRegisterInvalidEmailMsg);
                return;
            }
        }

        setLoading(true);
        try {
            const phoneNumber = formatPhoneNumber(phone);
            
            // Request OTP
            await requestOTP(phoneNumber);
            
            router.push({
                pathname: '/otp',
                params: {
                    phone_number: phoneNumber,
                    email: email || `${phone}@tunzaa.co.tz`,
                    flow: 'register',
                    first_name: firstName || 'Winga',
                    last_name: secondName || 'User',
                    role: userRole,
                    nextStep: 'password',
                },
            } as any);
        } catch (e: any) {
            console.error('❌ OTP request error:', e);
            Alert.alert(t.alertsRegisterErrorTitle, e.message || t.alertsRegisterErrorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalRegister = async () => {
        if (!password || password.length < 6) {
            Alert.alert(t.alertsRegisterPasswordErrorTitle, t.alertsRegisterPasswordErrorMsg);
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(t.alertsRegisterPasswordErrorTitle, t.alertsRegisterPasswordMismatchMsg);
            return;
        }

        setLoading(true);
        try {
            const registrationData = {
                first_name: firstName.trim(),
                last_name: secondName.trim(),
                phone_number: phone,
                ...(email ? { email: email.trim().toLowerCase() } : {}),
                password: password,
                role: userRole,
            };

            const portal = userRole === 'merchant' ? 'merchant' : userRole === 'delivery' ? 'delivery' : userRole === 'loan' ? 'loan' : 'buyer';
            await register(registrationData as any, portal);
            
            // Explicitly force update user details since the register API might not persist first/last names immediately
            try {
                await updateUser({
                    first_name: firstName,
                    last_name: secondName
                });
            } catch (err) {
                console.warn('⚠️ [Register] Could not explicitly update names:', err);
            }
            
            // Set first-time buyer flag to ensure index.tsx routes correctly
            if (userRole === 'buyer') {
                await AsyncStorage.setItem('IS_FIRST_TIME_BUYER', 'true');
            } else if (userRole === 'merchant') {
                console.log('📝 [Register] Setting HAS_PENDING_MERCHANT_ONBOARDING for merchant flow');
                await AsyncStorage.setItem('HAS_PENDING_MERCHANT_ONBOARDING', 'true');
                await AsyncStorage.setItem('LAST_PORTAL', 'merchant');
            } else if (userRole === 'delivery') {
                console.log('📝 [Register] Setting HAS_PENDING_DELIVERY_ONBOARDING for delivery flow');
                await AsyncStorage.setItem('HAS_PENDING_DELIVERY_ONBOARDING', 'true');
                await AsyncStorage.setItem('LAST_PORTAL', 'delivery');
            } else if (userRole === 'loan') {
                console.log('📝 [Register] Setting HAS_PENDING_LOAN_ONBOARDING for loan flow');
                await AsyncStorage.setItem('HAS_PENDING_LOAN_ONBOARDING', 'true');
                await AsyncStorage.setItem('LAST_PORTAL', 'loan');
            }
            
            // NOTE: We don't call router.replace here anymore to avoid navigation race conditions.
            // The AuthLayout/RootLayout will detect the authenticated state and redirect to /
            // which in turn will check the IS_FIRST_TIME_BUYER or HAS_PENDING_MERCHANT_ONBOARDING flag.
        } catch (e: any) {
            console.error('❌ Final registration error:', e);
            
            // Handle "User already exists" (409 Conflict)
            const errorMsg = e.message || '';
            const isAlreadyExists = errorMsg.toLowerCase().includes('already exists') || e.status === 409;

            if (isAlreadyExists) {
                if (userRole === 'merchant' || userRole === 'delivery' || userRole === 'loan') {
                    Alert.alert(
                        t.alertsRegisterAccountFoundTitle,
                        t.alertsRegisterAccountFoundMsg1,
                        [
                            {
                                text: 'Sign In',
                                onPress: () => router.replace({ 
                                    pathname: '/login', 
                                    params: { 
                                        role: userRole,
                                        phone_number: phone 
                                    } 
                                })
                            }
                        ]
                    );
                } else {
                    Alert.alert(
                        t.alertsRegisterAccountFoundTitle,
                        t.alertsRegisterAccountFoundMsg2,
                        [
                            {
                                text: 'Sign In',
                                onPress: () => router.replace({ 
                                    pathname: '/login', 
                                    params: { 
                                        phone_number: phone 
                                    } 
                                })
                            }
                        ]
                    );
                }
            } else {
                Alert.alert(t.alertsRegisterErrorCreatingTitle, e.message || t.alertsRegisterErrorCreatingMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setLoading(true);
        try {
            let response;
            if (provider === 'google') response = await signInWithGoogle();
            else if (provider === 'apple') response = await signInWithApple();

            if (response) {
                const portalTarget = userRole === 'merchant' ? 'merchant'
                                   : userRole === 'delivery' ? 'delivery'
                                   : userRole === 'loan' ? 'loan'
                                   : 'buyer';
                await AsyncStorage.setItem('LAST_PORTAL', portalTarget);

                // Check if this is a newly created account via social login
                const createdAt = response.created_at || response.meta?.createdAt;
                if (createdAt) {
                    const createdTime = new Date(createdAt).getTime();
                    const now = new Date().getTime();
                    const ageInSeconds = (now - createdTime) / 1000;
                    if (ageInSeconds < 60) {
                        console.log('🆕 [Register] New social account detected, flagging for onboarding...');
                        if (portalTarget === 'buyer') {
                            await AsyncStorage.setItem('IS_FIRST_TIME_BUYER', 'true');
                        } else if (portalTarget === 'merchant') {
                            await AsyncStorage.setItem('HAS_PENDING_MERCHANT_ONBOARDING', 'true');
                        } else if (portalTarget === 'delivery') {
                            await AsyncStorage.setItem('HAS_PENDING_DELIVERY_ONBOARDING', 'true');
                        } else if (portalTarget === 'loan') {
                            await AsyncStorage.setItem('HAS_PENDING_LOAN_ONBOARDING', 'true');
                        }
                    }
                }
            }
        } catch (e: any) {
            const errorMsg = e?.message || String(e);
            // Silently ignore cancellation or unavailable errors
            if (
                errorMsg.includes('No ID token') || 
                errorMsg.includes('Apple Authentication is not available') ||
                errorMsg.includes('SIGN_IN_CANCELLED') ||
                errorMsg.includes('cancelled') ||
                errorMsg.includes('canceled')
            ) {
                console.log('ℹ️ [Register] Social login cancelled or unavailable:', errorMsg);
                return;
            }

            console.error('❌ Social login error:', e);
            Alert.alert('Login Error', errorMsg || `Failed to sign in with ${provider}.`);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.replace('/(buyer)');
    };

    if (userRole === 'winga' && currentStep === '1') {
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
                            {/* Title: Create an account */}
                            <Text style={[styles.title, { fontSize: 24, fontWeight: '700', color: '#1D1E1F', marginBottom: 24, marginTop: 20 }]}>
                                {t.registerWingaTitle}
                            </Text>

                            {/* Centered Logo: TUNZAA */}
                            <View style={[styles.logoContainer, { marginTop: 10, marginBottom: 40 }]}>
                                <Image
                                    source={require('@/assets/blue-tunzaa-logo.png')}
                                    style={{ width: 180, height: 60 }}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Input: Enter +255xxx xxx xxx */}
                            <View style={styles.formContainer}>
                                <TextInput
                                    style={[styles.input, { height: 56, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1F2937' }]}
                                    placeholder={t.registerWingaPhonePlaceholder}
                                    placeholderTextColor="#9CA3AF"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {/* Checkbox: I have read agree to Tunzaa Terms and Conditions... */}
                            <TouchableOpacity
                                style={[styles.termsContainer, { marginTop: 24, alignItems: 'flex-start' }]}
                                onPress={() => setAgreedToTerms(!agreedToTerms)}
                            >
                                <View style={[styles.checkbox, { marginTop: 2 }, agreedToTerms && styles.checkboxChecked]}>
                                    {agreedToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                                </View>
                                <Text style={[styles.termsText, { fontSize: 13, lineHeight: 18, color: '#4B5563', flex: 1 }]}>
                                    {t.registerWingaTermsText1}
                                    <Text style={{ color: '#425BA4', fontWeight: '500' }}>{t.registerWingaTermsLink}</Text>
                                </Text>
                            </TouchableOpacity>

                            {/* Button: Create Account */}
                            <TouchableOpacity 
                                style={[styles.createButton, { height: 52, borderRadius: 26, backgroundColor: '#425BA4', marginTop: 32, justifyContent: 'center', alignItems: 'center' }]} 
                                onPress={handleCreateAccount} 
                                disabled={loading}
                            >
                                <Text style={[styles.createButtonText, { fontSize: 16, fontWeight: '700', color: '#FFFFFF' }]}>
                                    {loading ? '...' : t.registerWingaCreateButton}
                                </Text>
                            </TouchableOpacity>

                            {/* Footer: Already have an account? Log in */}
                            <TouchableOpacity 
                                onPress={() => router.replace({ pathname: '/login', params: { role: 'winga' } })} 
                                style={{ marginTop: 40, alignItems: 'center' }}
                            >
                                <Text style={{ fontSize: 14, color: '#1F2937', fontWeight: '500' }}>
                                    {t.registerWingaAlreadyAccount}
                                    <Text style={{ color: '#425BA4', fontWeight: '700' }}>{t.registerWingaLoginLink}</Text>
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
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#1D1E1F" />
                            </TouchableOpacity>

                            <View style={styles.header}>
                                <Text style={styles.title}>
                                    {currentStep === 'password' 
                                        ? t.registerVerifyPasswordTitle 
                                        : (userRole === 'winga' 
                                            ? t.registerWingaTitle
                                            : (userRole === 'merchant' ? t.registerTitleMerchant : userRole === 'delivery' ? t.registerDeliveryPartnerTitle : userRole === 'loan' ? t.registerLoanProviderTitle : t.registerTitleBuyer))}
                                </Text>
                                <Text style={styles.subtitle}>
                                    {currentStep === 'password' 
                                        ? t.registerVerifyPasswordSubtitle 
                                        : t.registerSubtitleEmpty}
                                </Text>
                            </View>

                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('@/assets/blue-tunzaa-logo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>

                            <View style={styles.formContainer}>
                                {currentStep === '1' ? (
                                    <>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t.registerFirstNamePlaceholder}
                                            placeholderTextColor="#9CA3AF"
                                            value={firstName}
                                            onChangeText={setFirstName}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t.registerLastNamePlaceholder}
                                            placeholderTextColor="#9CA3AF"
                                            value={secondName}
                                            onChangeText={setSecondName}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t.registerPhoneEmailPlaceholder.split('/')[0] || "Phone Number"}
                                            placeholderTextColor="#9CA3AF"
                                            value={phone}
                                            onChangeText={setPhone}
                                            keyboardType="phone-pad"
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t.registerEmailPlaceholder}
                                            placeholderTextColor="#9CA3AF"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <View style={styles.passwordContainer}>
                                            <TextInput
                                                style={styles.passwordInput}
                                                placeholder={t.registerPasswordPlaceholder}
                                                placeholderTextColor="#9CA3AF"
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry={!showPassword}
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

                                        <View style={styles.passwordContainer}>
                                            <TextInput
                                                style={styles.passwordInput}
                                                placeholder={t.registerConfirmPasswordPlaceholder}
                                                placeholderTextColor="#9CA3AF"
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                secureTextEntry={!showConfirmPassword}
                                                autoCapitalize="none"
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={styles.eyeIcon}
                                            >
                                                <Ionicons
                                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                                    size={20}
                                                    color="#9CA3AF"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>

                            {currentStep === '1' && (
                                <TouchableOpacity
                                    style={styles.termsContainer}
                                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                                >
                                    <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                                        {agreedToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                                    </View>
                                    <Text style={styles.termsText}>
                                        {t.authLoginTermsText1}<Text style={styles.termsLink}>{t.authLoginTermsLink}</Text>
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity 
                                style={styles.createButton} 
                                onPress={currentStep === 'password' ? handleFinalRegister : handleCreateAccount} 
                                disabled={loading}
                            >
                                <Text style={styles.createButtonText}>
                                    {loading ? '...' : (currentStep === 'password' ? t.registerCompleteAccountButton : t.registerButton)}
                                </Text>
                            </TouchableOpacity>

                            {currentStep === '1' && (
                                <>
                                    <View style={styles.dividerRow}>
                                        <View style={styles.dividerLine} />
                                        <Text style={styles.dividerText}>{t.loginOrContinue}</Text>
                                        <View style={styles.dividerLine} />
                                    </View>

                                    <View style={styles.socialContainer}>
                                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('google')}>
                                            <FontAwesome name="google" size={19} color="#EA4335" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('apple')}>
                                            <Ionicons name="logo-apple" size={20} color="#1D1E1F" />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity onPress={() => router.replace({ pathname: '/login', params: { role: userRole } })} style={styles.loginContainer}>
                                        <Text style={styles.loginText}>{t.registerWingaAlreadyAccount}<Text style={{ color: '#425BA4', fontWeight: '600' }}>{t.registerWingaLoginLink}</Text></Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {currentStep === '1' && (
                            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                                <Text style={styles.skipText}>{t.loginSkip}</Text>
                                <Text style={styles.skipArrow}>→</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { flexGrow: 1 },
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 20, justifyContent: 'space-between', paddingBottom: 20 },
    backButton: { marginBottom: 20 },
    header: { alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '700', color: '#1D1E1F', textAlign: 'center' },
    subtitle: { marginTop: 9, fontSize: 14, color: '#666666', textAlign: 'center' },
    logoContainer: { alignItems: 'center', marginTop: 22, marginBottom: 18 },
    logo: { width: 220, height: 75 },
    formContainer: { gap: 16 },
    input: { height: 54, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1F2937' },
    passwordContainer: { height: 54, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 12 },
    passwordInput: { flex: 1, fontSize: 16, color: '#1D1E1F' },
    eyeIcon: { padding: 4 },
    termsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#EFF3F9', marginRight: 10, alignItems: 'center', justifyContent: 'center' },
    checkboxChecked: { backgroundColor: '#425BA4', borderColor: '#425BA4' },
    termsText: { fontSize: 13, color: '#666666', flex: 1 },
    termsLink: { color: '#425BA4', fontWeight: '600' },
    createButton: { height: 47, marginTop: 19, backgroundColor: '#425BA4', borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
    createButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    dividerText: { marginHorizontal: 12, fontSize: 12, color: '#666666' },
    socialContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
    socialButton: { flex: 1, height: 46, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
    loginContainer: { alignItems: 'center', marginTop: 6 },
    loginText: { fontSize: 13, color: '#1D1E1F', fontWeight: '600' },
    skipButton: { width: 190, height: 54, borderRadius: 1000, flexDirection: 'row', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 },
    skipText: { fontSize: 16, fontWeight: '500', color: '#425BA4' },
    skipArrow: { fontSize: 20, color: '#425BA4' },
    contentWrapper: { width: '100%', maxWidth: 353, alignSelf: 'center' },
});
