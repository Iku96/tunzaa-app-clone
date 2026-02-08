import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

export default function AdminOverview() {
    const { user, setViewMode } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeGoals: 0,
        totalLocked: 0,
        todaysVolume: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            // In a real app, these would be RPC calls or specific admin queries
            // For now, we'll simulate aggregration or fetch basic counts if RLS permits (admin role)

            // 1. Total Users
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            // 2. Active Goals
            const { count: goalCount, data: goals } = await supabase
                .from('goals')
                .select('current_amount, created_at')
                .eq('status', 'saving');

            // 3. Calculate Total Locked
            const totalLocked = goals?.reduce((acc, g) => acc + (g.current_amount || 0), 0) || 0;

            // 4. Today's Volume (mock using created_at of goals for now, ideally transactions)
            const today = new Date().toISOString().split('T')[0];
            const todaysVolume = goals
                ?.filter(g => g.created_at?.startsWith(today))
                .reduce((acc, g) => acc + (g.current_amount || 0), 0) || 0;

            setStats({
                totalUsers: userCount || 0,
                activeGoals: goalCount || 0,
                totalLocked,
                todaysVolume
            });
        } catch (e) {
            console.error('Admin stats error:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>God Mode</Text>
                    <Text style={styles.headerSubtitle}>System Overview</Text>
                </View>
                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => {
                        setViewMode('buyer');
                        router.replace('/(buyer)');
                    }}
                >
                    <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.switchText}>View as User</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.grid}>
                <View style={styles.card}>
                    <MaterialIcons name="people-outline" size={24} color="#425BA4" />
                    <Text style={styles.cardValue}>{loading ? '...' : stats.totalUsers}</Text>
                    <Text style={styles.cardLabel}>Total Users</Text>
                </View>
                <View style={styles.card}>
                    <MaterialIcons name="track-changes" size={24} color="#22C55E" />
                    <Text style={styles.cardValue}>{loading ? '...' : stats.activeGoals}</Text>
                    <Text style={styles.cardLabel}>Active Goals</Text>
                </View>
                <View style={[styles.card, styles.cardWide]}>
                    <View style={styles.row}>
                        <MaterialIcons name="lock-outline" size={24} color="#F59E0B" />
                        <View>
                            <Text style={styles.cardLabel}>Total Value Locked (TVL)</Text>
                            <Text style={styles.cardValueLarge}>
                                TZS {loading ? '...' : stats.totalLocked.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Action Center */}
            <Text style={styles.sectionTitle}>Admin Actions</Text>
            <View style={styles.actionList}>
                <TouchableOpacity style={styles.actionRow}>
                    <View style={styles.actionIcon}>
                        <Ionicons name="notifications-outline" size={24} color="#4B5563" />
                    </View>
                    <Text style={styles.actionText}>Send Global Push Notification</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow}>
                    <View style={styles.actionIcon}>
                        <Ionicons name="pricetag-outline" size={24} color="#4B5563" />
                    </View>
                    <Text style={styles.actionText}>Manage Product Categories</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow}>
                    <View style={styles.actionIcon}>
                        <Ionicons name="shield-checkmark-outline" size={24} color="#4B5563" />
                    </View>
                    <Text style={styles.actionText}>Verify Merchant Accounts</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

            {/* Recent Activity Log (Placeholder) */}
            <Text style={styles.sectionTitle}>System Logs</Text>
            <View style={styles.logContainer}>
                <Text style={styles.logText}>[10:42 AM] New user registration: John Doe</Text>
                <Text style={styles.logText}>[10:38 AM] Payment received: TZS 50,000 (Order #123)</Text>
                <Text style={styles.logText}>[10:15 AM] Server load normal (12%)</Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    switchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    switchText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    card: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardWide: {
        minWidth: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 8,
    },
    cardValueLarge: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 4,
    },
    cardLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    actionList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 8,
        marginBottom: 32,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    logContainer: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
        marginBottom: 40,
    },
    logText: {
        fontFamily: 'Courier',
        color: '#10B981',
        fontSize: 12,
        marginBottom: 8,
    },
});
