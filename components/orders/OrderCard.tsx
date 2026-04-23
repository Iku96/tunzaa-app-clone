import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Package, MapPin, Edit3 } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { Order } from "@/services/types/orders";
import { useI18n } from "@/hooks/useI18n";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface OrderCardProps {
  order: Order;
  onStatusUpdate?: (order: Order) => void;
  onPress?: () => void;
  showStatusEdit?: boolean;
}

export const OrderCard = ({
  order,
  onPress,
  onStatusUpdate,
  showStatusEdit = true,
}: OrderCardProps) => {
  const router = useRouter();
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-warning";
      case "processing":
        return "text-blue-500";
      case "confirmed":
        return "text-green-500";
      case "shipped":
        return "text-purple-500";
      case "delivered":
      case "completed":
        return "text-success";
      case "cancelled":
      case "refunded":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return t("orders.pending");
      case "processing":
        return t("orders.processing");
      case "confirmed":
        return t("orders.confirmed");
      case "shipped":
        return t("orders.shipped");
      case "delivered":
        return t("orders.delivered");
      case "cancelled":
        return t("orders.cancelled");
      case "refunded":
        return t("orders.refunded");
      default:
        return status;
    }
  };

  return (
    <Pressable onPress={onPress}>
      <Card className="p-4 gap-4 mb-3">
        <View className="flex-row justify-between items-start">
          <View className="gap-1 flex-1">
            <Text className="text-base font-semibold">
              #{order.order_number}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {/* {format(new Date(order.created_at), "MMM d, yyyy")} */}
            </Text>
          </View>
          <View className="flex-row gap-2 items-center">
            <Badge variant="outline" className="text-xs">
              <Text className={`text-xs ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </Text>
            </Badge>
            {/* {showStatusEdit && onStatusUpdate && (
              <Button
                size="icon"
                variant="outline"
                onPress={(e: any) => {
                  e.stopPropagation();
                  onStatusUpdate(order);
                }}
              >
                <Edit3 size={16} className="text-muted-foreground" />
              </Button>
            )} */}
          </View>
        </View>

        {/* Product Items Preview */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Package size={16} className="text-muted-foreground" color={resolvedColors.primary} />
            <Text className="text-sm text-muted-foreground">
              {order.items.length}{" "}
              {order.items.length === 1 ? t("orders.item") : t("orders.items")}
            </Text>
          </View>

          {/* Display first few items with images */}
          <View className="gap-2">
            {order.items.slice(0, 2).map((item, index) => (
              <View
                key={item.item_id}
                className="flex-row items-center gap-3 p-2 bg-muted rounded-lg"
              >
                <View className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
                  <Package size={20} className="text-muted-foreground" color={resolvedColors.foreground} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × {item.unit_price.toLocaleString()}{" "}
                    {order.currency}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-success">
                  {item.total.toLocaleString()} {order.currency}
                </Text>
              </View>
            ))}

            {/* Show "and X more items" if there are more than 2 items */}
            {order.items.length > 2 && (
              <Text className="text-xs text-muted-foreground text-center py-1">
                +{order.items.length - 2} {t("orders.more_items")}
              </Text>
            )}
          </View>

          <View className="flex-row items-center gap-2">
            <MapPin size={16} className="text-muted-foreground" color={resolvedColors.primary} />
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
              {order.shipping_address.city},{" "}
              {order.shipping_address.state_province}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-success">
            {order.totals.total.toLocaleString()} {order.currency}
          </Text>
          <Badge
            variant={order.payment_status === "paid" ? "success" : "outline"}
          >
            <Text
              className={`text-xs ${
                order.payment_status === "paid"
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
            >
              {order.payment_status === "paid"
                ? t("orders.paid")
                : t("orders.unpaid")}
            </Text>
          </Badge>
        </View>
      </Card>
    </Pressable>
  );
};
