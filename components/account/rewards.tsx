import React from "react";
import { View, ScrollView, Platform, useWindowDimensions } from "react-native";
import { TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import RoleSwitcher from "@/components/RoleSwitcher";
import { LanguageSelector } from "@/components/modals/LanguageSelector";
import { RewardsCardWrapper } from "@/components/rewards";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { RewardsCard } from "@/components/rewards/RewardsCard";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

const RewardsScreen = () => {
  const { width: screenWidth } = useWindowDimensions();
  // useWindowDimensions updates dynamically :contentReference[oaicite:6]{index=6}
  const isDesktop = Platform.OS === "web" && screenWidth >= 1024;

  // Set max content width for desktop layout
  const contentWidth = isDesktop ? 800 : "100%";

  const queryClient = useQueryClient();
  const resolvedColors = useResolvedThemeColors();
  // const queryClient = useQueryClient();

  // // Simplified focus effect with error handling
  // useFocusEffect(
  //   useCallback(() => {
  //     // Only invalidate queries if queryClient is available and ready
  //     if (queryClient) {
  //       try {
  //         // Use a small delay to ensure contexts are ready
  //         const timer = setTimeout(() => {
  //           queryClient.invalidateQueries({ queryKey: ['rewards', 'balance'] });
  //           queryClient.invalidateQueries({ queryKey: ['rewards', 'referral-code'] });
  //         }, 150);
          
  //         return () => clearTimeout(timer);
  //       } catch (error) {
  //         console.error("Error invalidating queries:", error);
  //       }
  //     }
  //   }, [queryClient])
  // );

  return (
      <>
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>

      <ScrollView className="flex-1">
        {/* Rewards & Referrals Card */}
        <View className="px-6 mt-0">
          <RewardsCard />
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
};

export default RewardsScreen;
