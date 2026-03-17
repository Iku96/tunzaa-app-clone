import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '../src/contexts/TunzaaAuthContext';

/**
 * OTP Screen (Verify & create password)
 * 6-digit code verification with timer and resend functionality
 */
export default function OTPScreen() {
    const router = useRouter();
    const params = useLocalSearchParams() as any;
    const { phone_number, flow, first_name, last_name, password, role, email } = params;
    
    const { verifyOTP, requestOTP, register, createVendor, refreshProfile, saveAuthResponse, getUserDetails } = useTunzaaAuth();

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
                const response = await requestOTP(phone_number);
                setTimer(response.ttl || 30);
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
            Alert.alert('Invalid Code', 'Please enter all 6 digits');
            return;
        }
        setIsVerifying(true);
        try {
            // Removed destructuring of useTunzaaAuth here as it's already done at the top of the component
            const response = await verifyOTP(phone_number, code);
            console.log('✅ OTP verified:', response);

            const verifyResp = response as any;
            if (verifyResp.verified || verifyResp.is_verified || verifyResp.access_token) {
                // Navigate based on the flow
                if (flow === 'register') {
                    console.log(`📝 [OTP] Completing registration process for ${first_name} as ${role}`);
                    
                    try {
                        let authResponse: any = null;

                        // Smart Flow: If OTP verification already returned a token, use it and skip register
                        if (verifyResp.access_token) {
                            console.log('🛰️ [OTP] User already exists/authenticated via OTP, skipping registration call.');
                            authResponse = await saveAuthResponse(verifyResp);
                        } else {
                            // Register new user
                            const registrationData: any = {
                                first_name: first_name || '',
                                last_name: last_name || '',
                                password: password || '',
                                phone_number: phone_number,
                                email: email || '',
                            };
                            authResponse = await register(registrationData);
                            console.log('✅ [OTP] Registration successful:', authResponse.user_id);
                        }
                        
                        if (role === 'merchant') {
                            console.log('✅ [OTP] Account created/verified, moving to business onboarding');
                            router.replace('/(merchant)/onboarding/step-2' as any);
                        } else if (role === 'buyer') {
                            router.replace('/(buyer)' as any);
                        } else {
                            router.replace('/home' as any);
                        }
                    } catch (regErr: any) {
                        console.error('❌ [OTP] Registration/Vendor creation failed:', regErr);
                        // Extract a more helpful message from the API error if possible
                        const errorMessage = regErr.apiError?.message || regErr.message || 'Error occurred. Please try again.';
                        Alert.alert('Registration Failed', errorMessage);
                    }
                } else if (flow === 'reset-password') {
                    router.push({ pathname: '/reset-password', params: { phone_number, reset_token: code } } as any);
                } else {
                    // Default fallback logic
                    router.push({ pathname: '/create-password', params: { phone_number } } as any);
                }
            } else {
                Alert.alert('Verification Failed', 'Invalid code. Please try again.');
            }
        } catch (error: any) {
            console.error('❌ OTP verification failed:', error);
            Alert.alert('Verification Failed', error.message || 'Failed to verify code. Please try again.');
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
                        <Text style={styles.title}>Verify & create password</Text>
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
                        Enter the 6-digit code sent to your phone number or email
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
                            Didn't receive code?{' '}
                            <Text
                                style={[styles.resendLink, timer > 0 && styles.resendDisabled]}
                                onPress={handleResend}
                            >
                                Resend
                            </Text>
                        </Text>
                    </View>

                    {/* Timer */}
                    <View style={styles.timerContainer}>
                        <Ionicons name="time-outline" size={16} color="#666666" />
                        <Text style={styles.timerText}>Resend code in {timer}s</Text>
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isVerifying}>
                        {isVerifying ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.continueButtonText}>Continue</Text>
                        )}
                    </TouchableOpacity>
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
