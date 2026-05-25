import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Image, Platform, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useCartCombined, useCartTotals } from '@/src/stores/cart';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { addDays, differenceInDays, format } from 'date-fns';
import DateTimePicker from "@react-native-community/datetimepicker";

const FREQUENCIES = [
    { id: 'daily', label: 'Every day', apiValue: 'daily' as const, intervalDays: 1 },
    { id: 'weekly', label: 'Every week', apiValue: 'weekly' as const, intervalDays: 7 },
    { id: 'every_3_days', label: 'After 3 days', apiValue: 'custom' as const, intervalDays: 3 },
    { id: 'every_5_days', label: 'After 5 days', apiValue: 'custom' as const, intervalDays: 5 },
    { id: 'custom_time', label: 'Set your own time', apiValue: 'custom' as const, intervalDays: 14 },
];

export default function InstallmentGoalScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useTunzaaAuth();
    const { cart } = useCartCombined(user?.user_id || user?.id || '');
    const { data: totals } = useCartTotals(cart?.cart_id || '');

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isFrequencyExpanded, setIsFrequencyExpanded] = useState(false);
    const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    const deliveryFees = Number(params.deliveryFees) || 10000;
    const totalAmount = params.amount ? Number(params.amount) : ((totals?.total || 0) + deliveryFees);
    const primaryItem = cart?.items?.[0];

    // Compute goal duration in months dynamically
    const goalDurationMonths = useMemo(() => {
        if (!selectedDate) return 6; // Default to 6 months if not set
        const days = differenceInDays(selectedDate, new Date());
        return Math.max(1, Math.round(days / 30));
    }, [selectedDate]);

    // Compute installment breakdown
    const installmentBreakdown = useMemo(() => {
        const targetDate = selectedDate || addDays(new Date(), 180); // Default 6 months
        const freq = FREQUENCIES.find(f => f.id === selectedFrequency) || FREQUENCIES[1]; // Fallback to weekly

        const daysUntilGoal = Math.max(1, differenceInDays(targetDate, new Date()));
        const numberOfPayments = Math.max(1, Math.floor(daysUntilGoal / freq.intervalDays));
        const perPayment = Math.ceil(totalAmount / numberOfPayments);

        return {
            perPayment,
            numberOfPayments,
            frequencyLabel: freq.label.toLowerCase(),
            apiFrequency: freq.apiValue,
            customInterval: freq.intervalDays,
        };
    }, [selectedDate, selectedFrequency, totalAmount]);

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleContinue = () => {
        if (!selectedDate || !selectedFrequency) return;
        
        if (installmentBreakdown.perPayment < 1000) {
            Alert.alert(
                "Invalid Installment", 
                "Each installment payment must be at least Tsh 1,000. Please select a shorter duration or a different frequency."
            );
            return;
        }

        setIsSuccessModalVisible(true);
    };

    const handleMakePayment = () => {
        setIsSuccessModalVisible(false);
        const freq = FREQUENCIES.find(f => f.id === selectedFrequency);
        
        router.push({
            pathname: '/(buyer)/payment/methods',
            params: {
                ...params,
                paymentMethod: 'tunzaa_instalments',
                amount: totalAmount.toString(),
                installmentTargetDate: format(selectedDate || new Date(), 'yyyy-MM-dd'),
                installmentFrequency: freq?.apiValue || 'daily',
                installmentCustomInterval: freq?.intervalDays?.toString() || '1',
                installmentPerPayment: installmentBreakdown.perPayment.toString(),
                installmentCount: installmentBreakdown.numberOfPayments.toString(),
            }
        });
    };

    const isFormValid = selectedDate !== null && selectedFrequency !== null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Set an Installment Goal</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Product Info Banner */}
                <View style={styles.productBanner}>
                    <Text style={styles.bannerHeader}>
                        You're about to start an installment goal.
                    </Text>
                    <Text style={styles.bannerSubheader}>
                        Total Price: <Text style={styles.bannerPriceBold}>Tzs {new Intl.NumberFormat('en-US').format(totalAmount)}</Text>
                    </Text>
                    
                    <View style={styles.productWhiteCard}>
                        <View style={styles.imagePlaceholder}>
                            {primaryItem?.image_url ? (
                                <Image source={{ uri: primaryItem.image_url }} style={styles.productImage} resizeMode="contain" />
                            ) : (
                                <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                            )}
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{primaryItem?.product_name || 'Product Items'}</Text>
                            <Text style={styles.productTotal}>Tsh. {new Intl.NumberFormat('en-US').format(totalAmount)}</Text>
                            <View style={styles.durationBadge}>
                                <Text style={styles.durationBadgeText}>Goal Duration: {goalDurationMonths} months</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* When to complete */}
                <Text style={styles.sectionTitle}>When do you want to complete your payment?</Text>
                <Text style={styles.sectionSubtitle}>Schedule your time</Text>
                
                {/* Date Picker Button */}
                <TouchableOpacity 
                    style={styles.fieldSelector} 
                    onPress={() => setShowDatePicker(true)}
                >
                    <View style={styles.fieldLeft}>
                        <Ionicons name="calendar-outline" size={20} color="#1F2937" style={{ marginRight: 12 }} />
                        <Text style={[styles.fieldText, !selectedDate && styles.fieldPlaceholderText]}>
                            {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'weka muda wako'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate || addDays(new Date(), 30)}
                        mode="date"
                        minimumDate={addDays(new Date(), 1)}
                        onChange={handleDateChange}
                    />
                )}

                {/* Frequency selector button */}
                <TouchableOpacity 
                    style={[styles.fieldSelector, { marginTop: 16 }]} 
                    onPress={() => setIsFrequencyExpanded(!isFrequencyExpanded)}
                >
                    <View style={styles.fieldLeft}>
                        <Text style={[styles.fieldText, !selectedFrequency && styles.fieldPlaceholderText]}>
                            {selectedFrequency 
                                ? FREQUENCIES.find(f => f.id === selectedFrequency)?.label 
                                : 'How often do you want to pay?'}
                        </Text>
                    </View>
                    <Ionicons name={isFrequencyExpanded ? "chevron-down" : "chevron-forward"} size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Expanded Frequency Chips */}
                {isFrequencyExpanded && (
                    <View style={styles.frequencyContainer}>
                        {FREQUENCIES.map((freq) => (
                            <TouchableOpacity
                                key={freq.id}
                                style={[
                                    styles.freqChip,
                                    selectedFrequency === freq.id && styles.freqChipActive
                                ]}
                                onPress={() => {
                                    setSelectedFrequency(freq.id);
                                    setIsFrequencyExpanded(false);
                                }}
                            >
                                <Text style={[
                                    styles.freqChipText,
                                    selectedFrequency === freq.id && styles.freqChipTextActive
                                ]}>{freq.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]} 
                    onPress={handleContinue}
                    disabled={!isFormValid}
                >
                    <Text style={[styles.continueButtonText, !isFormValid && styles.continueButtonTextDisabled]}>
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Success Modal */}
            <Modal visible={isSuccessModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIconCircle}>
                            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
                        </View>
                        <Text style={styles.successTitle}>
                            🎉Great Progress {user?.first_name || 'Femi'}!
                        </Text>
                        <Text style={styles.successMessage}>
                            You've set a goal for {primaryItem?.product_name || 'your items'}.{' '}
                            To reach your goal, you'll need to pay{' '}
                            <Text style={styles.boldText}>
                                Tsh. {new Intl.NumberFormat('en-US').format(installmentBreakdown.perPayment)}
                            </Text>{' '}
                            {installmentBreakdown.frequencyLabel} until{' '}
                            <Text style={styles.boldText}>
                                {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : ''}
                            </Text>
                        </Text>
                        <TouchableOpacity style={styles.modalPayButton} onPress={handleMakePayment}>
                            <Text style={styles.modalPayButtonText}>Make a Payment</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    scrollContent: {
        paddingBottom: 40,
        paddingTop: 16,
    },
    productBanner: {
        backgroundColor: '#F0F4FA',
        padding: 16,
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 28,
    },
    bannerHeader: {
        fontSize: 17,
        color: '#3B5191',
        lineHeight: 24,
    },
    bannerSubheader: {
        fontSize: 17,
        color: '#3B5191',
        marginBottom: 16,
    },
    bannerPriceBold: {
        fontWeight: 'bold',
    },
    productWhiteCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    productImage: {
        width: '90%',
        height: '90%',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#3B5191',
        marginBottom: 4,
    },
    productTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
    },
    durationBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#2E4374',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    durationBadgeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        paddingHorizontal: 20,
    },
    sectionSubtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 16,
        marginTop: 2,
        paddingHorizontal: 20,
    },
    fieldSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    fieldLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fieldText: {
        fontSize: 17,
        color: '#1F2937',
        fontWeight: '500',
    },
    fieldPlaceholderText: {
        color: '#9CA3AF',
    },
    frequencyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 12,
        marginHorizontal: 20,
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    freqChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    freqChipActive: {
        backgroundColor: '#EBF5FF',
        borderColor: '#3B5191',
    },
    freqChipText: {
        fontSize: 15,
        color: '#4B5563',
        fontWeight: '500',
    },
    freqChipTextActive: {
        color: '#3B5191',
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    continueButton: {
        backgroundColor: '#3B5191',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    continueButtonTextDisabled: {
        color: '#9CA3AF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    successIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#3B5191',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalPayButton: {
        backgroundColor: '#3B5191',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    modalPayButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
