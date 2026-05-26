import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { VendorOrderDetails } from "@/components/orders/details/VendorOrderDetails";
import { DeliveryOrderDetails } from "@/components/orders/details/DeliveryOrderDetails";
import { BuyerOrderDetails } from "@/components/orders/details/BuyerOrderDetails";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { DesktopLayoutWrapper } from "@/components/layout";
import { useI18n } from "@/hooks/useI18n";
export default function OrderDetailsScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const resolvedThemeColors = useResolvedThemeColors();
  if (!user || !id) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedThemeColors?.foreground || "#000000"} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            Invalid request
          </Text>
          <View className="w-6" />
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    const deliveryId = Array.isArray(id) ? id[0] : id;

    switch (user.activeProfileRole) {
      case "vendor":
        // For vendor, we might need a different approach since they work with order IDs not delivery IDs
        return (
          <Text className="text-center p-4">
            {t("delivery_navigation.vendor_order_not_implemented")}
          </Text>
        );
      case "delivery":
        return <DeliveryOrderDetails deliveryId={deliveryId} />;
      case "buyer":
        // For buyer, we might need a different approach since they work with order IDs not delivery IDs
        return (
          <Text className="text-center p-4">
            {t("delivery_navigation.buyer_order_not_implemented")}
          </Text>
        );
      default:
        return null;
    }
  };

  return (
     <DesktopLayoutWrapper
                showSidebar={false}
                showNavBar={true}
                showFooter={true}
                containerClassName="bg-muted"
              >
                <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedThemeColors?.foreground || "#000000"} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          {t("delivery_navigation.delivery_details")}
        </Text>
        <View className="w-6" />
      </View>
      <View className="flex-1">{renderContent()}</View>
    </SafeAreaView>  
              </DesktopLayoutWrapper>
  
  );
}
