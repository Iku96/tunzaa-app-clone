import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * Root layout component using Expo Router.
 * Wraps the app in LanguageProvider so locale and translations are available everywhere.
 * Configures the navigation stack and global status bar.
 * Loads global fonts.
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
        <LanguageProvider>
            <AuthProvider>
                <StatusBar style="light" backgroundColor="#2D3E66" />
                <Stack
                    screenOptions={{
                        headerShown: false as const,
                        gestureEnabled: true,
                        animation: 'default',
                        animationTypeForReplace: 'push',
                    }}
                />
            </AuthProvider>
        </LanguageProvider>
    );
}
