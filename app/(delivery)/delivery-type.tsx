/**
 * ============================================================================
 * DELIVERY TYPE SELECTION SCREEN
 * ============================================================================
 * 
 * Purpose: Allow delivery partner to choose their service type
 * 
 * Flow: Register → OTP → Documents → Type (THIS SCREEN) → Complete
 * 
 * Options:
 * 1. Usafirishaji wa haraka (Fast/Express delivery) - Bicycle icon
 * 2. Usafirishaji wa kawaida (Standard delivery) - Car icon
 * 3. Usafirishaji wa wingi (Bulk delivery) - Cube/box icon
 * 
 * Business Rules:
 * - User must select ONE delivery type
 * - Cannot proceed without selection
 * - Selection determines delivery partner's service offering
 * 
 * Navigation:
 * - Back: Returns to documents screen
 * - Continue: Proceeds to delivery home/dashboard (registration complete)
 * 
 * ============================================================================
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeliveryStepper from '../../src/components/delivery/DeliveryStepper';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ============================================================================
// PROGRESS STEPPER CONFIGURATION
// ============================================================================

/**
 * STEPS: Defines the 5-step registration process
 * Step 4 (Type) is the current active step on this screen
 * 
 * Progress: ✅ ✅ ✅ 🔵 ⚪
 */
const STEPS = [
    { name: 'Register', completed: true },      // ✅ Step 1: Account created
    { name: 'OTP', completed: true },           // ✅ Step 2: Phone verified
    { name: 'Documents', completed: true },     // ✅ Step 3: Files uploaded
    { name: 'Type', completed: false },         // 🔵 Step 4: CURRENT - Select delivery type
    { name: 'Complete', completed: false },     // ⚪ Step 5: Registration done
];

// ============================================================================
// DELIVERY TYPE OPTIONS CONFIGURATION
// ============================================================================

/**
 * DELIVERY_TYPES: Array of available delivery service types
 * 
 * Each type has:
 * - id: Unique identifier for state tracking
 * - label: Display text in Swahili
 * - icon: Ionicons name for visual representation
 * 
 * These map to different service tiers:
 * - haraka: Fast/same-day delivery (bicycle)
 * - kawaida: Standard delivery (car)
 * - wingi: Bulk/large orders (cube/box)
 */
const DELIVERY_TYPES = [
    {
        id: 'haraka',
        label: 'Usafirishaji wa haraka',
        icon: 'speedometer-outline' as const, // Represents fast delivery
    },
    {
        id: 'kawaida',
        label: 'Usafirishaji wa kawaida',
        icon: 'bus-outline' as const,         // Represents standard truck delivery
    },
    {
        id: 'wingi',
        label: 'Usafirishaji wa wingi',
        icon: 'cube-outline' as const,        // Represents bulk/multiple packages
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DeliveryTypeScreen() {
    // ------------------------------------------------------------------------
    // HOOKS & NAVIGATION
    // ------------------------------------------------------------------------

    /**
     * router: Expo Router navigation object
     * Used for:
     * - Going back to previous screen (router.back())
     * - Navigating to delivery home after selection (router.replace())
     */
    const router = useRouter();

    // ------------------------------------------------------------------------
    // STATE MANAGEMENT
    // ------------------------------------------------------------------------

    /**
     * selected: Tracks which delivery type is currently selected
     * 
     * Possible values:
     * - null: No selection yet (initial state)
     * - 'haraka': Fast delivery selected
     * - 'kawaida': Standard delivery selected
     * - 'wingi': Bulk delivery selected
     * 
     * Used to:
     * - Apply selected styling to chosen option
     * - Enable/disable Continue button
     * - Determine which service type to save
     */
    const [selected, setSelected] = useState<string[]>([]);

    /**
     * showSuccessModal: Controls success popup visibility
     * Shows after user clicks Continue with delivery types selected
     */
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // ------------------------------------------------------------------------
    // NAVIGATION HANDLERS
    // ------------------------------------------------------------------------

    /**
     * handleContinue: Validates selection and proceeds to delivery home
     * 
     * Validation:
     * - Checks if a delivery type is selected
     * - If not, function returns early (does nothing)
     * - If yes, navigates to delivery home screen
     * 
     * Navigation:
     * - Uses router.replace() not router.push()
     * - This prevents user from going "back" to registration
     * - Registration is complete, so back navigation should go to home
     */
    const handleContinue = () => {
        // Guard clause: Exit if no selection
        if (selected.length === 0) return;

        // Show the success modal instead of navigating directly
        setShowSuccessModal(true);
    };

    /**
     * handleSetRoute: Navigates to the delivery home screen
     * Called when user clicks "Weka Ruti" button in success popup
     */
    const handleSetRoute = () => {
        setShowSuccessModal(false);
        router.replace('/(delivery)/home' as any);
    };

    /**
     * toggleSelection: Adds or removes a delivery type from the selected array
     */
    const toggleSelection = (id: string) => {
        setSelected(prev => {
            if (prev.includes(id)) {
                // Remove if already selected
                return prev.filter(item => item !== id);
            } else {
                // Add if not selected
                return [...prev, id];
            }
        });
    };

    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>

                <DeliveryStepper currentStep={3} />

                {/* ============================================================
                    MAIN CONTENT - Scrollable Area
                    Contains title, subtitle, delivery options, and buttons
                ============================================================ */}
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Page Title */}
                    <Text style={styles.title}>
                        Chagua Aina Ya Usafirishaji
                    </Text>

                    {/* Page Subtitle - Instructions */}
                    <Text style={styles.subtitle}>
                        Chagua aina ya usafirishaji ambayo Kampuni yako inatoa.
                    </Text>

                    {/* --------------------------------------------------------
                        DELIVERY TYPE OPTIONS LIST
                        3 selectable cards for different delivery types
                        
                        Interaction:
                        - Tap any card to select it
                        - Only ONE can be selected at a time
                        - Selected card shows blue text (others gray)
                    -------------------------------------------------------- */}
                    <View style={styles.optionsList}>
                        {DELIVERY_TYPES.map((type) => {
                            // Check if THIS option is in the selected array
                            const isSelected = selected.includes(type.id);

                            return (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.optionCard,
                                        // Note: No visual border change in this design
                                        // Selected state only changes text/icon color
                                        isSelected && styles.optionCardSelected
                                    ]}
                                    onPress={() => toggleSelection(type.id)}
                                    activeOpacity={0.7}  // Slight opacity change on press
                                >
                                    {/* Icon (bicycle/car/cube) */}
                                    <Ionicons
                                        name={type.icon}
                                        size={24}
                                        // Color: White if selected, Blue if not
                                        color={isSelected ? '#FFFFFF' : '#425BA4'}
                                        style={styles.optionIcon}
                                    />

                                    {/* Delivery type label */}
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            // Apply white styling when selected
                                            isSelected && styles.optionLabelSelected
                                        ]}
                                    >
                                        {type.label}
                                    </Text>

                                    {/* Selected Checkmark Icon */}
                                    {isSelected && (
                                        <Ionicons
                                            name="checkmark-circle-outline"
                                            size={24}
                                            color="#FFFFFF"
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* --------------------------------------------------------
                        FOOTER BUTTONS
                        - Rudi (Back): Returns to documents screen
                        - Endelea (Continue): Proceeds to delivery home
                        
                        Layout: Equal width buttons side-by-side
                    -------------------------------------------------------- */}
                    <View style={styles.footer}>

                        {/* Back Button - Always enabled */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backButtonText}>Rudi</Text>
                        </TouchableOpacity>

                        {/* Continue Button - Disabled until selection made */}
                        <TouchableOpacity
                            style={[
                                styles.nextButton,
                                // Apply disabled styling if no selection
                                selected.length === 0 && styles.nextButtonDisabled
                            ]}
                            onPress={handleContinue}
                            disabled={selected.length === 0}  // Prevent clicks when no selection
                        >
                            <Text style={styles.nextButtonText}>Endelea</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* ============================================================
                    SUCCESS BOTTOM SHEET MODAL
                    Shows after clicking continue
                ============================================================ */}
                <Modal
                    visible={showSuccessModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowSuccessModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.bottomSheet}>
                            {/* Drag handle pill */}
                            <View style={styles.handleContainer}>
                                <View style={styles.handlePill} />
                            </View>

                            <Text style={styles.modalText}>
                                Tumepokea hati zako. Subiri kidogo tunapokagua maelezo katika saa 24 hadi 48 zijazo.
                            </Text>
                            <Text style={styles.modalText}>
                                Wakati huo huo...
                            </Text>

                            <TouchableOpacity
                                style={styles.modalNextButton}
                                onPress={handleSetRoute}
                            >
                                <Text style={styles.modalNextButtonText}>Weka Ruti</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    // ------------------------------------------------------------------------
    // LAYOUT CONTAINERS
    // ------------------------------------------------------------------------

    /**
     * safe: SafeAreaView wrapper
     * Prevents content from being hidden by device notches/status bars
     * Blue background extends to screen edges
     */
    safe: {
        flex: 1,
        backgroundColor: '#425BA4',  // Tunzaa brand blue
    },

    /**
     * container: Main content wrapper
     * Fills entire safe area with blue background
     */
    container: {
        flex: 1,
        backgroundColor: '#425BA4',
    },

    // ------------------------------------------------------------------------
    // MAIN CONTENT AREA
    // ------------------------------------------------------------------------

    /**
     * scrollContent: ScrollView content container
     * Allows content to grow and fill available space
     * Provides padding around content
     */
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 16,
        paddingBottom: 40,  // Extra space at bottom
    },

    /**
     * title: Page title "Chagua Aina Ya Usafirishaji"
     * Large, bold white text
     */
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
    },

    /**
     * subtitle: Instructional text below title
     * Explains what user should do
     */
    subtitle: {
        fontSize: 15,
        color: '#FFFFFF',
        opacity: 0.9,        // Slightly faded for hierarchy
        lineHeight: 22,      // Better readability
        marginBottom: 32,    // Space before option cards
    },

    // ------------------------------------------------------------------------
    // DELIVERY TYPE OPTIONS
    // ------------------------------------------------------------------------

    /**
     * optionsList: Container for all 3 delivery type cards
     * Vertical stack with gaps between cards
     */
    optionsList: {
        gap: 16,             // 16px space between each card
        marginBottom: 40,    // Space before footer buttons
    },

    /**
     * optionCard: Individual delivery type selection card
     * White card with icon and label
     * 
     * Layout: [Icon] [Text]
     * Interaction: Entire card is tappable
     */
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
        // Note: No visible border in this design
        // Selection indicated by text/icon color only
    },

    /**
     * optionCardSelected: Selected state modifier
     */
    optionCardSelected: {
        backgroundColor: '#84CC16', // Tunzaa Green
    },

    /**
     * optionIcon: Delivery type icon (bicycle/car/cube)
     * Color changes based on selected state (set inline)
     */
    optionIcon: {
        marginRight: 16,  // Space between icon and text
    },

    /**
     * optionLabel: Delivery type text label
     * Default state: Blue text, medium weight
     */
    optionLabel: {
        flex: 1,           // Takes remaining space
        fontSize: 16,
        color: '#425BA4',  // Tunzaa Blue
        fontWeight: '500',
    },

    /**
     * optionLabelSelected: Selected option text styling
     * White color and bolder weight to indicate selection
     */
    optionLabelSelected: {
        color: '#FFFFFF',  // White
        fontWeight: '600', // Slightly bolder
    },

    // ------------------------------------------------------------------------
    // FOOTER BUTTONS
    // ------------------------------------------------------------------------

    /**
     * footer: Container for Back and Continue buttons
     * Equal width buttons side-by-side
     */
    footer: {
        flexDirection: 'row',
        gap: 16,           // Space between buttons
        marginTop: 'auto', // Pushes footer to bottom of ScrollView
        paddingTop: 20,
    },

    /**
     * backButton: "Rudi" (Back) button
     * Transparent with subtle white border
     * Always enabled
     */
    backButton: {
        flex: 1,           // Takes 50% of width
        height: 52,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',  // Faded white border
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /**
     * backButtonText: Text inside back button
     * White to stand out on blue background
     */
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    /**
     * nextButton: "Endelea" (Continue) button
     * Solid green button
     * Disabled until delivery type selected
     */
    nextButton: {
        flex: 1,           // Takes 50% of width
        height: 52,
        borderRadius: 8,
        backgroundColor: '#84CC16',  // Lime green
        alignItems: 'center',
        justifyContent: 'center',
    },

    /**
     * nextButtonDisabled: Disabled state for Continue button
     * Applied when no delivery type selected
     * Faded appearance indicates button is not clickable
     */
    nextButtonDisabled: {
        opacity: 0.5,  // 50% transparency shows disabled state
    },

    /**
     * nextButtonText: Text inside continue button
     * White text on green background
     */
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // ------------------------------------------------------------------------
    // BOTTOM SHEET MODAL STYLES
    // ------------------------------------------------------------------------

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 30,
        paddingBottom: 50,
        paddingTop: 10,
        alignItems: 'center',
    },
    handleContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 16,
    },
    handlePill: {
        width: 48,
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
    },
    modalText: {
        fontSize: 15,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 16,
        fontWeight: '400',
        paddingHorizontal: 10,
    },
    modalNextButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#425BA4', // Darker blue from the screenshot
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    modalNextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

/**
 * ============================================================================
 * USAGE NOTES
 * ============================================================================
 * 
 * Navigation Flow:
 * - Previous: /delivery-documents (company registration docs)
 * - Next: /(delivery)/home (delivery partner dashboard)
 * 
 * State Management:
 * - Only tracks currently selected delivery type
 * - No persistent storage needed (selection saved on continue)
 * - Reset on screen unmount
 * 
 * Validation:
 * - Must select one delivery type to proceed
 * - Continue button disabled until selection made
 * - No other validation required
 * 
 * Design Notes:
 * - Selected state: Only changes text/icon color (no border/background change)
 * - Equal width buttons in footer (flex: 1)
 * - Progress stepper shows 4/5 steps complete
 * 
 * Accessibility:
 * - activeOpacity provides visual feedback on tap
 * - disabled prop prevents interaction when validation fails
 * - High contrast colors for readability
 * 
 * Deployment:
 * - No external dependencies beyond Expo basics
 * - Works on iOS and Android
 * - Responsive to different screen sizes via flex layout
 * 
 * ============================================================================
 */