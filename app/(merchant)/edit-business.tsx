import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions, Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, ChevronDown, Upload, Camera, UserCircle2, Edit2, CheckCircle, X, FileText, MapPin, Hash } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { uploadApi } from '../../src/services/upload';

const CATEGORIES = ['Electronics & Gadgets', 'Fashion & Apparel', 'Food & Beverages', 'Health & Beauty', 'Home & Furniture', 'Sports & Outdoors', 'Automotive', 'Books & Stationery', 'Agriculture & Farming', 'Services', 'Other'];

export default function EditBusinessScreen() {
    const router = useRouter();
    const { user, updateVendor } = useTunzaaAuth() as any;
    const isSubmittingRef = useRef(false);

    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business' || p.role === 'merchant') || {} as any;
    const metadata = vendorProfile?.metadata || {};
    const branding = vendorProfile?.branding || {};

    const [businessName, setBusinessName] = useState(metadata?.business_name || vendorProfile?.display_name || vendorProfile?.displayName || '');
    const [email, setEmail] = useState(metadata?.contact_email || vendorProfile?.contact_email || user?.email || '');
    const [phone, setPhone] = useState(metadata?.contact_phone || vendorProfile?.contact_phone || user?.phone_number || '');
    const [category, setCategory] = useState(metadata?.category || '');
    const [logoImage, setLogoImage] = useState<string | null>(metadata?.logo_url || metadata?.image_url || branding?.logo_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    
    // Location state
    const [region, setRegion] = useState(metadata?.region || metadata?.location?.region || '');
    const [municipal, setMunicipal] = useState(metadata?.municipal || metadata?.location?.municipal || '');
    const [ward, setWard] = useState(metadata?.ward || metadata?.location?.ward || '');
    const [taxId, setTaxId] = useState(vendorProfile?.tax_id || metadata?.tax_id || metadata?.tin_number || '');
    const [notes, setNotes] = useState(metadata?.extraInfo || metadata?.location?.extraInfo || '');
    
    const [documents, setDocuments] = useState<Array<any>>([]);
    const [isUploading, setIsUploading] = useState(false);

    const pickLogo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ 
            mediaTypes: ['images'], // Fix deprecation
            allowsEditing: true, 
            aspect: [1, 1], 
            quality: 0.8 
        });
        if (!result.canceled) setLogoImage(result.assets[0].uri);
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
            if (!result.canceled && result.assets) {
                const asset = result.assets[0];
                setIsUploading(true);
                try {
                    const uploadRes = await uploadApi.uploadFile(asset.uri, asset.name || 'document.pdf');
                    setDocuments(prev => [...prev, { name: asset.name, uri: asset.uri, uploadedUrl: uploadRes.url }]);
                    Alert.alert('Success', 'Document uploaded!');
                } catch (uploadError) {
                    console.warn("Upload service not configured. Saving local reference.");
                    setDocuments(prev => [...prev, { name: asset.name, uri: asset.uri, uploadedUrl: asset.uri }]);
                    Alert.alert('Notice', 'Upload service unavailable. Saved locally for now.');
                } finally { setIsUploading(false); }
            }
        } catch (err) { }
    };

    const handleSave = async () => {
        if (isSubmitting || isSubmittingRef.current) {
            console.log('⚠️ [EditBusiness] Already submitting, ignoring.');
            return;
        }
        if (!businessName.trim()) return Alert.alert('Error', 'Business name is required.');

        setIsSubmitting(true);
        isSubmittingRef.current = true;
        try {
            const profileId = vendorProfile?.profile_id || vendorProfile?.profileId || vendorProfile?.id;
            const vendorId = metadata?.vendor_id || vendorProfile?.vendor_id || profileId;

            if (!vendorId) {
                console.error('❌ [EditBusiness] Missing Vendor ID', { vendorProfile, metadata });
                throw new Error("Vendor ID not found. Please try logging out and back in.");
            }

            let finalLogoUrl = logoImage;
            if (finalLogoUrl && finalLogoUrl.startsWith('file://')) {
                console.log('📤 [EditBusiness] Uploading shop logo...');
                try {
                    const uploadRes = await uploadApi.uploadFile(finalLogoUrl, `logo_${vendorId}.jpg`);
                    finalLogoUrl = uploadRes.url;
                } catch (e: any) {
                    throw new Error(`Logo upload failed: ${e.message}`);
                }
            }

            const updateData = {
                display_name: businessName.trim(),
                business_name: businessName.trim(),
                tax_id: taxId.trim(),
                metadata: {
                    ...metadata,
                    business_name: businessName.trim(),
                    category,
                    contact_email: email.trim(),
                    contact_phone: phone.trim(),
                    tax_id: taxId.trim(),
                    logo_url: finalLogoUrl,
                    image_url: finalLogoUrl,
                    region: region.trim(),
                    municipal: municipal.trim(),
                    ward: ward.trim(),
                    extraInfo: notes.trim(),
                    location: {
                        region: region.trim(),
                        municipal: municipal.trim(),
                        ward: ward.trim(),
                        extraInfo: notes.trim()
                    }
                }
            };

            console.log('💾 [EditBusiness] Saving vendor updates...');
            await updateVendor(vendorId, profileId, updateData);
            Alert.alert('Success', 'Profile updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (error: any) {
            console.error('❌ [EditBusiness] Save failed:', error);
            Alert.alert('Error', error.message || 'Failed to update profile.');
        } finally {
            setIsSubmitting(false);
            isSubmittingRef.current = false;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}><ArrowLeft size={24} color="#111827" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Edit business profile</Text>
                <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator size="small" color="#3A5BA9" /> : <Check size={24} color="#111827" />}
                </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAwareScrollView enableOnAndroid={true} extraScrollHeight={50} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.logoSection}>
                        <View style={styles.logoWrapper}>
                            {logoImage ? <Image source={{ uri: logoImage }} style={styles.logo} /> : <View style={styles.logoPlaceholder}><UserCircle2 size={100} color="#E5E7EB" /></View>}
                            <TouchableOpacity style={styles.logoEditBtn} onPress={pickLogo}><Camera size={16} color="#FFFFFF" /></TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business name</Text>
                        <View style={styles.inputWrapper}><TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="Enter business name" /></View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email address</Text>
                        <View style={styles.inputWrapper}><TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><Edit2 size={16} color="#4B5563" /></View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Category</Text>
                        <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowCategoryModal(true)}>
                            <Text style={styles.inputText}>{category || 'Select a category'}</Text>
                            <ChevronDown size={20} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sectionHeader}>
                        <MapPin size={18} color="#3A5BA9" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>Business Location</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Region (Mkoa)</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="e.g. Dar es Salaam" />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Municipal (Wilaya)</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput style={styles.input} value={municipal} onChangeText={setMunicipal} placeholder="e.g. Kinondoni" />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Ward (Kata)</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput style={styles.input} value={ward} onChangeText={setWard} placeholder="e.g. Makumbusho" />
                        </View>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Hash size={18} color="#3A5BA9" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>Compliance & Tax</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Tax ID (TIN Number)</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput style={styles.input} value={taxId} onChangeText={setTaxId} placeholder="Enter your TIN number" keyboardType="numeric" />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>More Location Detail (Notes)</Text>
                        <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                            <TextInput 
                                style={[styles.input, { textAlignVertical: 'top' }]} 
                                value={notes} 
                                onChangeText={setNotes} 
                                multiline 
                                placeholder="Additional details or landmarks..." 
                            />
                        </View>
                    </View>

                    <View style={styles.complianceSection}>
                        <View style={styles.sectionHeader}>
                            <FileText size={18} color="#3A5BA9" style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>Certificate / Compliance</Text>
                        </View>
                        <View style={styles.uploadArea}>
                            <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument} disabled={isUploading}>
                                <View style={styles.uploadIconContainer}>
                                    {isUploading ? <ActivityIndicator size="small" color="#3A5BA9" /> : <Upload size={24} color="#3A5BA9" />}
                                </View>
                                <Text style={styles.uploadBtnText}>{isUploading ? 'Uploading...' : 'Upload verification document'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>

            <Modal visible={showCategoryModal} transparent={true} animationType="slide" onRequestClose={() => setShowCategoryModal(false)}>
                <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Select Category</Text></View>
                            <FlatList data={CATEGORIES} keyExtractor={(item) => item} renderItem={({ item }) => (
                                <TouchableOpacity style={styles.categoryItem} onPress={() => { setCategory(item); setShowCategoryModal(false); }}>
                                    <Text style={styles.categoryItemText}>{item}</Text>
                                </TouchableOpacity>
                            )} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerBtn: { padding: 4 }, headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    content: { paddingBottom: 40 },
    logoSection: { alignItems: 'center', paddingVertical: 32 },
    logoWrapper: { width: 120, height: 120, borderRadius: 60, position: 'relative' },
    logo: { width: '100%', height: '100%', borderRadius: 60 },
    logoPlaceholder: { width: '100%', height: '100%', borderRadius: 60, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
    logoEditBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3A5BA9', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    inputGroup: { paddingHorizontal: 16, marginBottom: 20 },
    inputLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, backgroundColor: '#F9FAFB', paddingHorizontal: 16, height: 54 },
    input: { flex: 1, fontSize: 15, color: '#111827' }, 
    inputText: { flex: 1, fontSize: 15, color: '#111827' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    complianceSection: { marginTop: 10 },
    uploadArea: { backgroundColor: '#FDFDFD', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, padding: 30, alignItems: 'center', marginTop: 16 },
    uploadBtn: { alignItems: 'center' }, uploadIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    uploadBtnText: { fontSize: 14, fontWeight: 'bold', backgroundColor: '#3A5BA9', color: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', paddingBottom: 30 },
    modalHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }, modalTitle: { fontSize: 18, fontWeight: 'bold' },
    categoryItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' }, categoryItemText: { fontSize: 15 }
});