import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MapPin, Package, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useLanguage } from "@/src/contexts/LanguageContext";

/**
 * Delivery Method screen — matches Figma "01 - Setting Screen"
 * Simple option list: {t.deliveryMethodAddAddress} / {t.deliveryMethodPickup}
 */
export default function DeliveryMethodScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { cartId, orderId } = useLocalSearchParams();

  const handleDeliveryAddress = () => {
    router.push({
      pathname: "/(buyer)/orders/choose-courier",
      params: { cartId, orderId, method: "courier" },
    });
  };

  const handleSelfPickup = () => {
    router.push({
      pathname: "/(buyer)/orders/choose-courier",
      params: { cartId, orderId, method: "pickup" },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground ml-3">{t.deliveryMethodTitle}</Text>
      </View>

      {/* Options */}
      <View className="px-4 pt-6 gap-4">
        {/* Add delivery address */}
        <TouchableOpacity
          className="flex-row items-center py-4 px-4 bg-background rounded-xl border border-border"
          onPress={handleDeliveryAddress}
        >
          <MapPin size={20} color="#9CA3AF" />
          <Text className="flex-1 text-base font-medium text-foreground ml-3">
            Add delivery address
          </Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Pick up / comes round */}
        <TouchableOpacity
          className="flex-row items-center py-4 px-4 bg-background rounded-xl border border-border"
          onPress={handleSelfPickup}
        >
          <Package size={20} color="#9CA3AF" />
          <Text className="flex-1 text-base font-medium text-foreground ml-3">
            Pick up/comes round
          </Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
