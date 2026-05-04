import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetConversation, useGetMessages, useSendMessage, Message } from '@/src/services/support';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { format } from 'date-fns';

export default function VendorChatDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useTunzaaAuth();
    const [messageText, setMessageText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const { data: conversation, isLoading: convLoading } = useGetConversation(id);
    const { data: messages, isLoading: messagesLoading } = useGetMessages(id);
    const sendMutation = useSendMessage();

    const handleSend = async () => {
        if (!messageText.trim() || sendMutation.isPending) return;

        try {
            await sendMutation.mutateAsync({
                conversationId: id,
                content: messageText.trim(),
            });
            setMessageText('');
            // Scroll to bottom after sending
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.sender_id === user?.user_id;
        
        return (
            <View style={[styles.messageBubbleRow, isMe ? styles.messageBubbleRowRight : null]}>
                <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : null]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.messageTime, isMe ? styles.myMessageTime : null]}>
                        {format(new Date(item.created_at), 'h:mm a')}
                    </Text>
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.headerProfile}>
                <View style={styles.headerAvatarPlaceholder}>
                    <Ionicons name="person" size={20} color="#3B5998" />
                </View>
                <View style={styles.headerTextContainer}>
                    <View style={styles.headerNameRow}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {conversation?.subject || 'Customer'}
                        </Text>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />
                    </View>
                    <View style={styles.headerLocationRow}>
                        <Ionicons name="time-outline" size={12} color="#6B7280" />
                        <Text style={styles.headerSubtitle}>
                            {conversation?.category || 'Active Conversation'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {messagesLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B5998" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages || []}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.message_id}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={() => {
                            if (messages && messages.length > 0) {
                                flatListRef.current?.scrollToEnd({ animated: false });
                            }
                        }}
                    />
                )}

                <View style={styles.bottomContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.quickRepliesContainer}
                        contentContainerStyle={styles.quickRepliesContent}
                    >
                        {['Hello!', 'How can I help?', 'Your order is ready', 'Thank you!'].map((reply) => (
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
                            placeholder="Type a response..."
                            placeholderTextColor="#9CA3AF"
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            maxLength={1000}
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
    headerAvatarPlaceholder: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    headerTextContainer: { flex: 1 },
    headerNameRow: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    headerLocationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    headerSubtitle: { fontSize: 12, color: '#6B7280', marginLeft: 2 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messagesList: { paddingHorizontal: 16, paddingVertical: 12 },

    messageBubbleRow: { flexDirection: 'row', marginBottom: 16, justifyContent: 'flex-start' },
    messageBubbleRowRight: { justifyContent: 'flex-end' },

    messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
    myBubble: { backgroundColor: '#2D3E7B', borderBottomRightRadius: 4 },
    theirBubble: { backgroundColor: '#F9FAFB', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' },

    messageText: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
    myMessageText: { color: '#FFFFFF' },
    messageTime: { fontSize: 10, color: '#9CA3AF', marginTop: 6, textAlign: 'right' },
    myMessageTime: { color: 'rgba(255,255,255,0.7)' },

    bottomContainer: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 12 },
    quickRepliesContainer: { marginBottom: 12 },
    quickRepliesContent: { paddingHorizontal: 16, gap: 8 },
    quickReplyPill: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    quickReplyText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },

    inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16 },
    textInput: {
        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16,
        paddingVertical: 10, fontSize: 15, color: '#111827', maxHeight: 100, marginRight: 8,
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
    sendButtonDisabled: { backgroundColor: '#BFDBFE' },
});
