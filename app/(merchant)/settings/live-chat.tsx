import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, HelpCircle } from 'lucide-react-native';

export default function LiveChatScreen() {
    const router = useRouter();
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = () => {
        if (!description.trim()) {
            Alert.alert("Required", "Please describe your issue.");
            return;
        }

        setLoading(true);
        // Simulate sending
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                "Message Sent", 
                "We've received your message and will get back to you within 2 minutes.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Live Chat</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.subHeader}>Get response within 2 mins.</Text>
                    
                    <Text style={styles.introText}>
                        We are sorry for any inconveniences you may be experiencing, and we're here to help . 
                        Please descibe your issue below so we can have all the details .
                    </Text>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Description <Text style={{ color: '#3A5BA9' }}>*</Text></Text>
                            <HelpCircle size={16} color="#6B7280" style={{ marginLeft: 4 }} />
                        </View>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe your issues."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.sendButton, loading && styles.disabledButton]} 
                        onPress={handleSend}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.sendButtonText}>Send message</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        padding: 24,
    },
    subHeader: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 40,
    },
    introText: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 28,
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 40,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    textArea: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        height: 150,
        fontSize: 16,
        color: '#111827',
    },
    sendButton: {
        backgroundColor: '#3A5BA9',
        borderRadius: 30,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#D1D5DB',
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
