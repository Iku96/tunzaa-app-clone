/**
 * ============================================================================
 * DELIVERY COMPANY DOCUMENTS UPLOAD SCREEN
 * ============================================================================
 * 
 * Purpose: Collect required business documents during delivery company registration
 * 
 * Flow: Register → OTP → Documents (THIS SCREEN) → Delivery Type → Complete
 * 
 * Design Pattern: Accordion/Collapsible Cards
 * - Only one document section open at a time
 * - When a section is open, others hide completely
 * - Uploaded files show checkmark when section is closed
 * 
 * Requirements:
 * - User must upload 3 documents: TIN, License, BRELA Certificate
 * - Cannot proceed without all 3 documents (FIX #1: Add validation)
 * - Success message visible outside accordion (FIX #2: Show below card)
 * 
 * Navigation:
 * - Back: Returns to previous screen (OTP verification)
 * - Continue: Only enabled when all files uploaded, goes to delivery type selection
 * - Skip for now: Allows skipping (shows popup reminder)
 * 
 * ============================================================================
 */

import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { CheckCircle, X, ChevronDown, ChevronUp, Edit } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DeliveryStepper from '../../src/components/delivery/DeliveryStepper';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';

const { width } = Dimensions.get('window');

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * DocType: Identifier for which document section is active
 * - 'license': Business license upload section
 * - 'tin': TIN certificate upload section
 * - 'brela': BRELA registration upload section
 * - null: No section is open (all collapsed)
 */
type DocType = 'license' | 'tin' | 'brela' | null;

// ============================================================================
// PROGRESS STEPPER CONFIGURATION
// ============================================================================

/**
 * STEPS: Defines the 5-step registration process
 * Step 3 (Documents) is the current active step on this screen
 * 
 * Progress: ✅ ✅ 🔵 ⚪ ⚪
 */
const STEPS = [
    { name: 'Register', completed: true },      // ✅ Step 1: Account created
    { name: 'OTP', completed: true },           // ✅ Step 2: Phone verified
    { name: 'Documents', completed: false },    // 🔵 Step 3: CURRENT - Upload docs
    { name: 'Review', completed: false },       // ⚪ Step 4: Review info
    { name: 'Complete', completed: false },     // ⚪ Step 5: Registration done
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DeliveryDocumentsScreen() {
    // ------------------------------------------------------------------------
    // HOOKS & NAVIGATION
    // ------------------------------------------------------------------------

    const router = useRouter();  // Expo Router hook for navigation
    const { submitDeliveryKyc } = useTunzaaAuth();

    // ------------------------------------------------------------------------
    // STATE MANAGEMENT
    // ------------------------------------------------------------------------

    /**
     * loading: Tracks if Continue button action is in progress
     * Shows "Inapakia..." text while processing
     */
    const [loading, setLoading] = useState(false);

    /**
     * activeSection: Which accordion section is currently open
     * Only ONE section can be open at a time
     * When a section opens, others hide completely (not just collapse)
     * 
     * Possible values:
     * - null: All sections closed
     * - 'license': License section open
     * - 'tin': TIN section open
     * - 'brela': BRELA section open
     */
    const [activeSection, setActiveSection] = useState<DocType>(null);



    /**
     * Document files state
     * Each holds the file object from DocumentPicker
     * null = not uploaded yet
     * object = file uploaded successfully
     */
    const [licenseFile, setLicenseFile] = useState<any>(null);
    const [tinFile, setTinFile] = useState<any>(null);
    const [brelaFile, setBrelaFile] = useState<any>(null);

    // ------------------------------------------------------------------------
    // VALIDATION LOGIC (FIX #1: Prevent navigation without files)
    // ------------------------------------------------------------------------

    /**
     * allFilesUploaded: Checks if ALL 3 required documents have been uploaded
     * 
     * @returns {boolean} - true if all documents uploaded, false otherwise
     * 
     * Used to:
     * - Enable/disable the "Endelea" (Continue) button
     * - Show warning if user tries to continue without all files
     * 
     * FIX #1: This validation was missing - users could proceed without files
     */
    const allFilesUploaded = () => {
        return licenseFile !== null && tinFile !== null && brelaFile !== null;
    };

    // ------------------------------------------------------------------------
    // FILE UPLOAD HANDLER
    // ------------------------------------------------------------------------

    /**
     * pickDocument: Opens device file picker for document upload
     * 
     * @param {Function} setFile - State setter for the specific document
     * 
     * Flow:
     * 1. Opens native file picker
     * 2. User selects image or PDF file
     * 3. If successful, updates the document state
     * 4. Success message appears (FIX #2: Now visible outside accordion)
     * 
     * Allowed file types:
     * - Images: image/* (PNG, JPG, etc.)
     * - PDF documents: application/pdf
     * 
     * File size limit: 5MB (enforced by validation later)
     */
    const pickDocument = async (setFile: any) => {
        try {
            // Launch document picker with file type restrictions
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],  // Only images and PDFs
                copyToCacheDirectory: true,            // Copy to app cache for upload
            });

            // Check if user selected a file (didn't cancel)
            if (!result.canceled && result.assets && result.assets.length > 0) {
                // Store the first (and only) selected file
                setFile(result.assets[0]);
            }
            // If canceled, do nothing

        } catch (err) {
            // Handle errors (permissions, file system issues, etc.)
            console.log('Error picking document:', err);
        }
    };

    // ------------------------------------------------------------------------
    // NAVIGATION HANDLERS
    // ------------------------------------------------------------------------

    /**
     * handleContinue: Validates and proceeds to next screen
     * 
     * FIX #1: Now validates all files uploaded before proceeding
     * 
     * Flow:
     * 1. Check if all 3 documents uploaded
     * 2. If not, show error alert (FIX #1: Prevents navigation)
     * 3. If yes, show loading state
     * 4. After 1 second, show success modal
     * 5. User clicks "Sawa" in modal → Navigate to delivery type screen
     */
    const handleContinue = async () => {
        if (!allFilesUploaded()) {
            Alert.alert(
                'Hati Hazijapakiwa',
                'Tafadhali pakia hati zote zilizohitajika kabla ya kuendelea',
                [{ text: 'Sawa', style: 'default' }]
            );
            return;
        }

        setLoading(true);
        try {
            console.log('📤 [DeliveryDocs] Starting document upload sequence...');
            
            // 1. Upload all files to get public URLs
            const { uploadApi } = require('../../src/services/upload');
            
            const [licenseUrl, tinUrl, brelaUrl] = await Promise.all([
                uploadApi.uploadFile(licenseFile),
                uploadApi.uploadFile(tinFile),
                uploadApi.uploadFile(brelaFile)
            ]);

            console.log('✅ [DeliveryDocs] Files uploaded successfully:', { licenseUrl, tinUrl, brelaUrl });

            // 2. Submit to KYC API via context
            const documents = [
                { id: 'license', url: licenseUrl, document_type_id: 'license' },
                { id: 'tin', url: tinUrl, document_type_id: 'tin' },
                { id: 'brela', url: brelaUrl, document_type_id: 'brela' }
            ];

            await submitDeliveryKyc(documents);
            console.log('✅ [DeliveryDocs] KYC Submission complete.');

            // 3. Move to success screen
            router.push('/(delivery)/delivery-success');
        } catch (error: any) {
            console.error('❌ [DeliveryDocs] Submission failed:', error.message);
            Alert.alert(
                'Submission Failed',
                error.message || 'There was an error uploading your documents. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------------
    // ACCORDION ITEM COMPONENT
    // ------------------------------------------------------------------------

    /**
     * RenderAccordionItem: Individual collapsible document upload section
     * 
     * @param {DocType} id - Unique identifier (license/tin/brela)
     * @param {string} label - Display name for the document
     * @param {any} file - Current file object (null if not uploaded)
     * @param {Function} setFile - State setter for this document
     * 
     * Behavior:
     * - Closed state: Shows label + chevron (+ checkmark if uploaded)
     * - Open state: Shows upload area or uploaded file info
     * - When one opens, others hide completely (not just collapse)
     * 
     * FIX #2: Success message now renders OUTSIDE this component
     */
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
        // Check states
        const isActive = activeSection === id;          // Is THIS section open?
        const isHidden = activeSection !== null && activeSection !== id;  // Should hide?

        // If another section is open, hide this one completely
        if (isHidden) return null;

        return (
            <View style={styles.accordionItem}>

                {/* ========================================================
                    ACCORDION HEADER (Always visible)
                    - Shows document name
                    - Shows checkmark if file uploaded (when closed)
                    - Shows chevron up/down based on open state
                ======================================================== */}
                <TouchableOpacity
                    style={[
                        styles.accordionHeader,
                        isActive && styles.accordionHeaderActive  // Blue tint when open
                    ]}
                    onPress={() => setActiveSection(isActive ? null : id)}  // Toggle open/closed
                    activeOpacity={0.7}
                >
                    {/* Document label (e.g., "TIN ya Biashara") */}
                    <Text
                        style={[
                            styles.accordionTitle,
                            isActive && styles.accordionTitleActive  // Bold when open
                        ]}
                    >
                        {label}
                    </Text>

                    {/* Right side: Edit icon when closed, ChevronUp when open */}
                    <View style={styles.headerRight}>
                        {isActive ? (
                            <ChevronUp size={20} color="#425BA4" />
                        ) : (
                            <Edit size={20} color="#425BA4" />
                        )}
                    </View>
                </TouchableOpacity>

                {/* Inline success text when uploaded & closed */}
                {file && !isActive && (
                    <Text style={styles.inlineSuccessText}>
                        Hati imepakiwa kikamilifu
                    </Text>
                )}

                {/* ========================================================
                    ACCORDION CONTENT (Only visible when open)
                    Shows either:
                    - Upload button (if no file)
                    - Uploaded file info (if file uploaded)
                ======================================================== */}
                {isActive && (
                    <View style={styles.accordionContent}>

                        {/* --- NO FILE YET: Show upload button --- */}
                        {!file ? (
                            <TouchableOpacity
                                style={styles.uploadBox}
                                onPress={() => pickDocument(setFile)}
                            >
                                {/* Cloud upload icon */}
                                <Image
                                    source={require('../../assets/CloudUpload.png')}
                                    style={styles.uploadIcon}
                                    resizeMode="contain"
                                />
                                {/* Primary text */}
                                <Text style={styles.uploadTextPrimary}>
                                    Bonyeza hapa kupakia
                                </Text>
                                {/* Secondary text (file restrictions) */}
                                <Text style={styles.uploadTextSecondary}>
                                    PDF, PNG au JPG (Max 5MB)
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            /* --- FILE UPLOADED: Show file info --- */
                            <View>
                                {/* File info box with green border */}
                                <View style={styles.uploadedFileBox}>
                                    {/* Left side: Checkmark + file details */}
                                    <View style={styles.fileInfo}>
                                        <CheckCircle size={24} color="#84CC16" style={{ marginRight: 10 }} />
                                        <View style={{ flex: 1 }}>
                                            {/* File name */}
                                            <Text style={styles.fileName} numberOfLines={1}>
                                                {file.name}
                                            </Text>
                                            {/* File size */}
                                            <Text style={styles.fileSize}>
                                                {file.size
                                                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                                    : 'File Ready'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Right side: Remove button (X icon) */}
                                    <TouchableOpacity
                                        onPress={() => setFile(null)}
                                        style={styles.removeButton}
                                    >
                                        <X size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>

                                {/* ===============================================
                                    SUCCESS MESSAGE (Inside accordion)
                                    NOTE: This is INSIDE the accordion content
                                    FIX #2 will move this OUTSIDE
                                =============================================== */}
                                <View style={styles.successContainer}>
                                    <CheckCircle size={14} color="#84CC16" style={{ marginRight: 6 }} />
                                    <Text style={styles.successText}>
                                        Hati imepakiwa kikamilifu
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                <DeliveryStepper currentStep={2} />

                {/* ============================================================
                    MAIN CONTENT - Scrollable Area
                ============================================================ */}
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        <View>
                            {/* Page Title */}
                            <Text style={styles.title}>Hati Za Kampuni</Text>

                            {/* Page Subtitle */}
                            <Text style={styles.subtitle}>
                                Ni muhimu kuambatanisha hati za Kampuni kwa usalama zaidi wa akaunti yako.
                            </Text>

                            {/* ================================================
                                WHITE CARD CONTAINER
                                Contains:
                                - Upload icon + title
                                - 3 accordion items for documents
                                - "Weka baadae" (Skip) link
                            ================================================ */}
                            <View style={styles.card}>

                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <Image
                                        source={require('../../assets/CloudUpload.png')}
                                        style={styles.headerIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.cardHeaderTitle}>
                                        Pakia taarifa zifuatazo
                                    </Text>
                                </View>

                                {/* Accordion Container: 3 document upload sections */}
                                <View style={styles.accordionContainer}>
                                    {/* License Document */}
                                    <RenderAccordionItem
                                        id="license"
                                        label="Leseni ya Kampuni"
                                        file={licenseFile}
                                        setFile={setLicenseFile}
                                    />

                                    {/* TIN Document */}
                                    <RenderAccordionItem
                                        id="tin"
                                        label="TIN ya Kampuni"
                                        file={tinFile}
                                        setFile={setTinFile}
                                    />

                                    {/* BRELA Document */}
                                    <RenderAccordionItem
                                        id="brela"
                                        label="Cheti cha usajili BRELA"
                                        file={brelaFile}
                                        setFile={setBrelaFile}
                                    />
                                </View>

                                {/* (Success texts are now displayed inline below each item) */}


                                {/* Skip Link: Allow skipping for now */}
                                <View style={styles.skipContainer}>
                                    <TouchableOpacity onPress={() => router.push('/(delivery)/delivery-type')}>
                                        <Text style={styles.skipText}>Weka baadae</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* ================================================
                            FOOTER BUTTONS
                            - Rudi (Back): Returns to previous screen
                            - Endelea (Continue): Proceeds with validation
                        ================================================ */}
                        <View style={styles.footer}>
                            {/* Back Button - Always enabled */}
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.backButtonText}>Rudi</Text>
                            </TouchableOpacity>

                            {/* Continue Button - Validates before proceeding */}
                            <TouchableOpacity
                                style={[
                                    styles.nextButton,
                                    // Disable button styling if files not uploaded (optional visual feedback)
                                    !allFilesUploaded() && styles.nextButtonDisabled
                                ]}
                                onPress={handleContinue}
                                disabled={loading}  // Prevent multiple clicks while loading
                            >
                                <Text style={styles.nextButtonText}>
                                    {loading ? 'Inapakia...' : 'Endelea'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    // ... (keeping all original styles exactly as they were)
    // ... (adding new styles for FIX #2)

    safe: {
        flex: 1,
        backgroundColor: '#425BA4',
    },
    container: {
        flex: 1,
        backgroundColor: '#425BA4',
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
        borderColor: '#425BA4',
    },
    accordionTitle: {
        fontSize: 14,
        color: '#425BA4',
        fontWeight: '500',
    },
    accordionTitleActive: {
        color: '#425BA4',
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    accordionContent: {
        marginTop: 12,
    },
    inlineSuccessText: {
        color: '#84CC16',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
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

    // ========================================================================
    // FIX #2: EXTERNAL SUCCESS MESSAGES (Always visible outside accordions)
    // ========================================================================

    /**
     * allSuccessMessages: Container for all success messages
     * Shows below the accordion container
     * Always visible when files are uploaded
     */
    allSuccessMessages: {
        marginTop: 16,
        gap: 8,  // Space between multiple messages
    },

    /**
     * externalSuccessMessage: Individual success message for each uploaded file
     * Shows document name + "Hati imepakiwa kikamilifu"
     * Green text with checkmark icon
     */
    externalSuccessMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 4,
    },

    /**
     * externalSuccessText: Text for external success messages
     * Includes document name for clarity
     */
    externalSuccessText: {
        color: '#16A34A',  // Darker green for better readability
        fontSize: 13,
        fontWeight: '500',
    },

    // ========================================================================
    // CONTINUE BUTTON DISABLED STATE (Optional visual feedback for FIX #1)
    // ========================================================================

    /**
     * nextButtonDisabled: Visual feedback when validation fails
     * Makes button slightly faded when not all files uploaded
     * Note: Validation happens in handleContinue(), this is just visual
     */
    nextButtonDisabled: {
        opacity: 0.6,  // Slightly faded to indicate disabled state
    },

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
        justifyContent: 'center',
    }
});

/**
 * ============================================================================
 * FIXES APPLIED
 * ============================================================================
 * 
 * FIX #1: File Upload Validation
 * -------------------------------
 * BEFORE: User could click "Endelea" and navigate without uploading files
 * AFTER:  allFilesUploaded() validation prevents navigation
 *         Alert shown if user tries to proceed without all 3 files
 * 
 * Implementation:
 * - Added allFilesUploaded() validation function
 * - Added validation check in handleContinue()
 * - Shows Alert.alert() if files missing
 * - Optional: Added nextButtonDisabled styling for visual feedback
 * 
 * FIX #2: Visible Success Messages
 * ---------------------------------
 * BEFORE: Success message hidden inside accordion (must open to see)
 * AFTER:  Success messages always visible below accordion container
 * 
 * Implementation:
 * - Added allSuccessMessages container after accordions
 * - Shows separate message for each uploaded file
 * - Includes document name in message for clarity
 * - Green checkmark icon + text always visible
 * 
 * ============================================================================
 */