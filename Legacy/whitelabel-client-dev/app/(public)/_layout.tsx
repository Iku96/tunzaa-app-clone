import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Home, Store, Search, User } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { useRouting } from "@/hooks/useRouting";
import { useThemeColors, useResolvedThemeColors, useBrandStyles } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

const TabLayout = () => {
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();
  const brandStyles = useBrandStyles();
  const { t } = useI18n();

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
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("nav.home"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <Home
                  size={size}
                  color={focused ? resolvedColors.primary : resolvedColors.mutedForeground}
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
                    color: focused ? resolvedColors.primary : resolvedColors.mutedForeground,
                  }}
                >
                  {t("nav.home")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("nav.home")}
                </Text>
              ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: t("nav.search"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <Search
                  size={size}
                  color={focused ? resolvedColors.primary : resolvedColors.mutedForeground}
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
                    color: focused ? resolvedColors.primary : resolvedColors.mutedForeground,
                  }}
                >
                  {t("nav.search")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("nav.search")}
                </Text>
              ),
          }}
        />
        <Tabs.Screen
          name="product/[id]"
          options={{
            href: null,
            title: "View Product",
          }}
        />
        <Tabs.Screen
          name="stores"
          options={{
            href: null,
            title: "Stores",
          }}
        />
        <Tabs.Screen
          name="stores/[id]"
          options={{
            href: null,
            title: "View Store",

          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            href: null,
            title: "Categories",
          }}
        />
        <Tabs.Screen
          name="categories/[id]"
          options={{
            href: null,
            title: "View Category",
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            title: "Notifications",
          }}
        />
        <Tabs.Screen
          name="privacy-policy"
          options={{
            href: null,
            title: "Privacy Policy",
          }}
        />
        <Tabs.Screen
          name="terms-of-service"
          options={{
            href: null,
            title: "Terms of Service",
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            href: "/(onboarding)",
            title: t("nav.account"),
            tabBarIcon: ({ size, focused }) =>
              resolvedColors ? (
                <User
                  size={size}
                  color={focused ? resolvedColors.primary : resolvedColors.mutedForeground}
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
                    color: focused ? resolvedColors.primary : resolvedColors.mutedForeground,
                  }}
                >
                  {t("nav.profile")}
                </Text>
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    focused ? "text-theme-primary" : "text-muted-foreground"
                  )}
                >
                  {t("nav.profile")}
                </Text>
              ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
