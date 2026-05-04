import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronDown, Info, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetLoanProviders, useSubmitLoanRequest, LoanProvider } from '@/src/services/loans';
import { useGetVendorOrders } from '@/src/services/orders';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';

export default function LoanApplyScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { id, providerId } = useLocalSearchParams<{ id: string; providerId: string }>();
    const { user, activeProfile } = useTunzaaAuth();
    
    // Fetch Data
    const { data: providers } = useGetLoanProviders(id as string);
    const selectedProvider = useMemo(() => 
        providers?.find(p => p.id === providerId), 
    [providers, providerId]);

    const { data: vendorOrders } = useGetVendorOrders({ 
        vendor_id: activeProfile?.profileId || '',
        limit: 20
    });

    const submitLoanMutation = useSubmitLoanRequest();

    // Form State
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [loanTerm, setLoanTerm] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [rawLoanAmount, setRawLoanAmount] = useState('');
    const [monthlyInterest, setMonthlyInterest] = useState('');
    const [agreedToProvider, setAgreedToProvider] = useState(false);
    const [agreedToTunzaa, setAgreedToTunzaa] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Sync interest from provider
    useEffect(() => {
        if (selectedProvider?.monthly_interest) {
            setMonthlyInterest(selectedProvider.monthly_interest);
        }
    }, [selectedProvider]);

    // Derived values
    const interestRate = parseFloat(monthlyInterest || '0') / 100;
    const principal = parseFloat(rawLoanAmount) || 0;
    const termMonths = parseInt(loanTerm) || 0;

    const totalInterest = principal * interestRate * termMonths;
    const totalPayment = principal + totalInterest;
    const monthlyPayment = termMonths > 0 ? totalPayment / termMonths : 0;

    const formatCurrency = (amount: number) => {
        return `Tsh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatInputNumber = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        setRawLoanAmount(cleaned);
        if (!cleaned) return '';
        return parseInt(cleaned).toLocaleString();
    };

    const isAmountValid = useMemo(() => {
        if (!rawLoanAmount) return true;
        const val = parseFloat(rawLoanAmount);
        return val >= (selectedProvider?.min_amount || 0) && val <= (selectedProvider?.max_amount || 0);
    }, [rawLoanAmount, selectedProvider]);

    const handleApply = async () => {
        if (!agreedToProvider || !agreedToTunzaa || !rawLoanAmount || !loanTerm || !selectedOrderId || !isAmountValid) {
            return;
        }

        try {
            await submitLoanMutation.mutateAsync({
                productId: id,
                providerId,
                orderId: selectedOrderId,
                term: loanTerm,
                amount: rawLoanAmount,
                totalInterest,
                totalPayment,
                monthlyPayment
            });
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Failed to submit loan request:', error);
        }
    };

    const isFormValid = agreedToProvider && agreedToTunzaa && rawLoanAmount && loanTerm && selectedOrderId && isAmountValid;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Apply for a loan</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView 
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            Please read and understand the terms before applying for loan
                        </Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Totals Interest: </Text>
                            <Text style={styles.infoValue}>
                                {formatCurrency(selectedProvider?.min_amount || 100000)} - {formatCurrency(selectedProvider?.max_amount || 1000000)}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Loan Terms: </Text>
                            <Text style={styles.infoValue}>Tsh 0.00</Text>
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Order</Text>
                                <Info size={16} color="#6B7280" />
                            </View>
                            <Select onValueChange={(opt) => setSelectedOrderId(opt?.value || '')}>
                                <SelectTrigger style={styles.selectTrigger}>
                                    <SelectValue placeholder="Select order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {vendorOrders?.items.map(order => (
                                            <SelectItem key={order.order_id} value={order.order_id} label={`Order #${order.order_number}`}>
                                                Order #{order.order_number}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Monthly Interest(%)</Text>
                            <Input 
                                value={monthlyInterest} 
                                onChangeText={setMonthlyInterest}
                                keyboardType="numeric"
                                style={styles.customInput}
                            />
                        </View>

                        {!isAmountValid && (
                            <Text style={styles.errorText}>
                                The loan amount should be between {selectedProvider?.min_amount.toLocaleString()} and {selectedProvider?.max_amount.toLocaleString()}.
                            </Text>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Loan Term (months)</Text>
                            <Input 
                                placeholder="Loan term"
                                keyboardType="numeric"
                                value={loanTerm}
                                onChangeText={setLoanTerm}
                                style={styles.customInput}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Loan Amount</Text>
                            <Input 
                                placeholder="Loan amount"
                                keyboardType="numeric"
                                value={loanAmount}
                                onChangeText={(text) => setLoanAmount(formatInputNumber(text))}
                                style={styles.customInput}
                            />
                        </View>
                    </View>

                    {/* Calculations Summary */}
                    <View style={styles.calculationSection}>
                        <View style={styles.calcRow}>
                            <Text style={styles.calcLabel}>Estimated Monthly Payment:</Text>
                            <Text style={styles.calcValue}>{formatCurrency(monthlyPayment)}</Text>
                        </View>
                        <View style={styles.calcRow}>
                            <Text style={styles.calcLabel}>Totals Interest:</Text>
                            <Text style={styles.calcValue}>{formatCurrency(totalInterest)}</Text>
                        </View>
                        <View style={styles.calcRow}>
                            <Text style={styles.calcLabel}>Totals payments:</Text>
                            <Text style={styles.calcValue}>{formatCurrency(totalPayment)}</Text>
                        </View>
                    </View>

                    {/* Checkboxes */}
                    <View style={styles.checkboxSection}>
                        <View style={styles.checkboxRow}>
                            <Checkbox 
                                checked={agreedToProvider} 
                                onCheckedChange={setAgreedToProvider}
                            />
                            <Text style={styles.checkboxText}>
                                I agree to the <Text style={styles.linkText}>Terms and Conditions of the Loan Company</Text>
                            </Text>
                        </View>
                        <View style={styles.checkboxRow}>
                            <Checkbox 
                                checked={agreedToTunzaa} 
                                onCheckedChange={setAgreedToTunzaa}
                            />
                            <Text style={styles.checkboxText}>
                                I agree to <Text style={styles.linkText}>Tunzaa Terms and conditions</Text>, I consent to the collection and processing of my KYC information
                            </Text>
                        </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity 
                        style={[styles.applyButton, !isFormValid && styles.applyButtonDisabled]}
                        onPress={handleApply}
                        disabled={!isFormValid || submitLoanMutation.isPending}
                    >
                        {submitLoanMutation.isPending ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.applyButtonText}>Apply</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.successIconContainer}>
                             <View style={styles.iconCircle}>
                                <CheckCircle2 size={48} color="#425BA4" />
                             </View>
                        </View>
                        
                        <Text style={styles.modalTitle}>🎉Congratulations {user?.firstName}!</Text>
                        <Text style={styles.modalSubtitle}>
                            Your loan request has been submitted. We will review it and get back to you shortly.
                        </Text>
                        
                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={() => {
                                setShowSuccessModal(false);
                                router.replace('/(vendor)');
                            }}
                        >
                            <Text style={styles.modalButtonText}>Back to Dashboard</Text>
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
        height: 60,
        paddingHorizontal: 8,
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    infoBox: {
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    infoText: {
        fontSize: 13,
        color: '#374151',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    infoValue: {
        fontSize: 14,
        color: '#6B7280',
    },
    formSection: {
        gap: 20,
        marginBottom: 24,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    selectTrigger: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        borderRadius: 8,
        height: 52,
    },
    customInput: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        borderRadius: 8,
        color: '#111827',
    },
    readOnlyInput: {
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: -12,
        marginBottom: 12,
    },
    calculationSection: {
        gap: 12,
        marginBottom: 24,
    },
    calcRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    calcLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    calcValue: {
        fontSize: 15,
        color: '#111827',
    },
    checkboxSection: {
        gap: 16,
        marginBottom: 32,
    },
    checkboxRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    checkboxText: {
        fontSize: 13,
        color: '#4B5563',
        flex: 1,
        lineHeight: 18,
    },
    linkText: {
        color: '#425BA4',
        textDecorationLine: 'underline',
    },
    applyButton: {
        backgroundColor: '#425BA4',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    applyButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        alignItems: 'center',
    },
    successIconContainer: {
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalSubtitle: {
        fontSize: 15,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    modalButton: {
        backgroundColor: '#425BA4',
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 40,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    }
});
