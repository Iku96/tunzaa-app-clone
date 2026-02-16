import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock Data
const RECEIPT_DATA = {
    date: 'Dec 12, 2025 | 10:48:45 PM',
    customerName: 'Maximus Max',
    orderId: '986704', // Matches previous mock
    productName: 'Nike Air Jordan',
    receiptNo: '07434333642125',
    address: '7663 Oakland St.\nHonolulu, HI 96815',
    subtotal: 51000,
    tax: 4100, // 8%
    total: 61000,
};

export default function ReceiptScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Receipt</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.receiptCard}>
                    {/* Logo */}
                    <Image source={require('../../../assets/tunzaa-logo.png')} style={styles.logo} resizeMode="contain" />

                    <Text style={styles.receiptTitle}>Product Payments</Text>
                    <Text style={styles.paymentNumber}>Payment number #8512857528</Text>

                    <View style={styles.dashedLine} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Date & time</Text>
                        <Text style={styles.value}>{RECEIPT_DATA.date}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Customer name</Text>
                        <Text style={styles.value}>{RECEIPT_DATA.customerName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Order ID</Text>
                        <Text style={styles.value}>{RECEIPT_DATA.orderId}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Product Name</Text>
                        <Text style={styles.value}>{RECEIPT_DATA.productName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Receipt</Text>
                        <Text style={styles.value}>{RECEIPT_DATA.receiptNo}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Address</Text>
                        <Text style={[styles.value, { textAlign: 'right' }]}>{RECEIPT_DATA.address}</Text>
                    </View>

                    <View style={styles.dashedLine} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.value}>Tsh. {RECEIPT_DATA.subtotal.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tax (8%)</Text>
                        <Text style={styles.value}>Tsh. {RECEIPT_DATA.tax.toLocaleString()}</Text>
                    </View>

                    <View style={[styles.row, { marginTop: 12 }]}>
                        <Text style={styles.totalLabel}>Total cost</Text>
                        <Text style={styles.totalValue}>Tsh. {RECEIPT_DATA.total.toLocaleString()}</Text>
                    </View>

                    {/* Perforated bottom edge effect */}
                    <View style={styles.perforationContainer}>
                        {Array.from({ length: 15 }).map((_, i) => (
                            <View key={i} style={styles.circle} />
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.downloadButton}>
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.downloadText}>Download Receipt</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    backButton: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    receiptCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        position: 'relative',
        marginBottom: 24,
    },
    logo: {
        width: 120,
        height: 48,
        marginBottom: 16,
    },
    receiptTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    paymentNumber: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 24,
    },
    dashedLine: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#E5E7EB',
        width: '100%',
        marginBottom: 24,
        borderRadius: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        maxWidth: '60%',
        textAlign: 'right',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    perforationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: -10,
        left: 0,
        right: 0,
        overflow: 'hidden',
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        marginHorizontal: -6,
    },
    downloadButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    downloadText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
