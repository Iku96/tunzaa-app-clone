import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { authApi } from '../../../src/services/auth';
import { vendorsApi } from '../../../src/services/vendors';

const PROFILE_EXTRAS_KEY = '@tunzaa_profile_extras';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Vendor&background=F3F4F6&color=6B7280';

export default function FollowBusinessesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user, refreshProfile } = useTunzaaAuth();

    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch active vendors
    const { data: vendorsData, isLoading } = useQuery({
        queryKey: ['onboarding_vendors'],
        queryFn: () => vendorsApi.getVendors({ is_active: true, limit: 20 })
    });

    const vendors = vendorsData?.items || [];
    
    // For the UI mockup, we'll split the vendors into two sections. If we only have a few, we'll just show them in both to populate the UI.
    const discoverBusinesses = vendors.slice(0, Math.ceil(vendors.length / 2) || vendors.length);
    const nearbyBusinesses = vendors.slice(Math.ceil(vendors.length / 2)) || vendors;
    // If nearby is empty, just reuse discover to keep the UI looking full for the mockup
    const displayNearby = nearbyBusinesses.length > 0 ? nearbyBusinesses : discoverBusinesses;

    const toggleVendor = (vendorId: string) => {
        if (selectedVendors.includes(vendorId)) {
            setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
        } else {
            setSelectedVendors([...selectedVendors, vendorId]);
        }
    };

    const finalizeOnboarding = async () => {
        setIsSubmitting(true);
        try {
            const targetUserId = user?.user_id || user?.id;
            if (targetUserId) {
                const profiles = user?.profiles || [];
                let targetProfile = profiles.find((p: any) => p.role?.toLowerCase() === 'buyer') || profiles[0];
                
                // Extract any incoming metadata from the previous screen
                let parsedIncomingMeta = {};
                try {
                    if (params.incomingMeta) {
                        parsedIncomingMeta = JSON.parse(params.incomingMeta as string);
                    }
                } catch (e) {
                    console.warn("Failed to parse incoming meta", e);
                }

                const updatedMeta = {
                    ...(targetProfile?.metadata || {}),
                    ...parsedIncomingMeta,
                    followed_vendors: selectedVendors,
                };

                // Persist to AsyncStorage (workaround: backend doesn't save metadata yet)
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

            // End of Onboarding: Clear the flag and go to Home!
            await AsyncStorage.removeItem('IS_FIRST_TIME_BUYER');
            router.replace('/(buyer)');
        } catch (e) {
            console.error('Failed to finalize onboarding', e);
            await AsyncStorage.removeItem('IS_FIRST_TIME_BUYER');
            router.replace('/(buyer)');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.removeItem('IS_FIRST_TIME_BUYER');
        router.replace('/(buyer)');
    };

    const renderVendorCard = (vendor: any) => {
        const isSelected = selectedVendors.includes(vendor.vendor_id);
        const actualLogo = vendor.stores?.[0]?.branding?.logo || vendor.store?.branding?.logo || vendor.user?.profile_picture;
        const initial = (vendor.business_name || vendor.display_name || 'V').charAt(0).toUpperCase();

        return (
            <TouchableOpacity 
                key={vendor.vendor_id} 
                style={styles.card} 
                onPress={() => toggleVendor(vendor.vendor_id)}
                activeOpacity={0.8}
            >
                <View style={styles.imageContainer}>
                    {actualLogo ? (
                        <Image source={{ uri: actualLogo }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }]}>
                            <Text style={{ fontSize: 36, fontWeight: '700', color: '#6B7280' }}>{initial}</Text>
                        </View>
                    )}
                    <View style={styles.addButton}>
                        <Ionicons name={isSelected ? "checkmark" : "add"} size={16} color="#FFFFFF" />
                    </View>
                </View>
                <Text style={styles.businessName} numberOfLines={1}>{vendor.business_name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1D1E1F" />
                </TouchableOpacity>
                <Text style={styles.title}>Follow interesting profiles</Text>
            </View>
            <View style={styles.headerDivider} />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B5191" />
                    <Text style={styles.loadingText}>Finding businesses for you...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    
                    {/* Discover Businesses Section */}
                    {discoverBusinesses.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Discover businesses</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                {discoverBusinesses.map(renderVendorCard)}
                            </ScrollView>
                        </View>
                    )}

                    {/* Nearby Businesses Section */}
                    {displayNearby.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Find nearby businesses</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                {displayNearby.map((v: any) => renderVendorCard({...v, vendor_id: v.vendor_id + '_nearby'}))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Bottom Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.continueButton} onPress={finalizeOnboarding} disabled={isSubmitting}>
                            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueText}>Continue</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                            <Text style={styles.skipText}>Skip</Text>
                            <Ionicons name="arrow-forward" size={16} color="#3B5191" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, position: 'relative' },
    backButton: { position: 'absolute', left: 16, padding: 8, zIndex: 1 },
    title: { fontSize: 20, fontWeight: '700', color: '#1D1E1F', textAlign: 'center' },
    headerDivider: { height: 1, backgroundColor: '#F3F4F6', width: '100%', marginBottom: 16 },
    
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#6B7280', fontSize: 16 },

    content: { paddingBottom: 40 },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1D1E1F', marginLeft: 24, marginBottom: 16 },
    scrollContent: { paddingHorizontal: 24, gap: 20 },
    
    card: { width: 90, alignItems: 'center' },
    imageContainer: { position: 'relative', marginBottom: 8 },
    image: { width: 90, height: 90, borderRadius: 24, backgroundColor: '#F9FAFB' },
    addButton: { position: 'absolute', top: -5, right: -5, backgroundColor: '#3B5191', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
    businessName: { fontSize: 13, color: '#4B5563', textAlign: 'center', fontWeight: '500' },

    footer: { paddingHorizontal: 24, marginTop: 20 },
    continueButton: { height: 60, backgroundColor: '#3B5191', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    continueText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
    skipButton: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', paddingVertical: 20 },
    skipText: { fontSize: 17, fontWeight: '500', color: '#3B5191', marginRight: 8 },
});
