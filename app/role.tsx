import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';

/**
 * Role Selection Screen
 *
 * User chooses whether they are a buyer or a business. All copy is translated
 * via useLanguage().t so it respects the language chosen on the language screen.
 *
 * Specs from Figma:
 * - Background: White
 * - Back arrow + translated title
 * - Tunzaa logo (centered)
 * - Description text (centered, muted)
 * - "I'm a buyer" / "I'm a business" buttons with "OR" separator
 * - Skip link at bottom
 */
export default function RoleScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    const handleBack = () => {
        router.back();
    };

    const handleBuyerSelect = () => {
        router.push({ pathname: '/register', params: { role: 'buyer' } });
    };

    const handleBusinessSelect = () => {
        router.push('/mauzo-intro');
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
                    accessibilityLabel={t.roleScreenBack}
                    accessibilityRole="button"
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.roleScreenTitle}</Text>
            </View>

            {/* Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/blue-tunzaa-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                    accessibilityLabel="Tunzaa Logo"
                />
            </View>

            {/* Description — translated */}
            <Text style={styles.description}>{t.roleScreenDescription}</Text>

            {/* Buttons Container */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    onPress={handleBuyerSelect}
                    style={styles.buyerButton}
                    accessibilityLabel={t.roleScreenBuyer}
                    accessibilityRole="button"
                >
                    <Text style={styles.buyerButtonText}>{t.roleScreenBuyer}</Text>
                </TouchableOpacity>

                <Text style={styles.orText}>{t.roleScreenOr}</Text>

                <TouchableOpacity
                    onPress={handleBusinessSelect}
                    style={styles.businessButton}
                    accessibilityLabel={t.roleScreenBusiness}
                    accessibilityRole="button"
                >
                    <Text style={styles.businessButtonText}>{t.roleScreenBusiness}</Text>
                    <Text style={styles.businessArrow}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Skip Link */}
            <View style={styles.skipContainer}>
                <TouchableOpacity
                    onPress={handleSkip}
                    style={styles.skipButton}
                    accessibilityLabel={t.roleScreenSkip}
                    accessibilityRole="button"
                >
                    <Text style={styles.skipText}>{t.roleScreenSkip}</Text>
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
        width: 111,
        height: 111,
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
