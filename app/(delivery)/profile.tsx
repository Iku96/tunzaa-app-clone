/**
 * ============================================================================
 * DELIVERY PROFILE SCREEN
 * ============================================================================
 */

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

    const [activeTab, setActiveTab] = useState('Your Info');

    // Extract actual delivery profile data
    const deliveryProfile = user?.profiles?.find(p => p.role === 'delivery' || p.role === 'delivery_partner');

    /**
     * partnerName Resolution Logic:
     * 1. Check custom metadata (partner_name) - Set by our Edit screen.
     * 2. Check profile display_name - Set by backend/onboarding.
     * 3. Check base identity name - Last resort (Rick Sancho lives here).
     */
    const partnerName = deliveryProfile?.metadata?.partner_name ||
        deliveryProfile?.display_name ||
        user?.name ||
        `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
        'Delivery Partner';

    const companyName = deliveryProfile?.metadata?.business_name || 'Binafsi (Individual)';
    const vehicleInfo = deliveryProfile?.metadata?.vehicle_type || 'Not specified';

    const handleLogout = async () => {
        await logout();
        router.replace('/language');
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

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
                                                    <Ionicons name="bicycle" size={16} color="#000000" />
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
                            <View style={styles.infoItem}>
                                <Ionicons name="person-outline" size={24} color="#000000" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Your Name</Text>
                                    <Text style={styles.infoValue}>{partnerName}</Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <Ionicons name="briefcase-outline" size={24} color="#000000" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Company</Text>
                                    <Text style={styles.infoValue}>{companyName}</Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <Ionicons name="bicycle-outline" size={24} color="#000000" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Vehicle</Text>
                                    <Text style={styles.infoValue} style={{ textTransform: 'capitalize' }}>{vehicleInfo}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.logoutButton, { backgroundColor: '#F3F4F6', marginTop: 60, marginBottom: 16 }]}
                                onPress={() => router.push('/(delivery)/edit-profile')}
                            >
                                <Text style={[styles.logoutButtonText, { color: '#1F2937' }]}>Edit Profile</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.logoutButton, { marginTop: 0 }]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.logoutButtonText}>Log out</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                <DeliveryBottomNav />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
    tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#FFFFFF' },
    activeTab: { borderBottomWidth: 2, borderBottomColor: '#425BA4' },
    tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    activeTabText: { color: '#425BA4', fontWeight: '600' },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    historyContainer: { paddingHorizontal: 20 },
    monthSection: { marginBottom: 40 },
    monthHeader: { fontSize: 20, fontWeight: 'bold', color: '#000000', marginBottom: 16 },
    historyItem: { marginBottom: 24 },
    dateTimeText: { fontSize: 11, color: '#6B7280', marginBottom: 6 },
    historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    shopName: { flex: 1, fontSize: 13, color: '#000000', fontWeight: '500' },
    customerName: { flex: 1, fontSize: 13, color: '#000000', fontWeight: '500', textAlign: 'right' },
    routeIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: 100 },
    routeLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    amountText: { fontSize: 13, color: '#000000', fontWeight: '400' },
    infoContainer: { paddingHorizontal: 24, paddingTop: 10 },
    infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    infoTextContainer: { marginLeft: 16 },
    infoLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    infoValue: { fontSize: 14, color: '#000000', fontWeight: '400' },
    logoutButton: { backgroundColor: '#425BA4', borderRadius: 24, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' }
});