import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { PRODUCTS } from '../../../src/data/products';

export default function SetGoalScreen() {
    const router = useRouter();
    const { productId } = useLocalSearchParams();

    // Find product or use fallback
    const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];

    // State for inputs
    const [endDate, setEndDate] = useState(''); // Text input for MVP
    const [frequency, setFrequency] = useState('Every day'); // Default selection

    const frequencies = [
        { id: 'Every day', label: 'Every day' },
        { id: 'Every week', label: 'Every week' },
        { id: 'After 3 days', label: 'After 3 days' },
        { id: 'Set your own time', label: 'Set your own time' },
    ];

    const handleContinue = () => {
        if (!endDate) {
            alert('Please enter a target date');
            return;
        }
        router.push({
            pathname: '/(buyer)/checkout/payment-method',
            params: { productId: product.id, amount: 45000 } // Pass instalment amount
        });
    };

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

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Intro Text */}
                    <Text style={styles.introText}>
                        You're about to start an installment goal.{"\n"}
                        Total Price: <Text style={{ fontWeight: 'bold' }}>Tsh {new Intl.NumberFormat('en-US').format(product.price)}</Text>
                    </Text>

                    {/* Product Card */}
                    <View style={styles.productCard}>
                        <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productPrice}>Tsh. {new Intl.NumberFormat('en-US').format(product.price)}</Text>
                            <View style={styles.goalDurationTag}>
                                <Text style={styles.goalDurationText}>Goal Duration: 3 months</Text>
                            </View>
                        </View>
                    </View>

                    {/* Date Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>When do you want to complete your payment?</Text>
                        <Text style={styles.sectionSubLabel}>Schedule your time</Text>

                        <TouchableOpacity style={styles.dateInputWrapper}>
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                            <TextInput
                                style={styles.dateInput}
                                placeholder="20/02/2025"
                                value={endDate}
                                onChangeText={setEndDate}
                                placeholderTextColor="#9CA3AF"
                            />
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Frequency Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>How often do you want to pay?</Text>

                        <View style={styles.freqGrid}>
                            {frequencies.map((freq) => {
                                const isSelected = frequency === freq.id;
                                return (
                                    <TouchableOpacity
                                        key={freq.id}
                                        style={[styles.freqCard, isSelected && styles.freqCardSelected]}
                                        onPress={() => setFrequency(freq.id)}
                                    >
                                        <Text style={[styles.freqText, isSelected && styles.freqTextSelected]}>
                                            {freq.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
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
    introText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 20,
        lineHeight: 22,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB', // Light gray bg
        padding: 12,
        borderRadius: 16,
        marginBottom: 30,
        alignItems: 'center',
    },
    productImage: {
        width: 80,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
        backgroundColor: '#E5E7EB',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A55A2',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 6,
    },
    goalDurationTag: {
        backgroundColor: '#4A55A2',
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
        fontWeight: '600', // Semi-bold
        color: '#1F2937',
        marginBottom: 8,
    },
    sectionSubLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },
    dateInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4, // Input has height
        backgroundColor: '#FFFFFF',
    },
    dateInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#1F2937',
        marginLeft: 12,
    },
    freqGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    freqCard: {
        // width: '48%', // 2 columns
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        minWidth: '30%',
        alignItems: 'center',
        flexGrow: 1,
    },
    freqCardSelected: {
        borderColor: '#4A55A2', // Active border
        backgroundColor: '#EFF6FF', // Light blue bg
    },
    freqText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4B5563',
    },
    freqTextSelected: {
        color: '#4A55A2',
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    continueButton: {
        backgroundColor: '#4A55A2',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        // Shadow
        shadowColor: "#4A55A2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
