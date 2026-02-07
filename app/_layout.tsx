import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../src/contexts/LanguageContext';

/**
 * Root layout component using Expo Router.
 * Wraps the app in LanguageProvider so locale and translations are available everywhere.
 * Configures the navigation stack and global status bar.
 *
 * Note: screenOptions use explicit boolean values (e.g. headerShown: false)
 * to avoid Android native layer "String cannot be cast to Boolean" when
 * props are serialized across the bridge.
 */
export default function RootLayout() {
    return (
        <LanguageProvider>
            <StatusBar style="light" backgroundColor="#2D3E66" />
            <Stack
                screenOptions={{
                    headerShown: false as const,
                    gestureEnabled: true,
                    animation: 'default',
                    animationTypeForReplace: 'push',
                }}
            />
        </LanguageProvider>
    );
}
