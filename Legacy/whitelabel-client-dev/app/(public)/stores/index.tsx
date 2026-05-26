import React from "react";
import { View, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { StoresList } from "@/components/shop/StoresList";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useResponsive } from "@/hooks/useResponsive";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function BuyerStoresScreen() {
  const router = useRouter();
  const resolvedColors = useResolvedThemeColors();
  const { isDesktop } = useResponsive();
  usePageTitle("Stores");
  return (
    <DesktopLayoutWrapper
                  showSidebar={false}
                  showNavBar={true}
                  showFooter={true}
                  containerClassName="bg-white"
                >
                 <SafeAreaView className="flex-1 bg-background">
     {!isDesktop && <View className="flex-row justify-between items-center p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          Stores
        </Text>
        <View className="w-6" />
      </View>}
      
      <StoresList 
        mode="buyer" 
        title="Stores"
        showHeader={true}
        showBackButton={false}
      />
    </SafeAreaView>  
                </DesktopLayoutWrapper>
   
  );
}
