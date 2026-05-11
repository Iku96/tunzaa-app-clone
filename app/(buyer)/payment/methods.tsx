import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

const PAYMENT_METHODS = [
    { id: 'card', name: 'Card Payment (Visa/Mastercard)', type: 'card', icon: require('@/assets/images/payment/visa.png') }, 
    { id: 'mpesa', name: 'M-Pesa', type: 'mobile', icon: require('@/assets/images/payment/mpesa.jpeg') },
    { id: 'tigopesa', name: 'Tigo-Pesa', type: 'mobile', icon: require('@/assets/images/payment/tigopesa.png') },
    { id: 'airtel', name: 'Airtel Money', type: 'mobile', icon: require('@/assets/images/payment/airtel.png') },
    { id: 'halopesa', name: 'Halopesa', type: 'mobile', icon: require('@/assets/images/payment/halopesa.png') },
    { id: 'nmb', name: 'NMB Bank', type: 'bank', icon: require('@/assets/images/placeholder.png') },
    { id: 'crdb', name: 'CRDB Bank', type: 'bank', icon: require('@/assets/images/placeholder.png') },
];

export default function PaymentMethodsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const handleSelectMethod = (methodId: string) => {
        if (methodId === 'card') {
            router.push({
                pathname: '/(buyer)/payment/card',
                params: { ...params }
            });
            return;
        }
        
        // Pass the chosen sub-method and go to phone entry
        router.push({
            pathname: '/(buyer)/payment/phone',
            params: {
                ...params,
                selectedNetwork: methodId
            }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select your preferred payment</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.subtitle}>Choose the way to pay for your service.</Text>

                {PAYMENT_METHODS.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={styles.methodCard}
                        onPress={() => handleSelectMethod(method.id)}
                    >
                        <View style={styles.methodLeft}>
                            <View style={styles.iconContainer}>
                                <Image source={method.icon} style={styles.methodIcon} />
                            </View>
                            <Text style={styles.methodName}>{method.name}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        marginBottom: 24,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginBottom: 12,
    },
    methodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        // In real app, you'd add subtle shadow here
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    methodIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
});
