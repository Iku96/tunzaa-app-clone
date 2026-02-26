import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

const INDUSTRIES = [
    'Market', 'Food', 'Tourism', 'Entertainment', 'Beauty',
    'Technology industry', 'Mother and baby product', 'Books',
    'Deals & Discounts', 'Automative'
];

export default function AffiliateInterestsScreen() {
    const router = useRouter();
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

    const handleToggle = (industry: string) => {
        if (selectedIndustries.includes(industry)) {
            setSelectedIndustries(prev => prev.filter(i => i !== industry));
        } else {
            setSelectedIndustries(prev => [...prev, industry]);
        }
    };

    const handleContinue = () => {
        router.push('/(affiliate)/documents' as any);
    };

    const handleSkip = () => {
        router.push('/(affiliate)/documents' as any);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header with Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                </View>

                {/* Title Section */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Choose your meet industry</Text>
                    <Text style={styles.subtitle}>Please select the relevant sector of your mishe</Text>
                </View>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/blue-tunzaa-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Pills Grid */}
                <View style={styles.pillsContainer}>
                    {INDUSTRIES.map((industry) => {
                        const isSelected = selectedIndustries.includes(industry);
                        return (
                            <TouchableOpacity
                                key={industry}
                                onPress={() => handleToggle(industry)}
                                style={[
                                    styles.pill,
                                    isSelected && styles.pillSelected
                                ]}
                            >
                                <Text style={[
                                    styles.pillText,
                                    isSelected && styles.pillTextSelected
                                ]}>
                                    {industry}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Bottom Spacer to push buttons down */}
                <View style={{ flex: 1, minHeight: 40 }} />

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            selectedIndustries.length === 0 && styles.continueButtonDisabled
                        ]}
                        onPress={handleContinue}
                        disabled={selectedIndustries.length === 0}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipButtonRow} onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip</Text>
                        <ArrowRight size={18} color="#3B5998" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        height: 60,
        justifyContent: 'center',
        marginBottom: 10,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        color: '#4B5563',
        textAlign: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 35,
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12, // React Native 0.71+ supports gap
    },
    pill: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    pillSelected: {
        backgroundColor: '#F0F4FC', // Light blue background when selected
        borderColor: '#3B5998',
    },
    pillText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    pillTextSelected: {
        color: '#3B5998',
    },
    actionsContainer: {
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    continueButton: {
        backgroundColor: '#3B5998',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
    },
    continueButtonDisabled: {
        opacity: 0.7,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    skipButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    skipText: {
        color: '#3B5998',
        fontSize: 16,
        fontWeight: '500',
        marginRight: 6,
    }
});
