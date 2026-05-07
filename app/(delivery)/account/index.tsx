import { useState } from "react";
import { View, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, Building2, Car } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { DesktopLayoutWrapper } from "@/components/layout";
import { useResponsive } from "@/hooks/useResponsive";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useI18n } from "@/hooks/useI18n";
import { DeliveryHistory } from "@/components/delivery/DeliveryHistory";

type ProfileTab = "info" | "history";

const AccountScreen = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { user, logout, refreshUserData } = useAuth();
  const { deliveryDetails } = useProfileDetails();
  const { isDesktop } = useResponsive();

  const [activeTab, setActiveTab] = useState<ProfileTab>("info");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const PARTNER_ID = deliveryDetails?.partner_id || "";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Extract partner info
  const partnerName = deliveryDetails?.name || user?.name || "—";
  const companyName = deliveryDetails?.type === "business"
    ? deliveryDetails?.name || "Business"
    : deliveryDetails?.type === "individual"
    ? "Individual Courier"
    : deliveryDetails?.type || "Courier";
  const vehicleInfo = deliveryDetails?.vehicle_info?.details || deliveryDetails?.vehicle_info?.type || "—";

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-muted"
    >
      <SafeAreaView className={`flex-1 ${isDesktop ? "bg-white" : "bg-background"}`}>
        {/* Header */}
        <View className="py-4 border-b border-border items-center">
          <Text className="text-lg font-semibold text-foreground">Profile</Text>
        </View>

        {/* Tab Bar */}
        <View className="flex-row border-b border-border">
          <TouchableOpacity
            className="flex-1 py-3 items-center"
            onPress={() => setActiveTab("info")}
            style={{
              borderBottomWidth: activeTab === "info" ? 2 : 0,
              borderBottomColor: "#425BA4",
            }}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: activeTab === "info" ? "#425BA4" : "#9CA3AF" }}
            >
              Your Info
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-3 items-center"
            onPress={() => setActiveTab("history")}
            style={{
              borderBottomWidth: activeTab === "history" ? 2 : 0,
              borderBottomColor: "#425BA4",
            }}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: activeTab === "history" ? "#425BA4" : "#9CA3AF" }}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "info" ? (
          <ScrollView
            className="flex-1"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            <View
              className="p-6 gap-6"
              style={{
                alignSelf: "center",
                width: isDesktop ? 600 : "100%",
              }}
            >
              {/* Your Name */}
              <View className="flex-row items-center">
                <User size={20} color="#9CA3AF" />
                <View className="ml-4 flex-1">
                  <Text className="text-xs text-muted-foreground">Your Name</Text>
                  <Text className="text-base font-semibold text-foreground mt-0.5">
                    {partnerName}
                  </Text>
                </View>
              </View>

              {/* Company */}
              <View className="flex-row items-center">
                <Building2 size={20} color="#9CA3AF" />
                <View className="ml-4 flex-1">
                  <Text className="text-xs text-muted-foreground">Company</Text>
                  <Text className="text-base font-semibold text-foreground mt-0.5">
                    {companyName}
                  </Text>
                </View>
              </View>

              {/* Vehicle */}
              <View className="flex-row items-center">
                <Car size={20} color="#9CA3AF" />
                <View className="ml-4 flex-1">
                  <Text className="text-xs text-muted-foreground">Vehicle</Text>
                  <Text className="text-base font-semibold text-foreground mt-0.5">
                    {vehicleInfo}
                  </Text>
                </View>
              </View>

              {/* Logout Button */}
              <View className="mt-8">
                <TouchableOpacity
                  className="py-4 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: "#1F2937",
                    opacity: isLoggingOut ? 0.6 : 1,
                  }}
                  onPress={handleLogout}
                  disabled={isLoggingOut}
                >
                  <Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
                    {isLoggingOut ? "Logging out..." : "Log out"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          <DeliveryHistory partnerId={PARTNER_ID} />
        )}
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
};

export default AccountScreen;
