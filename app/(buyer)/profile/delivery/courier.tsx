import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChooseCourierScreen() {
    const router = useRouter();
    const [selectedCourier, setSelectedCourier] = useState<string | null>('simba');

    const renderProgressStepper = () => (
        <View style={styles.stepperContainer}>
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                    <Ionicons name="checkmark" size={14} color="#425BA4" />
                </View>
                <Text style={[styles.stepText, styles.stepTextCompleted]}>STEP 1</Text>
                <Text style={styles.stepSubText}>Choose Method</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                    <Ionicons name="person-outline" size={14} color="#425BA4" />
                </View>
                <Text style={[styles.stepText, styles.stepTextActive]}>STEP 2</Text>
                <Text style={styles.stepSubText}>Choose courier</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
                <View style={styles.stepCircle}>
                    <Ionicons name="document-text-outline" size={14} color="#9CA3AF" />
                </View>
                <Text style={styles.stepText}>STEP 3</Text>
                <Text style={styles.stepSubText}>Save address</Text>
            </View>
        </View>
    );

    const renderCourierCard = (id: string, name: string, type: string, eta: string) => (
        <TouchableOpacity
            key={id}
            style={[styles.courierCard, selectedCourier === id && styles.courierCardSelected]}
            onPress={() => setSelectedCourier(id)}
        >
            <View style={styles.courierLeft}>
                <View style={styles.logoBox}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=100&h=100&fit=crop' }}
                        style={styles.logo}
                    />
                    <Text style={styles.logoText}>Simba</Text>
                    <Text style={styles.logoSubText}>Courier</Text>
                </View>
                <View style={styles.courierInfo}>
                    <Text style={styles.courierName}>{name}</Text>
                    <Text style={styles.courierType}>{type}</Text>
                    <View style={styles.etaRow}>
                        <Ionicons name="time-outline" size={12} color="#425BA4" />
                        <Text style={styles.etaText}>{eta}</Text>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery method</Text>
                <View style={{ width: 24 }} />
            </View>

            {renderProgressStepper()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Select your preferred delivery company.</Text>

                {renderCourierCard("simba", "Simba Courier", "Reliable nationwide delivery.", "Estimated delivery: 24-48 hours")}
                {renderCourierCard("simba-light", "Simba Courier", "Reliable nationwide delivery.", "Estimated delivery: 24-48 hours")}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedCourier && styles.continueButtonDisabled]}
                    onPress={() => router.push('/(buyer)/profile/delivery/address')}
                    disabled={!selectedCourier}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
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
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        paddingHorizontal: 30,
    },
    step: {
        alignItems: 'center',
        width: 80,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    stepCircleActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#E0E7FF',
    },
    stepCircleCompleted: {
        backgroundColor: '#EEF2FF',
        borderColor: '#E0E7FF',
    },
    stepText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
        marginBottom: 2,
    },
    stepTextActive: {
        color: '#425BA4',
    },
    stepTextCompleted: {
        color: '#425BA4',
    },
    stepSubText: {
        fontSize: 9,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#F3F4F6',
        marginTop: -32,
    },
    stepLineActive: {
        backgroundColor: '#425BA4',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 24,
    },
    courierCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
    },
    courierCardSelected: {
        borderColor: '#425BA4',
        borderWidth: 1.5,
    },
    courierLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logoBox: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    logo: {
        width: 30,
        height: 15,
        marginBottom: 2,
    },
    logoText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#B91C1C', // Reddish
        marginTop: -2,
    },
    logoSubText: {
        fontSize: 5,
        color: '#1E3A8A', // Blueish
        marginTop: -1,
    },
    courierInfo: {
        flex: 1,
    },
    courierName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    courierType: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 6,
    },
    etaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    etaText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#425BA4',
    },
    footer: {
        padding: 24,
        paddingBottom: 34,
    },
    continueButton: {
        backgroundColor: '#425BA4',
        borderRadius: 30,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
