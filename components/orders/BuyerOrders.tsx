import { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Order } from "@/stores/orders";
import { useOrdersStore, useOrders } from "@/stores/orders";
import { format } from "date-fns";
import { router } from "expo-router";
import { OrderStatus } from "./OrderStatus";
import { TunzaaProgress } from "./TunzaaProgress";
import { Card } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Text } from "../ui/text";

// Extend the Order type to include the type property
// (No longer needed, handled in store)

export const BuyerOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { selectedFilter, getFilteredOrders, setFilter } = useOrdersStore();
  const { data, isLoading, isError } = useOrders();

  // Use API data if available, otherwise fallback to mock data
  const filteredOrders = getFilteredOrders(data?.items);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Orders</Text>
      </View>

      <View className="flex-row p-4 gap-3">
        {["History", "Ongoing", "Scheduled"].map((filter) => (
          <Button
            key={filter}
            className={
              selectedFilter === filter.toLowerCase()
                ? "flex-1 py-2 px-4 bg-primary"
                : "flex-1 py-2 px-4 bg-secondary"
            }
            onPress={() => setFilter(filter.toLowerCase() as any)}
          >
            <Text
              className={
                selectedFilter === filter.toLowerCase()
                  ? "text-sm font-semibold text-white text-center"
                  : "text-sm font-semibold text-primary text-center"
              }
            >
              {filter}
            </Text>
          </Button>
        ))}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text>Loading orders...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text>Failed to load orders. Showing offline data.</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text>No orders found.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="mb-4">
              <TouchableOpacity
                className="p-4"
                onPress={() => router.push(`/orders/${order.id}`)}
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <Text className="text-base font-semibold text-foreground">
                      {order.id}
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </Text>
                  </View>
                  <OrderStatus status={order.status} />
                </View>

                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className="text-sm text-muted-foreground">
                      Total Amount
                    </Text>
                    <Text className="text-base font-bold text-foreground mt-1">
                      TShs {order.total.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View className="gap-3">
                  <View className="self-start bg-secondary/50 px-3 py-1.5 rounded-full">
                    <Text className="text-sm font-semibold text-foreground">
                      {order.paymentMethod === "tunzaa"
                        ? "Tunzaa"
                        : "Mobile Money"}
                    </Text>
                  </View>

                  {order.tunzaaPayments && (
                    <TunzaaProgress payments={order.tunzaaPayments} />
                  )}
                </View>
              </TouchableOpacity>
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
