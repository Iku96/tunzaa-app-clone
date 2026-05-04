import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateTicket } from '../../../src/services/support';
import * as Burnt from 'burnt';

export default function NewChatScreen() {
    const router = useRouter();
    const { vendorId } = useLocalSearchParams<{ vendorId: string }>();
    
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('general');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const categories = [
        { label: 'General Support', value: 'general' },
        { label: 'Order Inquiry', value: 'order' },
        { label: 'Product Question', value: 'product' },
        { label: 'Payment Issue', value: 'payment' },
        { label: 'Account Support', value: 'account' },
        { label: 'Technical Issue', value: 'technical' },
    ];

    const createTicketMutation = useCreateTicket();

    const handleCreate = async () => {
        if (!subject.trim() || !message.trim()) {
            Burnt.toast({ title: 'Please fill in all fields', preset: 'error' });
            return;
        }

        try {
            const result = await createTicketMutation.mutateAsync({
                subject: subject.trim(),
                initial_message: message.trim(),
                category: category,
                priority: 'medium',
                vendor_id: vendorId || undefined,
            });

            Burnt.toast({ title: 'Conversation started', preset: 'done' });
            
            // Redirect to the newly created chat
            if (result && result.id) {
                router.replace(`/(buyer)/chat/${result.id}`);
            } else {
                router.back();
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
            Burnt.toast({ title: 'Failed to start conversation', preset: 'error' });
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Start Conversation</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="What is this about?"
                            value={subject}
                            onChangeText={setSubject}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <TouchableOpacity 
                            style={styles.pickerButton} 
                            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                        >
                            <Text style={styles.pickerText}>
                                {categories.find(c => c.value === category)?.label || 'Select Category'}
                            </Text>
                            <Ionicons name={showCategoryPicker ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
                        </TouchableOpacity>
                        
                        {showCategoryPicker && (
                            <View style={styles.categoryList}>
                                {categories.map((cat) => (
                                    <TouchableOpacity 
                                        key={cat.value} 
                                        style={styles.categoryItem}
                                        onPress={() => {
                                            setCategory(cat.value);
                                            setShowCategoryPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.categoryText, category === cat.value && styles.activeCategoryText]}>
                                            {cat.label}
                                        </Text>
                                        {category === cat.value && <Ionicons name="checkmark" size={18} color="#2D3E7B" />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Type your first message..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.submitButton, createTicketMutation.isPending && styles.submitButtonDisabled]}
                        onPress={handleCreate}
                        disabled={createTicketMutation.isPending}
                    >
                        {createTicketMutation.isPending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>Start Chat</Text>
                                <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    content: { padding: 24 },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: {
        backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: 12, fontSize: 15, color: '#1F2937',
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    textArea: { height: 120, paddingTop: 12 },
    pickerButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: 12, borderWidth: 1, borderColor: '#F3F4F6',
    },
    pickerText: { fontSize: 15, color: '#1F2937' },
    categoryList: {
        marginTop: 8, backgroundColor: '#FFFFFF', borderRadius: 12,
        borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden',
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    categoryItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
    },
    categoryText: { fontSize: 14, color: '#4B5563' },
    activeCategoryText: { color: '#2D3E7B', fontWeight: 'bold' },
    submitButton: {
        backgroundColor: '#2D3E7B', borderRadius: 12, height: 56,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: 10,
    },
    submitButtonDisabled: { backgroundColor: '#93A5CF' },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
