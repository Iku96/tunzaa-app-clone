import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartCombined } from '../../../src/stores/cart';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import BottomNav from '../../../src/components/navigation/BottomNav';

const { width } = Dimensions.get('window');

export default function CartScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { user } = useTunzaaAuth();
    const userId = user?.user_id || user?.id || '';
    const { 
        cart, 
        isLoading, 
        updateItemById, 
        removeItemById, 
        isUpdating, 
        isRemoving, 
        refetch 
    } = useCartCombined(userId);
    
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [processingItemId, setProcessingItemId] = useState<string | null>(null);

    const cartItems = useMemo(() => cart?.items || [], [cart]);
    
    // Auto-select all items on load
    React.useEffect(() => {
        if (cartItems.length > 0 && selectedItems.length === 0) {
            setSelectedItems(cartItems.map(item => item.item_id || item.product_id));
        }
    }, [cartItems]);

    const subtotal = useMemo(() => {
        return cartItems
            .filter(item => selectedItems.includes(item.item_id || item.product_id))
            .reduce((sum, item) => sum + ((item.unit_price || item.sale_price || 0) * item.quantity), 0);
    }, [cartItems, selectedItems]);

    const selectedCount = selectedItems.length;

    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cartItems.length && cartItems.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item.item_id || item.product_id));
        }
    };

    const handleUpdateQuantity = async (item: any, increment: boolean) => {
        const newQty = increment ? item.quantity + 1 : item.quantity - 1;
        if (newQty < 1) {
            handleRemoveItem(item);
            return;
        }

        setProcessingItemId(item.item_id);
        try {
            await updateItemById(item.item_id, newQty);
            await refetch();
        } catch (err: any) {
            if (err.message?.includes('inventory') || err.message?.includes('stock')) {
                Alert.alert(t.cartAlertOutOfStockTitle, t.cartAlertOutOfStockMsg);
            } else {
                Alert.alert(t.cartAlertUpdateErrorTitle, t.cartAlertUpdateErrorMsg);
            }
        } finally {
            setProcessingItemId(null);
        }
    };

    const handleRemoveItem = (item: any) => {
        Alert.alert(
            t.cartAlertRemoveTitle,
            `${t.cartAlertRemoveMsg1}${item.product_name || 'this item'}${t.cartAlertRemoveMsg2}`,
            [
                { text: t.cartAlertRemoveCancel, style: "cancel" },
                { 
                    text: t.cartAlertRemoveConfirm, 
                    style: "destructive", 
                    onPress: async () => {
                        setProcessingItemId(item.item_id);
                        try {
                            await removeItemById(item.item_id);
                            setSelectedItems(prev => prev.filter(id => id !== item.item_id));
                            await refetch();
                        } catch (err) {
                            Alert.alert(t.cartAlertRemoveErrorTitle, t.cartAlertRemoveErrorMsg);
                        } finally {
                            setProcessingItemId(null);
                        }
                    }
                }
            ]
        );
    };

    const handleCheckout = () => {
        if (selectedCount === 0) return;
        router.push('/(buyer)/cart/checkout' as any);
    };

    const renderCartItem = (item: any) => {
        const id = item.item_id || item.product_id;
        const isSelected = selectedItems.includes(id);
        const isProcessing = processingItemId === item.item_id;
        const rawImage = item.image_url;
        const image = typeof rawImage === 'string' 
            ? rawImage 
            : (rawImage?.url || 'https://via.placeholder.com/300x300?text=No+Image');
            
        const price = item.unit_price || item.sale_price || 0;
        const metadata = item.metadata || {};
        const deliveryFee = metadata.delivery_fee || 0;
        const warranty = metadata.warranty_period;
        const category = metadata.category || '';
        const isFood = category.toLowerCase().includes('food') || category.toLowerCase().includes('grocery');

        return (
            <View key={id} style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                    <TouchableOpacity style={styles.checkbox} onPress={() => toggleSelectItem(id)}>
                        <Ionicons 
                            name={isSelected ? "checkbox" : "square-outline"} 
                            size={24} 
                            color={isSelected ? "#425BA4" : "#D1D5DB"} 
                        />
                    </TouchableOpacity>
                    
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: image }} style={styles.productImage} />
                    </View>

                    <View style={styles.detailsWrapper}>
                        <View style={styles.titleRow}>
                            <Text style={styles.productTitle} numberOfLines={1}>{item.product_name}</Text>
                            <TouchableOpacity 
                                style={styles.trashBtn} 
                                onPress={() => handleRemoveItem(item)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#EF4444" />
                                ) : (
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text style={styles.ratingText}>4.8 (56)</Text>
                        </View>

                        <Text style={styles.price}>Tsh {price.toLocaleString()}</Text>

                        <View style={styles.actionRow}>
                            <View style={styles.deliveryInfo}>
                                {deliveryFee > 0 ? (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="location-outline" size={12} color="#6B7280" />
                                        <Text style={styles.infoText}>{t.cartDeliveryPrefix}{deliveryFee.toLocaleString()}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="location-outline" size={12} color="#10B981" />
                                        <Text style={[styles.infoText, { color: '#10B981' }]}>{t.cartDeliveryFree}</Text>
                                    </View>
                                )}
                                
                                {warranty && !isFood && (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="shield-checkmark-outline" size={12} color="#6B7280" />
                                        <Text style={styles.infoText}>{warranty}{t.cartWarrantySuffix}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.qtyRow}>
                                <TouchableOpacity 
                                    style={styles.qtyButton} 
                                    onPress={() => handleUpdateQuantity(item, false)}
                                    disabled={isProcessing}
                                >
                                    <Ionicons name="remove" size={16} color="#6B7280" />
                                </TouchableOpacity>
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#425BA4" style={{ marginHorizontal: 8 }} />
                                ) : (
                                    <Text style={styles.qtyText}>{item.quantity}</Text>
                                )}
                                <TouchableOpacity 
                                    style={[styles.qtyButton, styles.qtyButtonAdd]} 
                                    onPress={() => handleUpdateQuantity(item, true)}
                                    disabled={isProcessing}
                                >
                                    <Ionicons name="add" size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.cartHeaderTitle}</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <View style={styles.mainWrapper}>
                <View style={styles.content}>
                <TouchableOpacity style={styles.selectAllRow} onPress={toggleSelectAll}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons 
                            name={selectedItems.length === cartItems.length && cartItems.length > 0 ? "checkbox" : "square-outline"} 
                            size={22} 
                            color={selectedItems.length === cartItems.length && cartItems.length > 0 ? "#425BA4" : "#D1D5DB"} 
                        />
                        <Text style={styles.selectAllText}>{t.cartSelectAll}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#6B7280' }}>{cartItems.length}{cartItems.length !== 1 ? t.cartItemCountPlural : t.cartItemCountSingular}</Text>
                </TouchableOpacity>

                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#425BA4" />
                    </View>
                ) : cartItems.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyText}>{t.cartEmptyState}</Text>
                        <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(buyer)')}>
                            <Text style={styles.browseText}>{t.cartContinueShopping}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                        {cartItems.map(renderCartItem)}
                    </ScrollView>
                )}
            </View>

            {cartItems.length > 0 && (
                <View style={styles.bottomBarContainer}>
                    <View style={styles.bottomBar}>
                        <View>
                            <Text style={styles.itemCountText}>{selectedCount}{selectedCount !== 1 ? t.cartItemCountPlural : t.cartItemCountSingular}</Text>
                            <Text style={styles.subtotalText}>{t.cartSubtotalPrefix}{subtotal.toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.checkoutButton, selectedCount === 0 && styles.disabledButton]}
                            onPress={handleCheckout}
                            disabled={selectedCount === 0}
                        >
                            <Text style={styles.checkoutButtonText}>{t.cartProceedCheckout}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            </View>

            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#425BA4',
    },
    mainWrapper: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        marginBottom: 90,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#425BA4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    selectAllRow: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectAllText: {
        fontSize: 16,
        color: '#1A1A1A',
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
        gap: 16,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        gap: 10,
    },
    checkbox: {
        marginTop: 4,
    },
    imageWrapper: {
        width: 70,
        height: 70,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    detailsWrapper: {
        flex: 1,
        gap: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productTitle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#425BA4',
        flex: 1,
        marginRight: 8,
    },
    trashBtn: {
        padding: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 11,
        color: '#6B7280',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 2,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 4,
    },
    deliveryInfo: {
        flex: 1,
        gap: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 10,
        color: '#6B7280',
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 2,
    },
    qtyButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyButtonAdd: {
        backgroundColor: '#425BA4',
    },
    qtyText: {
        marginHorizontal: 8,
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    bottomBarContainer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemCountText: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
    },
    subtotalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    checkoutButton: {
        backgroundColor: '#425BA4',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    checkoutButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
    },
    browseButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#425BA4',
        borderRadius: 24,
    },
    browseText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
