/**
 * Android Notification Permissions Handler
 * 
 * Handles POST_NOTIFICATIONS permission for Android 13+ (API level 33+)
 * This is required in addition to Firebase's requestPermission()
 */

import { Platform, PermissionsAndroid } from 'react-native';

export interface AndroidNotificationPermissionResult {
  granted: boolean;
  neverAskAgain?: boolean;
}

/**
 * Request POST_NOTIFICATIONS permission on Android 13+
 * For Android < 13, permissions are auto-granted
 */
export async function requestAndroidNotificationPermission(): Promise<AndroidNotificationPermissionResult> {
  // Only relevant for Android
  if (Platform.OS !== 'android') {
    return { granted: true };
  }

  // Check Android version
  const androidVersion = Platform.Version;
  
  // Android 13 and above (API level 33+) require explicit permission
  if (androidVersion >= 33) {
    try {
      console.log('📱 [Android Permissions] Android 13+ detected, requesting POST_NOTIFICATIONS permission...');
      
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Enable Notifications',
          message: 'Stay updated with your orders, deliveries, and important updates.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Don\'t Allow',
          buttonPositive: 'Allow',
        }
      );

      console.log('📱 [Android Permissions] Permission result:', result);

      return {
        granted: result === PermissionsAndroid.RESULTS.GRANTED,
        neverAskAgain: result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      };
    } catch (error) {
      console.error('❌ [Android Permissions] Error requesting permission:', error);
      return { granted: false };
    }
  }

  // Android < 13: Notifications are auto-granted
  console.log('📱 [Android Permissions] Android < 13 detected, permissions auto-granted');
  return { granted: true };
}

/**
 * Check if POST_NOTIFICATIONS permission is granted
 */
export async function checkAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const androidVersion = Platform.Version;

  // Android < 13: Auto-granted
  if (androidVersion < 33) {
    return true;
  }

  // Android 13+: Check permission
  try {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    
    console.log('📱 [Android Permissions] Permission check result:', result);
    return result;
  } catch (error) {
    console.error('❌ [Android Permissions] Error checking permission:', error);
    return false;
  }
}


