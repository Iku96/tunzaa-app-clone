import React from "react";
import { View, TouchableOpacity, Platform, ViewStyle, TextStyle } from "react-native";
import { useRouter, usePathname } from "expo-router";
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
  Bell,
  Settings,
  BarChart3
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { useThemeColors } from "@/hooks/useThemeColors";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  roles?: string[];
}

interface DesktopNavigationProps {
  itemContainerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export function DesktopNavigation({
  itemContainerStyle,
  textStyle,
}: DesktopNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const colors = useThemeColors();

  if (Platform.OS !== "web") {
    return null;
  }

  const currentRole = user?.activeProfileRole || "buyer";

  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        label: "Home",
        href: `/(${currentRole})`,
        icon: Home,
        roles: ["buyer", "vendor", "delivery", "winga", "public"],
      },
    ];

    const roleSpecificItems: NavigationItem[] = [];

    switch (currentRole) {
      case "buyer":
        roleSpecificItems.push(
          {
            label: "Search",
            href: "/(buyer)/search",
            icon: Search,
            roles: ["buyer"],
          },
          {
            label: "Cart",
            href: "/(buyer)/cart",
            icon: ShoppingCart,
            roles: ["buyer"],
          },
          {
            label: "Orders",
            href: "/(buyer)/orders",
            icon: ShoppingBag,
            roles: ["buyer"],
          },
          {
            label: "Stores",
            href: "/(buyer)/stores",
            icon: Store,
            roles: ["buyer"],
          },
          {
            label: "Account",
            href: "/(buyer)/account",
            icon: User,
            roles: ["buyer"],
          }
        );
        break;

      case "vendor":
        roleSpecificItems.push(
          {
            label: "Products",
            href: "/(vendor)/products",
            icon: Package,
            roles: ["vendor"],
          },
          {
            label: "Orders",
            href: "/(vendor)/orders",
            icon: ShoppingBag,
            roles: ["vendor"],
          },
          {
            label: "Account",
            href: "/(vendor)/account",
            icon: User,
            roles: ["vendor"],
          }
        );
        break;

      case "delivery":
        roleSpecificItems.push(
          {
            label: "Orders",
            href: "/(delivery)/orders",
            icon: ShoppingBag,
            roles: ["delivery"],
          },
          {
            label: "Account",
            href: "/(delivery)/account",
            icon: User,
            roles: ["delivery"],
          }
        );
        break;

      case "winga":
        roleSpecificItems.push(
          {
            label: "Search",
            href: "/(winga)/search",
            icon: Search,
            roles: ["winga"],
          },
          {
            label: "Partnerships",
            href: "/(winga)/links",
            icon: LinkIcon,
            roles: ["winga"],
          },
          {
            label: "Cart",
            href: "/(winga)/cart",
            icon: ShoppingCart,
            roles: ["winga"],
          },
          {
            label: "Account",
            href: "/(winga)/account",
            icon: User,
            roles: ["winga"],
          }
        );
        break;

      default:
        roleSpecificItems.push(
          {
            label: "Search",
            href: "/(public)/search",
            icon: Search,
            roles: ["public"],
          },
          {
            label: "Account",
            href: "/(public)/account",
            icon: User,
            roles: ["public"],
          }
        );
        break;
    }

    return [...baseItems, ...roleSpecificItems];
  };

  const navigationItems = getNavigationItems();

  const isActive = (href: string) => {
    if (href.includes("/account")) {
      return pathname.includes("/account");
    }
    if (href.includes("/orders")) {
      return pathname.includes("/orders");
    }
    if (href.includes("/products")) {
      return pathname.includes("/products");
    }
    if (href.includes("/cart")) {
      return pathname.includes("/cart");
    }
    if (href.includes("/search")) {
      return pathname.includes("/search");
    }
    if (href.includes("/stores")) {
      return pathname.includes("/stores");
    }
    if (href.includes("/links")) {
      return pathname.includes("/links");
    }

    if (href === `/(${currentRole})` || href === `/(${currentRole})/`) {
      return pathname === `/(${currentRole})` || pathname === `/(${currentRole})/` || pathname === "/";
    }

    return pathname === href;
  };

  return (
    <View className="hidden lg:flex items-center space-x-1 bg-blue">
      {navigationItems.map((item, index) => {
        const active = isActive(item.href);
        const IconComponent = item.icon;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(item.href as any)}
            className={cn(
              "flex-row items-center space-x-2 rounded-lg transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            style={[
              {
                paddingHorizontal: 16,
                paddingVertical: 12,
                justifyContent: "flex-start",
                width: "100%",
              },
              itemContainerStyle,
            ]}
          >
            <IconComponent
              size={18}
              color={active ? colors.primary : undefined}
              className={cn(
                active ? "text-primary" : "text-muted-foreground"
              )}
            />
            <Text
              className={cn(
                "text-sm font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
              style={[{ textAlign: "left" }, textStyle]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
