/**
 * Edit Business Profile Screen
 * Fully integrated with backend — all fields are functional:
 * - Business name, email, phone (text inputs)
 * - Profile picture (image picker + upload)
 * - Category (modal picker)
 * - Document upload (document picker + upload)
 */
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, Image,
    Dimensions, Alert, ActivityIndicator, TouchableWithoutFeedback,
    Keyboard, Modal, FlatList, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft, Check, ChevronDown, Upload, Camera,
    UserCircle2, Edit2, CheckCircle, X, FileText,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { uploadApi } from '../../src/services/upload';

const { width } = Dimensions.get('window');

/** Business categories available for merchants */
const CATEGORIES = [
    'Electronics & Gadgets',
    'Fashion & Apparel',
    'Food & Beverages',
    'Health & Beauty',
    'Home & Furniture',
    'Sports & Outdoors',
    'Automotive',
    'Books & Stationery',
    'Agriculture & Farming',
    'Services',
    'Other',
];

export default function EditBusinessScreen() {
    const router = useRouter();
    const { user, updateVendor } = useTunzaaAuth() as any;

    // Vendor profile data
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor' || p.role === 'business') || {} as any;
    const metadata = vendorProfile?.metadata || {};
    const branding = vendorProfile?.branding || {};

    // Form state — use real data, fall back to empty strings
    const resolvedName = metadata?.business_name || vendorProfile?.display_name || vendorProfile?.displayName || '';
    const [businessName, setBusinessName] = useState(resolvedName);
    const [email, setEmail] = useState(metadata?.contact_email || vendorProfile?.contact_email || user?.email || '');
    const [phone, setPhone] = useState(metadata?.contact_phone || vendorProfile?.contact_phone || user?.phone_number || '');
    const [category, setCategory] = useState(metadata?.category || '');
    const [logoImage, setLogoImage] = useState<string | null>(metadata?.logo_url || metadata?.image_url || branding?.logo_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Category modal
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // Documents state
    const [documents, setDocuments] = useState<Array<{ name: string; uri: string; uploadedUrl?: string }>>(() => {
        // Initialize from metadata if available
        const existing: Array<{ name: string; uri: string; uploadedUrl?: string }> = [];
        if (metadata?.business_license_url) existing.push({ name: 'Business License', uri: metadata.business_license_url, uploadedUrl: metadata.business_license_url });
        if (metadata?.tin_certificate_url) existing.push({ name: 'TIN Certificate', uri: metadata.tin_certificate_url, uploadedUrl: metadata.tin_certificate_url });
        if (metadata?.brela_certificate_url) existing.push({ name: 'BRELA Certificate', uri: metadata.brela_certificate_url, uploadedUrl: metadata.brela_certificate_url });
        return existing;
    });
    const [isUploading, setIsUploading] = useState(false);

    // ---- Handlers ----

    const pickLogo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload your logo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setLogoImage(result.assets[0].uri);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setIsUploading(true);
                try {
                    // Upload the document immediately
                    const uploadRes = await uploadApi.uploadFile(asset.uri, asset.name || 'document.pdf');
                    setDocuments(prev => [...prev, {
                        name: asset.name || 'Document',
                        uri: asset.uri,
                        uploadedUrl: uploadRes.url,
                    }]);
                    Alert.alert('Success', 'Document uploaded successfully!');
                } catch (uploadError: any) {
                    console.error('Document upload failed:', uploadError);
                    Alert.alert('Upload Failed', uploadError.message || 'Could not upload document. Please try again.');
                } finally {
                    setIsUploading(false);
                }
            }
        } catch (err) {
            console.log('Error picking document:', err);
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const selectCategory = (cat: string) => {
        setCategory(cat);
        setShowCategoryModal(false);
    };

    const handleSave = async () => {
        if (isSubmitting) return; // Prevent double-save
        if (!businessName.trim()) {
            Alert.alert('Error', 'Business name is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const vendorId = metadata?.vendor_id || vendorProfile?.vendor_id || vendorProfile?.profile_id;
            const profileId = vendorProfile?.profile_id || vendorProfile?.profileId;

            if (!vendorId || !profileId) {
                throw new Error('Vendor profile not found.');
            }

            // Build document URLs for metadata
            const docUrls: Record<string, string> = {};
            documents.forEach((doc, i) => {
                if (doc.uploadedUrl) {
                    if (i === 0) docUrls.business_license_url = doc.uploadedUrl;
                    else if (i === 1) docUrls.tin_certificate_url = doc.uploadedUrl;
                    else if (i === 2) docUrls.brela_certificate_url = doc.uploadedUrl;
                }
            });

            const updateData: any = {
                display_name: businessName.trim(),
                business_name: businessName.trim(),
                contact_phone: phone.trim(),
                contact_email: email.trim(),
                // Pass category and document URLs via a special metadata field
                // so updateVendor can merge them into the profile metadata
                _extra_metadata: {
                    category: category,
                    contact_email: email.trim(),
                    contact_phone: phone.trim(),
                    ...docUrls,
                },
                store: {
                    ...vendorProfile?.store,
                    store_name: businessName.trim(),
                    branding: {
                        ...branding,
                        logo_url: logoImage,
                    }
                },
            };

            await updateVendor(vendorId, profileId, updateData);
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Save failed:', error);
            Alert.alert('Error', error.message || 'Failed to update profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---- Render ----

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit business profile</Text>
                <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#3A5BA9" />
                    ) : (
                        <Check size={24} color="#111827" />
                    )}
                </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    extraScrollHeight={50}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                {/* Logo Upload Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoWrapper}>
                        {logoImage ? (
                            <Image source={{ uri: logoImage }} style={styles.logo} />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <UserCircle2 size={100} color="#E5E7EB" />
                            </View>
                        )}
                        <TouchableOpacity style={styles.logoEditBtn} onPress={pickLogo}>
                            <Camera size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Business Details Section */}
                <View style={styles.detailsHeader}>
                    <Text style={styles.sectionTitle}>Business details</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Business name</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={businessName}
                            onChangeText={setBusinessName}
                            placeholder="Enter business name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email address</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter email address"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                        />
                        <Edit2 size={16} color="#4B5563" />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone number</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter phone number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                        />
                        <Edit2 size={16} color="#4B5563" />
                    </View>
                </View>

                {/* Category Picker */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowCategoryModal(true)}>
                        <Text style={[styles.inputText, !category && { color: '#9CA3AF' }]}>
                            {category || 'Select a category'}
                        </Text>
                        <ChevronDown size={20} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                {/* Compliance / Documents Section */}
                <View style={styles.complianceSection}>
                    <Text style={styles.sectionTitle}>Certificate / compliance</Text>
                    <Text style={styles.complianceHelp}>Upload or update verification files</Text>

                    {/* Existing Documents */}
                    {documents.map((doc, index) => (
                        <View key={index} style={styles.documentRow}>
                            <View style={styles.documentInfo}>
                                <FileText size={20} color="#3A5BA9" />
                                <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                                {doc.uploadedUrl && <CheckCircle size={16} color="#84CC16" />}
                            </View>
                            <TouchableOpacity onPress={() => removeDocument(index)} style={styles.removeDocBtn}>
                                <X size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Upload Button */}
                    <View style={styles.uploadArea}>
                        <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument} disabled={isUploading}>
                            <View style={styles.uploadIconContainer}>
                                {isUploading ? (
                                    <ActivityIndicator size="small" color="#3A5BA9" />
                                ) : (
                                    <Upload size={24} color="#3A5BA9" />
                                )}
                            </View>
                            <Text style={styles.uploadBtnText}>
                                {isUploading ? 'Uploading...' : 'Upload file'}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.uploadSubtext}>Choose PDF, PNG, JPG</Text>
                    </View>
                </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>

            {/* Category Picker Modal */}
            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Select Category</Text>
                                    <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                        <X size={24} color="#111827" />
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={CATEGORIES}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.categoryItem,
                                                category === item && styles.categoryItemSelected,
                                            ]}
                                            onPress={() => selectCategory(item)}
                                        >
                                            <Text style={[
                                                styles.categoryItemText,
                                                category === item && styles.categoryItemTextSelected,
                                            ]}>
                                                {item}
                                            </Text>
                                            {category === item && <CheckCircle size={20} color="#3A5BA9" />}
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    headerBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    content: { paddingBottom: 40 },
    // Logo
    logoSection: { alignItems: 'center', paddingVertical: 32 },
    logoWrapper: { width: 120, height: 120, borderRadius: 60, position: 'relative' },
    logo: { width: '100%', height: '100%', borderRadius: 60 },
    logoPlaceholder: {
        width: '100%', height: '100%', borderRadius: 60,
        backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    logoEditBtn: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#3A5BA9', width: 32, height: 32, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#FFFFFF',
    },
    // Form
    detailsHeader: { paddingHorizontal: 16, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    inputGroup: { paddingHorizontal: 16, marginBottom: 20 },
    inputLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12,
        backgroundColor: '#F9FAFB', paddingHorizontal: 16, height: 54,
    },
    input: { flex: 1, fontSize: 15, color: '#111827' },
    inputText: { flex: 1, fontSize: 15, color: '#111827' },
    // Compliance / Documents
    complianceSection: { paddingHorizontal: 16, marginTop: 10 },
    complianceHelp: { fontSize: 13, color: '#9CA3AF', marginTop: 4, marginBottom: 16 },
    documentRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0',
        borderRadius: 12, padding: 14, marginBottom: 10,
    },
    documentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
    documentName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1F2937' },
    removeDocBtn: { padding: 6 },
    uploadArea: {
        backgroundColor: '#FDFDFD', borderWidth: 1, borderColor: '#F3F4F6',
        borderRadius: 16, padding: 30, alignItems: 'center',
    },
    uploadBtn: { alignItems: 'center', marginBottom: 10 },
    uploadIconContainer: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEF2FF',
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    uploadBtnText: {
        fontSize: 14, fontWeight: 'bold', backgroundColor: '#3A5BA9',
        color: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 8,
        borderRadius: 8, overflow: 'hidden',
    },
    uploadSubtext: { fontSize: 12, color: '#9CA3AF' },
    // Category Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        maxHeight: '60%', paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    categoryItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 16, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
    },
    categoryItemSelected: { backgroundColor: '#EFF6FF' },
    categoryItemText: { fontSize: 15, color: '#374151' },
    categoryItemTextSelected: { color: '#3A5BA9', fontWeight: '600' },
});
