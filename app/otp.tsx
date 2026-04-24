import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { STORAGE_KEYS } from '../src/services/config';
import { useTunzaaAuth } from '../src/contexts/TunzaaAuthContext';
import { useLanguage } from '../src/contexts/LanguageContext';
import { getTempRegistrationPassword, clearTempRegistrationPassword } from '../src/utils/storage';

/**
 * OTP Screen (Verify & create password)
 * 6-digit code verification with timer and resend functionality
 */
export default function OTPScreen() {
    const router = useRouter();
    const params = useLocalSearchParams() as any;
    // Bug #10 fix: password is no longer in URL params
    const { phone_number, flow, first_name, last_name, role, email } = params;
    
    const { verifyOTP, requestOTP, register, createVendor, refreshProfile, saveAuthResponse, getUserDetails } = useTunzaaAuth();
    const { t } = useLanguage();

    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        // Handle pasting of full code
        if (text.length > 1) {
            const pastedText = text.slice(0, 6).split('');
            const newDigits = [...otpDigits];
            pastedText.forEach((char, i) => {
                if (index + i < 6) newDigits[index + i] = char;
            });
            setOtpDigits(newDigits);
            
            // Focus last filled box or last box
            const nextIndex = Math.min(index + pastedText.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newDigits = [...otpDigits];
        newDigits[index] = text.slice(-1); // Only take last char for non-pasting
        setOtpDigits(newDigits);

        // Auto focus next box
        if (text && index < 5) {
            // Small delay to ensure state update doesn't interfere with focus
            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 10);
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
            // Move to previous box if current is empty and backspace pressed
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (timer === 0 && phone_number) {
            setIsResending(true);
            try {
                if (flow === 'reset-password') {
                    // Use the password reset request endpoint for resend
                    const { authApi } = await import('../src/services/auth');
                    const response = await authApi.requestPasswordReset({ phone_number });
                    setTimer(response.ttl_seconds || 30);
                } else {
                    const response = await requestOTP(phone_number);
                    setTimer(response.ttl || 30);
                }
                setOtpDigits(['', '', '', '', '', '']);
                console.log('✅ OTP resent successfully');
            } catch (error: any) {
                console.error('❌ OTP resend failed:', error);
                Alert.alert('Error', error.message || 'Failed to resend code. Please try again.');
            } finally {
                setIsResending(false);
            }
        }
    };

    const handleContinue = async () => {
        const code = otpDigits.join('');
        if (code.length !== 6) {
            Alert.alert(t.otpInvalidCode, t.otpEnterAllDigits);
            return;
        }

        // For password reset flow, skip OTP verify — the reset/confirm endpoint verifies the code itself
        if (flow === 'reset-password') {
            router.replace({ pathname: '/reset-password', params: { phone_number, email, reset_token: code } } as any);
            return;
        }

        setIsVerifying(true);
        try {
            const response = await verifyOTP(phone_number, code);
            console.log('✅ OTP verified:', response);

            const verifyResp = response as any;
            if (verifyResp.verified || verifyResp.is_verified || verifyResp.access_token) {
                // Navigate based on the flow
                if (flow === 'register') {
                    console.log(`📝 [OTP] Completing registration process for ${first_name} as ${role}`);
                    
                    try {
                        let authResponse: any = null;

                        // 2. Map role to portal
                        const portal = role === 'merchant' ? 'merchant' : (role === 'delivery' ? 'delivery' : 'buyer');

                        // Smart Flow: If OTP verification already returned a token, use it and skip register
                        // IMPORTANT: The Tunzaa backend currently returns literal "access_token" as a dummy variable during OTP verify 
                        // if the user doesn't physically exist yet. We must validate it's an actual JWT before skipping registration.
                        const isValidToken = typeof verifyResp.access_token === 'string' && verifyResp.access_token.includes('.');

                        if (verifyResp.access_token && isValidToken) {
                            console.log('🛰️ [OTP] User already exists/authenticated via OTP, skipping registration call.');
                            await AsyncStorage.setItem('LAST_PORTAL', portal);
                            authResponse = await saveAuthResponse(verifyResp);
                        } else {
                            // Bug #10 fix: Retrieve securely stored password
                            const securePassword = await getTempRegistrationPassword();
                            
                            // Register new user
                            const registrationData: any = {
                                first_name: first_name || '',
                                last_name: last_name || '',
                                password: securePassword || '',
                                phone_number: phone_number,
                                email: email || '',
                            };
                            authResponse = await register(registrationData, portal);
                            await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_TIME_BUYER, 'true');
                            
                            // Clear temp password after successful registration
                            await clearTempRegistrationPassword();
                            console.log('✅ [OTP] Registration successful:', authResponse.user_id);
                        }
                        
                        // AuthGuard will now handle the navigation because LAST_PORTAL was set
                        // before the auth state update in context. 
                        // No explicit router.replace needed here.
                    } catch (regErr: any) {
                        const errorMessage = regErr.apiError?.message || regErr.message || '';
                        const isAlreadyExists = errorMessage.toLowerCase().includes('already exists') 
                            || errorMessage.toLowerCase().includes('already registered');

                        // Retrieve secure password for fallback login as well
                        const securePassword = await getTempRegistrationPassword();
                        if (isAlreadyExists && securePassword) {
                            // User already exists — fall back to login with the credentials they provided
                            console.log('🔄 [OTP] User already exists, falling back to login...');
                            try {
                                const isPhone = !phone_number.includes('@');
                                const identifier = phone_number;
                                const { authApi } = await import('../src/services/auth');
                                const loginResponse = await authApi.login({ identifier, password: securePassword, is_phone: isPhone });
                                
                                await AsyncStorage.setItem('LAST_PORTAL', portal);
                                authResponse = await saveAuthResponse(loginResponse);
                                
                                // Clear temp password
                                await clearTempRegistrationPassword();
                                console.log('✅ [OTP] Login fallback successful:', authResponse?.user_id);
                            } catch (loginErr: any) {
                                console.error('❌ [OTP] Login fallback also failed:', loginErr);
                                Alert.alert('Account Issue', 
                                    'This phone number is already registered. Please go to the login screen and sign in with your password.',
                                    [{ text: 'Go to Login', onPress: () => router.replace('/login') }]
                                );
                            }
                        } else {
                            console.error('❌ [OTP] Registration failed:', regErr);
                            Alert.alert('Registration Failed', errorMessage || 'Error occurred. Please try again.');
                        }
                    }
                } else {
                    // Default fallback logic
                    router.replace({ pathname: '/create-password', params: { phone_number } } as any);
                }
                } else {
                    Alert.alert(t.otpVerifyFailed, t.otpInvalidCode + '. ' + t.otpInstruction);
                }
            } catch (error: any) {
                console.error('❌ OTP verification failed:', error);
                Alert.alert(t.otpVerifyFailed, error.message || t.otpVerifyFailed);
            } finally {
                setIsVerifying(false);
            }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.contentWrapper}>
                    {/* Header with Back Arrow */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={20} color="#1D1E1F" />
                        </TouchableOpacity>
                        <Text style={styles.title}>{t.otpTitle}</Text>
                    </View>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/blue-tunzaa-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Instruction */}
                    <Text style={styles.instruction}>
                        {t.otpInstruction}
                    </Text>

                    {/* OTP Boxes */}
                    <View style={styles.otpContainer}>
                        {otpDigits.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={styles.otpBox}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={index === 0 ? 6 : 1} // Allow pasting in first box
                                textContentType="oneTimeCode"
                                autoComplete="one-time-code"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Resend Row */}
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                            {t.otpNoCode}{' '}
                            <Text
                                style={[styles.resendLink, timer > 0 && styles.resendDisabled]}
                                onPress={handleResend}
                            >
                                {t.otpResend}
                            </Text>
                        </Text>
                    </View>

                    {/* Timer */}
                    <View style={styles.timerContainer}>
                        <Ionicons name="time-outline" size={16} color="#666666" />
                        <Text style={styles.timerText}>{t.otpTimer} {timer}s</Text>
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isVerifying}>
                        {isVerifying ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.continueButtonText}>{t.otpContinue}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Skip Button - Pinned to Bottom */}
                <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/(buyer)')}>
                    <Text style={styles.skipText}>{t.loginSkip}</Text>
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
        paddingBottom: 20,
    },

    // Content wrapper - responsive with maxWidth
    contentWrapper: {
        width: '100%',
        maxWidth: 353,
        alignSelf: 'center',
    },

    // Header with Back
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
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

    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },

    logo: {
        width: 170,
        height: 60,
    },

    // Instruction
    instruction: {
        fontFamily: 'System',
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 24,
    },

    // OTP Boxes
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 8,
    },

    otpBox: {
        flex: 1,
        aspectRatio: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#1D1E1F',
    },

    // Resend
    resendContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },

    resendText: {
        fontFamily: 'System',
        fontSize: 14,
        color: '#1D1E1F',
    },

    resendLink: {
        fontWeight: '700',
        color: '#3B5191',
    },

    resendDisabled: {
        color: '#9CA3AF',
    },

    // Timer
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 6,
    },

    timerText: {
        fontFamily: 'System',
        fontSize: 13,
        color: '#666666',
    },

    // Continue Button
    continueButton: {
        height: 54,
        backgroundColor: '#3B5191',
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },

    continueButtonText: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
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
