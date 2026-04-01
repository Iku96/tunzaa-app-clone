import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_CHATS = [
    {
        id: '1',
        name: 'Tunzaa shop',
        lastMessage: 'Thank you for your order! Let me...',
        time: '2:35 PM',
        unreadCount: 1,
        online: true,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/T-Mobile_Logo.svg/1000px-T-Mobile_Logo.svg.png'
    }
];

export default function ChatListScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('All chats');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recent Chats</Text>
                <TouchableOpacity style={styles.floatIcon}>
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#425BA4" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsWrapper}>
                {['All chats', 'Personal', 'Business'].map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabBtn, isActive && styles.activeTabBtn]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabBtnText, isActive && styles.activeTabBtnText]}>{tab}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {MOCK_CHATS.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="chatbubble-outline" size={32} color="#9CA3AF" />
                        </View>
                        <Text style={styles.emptyText}>Chart will appear here after you have sent or received a message</Text>
                    </View>
                ) : (
                    MOCK_CHATS.map((chat) => (
                        <TouchableOpacity
                            key={chat.id}
                            style={styles.chatItem}
                            onPress={() => router.push(`/(buyer)/chat/${chat.id}`)}
                        >
                            <View style={styles.imageWrapper}>
                                <Image source={{ uri: chat.image }} style={styles.chatImage} />
                                {chat.online && <View style={styles.onlineStatus} />}
                            </View>

                            <View style={styles.chatInfo}>
                                <View style={styles.chatRow}>
                                    <Text style={styles.chatName}>{chat.name}</Text>
                                    <Text style={styles.chatTime}>{chat.time}</Text>
                                </View>
                                <View style={styles.chatRow}>
                                    <Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
                                    {chat.unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
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
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    floatIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsWrapper: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
        marginTop: 12,
    },
    tabBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    activeTabBtn: {
        backgroundColor: '#425BA4',
    },
    tabBtnText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    activeTabBtnText: {
        color: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 40,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 16,
    },
    imageWrapper: {
        position: 'relative',
    },
    chatImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    chatInfo: {
        flex: 1,
    },
    chatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    chatTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    lastMessage: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
        marginRight: 12,
    },
    unreadBadge: {
        backgroundColor: '#425BA4',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
