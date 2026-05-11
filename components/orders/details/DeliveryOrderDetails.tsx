import React, { useState, useCallback } from "react";
import { View, ScrollView, Alert, Linking, TouchableOpacity, Image } from "react-native";
import * as Burnt from "burnt";
import * as Location from "expo-location";
import {
  MapPin,
  Package,
  Phone,
  Navigation,
  Check,
  Store,
  User,
  CircleDollarSign,
  CheckCircle,
  Circle,
} from "lucide-react-native";
import { format } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
  useDelivery,
  useAddDeliveryStage,
  useAddDeliveryProof,
  usePartner,
} from "@/src/services/delivery";
import { useGetOrder, useVerifyDeliveryOTP } from "@/src/services/order-management";
import { useAuth } from "@/context/auth";
import { ProofPhotoModal } from "@/components/modals/ProofPhotoModal";
import { DeliveryOTPModal } from "@/components/modals/DeliveryOTPModal";
import type { DeliveryStage } from "@/src/services/types/delivery";
import { useI18n } from "@/hooks/useI18n";

interface DeliveryOrderDetailsProps {
  deliveryId: string;
}

export const DeliveryOrderDetails = ({ deliveryId }: DeliveryOrderDetailsProps) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showProofModal, setShowProofModal] = useState(false);
  const [pendingStage, setPendingStage] = useState<DeliveryStage | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Auth
  const { getDeliveryDetails, user } = useAuth();
  const deliveryData = getDeliveryDetails();
  const PARTNER_ID = deliveryData?.partner_id;

  // Data fetching
  const {
    data: delivery,
    isLoading: deliveryLoading,
    error: deliveryError,
    refetch: refetchDelivery,
  } = useDelivery(deliveryId);

  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useGetOrder(delivery?.order_id || "", !!delivery?.order_id && !!deliveryId);

  const partnerId = React.useMemo(() => {
    return delivery?.partner_id || null;
  }, [delivery?.partner_id]);

  const {
    data: deliveryPartner,
    refetch: refetchPartner,
  } = usePartner(partnerId || "", !!partnerId);

  // Mutations
  const updateDeliveryStage = useAddDeliveryStage();
  const addDeliveryProof = useAddDeliveryProof();
  const verifyDeliveryOTP = useVerifyDeliveryOTP();

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      if (deliveryId) refetchDelivery();
      if (partnerId) refetchPartner();
    }, [deliveryId, refetchDelivery, partnerId, refetchPartner])
  );

  useFocusEffect(
    useCallback(() => {
      if (delivery?.order_id) refetchOrder();
    }, [delivery?.order_id, refetchOrder])
  );

  // --- Business Logic (preserved from original) ---

  const getNextStage = (currentStatus: string): string | null => {
    const partnerType = deliveryPartner?.type || "individual";
    if (partnerType === "pickup_point") {
      switch (currentStatus) {
        case "assigned": return "in_transit";
        case "in_transit": return "delivered";
        default: return null;
      }
    } else {
      switch (currentStatus) {
        case "assigned": return "picked_up";
        case "picked_up": return "in_transit";
        case "in_transit": return "delivered";
        default: return null;
      }
    }
  };

  const getStatusText = (stage: string) => {
    switch (stage) {
      case "assigned": return "Assigned";
      case "picked_up": return "Picked Up";
      case "in_transit": return "In Transit";
      case "delivered": return "Delivered";
      case "rejected": return "Rejected";
      default: return stage;
    }
  };

  const getActionButtonText = (nextStage: string | null) => {
    switch (nextStage) {
      case "picked_up": return "Start delivery";
      case "in_transit": return "Mark picked up";
      case "delivered": return "Complete delivery";
      default: return "Update status";
    }
  };

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Required", "Please enable location to update delivery status.");
        return null;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return { lat: location.coords.latitude, lng: location.coords.longitude };
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get location. Please ensure location services are enabled.");
      return null;
    }
  };

  const updateDeliveryStageWithProof = async (
    stage: string,
    imageUrl?: string,
    message?: string
  ) => {
    if (!delivery || !PARTNER_ID) return;

    let currentLocation: { lat: number; lng: number } | null = null;
    if (stage !== "rejected") {
      currentLocation = await getCurrentLocation();
      if (!currentLocation) throw new Error("Location required");
    }

    try {
      if (stage === "delivered") {
        await addDeliveryProof.mutateAsync({
          deliveryId: delivery.delivery_id,
          data: {
            partner_id: PARTNER_ID,
            proof: {
              type: "photo",
              url: imageUrl,
              notes: message,
            },
            location: currentLocation || undefined,
          },
        });
      } else {
        await updateDeliveryStage.mutateAsync({
          deliveryId: delivery.delivery_id,
          data: {
            partner_id: PARTNER_ID,
            stage,
            location: currentLocation || undefined,
            notes: imageUrl ? message : undefined,
          },
        });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] }),
        queryClient.invalidateQueries({ queryKey: ["deliveries"] }),
        refetchDelivery(),
        delivery.order_id && refetchOrder(),
      ]);

      Burnt.toast({
        title: "Status updated",
        message: `Marked as ${getStatusText(stage)}`,
        preset: "done",
        haptic: "success",
        duration: 2,
        from: "top",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!delivery || !PARTNER_ID) return;
    const nextStage = getNextStage(delivery.status);
    if (!nextStage) return;

    setIsUpdatingStatus(true);
    const partnerType = deliveryPartner?.type || "individual";

    // Determine if proof is needed
    if (partnerType === "pickup_point") {
      if (nextStage === "in_transit" || nextStage === "delivered") {
        setPendingStage(nextStage);
        setShowProofModal(true);
        return;
      }
    } else {
      if (nextStage === "picked_up" || nextStage === "delivered") {
        setPendingStage(nextStage);
        setShowProofModal(true);
        return;
      }
    }

    await updateDeliveryStageWithProof(nextStage);
  };

  const handleProofSubmit = async (imageUrl: string, message: string) => {
    if (!pendingStage) return;
    setShowProofModal(false);
    setIsUpdatingStatus(true);
    try {
      await updateDeliveryStageWithProof(pendingStage, imageUrl, message);
    } finally {
      setPendingStage(null);
    }
  };

  const handleOTPVerification = async (otp: string) => {
    if (!delivery || !user?.id) return;
    try {
      const result = await verifyDeliveryOTP.mutateAsync({
        user_id: order?.user_id || user.id,
        otp,
        purpose: "delivery_confirmation",
        metadata: {
          order_id: delivery.order_id,
          delivery_id: delivery.id,
          type: "delivery_confirmation",
        },
      });
      if (result.success) {
        setShowOTPModal(false);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] }),
          queryClient.invalidateQueries({ queryKey: ["deliveries"] }),
          refetchDelivery(),
        ]);
        Alert.alert("Success", "Delivery confirmed!");
      } else {
        Alert.alert("Error", result.message || "OTP verification failed");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to verify OTP");
    }
  };

  const handleCall = (phoneNumber: string | undefined) => {
    if (!phoneNumber) {
      Burnt.toast({ title: "No phone number", preset: "error", haptic: "error", duration: 2, from: "top" });
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleViewMap = () => {
    router.push(`/(delivery)/orders/${deliveryId}/navigate`);
  };

  // --- Loading / Error states ---

  if (!deliveryData) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-4">
        <Text className="text-muted-foreground text-center">
          Delivery partner profile not found.
        </Text>
      </View>
    );
  }

  if (deliveryLoading || orderLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (deliveryError || orderError || !delivery) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-4">
        <Text className="text-destructive text-center">Failed to load delivery details.</Text>
      </View>
    );
  }

  const nextStage = getNextStage(delivery.status);
  const canUpdateStatus = delivery.status !== "delivered";

  // Extract data for the Figma UI
  const pickupLocation = delivery.pickup_location?.address
    || order?.shipping_address?.city
    || "Pickup location";
  const deliveryLocation = delivery.dropoff_location?.address
    || (order?.shipping_address
      ? `${order.shipping_address.address_line1 || ""}, ${order.shipping_address.city || ""}`
      : "Delivery location");
  const customerName = order?.shipping_address
    ? `${order.shipping_address.first_name || ""} ${order.shipping_address.last_name || ""}`.trim()
    : "Customer";
  const customerPhone = order?.shipping_address?.phone;
  const shippingCost = order?.totals?.total || 0;
  const currency = order?.currency || "Tshs";

  // Product list
  const products = order?.items?.map((item) => item.name).join(", ") || "Products";

  // Vendor/Shop names from order items
  const shopNames = order?.items
    ?.map((item) => (item as any).store?.store_name)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) || [];
  const shopName = shopNames.join(", ") || "Shop";

  // Is this an order details view (with multiple items) or active delivery view?
  const hasMultipleItems = (order?.items?.length || 0) > 1;

  return (
    <ScrollView className="flex-1 bg-background">
      {/* --- View Map Button --- */}
      <View className="px-4 pt-4 pb-2">
        <TouchableOpacity
          className="flex-row items-center self-start px-4 py-2 rounded-full border border-border"
          onPress={handleViewMap}
        >
          <MapPin size={16} color="#425BA4" />
          <Text className="text-sm font-medium ml-2" style={{ color: "#425BA4" }}>
            View map
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- Pickup Points Section (Order details screen) --- */}
      {hasMultipleItems && (
        <View className="px-4 py-3">
          <View className="flex-row items-center mb-3">
            <MapPin size={16} color="#425BA4" />
            <Text className="text-sm font-semibold text-foreground ml-2">
              {pickupLocation}
            </Text>
            <Text className="text-sm text-muted-foreground ml-2">Pickup points</Text>
          </View>

          {/* Items grouped by vendor */}
          {order?.items?.map((item, index) => {
            const vendorName = (item as any).store?.store_name || "Vendor";
            const isPickedUp = delivery.status !== "assigned";

            return (
              <View
                key={item.item_id || index}
                className="flex-row items-center justify-between py-3 border-b border-border"
              >
                <View className="flex-row items-center flex-1">
                  {isPickedUp ? (
                    <CheckCircle size={18} color="#22C55E" />
                  ) : (
                    <Circle size={18} color="#D1D5DB" />
                  )}
                  <View className="ml-3 flex-1">
                    <Text className="text-xs text-muted-foreground">{vendorName}</Text>
                    <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleCall(customerPhone)}
                  className="p-2"
                >
                  <Phone size={18} color="#1F2937" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* --- Pickup Details (From) --- */}
      <View className="px-4 py-4">
        <View className="flex-row items-center mb-4">
          <View className="w-3 h-3 rounded-full bg-green-500 mr-3" />
          <Text className="text-base font-semibold text-foreground">
            Pickup details (From)
          </Text>
        </View>

        <View className="pl-6 gap-3">
          {/* Location */}
          <View className="flex-row items-start">
            <MapPin size={16} color="#9CA3AF" className="mt-0.5" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-muted-foreground">Location</Text>
              <Text className="text-sm font-medium text-foreground">{pickupLocation}</Text>
            </View>
          </View>

          {/* Products */}
          <View className="flex-row items-start">
            <Package size={16} color="#9CA3AF" className="mt-0.5" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-muted-foreground">Products</Text>
              <Text className="text-sm font-medium text-foreground" numberOfLines={2}>
                {products}
              </Text>
            </View>
          </View>

          {/* Shop Name */}
          <View className="flex-row items-start">
            <Store size={16} color="#9CA3AF" className="mt-0.5" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-muted-foreground">Shop Name</Text>
              <Text className="text-sm font-medium text-foreground">{shopName}</Text>
            </View>
          </View>
        </View>

        {/* Call Shop button */}
        {shopNames.length > 0 && (
          <TouchableOpacity
            className="flex-row items-center justify-center mt-4 ml-6 py-2.5 px-4 rounded-xl border border-border self-start"
            onPress={() => handleCall(customerPhone)}
          >
            <Phone size={14} color="#425BA4" />
            <Text className="text-sm font-medium ml-2" style={{ color: "#425BA4" }}>
              Call shop
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Divider */}
      <View className="h-px bg-border mx-4" />

      {/* --- Delivery Details (To) --- */}
      <View className="px-4 py-4">
        <View className="flex-row items-center mb-4">
          <View className="w-3 h-3 rounded-full" style={{ backgroundColor: "#425BA4" }} />
          <Text className="text-base font-semibold text-foreground ml-3">
            Delivery details (To)
          </Text>
        </View>

        <View className="pl-6 gap-3">
          {/* Location */}
          <View className="flex-row items-start">
            <MapPin size={16} color="#9CA3AF" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-muted-foreground">Location</Text>
              <Text className="text-sm font-medium text-foreground">{deliveryLocation}</Text>
            </View>
          </View>

          {/* Customer Name */}
          <View className="flex-row items-start">
            <User size={16} color="#9CA3AF" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-muted-foreground">Customer Name</Text>
              <Text className="text-sm font-medium text-foreground">{customerName}</Text>
            </View>
          </View>

          {/* Amount */}
          <View className="flex-row items-start">
            <CircleDollarSign size={16} color="#9CA3AF" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-muted-foreground">Amount customer pays</Text>
              <Text className="text-sm font-medium text-foreground">
                {currency} {shippingCost.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Call Customer button */}
        {customerPhone && (
          <TouchableOpacity
            className="flex-row items-center justify-center mt-4 ml-6 py-2.5 px-4 rounded-xl border border-border self-start"
            onPress={() => handleCall(customerPhone)}
          >
            <Phone size={14} color="#425BA4" />
            <Text className="text-sm font-medium ml-2" style={{ color: "#425BA4" }}>
              Call customer
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* --- Delivery Proof (If available) --- */}
      {delivery.proof && (
        <View className="px-4 py-4 border-t border-border">
          <Text className="text-base font-semibold text-foreground mb-3">
            Delivery Proof
          </Text>
          <View className="bg-muted p-3 rounded-xl">
            {delivery.proof.url && (
              <Image 
                source={{ uri: delivery.proof.url }} 
                className="w-full h-48 rounded-lg mb-2"
                resizeMode="cover"
              />
            )}
            {delivery.proof.notes && (
              <Text className="text-sm text-foreground">
                Note: {delivery.proof.notes}
              </Text>
            )}
            <Text className="text-xs text-muted-foreground mt-1">
              Uploaded at: {format(new Date(delivery.updated_at), 'MMM d, h:mm a')}
            </Text>
          </View>
        </View>
      )}

      {/* --- Action Button --- */}
      {canUpdateStatus && nextStage && (
        <View className="px-4 py-6">
          <TouchableOpacity
            className="py-4 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: "#425BA4",
              opacity: isUpdatingStatus ? 0.6 : 1,
            }}
            onPress={handleUpdateStatus}
            disabled={isUpdatingStatus || updateDeliveryStage.isPending}
          >
            <Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
              {isUpdatingStatus ? "Updating..." : getActionButtonText(nextStage)}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- OTP Confirmation (after delivered) --- */}
      {delivery.status === "delivered" &&
        order &&
        order.status.toLowerCase() !== "completed" &&
        order.status.toLowerCase() !== "complete" && (
          <View className="px-4 pb-6">
            <View className="bg-muted p-4 rounded-xl mb-4">
              <Text className="text-sm text-muted-foreground mb-1">
                Ask the customer for their delivery OTP code to confirm handover.
              </Text>
              <Text className="text-sm font-medium text-foreground">
                This ensures the package was delivered to the right person.
              </Text>
            </View>

            <TouchableOpacity
              className="py-4 rounded-2xl items-center justify-center"
              style={{ backgroundColor: "#425BA4" }}
              onPress={() => setShowOTPModal(true)}
              disabled={verifyDeliveryOTP.isPending}
            >
              <Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
                {verifyDeliveryOTP.isPending ? "Processing..." : "Complete order"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      {/* Modals */}
      <ProofPhotoModal
        visible={showProofModal}
        onClose={() => {
          setShowProofModal(false);
          setPendingStage(null);
          setIsUpdatingStatus(false);
        }}
        onSubmit={handleProofSubmit}
        isLoading={isUpdatingStatus || updateDeliveryStage.isPending}
        stage={pendingStage === "in_transit" ? "picked_up" : "delivered"}
      />

      <DeliveryOTPModal
        visible={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onSubmit={handleOTPVerification}
        isLoading={verifyDeliveryOTP.isPending}
        orderId={delivery?.order_id || ""}
        deliveryId={delivery?.id || ""}
      />
    </ScrollView>
  );
};
