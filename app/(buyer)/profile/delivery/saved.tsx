import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyLocationScreen() {
    const router = useRouter();
    const [defaultAddressId, setDefaultAddressId] = useState('home');

    const savedAddresses = [
        {
            id: 'home',
            type: 'Home',
            icon: 'home',
            iconColor: '#425BA4',
            iconBg: '#EEF2FF',
            address: '772M+VJX Shoppers Plaza Masaki, Haile Selassie Rd, Dar',
        },
        {
            id: 'work',
            type: 'Work',
            icon: 'briefcase',
            iconColor: '#9333EA',
            iconBg: '#F5F3FF',
            address: '772M+VJX Shoppers Plaza Masaki, Haile Selassie Rd, Dar',
        },
        {
            id: 'hotel',
            type: 'Hotel',
            icon: 'bed',
            iconColor: '#10B981',
            iconBg: '#ECFDF5',
            address: '772M+VJX Shoppers Plaza Masaki, Haile Selassie Rd, Dar',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Location</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Save address</Text>

                {savedAddresses.map((item) => (
                    <View key={item.id} style={styles.addressCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.typeBox}>
                                <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                                    <Ionicons name={item.icon as any} size={16} color={item.iconColor} />
                                </View>
                                <Text style={styles.typeText}>{item.type}</Text>
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Ionicons name="create-outline" size={18} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.addressText}>{item.address}</Text>

                        <TouchableOpacity
                            style={styles.defaultRow}
                            onPress={() => setDefaultAddressId(item.id)}
                        >
                            <Text style={styles.defaultText}>Set as default</Text>
                            <View style={[styles.radioButton, defaultAddressId === item.id && styles.radioButtonActive]}>
                                {defaultAddressId === item.id && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>

                        {/* Small Mini-map Indicator */}
                        <View style={styles.miniMap}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f67c07a?w=100&h=100' }}
                                style={styles.miniMapImg}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/(buyer)/profile/delivery/method')}
                >
                    <Text style={styles.addButtonText}>Add New Address</Text>
                </TouchableOpacity>
            </View>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 20,
        marginBottom: 20,
    },
    addressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        padding: 16,
        marginBottom: 20,
        position: 'relative',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        padding: 4,
    },
    addressText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
        width: '75%',
        marginBottom: 16,
    },
    defaultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    defaultText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    radioButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonActive: {
        borderColor: '#425BA4',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#425BA4',
    },
    miniMap: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    miniMapImg: {
        width: '100%',
        height: '100%',
    },
    footer: {
        padding: 24,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    addButton: {
        backgroundColor: '#425BA4',
        borderRadius: 30,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
