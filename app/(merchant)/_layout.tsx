import { Stack, useRouter, useSegments } from 'expo-router';
import { useTunzaaAuth } from '../../src/contexts/TunzaaAuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function MerchantLayout() {
    const { isAuthenticated, isLoading } = useTunzaaAuth();
    const router = useRouter();
    const segments = useSegments();

    const isInsideMerchant = (segments as string[]).includes('(merchant)');
    const isOnboarding = (segments as string[]).includes('onboarding');

    useEffect(() => {
        // Only redirect if explicitly trying to access a PROTECTED merchant route while unauthenticated
        if (!isLoading && !isAuthenticated && isInsideMerchant && !isOnboarding) {
            console.log('🛡️ [MerchantLayout] Unauthorized access attempted, redirecting to splash...');
            router.replace('/');
        }
    }, [isAuthenticated, isLoading, isInsideMerchant, isOnboarding]);

    // Show loading spinner only when we are actually waiting for auth or session restoration
    // while trying to access merchant content
    if (isLoading || (!isAuthenticated && isInsideMerchant && !isOnboarding)) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#315BA9" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' }
            }}
        />
    );
}
