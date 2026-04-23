import { View, Text, ScrollView } from "react-native";
import { format } from "date-fns";
import { useReviewsStore } from "@/stores/reviews";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/stores/orders";
import { ReviewModal } from "@/components/modals/ReviewModal";
import { TunzaaProgress } from "../TunzaaProgress";
import { OrderStatus } from "../OrderStatus";

interface BuyerOrderDetailsProps {
  order: Order | null;
}

export function BuyerOrderDetails({ order }: BuyerOrderDetailsProps) {
  const { getReviewByOrderId } = useReviewsStore();

  if (!order) return null;

  const hasReview = getReviewByOrderId(order.id);
  const canReview = order.status === "completed" && !hasReview;

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Card className="mb-6">
        <View className="p-4 gap-4">
          <Text className="text-lg font-semibold text-foreground">
            Order Information
          </Text>
          <Text className="text-base font-semibold text-foreground">
            {order.id}
          </Text>
          <OrderStatus status={order.status} />
          <Text className="text-sm text-muted-foreground">
            Ordered on {format(new Date(order.createdAt), "MMM d, yyyy")}
          </Text>
        </View>
      </Card>

      <Card className="mb-6">
        <View className="p-4 gap-4">
          <Text className="text-lg font-semibold text-foreground">Items</Text>
          {order.items.map((item) => (
            <View
              key={item.productId}
              className="flex-row justify-between items-center"
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Product #{item.productId}
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text className="text-base font-semibold text-foreground ml-4">
                TShs {item.price.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card className="mb-6">
        <View className="p-4 gap-4">
          <Text className="text-lg font-semibold text-foreground">Payment</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-muted-foreground">Method</Text>
            <Text className="text-base font-semibold text-foreground">
              {order.paymentMethod === "tunzaa" ? "Tunzaa" : "Mobile Money"}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-muted-foreground">Status</Text>
            <Text className="text-base font-semibold text-foreground">
              {order.paymentStatus.charAt(0).toUpperCase() +
                order.paymentStatus.slice(1)}
            </Text>
          </View>
          {order.tunzaaPayments && (
            <View className="gap-4">
              <TunzaaProgress payments={order.tunzaaPayments} />
              <View className="gap-3">
                {order.tunzaaPayments.map((payment) => (
                  <View
                    key={payment.installmentNumber}
                    className="flex-row justify-between items-center bg-secondary/50 p-3 rounded-xl"
                  >
                    <View>
                      <Text className="text-sm font-semibold text-foreground">
                        Payment {payment.installmentNumber}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1">
                        Due {format(new Date(payment.dueDate), "MMM d, yyyy")}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-foreground">
                      TShs {payment.amount.toLocaleString()}
                    </Text>
                    <Badge
                      variant={
                        payment.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </Badge>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Card>

      <Card className="mb-6">
        <View className="p-4 gap-4">
          <Text className="text-lg font-semibold text-foreground">Total</Text>
          <Text className="text-2xl font-bold text-primary">
            TShs {order.total.toLocaleString()}
          </Text>
        </View>
      </Card>

      <ReviewModal order={order} canReview={canReview} />

      {hasReview && (
        <View className="flex-row items-center justify-center bg-primary/10 px-3 py-2 rounded-full gap-x-1 self-center">
          <Text className="text-sm font-semibold text-primary">
            Review Submitted
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
