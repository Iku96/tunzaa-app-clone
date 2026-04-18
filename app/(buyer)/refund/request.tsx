import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, Alert, Platform, KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useGetUserOrders, useRequestRefund } from '../../../src/services/orders';

export default function RefundRequestScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const userId = user?.user_id || '';

    // Fetch completed/delivered orders eligible for refund
    const { data: ordersData, isLoading: ordersLoading } = useGetUserOrders(userId, { limit: 50 }, !!userId);
    const refundMutation = useRequestRefund();

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
    const [reason, setReason] = useState('');
    const [showOrderPicker, setShowOrderPicker] = useState(false);

    // Normalize orders from API response (handles both array and paginated object)
    const orders = useMemo(() => {
        if (!ordersData) return [];
        const items = Array.isArray(ordersData) ? ordersData : (ordersData as any).items || [];
        return items;
    }, [ordersData]);

    const selectedOrder = useMemo(() => {
        return orders.find((o: any) => o.order_id === selectedOrderId);
    }, [orders, selectedOrderId]);

    const toggleItem = (itemId: string, maxQty: number) => {
        setSelectedItems(prev => {
            if (prev[itemId]) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: maxQty };
        });
    };

    const updateItemQty = (itemId: string, qty: number) => {
        if (qty <= 0) {
            const { [itemId]: _, ...rest } = selectedItems;
            setSelectedItems(rest);
        } else {
            setSelectedItems(prev => ({ ...prev, [itemId]: qty }));
        }
    };

    const canSubmit = selectedOrderId && Object.keys(selectedItems).length > 0 && reason.trim().length > 5;

    const handleSubmit = async () => {
        if (!canSubmit || !selectedOrderId) return;

        try {
            await refundMutation.mutateAsync({
                orderId: selectedOrderId,
                data: {
                    issued_by: userId,
                    refund_data: {
                        items: Object.entries(selectedItems).map(([item_id, quantity]) => ({
                            item_id,
                            quantity,
                        })),
                        reason: reason.trim(),
                    },
                },
            });

            Alert.alert(
                'Refund Requested',
                'Your refund request has been submitted. We will review it and get back to you shortly.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (e: any) {
            Alert.alert('Refund Failed', e?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Request Refund</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Step 1: Select Order */}
                    <Text style={styles.sectionTitle}>1. Select Order</Text>

                    {ordersLoading ? (
                        <ActivityIndicator size="small" color="#3B5998" style={{ marginVertical: 20 }} />
                    ) : orders.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
                            <Text style={styles.emptyText}>No orders found</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.orderSelector}
                            onPress={() => setShowOrderPicker(!showOrderPicker)}
                        >
                            <View style={{ flex: 1 }}>
                                {selectedOrder ? (
                                    <>
                                        <Text style={styles.orderNumber}>#{selectedOrder.order_number}</Text>
                                        <Text style={styles.orderMeta}>
                                            {selectedOrder.items?.length || 0} items · TZS {selectedOrder.totals?.total?.toLocaleString() || '0'}
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={styles.placeholderText}>Tap to select an order</Text>
                                )}
                            </View>
                            <Ionicons name={showOrderPicker ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
                        </TouchableOpacity>
                    )}

                    {/* Order Picker Dropdown */}
                    {showOrderPicker && (
                        <View style={styles.orderDropdown}>
                            {orders.map((order: any) => (
                                <TouchableOpacity
                                    key={order.order_id}
                                    style={[
                                        styles.orderOption,
                                        selectedOrderId === order.order_id && styles.orderOptionActive
                                    ]}
                                    onPress={() => {
                                        setSelectedOrderId(order.order_id);
                                        setSelectedItems({});
                                        setShowOrderPicker(false);
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.orderOptionNumber}>#{order.order_number}</Text>
                                        <Text style={styles.orderOptionMeta}>
                                            {order.status} · TZS {order.totals?.total?.toLocaleString() || '0'}
                                        </Text>
                                    </View>
                                    {selectedOrderId === order.order_id && (
                                        <Ionicons name="checkmark-circle" size={20} color="#3B5998" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Step 2: Select Items */}
                    {selectedOrder && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>2. Select Items to Refund</Text>
                            {selectedOrder.items?.map((item: any) => {
                                const isSelected = !!selectedItems[item.item_id];
                                const qty = selectedItems[item.item_id] || 0;

                                return (
                                    <TouchableOpacity
                                        key={item.item_id}
                                        style={[styles.itemCard, isSelected && styles.itemCardActive]}
                                        onPress={() => toggleItem(item.item_id, item.quantity)}
                                    >
                                        <View style={styles.itemCheckbox}>
                                            <Ionicons
                                                name={isSelected ? "checkbox" : "square-outline"}
                                                size={22}
                                                color={isSelected ? "#3B5998" : "#D1D5DB"}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemPrice}>
                                                TZS {item.unit_price?.toLocaleString()} × {item.quantity}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <View style={styles.qtyControls}>
                                                <TouchableOpacity
                                                    style={styles.qtyBtn}
                                                    onPress={() => updateItemQty(item.item_id, qty - 1)}
                                                >
                                                    <Ionicons name="remove" size={16} color="#374151" />
                                                </TouchableOpacity>
                                                <Text style={styles.qtyText}>{qty}</Text>
                                                <TouchableOpacity
                                                    style={styles.qtyBtn}
                                                    onPress={() => {
                                                        if (qty < item.quantity) updateItemQty(item.item_id, qty + 1);
                                                    }}
                                                >
                                                    <Ionicons name="add" size={16} color="#374151" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </>
                    )}

                    {/* Step 3: Reason */}
                    {Object.keys(selectedItems).length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>3. Reason for Refund</Text>
                            <TextInput
                                style={styles.reasonInput}
                                placeholder="Tell us why you want a refund..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                value={reason}
                                onChangeText={setReason}
                                textAlignVertical="top"
                            />
                        </>
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                        disabled={!canSubmit || refundMutation.isPending}
                        onPress={handleSubmit}
                    >
                        {refundMutation.isPending ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitText}>Submit Refund Request</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    content: { padding: 20, paddingBottom: 60 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },

    // Order Selector
    orderSelector: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB',
    },
    orderNumber: { fontSize: 16, fontWeight: '700', color: '#111827' },
    orderMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    placeholderText: { fontSize: 15, color: '#9CA3AF' },

    // Order Dropdown
    orderDropdown: {
        marginTop: 4, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
        backgroundColor: '#FFFFFF', overflow: 'hidden',
    },
    orderOption: {
        flexDirection: 'row', alignItems: 'center', padding: 14,
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    orderOptionActive: { backgroundColor: '#EFF6FF' },
    orderOptionNumber: { fontSize: 15, fontWeight: '600', color: '#111827' },
    orderOptionMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },

    // Items
    itemCard: {
        flexDirection: 'row', alignItems: 'center', padding: 14,
        borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 8, backgroundColor: '#FFFFFF',
    },
    itemCardActive: { borderColor: '#3B5998', backgroundColor: '#EFF6FF' },
    itemCheckbox: { marginRight: 12 },
    itemName: { fontSize: 15, fontWeight: '600', color: '#111827' },
    itemPrice: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    qtyBtn: {
        width: 28, height: 28, borderRadius: 6, backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center',
    },
    qtyText: { fontSize: 15, fontWeight: '700', color: '#111827', minWidth: 20, textAlign: 'center' },

    // Reason
    reasonInput: {
        borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14,
        fontSize: 15, color: '#111827', minHeight: 100, backgroundColor: '#F9FAFB',
    },

    // Submit
    submitButton: {
        backgroundColor: '#3B5998', paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 32,
    },
    submitButtonDisabled: { backgroundColor: '#93A5CF' },
    submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    // Empty
    emptyBox: {
        alignItems: 'center', padding: 30, borderWidth: 1, borderColor: '#E5E7EB',
        borderRadius: 12, backgroundColor: '#F9FAFB',
    },
    emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
});
