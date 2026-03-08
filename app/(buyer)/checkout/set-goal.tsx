import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../../src/services/products';
import { mapApiProductToUI } from '../../../src/hooks/useMarketplace';
import { ActivityIndicator, Modal, Platform } from 'react-native';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
// Mock a simple 31-day month grid starting on Tuesday for the visual
const WEEKS = [
    ['29', '30', '31', '1', '2', '3', '4'],
    ['5', '6', '7', '8', '9', '10', '11'],
    ['12', '13', '14', '15', '16', '17', '18'],
    ['19', '20', '21', '22', '23', '24', '25'],
    ['26', '27', '28', '29', '30', '31', '1'],
];

export default function SetGoalScreen() {
    const router = useRouter();
    const { productId } = useLocalSearchParams();

    // Fetch product dynamically based on ID
    const { data: apiProduct, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productsApi.getProductById(productId as string),
        enabled: !!productId,
    });

    const product = apiProduct ? mapApiProductToUI(apiProduct) : null;

    // State for inputs
    const [endDate, setEndDate] = useState(''); // Text input for MVP
    const [frequency, setFrequency] = useState('Every day'); // Default selection

    const frequencies = [
        { id: 'Every day', label: 'Every day' },
        { id: 'Every week', label: 'Every week' },
        { id: 'After 5 days', label: 'After 5 days' },
        { id: 'Set your own time', label: 'Set your own time' },
    ];

    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);

    // Default to a placeholder if empty, else show selected
    const displayDate = endDate || 'Select a date';

    const handleDateSelect = (day: string) => {
        // If it's a greyed out previous/next month day (like 29, 30, 31 at start, or 1 at end)
        if (parseInt(day) > 31) return; // Simple safeguard
        setEndDate(`${day}/03/2026`); // Mock format
        setIsCalendarVisible(false);
    };
    const handleContinue = () => {
        if (!endDate) {
            alert('Please enter a target date');
            return;
        }
        // Show success modal instead of immediate navigation
        setIsSuccessModalVisible(true);
    };

    const handleMakePayment = () => {
        setIsSuccessModalVisible(false);
        router.push({
            pathname: '/(buyer)/checkout/payment-method',
            params: { productId: product?.id, amount: 45000 }
        });
    };

    const renderSuccessModal = () => (
        <Modal visible={isSuccessModalVisible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalCheckCircle}>
                        <Ionicons name="checkmark" size={40} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modalTitle}>🎉Great Progress Femi!</Text>
                    <Text style={styles.modalText}>
                        You've set a goal for {product?.name?.toLowerCase() || 'item'}{"\n"}
                        To reach Your goal, you'll need to pay <Text style={{ fontWeight: 'bold', color: '#1F2937' }}>Tsh. 5,000</Text> every 3 days until June 30,2025
                    </Text>
                    <TouchableOpacity style={styles.modalButton} onPress={handleMakePayment}>
                        <Text style={styles.modalButtonText}>Make a Payment</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderCalendarModal = () => (
        <Modal visible={isCalendarVisible} transparent={true} animationType="fade">
            <View style={styles.calendarOverlay}>
                <View style={styles.calendarContent}>
                    <View style={styles.calendarHeaderRow}>
                        <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                        <Text style={styles.calendarMonthText}>March 2026</Text>
                        <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                            <Ionicons name="chevron-forward" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.calendarDaysHeader}>
                        {DAYS.map((d, i) => (
                            <Text key={i} style={styles.calendarDayText}>{d}</Text>
                        ))}
                    </View>

                    <View style={styles.calendarGrid}>
                        {WEEKS.map((week, weekIdx) => (
                            <View key={weekIdx} style={styles.calendarRow}>
                                {week.map((day, dayIdx) => {
                                    // Determine if day is from previous/next month purely by its position in our mock array
                                    const isPrevMonth = weekIdx === 0 && parseInt(day) > 7;
                                    const isNextMonth = weekIdx === 4 && parseInt(day) < 10;
                                    const isMuted = isPrevMonth || isNextMonth;
                                    const isSelected = !isMuted && endDate.startsWith(day + '/');

                                    return (
                                        <TouchableOpacity
                                            key={`${weekIdx}-${dayIdx}`}
                                            style={[styles.calendarCell, isSelected && styles.calendarCellSelected]}
                                            onPress={() => !isMuted && handleDateSelect(day)}
                                            activeOpacity={isMuted ? 1 : 0.6}
                                        >
                                            <Text style={[
                                                styles.calendarCellText,
                                                isMuted && styles.calendarCellTextMuted,
                                                isSelected && styles.calendarCellTextSelected
                                            ]}>
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Set an Installment Goal</Text>
                    <View style={{ width: 24 }} />
                </View>

                {isLoading || !product ? (
                    <View style={{ flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#4A55A2" />
                        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading installment details...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Intro Box matching exact screenshot */}
                        <View style={styles.introBox}>
                            <Text style={styles.introText}>
                                You're about to start an installment goal.
                            </Text>
                            <Text style={styles.introTotal}>
                                Total Price: <Text style={{ fontWeight: 'bold' }}>Tzs {new Intl.NumberFormat('en-US').format(product.price || 100)}</Text>
                            </Text>

                            {/* Inner White Product Card */}
                            <View style={styles.productCard}>
                                <View style={styles.productImageWrapper}>
                                    <Image source={{ uri: Array.isArray(product.image) ? product.image[0] : (product.image || 'https://via.placeholder.com/80') }} style={styles.productImage} resizeMode="contain" />
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{product.name || 'Blender'}</Text>
                                    <Text style={styles.productPrice}>Tsh. {new Intl.NumberFormat('en-US').format(product.price || 100)}</Text>
                                    <View style={styles.goalDurationTag}>
                                        <Text style={styles.goalDurationText}>Goal Duration: 6 months</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Input Rows matching screenshot */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>When do you want to complete your payment?</Text>
                            <Text style={styles.sectionSubLabel}>Schedule your time</Text>

                            <View style={styles.inputStackContainer}>
                                <TouchableOpacity style={styles.listInputRow} onPress={() => setIsCalendarVisible(true)}>
                                    <View style={styles.listInputLeft}>
                                        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                                        <Text style={[styles.listInputTextPlaceholder, endDate && { color: '#1F2937' }]}>
                                            {displayDate}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                                </TouchableOpacity>

                                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>How often do you want to pay?</Text>

                                <View style={styles.frequencyGrid}>
                                    {frequencies.map((freq) => {
                                        const isActive = frequency === freq.id;
                                        return (
                                            <TouchableOpacity
                                                key={freq.id}
                                                style={[styles.frequencyPill, isActive && styles.frequencyPillActive]}
                                                onPress={() => setFrequency(freq.id)}
                                            >
                                                <Text style={[styles.frequencyPillText, isActive && styles.frequencyPillTextActive]}>
                                                    {freq.label}
                                                </Text>
                                                {isActive && <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                )}

                {renderCalendarModal()}
                {renderSuccessModal()}

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.continueButton, (!product || isLoading) && { opacity: 0.5 }]} onPress={handleContinue} disabled={!product || isLoading}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    introBox: {
        backgroundColor: '#F3F4F6', // Lighter grey background mimicking screenshot
        borderRadius: 16,
        padding: 16,
        paddingBottom: 24, // Extra padding at bottom for the nested card
        marginBottom: 30,
    },
    introText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    introTotal: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 20,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        // Slight shadow to pop off grey background
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productImageWrapper: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 16,
        backgroundColor: '#F9FAFB', // very light grey for image bg
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: '90%',
        height: '90%',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#425BA4', // Theme Blue for text
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    goalDurationTag: {
        backgroundColor: '#425BA4', // Matching the title color
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    goalDurationText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    section: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    sectionSubLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    inputStackContainer: {
        gap: 16,
    },
    listInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
    },
    listInputLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    listInputTextPlaceholder: {
        fontSize: 15,
        color: '#6B7280',
    },
    frequencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    frequencyPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    frequencyPillActive: {
        backgroundColor: '#425BA4',
        borderColor: '#425BA4',
    },
    frequencyPillText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    frequencyPillTextActive: {
        color: '#FFFFFF',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    continueButton: {
        backgroundColor: '#425BA4', // Base theme blue
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.7)', // Overlay matches screenshot color
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    modalCheckCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2F48AE', // Deep blue
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        // Bring circle UP to overlap edge
        marginTop: -60,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    modalButton: {
        width: '100%',
        backgroundColor: '#425BA4',
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // Calendar Specific Styles
    calendarOverlay: {
        flex: 1,
        backgroundColor: 'rgba(75, 85, 99, 0.95)', // Solid dark grey overlay from Figma
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '85%', // Not full width, more like a dialog
    },
    calendarHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    calendarMonthText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    calendarDaysHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    calendarDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        color: '#9CA3AF', // Lighter text for the day labels
        fontWeight: '500',
    },
    calendarGrid: {
        gap: 12, // Space between rows
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    calendarCell: {
        flex: 1,
        aspectRatio: 1, // Make squares
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    calendarCellSelected: {
        backgroundColor: '#425BA4',
        borderRadius: 8,
    },
    calendarCellText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    calendarCellTextMuted: {
        color: '#D1D5DB', // Very light grey for prev/next month
    },
    calendarCellTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
