import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useGetCustomerConversations, Conversation } from '../../../src/services/support';
import BottomNav from '../../../src/components/navigation/BottomNav';
import { format, formatDistanceToNow, isToday } from 'date-fns';

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
            if (isToday(date)) {
                return format(date, 'h:mm a');
            }
            return formatDistanceToNow(date, { addSuffix: true });
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
                <Text style={styles.headerTitle}>Recent Chats</Text>
                <TouchableOpacity
                    style={styles.newMessageButton}
                    onPress={() => router.push('/(buyer)/chat/new')}
                >
                    <Ionicons name="chatbubble-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {['All chats', 'Personal', 'Business'].map((tab) => (
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
                        {item.status === 'open' && <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />}
                    </View>
                    <Text style={styles.time}>{formatTime(item.updated_at)}</Text>
                </View>

                <View style={styles.messageRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        <Ionicons name="checkmark-done" size={14} color="#9CA3AF" /> {item.category || 'Tap to view conversation'}
                    </Text>
                    {item.status === 'open' && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>1</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color="#3B5998" />
            </View>
            <Text style={styles.emptyText}>
                Chat will appear here after you have sent or received a message
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
        paddingTop: 10, marginBottom: 10,
    },
    backButton: { padding: 4, marginRight: 16 },
    titleContainer: {
        flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', fontFamily: 'Gilroy-Bold' },
    newMessageButton: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#2D3E7B',
        justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
    },
    fabIconContainer: { position: 'relative' },
    fabPlus: { position: 'absolute', top: -2, right: -4, fontWeight: 'bold' },
    tabsContainer: {
        flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10,
    },
    tab: {
        paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#FFFFFF',
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    activeTab: { backgroundColor: '#2D3E7B', borderColor: '#2D3E7B' },
    tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    activeTabText: { color: '#FFFFFF' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 14, color: '#6B7280', marginTop: 12 },

    listContent: { flexGrow: 1 },
    chatItem: {
        flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center',
    },
    avatarContainer: { position: 'relative', marginRight: 14 },
    avatarPlaceholder: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center',
    },
    onlineIndicator: {
        width: 12, height: 12, borderRadius: 6, position: 'absolute',
        bottom: 2, right: 2, borderWidth: 2, borderColor: '#FFFFFF',
    },
    chatContent: { flex: 1, justifyContent: 'center' },
    chatHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    name: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    time: { fontSize: 12, color: '#9CA3AF' },
    messageRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    lastMessage: { fontSize: 14, color: '#6B7280', flex: 1, marginRight: 8 },
    unreadBadge: {
        width: 22, height: 22, borderRadius: 11, backgroundColor: '#1E3A8A',
        justifyContent: 'center', alignItems: 'center',
    },
    unreadText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },

    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40,
    },
    emptyIconBox: {
        width: 120, height: 120, borderRadius: 30, backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    },
    emptyText: { fontSize: 16, color: '#374151', textAlign: 'center', lineHeight: 24, fontWeight: '500' },
});
