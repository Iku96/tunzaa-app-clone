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
import { format } from 'date-fns';

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
            return format(new Date(dateString), 'h:mm a');
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
                <View style={styles.headerProfile}>
                    <View style={styles.headerAvatarContainer}>
                        <View style={styles.headerAvatarPlaceholder}>
                            <Ionicons name="business" size={20} color="#3B5998" />
                        </View>
                    </View>
                    <View style={styles.headerTextContainer}>
                        <View style={styles.headerNameRow}>
                            <Text style={styles.headerTitle} numberOfLines={1}>
                                {conversation?.subject || 'Tunzaa shop'}
                            </Text>
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />
                        </View>
                        <View style={styles.headerLocationRow}>
                            <Ionicons name="location-outline" size={12} color="#6B7280" />
                            <Text style={styles.headerSubtitle}>
                                {conversation?.category || 'Kinondoni, Dar es salaam'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                        ListHeaderComponent={messages && messages.length > 0 ? (
                            <View style={styles.dateSeparator}>
                                <View style={styles.datePill}>
                                    <Text style={styles.dateText}>Today, 2:35 PM</Text>
                                </View>
                            </View>
                        ) : null}
                        onContentSizeChange={() => {
                            if (messages && messages.length > 0) {
                                flatListRef.current?.scrollToEnd({ animated: false });
                            }
                        }}
                    />
                )}

                {/* Input Bar & Quick Replies */}
                <View style={styles.bottomContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.quickRepliesContainer}
                        contentContainerStyle={styles.quickRepliesContent}
                    >
                        {['Thank you!', 'When will it ship?', 'Can I modify my order?'].map((reply) => (
                            <TouchableOpacity 
                                key={reply} 
                                style={styles.quickReplyPill}
                                onPress={() => setMessageText(reply)}
                            >
                                <Text style={styles.quickReplyText}>{reply}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Write a message..."
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
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    backButton: { padding: 4, marginRight: 8 },
    headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    headerAvatarContainer: { marginRight: 12 },
    headerAvatarPlaceholder: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTextContainer: { flex: 1 },
    headerNameRow: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', fontFamily: 'Gilroy-Bold' },
    headerLocationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    headerSubtitle: { fontSize: 12, color: '#6B7280', marginLeft: 2 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 14, color: '#6B7280', marginTop: 12 },

    messagesList: { paddingHorizontal: 16, paddingVertical: 12 },

    dateSeparator: { alignItems: 'center', marginVertical: 20 },
    datePill: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    dateText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

    messageBubbleRow: { flexDirection: 'row', marginBottom: 16, justifyContent: 'flex-start' },
    messageBubbleRowRight: { justifyContent: 'flex-end' },

    messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
    myBubble: {
        backgroundColor: '#2D3E7B', borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: '#F9FAFB', borderBottomLeftRadius: 4,
        borderWidth: 1, borderColor: '#F3F4F6',
    },

    senderLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
    messageText: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
    myMessageText: { color: '#FFFFFF' },
    messageTime: { fontSize: 10, color: '#9CA3AF', marginTop: 6, textAlign: 'right' },
    myMessageTime: { color: 'rgba(255,255,255,0.7)' },

    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },

    bottomContainer: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 12 },
    quickRepliesContainer: { marginBottom: 12 },
    quickRepliesContent: { paddingHorizontal: 16, gap: 8 },
    quickReplyPill: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    quickReplyText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },

    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16,
    },
    textInput: {
        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16,
        paddingVertical: 10, fontSize: 15, color: '#111827', maxHeight: 100, marginRight: 8,
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    sendButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B82F6',
        justifyContent: 'center', alignItems: 'center',
    },
    sendButtonDisabled: { backgroundColor: '#BFDBFE' },
});
