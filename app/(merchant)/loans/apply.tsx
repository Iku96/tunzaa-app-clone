import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoanApplyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [amount, setAmount] = useState('');
    const [term, setTerm] = useState('');
    const [interestRate, setInterestRate] = useState('5.00');
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showOrderPicker, setShowOrderPicker] = useState(false);

    // Derived values
    const [monthlyPayment, setMonthlyPayment] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);

    useEffect(() => {
        const amt = parseFloat(amount) || 0;
        const t = parseInt(term) || 0;
        const rate = parseFloat(interestRate) || 0;

        if (amt > 0 && t > 0) {
            const interest = amt * (rate / 100) * t;
            setTotalInterest(interest);
            setMonthlyPayment((amt + interest) / t);
        } else {
            setTotalInterest(0);
            setMonthlyPayment(0);
        }
    }, [amount, term, interestRate]);

    const handleSubmit = () => {
        if (!amount || !term) {
            alert('Please fill in the required fields (Amount and Term).');
            return;
        }
        
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccessModal(true);
        }, 1500);
    };

    const orders = [
        { id: 'ORD-123', total: 150000, date: '2025-03-20' },
        { id: 'ORD-456', total: 500000, date: '2025-03-21' },
        { id: 'ORD-789', total: 200000, date: '2025-03-22' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Apply for a loan</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    
                    {/* Info Box */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>Please read and understand the terms before applying for loan</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Totals Interest: </Text>
                            <Text style={styles.infoValue}>Tsh 100.000 - Tsh 1,000,000</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Loan Terms: </Text>
                            <Text style={styles.infoValue}>Tsh 0.00</Text>
                        </View>
                    </View>

                    {/* Order Selector */}
                    <View style={styles.formGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Order</Text>
                            <Ionicons name="information-circle-outline" size={16} color="#4B5563" />
                        </View>
                        <TouchableOpacity 
                            style={styles.dropdown} 
                            onPress={() => setShowOrderPicker(true)}
                        >
                            <Text style={[styles.dropdownText, !selectedOrder && styles.placeholderText]}>
                                {selectedOrder || 'Select order'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    {/* Interest Rate */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Monthly Interest(%)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="5.00"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={interestRate}
                            onChangeText={setInterestRate}
                        />
                    </View>

                    {/* Loan Term */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Loan Term (months)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Loan term"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={term}
                            onChangeText={setTerm}
                        />
                    </View>

                    {/* Loan Amount */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Loan Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Loan amount"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>

                    {/* Summary Lines */}
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            Estimated Monthly Payment: <Text style={styles.summaryBold}>Tsh {monthlyPayment.toLocaleString()}</Text>
                        </Text>
                        <Text style={styles.summaryText}>
                            Totals Interest: <Text style={styles.summaryBold}>Tsh {totalInterest.toLocaleString()}</Text>
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.submitButton, (isSubmitting || !amount || !term) && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting || !amount || !term}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Order Picker Modal */}
            <Modal visible={showOrderPicker} transparent animationType="slide">
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerContent}>
                        <Text style={styles.pickerTitle}>Select an Order</Text>
                        {orders.map((o) => (
                            <TouchableOpacity 
                                key={o.id} 
                                style={styles.pickerItem}
                                onPress={() => { setSelectedOrder(o.id); setShowOrderPicker(false); }}
                            >
                                <Text style={styles.pickerItemText}>{o.id} - Tsh {o.total.toLocaleString()}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.closePicker} onPress={() => setShowOrderPicker(false)}>
                            <Text style={styles.closePickerText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.circleCheck}>
                            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
                        </View>
                        
                        <Text style={styles.modalTitle}>🎉Congratulations Femi!</Text>
                        
                        <Text style={styles.modalDescription}>
                            Your loan request has been submitted. We will review it and get back to you shortly.
                        </Text>
                        
                        <TouchableOpacity 
                            style={styles.modalPrimaryAction} 
                            onPress={() => { setShowSuccessModal(false); router.replace('/(merchant)/loans/requests'); }}
                        >
                            <Text style={styles.modalPrimaryActionText}>View Loan Requests</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        padding: 24,
    },
    infoCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#BFDBFE',
        marginBottom: 24,
    },
    infoText: {
        fontSize: 14,
        color: '#1E40AF',
        marginBottom: 12,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    infoValue: {
        fontSize: 15,
        color: '#6B7280',
    },
    formGroup: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginRight: 6,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
    },
    dropdownText: {
        fontSize: 16,
        color: '#111827',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    summaryContainer: {
        marginTop: 8,
        marginBottom: 32,
    },
    summaryText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    summaryBold: {
        color: '#111827',
    },
    submitButton: {
        backgroundColor: '#3B5998',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    /* Modal/Picker Styles */
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    pickerContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    pickerItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    pickerItemText: {
        fontSize: 16,
    },
    closePicker: {
        marginTop: 16,
        alignItems: 'center',
    },
    closePickerText: {
        color: '#EF4444',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        alignItems: 'center',
    },
    circleCheck: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#3B5998',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    modalPrimaryAction: {
        backgroundColor: '#3B5998',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
    },
    modalPrimaryActionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
