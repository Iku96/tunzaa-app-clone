import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Chat Support</Text>
            </View>

            <View style={styles.content}>
                <Ionicons name="chatbubbles-outline" size={64} color="#EF4444" style={{ marginBottom: 16 }} />
                <Text style={styles.title}>Chat Integration Blocked</Text>
                <Text style={styles.description}>
                    In-app messaging cannot be loaded. The required messaging endpoints and WebSocket connections are missing from the backend API.
                </Text>

                <View style={styles.apiDetails}>
                    <Text style={styles.apiLabel}>Missing Integration Required:</Text>
                    <Text style={styles.apiCode}>WebSocket: /ws/chat/{'{order_id}'}</Text>
                    <Text style={styles.apiCode}>GET /support/chat/{'{order_id}'}/history</Text>
                    <Text style={styles.apiCode}>POST /support/chat/{'{order_id}'}/send</Text>
                    <Text style={styles.apiCode}>Response: ChatMessage[]</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#B91C1C',
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
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 8,
        width: '100%',
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    apiLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#7F1D1D',
        marginBottom: 8,
    },
    apiCode: {
        fontFamily: 'Courier',
        fontSize: 12,
        color: '#7F1D1D',
        marginBottom: 4,
    }
});
