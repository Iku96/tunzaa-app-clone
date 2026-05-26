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
  const { user } = useAuth();
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();
  const currentRole = user?.activeProfileRole || "buyer";
  const [showKycModal, setShowKycModal] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (user) {
      const currentProfile = user.profiles.find(
        (profile) => profile.role === user.activeProfileRole
      );
      if (currentProfile && !currentProfile.kyc.verified) {
        setShowKycModal(true);
      }
    }
  }, [user?.activeProfileRole]);

  // if (!user) {
  //   return <Redirect href="/onboarding" />;
  // }

  return (
    <>
      <Tabs
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
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("common.home"),
            //Let's change the home icon and use a different icon when focused
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

            href: currentRole === "buyer" ? undefined : null,
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
          name="cart"
          options={{
            title: t("cart.cart"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <ShoppingCart
                  size={size}
                  color={focused ? resolvedColors.primary : "#6B7280"}
                />
              ) : (
                <ShoppingCart
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
                  {t("cart.cart")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("cart.cart")}
                </Text>
              ),
            href: currentRole === "buyer" ? undefined : null,
          }}
        />

        <Tabs.Screen
          name="store/[id]"
          options={{
            href: null,
            title: t("common.stores"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <Store
                  size={size}
                  color={focused ? resolvedColors.primary : "#6B7280"}
                />
              ) : (
                <Store
                  size={size}
                  className={cn(
                    "text-current",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                />
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
          name="categories"
          options={{
            href: null,
            title: t("categories.categories"),
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
          name="product/[id]"
          options={{
            href: null,
            title: t("products.view_product"),
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
          name="payment"
          options={{
            href: null,
            title: t("payment.payment"),
          }}
        />
        <Tabs.Screen
          name="stores"
          options={{
            href: null,
            title: t("common.stores"),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
