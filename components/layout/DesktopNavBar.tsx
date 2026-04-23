import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Bell, ShoppingCart, User, Home, Package, ShoppingBag, Store, Search } from "lucide-react-native";
import { DynamicLogo } from "@/components/ui/DynamicLogo";
import { SearchBar } from "@/components/SearchBar";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";
import { NavigationDrawer } from "../Drawer/NavigationDrawer";
import { CartDrawer } from "../Drawer/CartDrawer";
import { LanguageSelector } from "../modals/LanguageSelector";

interface NavigationItem {
  label: string;
  href: string;
}

// -------------------------
// Secondary Nav Component
// -------------------------
function SecondaryNav({ items }: { items: NavigationItem[] }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <View className="flex-row items-center space-x-8 h-12 border-t border-gray-100 px-4">
      {items.map((item) => (
        <TouchableOpacity
          key={item.href}
          onPress={() => router.push(item.href as any)}
          className="py-2"
        >
          <Text className="text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-150">
            {t(item.label)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// -------------------------
// Main Desktop Navbar
// -------------------------
interface DesktopNavBarProps {
  showSearchBar?: boolean;
  showCartIcon?: boolean;
  showSecondaryNav?: boolean;
}

export function DesktopNavBar({
  showSearchBar = true,
  showSecondaryNav = true,
  showCartIcon = true,
}: DesktopNavBarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const colors = useThemeColors();
  const { t } = useI18n();

  if (Platform.OS !== "web") return null;

  const cartItemCount = 0; // Connect to cart logic later

  // Dynamically generate navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const currentRole = user?.activeProfileRole || "public";
    const baseItems: NavigationItem[] = [
      { label: t("nav.home"), href: `/(${currentRole})` },
    ];

    const roleSpecificItems: NavigationItem[] = [];

    switch (currentRole) {
      case "buyer":
      case "public":
        roleSpecificItems.push(
          { label: t("nav.search"), href: `/(${currentRole})/search` },
          { label: t("nav.stores"), href: `/(${currentRole})/stores` },
          { label: t("nav.categories"), href: `/(${currentRole})/categories` },
          { label: t("nav.orders"), href: `/(${currentRole})/orders` }
        );
        break;
      case "vendor":
        roleSpecificItems.push(
          { label: t("nav.products"), href: "/(vendor)/products" },
          { label: t("nav.orders"), href: "/(vendor)/orders" },
        );
        break;
      case "delivery":
        roleSpecificItems.push(
          { label: t("nav.orders"), href: "/(delivery)/orders" },
        );
        break;
      case "winga":
        roleSpecificItems.push(
          { label: t("nav.search"), href: "/(winga)/search" },
          { label: t("nav.partnerships"), href: "/(winga)/links" }
        );
        break;
    }

    return [...baseItems, ...roleSpecificItems];
  };

  const navigationItems = getNavigationItems();

  return (
    <View className="hidden lg:flex flex-col bg-white border-b border-gray-200 shadow-sm">
      <View className="w-full px-12 sm:px-16 lg:px-[80px] py-2 space-y-2">
        {/* Top Bar */}
        <View className="flex-row items-center justify-between h-16">
          {/* Logo */}
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="flex-shrink-0"
          >
            <DynamicLogo width={140} height={40} />
          </TouchableOpacity>

          {/* Search */}
          {showSearchBar && (
            <View className="flex-1 max-w-2xl mx-8">
              <SearchBar
                interactive={true}
                placeholder={t("home.search_placeholder")}
              />
            </View>
          )}

          {/* Right-side Actions */}
          <View className="flex-row items-center space-x-4">
            {/* Notifications */}
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Bell size={24} className="text-gray-600" />
            </TouchableOpacity>

            {/* Cart */}
            {showCartIcon && <CartDrawer />}

            {/* User */}
            {user ? (
              <View className="flex-row items-center space-x-2">
                <TouchableOpacity
                  onPress={() => router.push(`/account`)}
                  className="flex-row items-center space-x-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <User size={24} className="text-gray-600" />
                  <Text className="text-sm font-medium">
                    {user.name || user.email}
                  </Text>
                </TouchableOpacity>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={logout}
                  className="text-sm px-3"
                >
                  <Text>{t("auth.logout")}</Text>
                </Button>
              </View>
            ) : (
              <View className="flex-row items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 text-gray-500"
                  onPress={() => router.push("/login")}
                >
                  <Text>{t("auth.login")}</Text>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-4 text-gray-500"
                  onPress={() => router.push("/register")}
                >
                  <Text>{t("auth.register")}</Text>
                </Button>
              </View>
            )}
            <LanguageSelector />
            <NavigationDrawer />
          </View>
        </View>

        {/* Secondary Nav */}
        {showSecondaryNav && <SecondaryNav items={navigationItems} />}
      </View>
    </View>
  );
}