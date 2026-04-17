import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RefundRequestScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request for Fund</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Ionicons name="warning-outline" size={64} color="#EF4444" style={{ marginBottom: 16 }} />
                <Text style={styles.title}>Blocked by Backend</Text>
                <Text style={styles.description}>
                    The refund request functionality cannot be completed because the required backend endpoint is missing from the API.
                </Text>

                <View style={styles.apiDetails}>
                    <Text style={styles.apiLabel}>Missing Endpoint Required:</Text>
                    <Text style={styles.apiCode}>Method: POST</Text>
                    <Text style={styles.apiCode}>Path: /refunds</Text>
                    <Text style={styles.apiCode}>Payload: {'{ order_id, reason, notes }'}</Text>
                    <Text style={styles.apiCode}>Response: {'{ status: "success", refund_id }'}</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    apiDetails: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    apiLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    apiCode: {
        fontFamily: 'Courier',
        fontSize: 13,
        color: '#1F2937',
        marginBottom: 4,
    }
});
