import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RateScreen() {
    const router = useRouter();
    const [shopRating, setShopRating] = useState(0);
    const [deliveryRating, setDeliveryRating] = useState(0);

    const handleSubmit = () => {
        Alert.alert(
            "Thanks for rating!",
            "We're grateful for your trust in our service.",
            [
                { text: "Go to Homepage", onPress: () => router.push('/(buyer)/home') }
            ]
        );
    };

    const renderStars = (rating: number, setRating: (r: number) => void) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <Ionicons
                            name={star <= rating ? "star" : "star-outline"}
                            size={32}
                            color={star <= rating ? "#FBBF24" : "#D1D5DB"}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rate</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.ratingSection}>
                    <Text style={styles.questionText}>How would you rate your experience with Vodacom Shop?</Text>
                    {renderStars(shopRating, setShopRating)}
                </View>

                <View style={styles.divider} />

                <View style={styles.ratingSection}>
                    <Text style={styles.questionText}>How would you rate your delivery with Simba Courier?</Text>
                    {renderStars(deliveryRating, setDeliveryRating)}
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitButtonText}>Submit Feedback</Text>
                </TouchableOpacity>

            </ScrollView>
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
        paddingTop: 10,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    content: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    ratingSection: {
        alignItems: 'center',
        marginVertical: 24,
        width: '100%',
    },
    questionText: {
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 24,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        width: '100%',
        marginVertical: 12,
    },
    submitButton: {
        backgroundColor: '#4A55A2',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 40,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
