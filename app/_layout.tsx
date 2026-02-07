import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Root layout component using Expo Router.
 * Configures the navigation stack and global status bar.
 */
export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" backgroundColor="#2D3E66" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            />
        </>
    );
}
