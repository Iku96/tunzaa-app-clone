import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTunzaaAuth } from '../../../../src/contexts/TunzaaAuthContext';
import { useGetBuyerProfile, useUpdateBuyerProfile } from '../../../../src/services/buyers';

export default function MyLocationScreen() {
    const router = useRouter();
    const { user } = useTunzaaAuth();
    
    const { data: profile, isLoading: profileLoading } = useGetBuyerProfile(user?.user_id || user?.id || '');
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateBuyerProfile();

    const savedAddresses = profile?.delivery_address || [];
    const defaultAddress = profile?.default_delivery_address;

    const handleDelete = (addressId: string) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedAddresses = savedAddresses.filter(addr => addr.address_id !== addressId);
                        updateProfile({
                            userId: user?.user_id || user?.id || '',
                            data: {
                                ...profile!,
                                delivery_address: updatedAddresses
                            }
                        });
                    }
                }
            ]
        );
    };

    const handleSetDefault = (addressLine: string) => {
        updateProfile({
            userId: user?.user_id || user?.id || '',
            data: {
                ...profile!,
                default_delivery_address: addressLine
            }
        });
    };

    const getIconForType = (type: string) => {
        const t = type.toLowerCase();
        if (t === 'home') return { name: 'home', color: '#425BA4', bg: '#EEF2FF' };
        if (t === 'work') return { name: 'briefcase', color: '#9333EA', bg: '#F5F3FF' };
        if (t === 'hotel') return { name: 'bed', color: '#10B981', bg: '#ECFDF5' };
        return { name: 'location', color: '#6B7280', bg: '#F3F4F6' };
    };

    if (profileLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#425BA4" />
                </View>
            </SafeAreaView>
        );
    }

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

                {savedAddresses.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="location-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No addresses saved yet</Text>
                    </View>
                ) : (
                    savedAddresses.map((item, index) => {
                        const iconInfo = getIconForType(item.title || 'Other');
                        const isDefault = defaultAddress === item.address_line1;
                        
                        return (
                            <View key={item.address_id || index} style={styles.addressCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.typeBox}>
                                        <View style={[styles.iconBox, { backgroundColor: iconInfo.bg }]}>
                                            <Ionicons name={iconInfo.name as any} size={16} color={iconInfo.color} />
                                        </View>
                                        <Text style={styles.typeText}>{item.title}</Text>
                                    </View>

                                    <View style={styles.actionRow}>
                                        <TouchableOpacity 
                                            style={styles.actionBtn}
                                            onPress={() => item.address_id && handleDelete(item.address_id)}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.actionBtn}
                                            onPress={() => router.push({
                                                pathname: '/(buyer)/profile/delivery/address',
                                                params: { 
                                                    id: item.address_id,
                                                    address: item.address_line1,
                                                    city: item.city,
                                                    note: item.land_mark
                                                }
                                            })}
                                        >
                                            <Ionicons name="create-outline" size={18} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.addressText}>{item.address_line1}, {item.city}</Text>

                                <TouchableOpacity
                                    style={styles.defaultRow}
                                    onPress={() => handleSetDefault(item.address_line1)}
                                    disabled={isUpdating}
                                >
                                    <Text style={styles.defaultText}>Set as default</Text>
                                    <View style={[styles.radioButton, isDefault && styles.radioButtonActive]}>
                                        {isDefault && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>

                                {/* Small Mini-map Indicator */}
                                <View style={styles.miniMap}>
                                    <Image
                                        source={{ uri: `https://images.unsplash.com/photo-1569336415962-a4bd9f67c07a?w=100&h=100&q=80` }}
                                        style={styles.miniMapImg}
                                        resizeMode="cover"
                                    />
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/(buyer)/profile/delivery/address')}
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
