import { SafeAreaView } from "react-native-safe-area-context";
import { useTunzaaAuth as useAuth } from "@/src/contexts/TunzaaAuthContext";
import { DeliveryOrders } from "@/components/orders/DeliveryOrders";
import { DesktopLayoutWrapper } from "@/components/layout";

export default function OrdersScreen() {
  const { user } = useAuth();

  if (!user) return null;

  return (
     <DesktopLayoutWrapper
                showSidebar={false}
                showNavBar={true}
                showFooter={true}
                containerClassName="bg-muted"
              >
                <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <DeliveryOrders />
    </SafeAreaView> 
              </DesktopLayoutWrapper>
   
  );
}
