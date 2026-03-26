import { Platform } from 'react-native';

/**
 * Lazy-loaded native modules — expo-device and expo-notifications crash in
 * Expo Go because their native code isn't bundled.  We import them lazily so
 * the rest of the app still loads.  Every helper method below gracefully
 * degrades when the modules are unavailable.
 */
let Device: typeof import('expo-device') | null = null;
let Notifications: typeof import('expo-notifications') | null = null;

try {
    Device = require('expo-device');
} catch {
    console.warn('expo-device not available (expected in Expo Go)');
}

try {
    Notifications = require('expo-notifications');

    // Set global notification handler when the module IS available
    if (Notifications) {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    }
} catch {
    console.warn('expo-notifications not available (expected in Expo Go)');
}

export class NotificationService {
    /**
     * Request permissions and get the Expo push token.
     * Returns undefined when running inside Expo Go.
     */
    static async registerForPushNotificationsAsync() {
        if (!Notifications || !Device) {
            console.log('Notifications not available in this environment');
            return undefined;
        }

        let token: string | undefined;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#425BA4',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Push notification permission not granted');
                return undefined;
            }
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'tunzaa-clone',
            })).data;
            console.log('Expo Push Token:', token);
        } else {
            console.log('Must use physical device for push notifications');
        }

        return token;
    }

    /**
     * Schedule a generic local notification.
     * No-ops silently when expo-notifications is unavailable.
     */
    static async scheduleLocalNotification(
        title: string,
        body: string,
        data: any = {},
        trigger: any = null
    ) {
        if (!Notifications) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: 'default',
            },
            trigger,
        });
    }

    // --- Specific Use Cases ---

    static async sendDeliveryAlert(orderId: string, status: string = 'Shipped') {
        await this.scheduleLocalNotification(
            '📦 Delivery Update',
            `Your order #${orderId} is now ${status}. Tap to track.`,
            { screen: 'orders', orderId }
        );
    }

    static async sendPromotionAlert(promoTitle: string) {
        await this.scheduleLocalNotification(
            '🎉 Special Offer',
            `Check out this new promo: ${promoTitle}!`,
            { screen: 'home' }
        );
    }

    static async sendSystemMessage(message: string) {
        await this.scheduleLocalNotification(
            '⚙️ System Update',
            message,
            { screen: 'settings' }
        );
    }

    static async sendPaymentReminder(amount: string, dueDate: string, trigger?: any) {
        await this.scheduleLocalNotification(
            '⏳ Payment Reminder',
            `Your payment of ${amount} is due on ${dueDate}. Don't miss it!`,
            { screen: 'payments' },
            trigger
        );
    }

    static async sendGoalReminder(goalName: string, progress: string) {
        await this.scheduleLocalNotification(
            '🎯 Goal Progress',
            `You are ${progress} complete with your goal: ${goalName}. Keep it up!`,
            { screen: 'goals' }
        );
    }
}

/**
 * Helper to add a notification response listener (safe for Expo Go).
 * Returns a subscription that can be removed, or null if unavailable.
 */
export function addNotificationResponseListener(
    callback: (response: any) => void
) {
    if (!Notifications) return null;
    return Notifications.addNotificationResponseReceivedListener(callback);
}
