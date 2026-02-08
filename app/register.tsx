import { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';

/**
 * Registration Screen (Pixel-Perfect Figma Implementation)
 * 
 * Layout:
 * - SafeAreaView with space-between (top content + bottom Skip)
 * - Exact Figma spacing, typography, and colors
 * - Wordmark logo (centered)
 * - Social login buttons with equal flex distribution
 * - Skip button pinned to bottom (190×54px)
 * 
 * Note: Custom fonts (Gilroy, Calibri) require font linking.
 * Currently using system fallbacks with exact sizing.
 */
export default function RegisterScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    const [firstName, setFirstName] = useState('');
    const [secondName, setSecondName] = useState('');
    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleCreateAccount = () => {
        // TODO: Implement registration with Supabase
        if (!agreedToTerms) {
            alert('Please agree to Terms and Conditions');
            return;
        }
        console.log('Creating account:', { firstName, secondName, phoneOrEmail });
        router.push('/home');
    };

    const handleSocialLogin = (provider: string) => {
        // TODO: Implement social login
        console.log('Social login:', provider);
    };

    const handleLogin = () => {
        router.push('/login');
    };

    const handleSkip = () => {
        router.push('/home');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Content Wrapper - maxWidth 353px */}
                <View style={styles.contentWrapper}>
                    {/* Top section */}
                    <View>
                        {/* Back Button */}
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={14} color="#1D1E1F" />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Create an account</Text>
                            <Text style={styles.subtitle}>Please fill in your details to get started</Text>
                        </View>

                        {/* Logo (wordmark) */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/blue-tunzaa-logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Inputs */}
                        <View style={styles.formContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your first name"
                                placeholderTextColor="#666666"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your second name"
                                placeholderTextColor="#666666"
                                value={secondName}
                                onChangeText={setSecondName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter phone number or email"
                                placeholderTextColor="#666666"
                                value={phoneOrEmail}
                                onChangeText={setPhoneOrEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Terms */}
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

                        {/* Create button */}
                        <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount}>
                            <Text style={styles.createButtonText}>Create Account</Text>
                        </TouchableOpacity>

                        {/* Divider with lines */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('google')}>
                                <FontAwesome name="google" size={19} color="#EA4335" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('apple')}>
                                <Ionicons name="logo-apple" size={20} color="#1D1E1F" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('facebook')}>
                                <FontAwesome name="facebook-f" size={20} color="#1877F2" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('x')}>
                                <FontAwesome5 name="twitter" size={20} color="#1D1E1F" />
                            </TouchableOpacity>
                        </View>

                        {/* Login */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={handleLogin}>
                                <Text style={styles.loginLink}>Log in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Bottom section: Skip pinned */}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Text style={styles.skipArrow}>→</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Root
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 20.5,  // Figma: SafeArea → Back Arrow
        justifyContent: 'space-between',
    },

    // HEADER FRAME
    backButton: {
        alignSelf: 'flex-start',
        width: 14,   // Figma: Back arrow frame width
        height: 16,  // Figma: Back arrow frame height
        marginBottom: 20.5,  // Figma: Arrow → Title gap
    },

    header: {
        alignItems: 'center',
    },
    title: {
        fontFamily: 'System',  // Figma: Gilroy SemiBold
        fontSize: 20,
        fontWeight: '600',  // SemiBold
        lineHeight: 35,
        letterSpacing: 0.1,
        color: '#1D1E1F',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 9,  // Figma: Title → Subtitle gap (8-10px)
        fontFamily: 'System',  // Figma: Calibri
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 14,  // 100% of font size
        letterSpacing: 0.01,
        color: '#666666',
        textAlign: 'center',
    },

    // LOGO FRAME
    logoContainer: {
        alignItems: 'center',
        marginTop: 22,
        marginBottom: 18,
    },
    logo: {
        width: 170,   // Wordmark width
        height: 60,   // Wordmark height
    },

    // FORM FRAME
    formContainer: {
        gap: 16,
        marginTop: 6,
    },
    input: {
        height: 54,  // Figma: Input field height
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',  // Figma: Border gray
        paddingHorizontal: 16,
        fontFamily: 'System',  // Figma: Calibri
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 16,  // 100%
        letterSpacing: 0.01,
        color: '#666666',  // Figma: Input text color
    },

    // TERMS ROW
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        marginRight: 10,  // Figma: Gap in terms row
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#425BA4',  // Figma: Primary blue
        borderColor: '#425BA4',
    },
    termsText: {
        fontFamily: 'System',
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
    },
    termsLink: {
        color: '#425BA4',  // Figma: Primary blue
        textDecorationLine: 'underline',
    },

    // CREATE ACCOUNT BUTTON
    createButton: {
        height: 47,  // Figma: Exact button height
        marginTop: 19,  // Figma: Terms → Button gap (18-20px)
        backgroundColor: '#425BA4',  // Figma: Primary blue
        borderRadius: 40,  // Figma: Pill radius
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        fontFamily: 'System',
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    // DIVIDER FRAME
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',  // Figma: Divider gray
    },
    dividerText: {
        fontFamily: 'System',
        marginHorizontal: 12,
        fontSize: 12,
        color: '#666666',
    },

    // SOCIAL LOGIN FRAME
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,  // Figma: Gap between social buttons
        marginBottom: 18,
    },
    socialButton: {
        flex: 1,  // Figma: Equal distribution (not fixed width)
        height: 46,  // Figma: Social button height
        borderRadius: 10,  // Figma: Social button radius
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',  // Figma: Border gray
        paddingVertical: 13,  // Figma: Top/Bottom padding
        paddingHorizontal: 27,  // Figma: Left/Right padding
        alignItems: 'center',
        justifyContent: 'center',
    },

    // LOGIN ROW
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    loginText: {
        fontFamily: 'System',
        fontSize: 13,
        color: '#1D1E1F',  // Figma: Title dark
        fontWeight: '600',
    },
    loginLink: {
        fontFamily: 'System',
        fontSize: 13,
        color: '#425BA4',  // Figma: Primary blue
        fontWeight: '700',
    },

    // SKIP BUTTON (BOTTOM PINNED)
    // Figma: 190×54, radius 1000, padding 15, gap 10
    // Animation: Move in Right, Spring (mass 1, stiffness 300, damping 20)
    skipButton: {
        width: 190,  // Figma: Fixed width
        height: 54,  // Figma: Fixed height
        borderRadius: 1000,  // Figma: Pill shape
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,  // Figma: Padding
        gap: 10,  // Figma: Gap between text and arrow
        marginBottom: 18,
        marginTop: 6,
    },
    skipText: {
        fontFamily: 'System',  // Figma: Inter Medium
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,  // Figma: 24h text element
        letterSpacing: -0.24,  // -1.5% of 16px
        color: '#3B5191',  // Figma: Skip text blue
    },
    skipArrow: {
        fontSize: 20,  // Figma: 20×20 arrow icon
        color: '#3B5191',
        lineHeight: 20,
    },

    // CONTENT WRAPPER - constrains layout to Figma width
    contentWrapper: {
        width: '100%',
        maxWidth: 353,
        alignSelf: 'center',
    },
});
