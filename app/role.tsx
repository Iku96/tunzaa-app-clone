import { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Animated, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, ChevronRight, ArrowRight } from 'lucide-react-native';

/**
 * Role Selection Screen (Refactored)
 *
 * Implements "User Type Selection" design using RESPONSIVE Flexbox.
 * * Layout Strategy:
 * - Uses a vertical stack (flex-col) instead of absolute coordinates.
 * - Margins (mt-) create the vertical rhythm defined in Figma.
 * - "Hug" constraints are achieved by removing fixed widths on text containers.
 */
export default function RoleScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    // State for business dropdown toggle
    const [isBusinessExpanded, setIsBusinessExpanded] = useState(false);

    // Animation value for chevron rotation
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/language');
        }
    };

    const handleBuyerSelect = async () => {
        await AsyncStorage.setItem('HAS_FINISHED_ONBOARDING', 'true');
        await AsyncStorage.setItem('LAST_PORTAL', 'buyer');
        router.push({ pathname: '/register', params: { role: 'buyer' } });
    };

    const toggleBusinessDropdown = () => {
        const toValue = isBusinessExpanded ? 0 : 1;

        Animated.timing(rotateAnim, {
            toValue,
            duration: 200,
            useNativeDriver: true,
        }).start();

        setIsBusinessExpanded(!isBusinessExpanded);
    };

    const handleBusinessOptionSelect = async (value: string) => {
        if (value === 'delivery') {
            await AsyncStorage.setItem('HAS_FINISHED_ONBOARDING', 'true');
            await AsyncStorage.setItem('LAST_PORTAL', 'delivery');
            router.push({ pathname: '/mauzo-intro', params: { flow: 'delivery' } });
        } else if (value === 'affiliate') {
            await AsyncStorage.setItem('HAS_FINISHED_ONBOARDING', 'true');
            await AsyncStorage.setItem('LAST_PORTAL', 'affiliate');
            router.push({ pathname: '/register', params: { role: 'winga' } });
        } else if (value === 'financial') {
            await AsyncStorage.setItem('HAS_FINISHED_ONBOARDING', 'true');
            await AsyncStorage.setItem('LAST_PORTAL', 'loan');
            router.push({ pathname: '/mauzo-intro', params: { flow: 'financial' } });
        } else {
            // For "Sell products" or other business options, show intro screens first
            await AsyncStorage.setItem('HAS_FINISHED_ONBOARDING', 'true');
            await AsyncStorage.setItem('LAST_PORTAL', 'merchant');
            router.push({ pathname: '/mauzo-intro', params: { flow: value } });
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('HAS_FINISHED_ONBOARDING', 'true');
        await AsyncStorage.setItem('LAST_PORTAL', 'buyer');
        router.replace('/(buyer)');
    };

    // Interpolate rotation for chevron: 0 -> '0deg', 1 -> '-90deg'
    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-90deg'],
    });

    const businessOptions = [
        { label: t.roleScreenOptionAffiliate, value: 'affiliate' },
        { label: t.roleScreenOptionSell, value: 'sell' },
        { label: t.roleScreenOptionDelivery, value: 'delivery' },
        { label: t.roleScreenOptionFinancial, value: 'financial' }
    ];

    return (
        <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{
                flexGrow: 1, // Ensures content fills screen so 'mt-auto' works
                paddingBottom: 40 // Bottom breathing room
            }}
        >
            {/* Header Section 
              - Replaced 'top: 97' with 'pt-[60px]' to account for status bar + spacing safely
              - Replaced fixed width with padding (px-5)
            */}
            <View className="flex-row items-center px-5 pt-[60px] gap-x-4">
                <TouchableOpacity
                    onPress={handleBack}
                    className="p-1 -ml-1"
                    accessibilityLabel={t.roleScreenBack}
                    accessibilityRole="button"
                >
                    {/* CHANGED: Color updated to match Header Text (#2C3D6D) */}
                    <ArrowLeft size={24} color="#2C3D6D" />
                </TouchableOpacity>

                {/* Header Text
                   - CHANGED: Removed fixed width/height (Implemented "Hug")
                   - Flex-1 allows text to wrap if it gets too long
                */}
                <Text
                    className="text-center flex-1 mr-6" // mr-6 balances the arrow width to keep text truly centered
                    style={{
                        fontFamily: 'Gilroy-SemiBold',
                        fontWeight: '400',
                        fontSize: 20,
                        lineHeight: 35,
                        letterSpacing: 0.1,
                        color: '#2C3D6D',
                    }}
                >
                    {t.roleScreenTitle}
                </Text>
            </View>

            {/* Logo & Description Section
              - Replaced 'top: 169' with 'mt-12' (relative spacing from header)
              - Used 'items-center' to center everything horizontally
            */}
            <View className="flex-col items-center mt-12 px-10 gap-y-2">
                <Image
                    source={require('../assets/blue-tunzaa-logo.png')}
                    style={{ width: 111, height: 111 }}
                    resizeMode="contain"
                    accessibilityLabel="Tunzaa Logo"
                />

                {/* Wrapper View: Enforces Figma Layout (Width 282) but allows natural height */}
                <View style={{ width: 282 }}>
                    <Text
                        className="text-center text-[#666666]"
                        style={{
                            fontFamily: 'Gilroy-Regular',
                            fontSize: 12,
                            lineHeight: 18, // Increased line height slightly for better readability
                            letterSpacing: 0.01,
                            fontWeight: '400',
                        }}
                    >
                        {t.roleScreenDescription}
                    </Text>
                </View>
            </View>

            {/* Buttons Section
              - Replaced 'top: 350.5' with 'mt-16' (relative spacing from logo)
              - Buttons stack naturally with 'gap-y-3'
            */}
            <View className="flex-col items-center mt-16 px-5 w-full gap-y-3">
                {/* Buyer Button */}
                <TouchableOpacity
                    onPress={handleBuyerSelect}
                    style={{
                        backgroundColor: '#425BA4',
                        width: '100%', // Responsive width (fills container minus padding)
                        maxWidth: 320, // Max width constraint to match design feel on tablets
                        height: 52,
                        borderRadius: 40,
                    }}
                    className="items-center justify-center"
                    accessibilityLabel={t.roleScreenBuyer}
                    accessibilityRole="button"
                >
                    <Text className="text-white text-[16px] font-medium">
                        {t.roleScreenBuyer}
                    </Text>
                </TouchableOpacity>

                {/* OR Separator */}
                <Text className="text-center text-[#6B7280] text-[14px] font-medium my-1">
                    {t.roleScreenOr}
                </Text>

                {/* Business Button Group */}
                <View className="w-full items-center">
                    {/* Main Green Business Button */}
                    <TouchableOpacity
                        onPress={toggleBusinessDropdown}
                        style={{
                            backgroundColor: '#01AC00',
                            width: '100%',
                            maxWidth: 320,
                            height: 52,
                            borderRadius: 26,
                            zIndex: 20,
                        }}
                        className="flex-row items-center justify-center relative"
                    >
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                            {t.roleScreenBusiness}
                        </Text>

                        <Animated.View
                            style={{
                                position: 'absolute',
                                right: 24,
                                transform: [{ rotate: rotation }]
                            }}
                        >
                            <ChevronRight size={20} color="white" />
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Dropdown - Simple Text List */}
                    {isBusinessExpanded && (
                        <View
                            style={{
                                width: '100%',
                                maxWidth: 320,
                                backgroundColor: '#FFFFFF',
                                borderBottomLeftRadius: 20,
                                borderBottomRightRadius: 20,
                                paddingHorizontal: 16,
                                paddingBottom: 16,
                                marginTop: -26,
                                paddingTop: 36,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.05,
                                shadowRadius: 10,
                                elevation: 3,
                                zIndex: 10,
                            }}
                        >
                            {businessOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleBusinessOptionSelect(option.value)}
                                    style={{
                                        backgroundColor: '#F3F5F9', // Light grey/blue background for each item
                                        borderRadius: 8,
                                        paddingVertical: 14,
                                        marginTop: index === 0 ? 0 : 8,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#2C3D6D',
                                            fontSize: 14,
                                            fontWeight: '400',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

            </View>

            {/* Skip Button
              - Replaced 'top: 780' with 'mt-auto'
              - This pushes the Skip button to the bottom of the screen content
            */}
            <View className="mt-auto pt-5 pb-10 items-center justify-center">
                <TouchableOpacity
                    onPress={handleSkip}
                    className="flex-row items-center gap-x-2 p-3"
                    accessibilityLabel={t.roleScreenSkip}
                    accessibilityRole="button"
                >
                    <Text
                        style={{
                            fontFamily: 'Gilroy-Regular',
                            fontSize: 16,
                            fontWeight: '500',
                            letterSpacing: -0.24,
                            color: '#3B5191'
                        }}
                    >
                        {t.roleScreenSkip}
                    </Text>
                    <ArrowRight size={20} color="#3B5191" />
                </TouchableOpacity>
            </View>
        </ScrollView >
    );
}