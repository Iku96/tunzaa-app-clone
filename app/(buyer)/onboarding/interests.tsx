import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { authApi } from '../../../src/services/auth';

const PROFILE_EXTRAS_KEY = '@tunzaa_profile_extras';

const INTEREST_OPTIONS = [
    'Gaming',
    'Baby & Kids Products',
    'Groceries & Daily Needs',
    'Gaming ',
    'Travel',
    'Loan & Financing Options',
    'Event & Travel Tickets',
    'Books',
    'Deals & Discounts',
    'Automotive',
];

export default function AddInterestsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user, refreshProfile } = useTunzaaAuth();

    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const finalizeOnboarding = async () => {
        setIsSubmitting(true);
        try {
            // Safely grab the incoming metadata from the previous screen so we don't overwrite it
            let parsedIncomingMeta: Record<string, any> = {};
            try {
                if (params.incomingMeta) {
                    parsedIncomingMeta = JSON.parse(params.incomingMeta as string);
                }
            } catch (e) {
                console.warn("Failed to parse incoming meta", e);
            }
            
            let updatedMeta: Record<string, any> = { ...parsedIncomingMeta };
            const targetUserId = user?.user_id || user?.id;

            // Save interests if any selected
            if (selectedInterests.length > 0) {
                if (targetUserId) {
                    const profiles = user?.profiles || [];
                    let targetProfile = profiles.find((p: any) => p.role?.toLowerCase() === 'buyer') || profiles[0];
                    
                    updatedMeta = {
                        ...(targetProfile?.metadata || {}),
                        ...parsedIncomingMeta,
                        interests: selectedInterests,
                    };

                    // Still attempt the API calls (they'll work once backend is fixed)
                    try {
                        await authApi.updateUser(targetUserId, { 
                            first_name: user?.first_name || '',
                            last_name: user?.last_name || '',
                            email: user?.email || undefined,
                            phone_number: user?.phone_number || undefined,
                            display_name: user?.display_name || undefined,
                            name: user?.name || undefined,
                            metadata: updatedMeta 
                        });
                        if (targetProfile?.profile_id) {
                            await authApi.updateUserProfile(targetUserId, targetProfile.profile_id, { metadata: updatedMeta });
                        }
                        if (refreshProfile) await refreshProfile();
                    } catch (apiErr) {
                        console.warn('[Onboarding] API metadata update failed (non-blocking):', apiErr);
                    }
                }
            } else {
                // Even if no interests selected, add the key so downstream knows
                updatedMeta.interests = [];
            }

            // Persist to AsyncStorage (workaround: backend doesn't save metadata yet)
            if (targetUserId) {
                try {
                    const existingExtras = await AsyncStorage.getItem(`${PROFILE_EXTRAS_KEY}_${targetUserId}`);
                    const existing = existingExtras ? JSON.parse(existingExtras) : {};
                    await AsyncStorage.setItem(`${PROFILE_EXTRAS_KEY}_${targetUserId}`, JSON.stringify({
                        ...existing,
                        ...updatedMeta,
                    }));
                } catch (storageErr) {
                    console.warn('[Onboarding] AsyncStorage write failed:', storageErr);
                }
            }

            // Route to businesses
            router.push({ pathname: '/(buyer)/onboarding/businesses', params: { incomingMeta: JSON.stringify(updatedMeta || {}) } });
        } catch (e) {
            console.error('Failed to finalize onboarding', e);
            router.push('/(buyer)/onboarding/businesses');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1D1E1F" />
                </TouchableOpacity>
                <Text style={styles.title}>Add your interests</Text>
            </View>
            
            <Text style={styles.subtitle}>We'll personalize your experience based on you things you like.</Text>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                <View style={styles.logoContainer}>
                    <Image
                        source={require('@/assets/blue-tunzaa-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.chipContainer}>
                    {INTEREST_OPTIONS.map((interest) => {
                        const isSelected = selectedInterests.includes(interest);
                        return (
                            <TouchableOpacity
                                key={interest}
                                style={[styles.chip, isSelected && styles.chipSelected]}
                                onPress={() => toggleInterest(interest)}
                            >
                                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                    {interest}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity style={styles.continueButton} onPress={finalizeOnboarding} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueText}>Continue</Text>}
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.skipButton} onPress={finalizeOnboarding}>
                <Text style={styles.skipText}>Skip</Text>
                <Ionicons name="arrow-forward" size={16} color="#3B5191" />
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 40, position: 'relative' },
    backButton: { position: 'absolute', left: 8, padding: 8, zIndex: 1 },
    title: { fontSize: 22, fontWeight: '700', color: '#1D1E1F', textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 70, marginTop: 0, paddingHorizontal: 20 },
    content: { paddingHorizontal: 32, paddingBottom: 40 },
    logoContainer: { alignItems: 'center', marginBottom: 70 },
    logo: { width: 260, height: 90 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 70, paddingHorizontal: 0 },
    chip: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FFFFFF' },
    chipSelected: { borderColor: '#3B5191', backgroundColor: '#EFF6FF' },
    chipText: { fontSize: 14, color: '#1D1E1F', fontWeight: '500' },
    chipTextSelected: { color: '#3B5191', fontWeight: '700' },
    continueButton: { height: 56, backgroundColor: '#3B5191', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
    continueText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    skipButton: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', paddingBottom: 20, paddingTop: 30 },
    skipText: { fontSize: 16, fontWeight: '500', color: '#3B5191', marginRight: 8 },
});
