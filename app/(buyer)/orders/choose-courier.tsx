import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronRight, Truck, Package, Info } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/hooks/useI18n";
import { deliveryApi } from "@/src/services/delivery";
import { useQuery } from "@tanstack/react-query";

type DeliveryMethod = "courier" | "pickup";

export default function ChooseCourierScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { cartId, orderId, method: initialMethod } = useLocalSearchParams();

  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod>(
    (initialMethod as DeliveryMethod) || "courier"
  );
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  // Fetch available delivery partners
  const {
    data: partnersData,
    isLoading,
  } = useQuery({
    queryKey: ["delivery-partners", "active"],
    queryFn: () =>
      deliveryApi.listPartners({
        is_active: true,
        is_available: true,
        limit: 20,
      }),
  });

  const partners = partnersData?.items || [];

  const handleContinue = () => {
    if (selectedMethod === "courier" && selectedPartnerId) {
      router.push({
        pathname: "/(buyer)/orders/delivery-address",
        params: { cartId, orderId, partnerId: selectedPartnerId },
      });
    } else if (selectedMethod === "pickup") {
      // For pickup, navigate to checkout/payment directly
      router.push({
        pathname: "/(buyer)/payment",
        params: { cartId, orderId, deliveryType: "self_pickup" },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground ml-3">Choose Your Courier</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4 pt-6">
          {/* Method Selection */}
          <Text className="text-base font-semibold text-foreground mb-4">
            Choose Your Delivery Method
          </Text>

          {/* Courier Delivery Option */}
          <TouchableOpacity
            className="flex-row items-center py-4 px-4 rounded-xl border mb-3"
            style={{
              borderColor: selectedMethod === "courier" ? "#425BA4" : "#E5E7EB",
              backgroundColor: selectedMethod === "courier" ? "#EFF6FF" : "#FFFFFF",
            }}
            onPress={() => setSelectedMethod("courier")}
          >
            <Truck size={20} color={selectedMethod === "courier" ? "#425BA4" : "#9CA3AF"} />
            <Text
              className="flex-1 text-base font-medium ml-3"
              style={{ color: selectedMethod === "courier" ? "#425BA4" : "#1F2937" }}
            >
              Courier Delivery
            </Text>
            <View
              className="w-5 h-5 rounded-full border-2 items-center justify-center"
              style={{ borderColor: selectedMethod === "courier" ? "#425BA4" : "#D1D5DB" }}
            >
              {selectedMethod === "courier" && (
                <View
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#425BA4" }}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Self Pickup Option */}
          <TouchableOpacity
            className="flex-row items-center py-4 px-4 rounded-xl border mb-6"
            style={{
              borderColor: selectedMethod === "pickup" ? "#425BA4" : "#E5E7EB",
              backgroundColor: selectedMethod === "pickup" ? "#EFF6FF" : "#FFFFFF",
            }}
            onPress={() => setSelectedMethod("pickup")}
          >
            <Package size={20} color={selectedMethod === "pickup" ? "#425BA4" : "#9CA3AF"} />
            <Text
              className="flex-1 text-base font-medium ml-3"
              style={{ color: selectedMethod === "pickup" ? "#425BA4" : "#1F2937" }}
            >
              Self Pickup
            </Text>
            <View
              className="w-5 h-5 rounded-full border-2 items-center justify-center"
              style={{ borderColor: selectedMethod === "pickup" ? "#425BA4" : "#D1D5DB" }}
            >
              {selectedMethod === "pickup" && (
                <View
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#425BA4" }}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Courier Company List (only when courier is selected) */}
          {selectedMethod === "courier" && (
            <>
              <Text className="text-base font-semibold text-foreground mb-4">
                Select your preferred delivery company
              </Text>

              {isLoading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="large" color="#425BA4" />
                </View>
              ) : partners.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-muted-foreground">No delivery partners available</Text>
                </View>
              ) : (
                partners.map((partner) => {
                  const isSelected = selectedPartnerId === partner.partner_id;
                  return (
                    <TouchableOpacity
                      key={partner.partner_id}
                      className="flex-row items-center py-4 px-4 rounded-xl border mb-3"
                      style={{
                        borderColor: isSelected ? "#425BA4" : "#E5E7EB",
                        backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                      }}
                      onPress={() => setSelectedPartnerId(partner.partner_id)}
                    >
                      {/* Partner Avatar/Logo */}
                      <View className="w-12 h-12 rounded-full bg-muted items-center justify-center overflow-hidden">
                        {partner.profile_picture ? (
                          <Image
                            source={{ uri: partner.profile_picture }}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <Truck size={24} color="#9CA3AF" />
                        )}
                      </View>

                      <View className="flex-1 ml-3">
                        <Text className="text-base font-semibold text-foreground">
                          {partner.name}
                        </Text>
                        {partner.vehicle_info && (
                          <Text className="text-xs text-muted-foreground">
                            {partner.vehicle_info.details || partner.vehicle_info.vehicle_type_id}
                          </Text>
                        )}
                      </View>

                      <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          )}

          {/* Delivery Information Note */}
          <View
            className="rounded-xl p-4 mt-4 mb-6"
            style={{ backgroundColor: "#EFF6FF" }}
          >
            <View className="flex-row items-start">
              <Info size={16} color="#425BA4" className="mt-0.5" />
              <View className="flex-1 ml-2">
                <Text className="text-sm font-semibold mb-1" style={{ color: "#425BA4" }}>
                  Delivery Information
                </Text>
                <Text className="text-xs" style={{ color: "#6B7280" }}>
                  All delivery costs are calculated based on distance to your location. Make sure
                  the delivery person calls you first before arriving.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-4 pb-8 pt-4 border-t border-border bg-background">
        <TouchableOpacity
          className="py-4 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: "#425BA4",
            opacity:
              selectedMethod === "courier" && !selectedPartnerId ? 0.5 : 1,
          }}
          onPress={handleContinue}
          disabled={selectedMethod === "courier" && !selectedPartnerId}
        >
          <Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
