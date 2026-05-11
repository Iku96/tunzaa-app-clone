import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeliveryReturnCardProps {
    productName: string;
    productPrice: string;
    productImage?: string;
    orderId: string;
    size?: string;
    sellerName: string;
    returnId: string;
    returnReason: string;
    returnQuantity: number;
    returnStatus: string; // 'requested', 'approved', 'picked_up', 'completed'
    onViewDetailsPress: () => void;
}

export default function DeliveryReturnCard({
    productName,
    productPrice,
    productImage,
    orderId,
    size,
    sellerName,
    returnId,
    returnReason,
    returnQuantity,
    returnStatus,
    onViewDetailsPress
}: DeliveryReturnCardProps) {
    const STEPS = [
        { key: 'requested', label: 'Return Requested' },
        { key: 'approved', label: 'Return Approved' },
        { key: 'picked_up', label: 'Product Picked Up' },
    ];

    let currentStepIndex = 0;
    if (returnStatus === 'approved') currentStepIndex = 1;
    if (returnStatus === 'picked_up' || returnStatus === 'completed') currentStepIndex = 2;

    return (
        <View style={styles.card}>
            {/* Product Header */}
            <View style={styles.header}>
                <Image 
                    source={productImage ? { uri: productImage } : { uri: 'https://via.placeholder.com/150' }} 
                    style={styles.productImage} 
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{productName}</Text>
                    <Text style={styles.productPrice}>{productPrice}</Text>
                    <Text style={styles.productMeta}>Order ID: {orderId}</Text>
                    <Text style={styles.productMeta}>Size: {size || 'N/A'} | Seller: {sellerName}</Text>
                </View>
            </View>

            {/* Return Details */}
            <View style={styles.returnDetailsContainer}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Return ID</Text>
                    <Text style={styles.detailValue}>{returnId}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reason</Text>
                    <Text style={styles.detailValue}>{returnReason}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity</Text>
                    <Text style={styles.detailValue}>{returnQuantity}</Text>
                </View>
            </View>

            {/* Timeline */}
            <View style={styles.timelineContainer}>
                {STEPS.map((step, index) => {
                    const isActive = currentStepIndex >= index;
                    const isLast = index === STEPS.length - 1;
                    return (
                        <View key={step.key} style={styles.timelineStep}>
                            <View style={styles.timelineIndicator}>
                                <View style={[styles.dot, isActive && styles.activeDot]} />
                                {!isLast && <View style={[styles.line, currentStepIndex > index && styles.activeLine]} />}
                            </View>
                            <Text style={[styles.timelineText, isActive && styles.activeTimelineText]}>
                                {step.label}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <TouchableOpacity style={styles.footer} onPress={onViewDetailsPress}>
                <Text style={styles.footerText}>View all details</Text>
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
        marginBottom: 16,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#315BA9',
        marginTop: 2,
    },
    productMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    returnDetailsContainer: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1F2937',
    },
    timelineContainer: {
        marginBottom: 16,
        paddingLeft: 4,
    },
    timelineStep: {
        flexDirection: 'row',
        minHeight: 40,
    },
    timelineIndicator: {
        width: 20,
        alignItems: 'center',
        marginRight: 12,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E5E7EB',
        marginTop: 4,
    },
    activeDot: {
        backgroundColor: '#315BA9',
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#E5E7EB',
        marginTop: 4,
        marginBottom: -4,
    },
    activeLine: {
        backgroundColor: '#315BA9',
    },
    timelineText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: -1,
    },
    activeTimelineText: {
        color: '#1F2937',
        fontWeight: '500',
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
