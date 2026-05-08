/**
 * ============================================================================
 * ROOT ENTRY & SPLASH SCREEN
 * ============================================================================
 * * Purpose: Acts as the primary entry point for the Tunzaa App. 
 * It displays the splash screen logo and handles the initial routing logic
 * to determine which dashboard the user should land on.
 * * Architecture Note (For New Devs):
 * Tunzaa is a multi-role application (Buyer, Vendor, Delivery, Winga).
 * To prevent the backend from forcefully defaulting a multi-role user to 
 * the 'buyer' dashboard on every app reload, we use a two-tier routing check:
 * * 1. Local Storage ('LAST_PORTAL'): Checks if the user explicitly logged into
 * a specific portal recently.
 * 2. Backend Role ('activeProfileRole'): Fallback if no local preference exists.
 * * ============================================================================
 */

import { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTunzaaAuth } from '../src/contexts/TunzaaAuthContext';

export default function WelcomeScreen() {
    const router = useRouter();

    // Pull authentication state and user metadata from global context
    const { isAuthenticated, isLoading, user } = useTunzaaAuth();

    useEffect(() => {
        // Guard: Wait for the AuthContext to finish restoring the session from SecureStore
        if (isLoading) return;

        /**
         * checkRouting: Determines the correct post-splash destination.
         */
        const checkRouting = async () => {
            // Check if user has finished the initial language/role selection
            const hasFinishedOnboarding = await AsyncStorage.getItem('HAS_FINISHED_ONBOARDING');
            
            // If they haven't finished onboarding, always force language selection
            if (!hasFinishedOnboarding) {
                console.log('🚀 [Splash] Onboarding not finished, navigating to language selection');
                router.replace('/language');
                return;
            }

            // If user has a valid session token and user data
            if (isAuthenticated && user) {
                const role = user.activeProfileRole;
                const lastPortal = await AsyncStorage.getItem('LAST_PORTAL');
                
                const merchantProfile = user.profiles?.find((p: any) => ['vendor', 'merchant', 'business'].includes(p.role?.toLowerCase() || ''));
                const hasMerchantProfile = !!merchantProfile;
                const hasDeliveryProfile = user.profiles?.some((p: any) => ['delivery', 'driver', 'delivery_partner'].includes(p.role?.toLowerCase() || ''));

                console.log(`🚀 [Splash] Auth found. Server Role: ${role}, Last Local Portal: ${lastPortal}`);
                
                const hasPendingMerchantOnboarding = await AsyncStorage.getItem('HAS_PENDING_MERCHANT_ONBOARDING');
                const hasPendingDeliveryOnboarding = await AsyncStorage.getItem('HAS_PENDING_DELIVERY_ONBOARDING');
                
                // Onboarding Status Check
                const onboardingStatus = merchantProfile?.metadata?.onboarding_status || merchantProfile?.metadata?.onboardingStatus;
                const isIncompleteMerchant = hasMerchantProfile && (onboardingStatus === 'incomplete' || onboardingStatus === 'pending_onboarding');

                if (hasPendingMerchantOnboarding === 'true' || isIncompleteMerchant) {
                    // Only honor this flag if the user was actually trying to become a merchant
                    if (lastPortal === 'merchant') {
                        console.log('🚀 [Splash] Pending merchant onboarding detected, directing to onboarding...');
                        router.replace('/(vendor)/onboarding/step-1');
                        return;
                    }
                }

                if (hasPendingDeliveryOnboarding === 'true') {
                    if (lastPortal === 'delivery') {
                        console.log('🚀 [Splash] Pending delivery onboarding detected, directing to onboarding...');
                        router.replace('/(delivery)/onboarding');
                        return;
                    }
                }

                if (lastPortal === 'merchant') {
                    if (hasMerchantProfile) {
                        router.replace('/(vendor)');
                        return;
                    } else {
                        // Intent was merchant, but no profile exists -> send to onboarding directly
                        console.log('🚀 [Splash] Merchant intent but no profile, directing to onboarding step-1');
                        router.replace('/(vendor)/onboarding/step-1');
                        return;
                    }
                }

                if (lastPortal === 'delivery' && hasDeliveryProfile) {
                    router.replace('/(delivery)');
                    return;
                }

                if (lastPortal === 'delivery' && !hasDeliveryProfile) {
                    router.replace('/(delivery)/onboarding');
                    return;
                }

                if (lastPortal === 'buyer') {
                    const isFirstTimeBuyer = await AsyncStorage.getItem('IS_FIRST_TIME_BUYER');
                    if (isFirstTimeBuyer === 'true') {
                        console.log('🚀 [Splash] First-time buyer detected, directing to onboarding...');
                        router.replace('/complete-profile');
                        return;
                    }
                    router.replace('/(buyer)');
                    return;
                }

                if (lastPortal === 'affiliate' || lastPortal === 'winga') {
                    console.log('🚀 [Splash] Winga/Affiliate intent, directing to winga portal');
                    router.replace('/(winga)');
                    return;
                }

                // Fallback logic based on server roles if no LAST_PORTAL
                const isDeliveryRole = ['delivery', 'driver', 'delivery_partner'].includes(role?.toLowerCase() || '');
                const isMerchantRole = ['vendor', 'merchant', 'business'].includes(role?.toLowerCase() || '');

                if (isDeliveryRole) {
                    router.replace('/(delivery)');
                    return;
                }
                if (isMerchantRole) {
                    if (isIncompleteMerchant) {
                        router.replace('/(vendor)/onboarding/step-1');
                        return;
                    }
                    router.replace('/(vendor)');
                    return;
                }
                if (role?.toLowerCase() === 'winga') {
                    router.replace('/(winga)');
                    return;
                }

                router.replace('/(buyer)');
                return;
            }

            // No session — start from language selection.
            console.log('🚀 [Splash] No session, navigating to language selection');
            router.replace('/language');
        };

        // Artificial 1.5-second delay to ensure the splash screen branding is visible
        const timer = setTimeout(() => {
            checkRouting();
        }, 1500);

        // Cleanup the timer if the component unmounts prematurely
        return () => clearTimeout(timer);
    }, [isLoading, isAuthenticated, user]);

    // ------------------------------------------------------------------------
    // RENDER: Splash Screen UI
    // ------------------------------------------------------------------------
    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/tunzaa-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Tunzaa Logo"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2D3E66'
    },
    logo: {
        width: 185,
        height: 185
    },
});