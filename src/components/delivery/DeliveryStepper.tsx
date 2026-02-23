import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const STEPS = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
];

interface DeliveryStepperProps {
    currentStep: number; // 0-indexed: 0 = step 1, 1 = step 2, etc.
}

export default function DeliveryStepper({ currentStep }: DeliveryStepperProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Mauzo by Tunzaa</Text>

            <View style={styles.stepperContainer}>
                {STEPS.map((step, i) => {
                    const isActive = i === currentStep;
                    const isCompleted = i < currentStep;

                    return (
                        <View key={i} style={styles.stepWrapper}>
                            {i > 0 && (
                                <View
                                    style={[
                                        styles.connector,
                                        { backgroundColor: i <= currentStep ? '#84CC16' : 'rgba(255, 255, 255, 0.4)' }
                                    ]}
                                />
                            )}

                            <View
                                style={[
                                    styles.circle,
                                    isCompleted && styles.circleCompleted,
                                    isActive && styles.circleActive,
                                    i > currentStep && styles.circleInactive
                                ]}
                            >
                                {isCompleted ? (
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                ) : (
                                    <Text
                                        style={[
                                            styles.stepText,
                                            isActive ? styles.stepTextActive : styles.stepTextInactive
                                        ]}
                                    >
                                        {i + 1}
                                    </Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 24,
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
        width: 24,
        height: 2.5,
        marginHorizontal: 4,
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
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    stepText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    stepTextActive: {
        color: '#FFFFFF',
    },
    stepTextInactive: {
        color: 'rgba(255, 255, 255, 0.4)',
    },
});
