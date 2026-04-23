import { Platform } from "react-native";

// Background message handler for React Native Firebase
// This file should be registered in index.js at the app root

let messaging: any = null;

// Only import Firebase messaging on native platforms
if (Platform.OS !== "web") {
  try {
    messaging = require("@react-native-firebase/messaging").default;
  } catch (error) {
    console.warn(
      "Firebase messaging not available for background handler:",
      error
    );
  }
}

// Background message handler
export const backgroundMessageHandler = async (remoteMessage: any) => {

  // Process the message
  try {
    const { notification, data } = remoteMessage;

    // You can perform any background processing here
    // For example:
    // - Update local storage
    // - Sync data with server
    // - Show local notification if needed

    // Note: Keep this function lightweight as it runs in the background
    // Heavy operations should be avoided
  } catch (error) {
    console.error("Error processing background message:", error);
  }
};

// Register the background handler (should be called in index.js)
export const registerBackgroundHandler = () => {
  if (messaging && Platform.OS !== "web") {
    messaging().setBackgroundMessageHandler(backgroundMessageHandler);
    console.log("Background message handler registered");
  }
};
