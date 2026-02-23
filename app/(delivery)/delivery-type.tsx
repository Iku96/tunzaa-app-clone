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

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
        label: 'Usafirishaji wa haraka',      // Fast delivery
        icon: 'bicycle-outline' as const,     // Bicycle = speed/agility
    },
    {
        id: 'kawaida',
        label: 'Usafirishaji wa kawaida',     // Standard delivery
        icon: 'car-outline' as const,         // Car = normal transport
    },
    {
        id: 'wingi',
        label: 'Usafirishaji wa wingi',       // Bulk delivery
        icon: 'cube-outline' as const,        // Cube = packages/bulk
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
    const [selected, setSelected] = useState<string | null>(null);

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
        if (!selected) return;

        // Navigate to delivery partner home screen
        // replace() clears navigation stack - can't go back to registration
        router.replace('/(delivery)/home' as any);
    };

    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>

                {/* ============================================================
                    HEADER SECTION
                    - App title
                    - 5-step progress indicator
                ============================================================ */}
                <View style={styles.header}>
                    {/* App Title */}
                    <Text style={styles.headerTitle}>Mauzo by Tunzaa</Text>

                    {/* --------------------------------------------------------
                        PROGRESS STEPPER
                        Visual indicator showing user is on step 4 of 5
                        
                        Structure: Circle → Line → Circle → Line → ...
                        
                        Visual states:
                        - Completed (✅): Green fill, white checkmark
                        - Active (🔵): Transparent fill, white border, number
                        - Inactive (⚪): Transparent fill, faded border, number
                    -------------------------------------------------------- */}
                    <View style={styles.stepperContainer}>
                        {STEPS.map((step, i) => {
                            const activeIndex = 3;  // Type selection is step 4 (index 3)

                            // Determine this step's state
                            const isActive = i === activeIndex;      // Is this the current step?
                            const isCompleted = i < activeIndex;    // Has this step been completed?

                            return (
                                <View key={i} style={styles.stepWrapper}>

                                    {/* Connector Line (not shown before first step) */}
                                    {i > 0 && (
                                        <View
                                            style={[
                                                styles.connector,
                                                // Dynamic color based on completion:
                                                // - Green if this step or earlier steps are complete
                                                // - Faded white if future steps
                                                {
                                                    backgroundColor: i <= activeIndex
                                                        ? '#84CC16'                    // Green
                                                        : 'rgba(255,255,255,0.3)'      // Faded white
                                                }
                                            ]}
                                        />
                                    )}

                                    {/* Step Circle with Number or Checkmark */}
                                    <View
                                        style={[
                                            styles.circle,                                    // Base circle
                                            isCompleted && styles.circleCompleted,           // Green for completed
                                            isActive && styles.circleActive,                 // White border for active
                                            i > activeIndex && styles.circleInactive,        // Faded for future
                                        ]}
                                    >
                                        {isCompleted ? (
                                            // Completed steps: Show checkmark ✓
                                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                        ) : (
                                            // Active/Future steps: Show step number (1, 2, 3...)
                                            <Text
                                                style={[
                                                    styles.stepText,
                                                    isActive && styles.stepTextActive,         // White for active
                                                    i > activeIndex && styles.stepTextInactive // Faded for future
                                                ]}
                                            >
                                                {i + 1}  {/* Display 1-indexed step number */}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

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
                            // Check if THIS option is the selected one
                            const isSelected = selected === type.id;

                            return (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.optionCard,
                                        // Note: No visual border change in this design
                                        // Selected state only changes text/icon color
                                        isSelected && styles.optionCardSelected
                                    ]}
                                    onPress={() => setSelected(type.id)}
                                    activeOpacity={0.7}  // Slight opacity change on press
                                >
                                    {/* Icon (bicycle/car/cube) */}
                                    <Ionicons
                                        name={type.icon}
                                        size={24}
                                        // Color: Blue if selected, gray if not
                                        color={isSelected ? '#315BA9' : '#6B7280'}
                                        style={styles.optionIcon}
                                    />

                                    {/* Delivery type label */}
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            // Apply blue + bold styling when selected
                                            isSelected && styles.optionLabelSelected
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
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
                                !selected && styles.nextButtonDisabled
                            ]}
                            onPress={handleContinue}
                            disabled={!selected}  // Prevent clicks when no selection
                        >
                            <Text style={styles.nextButtonText}>Endelea</Text>
                        </TouchableOpacity>
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
        backgroundColor: '#315BA9',  // Tunzaa brand blue
    },

    /**
     * container: Main content wrapper
     * Fills entire safe area with blue background
     */
    container: {
        flex: 1,
        backgroundColor: '#315BA9',
    },

    // ------------------------------------------------------------------------
    // HEADER SECTION
    // ------------------------------------------------------------------------

    /**
     * header: Top section containing title and progress stepper
     * Centered content with appropriate padding
     */
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
    },

    /**
     * headerTitle: "Mauzo by Tunzaa" text
     * White text on blue background
     */
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 24,  // Space before stepper
    },

    // ------------------------------------------------------------------------
    // PROGRESS STEPPER STYLES
    // ------------------------------------------------------------------------

    /**
     * stepperContainer: Horizontal row of step circles
     * Centers all steps with equal spacing
     */
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /**
     * stepWrapper: Container for one step (circle + connector)
     * Allows circle and line to be grouped together
     */
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    /**
     * connector: Horizontal line between step circles
     * Width: 24px, Height: 2px
     * Color set dynamically (green for completed, faded white for future)
     */
    connector: {
        width: 24,
        height: 2,
        marginHorizontal: 4,  // Small gap between line and circles
        // backgroundColor set inline based on step status
    },

    /**
     * circle: Numbered circle representing each step
     * Base style - specific states applied via modifier classes
     */
    circle: {
        width: 32,
        height: 32,
        borderRadius: 16,  // Perfect circle (radius = width/2)
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        // Border and background colors set via modifier classes
    },

    /**
     * circleCompleted: Completed step styling
     * Solid green fill with checkmark icon
     */
    circleCompleted: {
        backgroundColor: '#84CC16',  // Lime green
        borderColor: '#84CC16',
    },

    /**
     * circleActive: Current step styling
     * Transparent fill with white border and number
     */
    circleActive: {
        backgroundColor: 'transparent',
        borderColor: '#FFFFFF',
    },

    /**
     * circleInactive: Future step styling
     * Transparent fill with faded border
     */
    circleInactive: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255,255,255,0.3)',  // 30% opacity white
    },

    /**
     * stepText: Step number text (1, 2, 3, 4, 5)
     * Base text style
     */
    stepText: {
        fontSize: 14,
        fontWeight: '600',
    },

    /**
     * stepTextActive: Active step number color
     * White text for current step
     */
    stepTextActive: {
        color: '#FFFFFF',
    },

    /**
     * stepTextInactive: Future step number color
     * Faded white text for upcoming steps
     */
    stepTextInactive: {
        color: 'rgba(255,255,255,0.5)',  // 50% opacity white
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
     * Note: In this design, selected state doesn't change card appearance
     * Only text and icon colors change (see optionLabelSelected)
     */
    optionCardSelected: {
        // No visual changes to card itself
        // Could add border here if design changes
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
     * Default state: Gray text, medium weight
     */
    optionLabel: {
        flex: 1,           // Takes remaining space
        fontSize: 16,
        color: '#1F2937',  // Dark gray
        fontWeight: '500',
    },

    /**
     * optionLabelSelected: Selected option text styling
     * Blue color and bolder weight to indicate selection
     */
    optionLabelSelected: {
        color: '#315BA9',  // Tunzaa brand blue
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