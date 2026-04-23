import React from "react";
import { View, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { StoresList } from "@/components/shop/StoresList";
import { useI18n } from "@/hooks/useI18n";

export default function WingaStoresScreen() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          {t("winga.partner_stores")}
        </Text>
        <View className="w-6" />
      </View>
      
      <StoresList 
        mode="affiliate" 
        title={t("winga.partner_stores")}
        showHeader={true}
        showBackButton={false}
      />
    </SafeAreaView>
  );
}
