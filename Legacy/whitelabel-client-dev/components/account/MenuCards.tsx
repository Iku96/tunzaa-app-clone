import React from "react";
import { View, TouchableOpacity } from "react-native";
import {
  ChevronRight,
  Heart,
  MapPin,
  Settings,
  HelpCircle,
  Gift,
  Users,
  MessageCircle
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";
import { useTenantModules } from "@/hooks/useTenantModules";

interface MenuCardsProps {
  showDeliveryAddresses?: boolean;
  showAffiliateRequests?: boolean;
  showWishlist?: boolean;
  showRewards?: boolean;
  showInbox?: boolean;
  showSettings?: boolean;
}

export function MenuCards({
  showDeliveryAddresses = true,
  showAffiliateRequests = false,
  showWishlist = false,
  showRewards = false,
  showInbox = false,
  showSettings = false
}: MenuCardsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();
  const { isDeliveryEnabled, isRewardsEnabled, isAffiliatesEnabled } = useTenantModules();

  const handleCardPress = (href: string) => {
    router.push(href as any);
  };

  // Only show items if both the prop AND the module are enabled
  const shouldShowDeliveryAddresses = showDeliveryAddresses && isDeliveryEnabled;
  const shouldShowRewards = showRewards && isRewardsEnabled;
  const shouldShowAffiliateRequests = showAffiliateRequests && isAffiliatesEnabled;

  return (
    <Card className="p-0 bg-background overflow-hidden">
      {/* Rewards Card */}
      {shouldShowRewards && (
        <TouchableOpacity onPress={() => handleCardPress("/account/rewards")}>
          <View className="p-4">
            <View className="flex-row items-center justify-between pr-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                  <Gift size={20} className="text-blue-500" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {t("account.rewards_referrals")}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {t("account.see_points_earned")}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} className="text-muted-foreground mr-2" color={resolvedColors.mutedForeground} />
            </View>
          </View>
        </TouchableOpacity>
      )}

      <Separator />

      {/* Inbox Card */}
      {showInbox && (
        <TouchableOpacity onPress={() => handleCardPress("/account/inbox")}>
          <View className="p-4">
            <View className="flex-row items-center justify-between pr-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                  <MessageCircle size={20} className="text-blue-500" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {t("account.messages")}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {t("account.chat_with_vendors")}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} className="text-muted-foreground mr-2" color={resolvedColors.mutedForeground} />
            </View>
          </View>
        </TouchableOpacity>
      )}

      <Separator />

      {/* Wishlist Card */}
      {showWishlist && (
        <TouchableOpacity onPress={() => handleCardPress("/account/wishlist")}>
          <View className="p-4">
            <View className="flex-row items-center justify-between pr-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center">
                  <Heart size={20} className="text-red-500" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {t("account.your_wishlist")}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {t("account.items_liked")}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {shouldShowDeliveryAddresses && (
        <>
          <Separator />
          {/* Delivery Addresses Card */}
          <TouchableOpacity onPress={() => handleCardPress("/account/addresses")}>
            <View className="p-4">
              <View className="flex-row items-center justify-between pr-2">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                    <MapPin size={20} className="text-blue-500" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {t("account.delivery_addresses")}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {t("account.manage_your_addresses")}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}

      {shouldShowAffiliateRequests && (
        <>
          <Separator />
          {/* Affiliate Requests Card */}
          <TouchableOpacity onPress={() => handleCardPress("/account/affiliate-requests")}>
            <View className="p-4">
              <View className="flex-row items-center justify-between pr-2">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                    <Users size={20} className="text-purple-500" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {t("account.affiliate_requests")}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {t("account.review_approve_partner_applications")}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}

      <Separator />

      {/* Help & Support Card */}
      <TouchableOpacity onPress={() => handleCardPress("/account/support")}>
        <View className="p-4">
          <View className="flex-row items-center justify-between pr-2">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
                <HelpCircle size={20} className="text-green-500" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {t("account.help_support")}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {t("account.get_help_when_needed")}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
          </View>
        </View>
      </TouchableOpacity>

      <Separator />

      {/* Settings Card */}
      {showSettings && (
        <View className="p-4 opacity-50">
          <View className="flex-row items-center justify-between pr-2">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                <Settings size={20} className="text-gray-500" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-muted-foreground">
                  {t("account.settings")}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {t("account.coming_soon")}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
          </View>
        </View>
      )}
    </Card>
  );
} 