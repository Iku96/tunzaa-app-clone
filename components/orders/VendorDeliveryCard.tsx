import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VendorDeliveryCardProps {
    customerName: string;
    customerRole?: string;
    addressLine1: string;
    addressLine2: string;
    onCallPress: () => void;
    onViewDetailsPress: () => void;
}

export default function VendorDeliveryCard({
    customerName,
    customerRole = "Customer",
    addressLine1,
    addressLine2,
    onCallPress,
    onViewDetailsPress
}: VendorDeliveryCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Ionicons name="location-outline" size={20} color="#1F2937" />
                <Text style={styles.headerTitle}>Drop-off Location</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.customerRow}>
                    <View>
                        <Text style={styles.customerName}>{customerName}</Text>
                        <Text style={styles.customerRole}>{customerRole}</Text>
                    </View>
                    <TouchableOpacity style={styles.callButton} onPress={onCallPress}>
                        <Ionicons name="call-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.addressBlock}>
                    <Text style={styles.addressText}>{addressLine1}</Text>
                    <Text style={[styles.addressText, { marginTop: 8 }]}>{addressLine2}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.footer} onPress={onViewDetailsPress}>
                <Text style={styles.footerText}>View more details</Text>
                <Ionicons name="chevron-forward" size={16} color="#1F2937" />
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
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 8,
    },
    content: {
        marginBottom: 16,
    },
    customerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    customerRole: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    callButton: {
        backgroundColor: '#315BA9',
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressBlock: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
    },
    addressText: {
        fontSize: 14,
        color: '#374151',
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
