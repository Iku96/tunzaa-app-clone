import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Truck, User } from "lucide-react-native";
import { useTunzaaAuth as useAuth } from "@/src/contexts/TunzaaAuthContext";
import { useState, useEffect } from "react";
import { KycModal } from "@/components/modals/KycModal";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { useThemeColors, useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

const TabLayout = () => {
  const { user, refreshUserData } = useAuth();
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();
  const [showKycModal, setShowKycModal] = useState(false);
  const { t } = useI18n();

  const handleKycSuccess = async () => {
    console.log("KYC submitted successfully from layout, refreshing user data...");
    try {
      await refreshUserData();
    } catch (error) {
      console.error("Failed to refresh user data after KYC submission:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setShowKycModal(false);
      return;
    }

    // Check if user has delivery details
    const hasDeliveryDetails = user.deliveryDetails && typeof user.deliveryDetails === "object";

    if (!hasDeliveryDetails) {
      setShowKycModal(false);
      return;
    }

    const deliveryDetails = user.deliveryDetails;
    const isVerified = deliveryDetails.kyc?.verified === true;
    const documents = deliveryDetails.kyc?.documents || [];

    // Check document-level statuses
    const hasPendingDocs =
      documents.length > 0 &&
      documents.some((doc: any) => !doc.verified && !doc.rejection_reason);
    const hasRejectedDocs = documents.some((doc: any) => doc.rejection_reason);

    // Don't show modal if verified or pending
    const isPending = hasPendingDocs && !hasRejectedDocs;
    const shouldShowModal = hasDeliveryDetails && !isVerified && !isPending;
    setShowKycModal(shouldShowModal);
  }, [
    user?.user_id,
    user?.deliveryDetails?.kyc?.verified,
    user?.deliveryDetails?.kyc?.documents,
  ]);

  // Brand color for active tab
  const activeColor = "#425BA4";
  const inactiveColor = "#9CA3AF";

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle:
            Platform.OS === "web"
              ? { display: "none" }
              : {
                  backgroundColor: "#FFFFFF",
                  borderTopWidth: 0.5,
                  borderTopColor: "#E5E7EB",
                  paddingTop: 4,
                },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarLabelStyle: {
            fontFamily: "InterMedium",
            fontSize: 12,
            marginBottom: 4,
          },
          headerShown: false,
        }}
      >
        {/* Delivery Tab (Home) — shows Delivery Requests */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Delivery",
            tabBarIcon: ({ size, focused }) => (
              <Truck size={size} color={focused ? activeColor : inactiveColor} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                className="text-xs font-medium"
                style={{ color: focused ? activeColor : inactiveColor }}
              >
                Delivery
              </Text>
            ),
          }}
        />

        {/* Orders Tab — hidden, navigated to programmatically */}
        <Tabs.Screen
          name="orders"
          options={{
            href: null,
            title: "Orders",
          }}
        />

        {/* Onboarding Tab — hidden, navigated to conditionally */}
        <Tabs.Screen
          name="onboarding"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />

        {/* Notifications — hidden */}
        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            title: "Notifications",
          }}
        />

        {/* Profile Tab */}
        <Tabs.Screen
          name="account"
          options={{
            title: "Profile",
            tabBarIcon: ({ size, focused }) => (
              <User size={size} color={focused ? activeColor : inactiveColor} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                className="text-xs font-medium"
                style={{ color: focused ? activeColor : inactiveColor }}
              >
                Profile
              </Text>
            ),
          }}
        />
      </Tabs>

      <KycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        onSuccess={handleKycSuccess}
      />
    </>
  );
};

export default TabLayout;
