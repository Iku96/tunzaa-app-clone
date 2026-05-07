import { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl, Animated } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Package } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useDeliveries, useAddDeliveryStage } from "@/src/services/delivery";
import { useGetOrder } from "@/src/services/order-management";
import { useAuth } from "@/context/auth";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useI18n } from "@/hooks/useI18n";
import { DeliveryRequestCard } from "@/components/delivery/DeliveryRequestCard";
import * as Burnt from "burnt";

export function DeliveryHome() {
  const { t } = useI18n();
  const router = useRouter();
  const { deliveryDetails, isLoading: isProfileLoading } = useProfileDetails();
  const PARTNER_ID = deliveryDetails?.partner_id;

  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Record<string, "accepting" | "rejecting">>({});
  const [lastRejected, setLastRejected] = useState<{ id: string; timer: ReturnType<typeof setTimeout> } | null>(null);

  // Mutations
  const updateDeliveryStage = useAddDeliveryStage();

  // Fetch assigned (pending) deliveries for this partner
  const {
    data: assignedData,
    isLoading: assignedLoading,
    refetch: refetchAssigned,
  } = useDeliveries(
    {
      partner_id: PARTNER_ID || "",
      status: "assigned",
      include_order_numbers: true,
      limit: 20,
    },
    !!PARTNER_ID
  );

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      if (PARTNER_ID) refetchAssigned();
    }, [PARTNER_ID, refetchAssigned])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchAssigned();
    setRefreshing(false);
  };

  const handleAccept = async (deliveryId: string) => {
    if (!PARTNER_ID) return;
    setProcessingIds((prev) => ({ ...prev, [deliveryId]: "accepting" }));

    try {
      await updateDeliveryStage.mutateAsync({
        deliveryId,
        data: {
          partner_id: PARTNER_ID,
          stage: "picked_up",
        },
      });

      Burnt.toast({
        title: "Delivery accepted",
        message: "Navigate to pickup location",
        preset: "done",
        haptic: "success",
        duration: 2,
        from: "top",
      });

      // Navigate to the active delivery detail
      router.push(`/orders/${deliveryId}`);
    } catch (error) {
      console.error("Failed to accept delivery:", error);
      Burnt.toast({
        title: "Failed to accept",
        message: "Please try again",
        preset: "error",
        haptic: "error",
        duration: 3,
        from: "top",
      });
    } finally {
      setProcessingIds((prev) => {
        const next = { ...prev };
        delete next[deliveryId];
        return next;
      });
    }
  };

  const handleReject = async (deliveryId: string) => {
    if (!PARTNER_ID) return;
    setProcessingIds((prev) => ({ ...prev, [deliveryId]: "rejecting" }));

    try {
      await updateDeliveryStage.mutateAsync({
        deliveryId,
        data: {
          partner_id: PARTNER_ID,
          stage: "rejected",
          notes: "Delivery partner declined",
        },
      });

      // Show undo snackbar
      Burnt.toast({
        title: "Delivery order rejected",
        preset: "done",
        haptic: "warning",
        duration: 4,
        from: "bottom",
      });

      refetchAssigned();
    } catch (error) {
      console.error("Failed to reject delivery:", error);
      Burnt.toast({
        title: "Failed to reject",
        message: "Please try again",
        preset: "error",
        haptic: "error",
        duration: 3,
        from: "top",
      });
    } finally {
      setProcessingIds((prev) => {
        const next = { ...prev };
        delete next[deliveryId];
        return next;
      });
    }
  };

  const deliveries = assignedData?.items || [];
  const isLoading = isProfileLoading || assignedLoading;

  // No partner profile
  if (!deliveryDetails && !isProfileLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="p-4 border-b border-border items-center">
          <Text className="text-lg font-semibold text-foreground">Delivery</Text>
        </View>
        <View className="flex-1 justify-center items-center p-8">
          <Package size={64} className="text-muted-foreground mb-4" />
          <Text className="text-xl font-semibold text-foreground mb-2">
            {t("delivery_home.no_profile")}
          </Text>
          <Text className="text-muted-foreground text-center">
            {t("delivery_home.no_profile_message")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="py-4 border-b border-border items-center">
        <Text className="text-lg font-semibold text-foreground">Delivery requests</Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-muted-foreground">Loading requests...</Text>
          </View>
        ) : deliveries.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Package size={48} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-foreground mt-4 mb-2">
              No delivery requests
            </Text>
            <Text className="text-muted-foreground text-center">
              New delivery requests will appear here when available.
            </Text>
          </View>
        ) : (
          deliveries.map((delivery) => {
            // Extract location info from delivery data
            const fromLocation = delivery.pickup_location?.address
              || delivery.partner_details?.name
              || "Vendor location";
            const toLocation = delivery.dropoff_location?.address
              || delivery.order_number
              || "Customer location";

            // Customer name from order number
            const customerName = delivery.order_number
              ? `Order #${delivery.order_number}`
              : `Order ${delivery.order_id?.slice(-8) || ""}`;

            // Delivery amount - use a reasonable default
            const amount = 15000; // Will be replaced with actual shipping cost from order

            return (
              <DeliveryRequestCard
                key={delivery.delivery_id}
                customerName={customerName}
                amount={amount}
                fromLocation={fromLocation}
                toLocation={toLocation}
                onAccept={() => handleAccept(delivery.delivery_id)}
                onReject={() => handleReject(delivery.delivery_id)}
                isAccepting={processingIds[delivery.delivery_id] === "accepting"}
                isRejecting={processingIds[delivery.delivery_id] === "rejecting"}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
