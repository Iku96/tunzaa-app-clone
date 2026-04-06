import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../src/contexts/LanguageContext';

export default function AffiliateRegisterScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleCreateAccount = () => {
        // Skipping OTP for now and going straight to shop details 
        router.replace('/(affiliate)/shop-details' as any);
    };

    const handleLoginRedirect = () => {
        router.push('/(affiliate)/login' as any);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.headerContainer}>
                    </View>

                    <Text style={styles.title}>{t.affiliateRegisterTitle}</Text>

                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/blue-tunzaa-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={t.affiliatePhonePlaceholder}
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>

                    <View style={styles.termsContainer}>
                        <TouchableOpacity
                            style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
                            onPress={() => setAcceptedTerms(!acceptedTerms)}
                        >
                            {acceptedTerms && <View style={styles.checkboxInner} />}
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            {t.affiliateTermsAgreement}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.createButton,
                            (!phoneNumber || !acceptedTerms) && styles.createButtonDisabled
                        ]}
                        onPress={handleCreateAccount}
                        disabled={!phoneNumber || !acceptedTerms}
                    >
                        <Text style={styles.createButtonText}>{t.affiliateRegisterButton}</Text>
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>
                            {t.affiliateAlreadyAccount}{' '}
                            <Text style={styles.footerLink} onPress={handleLoginRedirect}>
                                {t.affiliateLoginLink}
                            </Text>
                        </Text>
                    </View>

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
        marginBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logo: {
        width: 140,
        height: 40,
    },
    inputContainer: {
        marginBottom: 24,
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
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 32,
        paddingRight: 20,
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
        backgroundColor: '#F3F4F6', // Lighter background from screenshot
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
        color: '#3B5998', // Tunzaa blue
    },
    createButton: {
        backgroundColor: '#3B5998',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    createButtonDisabled: {
        opacity: 0.7,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    footerLink: {
        color: '#3B5998',
    },
});
