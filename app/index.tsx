import { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTunzaaAuth } from '../src/contexts/TunzaaAuthContext';

/**
 * Welcome Screen (Splash)
 * 
 * Specs from Figma:
 * - Background: #2D3E66 (brand-primary)
 * - Logo: 185x185px, centered
 * - Auto-navigates based on auth session after splash delay
 */
export default function WelcomeScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useTunzaaAuth();

    useEffect(() => {
        if (isLoading) return; // Wait for session restoration

        const timer = setTimeout(() => {
            // Always show the language selection screen first on app load,
            // regardless of auth state. The language screen leads to the role screen.
            console.log('🚀 [Splash] Navigating to language selection');
            router.replace('/language');
        }, 1500);

        return () => clearTimeout(timer);
    }, [isLoading, isAuthenticated, user]);

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
        backgroundColor: '#2D3E66',
    },
    logo: {
        width: 185,
        height: 185,
    },
});
