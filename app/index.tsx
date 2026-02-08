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

            if (!session) {
                router.replace('/language');
                return;
            }

            // Fetch profile to check onboarding status
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!profile) {
                // Fallback if no profile exists
                router.replace('/language');
                return;
            }

            const role = profile.role || 'buyer';
            const step = profile.onboarding_step || 'started';

            if (role === 'merchant') {
                if (step === 'completed' || step === 'step-4') {
                    router.replace('/(merchant)/live-orders');
                } else if (step === 'step-3') {
                    router.replace('/(merchant)/onboarding/step-4');
                } else if (step === 'step-2') {
                    router.replace('/(merchant)/onboarding/step-3');
                } else if (step === 'step-1') {
                    router.replace('/(merchant)/onboarding/step-2');
                } else {
                    router.replace('/(merchant)/onboarding/step-1');
                }
            } else {
                // Buyer
                if (step === 'completed' || step === 'step-3') {
                    router.replace('/(buyer)/home');
                } else if (step === 'step-2') {
                    router.replace('/(buyer)/onboarding/step-3');
                } else if (step === 'step-1') {
                    router.replace('/(buyer)/onboarding/step-2');
                } else {
                    router.replace('/(buyer)/onboarding/step-1');
                }
            }

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
