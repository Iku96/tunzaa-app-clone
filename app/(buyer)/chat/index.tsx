import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useGetCustomerConversations, Conversation } from '../../../src/services/support';
import BottomNav from '../../../src/components/navigation/BottomNav';

const { width } = Dimensions.get('window');

export default function ChatListScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const [activeTab, setActiveTab] = useState('All chats');

    // Fetch real conversations from Chatwoot API
    const statusFilter = activeTab === 'Active' ? 'open' : activeTab === 'Resolved' ? 'resolved' : undefined;
    const { data: conversationsData, isLoading, refetch } = useGetCustomerConversations(
        { limit: 50, status: statusFilter },
        !!user?.user_id
    );

    const conversations = useMemo(() => {
        if (!conversationsData) return [];
        // Handle both response shapes
        if (conversationsData.data?.conversations) return conversationsData.data.conversations;
        if (Array.isArray(conversationsData)) return conversationsData;
        return [];
    }, [conversationsData]);

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours < 1) return `${Math.floor(diffMs / 60000)}m ago`;
            if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
            return date.toLocaleDateString();
        } catch {
            return '';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#22C55E';
            case 'pending': return '#F59E0B';
            case 'resolved': return '#9CA3AF';
            default: return '#3B5998';
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>Support Chats</Text>
                <TouchableOpacity
                    style={styles.newMessageButton}
                    onPress={() => {
                        // Navigate to create new support ticket if we have that screen
                        // For now, just show a hint
                    }}
                >
                    <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {['All chats', 'Active', 'Resolved'].map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderChatItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/(buyer)/chat/${item.id}`)}
        >
            <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="chatbubble-ellipses" size={22} color="#3B5998" />
                </View>
                <View style={[styles.onlineIndicator, { backgroundColor: getStatusColor(item.status) }]} />
            </View>

            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>{item.subject || 'Support Ticket'}</Text>
                    </View>
                    <Text style={styles.time}>{formatTime(item.updated_at)}</Text>
                </View>

                <View style={styles.messageRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.category || 'Tap to view conversation'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#425BA4" />
            </View>
            <Text style={styles.emptyTitle}>No conversations</Text>
            <Text style={styles.emptyText}>
                Your support chats will appear here once you contact a vendor or our support team.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
            {renderTabs()}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B5998" />
                    <Text style={styles.loadingText}>Loading conversations...</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        conversations.length === 0 && { flex: 1 }
                    ]}
                    ListEmptyComponent={renderEmptyState}
                    onRefresh={refetch}
                    refreshing={false}
                />
            )}
            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
        paddingTop: 10, marginBottom: 20,
    },
    backButton: { padding: 4, marginRight: 16 },
    titleContainer: {
        flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    newMessageButton: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E3A8A',
        justifyContent: 'center', alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 12,
    },
    tab: {
        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F3F4F6',
    },
    activeTab: { backgroundColor: '#1E3A8A' },
    tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    activeTabText: { color: '#FFFFFF' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 14, color: '#6B7280', marginTop: 12 },

    listContent: { flexGrow: 1 },
    chatItem: {
        flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
    },
    avatarContainer: { position: 'relative', marginRight: 14 },
    avatarPlaceholder: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF',
        justifyContent: 'center', alignItems: 'center',
    },
    onlineIndicator: {
        width: 12, height: 12, borderRadius: 6, position: 'absolute',
        bottom: 1, right: 1, borderWidth: 2, borderColor: '#FFFFFF',
    },
    chatContent: { flex: 1, justifyContent: 'center' },
    chatHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    name: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
    time: { fontSize: 12, color: '#9CA3AF' },
    messageRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    lastMessage: { fontSize: 13, color: '#6B7280', flex: 1, marginRight: 8 },
    statusBadge: {
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 80, height: 80, borderRadius: 24, backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 6 },
    emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
