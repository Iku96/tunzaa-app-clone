import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DeliveryBottomNav from '../../src/components/navigation/DeliveryBottomNav';
import { useDeliveryContext } from '../../src/contexts/DeliveryContext';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';

export default function DeliveryProfileScreen() {
    const router = useRouter();
    const { history } = useDeliveryContext();
    const { user, logout } = useTunzaaAuth();

    // Top Tabs State - Defaulting to "Your Info" based on new screenshot
    const [activeTab, setActiveTab] = useState('Your Info');

    const handleLogout = async () => {
        await logout();
        router.replace('/(delivery)/delivery-login' as any); // Redirect to delivery login
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* Top Tabs: Your Info | History */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Your Info' && styles.activeTab]}
                        onPress={() => setActiveTab('Your Info')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Your Info' && styles.activeTabText]}>
                            Your Info
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'History' && styles.activeTab]}
                        onPress={() => setActiveTab('History')}
                    >
                        <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>
                            History
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'History' ? (
                        <View style={styles.historyContainer}>
                            {history.map((section: any, idx: number) => (
                                <View key={idx} style={styles.monthSection}>
                                    <Text style={styles.monthHeader}>{section.month}</Text>

                                    {section.data.map((item: any) => (
                                        <View key={item.id} style={styles.historyItem}>
                                            <Text style={styles.dateTimeText}>{item.date} • {item.time}</Text>

                                            <View style={styles.historyRow}>
                                                <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>

                                                <View style={styles.routeIndicator}>
                                                    <View style={styles.routeLine} />
                                                    <Ionicons name="bicycle" size={16} color="#000000" style={styles.routeIcon} />
                                                    <View style={styles.routeLine} />
                                                </View>

                                                <Text style={styles.customerName} numberOfLines={1}>{item.customerName}</Text>
                                            </View>

                                            <Text style={styles.amountText}>Tshs {item.amount}</Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.infoContainer}>
                            {/* Profile Info Items */}
                            <View style={styles.infoItem}>
                                <Ionicons name="person-outline" size={24} color="#000000" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Your Name</Text>
                                    <Text style={styles.infoValue}>{user ? `${user.first_name} ${user.last_name}` : 'Issa Said'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <Ionicons name="briefcase-outline" size={24} color="#000000" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Company</Text>
                                    <Text style={styles.infoValue}>Simba Couriers</Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <Ionicons name="bicycle-outline" size={24} color="#000000" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Vehicle</Text>
                                    <Text style={styles.infoValue}>MC 572 EDN</Text>
                                </View>
                            </View>

                            {/* Log out button */}
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Text style={styles.logoutButtonText}>Log out</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Navigation */}
                <DeliveryBottomNav />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF', // Transparent when inactive
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#425BA4', // Tunzaa blue
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#425BA4',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // Space for bottom nav
    },
    historyContainer: {
        paddingHorizontal: 20,
    },
    monthSection: {
        marginBottom: 40,
    },
    monthHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 16,
    },
    historyItem: {
        marginBottom: 24,
    },
    dateTimeText: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 6,
    },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    shopName: {
        flex: 1,
        fontSize: 13,
        color: '#000000',
        fontWeight: '500',
    },
    customerName: {
        flex: 1,
        fontSize: 13,
        color: '#000000',
        fontWeight: '500',
        textAlign: 'right',
    },
    routeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        width: 100, // Fixed width to keep everything aligned
    },
    routeLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    routeIcon: {
        paddingHorizontal: 6,
    },
    amountText: {
        fontSize: 13,
        color: '#000000',
        fontWeight: '400',
    },
    infoContainer: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    infoTextContainer: {
        marginLeft: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '400',
    },
    logoutButton: {
        backgroundColor: '#425BA4',
        borderRadius: 24,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60, // Push down below details
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    }
});
