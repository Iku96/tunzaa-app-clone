import { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Animated, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../src/contexts/LanguageContext';
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
        router.back();
    };

    const handleBuyerSelect = () => {
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

    const handleBusinessOptionSelect = (option: string) => {
        if (option === 'Provide delivery Services') {
            router.push({ pathname: '/mauzo-intro', params: { flow: 'delivery' } });
        } else {
            router.push('/mauzo-intro');
        }
    };

    const handleSkip = () => {
        router.push('/home');
    };

    // Interpolate rotation for chevron: 0 -> '0deg', 1 -> '90deg'
    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    const businessOptions = [
        "Sell products / Services",
        "Provide delivery Services",
        "Offer loans and financial services",
        "Join as Affiliate Marketer"
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
                    {t.roleScreenTitle || "Choose what describes you best"}
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

                {/* Wrapper View: Enforces Figma Layout (Width 282, Height 30) */}
                <View style={{ width: 282, height: 30 }}>
                    <Text
                        className="text-center text-[#666666]"
                        style={{
                            fontFamily: 'Calibri',
                            fontSize: 12,
                            lineHeight: 12,
                            letterSpacing: 0.01,
                            fontWeight: '400',
                        }}
                    >
                        {t.roleScreenDescription || "Achieve your financial goals through a save-to-buy model.\nBusinesses sell, deliver and offer financial services."}
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
                    accessibilityLabel="I'm a buyer"
                    accessibilityRole="button"
                >
                    <Text className="text-white text-[16px] font-medium">
                        {t.roleScreenBuyer || "I'm a buyer"}
                    </Text>
                </TouchableOpacity>

                {/* OR Separator */}
                <Text className="text-center text-[#6B7280] text-[14px] font-medium my-1">
                    {t.roleScreenOr || "OR"}
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
                            {t.roleScreenBusiness || "I'm a business"}
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
                                borderRadius: 20,
                                paddingHorizontal: 20,
                                paddingVertical: 20,
                                marginTop: -16,
                                paddingTop: 36,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 4,
                                zIndex: 10,
                            }}
                        >
                            {businessOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleBusinessOptionSelect(option)}
                                    style={{
                                        paddingVertical: 12,
                                        marginBottom: index < businessOptions.length - 1 ? 8 : 0,
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
                                        {option}
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
            <View className="mt-auto pt-10 pb-5 items-center justify-center">
                <TouchableOpacity
                    onPress={handleSkip}
                    className="flex-row items-center gap-x-2 p-3"
                    accessibilityLabel="Skip"
                    accessibilityRole="button"
                >
                    <Text
                        style={{
                            fontFamily: 'System',
                            fontSize: 16,
                            fontWeight: '500',
                            letterSpacing: -0.24,
                            color: '#6B7280'
                        }}
                    >
                        {t.roleScreenSkip || "Skip"}
                    </Text>
                    <ArrowRight size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </ScrollView >
    );
}