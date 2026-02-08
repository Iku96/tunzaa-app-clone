
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

const INTERESTS = [
    { id: 'fashion', label: 'Fashion & Mitindo', icon: 'shirt-outline' },
    { id: 'electronics', label: 'Vifaa vya Elektroniki', icon: 'phone-portrait-outline' },
    { id: 'home', label: 'Vyombo vya Nyumbani', icon: 'home-outline' },
    { id: 'beauty', label: 'Urembo & Vipodozi', icon: 'rose-outline' },
    { id: 'kids', label: 'Watoto & Michezo', icon: 'happy-outline' },
    { id: 'sports', label: 'Michezo & Mazoezi', icon: 'football-outline' },
    { id: 'books', label: 'Vitabu & Elimu', icon: 'book-outline' },
    { id: 'automotive', label: 'Vifaa vya Magari', icon: 'car-outline' },
];

export default function Step2Interests() {
    const router = useRouter();
    const { user } = useAuth();

    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleInterest = (id: string) => {
        if (selectedInterests.includes(id)) {
            setSelectedInterests(prev => prev.filter(i => i !== id));
        } else {
            setSelectedInterests(prev => [...prev, id]);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ interests: selectedInterests } as any) // Cast as any if column not yet in types
                    .eq('id', user.id);

                if (error) throw error;
            }

            router.push('/(buyer)/onboarding/step-3-follows');
        } catch (e: any) {
            console.error('Error saving interests:', e);
            // alert('Error saving interests'); // Silent fail or toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Vitu gani unapenda?</Text>
                    <Text style={styles.subtitle}>Chagua angalau 3 ili tunakuandalia bidhaa unazopenda zaidi.</Text>
                </View>

                <ScrollView contentContainerStyle={styles.gridContainer}>
                    {INTERESTS.map((item) => {
                        const isSelected = selectedInterests.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.card, isSelected && styles.cardSelected]}
                                onPress={() => toggleInterest(item.id)}
                            >
                                <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={24}
                                        color={isSelected ? '#FFF' : '#4B5563'}
                                    />
                                </View>
                                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                                    {item.label}
                                </Text>
                                {isSelected && (
                                    <View style={styles.checkIcon}>
                                        <Ionicons name="checkmark-circle" size={20} color="#425BA4" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.nextButton, selectedInterests.length < 1 && styles.disabledButton]}
                        onPress={handleNext}
                        disabled={loading || selectedInterests.length < 1}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Inahifadhi...' : 'Endelea'}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNext} style={styles.skipButton}>
                        <Text style={styles.skipText}>Ruka kwa sasa</Text>
                    </TouchableOpacity>
                </View>
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
        paddingHorizontal: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    card: {
        width: '48%',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cardSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: '#425BA4',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconCircleSelected: {
        backgroundColor: '#425BA4',
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
    cardLabelSelected: {
        color: '#1F2937',
    },
    checkIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    footer: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    nextButton: {
        backgroundColor: '#425BA4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
        marginBottom: 12,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        alignItems: 'center',
    },
    skipText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
});
