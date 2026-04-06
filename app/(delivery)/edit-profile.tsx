/**
 * ============================================================================
 * EDIT DELIVERY PROFILE SCREEN
 * ============================================================================
 * Purpose: Allows a Delivery Partner to update their metadata and base identity.
 * * * Update Architecture:
 * 1. Base Identity: Calls `updateUser` to change names on the core account.
 * 2. Profile Metadata: Calls `updateUserProfile` for Company and Vehicle info.
 * 3. Atomic State Push: Uses `saveAuthResponse` to update the local UI 
 * immediately, bypassing any backend database/cache lag.
 * * * Onboarding Note:
 * This screen uses descriptive placeholders (e.g., vehicle examples) to ensure
 * the user provides the correct format for logistics tracking.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Global Context & API Integration
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { authApi } from '../../src/services/auth';

export default function EditDeliveryProfileScreen() {
    const router = useRouter();

    // We pull in updateUser (for Base Identity) and saveAuthResponse (for atomic UI sync)
    const { user, updateUser, saveAuthResponse } = useTunzaaAuth();

    // Identify the specific delivery profile from the multi-role profiles array
    const deliveryProfile = user?.profiles?.find(
        p => p.role === 'delivery' || p.role === 'delivery_partner'
    );

    // ------------------------------------------------------------------------
    // STATE MANAGEMENT
    // ------------------------------------------------------------------------
    const [partnerName, setPartnerName] = useState(
        deliveryProfile?.metadata?.partner_name ||
        deliveryProfile?.display_name ||
        user?.name ||
        `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
    );

    const [companyName, setCompanyName] = useState(
        deliveryProfile?.metadata?.business_name || ''
    );

    const [vehicleType, setVehicleType] = useState(
        deliveryProfile?.metadata?.vehicle_type || ''
    );

    // Controls UI feedback during the async save process
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ------------------------------------------------------------------------
    // SUBMISSION HANDLER
    // ------------------------------------------------------------------------
    const handleSave = async () => {
        if (!deliveryProfile?.profile_id || !user) {
            Alert.alert("Error", "Session error. Please log out and back in.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Format name for the Core Identity API
            const [firstName, ...lastParts] = partnerName.trim().split(' ');
            const lastName = lastParts.join(' ');

            // Extract Partner ID (fallback to vendor_id or profile_id string)
            const partnerId = deliveryProfile.vendor_id || deliveryProfile.profile_id;
            const updatedMetadata = {
                ...(deliveryProfile.metadata || {}),
                business_name: companyName.trim(),
                vehicle_type: vehicleType.trim(),
                partner_name: partnerName.trim()
            };

            // 1. EXECUTE API UPDATES
            // We run these in parallel to reduce overall waiting time
            const promises: any[] = [
                updateUser({ first_name: firstName, last_name: lastName })
            ];

            if (partnerId) {
                promises.push(
                    authApi.updateDeliveryPartner(partnerId, updatedMetadata)
                        .catch((err: any) => console.warn('[DeliveryProfile] updateDeliveryPartner failed:', err.message))
                );
            }

            promises.push(
                authApi.updateUserProfile(user.user_id, deliveryProfile.profile_id, {
                    display_name: partnerName.trim(),
                    metadata: updatedMetadata
                }).catch((err: any) => console.warn('[DeliveryProfile] updateUserProfile failed:', err.message))
            );

            await Promise.all(promises);

            // 2. CONSTRUCT FINAL ATOMIC STATE
            // We manually build the updated user object to ensure local UI is 
            // 100% accurate even if the backend cache is lagging.
            const finalUser = JSON.parse(JSON.stringify(user));
            finalUser.first_name = firstName;
            finalUser.last_name = lastName;
            finalUser.name = partnerName;

            const pIndex = finalUser.profiles.findIndex(
                (p: any) => p.profile_id === deliveryProfile.profile_id
            );

            if (pIndex > -1) {
                finalUser.profiles[pIndex].display_name = partnerName.trim();
                finalUser.profiles[pIndex].metadata = {
                    ...finalUser.profiles[pIndex].metadata,
                    business_name: companyName.trim(),
                    vehicle_type: vehicleType.trim(),
                    partner_name: partnerName.trim()
                };
            }

            // 3. PUSH TO CONTEXT & STORAGE
            // This forcefully replaces the local session with our "Perfect Data"
            await saveAuthResponse(finalUser);

            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Profile Update Error:", error);
            Alert.alert("Error", "Update failed. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>

            {/* Header with Back Navigation */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
                    <Ionicons name="arrow-back" size={24} color="#000000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.spacer} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >

                    {/* Your Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Your Name</Text>
                        <TextInput
                            style={styles.input}
                            value={partnerName}
                            onChangeText={setPartnerName}
                            placeholder="Enter your full name"
                            placeholderTextColor="#9CA3AF"
                            editable={!isSubmitting}
                        />
                    </View>

                    {/* Company Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Company Name</Text>
                        <TextInput
                            style={styles.input}
                            value={companyName}
                            onChangeText={setCompanyName}
                            placeholder="Enter company or 'Individual'"
                            placeholderTextColor="#9CA3AF"
                            editable={!isSubmitting}
                        />
                    </View>

                    {/* Vehicle Details Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Details</Text>
                        <TextInput
                            style={styles.input}
                            value={vehicleType}
                            onChangeText={setVehicleType}
                            placeholder="e.g. MC 572 EDN"
                            placeholderTextColor="#9CA3AF"
                            editable={!isSubmitting}
                        />
                    </View>

                    {/* Save Action Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ------------------------------------------------------------------------
// STYLES
// ------------------------------------------------------------------------
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
    spacer: { width: 24 },
    keyboardView: { flex: 1 },
    scrollContent: { padding: 24 },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '500' },
    input: {
        height: 52,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    saveButton: {
        height: 56,
        backgroundColor: '#425BA4',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32
    },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});