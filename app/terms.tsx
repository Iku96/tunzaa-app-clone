import { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Terms & Conditions Screen (Pixel-Perfect Figma Implementation)
 * 
 * Layout:
 * - ScrollView for vertical overflow
 * - Content wrapper with maxWidth 353px, centered
 * - 23px gaps between major sections
 * - Exact typography and spacing from Figma
 */
export default function TermsScreen() {
    const router = useRouter();

    const handleTermsPress = () => {
        // TODO: Navigate to detailed terms page or open external link
        console.log('Terms and Conditions pressed');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.contentWrapper}>
                    {/* Header */}
                    <Text style={styles.header}>Karibu Tunzaa</Text>

                    {/* Hero Image with Floating Badge */}
                    <View style={styles.heroContainer}>
                        <Image
                            source={require('../assets/terms-and-conditions.png')}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        {/* Floating Badge - Absolute Position */}
                        <View style={styles.floatingBadge}>
                            <Image
                                source={require('../assets/blue-tunzaa-logo.png')}
                                style={styles.badgeLogo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Privacy Icon Blob */}
                    <View style={styles.privacyBlob}>
                        <Ionicons name="at-circle-outline" size={24} color="#3B5191" />
                    </View>

                    {/* Main Headline */}
                    <Text style={styles.headline}>
                        Respecting your privacy is our priority.
                    </Text>

                    {/* Terms Link */}
                    <TouchableOpacity onPress={handleTermsPress}>
                        <Text style={styles.termsLink}>Terms and Conditions</Text>
                    </TouchableOpacity>

                    {/* Published Date */}
                    <Text style={styles.publishedDate}>
                        Published on: April 17, 2021
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 20,  // Figma: 20px from screen edges
        paddingTop: 20,
        paddingBottom: 40,
    },

    // Content wrapper - constrains to Figma width
    contentWrapper: {
        width: '100%',
        maxWidth: 353,
        alignSelf: 'center',
    },

    // HEADER
    header: {
        fontFamily: 'System',  // Figma: Gilroy SemiBold
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 35,
        letterSpacing: 0.1,
        color: '#1E1E1E',
        textAlign: 'center',
        marginBottom: 23,  // Figma: Gap to hero image
    },

    // HERO IMAGE SECTION
    heroContainer: {
        width: 353,
        height: 239,
        position: 'relative',
        marginBottom: 23,  // Figma: Gap to privacy blob
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        overflow: 'hidden',
    },

    heroImage: {
        width: '100%',
        height: '100%',
    },

    // FLOATING BADGE (ABSOLUTE)
    floatingBadge: {
        position: 'absolute',
        right: 5,
        bottom: 9,
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#FFFFFF',
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },

    badgeLogo: {
        width: 48,
        height: 48,
    },

    // PRIVACY ICON BLOB
    privacyBlob: {
        width: 113,
        height: 113,
        borderRadius: 21,
        backgroundColor: '#EDF0F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 23,  // Figma: Gap to headline
    },

    // MAIN HEADLINE
    headline: {
        fontFamily: 'System',  // Figma: Gilroy Bold
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 32,  // 100% of font size
        letterSpacing: 0.01,
        color: '#3B5191',
        width: 201,
        marginBottom: 23,  // Figma: Gap to terms link
    },

    // TERMS LINK
    termsLink: {
        fontFamily: 'System',  // Figma: Gilroy SemiBold
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 35,
        letterSpacing: 0.1,
        color: '#3B5191',
        marginBottom: 8,  // Small gap to published date
    },

    // PUBLISHED DATE
    publishedDate: {
        fontFamily: 'System',  // Figma: Calibri
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 14,  // 100% of font size
        letterSpacing: 0.01,
        color: '#191B1F',
    },
});
