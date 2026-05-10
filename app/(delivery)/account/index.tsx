import { useState } from "react";
import { View, ScrollView, TouchableOpacity, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, Building2, Car } from "lucide-react-native";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
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
  const { user, logout, refreshUserData } = useTunzaaAuth();
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
  const isApproved = deliveryDetails?.is_approved ?? false;
  const profilePicture = deliveryDetails?.profile_picture || user?.profile_picture || null;

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
              {/* Profile Picture */}
              <View className="items-center mb-2">
                <View className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-sm items-center justify-center">
                  {profilePicture ? (
                    <Image 
                      source={{ uri: profilePicture }} 
                      style={{ width: '100%', height: '100%', borderRadius: 50 }} 
                      resizeMode="cover"
                    />
                  ) : (
                    <User size={40} color="#9CA3AF" />
                  )}
                </View>
              </View>

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

              {/* Status Indicator */}
              <View className="flex-row items-center">
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: isApproved ? '#84CC16' : '#F59E0B', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' }} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-xs text-muted-foreground">Account Status</Text>
                  <Text className="text-base font-semibold mt-0.5" style={{ color: isApproved ? '#65A30D' : '#D97706' }}>
                    {isApproved ? "Approved" : "Pending Approval"}
                  </Text>
                </View>
              </View>

              {/* Logout Button */}
              <View className="mt-8">
                <TouchableOpacity
                  className="py-4 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: "#315BA9",
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
