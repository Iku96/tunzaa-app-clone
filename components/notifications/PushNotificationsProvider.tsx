import React, { useEffect, ReactNode } from "react";
import { Platform, Alert } from "react-native";
import usePushNotifications from "@/hooks/usePushNotifications";
import { useAuth } from "@/context/auth";

interface PushNotificationsProviderProps {
  children: ReactNode;
}

export const PushNotificationsProvider: React.FC<
  PushNotificationsProviderProps
> = ({ children }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const {
    hasPermission,
    canRequestPermission,
    blocked,
    loading,
    isSupported,
    currentToken,
    initialize,
  } = usePushNotifications();

  // Initialize push notifications when user is logged in
  useEffect(() => {
    console.log("🔔 [Push Provider] Initializing push notification provider...");
    console.log("👤 [Push Provider] Authentication status:", isAuthenticated ? "Authenticated" : "Not authenticated");
    console.log("📱 [Push Provider] Platform supported:", isSupported);
    console.log("⏳ [Push Provider] Loading:", loading);
    console.log("✅ [Push Provider] Has permission:", hasPermission);

    if (!isAuthenticated) {
      console.log("❌ [Push Provider] User not authenticated - skipping notification setup");
      return;
    }

    if (!isSupported) {
      console.log("❌ [Push Provider] Push notifications not supported on this platform");
      return;
    }

    if (loading) {
      console.log("⏳ [Push Provider] Push notifications still loading - waiting...");
      return;
    }

    // Check if we should request permissions
    if (!hasPermission && canRequestPermission && !blocked) {
      // console.log("✅ Showing notification permission dialog");
      // Show a friendly dialog to explain why we need notifications
      showNotificationPermissionDialog();
    } else if (blocked) {
      // console.log(
      //   "🚫 Permissions are blocked - user needs to enable in settings"
      // );
      // Optionally show a one-time message about enabling in settings
      // Uncomment the line below if you want to show this message
      // showBlockedPermissionsMessage();
    } else {
      // console.log("ℹ️ Not showing permission dialog:", {
      //   hasPermission,
      //   canRequestPermission,
      //   blocked,
      //   reason: hasPermission
      //     ? "Already has permission"
      //     : "Cannot request permission",
      // });
    }
  }, [
    isAuthenticated,
    hasPermission,
    canRequestPermission,
    blocked,
    isSupported,
    loading,
  ]);

  // Trigger token registration explicitly when the user logs in
  useEffect(() => {
    if (isAuthenticated && hasPermission && isSupported && !loading) {
      console.log("🔄 [Push Provider] User is authenticated and has permission - ensuring token is registered...");
      // initialize() gets the token and attempts to register it. Since we cleared the local cache 
      // when it previously failed while unauthenticated, it will successfully register now.
      initialize();
    }
  }, [isAuthenticated, hasPermission, isSupported, loading, initialize]);

  // Log token changes for debugging
  useEffect(() => {
    if (currentToken) {
      console.log("🔔 [Push Provider] ========================================");
      console.log("🔔 [Push Provider] Push notification token available");
      console.log("🔔 [Push Provider] ========================================");
      console.log("🔑 [Push Provider] Token:", currentToken);
      console.log("👤 [Push Provider] User authenticated:", isAuthenticated);
      console.log("🔔 [Push Provider] ========================================");
    } else if (isAuthenticated && isSupported && !loading) {
      console.log("⚠️ [Push Provider] User authenticated but no token yet");
    }
  }, [currentToken, isAuthenticated, isSupported, loading]);

  const showNotificationPermissionDialog = () => {
    if (Platform.OS === "web") {
      return;
    }

    Alert.alert(
      "Enable Notifications",
      "Stay updated with your orders, deliveries, and important updates. We'll only send you relevant notifications.",
      [
        {
          text: "Not Now",
          style: "cancel",
        },
        {
          text: "Enable",
          onPress: async () => {
            try {
              const status = await requestPermissions();

              if (status.blocked) {
                showBlockedPermissionsMessage();
              } else if (!status.hasPermission) {
                //console.log("User denied notification permissions");
              }
            } catch (error) {
              // console.error(
              //   "Error requesting notification permissions:",
              //   error
              // );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const showBlockedPermissionsMessage = () => {
    const isIOS = Platform.OS === "ios";
    const settingsPath = isIOS
      ? "Settings > [App Name] > Notifications"
      : "Settings > Apps > [App Name] > Notifications";

    Alert.alert(
      "Notifications Blocked",
      `Notifications are currently blocked for this app. To enable notifications:\n\n1. Open ${settingsPath}\n2. Turn on "Allow Notifications"\n3. Return to the app`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            import("react-native").then(({ Linking }) => {
              Linking.openSettings();
            });
          },
        },
      ]
    );
  };

  return <>{children}</>;
};

export default PushNotificationsProvider;
