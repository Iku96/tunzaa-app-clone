import React, { useMemo } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { format, parseISO } from "date-fns";
import { Text } from "@/components/ui/text";
import { useDeliveries } from "@/src/services/delivery";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/hooks/useI18n";

interface DeliveryHistoryProps {
  partnerId: string;
}

export const DeliveryHistory: React.FC<DeliveryHistoryProps> = ({ partnerId }) => {
  const { t } = useI18n();
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    data: deliveriesData,
    isLoading,
    refetch,
  } = useDeliveries(
    {
      partner_id: partnerId,
      status: "delivered",
      limit: 50,
      include_order_numbers: true,
      include_partner_details: true,
    },
    !!partnerId
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Group deliveries by month
  const groupedDeliveries = useMemo(() => {
    const items = deliveriesData?.items || [];
    const groups: Record<string, typeof items> = {};

    items.forEach((delivery) => {
      const date = new Date(delivery.created_at);
      const monthKey = format(date, "MMMM yyyy");
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(delivery);
    });

    // Sort groups by date (newest first)
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const dateA = new Date(groups[a][0].created_at);
      const dateB = new Date(groups[b][0].created_at);
      return dateB.getTime() - dateA.getTime();
    });

    return sortedKeys.map((key) => ({
      month: key,
      deliveries: groups[key].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }));
  }, [deliveriesData]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-muted-foreground">Loading history...</Text>
      </View>
    );
  }

  if (groupedDeliveries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-lg font-semibold text-foreground mb-2">No deliveries yet</Text>
        <Text className="text-muted-foreground text-center">
          Your completed deliveries will appear here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View className="px-4 pt-4 pb-8">
        {groupedDeliveries.map((group) => (
          <View key={group.month} className="mb-6">
            {/* Month Header */}
            <Text className="text-lg font-bold text-foreground mb-4">{group.month}</Text>

            {/* Delivery Rows */}
            {group.deliveries.map((delivery) => {
              const date = new Date(delivery.created_at);
              const formattedDate = format(date, "d MMM");
              const formattedTime = format(date, "HH:mm");

              // Extract vendor/shop name from partner details if available
              const vendorName = delivery.partner_details?.name || "Vendor";
              // Extract delivery info
              const customerName = delivery.order_number || delivery.order_id?.slice(-8) || "Customer";

              return (
                <View
                  key={delivery.delivery_id}
                  className="flex-row items-center py-3 border-b border-border"
                >
                  {/* Date + Time + Vendor + Price */}
                  <View className="flex-1">
                    <Text className="text-xs text-muted-foreground mb-0.5">
                      {formattedDate} • {formattedTime}
                    </Text>
                    <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                      {vendorName}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {delivery.order_number ? `#${delivery.order_number}` : `ID: ${delivery.delivery_id.slice(-8)}`}
                    </Text>
                  </View>

                  {/* Delivery Icon */}
                  <View className="px-3">
                    <Text className="text-muted-foreground">🚚</Text>
                  </View>

                  {/* Customer Name */}
                  <View className="items-end">
                    <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                      {customerName}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
