import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock Data
const MOCK_MESSAGES = [
    { id: '1', text: 'Thank you for your order! Let me know if you have any questions about your purchase.', sender: 'vendor', time: '2:35 PM' },
    { id: '2', text: 'Hi Michael, I was wondering about the estimated delivery time for my rubber order?', sender: 'me', time: '2:37 PM' },
    { id: '3', text: 'I\'ll be working on your custom piece tomorrow, and I\'ll shoot ship within 5-7 business days. I\'ll send you updates as I make progress!', sender: 'vendor', time: '2:40 PM' },
    { id: '4', text: 'That sounds great! I\'d love to see some progress photos if possible.', sender: 'me', time: '2:47 PM' },
];

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (inputText.trim()) {
            const newMessage = {
                id: Date.now().toString(),
                text: inputText,
                sender: 'me',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...messages, newMessage]);
            setInputText('');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.vendorInfo}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=500&auto=format&fit=crop&q=60' }}
                    style={styles.avatar}
                />
                <View>
                    <View style={styles.nameRow}>
                        <Text style={styles.vendorName}>Tunzaa shop</Text>
                        <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                    </View>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={12} color="#6B7280" />
                        <Text style={styles.location}>Sinza, Dar es salaam</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
            </TouchableOpacity>
        </View>
    );

    const renderMessage = ({ item }: { item: typeof MOCK_MESSAGES[0] }) => {
        const isMe = item.sender === 'me';
        return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                {!isMe && (
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=500&auto=format&fit=crop&q=60' }}
                        style={styles.msgAvatar}
                    />
                )}
                <View style={[styles.messageContent, isMe ? styles.myMessageContent : styles.theirMessageContent]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
                        {item.time}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messageList}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    vendorInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    vendorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 12,
        color: '#6B7280',
    },
    moreButton: {
        padding: 4,
    },
    messageList: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 16,
    },
    messageBubble: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    theirMessage: {
        justifyContent: 'flex-start',
    },
    msgAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
        backgroundColor: '#F3F4F6',
    },
    messageContent: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    myMessageContent: {
        backgroundColor: '#4A55A2',
        borderBottomRightRadius: 4,
    },
    theirMessageContent: {
        backgroundColor: '#F3F4F6',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    theirMessageText: {
        color: '#1F2937',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myMessageTime: {
        color: '#E0E7FF',
    },
    theirMessageTime: {
        color: '#9CA3AF',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    input: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        marginRight: 12,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4A55A2',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
