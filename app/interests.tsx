import { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Interests Selection Screen
 * Selectable interest chips with Continue and Skip buttons
 */
export default function InterestsScreen() {
    const router = useRouter();

    const interests = [
        'Fashion', 'Technology', 'Food & Dining', 'Travel', 'Sports',
        'Music', 'Art & Culture', 'Fitness', 'Gaming', 'Photography',
        'Reading', 'Cooking', 'Movies', 'Nature', 'Business'
    ];

    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const handleContinue = () => {
        console.log('Selected interests:', selectedInterests);
        router.push('/complete-profile');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>What are your interests?</Text>
                            <Text style={styles.subtitle}>
                                Select your interests to personalize your experience
                            </Text>
                        </View>

                        {/* Interest Chips */}
                        <View style={styles.chipsContainer}>
                            {interests.map((interest) => (
                                <TouchableOpacity
                                    key={interest}
                                    style={[
                                        styles.chip,
                                        selectedInterests.includes(interest) && styles.chipSelected
                                    ]}
                                    onPress={() => toggleInterest(interest)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            selectedInterests.includes(interest) && styles.chipTextSelected
                                        ]}
                                    >
                                        {interest}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Continue Button */}
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                selectedInterests.length === 0 && styles.continueButtonDisabled
                            ]}
                            onPress={handleContinue}
                            disabled={selectedInterests.length === 0}
                        >
                            <Text style={styles.continueButtonText}>
                                Continue ({selectedInterests.length} selected)
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Skip Button - Pinned to Bottom */}
                <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/home')}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Text style={styles.skipArrow}>→</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 20,
        justifyContent: 'space-between',
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 20,
    },

    contentWrapper: {
        width: '100%',
        maxWidth: 353,
        alignSelf: 'center',
    },

    header: {
        marginBottom: 32,
    },

    title: {
        fontFamily: 'System',
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1E1F',
        textAlign: 'center',
        marginBottom: 12,
    },

    subtitle: {
        fontFamily: 'System',
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
    },

    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },

    chip: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },

    chipSelected: {
        backgroundColor: '#3B5191',
        borderColor: '#3B5191',
    },

    chipText: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '500',
        color: '#1D1E1F',
    },

    chipTextSelected: {
        color: '#FFFFFF',
    },

    continueButton: {
        height: 54,
        backgroundColor: '#3B5191',
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    continueButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },

    continueButtonText: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    skipButton: {
        width: 190,
        height: 54,
        borderRadius: 1000,
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 18,
        marginTop: 6,
    },

    skipText: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        letterSpacing: -0.24,
        color: '#3B5191',
    },

    skipArrow: {
        fontSize: 20,
        color: '#3B5191',
        lineHeight: 20,
    },
});
