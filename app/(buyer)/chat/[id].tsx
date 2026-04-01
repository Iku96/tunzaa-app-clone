import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_MESSAGES = [
    { id: '1', text: 'Hello! How can I help you today?', time: '10:00 AM', sender: 'vendor' },
    { id: '2', text: 'I am interested in the Samsung Galaxy product.', time: '10:05 AM', sender: 'user' },
    { id: '3', text: 'Great! It is still available. Would you like to know more about the installment plan?', time: '10:06 AM', sender: 'vendor' },
];

export default function ChatDetailScreen() {
    const { id, name: chatName } = useLocalSearchParams();
    const isSupport = id === 'support' || chatName?.toString().toLowerCase().includes('support');
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    
    const initialMessages = isSupport ? [
        { id: '1', text: 'Hello Khadija! How can I help you today?', time: '10:00 AM', sender: 'vendor' },
        { id: '2', text: 'I want to track my order #22345', time: '10:05 AM', sender: 'user' },
        { id: '3', text: 'Sure, your order is currently on route. You can view the real-time location in the tracking section.', time: '10:06 AM', sender: 'vendor' },
    ] : MOCK_MESSAGES;

    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');

    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        
        const newMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'user',
        };
        
        setMessages([...messages, newMessage]);
        setInputText('');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Chat Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{isSupport ? 'Tunzaa Support' : (chatName || 'Tunzaa shop')}</Text>
                        <View style={styles.statusRow}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.statusText}>Online</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="call-outline" size={20} color="#425BA4" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerIcon, { marginLeft: 12 }]}>
                        <Ionicons name="videocam-outline" size={22} color="#425BA4" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                ref={scrollViewRef}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                        <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.vendorWrapper]}>
                            <View style={[styles.bubble, isUser ? styles.userBubble : styles.vendorBubble]}>
                                <Text style={[styles.messageText, isUser ? styles.userText : styles.vendorText]}>
                                    {msg.text}
                                </Text>
                                <Text style={[styles.timeText, isUser ? styles.userTime : styles.vendorTime]}>
                                    {msg.time}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Ionicons name="add-circle-outline" size={28} color="#425BA4" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity 
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
                        onPress={handleSendMessage}
                        disabled={!inputText.trim()}
                    >
                        <Ionicons name="send" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray background to pop the bubbles
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerInfo: {
        justifyContent: 'center',
    },
    headerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#6B7280',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: 20,
        paddingBottom: 32,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: 20,
        maxWidth: '85%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
    },
    vendorWrapper: {
        alignSelf: 'flex-start',
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    userBubble: {
        backgroundColor: '#425BA4',
        borderBottomRightRadius: 4,
    },
    vendorBubble: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    userText: {
        color: '#FFFFFF',
    },
    vendorText: {
        color: '#1F2937',
    },
    timeText: {
        fontSize: 10,
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    userTime: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    vendorTime: {
        color: '#9CA3AF',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    attachBtn: {
        padding: 4,
    },
    input: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        marginHorizontal: 10,
        fontSize: 14,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#425BA4',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#425BA4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    sendBtnDisabled: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
        elevation: 0,
    },
});
