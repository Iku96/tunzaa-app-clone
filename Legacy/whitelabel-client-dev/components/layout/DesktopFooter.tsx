import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { DynamicLogo } from "@/components/ui/DynamicLogo";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/hooks/useI18n";

export function DesktopFooter() {
  const router = useRouter();
  const { t } = useI18n();

  // Only show on web and desktop
  if (Platform.OS !== "web") {
    return null;
  }

  const footerSections = [
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.home"), href: "/" },
        { label: t("footer.stores"), href: "/stores" },
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { label: t("footer.help_center"), href: "/account" },
        { label: t("footer.contact_us"), href: "/account" },
      ],
    },
    {
      title: t("footer.shop"),
      links: [
        { label: t("footer.all_categories"), href: "/categories" },
        { label: t("footer.search"), href: "/search" },
      ],
    },
    {
      title: t("footer.account"),
      links: [
        { label: t("footer.my_account"), href: "/account" },
        { label: t("footer.order_history"), href: "/orders" },
        { label: t("footer.wishlist"), href: "/account" },
      ],
    },
  ];

  return (
    <View className="hidden lg:block bg-white border-t border-gray-200">
      <View className=" px-4 sm:px-6 py-12">
        <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <View className="lg:col-span-1">
            <DynamicLogo width={140} height={40} />
            <Text className="mt-4 text-sm text-gray-600 leading-6">
              {t("footer.description")}
            </Text>
          </View>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <View key={index} className="space-y-4">
              <Text className="text-sm font-semibold text-gray-900">
                {section.title}
              </Text>
              <View className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <TouchableOpacity
                    key={linkIndex}
                    onPress={() => router.push(link.href as any)}
                    className="block"
                  >
                    <Text className="text-sm text-gray-600 hover:text-gray-900">
                      {link.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Section */}
        <View className="mt-12 pt-8 border-t border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500">
              © 2025 Marketplace. {t("footer.all_rights_reserved")}
            </Text>
            <View className="flex-row space-x-6">
              <TouchableOpacity onPress={() => router.push("/privacy-policy" as any)}>
                <Text className="text-sm text-gray-500 hover:text-gray-900">
                  {t("footer.privacy_policy")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/terms-of-service" as any)}>
                <Text className="text-sm text-gray-500 hover:text-gray-900">
                  {t("footer.terms_of_service")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
