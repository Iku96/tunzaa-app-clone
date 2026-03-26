import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, ArrowUpRight, LayoutGrid } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MOCK_TOP_PRODUCTS = [
    {
        id: '1',
        name: 'Samsung Galaxy A23',
        price: 'Tsh 150,000',
        commission: '15%',
        revenue: 'Tsh 200,000 revenue',
        sales: '142 sales',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=150&q=80',
    },
    {
        id: '2',
        name: 'LG Double Door Refrigerator..',
        price: 'Tsh 150,000',
        commission: '15%',
        revenue: 'Tsh 200,000 revenue',
        sales: '142 sales',
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=150&q=80',
    }
];

export default function AffiliateDashboardScreen() {
    const router = useRouter();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const handleBack = () => {
        router.push('/(buyer)' as any);
    };

    const handleWithdraw = () => {
        router.push('/(affiliate)/withdrawals' as any);
    };

    const handleViewOrders = () => {
        router.push('/(affiliate)/orders-sales' as any);
    };

    const handleProfile = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/profile' as any);
    };

    const handleInsights = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/customer-insights' as any);
    };

    const handleOrders = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/orders-sales' as any);
    };

    const handlePerformance = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/product-performance' as any);
    };

    const handleWithdrawals = () => {
        setIsMenuVisible(false);
        router.push('/(affiliate)/withdrawals' as any);
    };

    const toggleMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerIconBtn} onPress={toggleMenu}>
                    <LayoutGrid size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Date Filter */}
                <View style={styles.dateFilterWrapper}>
                    <View style={styles.dateFilterRow}>
                        <View style={styles.dateBadge}>
                            <Calendar size={14} color="#6B7280" />
                            <Text style={styles.dateBadgeText}>Jun 25, 2025</Text>
                        </View>
                        <Text style={styles.dateDash}>-</Text>
                        <View style={styles.dateBadge}>
                            <Calendar size={14} color="#6B7280" />
                            <Text style={styles.dateBadgeText}>Jun 30, 2025</Text>
                        </View>
                    </View>
                    <Text style={styles.reportSubtitle}>Report : Jun 20, 2025 - Jun 30, 2025</Text>
                </View>

                {/* Primary Card */}
                <View style={styles.primaryCard}>
                    <Text style={styles.cardHeader}>Total Earning Commission</Text>
                    <Text style={styles.cardValue}>Tsh.85,0000</Text>
                    
                    <View style={styles.increaseRow}>
                        <ArrowUpRight size={16} color="#10B981" />
                        <Text style={styles.increaseText}>20%Increase compare Last months</Text>
                    </View>

                    <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
                        <Text style={styles.withdrawBtnText}>Withdraw Fund</Text>
                    </TouchableOpacity>
                </View>

                {/* Secondary Cards */}
                <View style={styles.secondaryCardsRow}>
                    <View style={styles.secondaryCard}>
                        <Text style={styles.secondaryCardTitle}>Total Orders Placed</Text>
                        <Text style={styles.secondaryCardValue}>158</Text>
                        <TouchableOpacity style={styles.viewDetailsBtn} onPress={handleViewOrders}>
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.secondaryCard}>
                        <Text style={styles.secondaryCardTitle}>Total Completed Orders</Text>
                        <Text style={styles.secondaryCardValue}>129</Text>
                        <TouchableOpacity style={styles.viewDetailsBtn} onPress={handleViewOrders}>
                            <Text style={styles.viewDetailsText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Top Earning Products */}
                <Text style={styles.sectionTitle}>Top Earning Products</Text>
                
                <View style={styles.productsContainer}>
                    {MOCK_TOP_PRODUCTS.map((product, index) => (
                        <View key={product.id} style={[styles.productItem, index !== MOCK_TOP_PRODUCTS.length - 1 && styles.productItemBorder]}>
                            <View style={styles.productImageContainer}>
                                <Image source={{ uri: product.image }} style={styles.productImage} />
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                                <Text style={styles.productStats}>
                                    <Text style={styles.productPrice}>{product.price}</Text> • {product.commission} commission
                                </Text>
                                <Text style={styles.productStats}>
                                    <Text style={styles.productPrice}>{product.revenue}</Text> • {product.sales}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Navigation Menu Modal */}
            <Modal
                visible={isMenuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsMenuVisible(false)}
            >
                <Pressable 
                    style={styles.modalOverlay} 
                    onPress={() => setIsMenuVisible(false)}
                >
                    <View style={styles.menuContent}>
                        <Text style={styles.menuHeader}>Affiliate Actions</Text>
                        
                        <TouchableOpacity style={styles.menuItem} onPress={() => setIsMenuVisible(false)}>
                            <Ionicons name="stats-chart" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>My Dashboard (Earnings)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handlePerformance}>
                            <Ionicons name="cube" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>Product Performance</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleInsights}>
                            <Ionicons name="people" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>Customer Insights</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleOrders}>
                            <Ionicons name="cart" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>Orders and Sales</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleWithdrawals}>
                            <Ionicons name="cash" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>Withdrawal history</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
                            <Ionicons name="person" size={20} color="#3A5BA9" />
                            <Text style={styles.menuItemText}>My Profile</Text>
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setIsMenuVisible(false)}>
                            <Ionicons name="close-circle" size={20} color="#EF4444" />
                            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Close Menu</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
    },
    headerIconBtn: {
        padding: 8,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    dateFilterWrapper: {
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    dateFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    dateDash: {
        marginHorizontal: 8,
        color: '#6B7280',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dateBadgeText: {
        fontSize: 12,
        color: '#111827',
        marginLeft: 6,
        fontWeight: '500',
    },
    reportSubtitle: {
        fontSize: 11,
        color: '#6B7280',
    },
    primaryCard: {
        backgroundColor: '#3A5BA9',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    cardHeader: {
        color: '#E0E7FF',
        fontSize: 14,
        marginBottom: 8,
    },
    cardValue: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    increaseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    increaseText: {
        color: '#E0E7FF',
        fontSize: 12,
        marginLeft: 6,
    },
    withdrawBtn: {
        backgroundColor: '#2A4384',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4268C1',
    },
    withdrawBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    secondaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
        alignItems: 'center',
    },
    secondaryCardTitle: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
        textAlign: 'center',
    },
    secondaryCardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    viewDetailsBtn: {
        backgroundColor: '#059669',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    viewDetailsText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    productsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        paddingVertical: 10,
    },
    productItem: {
        flexDirection: 'row',
        padding: 16,
    },
    productItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    productImageContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginRight: 16,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    productStats: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    productPrice: {
        color: '#111827',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContent: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    menuHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
        marginLeft: 16,
    },
    menuDivider: {
        height: 1,
        width: '100%',
        backgroundColor: '#F3F4F6',
        marginVertical: 10,
    }
});
