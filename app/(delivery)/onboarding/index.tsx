import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text } from '@/components/ui/text';
import { DeliveryForm, type DeliveryFormData } from '@/components/forms/DeliveryForm';
import { useCreateDeliveryPartner } from '@/src/services/auth';
import { useTunzaaAuth } from '@/src/contexts/TunzaaAuthContext';

export default function DeliveryOnboarding() {
    const router = useRouter();
    const { user, refreshProfile } = useTunzaaAuth();
    const createDeliveryPartner = useCreateDeliveryPartner();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: DeliveryFormData) => {
        if (!user) {
            Alert.alert('Error', 'User not found. Please log in again.');
            return;
        }

        setIsSubmitting(true);
        try {
            const deliveryData: any = {
                user: {
                    user_id: user.user_id || user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number,
                },
                type: data.formType,
                name: data.businessName || `${user.first_name} ${user.last_name}`,
                commission_percent: 0,
            };

            await createDeliveryPartner.mutateAsync({
                userId: user.user_id || user.id,
                data: deliveryData,
            });

            // Mark onboarding as complete
            await AsyncStorage.removeItem('HAS_PENDING_DELIVERY_ONBOARDING');
            await AsyncStorage.setItem('LAST_PORTAL', 'delivery');
            await refreshProfile();

            Alert.alert('Success', 'Your delivery partner profile has been created!', [
                {
                    text: 'Continue to Dashboard',
                    onPress: () => router.replace('/(delivery)'),
                },
            ]);
        } catch (error: any) {
            console.error('Failed to create delivery profile:', error);
            Alert.alert('Error', error.message || 'Failed to complete profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Complete Delivery Profile</Text>
                        <Text style={styles.subtitle}>
                            Set up your delivery details to start receiving requests
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <DeliveryForm onSubmit={handleSubmit} isLoading={isSubmitting} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        fontFamily: 'Gilroy-Bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    formContainer: {
        flex: 1,
    },
});
