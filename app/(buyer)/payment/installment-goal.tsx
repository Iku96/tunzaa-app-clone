import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useCartCombined, useCartTotals } from '@/src/stores/cart';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';
import { addDays, differenceInDays, differenceInWeeks, format } from 'date-fns';
import DateTimePicker from "@react-native-community/datetimepicker";

// Map UI frequency choices to valid API enum + day intervals
const FREQUENCIES = [
    { id: 'daily', label: 'Everyday', apiValue: 'daily' as const, intervalDays: 1 },
    { id: 'every_2_days', label: 'Every 2 days', apiValue: 'custom' as const, intervalDays: 2 },
    { id: 'weekly', label: 'Every week', apiValue: 'weekly' as const, intervalDays: 7 },
    { id: 'every_5_days', label: 'After 5 days', apiValue: 'custom' as const, intervalDays: 5 },
    { id: 'monthly', label: 'Every month', apiValue: 'monthly' as const, intervalDays: 30 },
];

export default function InstallmentGoalScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useTunzaaAuth();
    const { cart } = useCartCombined(user?.user_id || user?.id || '');
    const { data: totals } = useCartTotals(cart?.cart_id || '');

    const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 30)); // Default 30 days
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedFrequency, setSelectedFrequency] = useState<string>('weekly');

    const deliveryFees = Number(params.deliveryFees) || 10000;
    const totalAmount = params.amount ? Number(params.amount) : ((totals?.total || 0) + deliveryFees);
    const primaryItem = cart?.items?.[0];

    // Compute installment breakdown
    const installmentBreakdown = useMemo(() => {
        const freq = FREQUENCIES.find(f => f.id === selectedFrequency);
        if (!freq) return { perPayment: 0, numberOfPayments: 0, frequencyLabel: '' };

        const daysUntilGoal = Math.max(1, differenceInDays(selectedDate, new Date()));
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

    // Generate next 5 quick date options
    const quickDates = [
        { date: addDays(new Date(), 7), label: '1 week' },
        { date: addDays(new Date(), 14), label: '2 weeks' },
        { date: addDays(new Date(), 30), label: '1 month' },
        { date: addDays(new Date(), 60), label: '2 months' },
        { date: addDays(new Date(), 90), label: '3 months' },
    ].map(d => ({ ...d, fullDate: format(d.date, 'yyyy-MM-dd') }));

    const handleContinue = () => {
        const freq = FREQUENCIES.find(f => f.id === selectedFrequency);
        
        router.push({
            pathname: '/(buyer)/payment/methods',
            params: {
                ...params,
                paymentMethod: 'tunzaa_instalments',
                amount: totalAmount.toString(),
                installmentTargetDate: format(selectedDate, 'yyyy-MM-dd'),
                installmentFrequency: freq?.apiValue || 'daily',
                installmentCustomInterval: freq?.intervalDays?.toString() || '1',
                installmentPerPayment: installmentBreakdown.perPayment.toString(),
                installmentCount: installmentBreakdown.numberOfPayments.toString(),
            }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Set an Installment Goal</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Subtitle */}
                <Text style={styles.subtitle}>
                    Set an installment goal. This allow you to break your purchase into manageable payments.
                </Text>

                {/* Product Info Banner */}
                <View style={styles.productBanner}>
                    <View style={styles.imagePlaceholder}>
                        {primaryItem?.image_url ? (
                            <Image source={{ uri: primaryItem.image_url }} style={styles.productImage} resizeMode="contain" />
                        ) : (
                            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                        )}
                    </View>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{primaryItem?.product_name || 'Product Items'}</Text>
                        <Text style={styles.productTotal}>Total Price: Tsh {new Intl.NumberFormat('en-US').format(totalAmount)}</Text>
                        <Text style={styles.productRemaining}>Tsh {new Intl.NumberFormat('en-US').format(installmentBreakdown.perPayment)}</Text>
                        <Text style={styles.perPaymentLabel}>per payment ({installmentBreakdown.numberOfPayments} payments)</Text>
                    </View>
                </View>

                {/* When to complete */}
                <Text style={styles.sectionTitle}>When do you want to complete your payment?</Text>
                <Text style={styles.sectionSubtitle}>Schedule time</Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesContainer} contentContainerStyle={styles.datesContent}>
                    {quickDates.map((item) => (
                        <TouchableOpacity
                            key={item.fullDate}
                            style={[
                                styles.dateChip,
                                format(selectedDate, 'yyyy-MM-dd') === item.fullDate && styles.dateChipActive
                            ]}
                            onPress={() => setSelectedDate(item.date)}
                        >
                            <Text style={[
                                styles.dateChipText,
                                format(selectedDate, 'yyyy-MM-dd') === item.fullDate && styles.dateChipTextActive
                            ]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.calendarButton} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={24} color="#425BA4" />
                    </TouchableOpacity>
                </ScrollView>

                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        minimumDate={addDays(new Date(), 1)}
                        onChange={(event, date) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (date) setSelectedDate(date);
                        }}
                    />
                )}

                {/* Frequency Section */}
                <Text style={styles.sectionTitle}>How often do you want to pay?</Text>
                <Text style={styles.sectionSubtitle}>Schedule your time</Text>

                <View style={styles.frequencyContainer}>
                    {FREQUENCIES.map((freq) => (
                        <TouchableOpacity
                            key={freq.id}
                            style={[
                                styles.freqChip,
                                selectedFrequency === freq.id && styles.freqChipActive
                            ]}
                            onPress={() => setSelectedFrequency(freq.id)}
                        >
                            <Text style={[
                                styles.freqChipText,
                                selectedFrequency === freq.id && styles.freqChipTextActive
                            ]}>{freq.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Info Box / Summary */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        You'll make <Text style={styles.infoTextBold}>{installmentBreakdown.numberOfPayments} payments</Text> of{' '}
                        <Text style={styles.infoTextBold}>Tsh {new Intl.NumberFormat('en-US').format(installmentBreakdown.perPayment)}</Text>{' '}
                        {installmentBreakdown.frequencyLabel} to reach your goal of{' '}
                        <Text style={styles.infoTextBold}>Tsh {new Intl.NumberFormat('en-US').format(totalAmount)}</Text>{' '}
                        by <Text style={styles.infoTextBold}>{format(selectedDate, 'dd MMM yyyy')}</Text>.
                    </Text>
                </View>

                {/* Terms */}
                <View style={styles.termsRow}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
                    <Text style={styles.termsText}>Terms & Eligibility apply. By continuing you agree to Tunzaa installment terms.</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
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
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        paddingHorizontal: 20,
        marginBottom: 16,
        lineHeight: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    productBanner: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 24,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    productTotal: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    productRemaining: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#425BA4',
    },
    perPaymentLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 16,
        paddingHorizontal: 20,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        marginTop: 4,
        paddingHorizontal: 20,
    },
    datesContainer: {
        flexGrow: 0,
        marginBottom: 24,
        paddingLeft: 20,
    },
    datesContent: {
        gap: 10,
        paddingRight: 20,
    },
    dateChip: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    dateChipActive: {
        backgroundColor: '#EBF5FF',
        borderColor: '#425BA4',
    },
    dateChipText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    dateChipTextActive: {
        color: '#425BA4',
        fontWeight: '600',
    },
    calendarButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EBF5FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    frequencyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    freqChip: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    freqChipActive: {
        backgroundColor: '#059669',
        borderColor: '#059669',
    },
    freqChipText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    freqChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 20,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 22,
    },
    infoTextBold: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginHorizontal: 20,
        marginTop: 16,
    },
    termsText: {
        flex: 1,
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    continueButton: {
        backgroundColor: '#425BA4',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
