import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Dimensions,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Phone } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useGetOrder } from "@/src/services/order-management";
import { orderManagementApi } from "@/src/services/order-management";
import { useQuery } from "@tanstack/react-query";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");

const STATUS_STEPS = [
  { key: "picked_up", label: "Picked up", icon: "receipt-outline" },
  { key: "in_transit", label: "In transit", icon: "bicycle-outline" },
  { key: "delivered", label: "Delivered", icon: "home-outline" },
];

export default function TrackingScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  // Poll for order updates every 10 seconds
  const { data: orderResponse, isLoading } = useQuery({
    queryKey: ["order", orderId, "tracking"],
    queryFn: () => orderManagementApi.getOrder(orderId as string),
    enabled: !!orderId,
    refetchInterval: 10000,
  });

  // Map order status to step index
  let statusStep = 0;
  const status = orderResponse?.status?.toLowerCase();
  if (status === "shipped" || status === "in_transit" || status === "processing") {
    statusStep = 1;
  } else if (status === "delivered" || status === "completed") {
    statusStep = 2;
  }

  // Auto-navigate to rate screen when delivered
  useEffect(() => {
    if (statusStep === 2) {
      const timer = setTimeout(() => {
        router.push({ pathname: "/(buyer)/orders/rate", params: { orderId } });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusStep, orderId, router]);

  // Map region — defaults to Dar es Salaam
  const mapRegion = {
    latitude: parseFloat(orderResponse?.shipping_address?.latitude || "-6.7924"),
    longitude: parseFloat(orderResponse?.shipping_address?.longitude || "39.2083"),
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // Driver data (from delivery partner if available)
  const driverName = "Delivery Partner";
  const driverPhone = orderResponse?.shipping_address?.phone;

  const handleCall = () => {
    if (driverPhone) Linking.openURL(`tel:${driverPhone}`);
  };

  const getShopDetails = () => {
    // For now we mock the shop details as requested in the UI
    // In production, extract from orderResponse.vendor or orderResponse.items[0].vendor
    return {
      name: "Vodacom Shop",
      logo: "https://via.placeholder.com/100/FF0000/FFFFFF?text=V",
      supplierSince: "2024",
    };
  };

  const shop = getShopDetails();

  return (
    <View className="flex-1 bg-background">
      {/* Map */}
      <MapView
        style={{ width, height: height * 0.55 }}
        initialRegion={mapRegion}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
      >
        {orderResponse?.shipping_address && (
          // @ts-expect-error - react-native-maps Marker type mismatch
          <Marker
            coordinate={{
              latitude: parseFloat(orderResponse.shipping_address.latitude || "-6.7924"),
              longitude: parseFloat(orderResponse.shipping_address.longitude || "39.2083"),
            }}
            title="Delivery Location"
            description={orderResponse.shipping_address.address_line1}
          />
        )}
      </MapView>

      {/* Back Button + ETA Overlay */}
      <SafeAreaView className="absolute top-0 left-0 right-0" edges={["top"]}>
        <View className="px-4 pt-2">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-6 pb-10"
        style={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#425BA4" />
        ) : (
          <>
            {/* Drag Handle */}
            <View className="items-center mb-4">
              <View className="w-10 h-1 rounded-full bg-gray-200" />
            </View>

            {/* Status Title */}
            <Text className="text-xl font-bold text-foreground mb-1">
              {statusStep === 0
                ? "Your order is being prepared"
                : statusStep === 1
                ? "Your order is on the way"
                : "Order Delivered"}
            </Text>
            <Text className="text-sm text-muted-foreground mb-6">
              Arrives between 11:23 PM - 12:01 AM
            </Text>

            {/* Status Steps */}
            <View className="flex-row items-center justify-between mb-2 px-2">
              {STATUS_STEPS.map((step, index) => {
                const isActive = statusStep >= index;
                const { Ionicons } = require("@expo/vector-icons");
                return (
                  <React.Fragment key={step.key}>
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: isActive ? "#315BA9" : "#F3F4F6",
                      }}
                    >
                      <Ionicons
                        name={step.icon}
                        size={20}
                        color={isActive ? "#FFFFFF" : "#9CA3AF"}
                      />
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View
                        className="flex-1 h-1 mx-2 rounded-full"
                        style={{
                          backgroundColor: statusStep > index ? "#315BA9" : "#F3F4F6",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
            
            <View className="flex-row items-center justify-between mb-6">
               {STATUS_STEPS.map((step, index) => (
                  <Text
                    key={`label-${step.key}`}
                    className="text-xs font-medium text-center"
                    style={{ color: statusStep >= index ? "#1F2937" : "#9CA3AF", width: 60 }}
                  >
                    {step.label}
                  </Text>
               ))}
            </View>

            {/* Divider */}
            <View className="h-px bg-border mb-6" />

            {/* Shop Info */}
            <View className="flex-row items-center mb-6">
              <View className="w-14 h-14 rounded-full bg-red-600 items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <Text className="text-white text-2xl font-bold">V</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold text-foreground">
                  {shop.name}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Supplier since {shop.supplierSince}
                </Text>
              </View>
            </View>

            {/* Contact Button */}
            <TouchableOpacity
              className="w-full py-4 rounded-3xl flex-row items-center justify-center"
              style={{ backgroundColor: "#315BA9" }}
              onPress={handleCall}
            >
              <Phone size={18} color="#FFFFFF" />
              <Text className="text-white font-bold text-base ml-2">Contact Shop</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
