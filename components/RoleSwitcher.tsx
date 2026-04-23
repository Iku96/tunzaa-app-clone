import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ChevronDown, User, Store, Truck, Users } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import type { UserRole } from "@/context/auth";
import { ResponsiveModal } from "./responsive-modal";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
export default function RoleSwitcher() {
  const resolvedColors = useResolvedThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const { user, setRole, isLoading } = useAuth();
  const { t } = useI18n();

  // Don't show role switcher if user has only one profile
  if (!user?.profiles || user.profiles.length <= 1) {
    return null;
  }

  const getProfileDisplayInfo = (role: UserRole) => {
    switch (role) {
      case 'vendor':
        return {
          name: user?.vendorDetails?.business_name || user?.vendorDetails?.display_name || 'Vendor',
          subtitle: t('role_switcher.business_account'),
          icon: Store,
          color: 'text-primary'
        };
      case 'delivery':
        return {
          name: user?.deliveryDetails?.name || 'Delivery Partner',
          subtitle: t('role_switcher.delivery_account'),
          icon: Truck,
          color: 'text-green-600'
        };
      case 'winga':
        return {
          name: user?.affiliateDetails?.name || 'Affiliate',
          subtitle: t('role_switcher.affiliate_account'),
          icon: Users,
          color: 'text-purple-600'
        };
      case 'buyer':
      default:
        return {
          name: user?.name || 'Buyer',
          subtitle: t('role_switcher.shopping_account'),
          icon: User,
          color: 'text-gray-600'
        };
    }
  };

  const currentProfileInfo = getProfileDisplayInfo(user?.activeProfileRole || 'buyer');

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === user?.activeProfileRole) {
      setIsOpen(false);
      return;
    }

    await setRole(newRole);
    setIsOpen(false);
  };

  return (
    <View>
      <Button
        variant="outline"
        onPress={() => setIsOpen(true)}
        disabled={isLoading}
        className="flex-row items-center gap-2 px-3 py-2 bg-secondary rounded-full"
        accessibilityRole="button"
        accessibilityLabel={t("role_switcher.switch_user_role")}
        accessibilityHint={t("role_switcher.switch_profiles")}
      >
        <View className="flex-row items-center gap-2">
          <currentProfileInfo.icon size={16} className={currentProfileInfo.color} color={resolvedColors?.primary || "#000000"} />
          <View>
            <Text className="text-sm font-medium text-foreground">
              {currentProfileInfo.name}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {currentProfileInfo.subtitle}
            </Text>
          </View>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
        ) : (
          <ChevronDown size={16} className="text-foreground" />
        )}
      </Button>

      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={t("role_switcher.switch_role")}
        snapPoints={["40%"]}
      >
        <View className="gap-3">
          {user?.profiles?.map((profile) => {
            const profileInfo = getProfileDisplayInfo(profile.role);
            const isActive = profile.role === user?.activeProfileRole;

            return (
              <TouchableOpacity
                key={profile.role}
                onPress={() => handleRoleChange(profile.role)}
                disabled={isLoading}
                accessibilityRole="menuitem"
                accessibilityLabel={`Switch to ${profile.role} profile`}
                accessibilityState={{ selected: isActive }}
              >
                <Card className={`p-4 ${isActive ? 'bg-primary/5 border-primary' : 'bg-background'}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className={`w-12 h-12 rounded-full items-center justify-center ${isActive ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                        <profileInfo.icon
                          size={24}
                          className={isActive ? 'text-primary' : profileInfo.color}
                          color={isActive ? resolvedColors?.primary || "#000000" : resolvedColors?.foreground || "#000000"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className={`text-base font-semibold ${isActive ? 'text-primary' : 'text-foreground'
                          }`}>
                          {profileInfo.name}
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          {profileInfo.subtitle}
                        </Text>
                        {profile.role === 'vendor' && user?.vendorDetails?.stores?.[0] && (
                          <Text className="text-xs text-muted-foreground mt-1">
                            {t('role_switcher.store')}: {user.vendorDetails.stores[0].store_name}
                          </Text>
                        )}
                        {profile.role === 'delivery' && user?.deliveryDetails?.vehicle_info && (
                          <Text className="text-xs text-muted-foreground mt-1">
                            {t('role_switcher.vehicle')}: {user.deliveryDetails.vehicle_info.details}
                          </Text>
                        )}
                        {profile.role === 'winga' && user?.affiliateDetails?.status && (
                          <Text className="text-xs text-muted-foreground mt-1">
                            {t('role_switcher.status')}: {user.affiliateDetails.status}
                          </Text>
                        )}
                      </View>
                    </View>
                    {isActive && (
                      <View className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ResponsiveModal>
    </View>
  );
}
