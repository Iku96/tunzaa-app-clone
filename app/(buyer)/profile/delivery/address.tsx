import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddDeliveryAddressScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [addressType, setAddressType] = useState<'home' | 'work' | 'hotel' | 'other'>('home');

    // Check if we came back from the map with a selected address
    const selectedMapAddress = params.address ? String(params.address) : '';

    const renderProgressStepper = () => (
        <View style={styles.stepperContainer}>
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                    <Ionicons name="checkmark" size={14} color="#425BA4" />
                </View>
                <Text style={[styles.stepText, styles.stepTextCompleted]}>STEP 1</Text>
                <Text style={styles.stepSubText}>Choose Method</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                    <Ionicons name="checkmark" size={14} color="#425BA4" />
                </View>
                <Text style={[styles.stepText, styles.stepTextCompleted]}>STEP 2</Text>
                <Text style={styles.stepSubText}>Choose courier</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                    <Ionicons name="document-text-outline" size={14} color="#425BA4" />
                </View>
                <Text style={[styles.stepText, styles.stepTextActive]}>STEP 3</Text>
                <Text style={styles.stepSubText}>Save address</Text>
            </View>
        </View>
    );

    const renderTypeBtn = (id: 'home' | 'work' | 'hotel' | 'other', icon: any, label: string) => (
        <TouchableOpacity
            style={[styles.typeBtn, addressType === id && styles.typeBtnActive]}
            onPress={() => setAddressType(id)}
        >
            <Ionicons
                name={icon}
                size={16}
                color={addressType === id ? "#FFFFFF" : "#4B5563"}
                style={styles.typeIcon}
            />
            <Text style={[styles.typeText, addressType === id && styles.typeTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Where should we deliver your order?</Text>
                    <View style={{ width: 24 }} />
                </View>

                {renderProgressStepper()}

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionTitle}>Add New Address</Text>

                    <View style={styles.typeRow}>
                        {renderTypeBtn('home', 'home-outline', 'Home')}
                        {renderTypeBtn('work', 'briefcase-outline', 'Work')}
                        {renderTypeBtn('hotel', 'business-outline', 'Hotel')}
                        {renderTypeBtn('other', 'ellipsis-horizontal', 'Other')}
                    </View>

                    <Text style={styles.formLabel}>Address Details</Text>
                    <TouchableOpacity
                        style={styles.mapSearchBtn}
                        onPress={() => router.push('/(buyer)/profile/delivery/map')}
                    >
                        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                        <Text style={[styles.mapSearchText, !selectedMapAddress && styles.mapSearchPlaceholder]}>
                            {selectedMapAddress || "772M+VJX Shoppers Plaza Masaki, Dar Es Salaam, TZ..."}
                        </Text>
                        <Ionicons name="map-outline" size={18} color="#425BA4" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter Street name"
                        placeholderTextColor="#9CA3AF"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter House No."
                        placeholderTextColor="#9CA3AF"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="City"
                        placeholderTextColor="#9CA3AF"
                    />

                    <Text style={styles.formLabel}>Delivery Note<Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="E.g., Please leave at the door or knock instead of ringing the bell"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => router.replace('/(buyer)/profile/delivery/saved')}
                    >
                        <Text style={styles.saveButtonText}>Save Address</Text>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 30,
    },
    step: {
        alignItems: 'center',
        width: 80,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    stepCircleActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#E0E7FF',
    },
    stepCircleCompleted: {
        backgroundColor: '#EEF2FF',
        borderColor: '#E0E7FF',
    },
    stepText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
        marginBottom: 2,
    },
    stepTextActive: {
        color: '#425BA4',
    },
    stepTextCompleted: {
        color: '#425BA4',
    },
    stepSubText: {
        fontSize: 9,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#F3F4F6',
        marginTop: -32,
    },
    stepLineActive: {
        backgroundColor: '#425BA4',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    typeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    typeBtnActive: {
        backgroundColor: '#425BA4',
        borderColor: '#425BA4',
    },
    typeIcon: {
        marginRight: 6,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4B5563',
    },
    typeTextActive: {
        color: '#FFFFFF',
    },
    formLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 12,
    },
    mapSearchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 16,
    },
    mapSearchText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#1F2937',
    },
    mapSearchPlaceholder: {
        color: '#9CA3AF',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 16,
    },
    textArea: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#1F2937',
        height: 100,
        marginBottom: 20,
    },
    footer: {
        padding: 24,
        paddingBottom: 34,
    },
    saveButton: {
        backgroundColor: '#425BA4',
        borderRadius: 30,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
