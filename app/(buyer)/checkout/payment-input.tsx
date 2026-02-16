import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock Selected Method (In real app, pass via params or context)
const SELECTED_METHOD = {
    id: 'mpesa',
    name: 'M-Pesa',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png',
};

export default function PaymentInputScreen() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('125,000'); // Mock amount

    const handlePayment = () => {
        // Here we would typically show the PIN modal or navigate to a PIN screen
        // For this flow, let's simulate the PIN entry via a modal in this screen or a separate screen 
        // consistent with the "PaymentModal" we built earlier.
        // However, the design shows a specific PIN popup. Let's redirect to a success state or back to order details.

        // For now, let's go to the order details to simulate completion
        // In a real app, this would trigger the USSD push or similar
        router.push('/(buyer)/orders/sales-order-id'); // navigating to order details
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

            <View style={styles.content}>

                {/* Method Card */}
                <View style={styles.methodCard}>
                    <Image source={{ uri: SELECTED_METHOD.image }} style={styles.methodImage} resizeMode="contain" />
                    <Text style={styles.methodName}>{SELECTED_METHOD.name}</Text>
                </View>

                <Text style={styles.infoText}>
                    You are about to pay <Text style={styles.boldText}>{amount}</Text> on Tunzaa for the purchase of a <Text style={styles.boldText}>Nike Air Jordan Series 3</Text>.
                </Text>

                <Text style={styles.label}>Phone</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.countryCode}>+255</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Phone number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                    <Text style={styles.payButtonText}>Make a Payment</Text>
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
        paddingTop: 10,
        marginBottom: 30,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        paddingHorizontal: 24,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    methodImage: {
        width: 40,
        height: 40,
        marginRight: 16,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
        marginBottom: 32,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 32,
    },
    countryCode: {
        fontSize: 16,
        color: '#374151',
        marginRight: 12,
        fontWeight: '500',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    payButton: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
