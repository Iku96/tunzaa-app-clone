import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type DocType = 'license' | 'tin' | 'brela' | null;

// Mock Steps for visual replication
const STEPS = [
    { name: 'Register', completed: true },
    { name: 'OTP', completed: true },
    { name: 'Documents', completed: false }, // Current
    { name: 'Review', completed: false },
    { name: 'Complete', completed: false },
];

export default function DeliveryDocumentsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<DocType>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    const handleContinue = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowSuccessModal(true);
        }, 1000);
    };

    const handleFinishOnboarding = () => {
        setShowSuccessModal(false);
        // Navigate to delivery home
        router.replace('/(delivery)/home' as any);
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
                                    source={require('../../assets/CloudUpload.png')}
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
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                {/* Header Logic */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Mauzo by Tunzaa</Text>

                    <View style={styles.stepperContainer}>
                        {STEPS.map((step, i) => {
                            const activeIndex = 2; // Hardcoded for this screen
                            const isActive = i === activeIndex;
                            const isCompleted = i < activeIndex;

                            return (
                                <View key={i} style={styles.stepWrapper}>
                                    {/* Connector */}
                                    {i > 0 && (
                                        <View style={[
                                            styles.connector,
                                            { backgroundColor: i <= activeIndex ? '#84CC16' : '#6B7280' }
                                        ]} />
                                    )}

                                    <View
                                        style={[
                                            styles.circle,
                                            isCompleted && styles.circleCompleted,
                                            isActive && styles.circleActive,
                                            i > activeIndex && styles.circleInactive
                                        ]}
                                    >
                                        {isCompleted ? (
                                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                        ) : (
                                            <Text style={[
                                                styles.stepText,
                                                isActive ? styles.stepTextActive : styles.stepTextInactive
                                            ]}>
                                                {i + 1}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>

                        <View>
                            <Text style={styles.title}>Hati Za Kampuni</Text>

                            <Text style={styles.subtitle}>
                                Ni muhimu kuambatanisha hati za Kampuni kwa usalama zaidi wa akaunti yako.
                            </Text>

                            {/* WHITE CARD */}
                            <View style={styles.card}>

                                <View style={styles.cardHeader}>
                                    <Image
                                        source={require('../../assets/CloudUpload.png')}
                                        style={styles.headerIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.cardHeaderTitle}>Pakia taarifa zifuatazo</Text>
                                </View>

                                <View style={styles.accordionContainer}>
                                    <RenderAccordionItem
                                        id="tin"
                                        label="TIN ya Biashara"
                                        file={tinFile}
                                        setFile={setTinFile}
                                    />
                                    <RenderAccordionItem
                                        id="license"
                                        label="Pakia Leseni"
                                        file={licenseFile}
                                        setFile={setLicenseFile}
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

                {/* SUCCESS POPUP MODAL */}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#315BA9',
    },
    container: {
        flex: 1,
        backgroundColor: '#315BA9',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Gilroy-Bold',
        marginBottom: 20,
        marginTop: 10,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 10,
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    connector: {
        width: 20,
        height: 2,
        marginHorizontal: 2,
    },
    circle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    circleCompleted: {
        backgroundColor: '#84CC16',
        borderColor: '#84CC16',
    },
    circleActive: {
        backgroundColor: 'transparent',
        borderColor: '#84CC16',
    },
    circleInactive: {
        backgroundColor: 'transparent',
        borderColor: '#FFFFFF',
        opacity: 0.5,
    },
    stepText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepTextActive: {
        color: '#FFFFFF',
    },
    stepTextInactive: {
        color: '#FFFFFF',
    },
    contentContainer: {
        flexGrow: 1,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
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

    // MODAL STYLES
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
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
        color: '#315BA9',
        marginBottom: 12,
    },
    modalDescription: {
        fontSize: 14,
        color: '#6B7280',
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
        color: '#315BA9',
        fontWeight: '600',
    }
});
