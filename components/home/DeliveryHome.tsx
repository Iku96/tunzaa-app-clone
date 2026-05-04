import { useState, useCallback, useEffect } from "react";
import { View, ScrollView, Pressable, Switch } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Package,
  Banknote,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Calendar,
} from "lucide-react-native";
import { format, parseISO } from "date-fns";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDeliveries, useUpdateDeliveryPartnerStatus } from "@/src/services/delivery";
import { useGetDeliveryPartnerGMV, useGetDeliveryPartnerPerformance } from "@/src/services/reports";
import { useAuth } from "@/context/auth";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useResolvedThemeColors, useBrandStyles } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { NotificationIcon } from "../NotificationIcon";
import { useI18n } from "@/hooks/useI18n";

export function DeliveryHome() {
  const { t } = useI18n();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  // Get brand colors and styles
  const resolvedColors = useResolvedThemeColors();
  const brandStyles = useBrandStyles();

  // Get delivery details using the profile details hook
  const { deliveryDetails, isLoading: isProfileLoading } = useProfileDetails();
  const PARTNER_ID = deliveryDetails?.partner_id;

  // Initialize isAvailable from profile data, fallback to true
  const [isAvailable, setIsAvailable] = useState(deliveryDetails?.is_available ?? true);

  // Update local state when profile data changes
  useEffect(() => {
    if (deliveryDetails?.is_available !== undefined) {
      setIsAvailable(deliveryDetails.is_available);
    }
  }, [deliveryDetails?.is_available]);

  // API hook for updating delivery partner status
  const updateStatusMutation = useUpdateDeliveryPartnerStatus();

  // Handle availability toggle
  const handleAvailabilityToggle = async (newValue: boolean) => {
    if (!PARTNER_ID) return;

    try {
      // Optimistically update the UI
      setIsAvailable(newValue);

      // Call the API
      await updateStatusMutation.mutateAsync({
        partnerId: PARTNER_ID,
        data: { is_available: newValue }
      });
    } catch (error) {
      // Revert on error
      setIsAvailable(!newValue);
      console.error('Failed to update availability status:', error);
    }
  };

  // Fetch delivery partner reports
  const {
    data: gmvData,
    isLoading: isGMVLoading,
    refetch: refetchGMV,
  } = useGetDeliveryPartnerGMV(PARTNER_ID || "", !!PARTNER_ID);

  const {
    data: performanceData,
    isLoading: isPerformanceLoading,
    refetch: refetchPerformance,
  } = useGetDeliveryPartnerPerformance(PARTNER_ID || "", !!PARTNER_ID);

  // Fetch recent deliveries
  const {
    data: deliveriesData,
    isLoading: isDeliveriesLoading,
    refetch: refetchDeliveries,
  } = useGetDeliveries(
    {
      partner_id: PARTNER_ID || "",
      limit: 5,
    },
    !!PARTNER_ID
  );

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchGMV();
      refetchPerformance();
      refetchDeliveries();
    }, [refetchGMV, refetchPerformance, refetchDeliveries])
  );

  // Process GMV data for order status distribution
  const orderStatusData = gmvData?.data || [];
  const totalOrders = orderStatusData.reduce((sum, item) => sum + item["orders.count"], 0);

  // Get performance metrics (take first item as mentioned in requirements)
  const performanceMetrics = performanceData?.data?.[0];

  // Filter for active deliveries
  const activeDeliveries = (deliveriesData?.items || [])
    .filter((delivery) =>
      ["assigned", "picked_up", "in_transit"].includes(delivery.current_stage)
    );

  const getStatusColor = (stage: string) => {
    switch (stage.toUpperCase()) {
      case "ASSIGNED":
        return "secondary";
      case "PICKED_UP":
        return "outline";
      case "IN_TRANSIT":
        return "default";
      case "DELIVERED":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (stage: string) => {
    switch (stage.toUpperCase()) {
      case "ASSIGNED":
        return AlertCircle;
      case "PICKED_UP":
        return Package;
      case "IN_TRANSIT":
        return MapPin;
      case "DELIVERED":
        return CheckCircle;
      default:
        return Package;
    }
  };

  if (!deliveryDetails && !isProfileLoading) {
    return (
      <View className="flex-1 bg-muted">
        <View className="p-4 flex-row justify-between items-center border-b border-border"
          {...brandStyles.primaryBackground(0.05)}>
          <Text className="text-2xl font-bold text-foreground">{t("delivery_home.reports_title")}</Text>
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
    <View className={isDesktop ? "bg-white" : "bg-muted"} style={{ flex: 1 }}>
      <View className="p-4 flex-row justify-between items-center border-b border-border"
      >
        <Text className="text-xl font-bold text-foreground">{t("delivery_home.welcome", { name: deliveryDetails?.name })}</Text>
        <View className="flex-row items-center gap-2">
          {/* <Text className="text-sm font-semibold text-muted-foreground">
              {isAvailable ? "Available" : "Unavailable"}
            </Text> */}
          {/* <Switch 
              value={isAvailable} 
              onValueChange={handleAvailabilityToggle}
              disabled={updateStatusMutation.isPending}
              trackColor={{ 
                false: resolvedColors?.muted || "#E5E7EB", 
                true: resolvedColors?.primary || "#1B1B1B" 
              }}
              thumbColor={isAvailable ? (resolvedColors?.primaryForeground || "#FFFFFF") : "#FFFFFF"}
              ios_backgroundColor={resolvedColors?.muted || "#E5E7EB"}
            /> */}
        </View>
        <NotificationIcon />
      </View>

      <ScrollView className="flex-1">
        {/* Performance Overview */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            {t("delivery_home.performance_overview")}
          </Text>

          <View className="flex-row flex-wrap gap-4 mb-6">
            {/* Total Orders */}
            <Card className="flex-1 min-w-[160px]"
              {...brandStyles.primaryBorder()}
              style={[
                brandStyles.primaryBorder().style,
                { borderWidth: 2 }
              ]}>
              <CardContent className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Package size={20} color={resolvedColors?.primary || "#1B1B1B"} />

                </View>
                {isPerformanceLoading ? (
                  <Skeleton height={32} width={64} style={{ marginBottom: 4 }} />
                ) : (
                  <Text className="text-2xl font-bold" {...brandStyles.primaryText()}>
                    {performanceMetrics?.["performance.total_orders"] || 0}
                  </Text>
                )}
                <Text className="text-sm text-muted-foreground">{t("delivery_home.total_orders")}</Text>
              </CardContent>
            </Card>

            {/* Success Rate */}
            {/* <Card className="flex-1 min-w-[160px]">
              <CardContent className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <CheckCircle size={20} color={resolvedColors?.success || "#4CAF50"} />
                  <TrendingUp size={16} color={resolvedColors?.success || "#4CAF50"} />
                </View>
                {isPerformanceLoading ? (
                  <Skeleton height={32} width={64} style={{ marginBottom: 4 }} />
                ) : (
                  <Text className="text-2xl font-bold text-foreground">
                    {performanceMetrics?.["performance.success_rate"]?.toFixed(1) || "0.0"}%
                  </Text>
                )}
                <Text className="text-sm text-muted-foreground">{t("delivery_home.success_rate")}</Text>
              </CardContent>
            </Card> */}

            {/* Average Order Value */}
            {/* <Card className="flex-1 min-w-[160px]">
              <CardContent className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Banknote size={20} color={resolvedColors?.primary || "#1B1B1B"} />
                  <BarChart3 size={16} className="text-muted-foreground" />
                </View>
                {isPerformanceLoading ? (
                  <Skeleton height={32} width={80} style={{ marginBottom: 4 }} />
                ) : (
                  <Text className="text-2xl font-bold text-foreground">
                    TShs {Math.round(performanceMetrics?.["performance.avg_order_value"] || 0).toLocaleString()}
                  </Text>
                )}
                <Text className="text-sm text-muted-foreground">Avg Order Value</Text>
              </CardContent>
            </Card> */}

            {/* Active Days */}
            <Card className="flex-1 min-w-[160px]">
              <CardContent className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Calendar size={20} color={resolvedColors?.primary || "#1B1B1B"} />

                </View>
                {isPerformanceLoading ? (
                  <Skeleton height={32} width={48} style={{ marginBottom: 4 }} />
                ) : (
                  <Text className="text-2xl font-bold text-foreground">
                    {performanceMetrics?.["performance.active_days"] || 0}
                  </Text>
                )}
                <Text className="text-sm text-muted-foreground">{t("delivery_home.active_days")}</Text>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* Order Status Distribution */}
        <View className="px-4 pb-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            {t("delivery_home.order_status_distribution")}
          </Text>

          <Card>
            <CardContent className="p-4">
              {isGMVLoading ? (
                <View className="gap-3">
                  {[1, 2, 3].map((i) => (
                    <View key={i} className="flex-row items-center justify-between">
                      <Skeleton height={16} width={80} />
                      <Skeleton height={16} width={48} />
                    </View>
                  ))}
                </View>
              ) : orderStatusData.length === 0 ? (
                <View className="py-8 items-center">
                  <Package size={48} className="text-primary mb-2" color={resolvedColors?.primary || "#1B1B1B"} />
                  <Text className="text-muted-foreground">No order data available</Text>
                </View>
              ) : (
                <View className="gap-3">
                  {orderStatusData.map((item, index) => {
                    const StatusIcon = getStatusIcon(item.delivery_stage);
                    const percentage = totalOrders > 0 ? (item["orders.count"] / totalOrders) * 100 : 0;

                    return (
                      <View key={index} className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3 flex-1">
                          <StatusIcon size={20} color={resolvedColors?.primary || "#1B1B1B"} />
                          <View className="flex-1">
                            <Text className="font-medium text-foreground">
                              {item.delivery_stage}
                            </Text>
                            <Text className="text-sm text-muted-foreground">
                              {item["orders.count"]} orders
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="font-semibold text-foreground">
                            {percentage.toFixed(1)}%
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            TShs {Math.round(item["orders.total_revenue"]).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Delivery Performance Details */}
        {performanceMetrics && (
          <View className="px-4 pb-4">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Delivery Performance
            </Text>

            <Card>
              <CardContent className="p-4">
                <View className="gap-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-muted-foreground">
                      Successful Deliveries
                    </Text>
                    <Text className="font-semibold text-foreground">
                      {performanceMetrics["performance.successful_deliveries"]}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-muted-foreground">
                      Cancelled Deliveries
                    </Text>
                    <Text className="font-semibold text-foreground">
                      {performanceMetrics["performance.cancelled_deliveries"]}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-muted-foreground">
                      Pending Deliveries
                    </Text>
                    <Text className="font-semibold text-foreground">
                      {performanceMetrics["performance.pending_deliveries"]}
                    </Text>
                  </View>

                  <View className="h-px bg-border" />

                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-muted-foreground">
                      Total Shipping Revenue
                    </Text>
                    <Text className="font-semibold text-foreground">
                      TShs {Math.round(performanceMetrics["performance.total_shipping_revenue"]).toLocaleString()}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-muted-foreground">
                      Average Shipping Cost
                    </Text>
                    <Text className="font-semibold text-foreground">
                      TShs {Math.round(performanceMetrics["performance.avg_shipping_cost"]).toLocaleString()}
                    </Text>
                  </View>

                  <View className="h-px bg-border" />

                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-muted-foreground">
                      First Order Date
                    </Text>
                    <Text className="font-semibold text-foreground">
                      {format(parseISO(performanceMetrics["performance.first_order_date"]), "MMM d, yyyy")}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-muted-foreground">
                      Last Order Date
                    </Text>
                    <Text className="font-semibold text-foreground">
                      {format(parseISO(performanceMetrics["performance.last_order_date"]), "MMM d, yyyy")}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Recent Active Deliveries */}
        <View className="px-4 pb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-foreground">
              Recent Active Deliveries
            </Text>
            <Button variant="link" onPress={() => router.push("/orders")}>
              <Text className="text-sm font-semibold" {...brandStyles.primaryText()}>View All</Text>
            </Button>
          </View>

          {isDeliveriesLoading ? (
            <View className="gap-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton height={16} width={128} style={{ marginBottom: 8 }} />
                    <Skeleton height={12} width={96} style={{ marginBottom: 8 }} />
                    <Skeleton height={12} width={80} />
                  </CardContent>
                </Card>
              ))}
            </View>
          ) : activeDeliveries.length === 0 ? (
            <Card>
              <CardContent className="p-8 items-center">
                <Package size={48} className="text-primary mb-4" color={resolvedColors?.primary || "#1B1B1B"} />
                <Text className="text-lg font-semibold text-foreground mb-2">
                  No Active Deliveries
                </Text>
                <Text className="text-muted-foreground text-center">
                  All caught up! No ongoing deliveries at the moment.
                </Text>
              </CardContent>
            </Card>
          ) : (
            <View className="gap-3">
              {activeDeliveries.map((delivery) => (
                <Pressable
                  key={delivery.id}
                  onPress={() => router.push(`/orders/${delivery.id}`)}
                >
                  <Card>
                    <CardContent className="p-4">
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="font-semibold text-foreground">
                          Order #{delivery.order_id.slice(-8)}
                        </Text>
                        <Badge variant={getStatusColor(delivery.current_stage)}>
                          <Text className="text-xs font-semibold" {...brandStyles.primaryText()}>
                            {delivery.current_stage.replace("_", " ").toUpperCase()}
                          </Text>
                        </Badge>
                      </View>

                      <View className="flex-row items-center gap-2 mb-2">
                        <Clock size={16} className="text-primary" color={resolvedColors?.primary || "#1B1B1B"} />
                        <Text className="text-sm text-muted-foreground">
                          Est: {delivery.estimated_delivery_time ? format(new Date(delivery.estimated_delivery_time), "MMM d, yyyy") : "TBD"}
                        </Text>
                      </View>

                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-muted-foreground">
                          ID: {delivery.id.slice(-8)}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {format(new Date(delivery.created_at), "MMM d")}
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
