import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetupConfirmationScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <View style={styles.successContainer}>
                    <View style={styles.circleIcon}>
                        <Ionicons name="checkmark" size={60} color="#FFFFFF" />
                    </View>
                    
                    <Text style={styles.title}>🎉Congratulations!</Text>
                    
                    <Text style={styles.subtitle}>
                        Your repayment plan for Loan ID #{id || 'LN-84391'} has been set up successfully. 
                        Funds will be deposited into your business wallet within the next 24 hours.
                    </Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Disbursement Amount</Text>
                            <Text style={styles.infoValue}>Tsh 500,000</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Repayment Frequency</Text>
                            <Text style={styles.infoValue}>Weekly (7 days)</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Estimated Start Date</Text>
                            <Text style={styles.infoValue}>April 2, 2025</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={() => router.replace('/(merchant)/index')}
                    >
                        <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => router.push(`/(merchant)/loans/${id}/repayment-plan`)}
                    >
                        <Text style={styles.secondaryButtonText}>View Repayment Plan</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
    },
    successContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    circleIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#3B5998',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#3B5998',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    footer: {
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#3B5998',
        borderRadius: 24,
        paddingVertical: 18,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        borderRadius: 24,
        paddingVertical: 18,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#3B5998',
        fontSize: 16,
        fontWeight: '700',
    }
});
