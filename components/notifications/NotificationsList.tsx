import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Settings, Bell, RefreshCw } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import {
  useGetNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/src/services/notifications";
import { format } from "date-fns";
import type { Notification } from "@/src/services/types/notifications";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollView } from "@/components/ui/scroll-view";

import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { usePageTitle } from "@/hooks/usePageTitle";

interface NotificationsListProps {
  title?: string;
}

// Helper function to strip HTML tags and decode entities
const stripHtmlAndDecode = (html: string): string => {
  if (!html) return "";

  // Strip HTML tags
  let text = html.replace(/<[^>]*>/g, "");

  // Decode common HTML entities
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&cent;": "¢",
    "&pound;": "£",
    "&yen;": "¥",
    "&euro;": "€",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&#x2F;": "/",
    "&#47;": "/",
  };

  // Replace entities
  for (const [entity, char] of Object.entries(entities)) {
    text = text.split(entity).join(char);
  }

  // Handle numeric entities (e.g., &#8217;)
  text = text.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });

  // Handle hex entities (e.g., &#x2019;)
  text = text.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Clean up extra whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
};

// Helper function to check if string contains HTML
const containsHtml = (str: string): boolean => {
  const htmlRegex = /<[^>]*>/;
  return htmlRegex.test(str);
};

const NotificationsList: React.FC<NotificationsListProps> = ({
  title = "Notifications",
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedColors = useResolvedThemeColors();
  const [refreshing, setRefreshing] = useState(false);

  // API hooks
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useGetNotifications(
    {
      user_id: user?.user_id,
      limit: 50,
    },
    !!user?.user_id
  );

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = notificationsData?.notifications || [];

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.status !== "read") {
      markAsReadMutation.mutate(notification.id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
    // Navigate to notification detail or related page if needed
    // router.push(`/notification/${notification.id}`);
  };

  const handleMarkAllAsRead = () => {
    if (user?.user_id) {
      markAllAsReadMutation.mutate(user.user_id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  usePageTitle("Notifications");

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={resolvedColors?.foreground || "#000000"} />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-foreground">
            {title}
          </Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-base text-muted-foreground mt-3">
            Loading notifications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={resolvedColors?.foreground || "#000000"} />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-foreground">
            {title}
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <RefreshCw size={24} color={resolvedColors?.foreground || "#000000"} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Bell size={48} color="#666666" />
          <Text className="text-lg font-semibold text-foreground mt-4 mb-2">
            Failed to load notifications
          </Text>
          <Text className="text-base text-muted-foreground text-center mb-6">
            Please try again
          </Text>
          <Button onPress={() => refetch()}>
            <Text>Retry</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={resolvedColors?.foreground || "#000000"} />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold text-foreground">{title}</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          {/* <Settings size={24} color={resolvedColors?.foreground || "#000000"} /> */}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[resolvedColors?.primary || "#3B82F6"]}
            tintColor={resolvedColors?.primary || "#3B82F6"}
          />
        }
      >
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center p-6 mt-24">
            <Bell size={64} color="#666666" />
            <Text className="text-lg font-semibold text-foreground mt-4 mb-2">
              No notifications yet
            </Text>
            <Text className="text-base text-muted-foreground text-center">
              You'll see notifications about orders, promotions, and updates
              here
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-xl font-semibold text-foreground px-4 py-3">
              Recent
            </Text>

            {notifications.map((notification) => (
              <Pressable
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className="active:opacity-70"
              >
                <Card className="mx-4 mb-1 relative">
                  <CardContent className="flex-row p-4">
                    <View className="w-12 h-12 rounded-full mr-3 bg-blue-50 items-center justify-center">
                      <Bell size={24} color="#3B82F6" />
                    </View>
                    <View className="flex-1 pr-6">
                      <View className="flex-row items-center mb-1 gap-1">
                        <Text className="text-base font-semibold text-foreground flex-1">
                          {notification.title || notification.subject}
                        </Text>
                        <Text className="text-base text-muted-foreground">
                          •{" "}
                          {format(
                            new Date(notification.created_at),
                            "MMM d, yyyy"
                          )}
                        </Text>
                      </View>
                      <Text className="text-base text-foreground leading-6 mb-1">
                        {containsHtml(notification.body)
                          ? stripHtmlAndDecode(notification.body)
                          : notification.body
                        }
                      </Text>
                      {/* <View className="flex-row gap-2">
                        <Badge variant="outline">
                          <Text className="text-xs">
                            {notification.type.toUpperCase()}
                          </Text>
                        </Badge>
                        <Badge
                          variant={
                            notification.status === "read"
                              ? "secondary"
                              : "success"
                          }
                        >
                          <Text className="text-xs">
                            {notification.status.toUpperCase()}
                          </Text>
                        </Badge>
                      </View> */}
                    </View>
                    {notification.status !== "read" && (
                      <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </CardContent>
                </Card>
              </Pressable>
            ))}

            <View className="p-6 items-center">
              <Text className="text-base text-foreground mb-2">
                Missing notifications?
              </Text>
              <Pressable onPress={() => refetch()}>
                <Text className="text-base text-blue-500 underline">
                  Refresh to check for new notifications
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsList;