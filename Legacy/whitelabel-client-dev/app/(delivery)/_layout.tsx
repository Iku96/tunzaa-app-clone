import React from "react";
import { Tabs, Redirect } from "expo-router";
import { Platform } from "react-native";
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  User,
  Package,
  Banknote,
  Store,
  Bell,
  Search,
} from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useState, useEffect } from "react";
import { KycModal } from "@/components/modals/KycModal";

import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { useRouting } from "@/hooks/useRouting";
import { useThemeColors, useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

const TabLayout = () => {
  const { user, refreshUserData } = useAuth();
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();
  const currentRole = user?.activeProfileRole || "buyer";
  const [showKycModal, setShowKycModal] = useState(false);
  const { t } = useI18n();

  const handleKycSuccess = async () => {
    console.log('KYC submitted successfully from layout, refreshing user data...');
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Failed to refresh user data after KYC submission:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      setShowKycModal(false);
      return;
    }

    // Check if user has delivery details
    const hasDeliveryDetails = user.deliveryDetails && typeof user.deliveryDetails === 'object';

    if (!hasDeliveryDetails) {
      setShowKycModal(false);
      return;
    }

    const deliveryDetails = user.deliveryDetails;
    const isVerified = deliveryDetails.kyc?.verified === true;
    const documents = deliveryDetails.kyc?.documents || [];

    // Check document-level statuses
    const hasPendingDocs = documents.length > 0 && documents.some((doc: any) =>
      !doc.verified && !doc.rejection_reason
    );
    const hasRejectedDocs = documents.some((doc: any) => doc.rejection_reason);

    // Don't show modal if:
    // - Delivery partner is verified
    // - Documents are pending (under review)
    const isPending = hasPendingDocs && !hasRejectedDocs;

    // Show modal only if not verified AND not pending (i.e., rejected or not started)
    const shouldShowModal = hasDeliveryDetails && !isVerified && !isPending;

    setShowKycModal(shouldShowModal);
  }, [user?.user_id, user?.deliveryDetails?.kyc?.verified, user?.deliveryDetails?.kyc?.documents]);

  // if (!user) {
  //   return <Redirect href="/onboarding" />;
  // }

  return (
    <>
      <Tabs
        // screenOptions={{
        //   tabBarStyle: Platform.OS === "web" ? { display: "none" } : {
        //     backgroundColor: "white",
        //     borderTopWidth: 1,
        //     borderTopColor: "#E5E7EB",
        //   },
        //   tabBarActiveTintColor: resolvedColors?.primary || colors.primary,
        //   tabBarInactiveTintColor: "#6B7280",
        //   tabBarLabelStyle: {
        //     fontFamily: "InterMedium",
        //     fontSize: 12,
        //     marginBottom: 4,
        //   },
        //   headerShown: false,
        // }}
        screenOptions={{
          tabBarStyle: Platform.OS === "web" ? { display: "none" } : {
            backgroundColor: resolvedColors?.muted || "#F5F5F5",
            borderTopWidth: 0.5,
            borderTopColor: resolvedColors?.muted || "#F5F5F5",
          },
          tabBarActiveTintColor: resolvedColors?.primary || colors.primary,
          tabBarInactiveTintColor: resolvedColors?.muted || "#666666",
          tabBarLabelStyle: {
            fontFamily: "InterMedium",
            fontSize: 12,
            marginBottom: 4,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("common.home"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <Home
                  size={size}
                  color={focused ? resolvedColors.primary : "#6B7280"}
                />
              ) : (
                <Home
                  size={size}
                  className={cn(
                    "text-current",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                />
              ),
            tabBarLabel: ({ focused }) =>
              resolvedColors ? (
                <Text
                  className="text-xs font-medium"
                  style={{
                    color: focused ? resolvedColors.primary : "#6B7280",
                  }}
                >
                  {t("common.home")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("common.home")}
                </Text>
              ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: t("orders.orders"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <ShoppingBag
                  size={size}
                  color={focused ? resolvedColors.primary : "#6B7280"}
                />
              ) : (
                <ShoppingBag
                  size={size}
                  className={cn(
                    "text-current",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                />
              ),
            tabBarLabel: ({ focused }) =>
              resolvedColors ? (
                <Text
                  className="text-xs font-medium"
                  style={{
                    color: focused ? resolvedColors.primary : "#6B7280",
                  }}
                >
                  {t("orders.orders")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("orders.orders")}
                </Text>
              ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            title: t("public.notifications"),
          }}
        />

        <Tabs.Screen
          name="account"
          options={{
            title: t("account.account"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <User
                  size={size}
                  color={focused ? resolvedColors.primary : "#6B7280"}
                />
              ) : (
                <User
                  size={size}
                  className={cn(
                    "text-current",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                />
              ),
            tabBarLabel: ({ focused }) =>
              resolvedColors ? (
                <Text
                  className="text-xs font-medium"
                  style={{
                    color: focused ? resolvedColors.primary : "#6B7280",
                  }}
                >
                  {t("account.profile")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("account.profile")}
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
