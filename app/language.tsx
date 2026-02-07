import { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Image, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../src/constants/languages';

/**
 * Language Selection Screen (Redesigned)
 * 
 * Shows expanded language list by default with collapse/expand functionality.
 * User can select their preferred language from the visible list.
 * Matches demo app design.
 */
export default function LanguageScreen() {
    const router = useRouter();
    const { locale, setLocale, t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLanguageSelect = async (code: string) => {
        await setLocale(code);
        // Auto-navigate to role selection after language is set
        router.push('/role');
    };

    const handleSkip = () => {
        router.push('/role');
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
                {/* Title */}
                <Text style={styles.title}>{t.languageScreenTitle}</Text>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/blue-tunzaa-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                        accessibilityLabel="Tunzaa Logo"
                    />
                </View>

                {/* Language Picker Card */}
                <View style={styles.pickerCard}>
                    {/* Header with Collapse/Expand */}
                    <TouchableOpacity
                        style={styles.pickerHeader}
                        onPress={toggleExpand}
                        accessibilityLabel={isExpanded ? 'Collapse language list' : 'Expand language list'}
                        accessibilityRole="button"
                    >
                        <Text style={styles.pickerHeaderText}>Choose preferred language</Text>
                        <Text style={styles.chevron}>{isExpanded ? '∧' : '›'}</Text>
                    </TouchableOpacity>

                    {/* Language List (Shown when expanded) */}
                    {isExpanded && (
                        <View style={styles.languageList}>
                            {SUPPORTED_LANGUAGES.map((lang, index) => {
                                const displayName = lang.name === lang.nativeName
                                    ? lang.name
                                    : `${lang.name} (${lang.nativeName})`;

                                return (
                                    <Pressable
                                        key={lang.code}
                                        style={({ pressed }) => [
                                            styles.languageOption,
                                            index === SUPPORTED_LANGUAGES.length - 1 && styles.languageOptionLast,
                                            pressed && styles.languageOptionPressed,
                                        ]}
                                        onPress={() => handleLanguageSelect(lang.code)}
                                        accessibilityLabel={`Select ${lang.nativeName || lang.name}`}
                                        accessibilityRole="button"
                                        delayLongPress={500}
                                    >
                                        {({ pressed }) => (
                                            <Text style={[
                                                styles.languageText,
                                                pressed && styles.languageTextPressed,
                                            ]}>
                                                {displayName}
                                            </Text>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Skip Button */}
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
    },
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
        marginTop: 17,
        width: 231,
        height: 35,
        alignSelf: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 87,
        width: 111,
        height: 111,
        alignSelf: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    pickerCard: {
        marginTop: 0,
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        overflow: 'hidden',
        alignSelf: 'center',
        width: 300, // Slightly wider for better spacing
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: '#E0E7FF',
    },
    pickerHeaderText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    chevron: {
        fontSize: 18,
        color: '#1F2937',
    },
    languageList: {
        backgroundColor: '#EEF2FF',
    },
    languageOption: {
        paddingVertical: 24, // Increased to 24px for more spacious Figma-like appearance
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
        backgroundColor: '#EEF2FF',
    },
    languageOptionLast: {
        borderBottomWidth: 0,
        paddingBottom: 24, // Ensure last item has bottom padding
    },
    languageOptionPressed: {
        backgroundColor: '#00C853', // Bright green on press (matching demo)
    },
    languageText: {
        fontSize: 15,
        lineHeight: 22, // Added line height for better spacing
        color: '#374151',
        textAlign: 'center',
    },
    languageTextPressed: {
        color: '#FFFFFF', // White text on green background for better contrast
    },
    skipContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 48,
        paddingHorizontal: 24,
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
