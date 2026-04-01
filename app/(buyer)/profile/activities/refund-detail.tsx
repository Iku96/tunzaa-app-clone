import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RefundDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const refundData = {
        id: id || 'REF-22345',
        date: '25 May 24',
        time: '14:30',
        customer: 'Khadija Abdallah',
        item: 'Samsung Galaxy S22',
        amount: 'Tsh 1,500,000',
        status: 'In Progress',
        reason: 'Defective product',
        method: 'NMB Bank',
    };

    const formatPrice = (price: string) => {
        return price; // Already formatted in mock
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refund detail</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.detailCard}>
                    {/* Status Badge */}
                    <View style={styles.statusBadgeContainer}>
                        <View style={styles.statusBadge}>
                            <Ionicons name="time-outline" size={14} color="#D97706" />
                            <Text style={styles.statusBadgeText}>{refundData.status}</Text>
                        </View>
                    </View>

                    {/* Refund ID & Date */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.idLabel}>Refund ID</Text>
                        <Text style={styles.idValue}>{refundData.id}</Text>
                        <Text style={styles.dateTime}>{refundData.date} • {refundData.time}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Refund Info */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionLabel}>Request Details</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Item</Text>
                            <Text style={styles.infoValue}>{refundData.item}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Reason</Text>
                            <Text style={styles.infoValue}>{refundData.reason}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Amount</Text>
                            <Text style={styles.infoValue}>{refundData.amount}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Customer Info */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionLabel}>Customer</Text>
                        <Text style={styles.customerName}>{refundData.customer}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Refund Method */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionLabel}>Refund Method</Text>
                        <View style={styles.methodRow}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="card-outline" size={18} color="#425BA4" />
                            </View>
                            <Text style={styles.methodName}>{refundData.method}</Text>
                        </View>
                    </View>
                </View>

                {/* Support Actions */}
                <TouchableOpacity 
                    style={styles.supportButton}
                    onPress={() => router.push('/(buyer)/chat/support' as any)}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#425BA4" style={{ marginRight: 8 }} />
                    <Text style={styles.supportButtonText}>Chat with Support</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    detailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        marginBottom: 24,
    },
    statusBadgeContainer: {
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#D97706',
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    idLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    idValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 8,
    },
    dateTime: {
        fontSize: 13,
        color: '#6B7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
    },
    infoSection: {
        gap: 12,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    customerName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    supportButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    supportButtonText: {
        color: '#425BA4',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
