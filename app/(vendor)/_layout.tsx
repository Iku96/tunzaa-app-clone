import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import {
  Home,
  Store,
  Search,
  Package,
  ShoppingBag,
  User,
} from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { useRouting } from "@/hooks/useRouting";
import { useThemeColors, useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/hooks/useI18n";

import { KycModal } from "@/components/modals/KycModal";

// Error boundary for KycModal
class KycModalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("KycModal Error Boundary caught error:", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("KycModal Error Boundary details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log("KycModal Error Boundary: Rendering null due to error");
      return null;
    }

    return this.props.children;
  }
}

const TabLayout = () => {
  const { user, refreshUserData } = useAuth();
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();

  const [showKycModal, setShowKycModal] = useState(false);

  const handleKycSuccess = async () => {
    console.log('KYC submitted successfully from layout, refreshing user data...');
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Failed to refresh user data after KYC submission:', error);
    }
  };

  // console.log("We are now in the vendor layout");
  // console.log("The user: ", JSON.stringify(user, null, 2));

  useEffect(() => {
    if (!user) {
      setShowKycModal(false);
      return;
    }

    // Check if user has vendor details and verification status
    const hasVendorDetails = user.vendorDetails && typeof user.vendorDetails === 'object';

    if (!hasVendorDetails) {
      setShowKycModal(false);
      return;
    }

    const vendorDetails = user.vendorDetails;
    const vendorStatus = vendorDetails.verification_status?.toLowerCase();
    const documents = vendorDetails.verification_documents || [];

    // Check document-level statuses to determine if modal should show
    const hasPendingDocs = documents.some((doc: any) =>
      doc.verification_status?.toLowerCase() === "pending"
    );
    const hasRejectedDocs = documents.some((doc: any) =>
      doc.verification_status?.toLowerCase() === "rejected" && doc.rejection_reason
    );
    const allDocsApproved = documents.length > 0 && documents.every((doc: any) =>
      doc.verification_status?.toLowerCase() === "approved"
    );

    // Don't show modal if:
    // - Vendor is approved OR all docs are approved
    // - Documents are pending (resubmitted and under review)
    const isApproved = vendorStatus === "approved" || allDocsApproved;
    const isPending = hasPendingDocs || (vendorStatus === "pending" && documents.length > 0);

    // Show modal only if not approved AND not pending (i.e., rejected or not started)
    const shouldShowModal = hasVendorDetails && !isApproved && !isPending;

    // Only update state if it's actually changing to prevent infinite loops
    setShowKycModal(prevState => {
      if (prevState !== shouldShowModal) {
        return shouldShowModal;
      }
      return prevState;
    });
  }, [user?.user_id, user?.vendorDetails?.verification_status, user?.vendorDetails?.verification_documents]);

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
          name="notifications"
          options={{
            href: null,
            title: t("public.notifications"),
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
          name="products"
          options={{
            title: t("products.products"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <Package
                  size={size}
                  color={focused ? resolvedColors.primary : "#6B7280"}
                />
              ) : (
                <Package
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
                  {t("products.products")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("products.products")}
                </Text>
              ),
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
        <Tabs.Screen
          name="inbox"
          options={{
            href: null,
            title: t("notifications.notifications"),
          }}
        />
      </Tabs>

      <KycModalErrorBoundary>
        <KycModal
          isOpen={showKycModal}
          onClose={() => setShowKycModal(false)}
          onSuccess={handleKycSuccess}
        />
      </KycModalErrorBoundary>
    </>
  );
};

export default TabLayout;
