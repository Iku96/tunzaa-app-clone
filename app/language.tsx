import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Language Selection Screen
 * 
 * Specs from Figma:
 * - Background: White
 * - Title: "Choose your language" (centered)
 * - Tunzaa logo (smaller, centered)
 * - "Choose preferred language" button with chevron
 * - "Skip" link at bottom
 */
export default function LanguageScreen() {
    const router = useRouter();

    const handleLanguageSelect = () => {
        // TODO: Open language picker modal
        router.push('/role');
    };

    const handleSkip = () => {
        router.push('/role');
    };

    return (
        <View style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>Choose your language</Text>

            {/* Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/tunzaa-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                    accessibilityLabel="Tunzaa Logo"
                />
            </View>

            {/* Language Selection Button */}
            <TouchableOpacity
                onPress={handleLanguageSelect}
                style={styles.languageButton}
                accessibilityLabel="Choose preferred language"
                accessibilityRole="button"
            >
                <Text style={styles.languageButtonText}>Choose preferred language</Text>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Skip Link */}
            <View style={styles.skipContainer}>
                <TouchableOpacity
                    onPress={handleSkip}
                    style={styles.skipButton}
                    accessibilityLabel="Skip language selection"
                    accessibilityRole="button"
                >
                    <Text style={styles.skipText}>Skip</Text>
                    <Text style={styles.skipChevron}>→</Text>
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
        paddingTop: 80,
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 32,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 48,
    },
    logo: {
        width: 150,
        height: 60,
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        borderRadius: 999,
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginTop: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    languageButtonText: {
        color: '#1F2937',
        fontSize: 16,
    },
    chevron: {
        fontSize: 20,
        color: '#6B7280',
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
    skipChevron: {
        color: '#6B7280',
        fontSize: 16,
    },
});
