import { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Image, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPORTED_LANGUAGES } from '../src/constants/languages';
import { ChevronRight, ChevronUp, ArrowRight } from 'lucide-react-native';

export default function LanguageScreen() {
    const router = useRouter();
    const { locale, setLocale, t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(true);

    const handleLanguageSelect = async (code: string) => {
        await setLocale(code as any);
        // Mark language as selected (part of onboarding)
        await AsyncStorage.setItem('HAS_SELECTED_LANGUAGE', 'true');
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
                        source={require('@/assets/blue-tunzaa-logo.png')}
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
                        activeOpacity={0.7}
                        accessibilityLabel={isExpanded ? 'Collapse language list' : 'Expand language list'}
                        accessibilityRole="button"
                    >
                        <Text style={styles.pickerHeaderText}>{t.languageScreenChoosePreferred}</Text>
                        {isExpanded 
                            ? <ChevronUp size={20} color="#1F2937" /> 
                            : <ChevronRight size={20} color="#1F2937" />
                        }
                    </TouchableOpacity>

                    {/* Language List */}
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
                        <Text style={styles.skipText}>{t.languageScreenSkip}</Text>
                        <ArrowRight size={18} color="#3B5191" />
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
        fontFamily: 'Gilroy-SemiBold',
        fontSize: 20,
        fontWeight: '600',
        color: '#1D1E1F',
        marginTop: 17,
        alignSelf: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 65,
        alignSelf: 'center',
        width: 260, // Increased size still
        height: 95,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    pickerCard: {
        marginTop: 40,
        backgroundColor: '#F3F4F6', // Dimmed background
        borderRadius: 12,
        overflow: 'hidden',
        alignSelf: 'center',
        width: 310, // Not full width! Maintained narrow look
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: '#F3F4F6',
    },
    pickerHeaderText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    languageList: {
        backgroundColor: '#F3F4F6',
    },
    languageOption: {
        paddingVertical: 18, // Increased padding makes the box longer (taller) instead of wider
        paddingHorizontal: 20,
        borderBottomWidth: 0, // No border as requested
        backgroundColor: '#F3F4F6',
    },
    languageOptionLast: {
        paddingBottom: 18,
    },
    languageOptionSelected: {
        backgroundColor: '#00C853', // Solid green bar for default
    },
    languageText: {
        fontSize: 14,
        color: '#2C3D6D',
        textAlign: 'center',
        fontWeight: '400',
    },
    languageTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
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
        gap: 6,
    },
    skipText: {
        color: '#3B5191',
        fontSize: 16,
        fontWeight: '500',
    },
});
