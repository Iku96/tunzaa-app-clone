import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock Cart Data for Summary
const SUMMARY_ITEMS = [
    {
        id: '1',
        name: 'Smart Watch Series 5',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
        price: 45000,
        quantity: 1,
        tag: '#Best Seller'
    },
    {
        id: '2',
        name: 'Long Sofa',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60',
        price: 655000,
        quantity: 1,
        tag: '#Best Seller'
    },
    {
        id: '3',
        name: 'Dinning chair',
        image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&auto=format&fit=crop&q=60',
        price: 450000,
        quantity: 1,
        tag: ''
    }
];

export default function OrderSummaryScreen() {
    const router = useRouter();

    const subtotal = 35000; // Mock values based on screenshot
    const discount = 0;
    const deliveryFees = 10000;
    const tax = 6300;
    const totalCosts = 51300;

    const renderSummaryItem = (item) => (
        <View key={item.id} style={styles.itemRow}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <View style={styles.nameRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.tag ? <Text style={styles.tag}>{item.tag}</Text> : null}
                </View>
                <Text style={styles.itemPrice}>Tsh. {item.price.toLocaleString()}</Text>

                <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyButton}>
                        <Ionicons name="remove" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity style={[styles.qtyButton, styles.qtyButtonAdd]}>
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Summary</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>My cart</Text>

                <View style={styles.cartList}>
                    {SUMMARY_ITEMS.map(renderSummaryItem)}
                </View>

                <View style={styles.divider} />

                <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Subtotal</Text>
                    <Text style={styles.costValue}>Tsh. {subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Discount</Text>
                    <Text style={styles.costValue}>Tsh. {discount}</Text>
                </View>
                <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Delivery Fees</Text>
                    <Text style={styles.costValue}>Tsh. {deliveryFees.toLocaleString()}</Text>
                </View>
                <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Tax (18%)</Text>
                    <Text style={styles.costValue}>Tsh. {tax.toLocaleString()}</Text>
                </View>

                <View style={[styles.costRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total costs</Text>
                    <Text style={styles.totalValue}>Tsh. {totalCosts.toLocaleString()}</Text>
                </View>
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={styles.installmentButton}
                    onPress={() => router.push('/(buyer)/product/installment-plan')} // Navigate to Installment Plan
                >
                    <Text style={styles.installmentTitle}>Installment</Text>
                    <Text style={styles.installmentSubtitle}>T.cost 10,000 Tsh/wki</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.fullPaymentButton}
                    onPress={() => router.push('/(buyer)/checkout/payment-method')} // Navigate to Payment Method
                >
                    <Text style={styles.fullPaymentText}>Full Payment</Text>
                </TouchableOpacity>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    cartList: {
        gap: 16,
        marginBottom: 24,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
    },
    itemDetails: {
        flex: 1,
    },
    nameRow: {
        marginBottom: 4,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A55A2',
        marginBottom: 2,
    },
    tag: {
        fontSize: 10,
        color: '#3B82F6',
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        alignSelf: 'flex-start',
        borderRadius: 6,
        padding: 2,
    },
    qtyButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    qtyButtonAdd: {
        backgroundColor: '#4A55A2',
    },
    qtyText: {
        marginHorizontal: 12,
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
    },
    deleteButton: {
        padding: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    costLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    costValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    totalRow: {
        marginTop: 12,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        color: '#6B7280',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    bottomActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    installmentButton: {
        flex: 1,
        backgroundColor: '#22C55E', // Green
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    installmentTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    installmentSubtitle: {
        color: '#FFFFFF',
        fontSize: 10,
    },
    fullPaymentButton: {
        flex: 1,
        backgroundColor: '#4A55A2', // Blue
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullPaymentText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
