import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';

const INTERESTS_TAGS = [
    'Gaming',
    'Baby & Kids Products',
    'Groceries & Daily Needs',
    'Travel',
    'Loan & Financing Options',
    'Event & Travel Tickets',
    'Books',
    'Deals & Discounts',
    'Automotive',
    'Fashion',
    'Electronics'
];

export default function Step2Interests() {
    const router = useRouter();
    const { user } = useAuth();

    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        interests: selectedInterests
                    } as any)
                    .eq('id', user.id);

                if (error) throw error;
            }
            router.push('/(buyer)/onboarding/step-3');
        } catch (e) {
            console.error('Error saving interests:', e);
            alert('Failed to save interests.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logoText}>TUNZAA</Text>
            </View>

            <Text style={styles.title}>Add your interests</Text>
            <Text style={styles.subtitle}>
                We'll personalize your experience based on what you like.
            </Text>

            <ScrollView contentContainerStyle={styles.tagsContainer}>
                {INTERESTS_TAGS.map((tag) => {
                    const isSelected = selectedInterests.includes(tag);
                    return (
                        <TouchableOpacity
                            key={tag}
                            style={[styles.tag, isSelected && styles.tagSelected]}
                            onPress={() => toggleInterest(tag)}
                        >
                            <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                                {tag}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.continueButton} onPress={handleNext} disabled={loading}>
                    <Text style={styles.continueButtonText}>{loading ? 'Saving...' : 'Continue'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(buyer)/onboarding/step-3')}>
                    <Text style={styles.skipText}>Skip</Text>
                    <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    logoText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#425BA4',
        letterSpacing: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        paddingBottom: 40,
    },
    tag: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    tagSelected: {
        borderColor: '#425BA4',
        backgroundColor: '#EFF6FF',
    },
    tagText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    tagTextSelected: {
        color: '#425BA4',
        fontWeight: '600',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 40,
        gap: 20,
        alignItems: 'center',
    },
    continueButton: {
        width: '100%',
        backgroundColor: '#425BA4', // Brand Blue
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    skipText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
});
