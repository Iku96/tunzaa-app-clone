import React, { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useTunzaaAuth } from '../../contexts/TunzaaAuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AuthGuard — Centralized role-based navigation protection.
 * 
 * Architecture (matching legacy_client/hooks/useRouting.ts pattern):
 * - Uses isNavigatingRef to prevent cascade navigations from rapid state changes.
 * - Uses lastNavigationRef to avoid re-navigating to the same destination.
 * - Recognizes delivery auth screens (login/register/otp) even though they live
 *   inside the (delivery) group.
 */

// Top-level auth screen names (not inside any protected group)
const TOP_LEVEL_AUTH_SCREENS = [
    'language',
    'role',
    'mauzo-intro',
    'login',
    'register',
    'otp',
    'forgot-password',
    'reset-password',
    'login-apple',
    'login-facebook',
    'login-x',
];

// Auth screens that live inside protected groups but should be accessible pre-login
const NESTED_AUTH_SCREENS: Record<string, string[]> = {
    '(delivery)': ['delivery-login', 'delivery-register', 'delivery-otp'],
    '(affiliate)': ['login', 'register'],
    '(vendor)': ['onboarding'],
};

// Protected portal groups - Note: (buyer) is intentionally omitted to allow guest browsing
const PROTECTED_PORTALS = ['(vendor)', '(delivery)', '(affiliate)'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user, isLoading } = useTunzaaAuth();
    const segments = useSegments();
    const router = useRouter();

    // Debounce refs (from legacy_client/hooks/useRouting.ts)
    const isNavigatingRef = useRef(false);
    const lastNavigationRef = useRef<string | null>(null);

    // Safe navigation wrapper — prevents cascading navigations
    const safeReplace = (destination: string) => {
        if (isNavigatingRef.current || lastNavigationRef.current === destination) {
            console.log(`🛡️ [AuthGuard] Skipping duplicate nav to: ${destination}`);
            return;
        }
        isNavigatingRef.current = true;
        lastNavigationRef.current = destination;
        console.log(`🛡️ [AuthGuard] Navigating to: ${destination}`);
        router.replace(destination as any);
        // Reset the guard after navigation settles
        setTimeout(() => {
            isNavigatingRef.current = false;
        }, 300);
    };

    useEffect(() => {
        if (isLoading) return;
        if (isNavigatingRef.current) return;

        const checkNavigation = async () => {
            const currentSegment = segments[0] as string | undefined;
            const childSegment = segments[1] as string | undefined;

            // Determine if user is on an auth screen (top-level or nested)
            const isTopLevelAuth = TOP_LEVEL_AUTH_SCREENS.includes(currentSegment || '');
            const isNestedAuth = currentSegment && childSegment
                ? (NESTED_AUTH_SCREENS[currentSegment] || []).includes(childSegment)
                : false;
            const isOnAuthScreen = isTopLevelAuth || isNestedAuth;

            // Is current route a protected portal?
            const isProtectedPortal = PROTECTED_PORTALS.includes(currentSegment || '');

            // ──────────────────────────────────────────────────────
            // CASE 1: NOT AUTHENTICATED
            // ──────────────────────────────────────────────────────
            if (!isAuthenticated) {
                // Allow auth screens (login, register, etc.) and non-protected routes
                if (isOnAuthScreen || !isProtectedPortal) {
                    return; // Let them stay
                }

                // Eject from protected portals
                console.log('🛡️ [AuthGuard] Ejecting unauthenticated user from protected portal');
                safeReplace('/language');
                return;
            }

            // ──────────────────────────────────────────────────────
            // CASE 2: AUTHENTICATED — redirect away from auth screens
            // ──────────────────────────────────────────────────────
            if (!isOnAuthScreen) {
                return; // Already in a valid authenticated route, nothing to do
            }

            // User is authenticated but sitting on an auth screen — route them to their portal
            const lastPortal = await AsyncStorage.getItem('LAST_PORTAL');
            const role = user?.activeProfileRole || user?.active_profile_role;
            const hasVendorProfile = user?.profiles?.some((p: any) =>
                ['vendor', 'merchant', 'business'].includes((p.role || '').toLowerCase())
            );
            const hasDeliveryProfile = user?.profiles?.some((p: any) =>
                ['delivery', 'driver', 'delivery_partner'].includes((p.role || '').toLowerCase())
            );

            console.log(`🛡️ [AuthGuard] Authenticated on auth screen. Last: ${lastPortal}, Role: ${role}, HasDelivery: ${hasDeliveryProfile}, HasVendor: ${hasVendorProfile}`);

            // Priority 1: Explicit LAST_PORTAL preference
            if (lastPortal === 'delivery') {
                if (hasDeliveryProfile) {
                    return safeReplace('/(delivery)/home');
                } else {
                    return safeReplace('/(delivery)/delivery-company-details');
                }
            }
            if (lastPortal === 'merchant') {
                if (hasVendorProfile) {
                    return safeReplace('/(vendor)/dashboard');
                } else {
                    return safeReplace('/(vendor)/onboarding/step-2');
                }
            }
            if (lastPortal === 'buyer') {
                const isFirstTimeBuyer = await AsyncStorage.getItem('IS_FIRST_TIME_BUYER');
                if (isFirstTimeBuyer) {
                    return safeReplace('/complete-profile');
                }
                return safeReplace('/(buyer)');
            }

            // Priority 2: Server role (no explicit portal preference)
            if (!lastPortal) {
                const isDeliveryRole = ['delivery', 'driver', 'delivery_partner'].includes((role || '').toLowerCase());
                const isMerchantRole = ['vendor', 'merchant', 'business'].includes((role || '').toLowerCase());

                if (isDeliveryRole && hasDeliveryProfile) {
                    return safeReplace('/(delivery)/home');
                }
                if (isMerchantRole && hasVendorProfile) {
                    return safeReplace('/(vendor)/dashboard');
                }
            }

            // Default fallback: Buyer
            const isFirstTimeBuyer = await AsyncStorage.getItem('IS_FIRST_TIME_BUYER');
            if (isFirstTimeBuyer) {
                safeReplace('/complete-profile');
            } else {
                safeReplace('/(buyer)');
            }
        };

        checkNavigation();
    }, [isAuthenticated, user, segments, isLoading]);

    return <>{children}</>;
}
