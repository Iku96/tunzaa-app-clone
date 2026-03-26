import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const FREQUENCIES = [
    { id: 'custom', label: 'Custom', days: '' },
    { id: 'weekly', label: 'Weekly (7 days)', days: '7' },
    { id: 'fortnightly', label: 'Weekly (15 days)', days: '15' },
    { id: 'monthly', label: 'Monthly (30 days)', days: '30' },
];

export default function RepaymentScheduleScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [selectedFreq, setSelectedFreq] = useState('weekly');
    const [customDays, setCustomDays] = useState('');

    const handleConfirm = () => {
        const days = selectedFreq === 'custom' ? customDays : FREQUENCIES.find(f => f.id === selectedFreq)?.days;
        if (!days) {
            alert('Please specify the number of days for custom frequency.');
            return;
        }
        router.push(`/(merchant)/loans/${id}/confirmation`);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Frequency</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    
                    <Text style={styles.pageTitle}>Set your repayment schedule</Text>
                    <Text style={styles.pageSubtitle}>
                        Choose how often you would like to make repayments. This helps us automate your payment plan.
                    </Text>

                    <View style={styles.radioGroup}>
                        {FREQUENCIES.map((freq) => (
                            <TouchableOpacity 
                                key={freq.id} 
                                style={[styles.radioItem, selectedFreq === freq.id && styles.radioItemActive]}
                                onPress={() => setSelectedFreq(freq.id)}
                            >
                                <View style={styles.radioTextContainer}>
                                    <Text style={[styles.radioLabel, selectedFreq === freq.id && styles.radioLabelActive]}>
                                        {freq.label}
                                    </Text>
                                    {freq.id === 'custom' && selectedFreq === 'custom' && (
                                        <View style={styles.customInputRow}>
                                            <TextInput
                                                style={styles.customInput}
                                                placeholder="Enter days"
                                                keyboardType="numeric"
                                                value={customDays}
                                                onChangeText={setCustomDays}
                                                autoFocus
                                            />
                                            <Text style={styles.daysSuffix}>days</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={[styles.radioButton, selectedFreq === freq.id && styles.radioButtonActive]}>
                                    {selectedFreq === freq.id && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#1E40AF" />
                        <Text style={styles.infoText}>
                            Your first repayment will be due exactly {selectedFreq === 'custom' ? (customDays || 'X') : FREQUENCIES.find(f => f.id === selectedFreq)?.days} days from when funds are disbursed.
                        </Text>
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmButtonText}>Confirm Repayment Plan</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        padding: 24,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    pageSubtitle: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
        marginBottom: 32,
    },
    radioGroup: {
        marginBottom: 16,
    },
    radioItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    radioItemActive: {
        // Optional active background or border
    },
    radioTextContainer: {
        flex: 1,
    },
    radioLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    radioLabelActive: {
        color: '#111827',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonActive: {
        borderColor: '#3B5998',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3B5998',
    },
    customInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    customInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: 100,
        fontSize: 14,
        color: '#111827',
    },
    daysSuffix: {
        marginLeft: 8,
        fontSize: 14,
        color: '#6B7280',
    },
    infoBox: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1E40AF',
        lineHeight: 20,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    confirmButton: {
        backgroundColor: '#3B5998',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    }
});
