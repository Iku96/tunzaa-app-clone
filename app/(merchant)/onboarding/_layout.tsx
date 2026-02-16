import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ✅ DEFINED: Exactly 5 Steps
const STEPS = [
    { name: 'mauzo-intro', path: '/mauzo-intro' },              // Step 1
    { name: 'step-2', path: '/(merchant)/onboarding/step-2' },   // Step 2
    { name: 'step-3', path: '/(merchant)/onboarding/step-3' },   // Step 3
    { name: 'step-4', path: '/(merchant)/onboarding/step-4' },   // Step 4
    { name: 'step-5', path: '/(merchant)/onboarding/step-5' },   // Step 5
];

export default function OnboardingLayout() {
    const router = useRouter();
    const segments = useSegments();

    // Get the current file name (e.g., 'step-3-manual')
    const currentRouteName = segments[segments.length - 1] as string;

    // Find index in our defined steps
    let activeIndex = STEPS.findIndex(s => s.name === currentRouteName);

    // ✅ LOGIC FIX: If we are on a sub-page of Step 3, force Index 2 (3rd Bubble)
    if (currentRouteName === 'step-3-manual' || currentRouteName === 'step-3-map') {
        activeIndex = 2; // Index 2 is the 3rd item
    }

    // Default to Step 1 if something goes wrong
    if (activeIndex === -1) activeIndex = 0;

    const handleStepPress = (index: number) => {
        // Only allow navigation to completed steps
        if (index < activeIndex) {
            router.push(STEPS[index].path as any);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mauzo by Tunzaa</Text>

                <View style={styles.stepperContainer}>
                    {STEPS.map((step, i) => {
                        const isActive = i === activeIndex;
                        const isCompleted = i < activeIndex;

                        return (
                            <View key={i} style={styles.stepWrapper}>
                                {/* Connector Line */}
                                {i > 0 && (
                                    <View style={[
                                        styles.connector,
                                        { backgroundColor: i <= activeIndex ? '#84CC16' : '#6B7280' }
                                    ]} />
                                )}

                                <TouchableOpacity
                                    onPress={() => handleStepPress(i)}
                                    disabled={i >= activeIndex}
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
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </View>

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' }
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
    }
});