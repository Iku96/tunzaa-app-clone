import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, Alert, Image } from "react-native";
import * as Burnt from "burnt";
import * as Location from "expo-location";
import {
  Package,
  Clock,
  MapPin,
  Camera,
  Check,
  Navigation,
  MapIcon,
  MapPinIcon,
  Upload,
  XCircle,
} from "lucide-react-native";
import { format } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  useGetDelivery,
  useUpdateDeliveryStage,
  useAddDeliveryProof,
} from "@/src/services/delivery";
import { useGetOrder, useVerifyDeliveryOTP } from "@/src/services/order-management";
import { useAuth } from "@/context/auth";
import { useProductDetails } from "@/hooks/useProductDetails";
import { ProofPhotoModal } from "@/components/modals/ProofPhotoModal";
import { DeliveryOTPModal } from "@/components/modals/DeliveryOTPModal";
import { RejectDeliveryModal } from "@/components/modals/RejectDeliveryModal";
import type { DeliveryStage } from "@/src/services/types/delivery";
import { useGetDeliveryPartner } from "@/src/services/delivery";
import { Textarea } from "@/components/ui/textarea";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";
interface DeliveryOrderDetailsProps {
  deliveryId: string;
}

export const DeliveryOrderDetails = ({
  deliveryId,
}: DeliveryOrderDetailsProps) => {
  const resolvedThemeColors = useResolvedThemeColors();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [signatureText, setSignatureText] = useState("");
  const [proofPhoto, setProofPhoto] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [pendingStage, setPendingStage] = useState<DeliveryStage | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Get delivery details from auth context
  const { getDeliveryDetails, user } = useAuth();
  const deliveryData = getDeliveryDetails();
  const PARTNER_ID = deliveryData?.partner_id;

  // Fetch delivery details
  const {
    data: delivery,
    isLoading: deliveryLoading,
    error: deliveryError,
    refetch: refetchDelivery,
  } = useGetDelivery(deliveryId);

  // Fetch order details using the order_id from delivery
  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useGetOrder(delivery?.order_id || "", !!delivery?.order_id && !!deliveryId);

  // Extract partner_id from delivery stages to fetch delivery partner type
  const partnerId = React.useMemo(() => {
    if (!delivery?.stages || delivery.stages.length === 0) return null;
    // Get partner_id from the first stage (all stages should have the same partner_id)
    return delivery.stages[0].partner_id;
  }, [delivery?.stages]);

  // Fetch delivery partner details to get the partner type
  const {
    data: deliveryPartner,
    isLoading: partnerLoading,
    refetch: refetchPartner,
  } = useGetDeliveryPartner(partnerId || '', !!partnerId);

  // Mutations for updating delivery stage and adding proof
  const updateDeliveryStage = useUpdateDeliveryStage();
  const addDeliveryProof = useAddDeliveryProof();
  const verifyDeliveryOTP = useVerifyDeliveryOTP();

  // Simple product image getter without dynamic hooks
  const getProductImage = useCallback((productId: string) => {
    // For now, return null since we can't safely use the dynamic hook
    // This can be enhanced later with a different approach
    return null;
  }, []);

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (deliveryId) {
        refetchDelivery();
      }
      if (partnerId) {
        refetchPartner();
      }
    }, [deliveryId, refetchDelivery, partnerId, refetchPartner])
  );

  // Refetch order when delivery data is available
  useFocusEffect(
    useCallback(() => {
      if (delivery?.order_id) {
        refetchOrder();
      }
    }, [delivery?.order_id, refetchOrder])
  );

  const getStatusColor = (stage: DeliveryStage) => {
    switch (stage) {
      case "assigned":
        return "outline";
      case "picked_up":
        return "outline";
      case "in_transit":
        return "primary";
      case "delivered":
        return "success";
      default:
        return "secondary";
    }
  };

  const getStatusText = (stage: DeliveryStage) => {
    switch (stage) {
      case "assigned":
        return t("orders.assigned") || "Assigned";
      case "picked_up":
        return t("orders.picked_up") || "Picked Up";
      case "in_transit":
        return t("orders.in_transit") || "In Transit";
      case "delivered":
        return t("orders.delivered") || "Delivered";
      case "rejected":
        return t("orders.rejected") || "Rejected";
      default:
        return stage;
    }
  };

  const getNextStage = (currentStage: DeliveryStage): DeliveryStage | null => {
    const partnerType = deliveryPartner?.type || 'individual';

    if (partnerType === 'pickup_point') {
      // For pickup points: assigned → in_transit → delivered
      switch (currentStage) {
        case "assigned":
          return "in_transit";
        case "in_transit":
          return "delivered";
        case "delivered":
          return null;
        default:
          return null;
      }
    } else {
      // For individual/business: assigned → picked_up → in_transit → delivered
      switch (currentStage) {
        case "assigned":
          return "picked_up";
        case "picked_up":
          return "in_transit";
        case "in_transit":
          return "delivered";
        case "delivered":
          return null;
        default:
          return null;
      }
    }
  };

  const handleUpdateStatus = async () => {
    if (!delivery) return;
    if (!PARTNER_ID) {
      Alert.alert("Error", "Delivery partner information is missing");
      return;
    }

    const nextStage = getNextStage(delivery.current_stage);
    if (!nextStage) return;

    // Set loading state immediately
    setIsUpdatingStatus(true);

    try {
      const partnerType = deliveryPartner?.type || 'individual';

      // Show proof modal for stages that require photo proof
      if (partnerType === 'pickup_point') {
        // For pickup points: require photo proof for in_transit and delivered
        if (nextStage === "in_transit" || nextStage === "delivered") {
          setPendingStage(nextStage);
          setShowProofModal(true);
          return;
        }
      } else {
        // For individual/business: require photo proof for picked_up and delivered
        if (nextStage === "picked_up" || nextStage === "delivered") {
          setPendingStage(nextStage);
          setShowProofModal(true);
          return;
        }
      }

      // For other stages, proceed normally
      await updateDeliveryStageWithProof(nextStage);
    } finally {
      // Reset loading state
      setIsUpdatingStatus(false);
    }
  };

  // Helper function to get current location
  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Check permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location permissions in your device settings to update delivery status.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Location.enableNetworkProviderAsync()
            }
          ]
        );
        return null;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        t("common.error") || "Error",
        t("delivery_navigation.location_error") || "Failed to get your current location. Please make sure location services are enabled.",
        [{ text: "OK" }]
      );
      return null;
    }
  };

  const handleRejectDelivery = () => {
    if (!delivery) return;
    if (!PARTNER_ID) {
      Alert.alert("Error", "Delivery partner information is missing");
      return;
    }
    // The modal will handle the rejection flow
  };

  const handleConfirmReject = async (reason: string) => {
    if (!delivery) return;

    try {
      // For rejection, we don't need location or proof, just the reason
      await updateDeliveryStage.mutateAsync({
        deliveryId: delivery.id,
        data: {
          partner_id: PARTNER_ID!,
          stage: "rejected",
          reason: reason,
          // location and proof are optional and not included for rejection
        },
      });

      Burnt.toast({
        title: "Delivery Rejected",
        message: "The delivery has been rejected successfully",
        preset: "done",
        haptic: "success",
        duration: 3,
        from: "top",
      });

      refetchDelivery();
    } catch (error) {
      console.error("Error rejecting delivery:", error);
      Burnt.toast({
        title: "Error",
        message: "Failed to reject delivery. Please try again.",
        preset: "error",
        haptic: "error",
        duration: 4,
        from: "top",
      });
    }
  };

  const updateDeliveryStageWithProof = async (
    stage: DeliveryStage,
    imageUrl?: string,
    message?: string
  ) => {
    if (!delivery || !PARTNER_ID) return;

    // Get current location for all stages except rejected
    let currentLocation: { lat: number; lng: number } | null = null;

    if (stage !== "rejected") {
      currentLocation = await getCurrentLocation();

      if (!currentLocation) {
        // Location is required for non-rejected stages
        throw new Error("Location is required to update delivery status");
      }
    }

    try {
      await updateDeliveryStage.mutateAsync({
        deliveryId: delivery.id,
        data: {
          partner_id: PARTNER_ID,
          stage,
          location: currentLocation || undefined, // Only include location if available
          proof: imageUrl ? {
            photo_url: imageUrl,
            message: message || "",
          } : undefined,
        },
      });

      // Invalidate and refetch relevant queries after successful update
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] }),
        queryClient.invalidateQueries({ queryKey: ["deliveries"] }),
        refetchDelivery(),
        delivery.order_id && refetchOrder(),
        partnerId && refetchPartner(),
      ]);

      Alert.alert(t("common.success") || "Success", `${t("orders.status_updated_to")} ${getStatusText(stage)}`);
    } catch (error) {
      Alert.alert(t("common.error") || "Error", t("orders.failed_to_update_status") || "Failed to update status. Please try again.");
    } finally {
      // Reset loading state
      setIsUpdatingStatus(false);
    }
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

  const handleProofCancel = () => {
    setShowProofModal(false);
    setPendingStage(null);
  };

  const handleOTPVerification = async (otp: string) => {
    if (!delivery || !user?.id) {
      Alert.alert("Error", "Missing delivery or user information");
      return;
    }

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
        // Invalidate and refetch relevant queries after successful verification
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] }),
          queryClient.invalidateQueries({ queryKey: ["deliveries"] }),
          refetchDelivery(),
          delivery.order_id && refetchOrder(),
        ]);

        Alert.alert("Success", "Delivery confirmed successfully!");
      } else {
        Alert.alert(t("common.error") || "Error", result.message || t("orders.otp_verification_failed") || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert(t("common.error") || "Error", t("orders.failed_to_verify_otp") || "Failed to verify OTP. Please try again.");
    }
  };

  const handleOTPCancel = () => {
    setShowOTPModal(false);
  };

  const handleSubmitProof = async () => {
    if (!delivery) return;
    if (!PARTNER_ID) {
      Alert.alert("Error", "Delivery partner information is missing");
      return;
    }
    if (!proofPhoto && !signatureText) {
      Alert.alert(
        "Error",
        "Please provide either a photo or signature as proof of delivery."
      );
      return;
    }

    setIsSubmittingProof(true);
    try {
      await addDeliveryProof.mutateAsync({
        deliveryId: delivery.id,
        data: {
          partner_id: PARTNER_ID,
          proof: {
            photo_url: proofPhoto || undefined,
            signature: signatureText || undefined,
          },
        },
      });

      // Invalidate and refetch relevant queries after successful proof submission
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] }),
        queryClient.invalidateQueries({ queryKey: ["deliveries"] }),
        refetchDelivery(),
      ]);

      Alert.alert("Success", "Proof of delivery submitted successfully!");
      setProofPhoto("");
      setSignatureText("");
    } catch (error) {
      Alert.alert("Error", "Failed to submit proof. Please try again.");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  if (!deliveryData) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-4">
        <Text className="text-muted-foreground text-center">
          {t("delivery_home.no_profile_message")}
        </Text>
      </View>
    );
  }

  if (deliveryLoading || orderLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-4">
        <Text className="text-muted-foreground">
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  if (deliveryError || orderError || !delivery) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-4">
        <Text className="text-destructive text-center">
          {t("delivery_navigation.failed_to_load")}
        </Text>
      </View>
    );
  }

  const canUpdateStatus = delivery.current_stage !== "delivered";
  const canSubmitProof = delivery.current_stage === "delivered";
  const nextStage = getNextStage(delivery.current_stage);

  // Navigation functionality
  const canNavigate =
    delivery.current_stage === "assigned" ||
    delivery.current_stage === "picked_up" ||
    delivery.current_stage === "in_transit";

  const handleNavigate = () => {
    router.push(`/(delivery)/orders/${deliveryId}/navigate`);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-4">
        {/* Delivery Information */}
        <Card className="p-4">
          <Text className="text-lg font-semibold mb-4">
            {t("delivery.title")}
          </Text>

          <View className="gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted-foreground">Delivery ID</Text>
              <Text className="text-base font-semibold">
                {delivery.id.slice(-8)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted-foreground">{t("orders.order")} ID</Text>
              <Text className="text-base font-semibold">
                {delivery.order_id.slice(-8)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted-foreground">
                {t("orders.current_status")}
              </Text>
              <Badge variant={getStatusColor(delivery.current_stage)}>
                <Text className="text-xs font-semibold">
                  {getStatusText(delivery.current_stage)}
                </Text>
              </Badge>
            </View>

            {delivery.estimated_delivery_time && (
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  {t("delivery_home.estimated_delivery")}
                </Text>
                <Text className="text-sm text-foreground">
                  {format(
                    new Date(delivery.estimated_delivery_time),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted-foreground">{t("common.created")}</Text>
              <Text className="text-sm text-foreground">
                {format(
                  new Date(delivery.created_at),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </Text>
            </View>
          </View>
        </Card>

        {/* Delivery Stages */}
        <Card className="p-4">
          <Text className="text-lg font-semibold mb-4">{t("orders.delivery_stages")}</Text>

          <View className="gap-3">
            {delivery.stages.map((stage, index) => (
              <View key={index} className="flex-row items-start gap-x-3">
                <View className="w-3 h-3 bg-primary rounded-full mt-1.5" />
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-base font-semibold">
                      {getStatusText(stage.stage)}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {format(new Date(stage.timestamp), "MMM d, h:mm a")}
                    </Text>
                  </View>
                  {stage.location && (
                    <View className="flex-row items-center gap-x-2">
                      <MapPin size={14} className="text-muted-foreground" />
                      <Text className="text-sm text-muted-foreground">
                        {stage.location.lat.toFixed(4)},{" "}
                        {stage.location.lng.toFixed(4)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>



        {/* Order Information */}
        {order && (
          <Card className="p-4">
            <Text className="text-lg font-semibold mb-4">
              {t("orders.order")} {t("common.information")}
            </Text>

            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  {t("orders.order_number")}
                </Text>
                <Text className="text-base font-semibold">
                  {order.order_number}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  {t("orders.order_status")}
                </Text>
                <Badge variant="outline">
                  <Text className="text-xs font-semibold">{order.status}</Text>
                </Badge>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  {t("orders.payment_status")}
                </Text>
                <Badge
                  variant={
                    order.payment_status === "paid" ? "primary" : "outline"
                  }
                >
                  <Text className="text-xs font-semibold">
                    {order.payment_status}
                  </Text>
                </Badge>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  {t("orders.payment_method")}
                </Text>
                <Text className="text-sm text-foreground">
                  {/* {order.payment_details.method} */}
                  AFRIZON
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted-foreground">
                  {t("orders.total_amount")}
                </Text>
                <Text className="text-lg font-bold text-primary">
                  {order.currency} {order.totals.total.toLocaleString()}
                </Text>
              </View>

              {order.shipping_address && (
                <View>
                  <Text className="text-sm text-muted-foreground mb-2">
                    {t("delivery_navigation.delivery_address")}
                  </Text>
                  <View className="bg-muted p-3 rounded-lg">
                    <Text className="text-sm font-semibold text-foreground mb-1">
                      {order.shipping_address.first_name}{" "}
                      {order.shipping_address.last_name}
                    </Text>
                    <Text className="text-sm text-foreground">
                      {order.shipping_address.address_line1}
                      {order.shipping_address.address_line2 &&
                        `, ${order.shipping_address.address_line2}`}
                    </Text>
                    <Text className="text-sm text-foreground">
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.state_province}{" "}
                      {order.shipping_address.postal_code}
                    </Text>
                    <Text className="text-sm text-foreground">
                      {order.shipping_address.country}
                    </Text>
                    {order.shipping_address.phone && (
                      <Text className="text-sm text-foreground mt-1">
                        📞 {order.shipping_address.phone}
                      </Text>
                    )}
                    {order.shipping_address.email && (
                      <Text className="text-sm text-foreground">
                        ✉️ {order.shipping_address.email}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Order Items */}
              <View>
                <Text className="text-sm text-muted-foreground mb-2">
                  {t("orders.items")} ({order.items?.length || 0})
                </Text>
                <View className="gap-2">
                  {order.items?.map((item) => {
                    const productImage = item?.product_id ? getProductImage(item.product_id) : null;

                    return (
                      <View
                        key={item.item_id}
                        className="bg-muted p-3 rounded-lg"
                      >
                        <View className="flex-row items-start mb-2">
                          {/* Product Image */}
                          <View className="w-12 h-12 rounded-lg bg-background mr-3 overflow-hidden">
                            {productImage ? (
                              <Image
                                source={{ uri: productImage }}
                                className="w-full h-full"
                                style={{ resizeMode: 'cover' }}
                              />
                            ) : (
                              <View className="w-full h-full flex items-center justify-center">
                                <Package size={16} className="text-muted-foreground" />
                              </View>
                            )}
                          </View>

                          {/* Product Details */}
                          <View className="flex-1">
                            <Text className="text-sm font-semibold">
                              {item.name}
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                              SKU: {item.sku}
                            </Text>
                          </View>

                          {/* Price */}
                          <Text className="text-sm font-semibold">
                            {order.currency} {item.unit_price.toLocaleString()}
                          </Text>
                        </View>

                        <View className="flex-row justify-between items-center">
                          <View className="flex-1">
                            <Text className="text-xs text-muted-foreground">
                              {t("common.store")}: {item.store?.store_name || "N/A"}
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                              {t("common.qty")}: {item.quantity} × {order.currency}{" "}
                              {item.unit_price.toLocaleString()}
                            </Text>
                          </View>
                          <Text className="text-sm font-bold text-primary">
                            {order.currency} {item.total.toLocaleString()}
                          </Text>
                        </View>

                        {item.categories && item.categories.length > 0 && (
                          <View className="flex-row flex-wrap gap-1 mt-2">
                            {item.categories.map((category) => (
                              <Badge key={category.category_id} variant="outline">
                                <Text className="text-xs">{category.name}</Text>
                              </Badge>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Order Summary */}
              <View className="bg-muted p-3 rounded-lg">
                <Text className="text-sm font-semibold mb-2">
                  {t("payment.order_summary")}
                </Text>
                <View className="gap-1">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted-foreground">
                      {t("orders.subtotal")}
                    </Text>
                    <Text className="text-xs">
                      {order.currency} {order.totals.subtotal.toLocaleString()}
                    </Text>
                  </View>
                  {order.totals.discount > 0 && (
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted-foreground">
                        {t("orders.discount")}
                      </Text>
                      <Text className="text-xs text-destructive">
                        -{order.currency}{" "}
                        {order.totals.discount.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  {order.totals.tax > 0 && (
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted-foreground">{t("orders.tax")}</Text>
                      <Text className="text-xs">
                        {order.currency} {order.totals.tax.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  {order.totals.shipping && order.totals.shipping > 0 && (
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted-foreground">
                        {t("orders.shipping")}
                      </Text>
                      <Text className="text-xs">
                        {order.currency}{" "}
                        {order.totals.shipping.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  <View className="border-t border-border pt-1 mt-1">
                    <View className="flex-row justify-between">
                      <Text className="text-sm font-semibold">{t("orders.total")}</Text>
                      <Text className="text-sm font-bold text-primary">
                        {order.currency} {order.totals.total.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {order.notes && (
                <View>
                  <Text className="text-sm text-muted-foreground mb-2">
                    {t("orders.order_notes")}
                  </Text>
                  <View className="bg-muted p-3 rounded-lg">
                    <Text className="text-sm text-foreground">
                      {order.notes}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Navigation Button */}
        {canNavigate && (
          <Card className="p-4">
            <Text className="text-lg font-semibold mb-4">{t("orders.navigation")}</Text>

            <Button
              variant="outline"
              size="lg"
              className="w-full flex-row items-center justify-center gap-x-3"
              onPress={handleNavigate}
            >
              <MapPinIcon size={20} color={resolvedThemeColors?.foreground || "#000000"} />
              <Text className="text-foreground font-semibold text-lg">
                {t("orders.navigate_to_delivery")}
              </Text>
            </Button>

            <Text className="text-xs text-center text-muted-foreground mt-2">
              {t("orders.get_directions")}
            </Text>
          </Card>
        )}

        {/* Status Update Actions */}
        {canUpdateStatus && nextStage && (
          <Card className="p-4">
            <Text className="text-lg font-semibold mb-4">{t("orders.update_status")}</Text>

            <View className="gap-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full flex-row items-center justify-center gap-x-2"
                onPress={handleUpdateStatus}
                disabled={isUpdatingStatus || updateDeliveryStage.isPending}
              >
                <Navigation size={20} color={resolvedThemeColors?.foreground || "#000000"} />
                <Text className="text-foreground font-semibold">
                  {isUpdatingStatus || updateDeliveryStage.isPending
                    ? t("common.updating")
                    : `${t("common.mark_as")} ${getStatusText(nextStage)}`}
                </Text>
              </Button>

              {/* Reject Button - Only show when delivery is in assigned stage */}
              {/* {delivery.current_stage === "assigned" && (
                <RejectDeliveryModal
                  onConfirm={handleConfirmReject}
                  triggerText={isUpdatingStatus || updateDeliveryStage.isPending ? t("common.rejecting") : t("modals.reject_delivery.title")}
                  triggerVariant="destructive"
                  triggerSize="lg"
                  disabled={isUpdatingStatus || updateDeliveryStage.isPending}
                  canReject={!!delivery && !!PARTNER_ID}
                />
              )} */}
            </View>
          </Card>
        )}

        {/* Proof of Delivery */}
        {/* {canSubmitProof && (
          <Card className="p-4">
            <Text className="text-lg font-semibold mb-4">
              Proof of Delivery
            </Text>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium mb-2">Photo Proof</Text>
                <ImageUploader
                  value={proofPhoto}
                  onImageSelected={setProofPhoto}
                  onImageRemoved={() => setProofPhoto("")}
                  placeholder="Take Photo as Proof"
                  disabled={isSubmittingProof}
                  aspectRatio={[4, 3]}
                />
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">
                  Signature/Notes
                </Text>
                <Textarea
                  value={signatureText}
                  onChangeText={setSignatureText}
                  placeholder="Customer signature or delivery notes"
                  multiline
                  numberOfLines={3}
                  className="min-h-[80px] py-2"
                  textAlignVertical="top"
                  editable={!isSubmittingProof}
                />
              </View>

              <Button
                variant="default"
                size="lg"
                className="w-full flex-row items-center justify-center gap-x-2"
                onPress={handleSubmitProof}
                disabled={isSubmittingProof || (!proofPhoto && !signatureText)}
              >
                <Upload size={20} className="text-white" />
                <Text className="text-white font-semibold">
                  {isSubmittingProof ? "Submitting..." : "Submit Proof"}
                </Text>
              </Button>
            </View>
          </Card>
        )} */}

        {/* OTP Delivery Confirmation */}
        {delivery.current_stage === "delivered" &&
          order &&
          order.status.toLowerCase() !== "completed" &&
          order.status.toLowerCase() !== "complete" && (
            <Card className="p-4">
              <Text className="text-lg font-semibold mb-4">
                {t("orders.final_delivery_confirmation")}
              </Text>

              <View className="gap-4">
                <View className="bg-muted p-4 rounded-lg">
                  <Text className="text-sm text-muted-foreground mb-2">
                    {t("orders.ask_customer_otp")}
                  </Text>
                  <Text className="text-sm font-medium text-foreground">
                    {t("orders.otp_ensures_package")}
                  </Text>
                </View>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full flex-row items-center justify-center gap-x-2"
                  onPress={() => setShowOTPModal(true)}
                  disabled={verifyDeliveryOTP.isPending}
                >
                  <Check size={20} color={resolvedThemeColors?.foreground || "#000000"} />
                  <Text className="text-foreground font-semibold">
                    {verifyDeliveryOTP.isPending ? t("orders.processing_action") : t("orders.complete_order")}
                  </Text>
                </Button>
              </View>
            </Card>
          )}

        {/* Pickup Points Information */}
        {delivery.pickup_points && delivery.pickup_points.length > 0 && (
          <Card className="p-4">
            <Text className="text-lg font-semibold mb-4">{t("orders.pickup_points")}</Text>

            <View className="gap-3">
              {delivery.pickup_points.map((pickup, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center bg-muted p-3 rounded-lg"
                >
                  <Text className="text-sm text-muted-foreground">
                    {t("orders.partner_id")}
                  </Text>
                  <Text className="text-sm font-semibold">
                    {pickup.partner_id.slice(-8)}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {format(new Date(pickup.timestamp), "MMM d, h:mm a")}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}
      </View>

      {/* Proof Photo Modal */}
      <ProofPhotoModal
        visible={showProofModal}
        onClose={handleProofCancel}
        onSubmit={handleProofSubmit}
        isLoading={isUpdatingStatus || updateDeliveryStage.isPending}
        stage={pendingStage === "in_transit" ? "picked_up" : "delivered"}
      />

      {/* OTP Verification Modal */}
      <DeliveryOTPModal
        visible={showOTPModal}
        onClose={handleOTPCancel}
        onSubmit={handleOTPVerification}
        isLoading={verifyDeliveryOTP.isPending}
        orderId={delivery?.order_id || ""}
        deliveryId={delivery?.id || ""}
      />

    </ScrollView>
  );
};
