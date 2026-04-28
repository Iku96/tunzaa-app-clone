import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';

// ✅ DEFINED: Exactly 5 Steps (including Intro)
const STEPS = [
    { title: 'Intro', path: '/mauzo-intro' },
    { title: 'Shop Details', path: '/(vendor)/onboarding/step-1' },
    { title: 'Location', path: '/(vendor)/onboarding/step-2' },
    { title: 'Review', path: '/(vendor)/onboarding/step-3' },
    { title: 'Documents', path: '/(vendor)/onboarding/step-4' },
];

export default function OnboardingLayout() {
    const router = useRouter();
    const segments = useSegments();
    const { logout } = useTunzaaAuth();

    // Get the current file name (e.g., 'step-3-manual')
    const currentRouteName = segments[segments.length - 1] as string;

    // Helper to find the logic-based index (ignoring sub-routes like manual/map)
    const getActiveStepIndex = () => {
        if (currentRouteName === 'step-1') return 1;
        if (currentRouteName === 'step-2' || currentRouteName === 'step-2-manual' || currentRouteName === 'step-2-map') return 2;
        if (currentRouteName === 'step-3') return 3;
        if (currentRouteName === 'step-4') return 4;
        return 1; // Default to step 1 (Brand Identity) since intro is completed
    };

    const activeStepIndex = getActiveStepIndex();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header / Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={logout} style={styles.backButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>Mauzo by Tunzaa</Text>
            </View>

            {/* Stepper Indicator */}
            <View style={styles.stepperContainer}>
                {STEPS.map((step, index) => (
                    <View key={index} style={styles.stepWrapper}>
                        <View style={[
                            styles.stepCircle,
                            index <= activeStepIndex ? styles.stepCircleActive : styles.stepCircleInactive
                        ]}>
                            {index < activeStepIndex ? (
                                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                            ) : (
                                <Text style={[
                                    styles.stepNumber,
                                    index <= activeStepIndex ? styles.stepNumberActive : styles.stepNumberInactive
                                ]}>
                                    {index + 1}
                                </Text>
                            )}
                        </View>
                        {index < STEPS.length - 1 && (
                            <View style={[
                                styles.stepLine,
                                index < activeStepIndex ? styles.stepLineActive : styles.stepLineInactive
                            ]} />
                        )}
                    </View>
                ))}
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                <Stack screenOptions={{ headerShown: false }} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#315BA9', // Tunzaa Blue
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    mainTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '600',
        fontFamily: 'Gilroy-Bold',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 40,
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        zIndex: 1,
    },
    stepCircleActive: {
        backgroundColor: '#84CC16', // Tunzaa Green
        borderColor: '#84CC16',
    },
    stepCircleInactive: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '700',
    },
    stepNumberActive: {
        color: '#FFFFFF',
    },
    stepNumberInactive: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    stepLine: {
        flex: 1,
        height: 2,
        marginHorizontal: 0,
    },
    stepLineActive: {
        backgroundColor: '#84CC16',
    },
    stepLineInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    content: {
        flex: 1,
    }
});