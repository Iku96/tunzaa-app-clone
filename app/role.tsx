import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Role Selection Screen
 * 
 * Specs from Figma:
 * - Background: White
 * - Back arrow + "Choose what describes you best" header
 * - Tunzaa logo (centered)
 * - Description text (centered, muted)
 * - "I'm a buyer" button (blue/brand-accent)
 * - "OR" separator
 * - "I'm a business" button (green/brand-green) with arrow
 * - "Skip" link at bottom
 */
export default function RoleScreen() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    const handleBuyerSelect = () => {
        // TODO: Set user role to 'buyer' and navigate to main app
        router.push('/home');
    };

    const handleBusinessSelect = () => {
        // TODO: Set user role to 'merchant' and navigate to business onboarding
        router.push('/home');
    };

    const handleSkip = () => {
        router.push('/home');
    };

    return (
        <View style={styles.container}>
            {/* Header with Back Arrow */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose what describes you best</Text>
            </View>

            {/* Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/tunzaa-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                    accessibilityLabel="Tunzaa Logo"
                />
            </View>

            {/* Description */}
            <Text style={styles.description}>
                Achieve your financial goals through a save-to-buy model.{'\n'}
                Businesses sell, deliver and offer financial services.
            </Text>

            {/* Buttons Container */}
            <View style={styles.buttonsContainer}>
                {/* I'm a buyer button */}
                <TouchableOpacity
                    onPress={handleBuyerSelect}
                    style={styles.buyerButton}
                    accessibilityLabel="I'm a buyer"
                    accessibilityRole="button"
                >
                    <Text style={styles.buyerButtonText}>I'm a buyer</Text>
                </TouchableOpacity>

                {/* OR separator */}
                <Text style={styles.orText}>OR</Text>

                {/* I'm a business button */}
                <TouchableOpacity
                    onPress={handleBusinessSelect}
                    style={styles.businessButton}
                    accessibilityLabel="I'm a business"
                    accessibilityRole="button"
                >
                    <Text style={styles.businessButtonText}>I'm a business</Text>
                    <Text style={styles.businessArrow}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Skip Link */}
            <View style={styles.skipContainer}>
                <TouchableOpacity
                    onPress={handleSkip}
                    style={styles.skipButton}
                    accessibilityLabel="Skip role selection"
                    accessibilityRole="button"
                >
                    <Text style={styles.skipText}>Skip</Text>
                    <Text style={styles.skipArrow}>→</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 48,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    backArrow: {
        fontSize: 24,
        color: '#1F2937',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 32,
    },
    logo: {
        width: 180,
        height: 70,
    },
    description: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 14,
        marginTop: 16,
        paddingHorizontal: 16,
        lineHeight: 20,
    },
    buttonsContainer: {
        marginTop: 40,
        gap: 16,
    },
    buyerButton: {
        backgroundColor: '#425BA4',
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buyerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    orText: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 14,
    },
    businessButton: {
        backgroundColor: '#22C55E',
        borderRadius: 999,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#2D3E66',
    },
    businessButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginRight: 8,
    },
    businessArrow: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    skipContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 48,
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skipText: {
        color: '#6B7280',
        fontSize: 16,
        marginRight: 4,
    },
    skipArrow: {
        color: '#6B7280',
        fontSize: 16,
    },
});
