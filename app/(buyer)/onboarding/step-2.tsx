import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const insets = useSafeAreaInsets();

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
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add your interests</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>
                    We'll personalize your experience based on what you like.
                </Text>

                {/* TUNZAA Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>TUNZAA</Text>
                </View>

                {/* Interests Tags */}
                <ScrollView contentContainerStyle={styles.tagsScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.tagsContainer}>
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
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleNext} disabled={loading}>
                        <Text style={styles.continueButtonText}>{loading ? 'Saving...' : 'Continue'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(buyer)/onboarding/step-3')}>
                        <Text style={styles.skipText}>Skip</Text>
                        <Ionicons name="arrow-forward" size={16} color="#3E4C85" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        height: 44,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    content: {
        flex: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#3E4C85', // Brand Blue/Indigo
        letterSpacing: 1,
        fontFamily: Platform.select({ ios: 'Avenir-Black', android: 'sans-serif-black' }),
    },
    tagsScroll: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    tag: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25, // Pill shape
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        // Slight shadow for "floating" look if needed, but screenshot implies clean look.
    },
    tagSelected: {
        borderColor: '#3E4C85',
        backgroundColor: '#F0F4FF', // Very light blue tint for selected? Or keep white. Spec usually implies simple outline.
        // Let's keep white bg but colored border as per typical "outline chip" design unless filled.
        backgroundColor: '#FFFFFF',
    },
    tagText: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    tagTextSelected: {
        color: '#3E4C85',
        fontWeight: '600',
    },
    footer: {
        paddingTop: 20, // Add some space above footer
        paddingBottom: 40, // Space for bottom
        alignItems: 'center',
        gap: 20,
    },
    continueButton: {
        width: '100%',
        backgroundColor: '#3E4C85',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: "#3E4C85",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
    },
    skipText: {
        color: '#3E4C85',
        fontSize: 16,
        fontWeight: '500',
    },
});
