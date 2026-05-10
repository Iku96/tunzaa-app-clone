import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Image, 
    ActivityIndicator,
    Alert,
    Dimensions,
    Linking,
    Modal,
    TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, 
    Check, 
    Pencil, 
    ChevronDown, 
    UploadCloud,
    Eye,
    Trash2,
    Plus,
    FileText,
    X,
    FileCheck
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { CategorySelector } from '@/components/vendor/CategorySelector';
import { uploadApi } from '@/src/services/upload';
import { getAvatarUrl, getVendorLogoUrl } from '@/src/utils/images';

const { width, height } = Dimensions.get('window');

// AsyncStorage key for business extras (logo_url, etc.)
const BUSINESS_EXTRAS_KEY = '@tunzaa_business_extras';

// Business industry categories — these describe what kind of business you run,
// NOT what products you sell. The /categories/ API is for product catalog only.
const BUSINESS_INDUSTRIES = [
    { category_id: 'bi-retail', name: 'Retail & E-Commerce', slug: 'retail', description: 'Physical or online retail stores', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-food', name: 'Food & Beverage', slug: 'food-beverage', description: 'Restaurants, cafes, catering, food processing', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-tech', name: 'Technology & Software', slug: 'technology', description: 'IT services, software development, tech products', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-health', name: 'Healthcare & Pharmacy', slug: 'healthcare', description: 'Medical services, pharmacies, wellness', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-agriculture', name: 'Agriculture & Farming', slug: 'agriculture', description: 'Crop production, livestock, agribusiness', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-manufacturing', name: 'Manufacturing & Production', slug: 'manufacturing', description: 'Factories, assembly, industrial production', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-construction', name: 'Construction & Real Estate', slug: 'construction', description: 'Building, property development, materials', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-transport', name: 'Transport & Logistics', slug: 'transport', description: 'Freight, delivery, passenger transport', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-education', name: 'Education & Training', slug: 'education', description: 'Schools, tutoring, professional training', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-hospitality', name: 'Hospitality & Tourism', slug: 'hospitality', description: 'Hotels, travel agencies, tour operators', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-fashion', name: 'Fashion & Beauty', slug: 'fashion-beauty', description: 'Clothing, cosmetics, salons, spas', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-finance', name: 'Financial Services', slug: 'finance', description: 'Banking, insurance, microfinance, fintech', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-media', name: 'Media & Entertainment', slug: 'media', description: 'Broadcasting, publishing, events, content creation', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-professional', name: 'Professional Services', slug: 'professional-services', description: 'Consulting, legal, accounting, marketing', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-energy', name: 'Energy & Utilities', slug: 'energy', description: 'Solar, electricity, water, gas', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
    { category_id: 'bi-other', name: 'Other', slug: 'other', description: 'Other business types not listed above', parent_id: null, is_active: true, is_featured: false, image_url: '', metadata: {}, tenant_id: '', created_at: '', updated_at: '' },
];

export default function EditBusinessScreen() {
    const router = useRouter();
    const { user, updateVendor, submitVendorKyc, refreshProfile } = useTunzaaAuth();
    
    // Find active profile (vendor or loan provider based on current portal)
    const activeRole = user?.activeProfileRole || '';
    const isLoanPortal = activeRole.toLowerCase() === 'loan' || activeRole.toLowerCase() === 'loan_provider';
    const vendorProfile = user?.profiles?.find((p: any) => {
        if (isLoanPortal) {
            return ['loan', 'loan_provider'].includes(p.role?.toLowerCase());
        }
        return ['vendor', 'merchant', 'business'].includes(p.role?.toLowerCase());
    });
    const metadata = vendorProfile?.metadata || {};
    
    // Form State
    const getInitialEmail = () => {
        const e = metadata?.contact_email || user?.email || '';
        // Filter out auto-generated UUID emails (common when signing up via phone)
        if (e.match(/@[0-9a-fA-F]{8}-[0-9a-fA-F]{4}/)) return '';
        return e;
    };
    
    const [businessName, setBusinessName] = useState(metadata?.business_name || '');
    const [email, setEmail] = useState(getInitialEmail());
    const [phone, setPhone] = useState(metadata?.contact_phone || user?.phone_number || '');
    const [logo, setLogo] = useState(getVendorLogoUrl({ metadata, vendorDetails: user?.vendorDetails }) || null);
    const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
    const [tin, setTin] = useState(metadata?.tax_id || '');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showDocTypeModal, setShowDocTypeModal] = useState(false);

    // Business industries (static list — these are NOT product categories)
    const businessCategories = BUSINESS_INDUSTRIES;

    // Documents from metadata - normalize if needed
    const verificationDocs = metadata?.verification_documents || [];

    // Load profile data — AsyncStorage first (instant), then API metadata as merge
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userId = user?.user_id || user?.id;
                if (!userId) return;

                // 1. Load from AsyncStorage (instant, always works)
                const storedExtras = await AsyncStorage.getItem(`${BUSINESS_EXTRAS_KEY}_${userId}`);
                const localData = storedExtras ? JSON.parse(storedExtras) : {};

                // 2. Load from API metadata (may be empty if backend hasn't been updated)
                let apiMeta: Record<string, any> = metadata;
                
                // 3. Merge: API takes priority if non-empty, otherwise use local
                const merged = {
                    business_name: apiMeta.business_name || localData.business_name || '',
                    contact_email: apiMeta.contact_email || localData.contact_email || '',
                    contact_phone: apiMeta.contact_phone || localData.contact_phone || '',
                    logo_url: getVendorLogoUrl({ metadata: apiMeta, vendorDetails: user?.vendorDetails }) || localData.logo_url || '',
                };

                if (merged.business_name) setBusinessName(merged.business_name);
                if (merged.contact_email) setEmail(merged.contact_email);
                if (merged.contact_phone) setPhone(merged.contact_phone);
                if (merged.logo_url) setLogo(merged.logo_url);
            } catch (e) {
                console.warn('[EditBusiness] Failed to load profile:', e);
            }
        };
        loadProfile();
    }, [user]);

    useEffect(() => {
        // Restore previously saved business category from metadata
        if (metadata?.categories && Array.isArray(metadata.categories)) {
            // Match saved category names against our static industry list
            const restored = metadata.categories
                .map((saved: any) => {
                    const name = typeof saved === 'string' ? saved : saved.name;
                    return BUSINESS_INDUSTRIES.find(bi => bi.name === name || bi.slug === name);
                })
                .filter(Boolean);
            if (restored.length > 0) setSelectedCategories(restored);
        } else if (metadata?.category) {
            const found = BUSINESS_INDUSTRIES.find(bi => bi.name === metadata.category || bi.slug === metadata.category);
            if (found) setSelectedCategories([found]);
        }
    }, [metadata?.category]);

    const pickLogo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setLogo(uri);

            // Save locally immediately
            const userId = user?.user_id || user?.id;
            if (userId) {
                const storedExtras = await AsyncStorage.getItem(`${BUSINESS_EXTRAS_KEY}_${userId}`);
                const localData = storedExtras ? JSON.parse(storedExtras) : {};
                localData.logo_url = uri;
                await AsyncStorage.setItem(`${BUSINESS_EXTRAS_KEY}_${userId}`, JSON.stringify(localData));
            }
        }
    };

    const handleUploadDocument = async (docType: string) => {
        setShowDocTypeModal(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;

            const file = result.assets[0];
            setIsUploadingDoc(true);

            // 1. Upload to server
            const fileExt = file.name ? file.name.split('.').pop() : 'pdf';
            const uploadRes = await uploadApi.uploadFile(
                file.uri, 
                `${docType}_${Date.now()}.${fileExt}`, 
                file.mimeType || 'application/pdf'
            );

            let docUrl = uploadRes.fileCDNUrl || uploadRes.fileUrl || uploadRes.url;
            if (docUrl && docUrl.includes('?')) {
                docUrl = docUrl.split('?')[0];
            }
            const newDoc = {
                document_type_id: docType,
                document_url: docUrl,
                image_url: docUrl,
                link: docUrl,
                verification_status: 'pending',
                submitted_at: new Date().toISOString()
            };

            const updatedDocs = [...verificationDocs, newDoc];
            await submitVendorKyc(updatedDocs);
            
            Alert.alert('Success', `${docType.toUpperCase()} uploaded successfully`);
            await refreshProfile();
        } catch (error: any) {
            Alert.alert('Upload Failed', error.message || 'Failed to upload document');
        } finally {
            setIsUploadingDoc(false);
        }
    };

    const handleViewDocument = (url: string) => {
        if (!url) {
            Alert.alert('Error', 'Document URL is missing');
            return;
        }
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Cannot open document link');
        });
    };

    const handleDeleteDocument = async (index: number) => {
        const doc = verificationDocs[index];
        const isApproved = doc.verification_status === 'approved' || doc.verification_status === 'verified';
        
        if (isApproved) {
            Alert.alert('Cannot Delete', 'This document has already been approved. Please contact support to change it.');
            return;
        }

        Alert.alert(
            'Delete Document',
            'Are you sure you want to remove this document?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsSubmitting(true);
                            const updatedDocs = [...verificationDocs];
                            updatedDocs.splice(index, 1);
                            await submitVendorKyc(updatedDocs);
                            await refreshProfile();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if (!businessName.trim()) {
            Alert.alert('Error', 'Business name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const targetUserId = user?.user_id || user?.id;
            const vendorId = metadata?.vendor_id || vendorProfile?.profile_id;
            const profileId = vendorProfile?.profile_id;

            let finalLogoUrl = logo;

            // 1. Upload Logo if it's a new local file
            if (logo && logo.startsWith('file://')) {
                try {
                    const uploadRes = await uploadApi.uploadFile(
                        logo, 
                        `logo_${vendorId}_${Date.now()}.jpg`, 
                        'image/jpeg'
                    );
                    // Backend returns fileCDNUrl (permanent) or fileUrl (signed), NOT url
                    let rawUrl = uploadRes.fileCDNUrl || uploadRes.fileUrl || uploadRes.url;
                    if (rawUrl && rawUrl.includes('?')) {
                        rawUrl = rawUrl.split('?')[0];
                    }
                    finalLogoUrl = rawUrl;
                    console.log('📸 [Logo] Uploaded successfully:', finalLogoUrl);

                    // Update local storage immediately with the final remote URL
                    if (targetUserId) {
                        const storedExtras = await AsyncStorage.getItem(`${BUSINESS_EXTRAS_KEY}_${targetUserId}`);
                        const localData = storedExtras ? JSON.parse(storedExtras) : {};
                        localData.logo_url = finalLogoUrl;
                        await AsyncStorage.setItem(`${BUSINESS_EXTRAS_KEY}_${targetUserId}`, JSON.stringify(localData));
                    }
                } catch (e) {
                    console.error('Logo upload failed:', e);
                }
            }


            // Prepare categories for update
            const categoryNames = selectedCategories.map(c => c.name);
            const mainCategory = categoryNames[0] || '';

            const updateData = {
                business_name: businessName,
                display_name: businessName,
                metadata: {
                    ...metadata,
                    business_name: businessName,
                    contact_email: email,
                    contact_phone: phone,
                    tax_id: tin,
                    categories: selectedCategories,
                    category: mainCategory,
                    logo_url: finalLogoUrl,
                    logoUrl: finalLogoUrl,
                    image_url: finalLogoUrl,
                    profile_picture: finalLogoUrl,
                    updated_at: new Date().toISOString()
                }
            };

            await updateVendor(vendorId, profileId, updateData);

            // Sync extras to AsyncStorage one last time
            if (targetUserId) {
                const storedExtras = await AsyncStorage.getItem(`${BUSINESS_EXTRAS_KEY}_${targetUserId}`);
                const localData = storedExtras ? JSON.parse(storedExtras) : {};
                localData.business_name = businessName;
                localData.contact_email = email;
                localData.contact_phone = phone;
                localData.logo_url = finalLogoUrl;
                await AsyncStorage.setItem(`${BUSINESS_EXTRAS_KEY}_${targetUserId}`, JSON.stringify(localData));
            }

            await refreshProfile();
            
            Alert.alert('Success', 'Business profile updated successfully', [
                { 
                    text: 'OK', 
                    onPress: () => {
                        if (isLoanPortal) {
                            router.replace('/(loan)/business-profile');
                        } else {
                            router.back();
                        }
                    } 
                }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCard = (label: string, value: string, icon?: React.ReactNode, onPress?: () => void) => (
        <TouchableOpacity 
            style={styles.card} 
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>{label}</Text>
                <Text style={styles.cardValue} numberOfLines={1}>{value || `Enter ${label.toLowerCase()}`}</Text>
            </View>
            {icon && <View style={styles.cardIcon}>{icon}</View>}
        </TouchableOpacity>
    );

    const renderInputCard = (
        label: string, 
        value: string, 
        onChangeText: (text: string) => void,
        icon?: React.ReactNode, 
        keyboardType: any = 'default'
    ) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>{label}</Text>
                <TextInput
                    style={[styles.cardValue, { padding: 0, margin: 0, height: 24 }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboardType}
                />
            </View>
            {icon && <View style={styles.cardIcon}>{icon}</View>}
        </View>
    );

    const DocTypeSelector = () => (
        <Modal
            visible={showDocTypeModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDocTypeModal(false)}
        >
            <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setShowDocTypeModal(false)}
            >
                <View style={styles.docTypeContent}>
                    <Text style={styles.modalHeaderTitle}>Select Document Type</Text>
                    <TouchableOpacity 
                        style={styles.docTypeOption}
                        onPress={() => handleUploadDocument('license')}
                    >
                        <FileText size={24} color="#3A5BA9" />
                        <Text style={styles.docTypeOptionText}>Business License</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.docTypeOption}
                        onPress={() => handleUploadDocument('tin')}
                    >
                        <FileCheck size={24} color="#3A5BA9" />
                        <Text style={styles.docTypeOptionText}>TIN Certificate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.docTypeOption}
                        onPress={() => handleUploadDocument('brela')}
                    >
                        <Check size={24} color="#3A5BA9" />
                        <Text style={styles.docTypeOptionText}>BRELA Registration</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.cancelBtn}
                        onPress={() => setShowDocTypeModal(false)}
                    >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <DocTypeSelector />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => {
                        if (isLoanPortal) {
                            router.replace('/(loan)/business-profile');
                        } else {
                            router.back();
                        }
                    }} 
                    style={styles.headerBtn}
                >
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit business profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={isSubmitting} style={styles.headerBtn}>
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#111827" />
                    ) : (
                        <Check size={24} color="#111827" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <TouchableOpacity onPress={pickLogo} style={styles.logoWrapper}>
                        <View style={styles.logoContainer}>
                            {logo ? (
                                <Image source={{ uri: logo }} style={styles.logoImage} />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Text style={styles.logoInitials}>
                                        {businessName?.substring(0, 2).toUpperCase() || 'BZ'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.logoBadge}>
                            <Plus size={16} color="#FFFFFF" strokeWidth={3} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Business Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business details</Text>
                    
                    {renderInputCard('Business name', businessName, setBusinessName, <Pencil size={18} color="#9CA3AF" />)}
                    {renderInputCard('Email address', email, setEmail, <Pencil size={18} color="#9CA3AF" />, 'email-address')}
                    {renderInputCard('Phone number', phone, setPhone, <Pencil size={18} color="#9CA3AF" />, 'phone-pad')}
                    {renderCard(
                        'Category', 
                        selectedCategories.length > 0 ? selectedCategories[0].name : 'Select Category', 
                        <ChevronDown size={20} color="#111827" />,
                        () => setShowCategoryModal(!showCategoryModal)
                    )}

                    {showCategoryModal && (
                        <View style={styles.categoryPickerContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Business Category</Text>
                                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            <CategorySelector 
                                    categories={businessCategories}
                                    selectedCategories={selectedCategories}
                                    onCategoryChange={(cats) => {
                                        setSelectedCategories(cats);
                                        if (cats.length > 0) setShowCategoryModal(false);
                                    }}
                                />
                        </View>
                    )}
                </View>

                {/* Certificate / Compliance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Certificate / compliance</Text>
                    <Text style={styles.sectionSubtitle}>upload or updated verification file</Text>
                    
                    <TouchableOpacity 
                        style={styles.uploadArea} 
                        onPress={() => setShowDocTypeModal(true)}
                        disabled={isUploadingDoc}
                    >
                        {isUploadingDoc ? (
                            <ActivityIndicator size="large" color="#425BA4" />
                        ) : (
                            <>
                                <UploadCloud size={32} color="#425BA4" />
                                <View style={styles.uploadBtn}>
                                    <Text style={styles.uploadBtnText}>Upload file</Text>
                                </View>
                                <Text style={styles.uploadFormats}>Choose PDF, PNG, JPG</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Document List */}
                    <View style={styles.docList}>
                        {verificationDocs.length === 0 && !isUploadingDoc && (
                            <Text style={styles.emptyText}>No documents uploaded yet</Text>
                        )}
                        {verificationDocs.map((doc: any, index: number) => {
                            const docUrl = doc.document_url || doc.url || doc.image_url || doc.link;
                            const isApproved = doc.verification_status === 'approved' || doc.verification_status === 'verified';
                            return (
                                <View key={index} style={styles.docItem}>
                                    <View style={styles.docIconContainer}>
                                        <FileText size={20} color={isApproved ? "#10B981" : "#EF4444"} />
                                    </View>
                                    <View style={styles.docInfo}>
                                        <Text style={styles.docName}>{doc.document_type_id?.toUpperCase() || 'Document'}</Text>
                                        <Text style={styles.docMeta}>
                                            {doc.submitted_at ? `Uploaded ${new Date(doc.submitted_at).toLocaleDateString()}` : 'Status: ' + (doc.verification_status || 'Pending')}
                                        </Text>
                                    </View>
                                    <View style={styles.docActions}>
                                        <TouchableOpacity 
                                            style={styles.docActionBtn}
                                            onPress={() => handleViewDocument(docUrl)}
                                        >
                                            <Eye size={20} color="#9CA3AF" />
                                        </TouchableOpacity>
                                        {!isApproved && (
                                            <TouchableOpacity 
                                                style={styles.docActionBtn}
                                                onPress={() => handleDeleteDocument(index)}
                                            >
                                                <Trash2 size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    headerBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    logoSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    logoWrapper: {
        position: 'relative',
    },
    logoContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    logoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoInitials: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3A5BA9',
    },
    logoBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#3A5BA9',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: -12,
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardContent: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    cardIcon: {
        marginLeft: 12,
    },
    categoryPickerContainer: {
        marginBottom: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    uploadArea: {
        height: 160,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginBottom: 20,
    },
    uploadBtn: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    uploadBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    uploadFormats: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    docList: {
        gap: 12,
    },
    docItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
    },
    docIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    docInfo: {
        flex: 1,
    },
    docName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    docMeta: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    docActions: {
        flexDirection: 'row',
        gap: 8,
    },
    docActionBtn: {
        padding: 6,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 12,
        marginVertical: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    docTypeContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
        textAlign: 'center',
    },
    docTypeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    docTypeOptionText: {
        fontSize: 16,
        color: '#111827',
        marginLeft: 15,
        fontWeight: '500',
    },
    cancelBtn: {
        marginTop: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '600',
    }
});
