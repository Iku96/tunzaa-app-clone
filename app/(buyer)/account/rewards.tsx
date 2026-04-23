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
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";

const RewardsScreen = () => {
  const { width: screenWidth } = useWindowDimensions();
  // useWindowDimensions updates dynamically :contentReference[oaicite:6]{index=6}
  const isDesktop = Platform.OS === "web" && screenWidth >= 1024;
  const { t } = useI18n();

  // Set max content width for desktop layout
  const contentWidth = isDesktop ? 800 : "100%";

  const queryClient = useQueryClient();
  const resolvedColors = useResolvedThemeColors();

     usePageTitle(t("account.rewards_referrals"));
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
      <DesktopLayoutWrapper
                    showSidebar={false}
                    showNavBar={true}
                    showFooter={true}
                    containerClassName="bg-white"
                  >
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          {t("account.rewards_referrals")}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        {/* Rewards & Referrals Card */}
        <View className="px-6 mt-4">
          <RewardsCard />
        </View>
      </ScrollView>
    </SafeAreaView>
    </DesktopLayoutWrapper>
  );
};

export default RewardsScreen;
