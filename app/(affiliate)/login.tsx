import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';

export default function AffiliateLoginScreen() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleLogin = () => {
        // Mock authentication, route directly to profile
        router.push('/(affiliate)/profile' as any);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.headerContainer}>
                        {/* Spacing for status bar */}
                    </View>

                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Enter your details to sign in</Text>

                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/blue-tunzaa-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter +255xxx xxx xxx"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                            />
                        </View>

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter password"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none" secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color="#3B5998" />
                                ) : (
                                    <Eye size={20} color="#3B5998" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.forgotPasswordContainer}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <View style={styles.termsContainer}>
                            <TouchableOpacity
                                style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
                                onPress={() => setAcceptedTerms(!acceptedTerms)}
                            >
                                {acceptedTerms && <View style={styles.checkboxInner} />}
                            </TouchableOpacity>

                            <Text style={styles.termsText}>
                                I have read agree to Tunzaa <Text style={styles.linkText}>Terms and Conditions of use, privacy policy, and return policy</Text>
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            (!phoneNumber || !password || !acceptedTerms) && styles.loginButtonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={!phoneNumber || !password || !acceptedTerms}
                    >
                        <Text style={styles.loginButtonText}>Log In</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    headerContainer: {
        height: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 140,
        height: 40,
    },
    formContainer: {
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111827',
    },
    eyeIcon: {
        padding: 16,
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#3B5998',
        fontWeight: '500',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingRight: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#3B5998',
        borderColor: '#3B5998',
    },
    checkboxInner: {
        width: 12,
        height: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    linkText: {
        color: '#3B5998',
    },
    loginButton: {
        backgroundColor: '#3B5998',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
