import { Platform } from "react-native";
import { router } from "expo-router";
import { authApi } from "./auth";
import {
  requestAndroidNotificationPermission,
  checkAndroidNotificationPermission
} from "./android-notification-permissions";

// Platform-specific imports
let messaging: any = null;
let notifee: any = null;

// Only import Firebase messaging on native platforms
if (Platform.OS !== "web") {
  try {
    messaging = require("@react-native-firebase/messaging").default;
  } catch (error) {
    console.warn(
      "Firebase messaging not available. Make sure @react-native-firebase/messaging is installed and linked properly:",
      error
    );
  }
}

export interface NotificationData {
  type: "order" | "delivery" | "vendor" | "affiliate" | "general";
  id?: string;
  orderId?: string;
  storeId?: string;
  productId?: string;
  userId?: string;
  deepLink?: string;
  title: string;
  body: string;
  imageUrl?: string;
}

export interface PushNotificationPermissionStatus {
  hasPermission: boolean;
  canRequestPermission: boolean;
  blocked: boolean;
}

class PushNotificationsService {
  private static instance: PushNotificationsService;
  private isInitialized = false;
  private currentToken: string | null = null;
  private lastPermissionStatus: PushNotificationPermissionStatus | null = null;
  private foregroundNotificationHandler: ((notification: NotificationData) => void) | null = null;

  static getInstance(): PushNotificationsService {
    if (!PushNotificationsService.instance) {
      PushNotificationsService.instance = new PushNotificationsService();
    }
    return PushNotificationsService.instance;
  }

  /**
   * Set handler for foreground notifications
   */
  setForegroundNotificationHandler(handler: (notification: NotificationData) => void): void {
    this.foregroundNotificationHandler = handler;
    console.log("✅ [FCM Token] Foreground notification handler registered");
  }

  /**
   * Remove handler for foreground notifications
   */
  removeForegroundNotificationHandler(): void {
    this.foregroundNotificationHandler = null;
    console.log("🗑️ [FCM Token] Foreground notification handler removed");
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("✓ [FCM Token] Push notifications already initialized");
      return;
    }

    if (Platform.OS === "web") {
      console.log("🌐 [FCM Token] Web platform - skipping initialization");
      return;
    }

    if (!messaging) {
      console.warn("⚠️ [FCM Token] Firebase messaging not available");
      return;
    }

    try {
      console.log("🚀 [FCM Token] Initializing push notifications service...");

      // Check if device supports FCM
      const isSupported = await messaging().isDeviceRegisteredForRemoteMessages;
      if (!isSupported) {
        console.log("📱 [FCM Token] Registering device for remote messages...");
        await messaging().registerDeviceForRemoteMessages();
      } else {
        console.log("✓ [FCM Token] Device already registered for remote messages");
      }

      // Set up message handlers
      console.log("🔧 [FCM Token] Setting up message handlers...");
      this.setupMessageHandlers();

      // Get initial token
      console.log("🔑 [FCM Token] Getting initial token...");
      await this.getAndRegisterToken();

      this.isInitialized = true;
      console.log("✅ [FCM Token] Push notifications initialized successfully");
    } catch (error) {
      console.error("❌ [FCM Token] Failed to initialize push notifications:", error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<PushNotificationPermissionStatus> {
    if (Platform.OS === "web") {
      return {
        hasPermission: false,
        canRequestPermission: false,
        blocked: false,
      };
    }

    if (!messaging) {
      return {
        hasPermission: false,
        canRequestPermission: false,
        blocked: true,
      };
    }

    try {
      // 🤖 ANDROID 13+ (API 33+): Request POST_NOTIFICATIONS permission first
      if (Platform.OS === "android") {
        console.log("📱 [Push Notifications] Requesting Android notification permission...");
        const androidResult = await requestAndroidNotificationPermission();

        if (!androidResult.granted) {
          console.warn("⚠️ [Push Notifications] Android permission denied");
          return {
            hasPermission: false,
            canRequestPermission: !androidResult.neverAskAgain,
            blocked: androidResult.neverAskAgain || false,
          };
        }

        console.log("✅ [Push Notifications] Android permission granted");
      }

      // 🍎 iOS & Android: Request Firebase permissions
      console.log("🔔 [Push Notifications] Requesting Firebase permissions...");
      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      });

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log(`✅ [Push Notifications] Firebase permissions ${enabled ? 'granted' : 'denied'}`);

      return {
        hasPermission: enabled,
        canRequestPermission:
          authStatus !== messaging.AuthorizationStatus.DENIED,
        blocked: authStatus === messaging.AuthorizationStatus.DENIED,
      };
    } catch (error) {
      console.error("❌ [Push Notifications] Error requesting permissions:", error);
      return {
        hasPermission: false,
        canRequestPermission: false,
        blocked: true,
      };
    }
  }

  /**
   * Get current permission status
   */
  async getPermissionStatus(): Promise<PushNotificationPermissionStatus> {
    if (Platform.OS === "web") {
      return {
        hasPermission: false,
        canRequestPermission: false,
        blocked: false,
      };
    }

    if (!messaging) {
      return {
        hasPermission: false,
        canRequestPermission: false,
        blocked: true,
      };
    }

    try {
      // 🤖 ANDROID 13+: Check Android permission first
      if (Platform.OS === "android") {
        const hasAndroidPermission = await checkAndroidNotificationPermission();

        if (!hasAndroidPermission) {
          console.log("📱 [Push Notifications] Android permission not granted");
          return {
            hasPermission: false,
            canRequestPermission: true,
            blocked: false,
          };
        }
      }

      // Check Firebase permissions
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      const currentStatus = {
        hasPermission: enabled,
        canRequestPermission:
          authStatus !== messaging.AuthorizationStatus.DENIED,
        blocked: authStatus === messaging.AuthorizationStatus.DENIED,
      };

      // Check if permission status has changed
      await this.handlePermissionStatusChange(currentStatus);

      return currentStatus;
    } catch (error) {
      console.error("Error getting permission status:", error);
      return {
        hasPermission: false,
        canRequestPermission: false,
        blocked: true,
      };
    }
  }

  /**
   * Get FCM token and register with backend
   */
  async getAndRegisterToken(): Promise<string | null> {
    if (Platform.OS === "web" || !messaging) {
      console.log("🔔 [FCM Token] Web platform or messaging not available - skipping token retrieval");
      return null;
    }

    try {
      console.log("🔔 [FCM Token] Requesting token from Firebase...");
      const token = await messaging().getToken();

      if (!token) {
        console.warn("⚠️ [FCM Token] No token received from Firebase");
        return null;
      }

      console.log("✅ [FCM Token] Token received from Firebase");
      console.log("🔑 [FCM Token] Token:", token);

      if (token !== this.currentToken) {
        console.log("🔄 [FCM Token] New or updated token - registering with backend...");
        this.currentToken = token;
        await this.registerTokenWithBackend(token);
      } else {
        console.log("✓ [FCM Token] Token unchanged - no registration needed");
      }

      return token;
    } catch (error) {
      console.error("❌ [FCM Token] Error getting FCM token:", error);
      return null;
    }
  }

  /**
   * Register token with backend
   */
  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      const deviceType = Platform.OS as "ios" | "android";

      console.log("📤 [FCM Token] Registering token with backend...");
      console.log("📱 [FCM Token] Device type:", deviceType);

      await authApi.addFirebaseToken({
        token,
        device_type: deviceType,
      });

      console.log("✅ [FCM Token] Successfully registered with backend");
    } catch (error) {
      console.error("❌ [FCM Token] Failed to register token with backend:", error);
    }
  }

  /**
   * Handle permission status changes and notify backend
   */
  private async handlePermissionStatusChange(
    currentStatus: PushNotificationPermissionStatus
  ): Promise<void> {
    // Skip if this is the first check or no token available
    if (!this.lastPermissionStatus || !this.currentToken) {
      this.lastPermissionStatus = currentStatus;
      return;
    }

    // Check if permission status has actually changed
    const hasChanged =
      this.lastPermissionStatus.hasPermission !== currentStatus.hasPermission ||
      this.lastPermissionStatus.blocked !== currentStatus.blocked;

    if (hasChanged) {

      await this.updateTokenStatusInBackend(currentStatus);
      this.lastPermissionStatus = currentStatus;
    }
  }

  /**
   * Update token status in backend
   */
  private async updateTokenStatusInBackend(
    status: PushNotificationPermissionStatus
  ): Promise<void> {
    if (!this.currentToken) {
      return;
    }

    try {
      const deviceType = Platform.OS as "ios" | "android";

      let tokenStatus: "active" | "inactive" | "revoked";
      if (status.hasPermission) {
        tokenStatus = "active";
      } else if (status.blocked) {
        tokenStatus = "revoked";
      } else {
        tokenStatus = "inactive";
      }

      await authApi.updateFirebaseTokenStatus({
        token: this.currentToken,
        device_type: deviceType,
        status: tokenStatus,
        permission_granted: status.hasPermission,
      });

    } catch (error) {
      console.error("Failed to update token status in backend:", error);
    }
  }

  /**
   * Setup message handlers for foreground and background
   */
  private setupMessageHandlers(): void {
    if (!messaging) return;

    // Foreground message handler
    messaging().onMessage(async (remoteMessage: any) => {
      // console.log("Received foreground message:", remoteMessage);

      // Show local notification for foreground messages
      await this.showLocalNotification(remoteMessage);
    });

    // Background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      // console.log("Received background message:", remoteMessage);

      // Process notification data for navigation
      this.processNotificationForNavigation(remoteMessage.data);
    });

    // Notification opened handler (when app is in background/quit)
    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      // console.log("Notification opened app:", remoteMessage);

      // Navigate based on notification data
      this.handleNotificationNavigation(remoteMessage.data);
    });

    // Check if app was opened from notification (when app was quit)
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          // console.log("App opened from notification:", remoteMessage);

          // Navigate based on notification data
          this.handleNotificationNavigation(remoteMessage.data);
        }
      });

    // Token refresh handler
    messaging().onTokenRefresh(async (token: string) => {
      console.log("🔄 [FCM Token] Token refreshed by Firebase");
      console.log("🔑 [FCM Token] New refreshed token:", token);
      this.currentToken = token;
      await this.registerTokenWithBackend(token);
    });
  }

  /**
   * Show local notification for foreground messages
   */
  private async showLocalNotification(remoteMessage: any): Promise<void> {
    try {
      console.log("📬 [FCM Token] Processing foreground notification...");

      const { notification, data } = remoteMessage;

      // Check if we have either a notification object OR data object with title/body
      if (!notification && (!data || (!data.title && !data.body))) {
        console.warn("⚠️ [FCM Token] No notification content or data title/body in message");
        return;
      }

      // Process the notification data
      const notificationData: NotificationData = {
        type: (data?.type || "general") as any,
        id: data?.id,
        orderId: data?.orderId || data?.order_id,
        storeId: data?.storeId || data?.store_id,
        productId: data?.productId || data?.product_id,
        userId: data?.userId || data?.user_id,
        deepLink: data?.deepLink || data?.deep_link,
        // Use notification title/body if available, otherwise fallback to data title/body
        title: notification?.title || data?.title || "Notification",
        body: notification?.body || data?.body || "",
        imageUrl: notification?.imageUrl || data?.imageUrl || data?.image_url,
      };

      console.log("📧 [FCM Token] Notification data:", {
        title: notificationData.title,
        type: notificationData.type,
        orderId: notificationData.orderId,
      });

      // Call the registered foreground notification handler
      if (this.foregroundNotificationHandler) {
        console.log("✅ [FCM Token] Calling foreground notification handler");
        this.foregroundNotificationHandler(notificationData);
      } else {
        console.warn("⚠️ [FCM Token] No foreground notification handler registered");
      }
    } catch (error) {
      console.error("❌ [FCM Token] Error showing local notification:", error);
    }
  }

  /**
   * Process notification data for navigation
   */
  private processNotificationForNavigation(data: any): NotificationData | null {
    if (!data) return null;

    try {
      return {
        type: data.type || "general",
        id: data.id,
        orderId: data.orderId || data.order_id,
        storeId: data.storeId || data.store_id,
        productId: data.productId || data.product_id,
        userId: data.userId || data.user_id,
        deepLink: data.deepLink || data.deep_link,
        title: data.title || "Notification",
        body: data.body || "",
        imageUrl: data.imageUrl || data.image_url,
      };
    } catch (error) {
      console.error("Error processing notification data:", error);
      return null;
    }
  }

  /**
   * Handle notification navigation
   */
  private handleNotificationNavigation(data: any): void {
    const notificationData = this.processNotificationForNavigation(data);

    if (!notificationData) {
      // console.log("No valid notification data for navigation");
      return;
    }

    try {
      // Add a small delay to ensure app is fully loaded
      setTimeout(() => {
        this.navigateBasedOnNotification(notificationData);
      }, 1000);
    } catch (error) {
      console.error("Error handling notification navigation:", error);
    }
  }

  /**
   * Navigate to appropriate screen based on notification data
   */
  private navigateBasedOnNotification(data: NotificationData): void {
    try {
      // Handle deep link first if provided
      if (data.deepLink) {
        router.push(data.deepLink as any);
        return;
      }

      // Navigate based on notification type
      switch (data.type) {
        case "order":
          if (data.orderId) {
            // Check user role to determine the correct orders path
            router.push(`/(buyer)/orders/${data.orderId}`);
          } else {
            router.push("/(buyer)/orders");
          }
          break;

        case "delivery":
          if (data.orderId) {
            router.push(`/(delivery)/orders/${data.orderId}`);
          } else {
            router.push("/(delivery)/orders");
          }
          break;

        case "vendor":
          if (data.orderId) {
            router.push(`/(vendor)/orders/${data.orderId}`);
          } else if (data.productId) {
            router.push(`/(vendor)/products/${data.productId}`);
          } else {
            router.push("/(vendor)");
          }
          break;

        case "affiliate":
          router.push("/(winga)");
          break;

        case "general":
        default:
          // Navigate to notifications page or home
          router.push("/(buyer)/notifications");
          break;
      }
    } catch (error) {
      console.error("Error navigating based on notification:", error);
      // Fallback to home screen
      router.push("/(buyer)");
    }
  }

  /**
   * Unsubscribe from notifications
   */
  async unsubscribe(): Promise<void> {
    if (Platform.OS === "web" || !messaging) {
      return;
    }

    try {
      // Remove token from backend before deleting locally
      if (this.currentToken) {
        await this.removeTokenFromBackend(this.currentToken);
      }

      await messaging().deleteToken();
      this.currentToken = null;
      this.lastPermissionStatus = null;
      // console.log("Unsubscribed from push notifications");
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
    }
  }

  /**
   * Remove token from backend (for logout, uninstall, etc.)
   */
  private async removeTokenFromBackend(token: string): Promise<void> {
    try {
      await authApi.removeFirebaseToken(token);
    } catch (error: any) {
      // If the token is already gone or the user is not found/unauthorized, we can silently ignore.
      // This is common after account deactivation or when the user is already logged out.
      const status = error.apiError?.status || error.response?.status;

      if (status === 404 || status === 401) {
        console.log(`ℹ️ [FCM Token] Token already removed or unauthorized (Status: ${status})`);
        return;
      }

      console.error("Failed to remove token from backend:", error);
    }
  }

  /**
   * Get current token (for debugging)
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return Platform.OS !== "web" && !!messaging;
  }

  /**
   * Handle user logout - clean up tokens and notify backend
   */
  async handleLogout(): Promise<void> {
    await this.unsubscribe();
  }
}

export const pushNotificationsService = PushNotificationsService.getInstance();
export default pushNotificationsService;
