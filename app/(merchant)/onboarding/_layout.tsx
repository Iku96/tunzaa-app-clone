import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingLayout() {
    const router = useRouter();
    const segments = useSegments();

    // Determine current step based on route
    const currentRoute = segments[segments.length - 1];
    let currentStep = 1;
    if (currentRoute === 'step-2') currentStep = 2;
    if (currentRoute === 'step-3') currentStep = 3;
    if (currentRoute === 'step-4') currentStep = 4;
    if (currentRoute === 'step-5') currentStep = 5;

    const totalSteps = 5;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mauzo by Tunzaa</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Stepper */}
            <View style={styles.stepperContainer}>
                <View style={styles.stepIcons}>
                    {Array.from({ length: totalSteps }).map((_, index) => {
                        const step = index + 1;
                        const isCompleted = step < currentStep;
                        const isCurrent = step === currentStep;

                        return (
                            <View key={step} style={styles.stepWrapper}>
                                <View style={[
                                    styles.stepCircle,
                                    (isCompleted || isCurrent) ? styles.activeCircle : styles.inactiveCircle
                                ]}>
                                    {isCompleted ? (
                                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                    ) : (
                                        <Text style={[
                                            styles.stepText,
                                            isCurrent ? styles.activeStepText : styles.inactiveStepText
                                        ]}>{step}</Text>
                                    )}
                                </View>
                                {/* Connector Line */}
                                {step < totalSteps && (
                                    <View style={[
                                        styles.connector,
                                        step < currentStep ? styles.activeConnector : styles.inactiveConnector
                                    ]} />
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Step Content */}
            <View style={styles.content}>
                <Stack screenOptions={{ headerShown: false }} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#425BA4', // Brand Blue Background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    stepperContainer: {
        paddingHorizontal: 40,
        marginBottom: 30,
    },
    stepIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    activeCircle: {
        backgroundColor: '#84CC16', // Lime Green
        borderColor: '#84CC16',
    },
    inactiveCircle: {
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: 'transparent',
    },
    stepText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    activeStepText: {
        color: '#FFFFFF',
    },
    inactiveStepText: {
        color: 'rgba(255,255,255,0.8)',
    },
    connector: {
        width: 30, // Adjust based on screen width if needed
        height: 2,
        marginHorizontal: 4,
    },
    activeConnector: {
        backgroundColor: '#84CC16',
    },
    inactiveConnector: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    content: {
        flex: 1,
        // The screen content will handle its own background/styling
    }
});
