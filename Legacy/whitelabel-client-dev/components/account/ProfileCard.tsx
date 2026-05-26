import React from "react";
import { View, TouchableOpacity } from "react-native";
import { User, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

export function ProfileCard() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();
  const currentProfile = user?.profiles.find(
    (profile) => profile.role === user.activeProfileRole
  );

  const handlePress = () => {
    router.push("/account/details" as any);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card className="p-6 bg-background">
        <View className="flex-row items-center justify-between pr-2">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center">
              <User size={28} className="text-primary" color={resolvedColors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground mb-1">
                {currentProfile?.displayName || user?.name}
              </Text>
              <Text className="text-base text-muted-foreground mb-2">
                {user?.email}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {t("account.tap_to_edit_profile")}
              </Text>
            </View>
          </View>
          <ChevronRight size={24} className="text-muted-foreground" color={resolvedColors.mutedForeground} />
        </View>
      </Card>
    </TouchableOpacity>
  );
} 