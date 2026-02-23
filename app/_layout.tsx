import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { TunzaaAuthProvider } from '../src/contexts/TunzaaAuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// React Query client for API hooks (useRequestOTP, useLogin, etc.)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
        mutations: {
            retry: 0,
        },
    },
});

/**
 * Root layout component using Expo Router.
 * Wraps the app in LanguageProvider, AuthProvider (Supabase), TunzaaAuthProvider (Tunzaa API),
 * and QueryClientProvider for React Query hooks.
 *
 * Note: screenOptions use explicit boolean values (e.g. headerShown: false)
 * to avoid Android native layer "String cannot be cast to Boolean" when
 * props are serialized across the bridge.
 */
export default function RootLayout() {
    const [loaded, error] = useFonts({
        'Gilroy-SemiBold': require('../assets/fonts/Gilroy-SemiBold.ttf'),
        'Calibri': require('../assets/fonts/Calibri Regular.ttf'),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <AuthProvider>
                    <TunzaaAuthProvider>
                        <StatusBar style="light" backgroundColor="#2D3E66" />
                        <Stack
                            screenOptions={{
                                headerShown: false as const,
                                gestureEnabled: true,
                                animation: 'default',
                                animationTypeForReplace: 'push',
                            }}
                        />
                    </TunzaaAuthProvider>
                </AuthProvider>
            </LanguageProvider>
        </QueryClientProvider>
    );
}
