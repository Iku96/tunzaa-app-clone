import { View, TouchableOpacity } from "react-native";
import { Bell } from "lucide-react-native";
import { useNotificationsStore } from "@/stores/notifications";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { Button } from "./ui/button";

export const NotificationIcon = () => {
  const router = useRouter();
  const colors = useResolvedThemeColors();
  const { getUnreadCount } = useNotificationsStore();
  const unreadCount = getUnreadCount();

  return (
    <Button
      variant="ghost"
      size="sm"
      // style={{
      //   backgroundColor: 'rgba(255, 255, 255, 0.15)',
      //   // padding: 12,
      //   // borderRadius: 12,
      //   // position: 'relative',
      // }}
      onPress={() => router.push("/notifications" as any)}
    >
      <Bell size={20} color={colors.foreground} />
      {unreadCount > 0 && (
        <View style={{
          position: 'absolute',
          top: 0,
          right: 5,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#FF6B6B',
          borderWidth: 2,
          borderColor: '#FFFFFF',
        }} />
      )}
    </Button>
  );
};
