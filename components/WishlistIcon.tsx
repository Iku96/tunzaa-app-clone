import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Heart } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { useGetWishlistCount } from "@/src/services/wishlist";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface WishlistIconProps {
  size?: number;
  showCount?: boolean;
  className?: string;
  onPress?: () => void;
}

export const WishlistIcon: React.FC<WishlistIconProps> = ({
  size = 24,
  showCount = true,
  className = "",
  onPress,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { data: wishlistCount } = useGetWishlistCount();
  const resolvedThemeColors = useResolvedThemeColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (user?.user_id) {
      router.push("/account/wishlist" as any);
    } else {
      router.push("/(auth)/login");
    }
  };

  const count = wishlistCount?.count || 0;

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`relative ${className}`}
      disabled={!user?.user_id}
    >
      <Heart
        size={size}
        color={user?.user_id ? resolvedThemeColors.primary : resolvedThemeColors.muted}
        fill={user?.user_id ? resolvedThemeColors.primary : "transparent"}
      />
      {showCount && count > 0 && (
        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] justify-center items-center">
          <Text className="text-xs font-bold text-white">
            {count > 99 ? "99+" : count.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}; 