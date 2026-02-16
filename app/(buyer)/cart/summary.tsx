import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRODUCTS } from '../../../src/data/products';

export default function OrderSummaryScreen() {
    const router = useRouter();
    const { productId } = useLocalSearchParams();
    // State for payment type
    const [paymentType, setPaymentType] = useState<'installment' | 'full'>('installment');
    const [quantity, setQuantity] = useState(1);

    // Get product from params or fallback
    const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS.find(p => p.name === 'Long Sofa') || PRODUCTS[0];

    // Financials
    const subtotal = product.price * quantity;
    const discount = 0;
    const deliveryFees = 10000;
    const tax = 6300;
    const total = subtotal + deliveryFees + tax - discount;

    const handleCheckout = () => {
        if (paymentType === 'installment') {
            router.push({
                pathname: '/(buyer)/checkout/set-goal',
                params: { productId: product.id }
            });
        } else {
            // Future: Implement Full Payment
            alert('Full Payment flow coming soon!');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Summary</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* My Cart Section */}
                    <Text style={styles.sectionTitle}>My cart</Text>

                    <View style={styles.cartCard}>
                        {/* ... (Existing Product Card Code) ... */}
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="contain" />
                        </View>

                        <View style={styles.detailsColumn}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productPrice}>Tsh. {new Intl.NumberFormat('en-US').format(product.price)}</Text>

                            <View style={styles.tagContainer}>
                                <Text style={styles.tagText}>#Best Seller</Text>
                            </View>

                            <View style={styles.actionsRow}>
                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Ionicons name="remove" size={16} color="#1F2937" />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{quantity}</Text>
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, styles.qtyBtnActive]}
                                        onPress={() => setQuantity(quantity + 1)}
                                    >
                                        <Ionicons name="add" size={16} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity>
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Order List Breakdown */}
                    <Text style={styles.sectionTitle}>Order({quantity} item)</Text>

                    <View style={styles.orderItemRow}>
                        <Text style={styles.orderLabel}>Product</Text>
                        <Text style={styles.orderValue}>{product.name}</Text>
                    </View>
                    <View style={styles.orderItemRow}>
                        <Text style={styles.orderLabel}>Price</Text>
                        <Text style={styles.orderValue}>Tsh. {new Intl.NumberFormat('en-US').format(product.price)}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Cost Breakdown */}
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Subtotal</Text>
                        <Text style={styles.costValue}>Tsh. {new Intl.NumberFormat('en-US').format(subtotal)}</Text>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Discount</Text>
                        <Text style={styles.costValue}>Tsh. {discount}</Text>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Delivery Fees</Text>
                        <Text style={styles.costValue}>Tsh. {new Intl.NumberFormat('en-US').format(deliveryFees)}</Text>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Tax (18%)</Text>
                        <Text style={styles.costValue}>Tsh. {new Intl.NumberFormat('en-US').format(tax)}</Text>
                    </View>

                    <View style={[styles.divider, { marginTop: 16 }]} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total costs</Text>
                        <Text style={styles.totalValue}>Tsh. {new Intl.NumberFormat('en-US').format(total)}</Text>
                    </View>
                </ScrollView>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.paymentTypeBtn, paymentType === 'installment' && styles.paymentTypeBtnActive]}
                        onPress={() => setPaymentType('installment')}
                    >
                        <Text style={[styles.btnTitle, paymentType === 'installment' && styles.btnTitleActive]}>Installment</Text>
                        <Text style={[styles.btnSubtitle, paymentType === 'installment' && styles.btnSubtitleActive]}>Tunzaa 10,000 Tsh/wiki</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentTypeBtn, paymentType === 'full' && styles.paymentTypeBtnActive]}
                        onPress={() => setPaymentType('full')}
                    >
                        <Text style={[styles.btnTitle, paymentType === 'full' && styles.btnTitleActive]}>Full Payment</Text>
                    </TouchableOpacity>
                </View>

                {/* Sticky Checkout Action */}
                <View style={styles.checkoutActionContainer}>
                    <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                        <Text style={styles.checkoutBtnText}>
                            {paymentType === 'installment' ? 'Start Installment Plan' : 'Pay Full Amount'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
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
        fontSize: 18,
        fontWeight: 'bold', // Screenshot has bold header
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 20,
        marginBottom: 16,
    },
    // Cart Card
    cartCard: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB', // Or very light gray background if needed, screenshot looks white but card-like? No, screenshot is white background for section, but image has bg.
        // Actually screenshot: Image is in a light blue rounded square. 
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#EFF6FF', // Light blue background
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    productImage: {
        width: '90%',
        height: '90%',
    },
    detailsColumn: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 14,
        color: '#4A55A2', // Blueish per screenshot
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    tagContainer: {
        backgroundColor: '#DBEAFE', // Light blue tag
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 10,
        color: '#4A55A2',
        fontWeight: '500',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        padding: 4,
        gap: 12,
    },
    qtyBtn: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    qtyBtnActive: {
        backgroundColor: '#4A55A2', // Blue plus button
    },
    qtyText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    // Breakdown
    orderItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12, // Spacious
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    orderLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    orderValue: {
        fontSize: 14,
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6', // Very light divider
        marginVertical: 12,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    costLabel: {
        fontSize: 14,
        color: '#6B7280', // Gray
    },
    costValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 20, // Larger
        fontWeight: 'bold',
        color: '#1F2937',
    },
    // Footer
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    installmentBtn: {
        flex: 1,
        backgroundColor: '#059669', // Green
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    fullPayBtn: {
        flex: 1,
        backgroundColor: '#4A55A2', // Blue
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    btnTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    btnSubtitle: {
        color: '#FFFFFF',
        fontSize: 10,
        opacity: 0.9,
    },
    paymentTypeBtn: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    paymentTypeBtnActive: {
        backgroundColor: '#059669', // Green for installment default or active
        borderColor: '#059669',
    },
    btnTitleActive: {
        color: '#FFFFFF',
    },
    btnSubtitleActive: {
        color: 'rgba(255,255,255,0.9)',
    },
    checkoutActionContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    checkoutBtn: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: "#4A55A2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    checkoutBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
