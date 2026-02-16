import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const PAYMENT_METHODS = [
    {
        id: 'card',
        name: 'Card Payment',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png', // Generic/Mastercard
        type: 'card'
    },
    {
        id: 'mpesa',
        name: 'M-Pesa',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png',
        type: 'mobile_money'
    },
    {
        id: 'airtel',
        name: 'Airtel Money',
        image: 'https://seeklogo.com/images/A/airtel-money-logo-52F3318E06-seeklogo.com.png',
        type: 'mobile_money'
    },
    {
        id: 'halopesa',
        name: 'Halopesa',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Halopesa_logo.png', // Placeholder or valid URL
        type: 'mobile_money'
    },
    {
        id: 'tigo',
        name: 'T-Pesa',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Tigo_logo.svg/1200px-Tigo_logo.svg.png',
        type: 'mobile_money'
    },
    {
        id: 'mix',
        name: 'Mix by Pesa',
        image: 'https://via.placeholder.com/40x40?text=Mix', // Placeholder
        type: 'other'
    }
];

export default function PaymentMethodScreen() {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelect = (method) => {
        setSelectedId(method.id);

        if (method.type === 'mobile_money') {
            // Navigate to payment input
            router.push('/(buyer)/checkout/payment-input');
        } else {
            // Handle card or other flows
            console.log('Selected:', method.name);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select your preferred payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {PAYMENT_METHODS.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={styles.methodCard}
                        onPress={() => handleSelect(method)}
                    >
                        <View style={styles.methodInfo}>
                            <View style={styles.iconContainer}>
                                <Image source={{ uri: method.image }} style={styles.methodImage} resizeMode="contain" />
                            </View>
                            <Text style={styles.methodName}>{method.name}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
        marginBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold', // Semi-bold looks better
        color: '#1F2937',
    },
    content: {
        paddingHorizontal: 20,
        gap: 16,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    methodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    methodImage: {
        width: 32,
        height: 32,
    },
    methodName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
});
