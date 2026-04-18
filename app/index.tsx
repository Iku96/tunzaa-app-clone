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
            // If user has a valid session token and user data
            if (isAuthenticated && user) {
                const role = user.activeProfileRole;

                // Fetch the local override flag to prevent being trapped in the Buyer portal
                const lastPortal = await AsyncStorage.getItem('LAST_PORTAL');
                
                // Check available profiles
                const hasMerchantProfile = user.profiles?.some((p: any) => ['vendor', 'merchant', 'business'].includes(p.role?.toLowerCase() || ''));
                const hasDeliveryProfile = user.profiles?.some((p: any) => ['delivery', 'driver', 'delivery_partner'].includes(p.role?.toLowerCase() || ''));

                console.log(`🚀 [Splash] Auth found. Server Role: ${role}, Last Local Portal: ${lastPortal}`);

                // ------------------------------------------------------------
                // TIER 1: Local Override (Highest Priority)
                // ------------------------------------------------------------
                if (lastPortal === 'merchant' && hasMerchantProfile) {
                    router.replace('/(merchant)/dashboard');
                    return;
                }
                if (lastPortal === 'delivery' && hasDeliveryProfile) {
                    router.replace('/(delivery)/home');
                    return;
                }
                if (lastPortal === 'buyer') {
                    router.replace('/(buyer)');
                    return;
                }

                // ------------------------------------------------------------
                // TIER 2: Server Role Fallback
                // ------------------------------------------------------------
                const isDeliveryRole = ['delivery', 'driver', 'delivery_partner'].includes(role?.toLowerCase() || '');
                const isMerchantRole = ['vendor', 'merchant', 'business'].includes(role?.toLowerCase() || '');

                if (isDeliveryRole) {
                    router.replace('/(delivery)/home');
                    return;
                }
                if (isMerchantRole) {
                    router.replace('/(merchant)/dashboard');
                    return;
                }
                if (role?.toLowerCase() === 'winga') {
                    router.replace('/(affiliate)/profile');
                    return;
                }

                // ------------------------------------------------------------
                // TIER 3: Default
                // ------------------------------------------------------------
                // If no specific roles match, default to the standard buyer experience
                router.replace('/(buyer)');
                return;
            }

            // If no session exists, see if they already picked a portal previously
            const lastPortal = await AsyncStorage.getItem('LAST_PORTAL');
            if (lastPortal === 'buyer') {
                console.log('🚀 [Splash] No session, but found LAST_PORTAL=buyer, navigating to buyer portal');
                router.replace('/(buyer)');
                return;
            } else if (lastPortal === 'merchant') {
                console.log('🚀 [Splash] No session, but found LAST_PORTAL=merchant, returning to login');
                router.replace('/login');
                return;
            } else if (lastPortal === 'delivery') {
                console.log('🚀 [Splash] No session, but found LAST_PORTAL=delivery, returning to delivery login');
                router.replace('/(delivery)/delivery-login');
                return;
            }

            console.log('🚀 [Splash] No session and no portal preference, navigating to language selection');
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
                source={require('../assets/tunzaa-logo.png')}
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