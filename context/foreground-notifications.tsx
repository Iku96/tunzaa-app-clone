import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "expo-router";
import {
  ForegroundNotificationBanner,
  ForegroundNotificationData,
} from "@/components/notifications/ForegroundNotificationBanner";
import pushNotificationsService, { NotificationData } from "@/src/services/push-notifications";

interface ForegroundNotificationContextValue {
  showNotification: (notification: ForegroundNotificationData & { data?: any }) => void;
  hideNotification: () => void;
}

const ForegroundNotificationContext = createContext<
  ForegroundNotificationContextValue | undefined
>(undefined);

interface ForegroundNotificationProviderProps {
  children: ReactNode;
}

export const ForegroundNotificationProvider: React.FC<
  ForegroundNotificationProviderProps
> = ({ children }) => {
  const [currentNotification, setCurrentNotification] = useState<
    (ForegroundNotificationData & { data?: any }) | null
  >(null);
  const [notificationQueue, setNotificationQueue] = useState<
    (ForegroundNotificationData & { data?: any })[]
  >([]);
  const router = useRouter();

  const showNotification = useCallback(
    (notification: ForegroundNotificationData & { data?: any }) => {
      console.log("📬 [Foreground Notification] Showing notification:", notification.title);
      
      if (currentNotification) {
        // Queue the notification if one is already showing
        console.log("📋 [Foreground Notification] Queueing notification");
        setNotificationQueue((prev) => [...prev, notification]);
      } else {
        setCurrentNotification(notification);
      }
    },
    [currentNotification]
  );

  // Register foreground notification handler with push notifications service
  useEffect(() => {
    console.log("🔔 [Foreground Notification] Registering handler with push service");
    
    const handleForegroundNotification = (notification: NotificationData) => {
      console.log("📬 [Foreground Notification] Received notification from push service:", notification.title);
      
      showNotification({
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
        data: notification,
      });
    };

    pushNotificationsService.setForegroundNotificationHandler(handleForegroundNotification);

    // Cleanup on unmount
    return () => {
      console.log("🗑️ [Foreground Notification] Removing handler from push service");
      pushNotificationsService.removeForegroundNotificationHandler();
    };
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    console.log("👋 [Foreground Notification] Hiding notification");
    setCurrentNotification(null);

    // Show next notification in queue if any
    setNotificationQueue((prev) => {
      if (prev.length > 0) {
        const [next, ...rest] = prev;
        console.log("📬 [Foreground Notification] Showing next queued notification");
        setTimeout(() => {
          setCurrentNotification(next);
        }, 300); // Small delay between notifications
        return rest;
      }
      return prev;
    });
  }, []);

  const handleNotificationPress = useCallback(() => {
    if (!currentNotification?.data) {
      console.log("ℹ️ [Foreground Notification] No navigation data available");
      return;
    }

    const data = currentNotification.data;
    console.log("🔗 [Foreground Notification] Navigating based on notification data:", data);

    try {
      // Handle deep link first if provided
      if (data.deepLink || data.deep_link) {
        const deepLink = data.deepLink || data.deep_link;
        console.log("🔗 [Foreground Notification] Using deep link:", deepLink);
        router.push(deepLink as any);
        return;
      }

      // Navigate based on notification type
      const type = data.type || "general";
      console.log("🔗 [Foreground Notification] Navigation type:", type);

      switch (type) {
        case "order":
          if (data.orderId || data.order_id) {
            router.push(`/(buyer)/orders/${data.orderId || data.order_id}` as any);
          } else {
            router.push("/(buyer)/orders" as any);
          }
          break;

        case "delivery":
          if (data.orderId || data.order_id) {
            router.push(`/(delivery)/orders/${data.orderId || data.order_id}` as any);
          } else {
            router.push("/(delivery)/orders" as any);
          }
          break;

        case "vendor":
          if (data.orderId || data.order_id) {
            router.push(`/(vendor)/orders/${data.orderId || data.order_id}` as any);
          } else if (data.productId || data.product_id) {
            router.push(`/(vendor)/products/${data.productId || data.product_id}` as any);
          } else {
            router.push("/(vendor)" as any);
          }
          break;

        case "affiliate":
          router.push("/(winga)" as any);
          break;

        case "general":
        default:
          router.push("/(buyer)/notifications" as any);
          break;
      }
    } catch (error) {
      console.error("❌ [Foreground Notification] Navigation error:", error);
      // Fallback to notifications page
      router.push("/(buyer)/notifications" as any);
    }
  }, [currentNotification, router]);

  return (
    <ForegroundNotificationContext.Provider
      value={{ showNotification, hideNotification }}
    >
      {children}
      {currentNotification && (
        <ForegroundNotificationBanner
          notification={currentNotification}
          onPress={handleNotificationPress}
          onDismiss={hideNotification}
          duration={5000} // 5 seconds auto-dismiss
        />
      )}
    </ForegroundNotificationContext.Provider>
  );
};

export const useForegroundNotifications = (): ForegroundNotificationContextValue => {
  const context = useContext(ForegroundNotificationContext);
  if (!context) {
    throw new Error(
      "useForegroundNotifications must be used within ForegroundNotificationProvider"
    );
  }
  return context;
};

