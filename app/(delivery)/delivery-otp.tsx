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
import { supabase } from '../../src/lib/supabase';

export default function DeliveryOTPScreen() {
    const router = useRouter();
    const { phone, fullName, password } = useLocalSearchParams<{ phone: string, fullName?: string, password?: string }>();
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

        // Move to next input if text is entered
        if (text && index < 3) {
            inputs.current[index + 1]?.focus();
        }
        // Move to previous input if text is cleared usually handled by onKeyPress, 
        // but for simplicity in this basic setup we'll just focus next on entry.
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
            // 1. Verify OTP
            const { data, error } = await supabase.auth.verifyOtp({
                phone: `+255${phone}`,
                token: code,
                type: 'sms',
            });

            if (error) throw error;

            // 2. Set Password (if provided) implementation
            // Note: verifying SMS OTP logs the user in.
            if (password && data.user) {
                const { error: updateError } = await supabase.auth.updateUser({
                    password: password
                });
                if (updateError) {
                    console.error('Error updating password:', updateError);
                    // Continue anyway? Or show error? User is logged in but password might not be set.
                }
            }

            // 3. Create/Update Profile
            if (data.user && fullName) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        full_name: fullName,
                        role: 'delivery',
                        phone_number: phone,
                    } as any);

                if (profileError) {
                    console.error('Profile error:', profileError);
                }
            }

            // Success -> Go to Login (or Home since they are logged in?)
            // Requested flow: "button should direct the user to the sign in screen"
            // We should probably sign them out first if we want them to sign in again, or just redirect.
            // If they are logged in, directing to Login might auto-redirect to Home if there's an auth listener.
            // Let's assume we just go to login.
            alert('Uthibitisho umekamilika!');
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
            const { error } = await supabase.auth.resend({
                type: 'sms',
                phone: `+255${phone}`,
            });
            if (error) throw error;
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
