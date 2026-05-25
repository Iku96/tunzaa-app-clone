import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { uploadApi } from '@/src/services/upload';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/src/services/config';

const { width } = Dimensions.get('window');

type DocType = 'license' | 'tin' | 'brela' | null;

export default function LoanStep3Documents() {
    const router = useRouter();
    const { user, refreshProfile, switchRole } = useTunzaaAuth();
    const { t } = useLanguage();
    
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<DocType>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // State for documents
    const [licenseFile, setLicenseFile] = useState<any>(null);
    const [tinFile, setTinFile] = useState<any>(null);
    const [brelaFile, setBrelaFile] = useState<any>(null);

    const pickDocument = async (setFile: any) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setFile(result.assets[0]);
            }
        } catch (err) {
            console.log('Error picking document:', err);
        }
    };

    const handleContinue = async () => {
        if (loading) return;
        setLoading(true);
        try {
            // Retrieve persisted details from previous steps
            const [savedShopName, savedDesc, savedLogo, savedCover, savedLocationStr] = await Promise.all([
                AsyncStorage.getItem('TEMP_ONBOARDING_SHOP_NAME'),
                AsyncStorage.getItem('TEMP_ONBOARDING_DESCRIPTION'),
                AsyncStorage.getItem('TEMP_ONBOARDING_LOGO'),
                AsyncStorage.getItem('TEMP_ONBOARDING_COVER'),
                AsyncStorage.getItem('TEMP_ONBOARDING_LOCATION'),
            ]);
            
            const location = savedLocationStr ? JSON.parse(savedLocationStr) : null;
            const vendorUserId = user?.user_id || user?.id || '';
            const finalShopName = savedShopName || `${user?.first_name || 'Loan'} Provider`;

            let logoUrl = savedLogo || '';
            let coverUrl = savedCover || '';
            let licenseUrl = '';
            let tinUrl = '';
            let brelaUrl = '';

            console.log('📤 Uploading images and documents...');

            // 1. Upload Logo
            if (savedLogo && savedLogo.startsWith('file://')) {
                try {
                    const res = await uploadApi.uploadFile(savedLogo, `logo_${vendorUserId}.jpg`, 'image/jpeg');
                    logoUrl = res.url;
                } catch (e) {}
            }

            // 2. Upload Cover
            if (savedCover && savedCover.startsWith('file://')) {
                try {
                    const res = await uploadApi.uploadFile(savedCover, `cover_${vendorUserId}.jpg`, 'image/jpeg');
                    coverUrl = res.url;
                } catch (e) {}
            }

            // 3. Upload Documents
            if (licenseFile) {
                try {
                    const ext = licenseFile.name ? licenseFile.name.split('.').pop() : 'pdf';
                    const res = await uploadApi.uploadFile(licenseFile.uri, `license_${vendorUserId}.${ext}`, licenseFile.mimeType);
                    licenseUrl = res.url;
                } catch (e) {}
            }
            if (tinFile) {
                try {
                    const ext = tinFile.name ? tinFile.name.split('.').pop() : 'pdf';
                    const res = await uploadApi.uploadFile(tinFile.uri, `tin_${vendorUserId}.${ext}`, tinFile.mimeType);
                    tinUrl = res.url;
                } catch (e) {}
            }
            if (brelaFile) {
                try {
                    const ext = brelaFile.name ? brelaFile.name.split('.').pop() : 'pdf';
                    const res = await uploadApi.uploadFile(brelaFile.uri, `brela_${vendorUserId}.${ext}`, brelaFile.mimeType);
                    brelaUrl = res.url;
                } catch (e) {}
            }

            // 4. API Submission
            const payload = {
                tenant_id: API_CONFIG.TENANT_ID,
                user_id: vendorUserId,
                business_name: finalShopName.trim(),
                contact_email: user?.email || `${user?.phone_number || 'company'}@tunzaa.co.tz`,
                contact_phone: user?.phone_number || '255',
                metadata: {
                    onboarding_status: 'completed',
                    description: savedDesc || '',
                    logo_url: logoUrl,
                    cover_url: coverUrl,
                    region: location?.region || '',
                    municipal: location?.municipal || '',
                    ward: location?.ward || '',
                    extraInfo: location?.extraInfo || '',
                    coordinates: location?.coords || null,
                    documents: {
                        license: licenseUrl,
                        tin: tinUrl,
                        brela: brelaUrl
                    }
                }
            };

            const token = await AsyncStorage.getItem('userToken');
            
            const response = await fetch(`${API_CONFIG.BASE_URL}/loans/providers/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Provider creation failed:', errorData);
                throw new Error(errorData.detail?.[0]?.msg || 'Failed to register loan provider');
            }

            const providerData = await response.json();
            const providerId = providerData.provider_id || providerData.id;

            console.log('✅ Loan Provider profile created successfully! Provider ID:', providerId);

            // Reconcile and write the uploaded documents and metadata directly to the User Profile table
            const loanProfile = user?.profiles?.find(
                (p: any) => p.role?.toLowerCase() === 'loan' || p.role?.toLowerCase() === 'loan_provider'
            );
            const profileId = loanProfile?.profile_id || loanProfile?.id;

            if (profileId) {
                const { authApi } = require('@/src/services/auth');
                const verificationDocs = [];
                if (licenseUrl) verificationDocs.push({ document_type_id: 'license', document_url: licenseUrl, verification_status: 'pending', submitted_at: new Date().toISOString() });
                if (tinUrl) verificationDocs.push({ document_type_id: 'tin', document_url: tinUrl, verification_status: 'pending', submitted_at: new Date().toISOString() });
                if (brelaUrl) verificationDocs.push({ document_type_id: 'brela', document_url: brelaUrl, verification_status: 'pending', submitted_at: new Date().toISOString() });

                await authApi.updateUserProfile(vendorUserId, profileId, {
                    display_name: finalShopName.trim(),
                    metadata: {
                        ...payload.metadata,
                        provider_id: providerId,
                        verification_documents: verificationDocs
                    }
                }).catch((e: any) => console.log('⚠️ [Onboarding] Failed to update profile metadata:', e.message));
            }

             // Clear temporary storage
            await Promise.all([
                AsyncStorage.removeItem('TEMP_ONBOARDING_SHOP_NAME'),
                AsyncStorage.removeItem('TEMP_ONBOARDING_DESCRIPTION'),
                AsyncStorage.removeItem('TEMP_ONBOARDING_LOGO'),
                AsyncStorage.removeItem('TEMP_ONBOARDING_COVER'),
                AsyncStorage.removeItem('TEMP_ONBOARDING_LOCATION'),
                AsyncStorage.removeItem('HAS_PENDING_LOAN_ONBOARDING'),
                AsyncStorage.setItem('HAS_COMPLETED_LOAN_ONBOARDING', 'true'),
                AsyncStorage.setItem('LAST_PORTAL', 'loan'),
            ]);

            // Refresh profile to sync the new role
            await refreshProfile().catch(() => null);
            if (typeof switchRole === 'function') {
                await switchRole('loan').catch(() => null);
            }
            setShowSuccessModal(true);
        } catch (error: any) {
            console.error('❌ [LoanStep3] Error:', error);
            Alert.alert('Error', error.message || 'Ilishindwa kuhifadhi taarifa. Tafadhali jaribu tena.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinishOnboarding = () => {
        setShowSuccessModal(false);
        router.replace('/(loan)' as any);
    };

    const RenderAccordionItem = ({ id, label, file, setFile }: { id: DocType, label: string, file: any, setFile: any }) => {
        const isActive = activeSection === id;
        const isHidden = activeSection !== null && activeSection !== id;

        if (isHidden) return null;

        return (
            <View style={styles.accordionItem}>
                <TouchableOpacity
                    style={[styles.accordionHeader, isActive && styles.accordionHeaderActive]}
                    onPress={() => setActiveSection(isActive ? null : id)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.accordionTitle, isActive && styles.accordionTitleActive]}>
                        {label}
                    </Text>
                    <View style={styles.headerRight}>
                        {file && !isActive && <CheckCircle size={18} color="#84CC16" style={{ marginRight: 8 }} />}
                        {isActive ? <ChevronUp size={20} color="#425BA4" /> : <ChevronDown size={20} color="#425BA4" />}
                    </View>
                </TouchableOpacity>

                {isActive && (
                    <View style={styles.accordionContent}>
                        {!file ? (
                            <TouchableOpacity style={styles.uploadBox} onPress={() => pickDocument(setFile)}>
                                <Image source={require('@/assets/CloudUpload.png')} style={styles.uploadIcon} resizeMode="contain" />
                                <Text style={styles.uploadTextPrimary}>Pakia Hati (PDF au Picha)</Text>
                                <Text style={styles.uploadTextSecondary}>Gusa hapa kuchagua faili</Text>
                            </TouchableOpacity>
                        ) : (
                            <View>
                                <View style={styles.uploadedFileBox}>
                                    <View style={styles.fileInfo}>
                                        <CheckCircle size={24} color="#84CC16" style={{ marginRight: 10 }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                            <Text style={styles.fileSize}>
                                                {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Tayari'}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => setFile(null)} style={styles.removeButton}>
                                        <X size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.successContainer}>
                                    <CheckCircle size={14} color="#84CC16" style={{ marginRight: 6 }} />
                                    <Text style={styles.successText}>Hati imechaguliwa kikamilifu</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.contentWrapper}>
                    <View>
                        <Text style={styles.title}>Hati Za Kampuni</Text>
                        <Text style={styles.subtitle}>
                            Ni muhimu kuambatanisha hati za biashara kwa usalama zaidi wa akaunti yako na kuwawezesha wateja kukuamini.
                        </Text>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Image source={require('@/assets/CloudUpload.png')} style={styles.headerIcon} resizeMode="contain" />
                                <Text style={styles.cardHeaderTitle}>Weka Hati hapa (Si lazima sasa)</Text>
                            </View>

                            <View style={styles.accordionContainer}>
                                <RenderAccordionItem id="license" label="Kitambulisho cha Taifa / NIDA" file={licenseFile} setFile={setLicenseFile} />
                                <RenderAccordionItem id="tin" label="Cheti cha TIN" file={tinFile} setFile={setTinFile} />
                                <RenderAccordionItem id="brela" label="Hati ya BRELA / Usajili" file={brelaFile} setFile={setBrelaFile} />
                            </View>

                            <View style={styles.skipContainer}>
                                <TouchableOpacity onPress={handleContinue} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                                    <Text style={styles.skipText}>
                                        {loading ? 'Tafadhali subiri...' : 'Ruka kwa sasa'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Text style={styles.backButtonText}>Rudi</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.nextButton} onPress={handleContinue} disabled={loading}>
                            <Text style={styles.nextButtonText}>
                                {loading ? 'Inatuma...' : 'Kamilisha'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Modal visible={showSuccessModal} transparent={true} animationType="fade" onRequestClose={() => setShowSuccessModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Hongera!</Text>
                        <Text style={styles.modalDescription}>
                            Umefanikiwa kukamilisha usajili wa kampuni yako ya kutoa mikopo kwenye mfumo wa Tunzaa. Sasa unaweza kuanza kutengeneza huduma zako!
                        </Text>
                        <TouchableOpacity onPress={handleFinishOnboarding} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Nenda Kwenye Dashibodi</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#425BA4' },
    contentContainer: { flexGrow: 1 },
    contentWrapper: { flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'left', fontFamily: 'Gilroy-Bold' },
    subtitle: { fontSize: 14, color: '#E0E7FF', textAlign: 'left', marginTop: 8, marginBottom: 30, paddingRight: 20, lineHeight: 22, fontFamily: 'Gilroy-Regular' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 40, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    headerIcon: { width: 24, height: 24, marginRight: 10 },
    cardHeaderTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    accordionContainer: { gap: 12 },
    accordionItem: { overflow: 'hidden' },
    accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14 },
    accordionHeaderActive: { backgroundColor: '#EFF6FF', borderColor: '#425BA4' },
    accordionTitle: { fontSize: 14, color: '#425BA4', fontWeight: '500' },
    accordionTitleActive: { color: '#425BA4', fontWeight: '600' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    accordionContent: { marginTop: 12 },
    uploadBox: { backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5, borderColor: '#D1D5DB', borderStyle: 'dashed', height: 130, alignItems: 'center', justifyContent: 'center', padding: 16 },
    uploadIcon: { width: 32, height: 32, marginBottom: 10 },
    uploadTextPrimary: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
    uploadTextSecondary: { fontSize: 12, color: '#9CA3AF' },
    uploadedFileBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#84CC16' },
    fileInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
    fileName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
    fileSize: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    removeButton: { padding: 8 },
    successContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingLeft: 4 },
    successText: { color: '#84CC16', fontSize: 12, fontWeight: '500' },
    skipContainer: { marginTop: 20, alignItems: 'flex-end' },
    skipText: { color: '#EF4444', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60 },
    backButton: { width: 154, height: 53, borderRadius: 8, borderWidth: 1, borderColor: '#7EC155', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
    backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    nextButton: { width: 154, height: 53, borderRadius: 8, backgroundColor: '#84CC16', alignItems: 'center', justifyContent: 'center' },
    nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFFFFF', width: width * 0.85, borderRadius: 16, paddingVertical: 24, paddingHorizontal: 24, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#425BA4', marginBottom: 12 },
    modalDescription: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    modalButton: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, width: '100%', alignItems: 'center' },
    modalButtonText: { fontSize: 16, color: '#425BA4', fontWeight: '600' }
});
