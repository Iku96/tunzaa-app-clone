import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeliveryCompletedCardProps {
    productName: string;
    productImage?: string;
    courierName: string;
    deliveryAddress: string;
    deliveryTime: string;
    onViewDetailsPress: () => void;
}

export default function DeliveryCompletedCard({
    productName,
    productImage,
    courierName,
    deliveryAddress,
    deliveryTime,
    onViewDetailsPress
}: DeliveryCompletedCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.successIcon}>
                    <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.headerTitle}>Delivery Completed!</Text>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Delivered Product</Text>
                    <View style={styles.productRow}>
                        {productImage && <Image source={{ uri: productImage }} style={styles.productImage} />}
                        <Text style={styles.detailValue} numberOfLines={1}>{productName}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Delivery Courier</Text>
                    <Text style={styles.detailValue}>{courierName}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Delivered To</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>{deliveryAddress}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Delivery Time</Text>
                    <Text style={styles.detailValue}>{deliveryTime}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.footer} onPress={onViewDetailsPress}>
                <Text style={styles.footerText}>View more Details</Text>
                <Ionicons name="chevron-down" size={16} color="#1F2937" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    successIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    detailsContainer: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        textAlign: 'right',
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    productImage: {
        width: 24,
        height: 24,
        borderRadius: 4,
        marginRight: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    footerText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
        marginRight: 4,
    }
});
