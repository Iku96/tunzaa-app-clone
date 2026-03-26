import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LiveChatScreen() {
    const router = useRouter();
    const [description, setDescription] = useState('');

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Live Chat</Text>
                        <Text style={styles.headerSubtitle}>Get response within 2 mins.</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Text style={styles.introText}>
                        We are sorry for any inconveniences you may be experiencing, and we're here to help .
                        Please descibe your issue below so we can have all the details .
                    </Text>

                    <View style={styles.inputContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Description <Text style={styles.asterisk}>*</Text></Text>
                            <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
                        </View>

                        <TextInput
                            style={styles.textArea}
                            multiline
                            numberOfLines={6}
                            placeholder="Describe your issues."
                            placeholderTextColor="#6B7280"
                            value={description}
                            onChangeText={setDescription}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.sendButton, !description.trim() && styles.sendButtonDisabled]}
                        disabled={!description.trim()}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.sendButtonText}>Send message</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    content: {
        padding: 24,
    },
    introText: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 24,
        marginBottom: 48, // Large gap based on screenshot
    },
    inputContainer: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: '#4B5563',
        marginRight: 6,
    },
    asterisk: {
        color: '#3B82F6', // Blue asterisk matching screenshot
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 16,
        fontSize: 15,
        color: '#1F2937',
        minHeight: 120, // Tall input area matching screenshot
        backgroundColor: '#FFFFFF',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
    },
    sendButton: {
        backgroundColor: '#425BA4', // Theme blue
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#A5B4FC', // Lighter blue for disabled
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
