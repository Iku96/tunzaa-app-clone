import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

const { width, height } = Dimensions.get('window');

type DocType = 'license' | 'tin' | 'brela' | null;

export default function Step5Documents() {
    const router = useRouter();
    const { user, createVendor, refreshProfile } = useTunzaaAuth();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<DocType>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ MODAL STATE

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
        setLoading(true);
        try {
            // Build vendor payload from user data + defaults for uncollected fields
            const vendorData = {
                user: {
                    user_id: user?.user_id || user?.id || '',
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    email: user?.email || '',
                    phone_number: user?.phone_number || '',
                },
                business_name: `${user?.first_name || 'My'}'s Business`,
                display_name: `${user?.first_name || 'My'}'s Store`,
                contact_email: user?.email || '',
                contact_phone: user?.phone_number || '',
                policy: '',
                website: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: 'Tanzania',
                tax_id: '',
                bank_account: {
                    bank_name: '',
                    account_number: '',
                    account_name: '',
                    swift_code: '',
                    branch_code: '',
                },
                verification_documents: [],
                commission_rate: '0',
                store: {
                    store_name: `${user?.first_name || 'My'}'s Store`,
                    store_slug: `${(user?.first_name || 'store').toLowerCase()}-store`,
                    description: '',
                    branding: {
                        logo_url: '',
                        colors: {
                            primary: '#315BA9',
                            secondary: '#84CC16',
                            accent: '#FBBF24',
                            text: '#1F2937',
                            background: '#FFFFFF',
                        },
                    },
                    banners: [],
                },
            };

            console.log('🏪 [Step5] Creating vendor profile...');
            await createVendor(vendorData);
            console.log('✅ [Step5] Vendor profile created!');

            // Refresh user profile to get the new vendor role
            console.log('🔄 [Step5] Refreshing user profile...');
            await refreshProfile();
            console.log('✅ [Step5] Profile refreshed, showing success modal.');

            setShowSuccessModal(true);
        } catch (error: any) {
            console.error('❌ [Step5] Failed to create vendor:', error.message || error);
            Alert.alert(
                'Error',
                `Failed to create vendor profile: ${error.message || 'Please try again.'}`,
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFinishOnboarding = () => {
        setShowSuccessModal(false);
        // ✅ Navigate to the main account view (Replace prevents going back)
        // Resolves to dashboard index correctly
        router.replace('/(merchant)' as any);
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
                {/* HEADER BUTTON */}
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

                {/* UPLOAD CONTENT */}
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
                                <Text style={styles.uploadTextPrimary}>Bonyeza hapa kupakia</Text>
                                <Text style={styles.uploadTextSecondary}>PDF, PNG au JPG (Max 5MB)</Text>
                            </TouchableOpacity>
                        ) : (
                            <View>
                                {/* FILE INFO BOX */}
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

                                {/* SUCCESS MESSAGE */}
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
                        <Text style={styles.title}>Hati Za Biashara</Text>

                        <Text style={styles.subtitle}>
                            Ni muhimu kuambatanisha hati za biashara kwa usalama zaidi wa akaunti yako.
                        </Text>

                        {/* WHITE CARD */}
                        <View style={styles.card}>

                            <View style={styles.cardHeader}>
                                <Image
                                    source={require('../../../assets/CloudUpload.png')}
                                    style={styles.headerIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardHeaderTitle}>Pakia taarifa zifuatazo</Text>
                            </View>

                            <View style={styles.accordionContainer}>
                                <RenderAccordionItem
                                    id="license"
                                    label="Leseni ya Biashara"
                                    file={licenseFile}
                                    setFile={setLicenseFile}
                                />
                                <RenderAccordionItem
                                    id="tin"
                                    label="TIN ya Biashara"
                                    file={tinFile}
                                    setFile={setTinFile}
                                />
                                <RenderAccordionItem
                                    id="brela"
                                    label="Cheti cha usajili BRELA"
                                    file={brelaFile}
                                    setFile={setBrelaFile}
                                />
                            </View>

                            <View style={styles.skipContainer}>
                                <TouchableOpacity onPress={handleContinue}>
                                    <Text style={styles.skipText}>Weka baadae</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Text style={styles.backButtonText}>Rudi</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={handleContinue}
                            disabled={loading}
                        >
                            <Text style={styles.nextButtonText}>
                                {loading ? 'Inapakia...' : 'Endelea'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>

            {/* ✅ SUCCESS POPUP MODAL */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Hongera!</Text>
                        <Text style={styles.modalDescription}>
                            Tumepokea hati zako. Subiri kidogo tunapokagua maelezo katika saa 24 hadi 48 zijazo.
                        </Text>

                        <TouchableOpacity onPress={handleFinishOnboarding} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Sawa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#315BA9',
    },
    contentContainer: {
        flexGrow: 1,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'left',
        fontFamily: 'Gilroy-Bold',
    },
    subtitle: {
        fontSize: 14,
        color: '#E0E7FF',
        textAlign: 'left',
        marginTop: 8,
        marginBottom: 30,
        paddingRight: 60,
        lineHeight: 22,
        fontFamily: 'System',
    },

    // CARD STYLES
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },

    // ACCORDION STYLES
    accordionContainer: {
        gap: 12,
    },
    accordionItem: {
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    accordionHeaderActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#315BA9',
    },
    accordionTitle: {
        fontSize: 14,
        color: '#315BA9',
        fontWeight: '500',
    },
    accordionTitleActive: {
        color: '#315BA9',
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    accordionContent: {
        marginTop: 12,
    },

    // UPLOAD BOX STYLES
    uploadBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        height: 130,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    uploadIcon: {
        width: 32,
        height: 32,
        marginBottom: 10,
    },
    uploadTextPrimary: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    uploadTextSecondary: {
        fontSize: 12,
        color: '#9CA3AF',
    },

    // FILLED STATE
    uploadedFileBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#84CC16',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    fileSize: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    removeButton: {
        padding: 8,
    },

    // SUCCESS MESSAGE
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingLeft: 4,
    },
    successText: {
        color: '#84CC16',
        fontSize: 12,
        fontWeight: '500',
    },

    // SKIP LINK
    skipContainer: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    skipText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // FOOTER
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 60,
    },
    backButton: {
        width: 154,
        height: 53,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#7EC155',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        width: 154,
        height: 53,
        borderRadius: 8,
        backgroundColor: '#84CC16',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // ✅ MODAL STYLES
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed background
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        width: width * 0.85,
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#315BA9', // Blue Title
        marginBottom: 12,
    },
    modalDescription: {
        fontSize: 14,
        color: '#6B7280', // Grey Description
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    modalButtonText: {
        fontSize: 16,
        color: '#315BA9', // Blue Text for "Sawa"
        fontWeight: '600',
    }
});