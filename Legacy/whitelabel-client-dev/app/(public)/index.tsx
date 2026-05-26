import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { useAuth } from "@/context/auth";
import { BuyerHome } from "@/components/home/BuyerHome";
import { VendorHome } from "@/components/home/VendorHome";
import { DeliveryHome } from "@/components/home/DeliveryHome";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import {
  DesktopNavBar,
  DesktopFooter,
  CategoriesSidebar,
} from "@/components/layout";
import { ScrollView } from "@/components/ui/scroll-view";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function HomeScreen() {
    usePageTitle("Home");
  return (
      <DesktopLayoutWrapper
            showSidebar={false}
            showCartIcon={false}
            showNavBar={true}
            showFooter={true}
            containerClassName="bg-muted"
          >
    <View className="flex-1 bg-muted">
      {/* Main Content Area */}
      <View className="flex-1 bg-white">
        {/* Desktop Layout with Sidebar */}
        <View className="hidden lg:flex w-[100%]">
          <View className="flex-row gap-8">
            {/* Sidebar */}
            {/* <View className="w-64 flex-shrink-0">
              <CategoriesSidebar />
            </View> */}

            {/* Main Content */}
            <View className="flex-1 min-w-0">
              <SafeAreaView style={{ flex: 1 }}>
                <BuyerHome />
              </SafeAreaView>
            </View>
          </View>
        </View>

        {/* Mobile/Tablet Layout */}
        <View className="lg:hidden flex-1">
          <SafeAreaView style={{ flex: 1 }} edges={["top", "right", "left"]}>
            <BuyerHome />
          </SafeAreaView>
        </View>
      </View>
    </View>  
          </DesktopLayoutWrapper>
  
  );
}
