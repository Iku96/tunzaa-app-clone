/**
 * ============================================================================
 * OTP SCREEN (TUNZAA 2.0 RESTORED)
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';

export default function OTPScreen() {
    const router = useRouter();
    const params = useLocalSearchParams() as any;
    const { phone_number, flow, first_name, last_name, password, role, email } = params;
    
    const { verifyOTP, requestOTP, register, saveAuthResponse } = useTunzaaAuth();
    const { t } = useLanguage();

    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        if (text.length > 1) {
            const pastedText = text.slice(0, 6).split('');
            const newDigits = [...otpDigits];
            pastedText.forEach((char, i) => { if (index + i < 6) newDigits[index + i] = char; });
            setOtpDigits(newDigits);
            const nextIndex = Math.min(index + pastedText.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newDigits = [...otpDigits];
        newDigits[index] = text.slice(-1);
        setOtpDigits(newDigits);
        if (text && index < 5) {
            setTimeout(() => { inputRefs.current[index + 1]?.focus(); }, 10);
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (timer === 0 && phone_number) {
            try {
                const response = await requestOTP(phone_number);
                setTimer(response?.ttl || 30);
                setOtpDigits(['', '', '', '', '', '']);
            } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to resend code.');
            }
        }
    };

    const handleContinue = async () => {
        const code = otpDigits.join('');
        if (code.length !== 6) {
            Alert.alert(t.otpInvalidCode, t.otpEnterAllDigits);
            return;
        }

        setIsVerifying(true);
        try {
            const response = await verifyOTP(phone_number, code);
            const verifyResp = response as any;
            
            if (verifyResp.verified || verifyResp.is_verified || verifyResp.access_token) {
                if (flow === 'register') {
                    const portal = role === 'merchant' ? 'merchant' : (role === 'delivery' ? 'delivery' : 'buyer');
                    
                    // NEW FLOW: If we have a nextStep, go there instead of registering immediately
                    if (params.nextStep === 'password') {
                        return router.replace({
                            pathname: '/register',
                            params: {
                                step: 'password',
                                first_name: first_name,
                                last_name: last_name,
                                phone_number: phone_number,
                                role: role,
                            }
                        } as any);
                    }

                    // If verified via existing token
                    if (verifyResp.access_token && verifyResp.access_token.includes('.')) {
                        await AsyncStorage.setItem('LAST_PORTAL', portal);
                        await saveAuthResponse(verifyResp);
                    } else {
                        // Create new registration
                        const registrationData = { first_name, last_name, password, phone_number, email };
                        await register(registrationData, portal);
                    }
                } else {
                    router.replace({ pathname: '/create-password', params: { phone_number } } as any);
                }
            } else {
                Alert.alert(t.otpVerifyFailed, t.otpInvalidCode);
            }
        } catch (error: any) {
            Alert.alert(t.otpVerifyFailed, error.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.contentWrapper}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#1D1E1F" />
                        </TouchableOpacity>
                        <Text style={styles.title}>{t.otpTitle}</Text>
                    </View>

                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/blue-tunzaa-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.instruction}>{t.otpInstruction}</Text>

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
                                maxLength={index === 0 ? 6 : 1}
                                textContentType="oneTimeCode"
                                autoComplete="one-time-code"
                            />
                        ))}
                    </View>

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

                    <View style={styles.timerContainer}>
                        <Ionicons name="time-outline" size={16} color="#666666" />
                        <Text style={styles.timerText}>{t.otpTimer} {timer}s</Text>
                    </View>

                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isVerifying}>
                        {isVerifying ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueButtonText}>{t.otpContinue}</Text>}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/(buyer)')}>
                    <Text style={styles.skipText}>{t.loginSkip}</Text>
                    <Text style={styles.skipArrow}>→</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 20, justifyContent: 'space-between', paddingBottom: 20 },
    contentWrapper: { width: '100%', maxWidth: 353, alignSelf: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    backButton: { marginRight: 12 },
    title: { fontSize: 18, fontWeight: '600', color: '#1D1E1F' },
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    logo: { width: 170, height: 60 },
    instruction: { fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 24 },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
    otpBox: { flex: 1, aspectRatio: 1, backgroundColor: '#F3F4F6', borderRadius: 12, fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#1D1E1F' },
    resendContainer: { alignItems: 'center', marginBottom: 8 },
    resendText: { fontSize: 14, color: '#1D1E1F' },
    resendLink: { fontWeight: '700', color: '#3B5191' },
    resendDisabled: { color: '#9CA3AF' },
    timerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 6 },
    timerText: { fontSize: 13, color: '#666666' },
    continueButton: { height: 54, backgroundColor: '#3B5191', borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    continueButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    skipButton: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', paddingBottom: 20, marginTop: 16 },
    skipText: { fontSize: 16, fontWeight: '500', color: '#3B5191', marginRight: 8 },
    skipArrow: { fontSize: 16, color: '#3B5191', fontWeight: '500' },
});
