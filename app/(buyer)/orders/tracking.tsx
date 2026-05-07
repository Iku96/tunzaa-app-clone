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
  { key: "placed", label: "Placed", icon: "📋" },
  { key: "in_transit", label: "InTransit", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🏠" },
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

          {/* ETA Bubble */}
          <View
            className="self-start mt-4 ml-10 px-4 py-2 rounded-xl"
            style={{ backgroundColor: "#425BA4" }}
          >
            <Text className="text-sm font-bold" style={{ color: "#FFFFFF" }}>
              {statusStep === 0
                ? "Order Placed"
                : statusStep === 1
                ? "On the way"
                : "Delivered! 🎉"}
            </Text>
            <Text className="text-xs" style={{ color: "#E0E7FF" }}>
              {statusStep === 0
                ? "Waiting for pickup"
                : statusStep === 1
                ? "Driver is heading to you"
                : "Enjoy your product!"}
            </Text>
          </View>
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
            {/* Status Title */}
            <Text className="text-lg font-bold text-foreground mb-1">
              {statusStep === 0
                ? "Order Placed"
                : statusStep === 1
                ? "Your order is on the way"
                : "Order Delivered"}
            </Text>
            <Text className="text-sm text-muted-foreground mb-6">
              {statusStep === 0
                ? "Checking availability"
                : statusStep === 1
                ? "Driver is assigned and heading to you"
                : "Enjoy your product!"}
            </Text>

            {/* Status Steps */}
            <View className="flex-row items-center justify-between mb-6">
              {STATUS_STEPS.map((step, index) => {
                const isActive = statusStep >= index;
                return (
                  <React.Fragment key={step.key}>
                    {index > 0 && (
                      <View
                        className="flex-1 h-0.5 mx-1"
                        style={{
                          backgroundColor: statusStep >= index ? "#425BA4" : "#E5E7EB",
                        }}
                      />
                    )}
                    <View className="items-center" style={{ width: 60 }}>
                      <View
                        className="w-9 h-9 rounded-full items-center justify-center mb-1"
                        style={{
                          backgroundColor: isActive ? "#425BA4" : "#F3F4F6",
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>{step.icon}</Text>
                      </View>
                      <Text
                        className="text-xs font-medium"
                        style={{ color: isActive ? "#425BA4" : "#9CA3AF" }}
                      >
                        {step.label}
                      </Text>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>

            {/* Divider */}
            <View className="h-px bg-border mb-5" />

            {/* Driver Info */}
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-muted items-center justify-center">
                <Text className="text-lg">🧑‍✈️</Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-base font-semibold text-foreground">
                  {driverName}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {statusStep === 0
                    ? "Pending assignment"
                    : statusStep === 1
                    ? "Delivering your order"
                    : "Delivery completed"}
                </Text>
              </View>
              {driverPhone && statusStep === 1 && (
                <TouchableOpacity
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#EFF6FF" }}
                  onPress={handleCall}
                >
                  <Phone size={18} color="#425BA4" />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}
