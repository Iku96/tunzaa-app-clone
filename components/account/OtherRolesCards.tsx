import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Plus, Store, Truck, Users } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

interface RoleOption {
  type: 'vendor' | 'delivery' | 'winga';
  labelKey: string;
  descriptionKey: string;
  icon: any;
  route: string;
}

const allRoleOptions: RoleOption[] = [
  {
    type: 'vendor',
    labelKey: 'roles.vendor',
    descriptionKey: 'roles.vendor_description',
    icon: Store,
    route: '/complete-profile?role=vendor'
  },
  {
    type: 'delivery',
    labelKey: 'roles.delivery_partner',
    descriptionKey: 'roles.delivery_partner_description',
    icon: Truck,
    route: '/complete-profile?role=delivery'
  },
  {
    type: 'winga',
    labelKey: 'roles.affiliate',
    descriptionKey: 'roles.affiliate_description',
    icon: Users,
    route: '/complete-profile?role=winga'
  }
];

export function OtherRolesCards() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const colors = useResolvedThemeColors();

  if (!user?.profiles) return null;

  const existingRoles = user.profiles.map(p => p.role);
  const availableRoles = allRoleOptions.filter(role => !existingRoles.includes(role.type));

  // Don't show if no roles are available
  if (availableRoles.length === 0) {
    return null;
  }

  const handleCreateProfile = (roleType: string) => {
    const selectedRole = availableRoles.find(role => role.type === roleType);
    if (selectedRole) {
      router.push(selectedRole.route as any);
    }
  };

  const getTitle = () => {
    if (user?.activeProfileRole === 'buyer') {
      return t("roles.expand_your_opportunities");
    } else if (user?.activeProfileRole === 'vendor') {
      return t("roles.expand_your_business");
    } else {
      return t("roles.expand_your_profiles");
    }
  };

  return (
    <View className="p-2">
      {/* <Text className="text-lg font-semibold text-foreground mb-4">
        {getTitle()}
      </Text>
      <Text className="text-sm text-muted-foreground mb-4">
        {t("roles.create_additional_profiles")}
      </Text>

      <View className="gap-4">
        {availableRoles.map((role) => (
          <TouchableOpacity
            key={role.type}
            onPress={() => handleCreateProfile(role.type)}
            className="rounded-xl border border-border overflow-hidden"
            style={{
              backgroundColor:
                colors?.primaryWithOpacity?.(0.05) ||
                "rgba(37, 99, 235, 0.05)",
            }}
          >
            <View className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor:
                        colors?.primaryWithOpacity?.(0.1) ||
                        "rgba(37, 99, 235, 0.1)",
                    }}
                  >
                    <role.icon size={20} className="text-primary" />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-foreground">
                      {t("roles.become_a")} {t(role.labelKey)}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {t(role.descriptionKey)}
                    </Text>
                  </View>
                </View>
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: colors?.primary || "#2563EB",
                  }}
                >
                  <Plus size={16} className="text-primary-foreground" />
                </View>
              </View>
              <View className="border-t border-border pt-3">
                <Text className="text-sm font-medium text-primary">
                  {t("roles.create_profile", { role: t(role.labelKey) })} →
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View> */}
    </View>
  );
}
