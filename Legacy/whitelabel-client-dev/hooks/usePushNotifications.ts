import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import pushNotificationsService, {
  PushNotificationPermissionStatus,
} from "@/services/push-notifications";

export interface UsePushNotificationsReturn {
  // Permission status
  hasPermission: boolean;
  canRequestPermission: boolean;
  blocked: boolean;
  loading: boolean;

  // Actions
  requestPermissions: () => Promise<PushNotificationPermissionStatus>;
  initialize: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  refreshToken: () => Promise<string | null>;

  // Token info
  currentToken: string | null;
  isSupported: boolean;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [permissionStatus, setPermissionStatus] =
    useState<PushNotificationPermissionStatus>({
      hasPermission: false,
      canRequestPermission: false,
      blocked: false,
    });
  const [loading, setLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Check if push notifications are supported on this platform
  const isSupported = pushNotificationsService.isSupported();

  /**
   * Initialize permissions and service
   */
  const checkPermissions = useCallback(async () => {
    console.log("🔍 [Push Hook] Checking push notification permissions at startup...");

    if (!isSupported) {
      console.log("📱 [Push Hook] Platform not supported for push notifications");
      setLoading(false);
      return;
    }

    try {
      const status = await pushNotificationsService.getPermissionStatus();
      console.log("📋 [Push Hook] Permission status:", status);
      setPermissionStatus(status);

      if (status.hasPermission) {
        const token = pushNotificationsService.getCurrentToken();
        if (token) {
          console.log("🔑 [Push Hook] Existing token found and set in state");
          console.log("🔑 [Push Hook] Token:", token);
        } else {
          console.log("⚠️ [Push Hook] Permission granted but no token available yet");
        }
        setCurrentToken(token);
      } else {
        console.log("🔔 [Push Hook] No permission granted yet");
      }
    } catch (error) {
      console.error("❌ [Push Hook] Error checking permissions:", error);
    } finally {
      setLoading(false);
      console.log("✅ [Push Hook] Permission check completed");
    }
  }, [isSupported]);

  /**
   * Request notification permissions
   */
  const requestPermissions =
    useCallback(async (): Promise<PushNotificationPermissionStatus> => {
      if (!isSupported) {
        return {
          hasPermission: false,
          canRequestPermission: false,
          blocked: false,
        };
      }

      setLoading(true);
      try {
        const status = await pushNotificationsService.requestPermissions();
        setPermissionStatus(status);

        if (status.hasPermission) {
          // Initialize the service and get token
          await pushNotificationsService.initialize();
          const token = await pushNotificationsService.getAndRegisterToken();
          setCurrentToken(token);
        }

        return status;
      } catch (error) {
        console.error("Error requesting permissions:", error);
        return {
          hasPermission: false,
          canRequestPermission: false,
          blocked: true,
        };
      } finally {
        setLoading(false);
      }
    }, [isSupported]);

  /**
   * Initialize push notifications service
   */
  const initialize = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      console.log("📱 [Push Hook] Platform not supported - skipping initialization");
      return;
    }

    if (!permissionStatus.hasPermission) {
      console.log("🔔 [Push Hook] No permission granted - skipping initialization");
      return;
    }

    try {
      console.log("🚀 [Push Hook] Initializing push notifications from hook...");
      await pushNotificationsService.initialize();
      const token = await pushNotificationsService.getAndRegisterToken();
      
      if (token) {
        console.log("✅ [Push Hook] Token set in hook state");
        setCurrentToken(token);
      } else {
        console.warn("⚠️ [Push Hook] No token returned from service");
      }
    } catch (error) {
      console.error("❌ [Push Hook] Error initializing push notifications:", error);
    }
  }, [isSupported, permissionStatus.hasPermission]);

  /**
   * Refresh FCM token
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!isSupported || !permissionStatus.hasPermission) {
      return null;
    }

    try {
      const token = await pushNotificationsService.getAndRegisterToken();
      setCurrentToken(token);
      return token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }, [isSupported, permissionStatus.hasPermission]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      return;
    }

    try {
      await pushNotificationsService.unsubscribe();
      setCurrentToken(null);
      setPermissionStatus({
        hasPermission: false,
        canRequestPermission: true,
        blocked: false,
      });
    } catch (error) {
      console.error("Error unsubscribing:", error);
    }
  }, [isSupported]);

  // Check initial permissions on mount
  useEffect(() => {
    console.log("🎬 [Push Hook] Component mounted - checking permissions");
    checkPermissions();
  }, [checkPermissions]);

  // Auto-initialize if user has already granted permissions
  useEffect(() => {
    if (permissionStatus.hasPermission && !currentToken) {
      console.log("🔄 [Push Hook] Auto-initializing (permission granted, no token yet)");
      initialize();
    }
  }, [permissionStatus.hasPermission, currentToken, initialize]);

  return {
    // Permission status
    hasPermission: permissionStatus.hasPermission,
    canRequestPermission: permissionStatus.canRequestPermission,
    blocked: permissionStatus.blocked,
    loading,

    // Actions
    requestPermissions,
    initialize,
    unsubscribe,
    refreshToken,

    // Token info
    currentToken,
    isSupported,
  };
};

export default usePushNotifications;
