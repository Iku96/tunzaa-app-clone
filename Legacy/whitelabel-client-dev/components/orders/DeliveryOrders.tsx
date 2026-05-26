import { useState, useCallback } from "react";
import { ScrollView, View, Pressable, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Package, Clock, MapPin, Camera, Check, User, Hash, XCircle } from "lucide-react-native";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useGetDeliveries } from "@/services/delivery";
import { useAuth } from "@/context/auth";
import { DeliveryStage, Delivery } from "@/services/types/delivery";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

export const DeliveryOrders = () => {
  const resolvedThemeColors = useResolvedThemeColors();
  const router = useRouter();
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<DeliveryStage | "ongoing">("ongoing");
  const [showCamera, setShowCamera] = useState(false);
  const [skip, setSkip] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 10;

  // Get delivery details from auth context
  const { getDeliveryDetails } = useAuth();
  const deliveryData = getDeliveryDetails();
  const PARTNER_ID = deliveryData?.partner_id;

  // Determine the stage filter for API call
  const getStageFilter = (filter: DeliveryStage | "ongoing"): DeliveryStage | undefined => {
    switch (filter) {
      case "ongoing":
        return undefined; // We'll handle ongoing filter client-side since it's multiple stages
      case "assigned":
      case "picked_up":
      case "in_transit":
      case "delivered":
        return filter;
      default:
        return undefined;
    }
  };

  // Fetch deliveries using the new API
  const {
    data: deliveriesData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetDeliveries(
    {
      partner_id: PARTNER_ID || "",
      stage: getStageFilter(selectedFilter),
      include_order_numbers: true,
      include_partner_names: true,
      skip,
      limit,
    },
    !!PARTNER_ID
  );

  // Refetch deliveries when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const deliveries = deliveriesData?.items || [];

  // Filter deliveries for ongoing status (client-side for this specific case)
  const filteredDeliveries = selectedFilter === "ongoing"
    ? deliveries.filter((delivery) =>
      ["assigned", "picked_up", "in_transit"].includes(delivery.current_stage)
    )
    : deliveries;

  const handleTakePhoto = () => {
    // Handle taking photo
    setShowCamera(true);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setSkip(0); // Reset pagination
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleFilterChange = (filter: DeliveryStage | "ongoing") => {
    setSelectedFilter(filter);
    setSkip(0); // Reset pagination when filter changes
  };

  const handleLoadMore = () => {
    if (!isFetching && deliveriesData && deliveries.length < deliveriesData.total) {
      setSkip(prev => prev + limit);
    }
  };

  const getStatusColor = (stage: string) => {
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
        return "outline";
    }
  };

  const getStatusText = (stage: string) => {
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

  // Helper function to check if current partner rejected this delivery
  const didPartnerRejectDelivery = (delivery: Delivery): boolean => {
    if (!PARTNER_ID) return false;

    // Sort stages by timestamp (most recent first)
    const sortedStages = [...delivery.stages].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Find the most recent stage by this partner
    const partnerLatestStage = sortedStages.find(
      stage => stage.partner_id === PARTNER_ID
    );

    return partnerLatestStage?.stage === "rejected";
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground">{t("common.loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-4">
        <Text className="text-destructive text-center">
          {t("delivery_navigation.failed_to_load")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">{t("orders.orders")}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-border"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          alignItems: 'center'
        }}
        style={{ maxHeight: 60 }}
      >
        {[
          { label: t("delivery.available_orders") || "Ongoing", value: "ongoing" as const },
          { label: t("orders.assigned") || "Assigned", value: "assigned" as const },
          { label: t("orders.picked_up") || "Picked Up", value: "picked_up" as const },
          { label: t("orders.in_transit") || "In Transit", value: "in_transit" as const },
          { label: t("orders.delivered") || "Delivered", value: "delivered" as const },
        ].map((filter) => (
          <Button
            key={filter.value}
            variant={
              selectedFilter === filter.value ? "primary" : "outline"
            }
            size="sm"
            onPress={() => handleFilterChange(filter.value)}
            className="flex-shrink-0"
          >
            <Text
              className={
                selectedFilter === filter.value
                  ? "text-sm font-semibold text-foreground"
                  : "text-sm font-semibold text-muted-foreground"
              }
            >
              {filter.label}
            </Text>
          </Button>
        ))}
      </ScrollView>

      <ScrollView
        className="flex-1 p-4 gap-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={16}
      >
        {filteredDeliveries.length === 0 ? (
          <View className="flex-1 justify-center items-center p-8">
            <Package size={48} className="text-muted-foreground mb-4" color={resolvedThemeColors?.foreground || "#000000"} />
            <Text className="text-lg font-semibold text-foreground mb-2">
              {t("orders.no_further_actions")}
            </Text>
            <Text className="text-muted-foreground text-center">
              {t("delivery_home.no_active_message")}
            </Text>
          </View>
        ) : (
          filteredDeliveries.map((delivery) => {
            const partnerRejected = didPartnerRejectDelivery(delivery);

            return (
              <Pressable
                key={delivery.id}
                onPress={() => router.push(`/orders/${delivery.id}`)}
              >
                <Card className="p-4 gap-4 mt-2">
                  <View className="flex-row justify-between items-start">
                    <View className="gap-1 flex-1">
                      <Text className="text-base font-semibold">
                        {delivery.order_number || delivery.order_id}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {format(new Date(delivery.created_at), "MMM d, yyyy")}
                      </Text>
                    </View>
                    <View className="gap-2 items-end">
                      <Badge
                        variant={getStatusColor(delivery.current_stage)}
                        className="text-xs"
                      >
                        <Text
                          className={
                            delivery.current_stage === "in_transit"
                              ? "text-xs text-white"
                              : "text-xs text-muted-foreground"
                          }
                        >
                          {getStatusText(delivery.current_stage)}
                        </Text>
                      </Badge>

                      {/* Show "You Rejected" indicator if this partner rejected it */}
                      {partnerRejected && (
                        <Badge variant="destructive" className="flex-row items-center gap-1">
                          <XCircle size={10} color="white" />
                          <Text className="text-xs text-white font-semibold">
                            {t("orders.rejected")}
                          </Text>
                        </Badge>
                      )}
                    </View>
                  </View>

                  <View className="gap-3">
                    {delivery.partner_name && (
                      <View className="flex-row items-center gap-x-2">
                        <User size={16} className="text-muted-foreground" color={resolvedThemeColors?.foreground || "#000000"} />
                        <Text className="text-sm text-muted-foreground">
                          {delivery.partner_name}
                        </Text>
                      </View>
                    )}
                    {delivery.estimated_delivery_time && (
                      <View className="flex-row items-center gap-x-2">
                        <Clock size={16} className="text-muted-foreground" color={resolvedThemeColors?.foreground || "#000000"} />
                        <Text className="text-sm text-muted-foreground">
                          {t("delivery_home.est")}
                          {format(
                            new Date(delivery.estimated_delivery_time),
                            "MMM d, yyyy"
                          )}
                        </Text>
                      </View>
                    )}
                    {delivery.stages.length > 0 &&
                      delivery.stages[delivery.stages.length - 1].location && (
                        <View className="flex-row items-center gap-x-2">
                          <MapPin size={16} className="text-muted-foreground" color={resolvedThemeColors?.foreground || "#000000"} />
                          <Text className="text-sm text-muted-foreground">
                            {delivery.stages[
                              delivery.stages.length - 1
                            ].location!.lat.toFixed(4)}
                            ,{" "}
                            {delivery.stages[
                              delivery.stages.length - 1
                            ].location!.lng.toFixed(4)}
                          </Text>
                        </View>
                      )}
                    <View className="flex-row items-center gap-x-2">
                      <Hash size={16} className="text-muted-foreground" color={resolvedThemeColors?.foreground || "#000000"} />
                      <Text className="text-sm text-muted-foreground">
                        {t("delivery_home.id")} {delivery.id.slice(-8)}
                      </Text>
                    </View>
                  </View>

                  {/* Show rejection notice if partner rejected this delivery */}
                  {partnerRejected && (
                    <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <Text className="text-sm text-destructive font-medium mb-1">
                        {t("orders.rejected")}
                      </Text>
                    </View>
                  )}

                  {delivery.current_stage !== "delivered" && !partnerRejected && (
                    <View className="flex-row gap-x-4 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-row items-center gap-x-2"
                      >
                        <Check size={16} className="text-muted-foreground" color={resolvedThemeColors?.foreground || "#000000"} />
                        <Text className="text-sm">{t("common.update")}</Text>
                      </Button>
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })
        )}

        {/* Loading indicator for pagination */}
        {isFetching && deliveries.length > 0 && (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-muted-foreground">{t("common.loading")}</Text>
          </View>
        )}

        {/* End of list indicator */}
        {deliveriesData && deliveries.length >= deliveriesData.total && deliveries.length > 0 && (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-muted-foreground">{t("home.all_products_loaded")}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
