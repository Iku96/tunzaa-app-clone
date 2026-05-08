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
  Search,
  LinkIcon,
} from "lucide-react-native";
import { useAuth } from "@/context/auth";
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
  const currentRole = user?.activeProfileRole || "buyer";
  const [showKycModal, setShowKycModal] = useState(false);
  const { t } = useI18n();

  const hasWingaProfile = Array.isArray(user?.profiles) && user.profiles.some((p) => p.role === "winga");
  const showTabBar = hasWingaProfile;

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

    // For winga/affiliate, check profile-level KYC
    const currentProfile = Array.isArray(user?.profiles)
      ? user.profiles.find((profile) => profile?.role === user?.activeProfileRole)
      : null;

    if (!currentProfile) {
      setShowKycModal(false);
      return;
    }

    // Show modal only if not verified (winga doesn't have document-level tracking yet)
    const shouldShowModal = !currentProfile?.kyc?.verified;
    setShowKycModal(!!shouldShowModal);
  }, [user?.activeProfileRole, user?.profiles]);

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
          tabBarStyle: showTabBar ? (Platform.OS === "web" ? { display: "none" } : {
            backgroundColor: resolvedColors?.muted || "#F5F5F5",
            borderTopWidth: 0.5,
            borderTopColor: resolvedColors?.muted || "#F5F5F5",
          }) : { display: "none" },
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
          name="search"
          options={{
            title: t("common.search"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <Search
                  size={size}
                  color={focused ? resolvedColors.primary : "#6B7280"}
                />
              ) : (
                <Search
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
                  {t("common.search")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("common.search")}
                </Text>
              ),
            href: currentRole === "winga" ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="links"
          options={{
            title: t("winga.affiliate_links"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <LinkIcon
                  size={size}
                  color={focused ? resolvedColors.primary : "#6B7280"}
                />
              ) : (
                <LinkIcon
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
                  {t("winga.affiliate_links")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("winga.affiliate_links")}
                </Text>
              ),
            href: currentRole === "winga" ? undefined : null,
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

        {/* Hidden screens - not shown in tab bar */}

        <Tabs.Screen
          name="links/[id]"
          options={{
            href: null,
            title: t("winga.affiliate_links"),
          }}
        />
        <Tabs.Screen
          name="product/[id]"
          options={{
            href: null,
            title: t("products.view_product"),
          }}
        />
        <Tabs.Screen
          name="product"
          options={{
            href: null,
            title: t("products.product"),
          }}
        />
        <Tabs.Screen
          name="categories/[id]"
          options={{
            href: null,
            title: t("categories.view_category"),
          }}
        />
        <Tabs.Screen
          name="stores/index"
          options={{
            href: null,
            title: t("common.stores"),
          }}
        />
        <Tabs.Screen
          name="stores/[id]"
          options={{
            href: null,
            title: t("stores.store_info"),
          }}
        />
        <Tabs.Screen
          name="requests/[id]"
          options={{
            href: null,
            title: t("winga.affiliate_links"),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            title: t("public.notifications"),
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
