import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransferReviewScreen() {
    const router = useRouter();
    const { amount, phone } = useLocalSearchParams<{ amount: string; phone: string }>();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            router.push({
                pathname: '/(buyer)/transfer/status',
                params: { amount, phone, status: 'success' }
            });
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Transfer</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.reviewCard}>
                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewLabel}>Recipient</Text>
                        <Text style={styles.reviewValue}>{phone}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewLabel}>Amount</Text>
                        <Text style={styles.reviewValue}>TZS {parseFloat(amount || '0').toLocaleString()}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewLabel}>Fee</Text>
                        <Text style={styles.reviewValue}>TZS 0</Text>
                    </View>
                    <View style={[styles.reviewItem, { marginTop: 12 }]}>
                        <Text style={styles.totalLabel}>Total to Pay</Text>
                        <Text style={styles.totalValue}>TZS {parseFloat(amount || '0').toLocaleString()}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmButtonText}>Confirm & Transfer</Text>}
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
    reviewCard: {
        backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20,
        borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 30,
    },
    reviewItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    reviewLabel: { fontSize: 14, color: '#6B7280' },
    reviewValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
    totalValue: { fontSize: 18, fontWeight: '800', color: '#425BA4' },
    confirmButton: {
        backgroundColor: '#425BA4', height: 56, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
