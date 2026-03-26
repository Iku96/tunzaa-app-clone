import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddressScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Address type selection
    const [addressType, setAddressType] = useState<'home' | 'work' | 'hotel'>('home');

    // If the map screen passed back a selected location
    const prefilledLocation = params.location ? String(params.location) : '';

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Where should we deliver your order?</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Text style={styles.sectionTitle}>Add New Address</Text>

                    {/* Address Type Selector */}
                    <View style={styles.typeSelectorRow}>
                        <TouchableOpacity
                            style={[styles.typeButton, addressType === 'home' && styles.typeButtonActive]}
                            onPress={() => setAddressType('home')}
                        >
                            <Ionicons
                                name="home"
                                size={16}
                                color={addressType === 'home' ? '#FFFFFF' : '#4B5563'}
                                style={styles.typeIcon}
                            />
                            <Text style={[styles.typeText, addressType === 'home' && styles.typeTextActive]}>Home</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.typeButton, addressType === 'work' && styles.typeButtonActive]}
                            onPress={() => setAddressType('work')}
                        >
                            <Ionicons
                                name="briefcase"
                                size={16}
                                color={addressType === 'work' ? '#FFFFFF' : '#4B5563'}
                                style={styles.typeIcon}
                            />
                            <Text style={[styles.typeText, addressType === 'work' && styles.typeTextActive]}>Work</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.typeButton, addressType === 'hotel' && styles.typeButtonActive]}
                            onPress={() => setAddressType('hotel')}
                        >
                            <Ionicons
                                name="business"
                                size={16}
                                color={addressType === 'hotel' ? '#FFFFFF' : '#4B5563'}
                                style={styles.typeIcon}
                            />
                            <Text style={[styles.typeText, addressType === 'hotel' && styles.typeTextActive]}>Hotel</Text>
                        </TouchableOpacity>

                        {/* Empty flex space to push buttons left */}
                        <View style={{ flex: 1 }} />
                    </View>

                    <Text style={styles.formSectionTitle}>Address Details</Text>

                    {/* Map Location Selector */}
                    <TouchableOpacity
                        style={styles.mapInputArea}
                        onPress={() => router.push('/(buyer)/checkout/delivery/map')}
                    >
                        <Ionicons name="search-outline" size={20} color="#6B7280" />
                        <Text style={[styles.mapInputText, !prefilledLocation && styles.mapInputPlaceholder]}>
                            {prefilledLocation || "172 Nda Mkojoma Road, Maki, Dar Es Salaam, TZ..."}
                        </Text>
                        <View style={styles.mapIconBox}>
                            <Ionicons name="map-outline" size={20} color="#425BA4" />
                        </View>
                    </TouchableOpacity>

                    {/* Text Inputs */}
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Street name"
                        placeholderTextColor="#9CA3AF"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter House No"
                        placeholderTextColor="#9CA3AF"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="City"
                        placeholderTextColor="#9CA3AF"
                    />

                    <Text style={styles.formSectionTitle}>Delivery Note <Text style={styles.requiredAsterisk}>*</Text></Text>

                    <TextInput
                        style={styles.textArea}
                        placeholder="e.g. Please leave at the door or knock instead of ringing the bell..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        // Once saved, proceed to order summary
                        onPress={() => router.push('/(buyer)/checkout/order-summary')}
                    >
                        <Text style={styles.saveButtonText}>Save Address</Text>
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
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 8,
    },
    backButton: {
        padding: 4,
        marginRight: 10,
    },
    headerTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    typeSelectorRow: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    typeButtonActive: {
        backgroundColor: '#425BA4',
        borderColor: '#425BA4',
    },
    typeIcon: {
        marginRight: 6,
    },
    typeText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4B5563',
    },
    typeTextActive: {
        color: '#FFFFFF',
    },
    formSectionTitle: {
        fontSize: 13,
        marginBottom: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    requiredAsterisk: {
        color: '#EF4444', // Red
    },
    mapInputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    mapInputText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#1F2937',
    },
    mapInputPlaceholder: {
        color: '#6B7280',
    },
    mapIconBox: {
        padding: 4,
        marginLeft: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 16,
    },
    textArea: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 14,
        color: '#1F2937',
        height: 100,
        marginBottom: 16,
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    },
    saveButton: {
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: "#425BA4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
