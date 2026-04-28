import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    TextInput, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';
import { useGetMessages, useSendMessage, useGetConversation, Message } from '../../../src/services/support';

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const userId = user?.user_id || '';

    const flatListRef = useRef<FlatList>(null);
    const [messageText, setMessageText] = useState('');

    // Fetch conversation details
    const { data: conversation } = useGetConversation(id || '', !!id);

    // Fetch messages with 5-second polling
    const { data: messages, isLoading: messagesLoading } = useGetMessages(id || '', !!id);

    // Send message mutation
    const sendMutation = useSendMessage();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 200);
        }
    }, [messages?.length]);

    const handleSend = async () => {
        if (!messageText.trim() || !id) return;

        const text = messageText.trim();
        setMessageText('');

        try {
            await sendMutation.mutateAsync({
                conversationId: id,
                content: text,
            });
        } catch (e) {
            console.error('❌ [Chat] Failed to send message:', e);
            setMessageText(text); // Restore on failure
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.sender_id === userId;
        return (
            <View style={[styles.messageBubbleRow, isMe && styles.messageBubbleRowRight]}>
                <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    {!isMe && (
                        <Text style={styles.senderLabel}>
                            {item.sender_type === 'agent' ? 'Support' : 'Vendor'}
                        </Text>
                    )}
                    <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
                        {formatTime(item.created_at)}
                    </Text>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>Send a message to start the conversation</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {conversation?.subject || 'Chat Support'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {conversation?.status === 'resolved' ? 'Resolved' : 'Active'}
                    </Text>
                </View>
                <View style={[
                    styles.statusDot,
                    { backgroundColor: conversation?.status === 'resolved' ? '#9CA3AF' : '#22C55E' }
                ]} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                {/* Messages */}
                {messagesLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B5998" />
                        <Text style={styles.loadingText}>Loading messages...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages || []}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.message_id}
                        contentContainerStyle={[
                            styles.messagesList,
                            (!messages || messages.length === 0) && { flex: 1 }
                        ]}
                        ListEmptyComponent={renderEmpty}
                        onContentSizeChange={() => {
                            if (messages && messages.length > 0) {
                                flatListRef.current?.scrollToEnd({ animated: false });
                            }
                        }}
                    />
                )}

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#9CA3AF"
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline
                        maxLength={1000}
                        editable={conversation?.status !== 'resolved'}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!messageText.trim() || sendMutation.isPending) && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!messageText.trim() || sendMutation.isPending}
                    >
                        {sendMutation.isPending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="send" size={18} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    },
    backButton: { padding: 4, marginRight: 12 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 1 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 14, color: '#6B7280', marginTop: 12 },

    messagesList: { paddingHorizontal: 16, paddingVertical: 12 },

    messageBubbleRow: { flexDirection: 'row', marginBottom: 8, justifyContent: 'flex-start' },
    messageBubbleRowRight: { justifyContent: 'flex-end' },

    messageBubble: { maxWidth: '78%', padding: 12, borderRadius: 16 },
    myBubble: {
        backgroundColor: '#3B5998', borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4,
        borderWidth: 1, borderColor: '#E5E7EB',
    },

    senderLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
    messageText: { fontSize: 15, color: '#1F2937', lineHeight: 20 },
    myMessageText: { color: '#FFFFFF' },
    messageTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4, textAlign: 'right' },
    myMessageTime: { color: 'rgba(255,255,255,0.7)' },

    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },

    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8,
        backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB',
    },
    textInput: {
        flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16,
        paddingVertical: 10, fontSize: 15, color: '#111827', maxHeight: 100, marginRight: 8,
    },
    sendButton: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#3B5998',
        justifyContent: 'center', alignItems: 'center',
    },
    sendButtonDisabled: { backgroundColor: '#93A5CF' },
});
