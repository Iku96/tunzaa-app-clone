import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useCreateDeliveryPartner } from '@/src/services/auth';
import { uploadApi } from '@/src/services/upload';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

type DocType = 'license' | 'tin' | 'brela' | null;

export default function Step4Documents() {
    const router = useRouter();
    const { isAuthenticated, isLoading, submitVendorKyc, refreshProfile, user } = useTunzaaAuth();
    const createDeliveryPartner = useCreateDeliveryPartner();
    const { t } = useLanguage();
    
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<DocType>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [partnerType, setPartnerType] = useState('individual');

    React.useEffect(() => {
        AsyncStorage.getItem('TEMP_ONBOARDING_PARTNER_TYPE').then(val => {
            if (val) setPartnerType(val);
        });
    }, []);

    // State for documents
    const [licenseFile, setLicenseFile] = useState<any>(null);
    const [tinFile, setTinFile] = useState<any>(null);
    const [brelaFile, setBrelaFile] = useState<any>(null);

    // Function to handle file picking
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
        // Do not redirect while auth is still hydrating
        if (isLoading) {
            console.log('⏳ [Step4] Auth is still loading, please wait...');
            Alert.alert('Please wait', 'We are still restoring your session. Try again in a moment.');
            return;
        }

        if (!isAuthenticated) {
            console.log('⏳ [Step4] No authenticated user yet, checking for pending onboarding...');

            try {

                const [
                    lastPortal,
                    savedPhone,
                    savedShopName,
                    savedLocation,
                ] = await Promise.all([
                    AsyncStorage.getItem('LAST_PORTAL'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_PHONE'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_SHOP_NAME'),
                    AsyncStorage.getItem('TEMP_ONBOARDING_LOCATION'),
                ]);

                const hasPendingOnboarding =
                    lastPortal === 'merchant' ||
                    !!savedPhone ||
                    !!savedShopName ||
                    !!savedLocation;

                if (hasPendingOnboarding) {
                    console.log('⏳ [Step4] Pending onboarding detected. Waiting briefly for auth bootstrap...');
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            } catch (e) {
                console.error('⚠️ [Step4] Failed to inspect pending onboarding state:', e);
            }

            // Re-check after grace period
            if (!isAuthenticated) {
                console.log('📝 [Step4] User still not authenticated, redirecting to register...');
                router.replace({
                    pathname: '/register',
                    params: { role: 'merchant', pendingOnboarding: 'true' }
                });
                return;
            }
        }

        setLoading(true);
        try {
            // Retrieve persisted shop details
            const [savedShopName, savedPhone, savedDesc, savedLogo, savedCover, savedLocationStr, savedPartnerType, savedVehicleType, savedPlateNumber] = await Promise.all([
                AsyncStorage.getItem('TEMP_ONBOARDING_SHOP_NAME'),
                AsyncStorage.getItem('TEMP_ONBOARDING_PHONE'),
                AsyncStorage.getItem('TEMP_ONBOARDING_DESCRIPTION'),
                AsyncStorage.getItem('TEMP_ONBOARDING_LOGO'),
                AsyncStorage.getItem('TEMP_ONBOARDING_COVER'),
                AsyncStorage.getItem('TEMP_ONBOARDING_LOCATION'),
                AsyncStorage.getItem('TEMP_ONBOARDING_PARTNER_TYPE'),
                AsyncStorage.getItem('TEMP_ONBOARDING_VEHICLE_TYPE'),
                AsyncStorage.getItem('TEMP_ONBOARDING_PLATE_NUMBER'),
            ]);
            
            const location = savedLocationStr ? JSON.parse(savedLocationStr) as { region: string; municipal: string; ward: string; extraInfo: string } : null;
            const deliveryUserId = user?.user_id || user?.id || '';
            const finalShopName = savedShopName || `${user?.first_name || 'My'}'s Delivery`;

            console.log(`🚚 [Step4] Finalizing delivery profile for: ${deliveryUserId}`);
            console.log(`📝 [Step4] Name: ${finalShopName}`);

            let logoUrl = savedLogo || '';
            // 1. Upload Logo if it's a local URI
            if (savedLogo && savedLogo.startsWith('file://')) {
                console.log('📤 [Step4] Uploading logo...');
                try {
                    const uploadRes = await uploadApi.uploadFile(savedLogo, `delivery_logo_${deliveryUserId}.jpg`, 'image/jpeg');
                    logoUrl = uploadRes.url;
                } catch (e) {
                    console.error('❌ [Step4] Logo upload failed:', e);
                }
            }

            const deliveryData = {
                type: (savedPartnerType || "individual") as "individual" | "business" | "pickup_point",
                name: finalShopName,
                contact_phone: savedPhone || user?.phone_number || '',
                profile_picture: logoUrl,
                vehicle_info: {
                    vehicle_type_id: savedVehicleType || "motorcycle",
                    details: savedPlateNumber || "Boda",
                },
                location_description: location ? JSON.stringify(location) : (savedDesc || ""),
                commission_percent: 0,
            };

            // 3. Create Delivery Partner
            await createDeliveryPartner.mutateAsync({
                userId: deliveryUserId,
                data: deliveryData,
            });
            console.log('✅ [Step4] Delivery profile created successfully!');
            
            // Explicitly refresh profile to ensure the new delivery state is propagated
            await refreshProfile().catch(e => console.log('⚠️ [Step4] Background profile refresh failed:', e.message));

            // 4. Upload Documents if any were picked
            const documentsToUpload = [
                { id: 'license' as const, file: licenseFile, label: 'Business License' },
                { id: 'tin' as const, file: tinFile, label: 'TIN Certificate' },
                { id: 'brela' as const, file: brelaFile, label: 'BRELA Document' },
            ].filter(d => d.file !== null);

            if (documentsToUpload.length > 0) {
                console.log(`📤 [Step5] Uploading ${documentsToUpload.length} documents...`);
                const uploadedDocs = [];
                const uploadErrors: string[] = [];
                
                for (const doc of documentsToUpload) {
                    try {
                        const fileExt = doc.file.name ? doc.file.name.split('.').pop() : 'pdf';
                        const uploadRes = await uploadApi.uploadFile(doc.file.uri, `${doc.id}_${deliveryUserId}.${fileExt}`, doc.file.mimeType);
                        uploadedDocs.push({
                            document_type_id: doc.id, // Simplified ID ('tin', 'license', 'brela')
                            document_url: uploadRes.url,
                            verification_status: 'pending'
                        });
                    } catch (e: any) {
                        console.error(`❌ [Step5] Failed to upload ${doc.label}:`, e);
                        uploadErrors.push(`${doc.label}: ${e.apiError?.message || e.message || 'Upload failed'}`);
                    }
                }

                if (uploadedDocs.length > 0) {
                    console.log('📄 [Step5] Submitting KYC documents...');
                    await submitVendorKyc(uploadedDocs).catch(e => {
                        console.error('❌ [Step5] KYC Submission failed:', e);
                        uploadErrors.push(`KYC Submit: ${e.apiError?.message || e.message}`);
                    });
                }

                if (uploadErrors.length > 0) {
                    Alert.alert(
                        'Partial Completion',
                        `Your delivery partner profile was created, but some documents failed to upload:\n\n${uploadErrors.join('\n')}\n\nYou can upload these later from your profile.`,
                        [{ text: 'OK' }]
                    );
                }
            }

            // Clear temporary storage
            await Promise.all([
                AsyncStorage.removeItem('TEMP_ONBOARDING_SHOP_NAME'),
                AsyncStorage.removeItem('TEMP_ONBOARDING_PHONE'),
                AsyncStorage.removeItem('TEMP_ONBOARDING_DESCRIPTION'),
                AsyncStorage.removeItem('TEMP_ONBOARDING_LOGO'),
                AsyncStorage.removeItem('TEMP_ONBOARDING_COVER'),
                AsyncStorage.removeItem('TEMP_ONBOARDING_LOCATION'),
                AsyncStorage.removeItem('HAS_PENDING_MERCHANT_ONBOARDING'),
                AsyncStorage.removeItem('HAS_PENDING_DELIVERY_ONBOARDING'),
            ]);

            // Final refresh to ensure everything is in sync
            await refreshProfile().catch(() => null);
            setShowSuccessModal(true);
        } catch (error: any) {
            console.error('❌ [Step4] Failed to finalize delivery profile:', error);
            const errorMsg = error.apiError?.message || error.message || 'Please check your information and try again.';
            Alert.alert('Error', `Failed to create delivery profile: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFinishOnboarding = () => {
        setShowSuccessModal(false);
        router.replace('/(delivery)' as any);
    };

    // ACCORDION ITEM
    const RenderAccordionItem = ({
        id,
        label,
        file,
        setFile
    }: {
        id: DocType,
        label: string,
        file: any,
        setFile: any
    }) => {
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
                        {file && !isActive && (
                            <CheckCircle size={18} color="#84CC16" style={{ marginRight: 8 }} />
                        )}
                        {isActive ? (
                            <ChevronUp size={20} color="#315BA9" />
                        ) : (
                            <ChevronDown size={20} color="#315BA9" />
                        )}
                    </View>
                </TouchableOpacity>

                {isActive && (
                    <View style={styles.accordionContent}>
                        {!file ? (
                            <TouchableOpacity
                                style={styles.uploadBox}
                                onPress={() => pickDocument(setFile)}
                            >
                                <Image
                                    source={require('../../../assets/CloudUpload.png')}
                                    style={styles.uploadIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.uploadTextPrimary}>{t.onboardingStep5UploadPrimary}</Text>
                                <Text style={styles.uploadTextSecondary}>{t.onboardingStep5UploadSecondary}</Text>
                            </TouchableOpacity>
                        ) : (
                            <View>
                                <View style={styles.uploadedFileBox}>
                                    <View style={styles.fileInfo}>
                                        <CheckCircle size={24} color="#84CC16" style={{ marginRight: 10 }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                            <Text style={styles.fileSize}>
                                                {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'File Ready'}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => setFile(null)} style={styles.removeButton}>
                                        <X size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.successContainer}>
                                    <CheckCircle size={14} color="#84CC16" style={{ marginRight: 6 }} />
                                    <Text style={styles.successText}>Hati imepakiwa kikamilifu</Text>
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
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentWrapper}>
                    <View>
                        <Text style={styles.title}>Hati Za Kampuni</Text>
                        <Text style={styles.subtitle}>
                            Ni muhimu kuambatanisha hati za biashara kwa usalama zaidi wa akaunti yako.
                        </Text>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Image
                                    source={require('../../../assets/CloudUpload.png')}
                                    style={styles.headerIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardHeaderTitle}>{t.onboardingStep5CardHeader}</Text>
                            </View>

                            <View style={styles.accordionContainer}>
                                <RenderAccordionItem
                                    id="license"
                                    label={partnerType === 'business' ? "Kitambulisho cha Taifa cha Mkurugenzi" : "Kitambulisho cha Taifa"}
                                    file={licenseFile}
                                    setFile={setLicenseFile}
                                />
                                <RenderAccordionItem
                                    id="tin"
                                    label={partnerType === 'business' ? t.onboardingStep5TIN : "Leseni ya Udereva"}
                                    file={tinFile}
                                    setFile={setTinFile}
                                />
                                {partnerType === 'business' && (
                                    <RenderAccordionItem
                                        id="brela"
                                        label={t.onboardingStep5BRELA}
                                        file={brelaFile}
                                        setFile={setBrelaFile}
                                    />
                                )}
                            </View>

                            <View style={styles.skipContainer}>
                                <TouchableOpacity 
                                    onPress={handleContinue} 
                                    disabled={loading}
                                    style={{ opacity: loading ? 0.7 : 1 }}
                                >
                                    <Text style={styles.skipText}>
                                        {loading ? t.onboardingStep5Wait : t.onboardingStep5SkipLater}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Text style={styles.backButtonText}>{t.onboardingStep1Back}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={handleContinue}
                            disabled={loading}
                        >
                            <Text style={styles.nextButtonText}>
                                {loading ? t.onboardingStep5Uploading : t.onboardingStep1Next}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t.onboardingStep5SuccessModalTitle}</Text>
                        <Text style={styles.modalDescription}>
                            {t.onboardingStep5SuccessModalDescription}
                        </Text>
                        <TouchableOpacity onPress={handleFinishOnboarding} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>{t.onboardingStep5SuccessModalButton}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#315BA9' },
    contentContainer: { flexGrow: 1 },
    contentWrapper: { flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'left', fontFamily: 'Gilroy-Bold' },
    subtitle: { fontSize: 14, color: '#E0E7FF', textAlign: 'left', marginTop: 8, marginBottom: 30, paddingRight: 60, lineHeight: 22, fontFamily: 'System' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 40, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    headerIcon: { width: 24, height: 24, marginRight: 10 },
    cardHeaderTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    accordionContainer: { gap: 12 },
    accordionItem: { overflow: 'hidden' },
    accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14 },
    accordionHeaderActive: { backgroundColor: '#EFF6FF', borderColor: '#315BA9' },
    accordionTitle: { fontSize: 14, color: '#315BA9', fontWeight: '500' },
    accordionTitleActive: { color: '#315BA9', fontWeight: '600' },
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
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#315BA9', marginBottom: 12 },
    modalDescription: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20 },
    modalButtonText: { fontSize: 16, color: '#315BA9', fontWeight: '600' }
});