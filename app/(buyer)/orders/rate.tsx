import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateRating } from '../../../src/services/ratings';
import { useGetOrder } from '../../../src/services/orders';
import { useTunzaaAuth } from '../../../src/contexts/TunzaaAuthContext';

export default function RateDeliveryScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams();
    const { user } = useTunzaaAuth();
    
    const { data: order, isLoading: isOrderLoading } = useGetOrder(orderId as string, !!orderId);
    const { mutateAsync: createRating, isPending: isSubmitting } = useCreateRating();

    const [rateState, setRateState] = useState(0); // 0 = Form, 1 = Success
    const [shopRating, setShopRating] = useState(0);
    const [driverRating, setDriverRating] = useState(0);

    const vendorId = order?.items?.[0]?.vendor_id;

    const StarRow = ({ rating, setRating }: { rating: number, setRating: (val: number) => void }) => (
        <View style={styles.starRow}>
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

    const handleSubmit = async () => {
        try {
            if (vendorId && user?.id) {
                // Submit Shop Rating
                await createRating({
                    entity_id: vendorId,
                    entity_type: 'vendor',
                    user_id: user.id,
                    score: shopRating,
                    content: 'Rated via order completion flow',
                });
            }
            
            // Driver rating submission could be added here if delivery ID is tracked natively
            
            setRateState(1);
        } catch (error) {
            console.error('Failed to submit rating:', error);
            // Optionally alert the user here
            setRateState(1); // Proceed to success anyway to not block user flow
        }
    };

    const handleDone = () => {
        router.push({ pathname: '/(buyer)/orders/receipt', params: { orderId } });
    };

    if (rateState === 1) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                </View>

                <View style={styles.successContent}>
                    <View style={styles.successIconWrapper}>
                        <Ionicons name="star" size={40} color="#425BA4" />
                    </View>

                    <Text style={styles.successTitle}>Thanks for rating!</Text>
                    <Text style={styles.successText}>
                        We're grateful for your trust in our service! Your satisfaction is our priority.
                    </Text>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleDone}>
                        <Text style={styles.submitBtnText}>Done Reviewing</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rate</Text>
                <View style={{ width: 40 }} />
            </View>

            {isOrderLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#425BA4" />
                </View>
            ) : (
                <View style={styles.formContent}>
                    <Text style={styles.ratingQuestion}>
                        How would you rate your experience with {order?.items?.[0]?.vendor_id ? 'the vendor' : 'the shop'}?
                    </Text>
                    <StarRow rating={shopRating} setRating={setShopRating} />

                    <Text style={[styles.ratingQuestion, { marginTop: 40 }]}>
                        How would you rate your delivery experience?
                    </Text>
                    <StarRow rating={driverRating} setRating={setDriverRating} />
                </View>
            )}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, (shopRating === 0 || driverRating === 0 || isSubmitting) && styles.submitBtnDisabled]}
                    disabled={shopRating === 0 || driverRating === 0 || isSubmitting}
                    onPress={handleSubmit}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitBtnText}>Leave Feedback</Text>
                    )}
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    formContent: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 40,
        alignItems: 'center',
    },
    ratingQuestion: {
        fontSize: 16,
        color: '#1A1A1A',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    starRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    submitBtn: {
        backgroundColor: '#425BA4',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
        width: '100%',
    },
    submitBtnDisabled: {
        backgroundColor: '#A5B4FC',
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Success View
    successContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    successIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    successText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
});
