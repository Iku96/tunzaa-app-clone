import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';

export default function DeliveryOTPScreen() {
    const router = useRouter();
    const { verifyOTP, register, requestOTP } = useTunzaaAuth();
    const { phone, fullName, firstName, lastName, password } = useLocalSearchParams<{
        phone: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
        password?: string;
    }>();
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 4) {
            alert('Tafadhali jaza namba zote 4');
            return;
        }

        setLoading(true);
        try {
            // 1. Verify OTP via whitelabel API
            await verifyOTP(`+255${phone}`, code);

            // 2. Register user with verified phone
            if (firstName && lastName && password) {
                await register({
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: `+255${phone}`,
                    password: password,
                });
            }

            alert('Uthibitisho umekamilika! Tafadhali ingia.');
            router.replace('/delivery-login' as any);
        } catch (e: any) {
            alert(e.message || 'Msimbo si sahihi');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        try {
            await requestOTP(`+255${phone}`);
            setTimer(30);
            alert('Msimbo umetumwa tena!');
        } catch (e: any) {
            alert(e.message || 'Hitilafu imetokea');
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={styles.container}>
                        {/* Header Content */}
                        <View style={styles.content}>
                            <Text style={styles.title}>Thibitisha Msimbo</Text>

                            <Text style={styles.subtitle}>
                                Weka nambari ya kuthibitisha iliyotumwa{'\n'}kwenye nambari +255{phone}
                            </Text>

                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.wrongNumberLink}>Umekosea namba?</Text>
                            </TouchableOpacity>

                            {/* OTP Inputs */}
                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => { inputs.current[index] = ref }}
                                        style={styles.otpInput}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        selectTextOnFocus
                                    />
                                ))}
                            </View>

                            {/* Resend Link */}
                            <View style={styles.resendContainer}>
                                <Text style={styles.resendText}>Hujapokea nambari za uthibitisho? </Text>
                                <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                                    <Text style={[styles.resendLink, timer > 0 && styles.disabledLink]}>
                                        {timer > 0 ? `Omba tena (${timer}s)` : 'Omba tena'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Footer Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleVerify}
                                disabled={loading}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {loading ? 'Inathibitisha...' : 'Thibitisha'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.secondaryButtonText}>Rudi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#315BA9', // Blue
        fontFamily: 'Gilroy-Bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280', // Gray
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
    },
    wrongNumberLink: {
        fontSize: 14,
        color: '#315BA9',
        fontWeight: '600',
        textDecorationLine: 'underline',
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
        width: '100%',
    },
    otpInput: {
        width: 60,
        height: 60,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#315BA9',
        textAlign: 'center',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        // Elevation for Android
        elevation: 1,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        color: '#6B7280',
    },
    resendLink: {
        fontSize: 14,
        color: '#315BA9',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    disabledLink: {
        color: '#9CA3AF',
        textDecorationLine: 'none',
    },
    footer: {
        width: '100%',
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#315BA9',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#315BA9',
        fontSize: 16,
        fontWeight: '600',
    },
});
