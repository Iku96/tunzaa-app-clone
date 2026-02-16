import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TransferStatusScreen() {
    const router = useRouter();

    // Mock Data
    const fromOrder = {
        name: 'Samsung Galaxy A23',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60',
        prevBalance: 450000,
        newBalance: 0,
        date: 'March 15, 2024'
    };

    const toOrder = {
        name: 'LG Double Door Refrigerator',
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=500&auto=format&fit=crop&q=60',
        prevBalance: 0,
        newBalance: 350000,
    };

    const transferAmount = 350000;
    const netAdjustment = 350000;
    const requestedDate = 'Dec 15, 2024 - 2:30 PM';
    const processingSince = 'Dec 15, 2024 - 8:45 PM';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transfer Fund Status</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Visual Flow */}
                <View style={styles.flowCard}>
                    {/* FROM */}
                    <View style={styles.flowItem}>
                        <Text style={styles.flowLabel}>Transfer From</Text>
                        <View style={styles.productRow}>
                            <Image source={{ uri: fromOrder.image }} style={styles.productImage} />
                            <View>
                                <Text style={styles.productName}>{fromOrder.name}</Text>
                                <Text style={styles.dateText}>Request Date: {fromOrder.date}</Text>
                            </View>
                        </View>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>Previous Balance:</Text>
                            <Text style={styles.balanceValue}>Tsh {fromOrder.prevBalance.toLocaleString()}</Text>
                        </View>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>Balance After Transfer:</Text>
                            <Text style={styles.balanceValue}>Tsh {fromOrder.newBalance.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Arrow Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dashLine} />
                        <View style={styles.arrowIcon}>
                            <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                        </View>
                        <View style={styles.dashLine} />
                    </View>

                    {/* TO */}
                    <View style={styles.flowItem}>
                        <Text style={styles.flowLabel}>Transfer To</Text>
                        <View style={styles.productRow}>
                            <Image source={{ uri: toOrder.image }} style={styles.productImage} />
                            <View>
                                <Text style={styles.productName}>{toOrder.name}</Text>
                            </View>
                        </View>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>Previous Balance:</Text>
                            <Text style={styles.balanceValue}>Tsh {toOrder.prevBalance}</Text>
                        </View>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>Balance After Transfer:</Text>
                            <Text style={styles.balanceValue}>Tsh {toOrder.newBalance.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.sectionTitle}>Transfer Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Amount Transferred:</Text>
                        <Text style={styles.summaryValue}>Tsh {transferAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Net Adjustment (From):</Text>
                        <Text style={[styles.summaryValue, { color: '#EF4444' }]}>-Tsh {transferAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Net Adjustment (To):</Text>
                        <Text style={[styles.summaryValue, { color: '#22C55E' }]}>+Tsh {netAdjustment.toLocaleString()}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Requested Date:</Text>
                        <Text style={styles.dateValue}>{requestedDate}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Processing Since:</Text>
                        <Text style={styles.dateValue}>{processingSince}</Text>
                    </View>
                </View>

                {/* Status Badge */}
                <View style={styles.statusBadge}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="time" size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.statusTitle}>Transfer In Progress</Text>
                        <Text style={styles.statusDescription}>
                            Your fund transfer is being processed. You'll receive a notification once it's completed.
                        </Text>
                    </View>
                </View>

            </ScrollView>
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    flowCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    flowItem: {
        marginBottom: 8,
    },
    flowLabel: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    productImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
        transform: [{ rotate: '-10deg' }],
        backgroundColor: '#F3F4F6',
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    dateText: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    balanceLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    balanceValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        justifyContent: 'center',
    },
    dashLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    arrowIcon: {
        marginHorizontal: 8,
    },
    summaryContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    dateValue: {
        fontSize: 12,
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#4A55A2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4A55A2',
        marginBottom: 4,
    },
    statusDescription: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
    },
});
