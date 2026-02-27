import { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';

/**
 * Welcome Screen (Splash)
 * 
 * Specs from Figma:
 * - Background: #2D3E66 (brand-primary)
 * - Logo: 185x185px, centered
 * - Auto-navigates to language selection after 2 seconds
 */
export default function WelcomeScreen() {
    const router = useRouter();

    useEffect(() => {
        checkSessionAndRedirect();
    }, []);

    const checkSessionAndRedirect = async () => {
        try {
            // Give a small delay for splash effect
            await new Promise(resolve => setTimeout(resolve, 1500));

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.replace('/(buyer)');
                return;
            }

            // Also check for Tunzaa's custom auth storage
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const userData = await AsyncStorage.getItem('user_data');

            if (userData) {
                router.replace('/(buyer)');
                return;
            }

            router.replace('/language');

        } catch (e) {
            console.error('Routing error:', e);
            router.replace('/language');
        }
    };

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
