import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { VendorOrders } from "@/components/orders/VendorOrders";

export default function OrdersScreen() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <VendorOrders />
    </SafeAreaView>
  );
}
