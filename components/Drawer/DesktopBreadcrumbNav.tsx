// components/DesktopBreadcrumbNav.tsx
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";

export function DesktopBreadcrumbNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  if (Platform.OS !== "web") {
    return null;
  }

  const currentRole = user?.activeProfileRole || "buyer";

  const getBreadcrumbItems = () => {
    const items = [];
    const pathSegments = pathname.split("/").filter(Boolean);

    items.push({
      label: "Home",
      href: `/(${currentRole})`,
      isActive: false,
    });

    if (pathSegments.length > 1) {
      const section = pathSegments[1];
      const sectionMap: Record<string, string> = {
        account: "Account",
        orders: "Orders",
        products: "Products",
        cart: "Cart",
        search: "Search",
        stores: "Stores",
        links: "Partnerships",
        earnings: "Earnings",
      };

      const sectionLabel = sectionMap[section] || section;
      items.push({
        label: sectionLabel,
        href: `/(${currentRole})/${section}`,
        isActive: pathSegments.length === 2,
      });

      if (pathSegments.length > 2) {
        const sub = pathSegments[2];
        items.push({
          label: sub.charAt(0).toUpperCase() + sub.slice(1),
          href: pathname,
          isActive: true,
        });
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <View className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Text className="mx-1">/</Text>}
          {item.isActive ? (
            <Text className="font-medium text-foreground">{item.label}</Text>
          ) : (
            <TouchableOpacity onPress={() => router.push(item.href as any)}>
              <Text className="hover:text-foreground transition-colors cursor-pointer">
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}
