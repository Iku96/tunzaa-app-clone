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
        // Add small delay so user can see the green selection highlight before navigating
        setTimeout(() => router.push('/role'), 200);
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

                                const isSelected = locale === lang.code;

                                return (
                                    <Pressable
                                        key={lang.code}
                                        style={[
                                            styles.languageOption,
                                            index === SUPPORTED_LANGUAGES.length - 1 && styles.languageOptionLast,
                                            isSelected && styles.languageOptionSelected,
                                        ]}
                                        onPress={() => handleLanguageSelect(lang.code)}
                                        accessibilityLabel={`Select ${lang.nativeName || lang.name}`}
                                        accessibilityRole="button"
                                    >
                                        <Text style={[
                                            styles.languageText,
                                            isSelected && styles.languageTextSelected,
                                        ]}>
                                            {displayName}
                                        </Text>
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
        paddingVertical: 14, // Closer to Figma screenshot
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB', // Lighter divider
        backgroundColor: '#EEF2FF',
    },
    languageOptionLast: {
        borderBottomWidth: 0,
        paddingBottom: 14, // Consistent padding
    },
    languageOptionSelected: {
        backgroundColor: '#00C853', // Solid green bar for selected language
    },
    languageText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#374151',
        textAlign: 'center',
    },
    languageTextSelected: {
        color: '#FFFFFF', // White text on green
        fontWeight: '600',
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
        color: '#4A6CF7', // Blue to match Figma
        fontSize: 16,
        marginRight: 6,
    },
    skipChevron: {
        color: '#4A6CF7', // Blue to match Figma
        fontSize: 16,
    },
});
