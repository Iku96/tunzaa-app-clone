import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useMerchantPulse } from '../../src/hooks/useMerchantPulse';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

export default function MerchantLiveOrders() {
    const { setViewMode } = useAuth();
    const router = useRouter();
    const { orders, loading, newPaymentAlert } = useMerchantPulse();

    // Animation for new payment alert
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (newPaymentAlert) {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(2000),
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
            ]).start();
        }
    }, [newPaymentAlert]);

    return (
        <View style={styles.container}>
            {/* Alert Banner */}
            <Animated.View style={[styles.alertBanner, { opacity: fadeAnim }]}>
                <Ionicons name="cash" size={24} color="#FFFFFF" />
                <Text style={styles.alertText}>{newPaymentAlert}</Text>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Merchant Pulse</Text>
                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => {
                            setViewMode('buyer');
                            router.replace('/(buyer)');
                        }}
                    >
                        <Ionicons name="cart" size={20} color="#425BA4" />
                        <Text style={styles.switchText}>Switch to Buying</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.subtitle}>Live Tracking of Active Savers</Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Active Orders</Text>
                        <Text style={styles.statValue}>{orders.length}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Locked</Text>
                        <Text style={styles.statValue}>
                            TZS {orders.reduce((acc, o) => acc + (o.current_amount || 0), 0).toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Orders List */}
                {loading ? (
                    <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 40 }} />
                ) : orders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No active orders yet.</Text>
                        <Text style={styles.emptySubtext}>Share your products to get started!</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {orders.map((order) => {
                            const progress = order.total_amount > 0 ? (order.current_amount / order.total_amount) : 0;
                            return (
                                <View key={order.id} style={styles.orderCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.customerInfo}>
                                            <Image
                                                source={{ uri: order.user?.avatar_url || 'https://via.placeholder.com/40' }}
                                                style={styles.avatar}
                                            />
                                            <View>
                                                <Text style={styles.customerName}>{order.user?.full_name || 'Customer'}</Text>
                                                <Text style={styles.productName}>{order.product?.title}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
                                    </View>

                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <Text style={styles.amountText}>
                                            <Text style={styles.bold}>TZS {order.current_amount.toLocaleString()}</Text> / {order.total_amount.toLocaleString()}
                                        </Text>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <Text style={styles.actionButtonText}>Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    alertBanner: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: '#22C55E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        zIndex: 100,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    alertText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    switchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#E0E7FF',
        borderRadius: 8,
        gap: 4,
    },
    switchText: {
        color: '#425BA4',
        fontWeight: '600',
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statLabel: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        color: '#1F2937',
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#374151',
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    listContainer: {
        gap: 16,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    productName: {
        fontSize: 12,
        color: '#6B7280',
    },
    percentage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#22C55E',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#22C55E',
        borderRadius: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountText: {
        fontSize: 14,
        color: '#6B7280',
    },
    bold: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
    },
    actionButtonText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
});
