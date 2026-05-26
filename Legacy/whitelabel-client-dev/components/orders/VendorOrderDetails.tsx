import { useCallback } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useGetOrder } from "@/services/order-management";
import { useResponsive } from "@/hooks/useResponsive";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { VendorOrderDetails } from "@/components/orders/details/VendorOrderDetails";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

interface OrderDetailsProps {
  id: string;
}

export function OrderDetails({ id }: OrderDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const resolvedColors = useResolvedThemeColors();

  // API hook to fetch order details
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrder(id, !!id);

  // Refresh order when component comes into focus
  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
      }
    }, [id, refetch])
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted-foreground">
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order || !user) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            {error ? "Error" : "Order not found"}
          </Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-destructive mb-4 text-center">
            {error ? "Failed to load order details. Please try again." : "Order not found"}
          </Text>
          <Button onPress={() => refetch()} variant="default">
            <Text className="text-white font-semibold">Retry</Text>
          </Button>
          <Button 
            onPress={() => router.back()} 
            variant="outline" 
            className="mt-3"
          >
            <Text className="font-semibold">Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <View className={isDesktop ? "flex-1 w-full" : "flex-1"}>
        <VendorOrderDetails order={order} onOrderUpdated={refetch} />
      </View>
    </SafeAreaView>
  );
}