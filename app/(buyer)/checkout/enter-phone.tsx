import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function EnterPhoneScreen() {
    const router = useRouter();
    const { productId, amount, method } = useLocalSearchParams();
    const [phone, setPhone] = useState('');

    // Mock provider logo based on method
    const getProviderColor = () => {
        switch (method) {
            case 'mpesa': return '#DC2626';
            case 'airtel': return '#EF4444';
            case 'halopesa': return '#F97316';
            case 'tigo': return '#3B82F6';
            default: return '#1F2937';
        }
    };

    const getProviderName = () => {
        switch (method) {
            case 'mpesa': return 'M-Pesa';
            case 'airtel': return 'Airtel Money';
            case 'halopesa': return 'Halopesa';
            case 'tigo': return 'Tigo Pesa';
            default: return 'Card';
        }
    };


    const handlePayment = () => {
        if (!phone) {
            alert('Please enter phone number');
            return;
        }
        // Simulate payment processing then success
        setTimeout(() => {
            router.push({
                pathname: '/(buyer)/checkout/success',
                params: { productId }
            });
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Select your preferred payment</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <View style={styles.card}>
                        {/* Provider Header */}
                        <View style={styles.providerRow}>
                            <View style={[styles.iconBox, { backgroundColor: getProviderColor() }]}>
                                <Ionicons name="phone-portrait-outline" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={styles.providerName}>{getProviderName()}</Text>
                        </View>

                        {/* Summary */}
                        <Text style={styles.summaryText}>
                            You are about to pay <Text style={{ fontWeight: 'bold' }}>Tsh {new Intl.NumberFormat('en-US').format(Number(amount))}/=</Text> for the purchase of a Smart Watch Series 5.
                        </Text>

                        {/* Phone Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.prefix}>+255</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Phone number"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        {/* Action Button */}
                        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                            <Text style={styles.payButtonText}>Make a Payment</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Other options (Visual only based on screenshot) */}
                    <View style={styles.otherOptionsList}>
                        {['airtel', 'halopesa', 'tigo'].filter(m => m !== method).map((m) => (
                            <View key={m} style={styles.otherOption}>
                                <View style={[styles.miniIcon, { backgroundColor: m === 'airtel' ? '#EF4444' : m === 'halopesa' ? '#F97316' : '#3B82F6' }]}>
                                    <Ionicons name="wallet-outline" size={12} color="white" />
                                </View>
                                <Text style={styles.otherOptionText}>
                                    {m === 'airtel' ? 'Airtel Money' : m === 'halopesa' ? 'Halopesa' : 'Tigo Pesa'}
                                </Text>
                            </View>
                        ))}
                    </View>

                </ScrollView>
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
        marginBottom: 20,
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
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 20,
    },
    providerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    providerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    summaryText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        backgroundColor: '#F9FAFB',
    },
    prefix: {
        fontSize: 16,
        color: '#1F2937',
        marginRight: 8,
        fontWeight: '500',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    payButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: "#4A55A2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    otherOptionsList: {
        gap: 12,
    },
    otherOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    miniIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    otherOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
});
