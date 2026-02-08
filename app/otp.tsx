import { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * OTP Screen (Verify & create password)
 * 6-digit code verification with timer and resend functionality
 */
export default function OTPScreen() {
    const router = useRouter();

    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        const newDigits = [...otpDigits];
        newDigits[index] = text;
        setOtpDigits(newDigits);
    };

    const handleResend = () => {
        if (timer === 0) {
            console.log('Resending code...');
            setTimer(30);
            setOtpDigits(['', '', '', '', '', '']);
        }
    };

    const handleContinue = () => {
        const code = otpDigits.join('');
        if (code.length === 6) {
            console.log('OTP:', code);
            router.push('/create-password');
        } else {
            alert('Please enter all 6 digits');
        }
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
                                style={styles.otpBox}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                keyboardType="number-pad"
                                maxLength={1}
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
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                        <Text style={styles.continueButtonText}>Continue</Text>
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
