import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Camera, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { uploadApi } from '../../src/services/upload';

export default function StoreProfileScreen() {
    const router = useRouter();
    const { user, updateVendor } = useTunzaaAuth() as any;

    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business' || p.role === 'merchant') || {} as any;
    const metadata = vendorProfile?.metadata || {};
    const branding = vendorProfile?.branding || {};

    const [shopName, setShopName] = useState(metadata?.business_name || vendorProfile?.display_name || vendorProfile?.business_name || '');
    const [phone, setPhone] = useState(metadata?.contact_phone || vendorProfile?.contact_phone || user?.phone_number || '');
    const [description, setDescription] = useState(metadata?.description || '');
    const [email, setEmail] = useState(metadata?.contact_email || vendorProfile?.contact_email || user?.email || '');
    const [coverImage, setCoverImage] = useState<string | null>(metadata?.banner_url || branding?.banner_url || null);
    const [logoImage, setLogoImage] = useState<string | null>(metadata?.logo_url || metadata?.image_url || branding?.logo_url || null);
    const [loading, setLoading] = useState(false);

    const pickImage = async (type: 'cover' | 'logo') => {
        const result = await ImagePicker.launchImageLibraryAsync({ 
            mediaTypes: ['images'], 
            allowsEditing: true, 
            aspect: type === 'logo' ? [1, 1] : [3, 1], 
            quality: 0.8 
        });
        if (!result.canceled) { if (type === 'cover') setCoverImage(result.assets[0].uri); else setLogoImage(result.assets[0].uri); }
    };

    const handleSave = async () => {
        if (!shopName.trim()) return Alert.alert('Error', 'Please enter your shop name.');

        setLoading(true);
        try {
            const profileId = vendorProfile?.profile_id || vendorProfile?.profileId || vendorProfile?.id;
            const vendorId = metadata?.vendor_id || vendorProfile?.vendor_id || profileId;

            if (!vendorId) {
                console.error('❌ [StoreProfile] Missing Vendor ID', { vendorProfile, metadata });
                throw new Error("Vendor ID not found. Please try logging out and back in.");
            }

            let finalLogoUrl = logoImage;
            if (finalLogoUrl && finalLogoUrl.startsWith('file://')) {
                console.log('📤 [StoreProfile] Uploading store logo...');
                try {
                    const uploadRes = await uploadApi.uploadFile(finalLogoUrl, `logo_${vendorId}.jpg`);
                    finalLogoUrl = uploadRes.url;
                } catch (e: any) {
                    throw new Error(`Logo upload failed: ${e.message}`);
                }
            }

            let finalCoverUrl = coverImage;
            if (finalCoverUrl && finalCoverUrl.startsWith('file://')) {
                console.log('📤 [StoreProfile] Uploading store banner...');
                try {
                    const uploadRes = await uploadApi.uploadFile(finalCoverUrl, `banner_${vendorId}.jpg`);
                    finalCoverUrl = uploadRes.url;
                } catch (e: any) {
                    throw new Error(`Banner upload failed: ${e.message}`);
                }
            }

            const updateData = {
                display_name: shopName.trim(),
                business_name: shopName.trim(),
                metadata: {
                    ...metadata,
                    business_name: shopName.trim(),
                    description: description.trim(),
                    contact_phone: phone.trim(),
                    contact_email: email.trim(),
                    logo_url: finalLogoUrl,
                    banner_url: finalCoverUrl
                },
                store: {
                    store_name: shopName.trim(),
                    description: description.trim(),
                    branding: {
                        ...branding,
                        logo_url: finalLogoUrl,
                        banner_url: finalCoverUrl
                    },
                    banners: finalCoverUrl ? [finalCoverUrl] : []
                }
            };

            console.log('💾 [StoreProfile] Saving vendor updates...');
            await updateVendor(vendorId, profileId, updateData);
            Alert.alert('Success', 'Store profile updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (e: any) {
            console.error('❌ [StoreProfile] Save failed:', e);
            Alert.alert('Error', e.message || 'Failed to update store profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={loading}><ArrowLeft size={24} color="#111827" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Store Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveButton}>
                    {loading ? <ActivityIndicator size="small" color="#425BA4" /> : <Text style={styles.saveButtonText}>Save</Text>}
                </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAwareScrollView enableOnAndroid={true} extraScrollHeight={50} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        <View style={styles.coverImageContainer}>
                            {coverImage ? <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" /> : <View style={styles.placeholderCover} />}
                            <TouchableOpacity style={styles.cameraIconContainer} onPress={() => pickImage('cover')}><Camera size={18} color="#3A5BA9" /></TouchableOpacity>
                        </View>

                        <View style={styles.logoContainer}>
                            <TouchableOpacity style={styles.logoCircle} onPress={() => pickImage('logo')}>
                                {logoImage ? <Image source={{ uri: logoImage }} style={styles.logoImage} /> : <View style={styles.logoPlaceholder}><Text style={{ fontSize: 10, color: '#6B7280' }}>Add Logo</Text></View>}
                                <View style={styles.plusBadge}><Ionicons name="add" size={14} color="#3A5BA9" /></View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}><Text style={styles.label}>Business Name</Text><TextInput style={styles.input} value={shopName} onChangeText={setShopName} /></View>
                            <View style={styles.inputGroup}><Text style={styles.label}>Phone</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View>
                            <View style={styles.inputGroup}><Text style={styles.label}>Contact Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View>
                            <View style={styles.inputGroup}><Text style={styles.label}>Store Description</Text><TextInput style={[styles.input, { height: 100 }]} value={description} onChangeText={setDescription} multiline textAlignVertical="top" /></View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    backButton: { padding: 4 }, headerTitle: { fontSize: 18, fontWeight: 'bold' },
    saveButton: { paddingHorizontal: 12, paddingVertical: 6 }, saveButtonText: { fontSize: 16, fontWeight: '600', color: '#425BA4' },
    scrollContent: { padding: 16 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20 },
    coverImageContainer: { width: '100%', height: 120, backgroundColor: '#E5E7EB', position: 'relative' }, coverImage: { width: '100%', height: '100%' }, placeholderCover: { width: '100%', height: '100%', backgroundColor: '#DAE1F3' },
    cameraIconContainer: { position: 'absolute', right: 12, bottom: 12, backgroundColor: '#FFFFFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    logoContainer: { alignItems: 'center', marginTop: -40, marginBottom: 16 },
    logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', padding: 2 }, logoImage: { width: '100%', height: '100%', borderRadius: 38 },
    logoPlaceholder: { width: '100%', height: '100%', borderRadius: 38, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    plusBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#3A5BA9', justifyContent: 'center', alignItems: 'center' },
    formContainer: { padding: 20 }, inputGroup: { marginBottom: 20 }, label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 }
});