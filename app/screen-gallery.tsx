import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Screen Gallery - Quick Navigation to All Screens
 * Development tool for testing screens
 */
export default function ScreenGallery() {
    const router = useRouter();

    const screens = [
        { name: 'Sign In (Welcome Back)', route: '/login' },
        { name: 'OTP Verification', route: '/otp' },
        { name: 'Login with Apple', route: '/login-apple' },
        { name: 'Login with X', route: '/login-x' },
        { name: 'Register', route: '/register' },
        { name: 'Terms & Conditions', route: '/terms' },
        { name: 'Forgot Password', route: '/forgot-password' },
        { name: 'Choose Role', route: '/role' },
        { name: 'Choose Language', route: '/language' },
        { name: 'Home', route: '/home' },
    ];

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>🎨 Screen Gallery</Text>
                <Text style={styles.subtitle}>Tap any screen to view</Text>

                <View style={styles.screensContainer}>
                    {screens.map((screen, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.screenButton}
                            onPress={() => router.push(screen.route as any)}
                        >
                            <Text style={styles.screenName}>{screen.name}</Text>
                            <Text style={styles.screenRoute}>{screen.route}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.footer}>Development Tool • Not for Production</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    container: {
        flex: 1,
        padding: 20,
    },

    header: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1D1E1F',
        marginBottom: 8,
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 32,
    },

    screensContainer: {
        gap: 12,
    },

    screenButton: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },

    screenName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1E1F',
        marginBottom: 4,
    },

    screenRoute: {
        fontSize: 14,
        color: '#3B5191',
        fontFamily: 'monospace',
    },

    footer: {
        marginTop: 40,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 12,
        color: '#9CA3AF',
    },
});
