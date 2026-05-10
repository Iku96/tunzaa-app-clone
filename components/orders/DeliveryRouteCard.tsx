import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeliveryRouteCardProps {
    etaText: string;
    statusStep: number; // 0 = Picked up, 1 = In transit, 2 = Delivered
    driverName: string;
    driverId: string;
    driverRating: number;
    driverTrips: number;
    onViewDetailsPress: () => void;
}

export default function DeliveryRouteCard({
    etaText,
    statusStep,
    driverName,
    driverId,
    driverRating,
    driverTrips,
    onViewDetailsPress
}: DeliveryRouteCardProps) {
    const STATUS_STEPS = [
        { label: "Picked up" },
        { label: "In transit" },
        { label: "Delivered" },
    ];

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="cube-outline" size={24} color="#315BA9" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Package is on its way</Text>
                    <Text style={styles.subtitle}>{etaText}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                {STATUS_STEPS.map((step, index) => {
                    const isActive = statusStep >= index;
                    return (
                        <React.Fragment key={index}>
                            <View style={styles.stepContainer}>
                                <View style={[styles.dot, isActive && styles.activeDot]} />
                                <Text style={[styles.stepText, isActive && styles.activeStepText]}>
                                    {step.label}
                                </Text>
                            </View>
                            {index < STATUS_STEPS.length - 1 && (
                                <View style={[styles.line, statusStep > index && styles.activeLine]} />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>

            <View style={styles.driverInfoContainer}>
                <View style={styles.driverAvatar}>
                    <Text style={{ fontSize: 24 }}>🧑‍✈️</Text>
                </View>
                <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>{driverName}</Text>
                    <Text style={styles.driverId}>ID: {driverId}</Text>
                </View>
                <View style={styles.driverStats}>
                    <View style={styles.statRow}>
                        <Ionicons name="star" size={14} color="#FBBF24" />
                        <Text style={styles.statText}>{driverRating}</Text>
                    </View>
                    <Text style={styles.statSubtext}>{driverTrips} Trips</Text>
                </View>
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
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    stepContainer: {
        alignItems: 'center',
        width: 60,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E5E7EB',
        marginBottom: 8,
    },
    activeDot: {
        backgroundColor: '#315BA9',
    },
    stepText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    activeStepText: {
        color: '#1F2937',
        fontWeight: '500',
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginTop: 5,
        marginHorizontal: -15,
    },
    activeLine: {
        backgroundColor: '#315BA9',
    },
    driverInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    driverAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    driverId: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    driverStats: {
        alignItems: 'flex-end',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 4,
    },
    statSubtext: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
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
