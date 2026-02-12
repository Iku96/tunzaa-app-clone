import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, ArrowRight } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useLanguage } from '../contexts/LanguageContext';

export default function UserTypeSelection() {
    const router = useRouter();
    const { t } = useLanguage();
    const [isBusinessExpanded, setIsBusinessExpanded] = useState(false);
    const rotation = useSharedValue(0);

    const handleBack = () => {
        router.back();
    };

    const handleBuyerSelect = () => {
        router.push({ pathname: '/register', params: { role: 'buyer' } });
    };

    const toggleBusinessDropdown = () => {
        const newValue = !isBusinessExpanded;
        setIsBusinessExpanded(newValue);
        rotation.value = withTiming(newValue ? 90 : 0, { duration: 200 });
    };

    const handleBusinessOptionClick = (option: string) => {
        // For now, all business options leverage the existing flow or could pass params
        // The original implementation just pushed to /mauzo-intro
        router.push('/mauzo-intro');
    };

    const handleSkip = () => {
        router.push('/(buyer)');
    };

    const animatedChevronStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    return (
        <View className="flex-1 bg-white px-6 pt-12">
            {/* Header */}
            <View className="flex-row items-center mb-8">
                <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
                    <ArrowRight className="text-gray-800" size={24} style={{ transform: [{ rotate: '180deg' }] }} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-800 ml-2">
                    {t.roleScreenTitle || "Choose what describes you best"}
                </Text>
            </View>

            {/* Logo */}
            <View className="items-center mt-8 mb-4">
                <Text
                    style={{ color: '#425BA4', letterSpacing: 1, fontSize: 40, fontFamily: 'System', fontWeight: 'bold' }}
                >
                    TUNZAA
                </Text>
            </View>

            {/* Description */}
            <Text className="text-center text-gray-500 text-sm px-4 leading-5 mb-10">
                {t.roleScreenDescription || "Achieve your financial goals through a save-to-buy model.\nBusinesses sell, deliver and offer financial services."}
            </Text>

            {/* Buttons Container */}
            <View className="gap-4">
                {/* Buyer Button */}
                <TouchableOpacity
                    onPress={handleBuyerSelect}
                    style={{ backgroundColor: '#425BA4' }}
                    className="rounded-full py-4 items-center w-full shadow-none border-0"
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-base font-medium">
                        {t.roleScreenBuyer || "I'm a buyer"}
                    </Text>
                </TouchableOpacity>

                {/* OR Divider */}
                <Text className="text-center text-gray-500 text-sm py-1">
                    {t.roleScreenOr || "OR"}
                </Text>

                {/* Business Button */}
                <TouchableOpacity
                    onPress={toggleBusinessDropdown}
                    style={{ backgroundColor: '#22C55E' }}
                    className="rounded-full py-4 flex-row items-center justify-center w-full relative shadow-none border-0"
                    activeOpacity={0.9}
                >
                    <Text className="text-white text-base font-medium">
                        {t.roleScreenBusiness || "I'm a business"}
                    </Text>
                    <Animated.View style={[animatedChevronStyle, { position: 'absolute', right: 24 }]}>
                        <ChevronRight color="white" size={24} />
                    </Animated.View>
                </TouchableOpacity>

                {/* Business Options Dropdown */}
                {isBusinessExpanded && (
                    <View className="gap-3 mt-2">
                        {[
                            "Sell products / Services",
                            "Provide delivery Services",
                            "Offer loans and financial services",
                            "Join as Affiliate Marketer"
                        ].map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleBusinessOptionClick(option)}
                                className="bg-gray-50 rounded-full py-3.5 border border-gray-200 items-center justify-center"
                            >
                                <Text className="text-gray-700 text-sm font-medium">{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Skip Link */}
            <View className="flex-1 justify-end items-center pb-12 mt-8">
                <TouchableOpacity
                    onPress={handleSkip}
                    className="flex-row items-center p-2"
                >
                    <Text className="text-gray-500 text-base mr-2">
                        {t.roleScreenSkip || "Skip"}
                    </Text>
                    <ArrowRight color="#6B7280" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
