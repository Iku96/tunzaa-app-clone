import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransferIndexScreen() {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');

    const handleContinue = () => {
        if (!amount || !phone) return;
        router.push({
            pathname: '/(buyer)/transfer/review',
            params: { amount, phone }
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transfer Fund</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Recipient Phone Number</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 07XXXXXXXX"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Amount to Transfer</Text>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.currencyPrefix}>TZS</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.continueButton, (!amount || !phone) && styles.disabledButton]}
                    onPress={handleContinue}
                    disabled={!amount || !phone}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 12,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    content: { padding: 20 },
    inputSection: { marginBottom: 24 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
        borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16,
    },
    inputIcon: { marginRight: 12 },
    currencyPrefix: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginRight: 8 },
    input: { flex: 1, height: 56, fontSize: 16, color: '#111827' },
    continueButton: {
        backgroundColor: '#425BA4', height: 56, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center', marginTop: 20,
    },
    disabledButton: { backgroundColor: '#9CA3AF' },
    continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
