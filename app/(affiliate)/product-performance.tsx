import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Filter, ArrowUpDown } from 'lucide-react-native';

const MOCK_PERFORMANCE = [
    {
        id: '1',
        name: 'LG Double Door..',
        status: 'out of stock',
        buyers: '30',
        orders: '12',
        commission: 'Tsh 500,000',
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=150&q=80',
        action: 'Current unavailable',
    },
    {
        id: '2',
        name: 'LG Double Door..',
        status: 'Low stock',
        buyers: '30',
        orders: '12',
        commission: 'Tsh 450,000',
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=150&q=80',
        action: 'Reselling Again',
    },
    {
        id: '3',
        name: 'Samsung Galaxy A23',
        status: 'In stock',
        buyers: '30',
        orders: '12',
        commission: 'Tsh 350,000',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=150&q=80',
    }
];

export default function ProductPerformanceScreen() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'out of stock':
                return { bg: '#FEE2E2', text: '#EF4444' };
            case 'low stock':
                return { bg: '#FEF3C7', text: '#D97706' };
            case 'in stock':
                return { bg: '#F0F4FC', text: '#3A5BA9' };
            default:
                return { bg: '#F3F4F6', text: '#6B7280' };
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Product Performance</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Monthly Overview Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Monthly Overview</Text>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateBadgeText}>Aug 2025</Text>
                        </View>
                    </View>

                    <View style={styles.cardStatsRow}>
                        <View style={styles.cardStatItem}>
                            <Text style={styles.cardStatLabel}>Total product</Text>
                            <Text style={styles.cardStatValue}>129</Text>
                        </View>
                        <View style={styles.cardStatItem}>
                            <Text style={styles.cardStatLabel}>Total commission</Text>
                            <Text style={styles.cardStatValue}>Tzs 10,000.</Text>
                        </View>
                    </View>
                </View>

                {/* Filter/Sort Buttons */}
                <View style={styles.toolsRow}>
                    <TouchableOpacity style={styles.toolBtn}>
                        <Filter size={18} color="#111827" />
                        <Text style={styles.toolBtnText}>Filter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn}>
                        <ArrowUpDown size={18} color="#111827" />
                        <Text style={styles.toolBtnText}>sort</Text>
                    </TouchableOpacity>
                </View>

                {/* Product List */}
                <View style={styles.productList}>
                    {MOCK_PERFORMANCE.map((item) => {
                        const colors = getStatusStyles(item.status);
                        return (
                            <View key={item.id} style={styles.productCard}>
                                <View style={styles.productTopRow}>
                                    <View style={styles.productImageContainer}>
                                        <Image source={{ uri: item.image }} style={styles.productImage} />
                                    </View>
                                    <View style={styles.productMainInfo}>
                                        <View style={styles.productTitleRow}>
                                            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                                            <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                                                <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.productStatsRow}>
                                            <View style={styles.smallStat}>
                                                <Text style={styles.smallStatValue}>{item.buyers}</Text>
                                                <Text style={styles.smallStatLabel}>Buyers</Text>
                                            </View>
                                            <View style={styles.smallStat}>
                                                <Text style={styles.smallStatValue}>{item.orders}</Text>
                                                <Text style={styles.smallStatLabel}>Orders</Text>
                                            </View>
                                            <View style={styles.smallStat}>
                                                <Text style={styles.smallStatValue}>{item.commission}</Text>
                                                <Text style={styles.smallStatLabel}>Commission</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {item.action && (
                                    <TouchableOpacity 
                                        style={[
                                            styles.actionBtn, 
                                            item.action === 'Current unavailable' && styles.actionBtnDisabled
                                        ]}
                                        disabled={item.action === 'Current unavailable'}
                                    >
                                        <Text style={[
                                            styles.actionBtnText,
                                            item.action === 'Current unavailable' && styles.actionBtnTextDisabled
                                        ]}>
                                            {item.action}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    overviewCard: {
        backgroundColor: '#4268C1',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    dateBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    dateBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    cardStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardStatItem: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
    },
    cardStatLabel: {
        fontSize: 12,
        color: '#E0E7FF',
        marginBottom: 8,
    },
    cardStatValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    toolsRow: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    toolBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        borderRadius: 12,
    },
    toolBtnText: {
        fontSize: 14,
        color: '#111827',
        marginLeft: 8,
        fontWeight: '500',
    },
    productList: {
        gap: 16,
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    productTopRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productImageContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginRight: 16,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productMainInfo: {
        flex: 1,
    },
    productTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    productStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallStat: {
        alignItems: 'center',
    },
    smallStatValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    smallStatLabel: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    actionBtn: {
        backgroundColor: '#3A5BA9',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionBtnDisabled: {
        backgroundColor: '#F3F4F6',
    },
    actionBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    actionBtnTextDisabled: {
        color: '#9CA3AF',
    }
});
