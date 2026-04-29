import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransferStatusScreen() {
    const router = useRouter();
    const { amount, phone, status } = useLocalSearchParams<{ amount: string; phone: string; status: string }>();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.statusIconWrapper}>
                    <View style={[styles.iconCircle, { backgroundColor: status === 'success' ? '#DEF7EC' : '#FDE8E8' }]}>
                        <Ionicons 
                            name={status === 'success' ? "checkmark-circle" : "close-circle"} 
                            size={64} 
                            color={status === 'success' ? "#0E9F6E" : "#E02424"} 
                        />
                    </View>
                </View>

                <Text style={styles.statusTitle}>
                    {status === 'success' ? 'Transfer Successful' : 'Transfer Failed'}
                </Text>
                <Text style={styles.statusSubtitle}>
                    {status === 'success' 
                        ? `You have successfully transferred TZS ${parseFloat(amount || '0').toLocaleString()} to ${phone}.` 
                        : 'Something went wrong with your transfer. Please try again later.'}
                </Text>

                <View style={styles.receiptCard}>
                    <View style={styles.receiptItem}>
                        <Text style={styles.receiptLabel}>Transaction ID</Text>
                        <Text style={styles.receiptValue}>#TZ-{Math.floor(Math.random() * 1000000)}</Text>
                    </View>
                    <View style={styles.receiptItem}>
                        <Text style={styles.receiptLabel}>Date</Text>
                        <Text style={styles.receiptValue}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.doneButton}
                    onPress={() => router.push('/(buyer)/account')}
                >
                    <Text style={styles.doneButtonText}>Back to Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { padding: 30, alignItems: 'center', paddingTop: 60 },
    statusIconWrapper: { marginBottom: 24 },
    iconCircle: {
        width: 120, height: 120, borderRadius: 60,
        alignItems: 'center', justifyContent: 'center',
    },
    statusTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12, textAlign: 'center' },
    statusSubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
    receiptCard: {
        width: '100%', backgroundColor: '#F9FAFB', borderRadius: 16,
        padding: 20, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 40,
    },
    receiptItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    receiptLabel: { fontSize: 14, color: '#6B7280' },
    receiptValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
    doneButton: {
        backgroundColor: '#425BA4', width: '100%', height: 56,
        borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    },
    doneButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
