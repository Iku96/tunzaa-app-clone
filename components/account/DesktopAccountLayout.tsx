import { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import AddressesScreen from "./addresses";
import WishlistScreen from "./wishlist";
import RewardsScreen from "./rewards";
import AccountDetailsScreen from "./details";
import SupportScreen from "./support";
import { useTenantModules } from "@/hooks/useTenantModules";

type Tab = "profile" | "delivery" | "wishlist" | "rewards" | "support";

export const DesktopAccountLayout = ({
  handleLogout,
  isLoading,
}: {
  handleLogout: () => void;
  isLoading: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const { isDeliveryEnabled, isRewardsEnabled } = useTenantModules();

  const sidebarItems = [
    { key: "profile" as Tab, label: "Profile" },
    { key: "delivery" as Tab, label: "Delivery Addresses", show: isDeliveryEnabled },
    { key: "wishlist" as Tab, label: "Wishlist" },
    { key: "rewards" as Tab, label: "Rewards & Referrals", show: isRewardsEnabled },
    { key: "support" as Tab, label: "Support" },
  ].filter(item => item.key !== "delivery" && item.key !== "rewards" ? true : item.show);

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <AccountDetailsScreen />;
      case "delivery":
        return <AddressesScreen />;
      case "wishlist":
        return <WishlistScreen />;
      case "rewards":
        return <RewardsScreen />;
      case "support":
        return <SupportScreen />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-row w-full h-full">
      {/* Sidebar */}
      <View className="w-64 bg-white border-r border-gray-200 p-4">
        {sidebarItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            className={`p-3 rounded-lg mb-2 ${
              activeTab === item.key
                ? "bg-red-500"
                : "bg-transparent"
            }`}
            onPress={() => setActiveTab(item.key)}
          >
            <Text
              className={`text-base ${
                activeTab === item.key ? "text-white font-semibold" : "text-gray-700"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Sign Out */}
        <View className="mt-6">
          <Button
            variant="destructive"
            onPress={handleLogout}
            disabled={isLoading}
            className="w-full"
          >
            <Text className="text-base font-medium text-white">
              {isLoading ? "Signing out..." : "Sign Out"}
            </Text>
          </Button>
        </View>
      </View>

      {/* Main content */}
      <ScrollView className="flex-1 p-6">{renderContent()}</ScrollView>
    </View>
  );
};