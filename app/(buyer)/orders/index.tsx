import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../../../src/components/navigation/BottomNav';

const MOCK_PENDING = [
    {
        id: '1',
        name: 'Samsung Galaxy S22 - 6.6" - 12GB RAM - 64GB Sp...',
        date: '5/10/2021',
        nextInstallment: 250500,
        total: 1500000,
        progress: 20, // percentage
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=200',
        paymentDue: 350000,
    },
    {
        id: '2',
        name: 'LG Double Door Refrigerator - 340L - Silver...',
        date: '5/10/2021',
        nextInstallment: 300500,
        total: 1200000,
        progress: 40,
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=200',
        paymentDue: 300000,
    }
];

const MOCK_COMPLETED = [
    {
        id: '3',
        name: 'Gas One Portable Gas Stove',
        date: '1/10/2021',
        total: 35000,
        image: 'https://images.unsplash.com/photo-1590769352720-3b98ea8897bb?auto=format&fit=crop&q=80&w=200',
    }
];

export default function OrdersScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Pending');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US').format(price);
    };

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {['Pending', 'Completed', 'Gift cards'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, isActive && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderPendingCard = (item: typeof MOCK_PENDING[0]) => (
        <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/(buyer)/order/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productDate}>{item.date}</Text>
                </View>
            </View>

            <View style={styles.installmentRow}>
                <Text style={styles.installmentLabel}>Next installment :</Text>
                <Text style={styles.installmentValue}>Tsh {formatPrice(item.nextInstallment)}</Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{item.progress}%</Text>
            </View>

            <TouchableOpacity
                style={styles.payButton}
                onPress={() => router.push(`/(buyer)/order/${item.id}`)}
            >
                <Text style={styles.payButtonText}>pay Tsh {formatPrice(item.paymentDue)}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderCompletedCard = (item: typeof MOCK_COMPLETED[0]) => (
        <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/(buyer)/order/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productDate}>{item.date}</Text>
                </View>
            </View>

            <View style={[styles.installmentRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.installmentLabel}>Total paid :</Text>
                <Text style={[styles.installmentValue, { color: '#22C55E' }]}>Tsh {formatPrice(item.total)}</Text>
            </View>

            <View style={styles.completedBadgeRow}>
                <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
            </View>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order</Text>
                <View style={{ width: 24 }} />
            </View>

            {renderTabs()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'Pending' && MOCK_PENDING.map(renderPendingCard)}
                {activeTab === 'Completed' && MOCK_COMPLETED.map(renderCompletedCard)}
                {activeTab === 'Gift cards' && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No gift cards available</Text>
                    </View>
                )}
            </ScrollView>
            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: '#425BA4', // Theme blue for header
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 0,
        backgroundColor: '#425BA4',
        paddingBottom: 0,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#FFFFFF',
    },
    tabText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 110,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        resizeMode: 'contain',
        marginRight: 12,
    },
    productDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    productDate: {
        fontSize: 12,
        color: '#9CA3AF',
        alignSelf: 'flex-end',
    },
    installmentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        marginBottom: 12,
    },
    installmentLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    installmentValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#425BA4',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    payButton: {
        backgroundColor: '#425BA4',
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    completedBadgeRow: {
        alignItems: 'flex-end',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22C55E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    completedBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
});
