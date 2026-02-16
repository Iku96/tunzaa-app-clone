import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock Data
const CHATS = [
    {
        id: '1',
        name: 'Tunzaa shop',
        verified: true,
        lastMessage: 'Thank you for your order! Let me know if you have any questions..',
        time: '2:30 PM',
        unread: 1,
        avatar: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=500&auto=format&fit=crop&q=60' // Mock logo
    },
    // Add more mock chats if needed for list state
];

export default function ChatListScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('All chats');

    // Simulate empty state for other tabs
    const chats = activeTab === 'All chats' ? CHATS : [];

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>Recent Chats</Text>
                <TouchableOpacity style={styles.newMessageButton}>
                    <Ionicons name="create-outline" size={20} color="#FFFFFF" />
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

    const renderChatItem = ({ item }: { item: typeof CHATS[0] }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/(buyer)/chat/${item.id}`)}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.name}</Text>
                        {item.verified && <Ionicons name="checkmark-circle" size={16} color="#22C55E" />}
                    </View>
                    <Text style={styles.time}>{item.time}</Text>
                </View>

                <View style={styles.messageRow}>
                    <Text style={[styles.lastMessage, item.unread > 0 && styles.unreadMessage]} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                    {item.unread > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#4A55A2" />
            </View>
            <Text style={styles.emptyText}>Chart will appear here after you have sent or received a message</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderTabs()}

            <FlatList
                data={chats}
                renderItem={renderChatItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
        marginRight: 16,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    newMessageButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1E3A8A', // Dark blue
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 12,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    activeTab: {
        backgroundColor: '#1E3A8A',
    },
    tabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    listContent: {
        flexGrow: 1,
    },
    chatItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
    },
    onlineIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22C55E',
        position: 'absolute',
        bottom: 2,
        right: 2,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    time: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
        marginRight: 8,
    },
    unreadMessage: {
        color: '#1F2937',
        fontWeight: '500',
    },
    unreadBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#1E3A8A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 100,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});
