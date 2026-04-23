import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import auth from "@react-native-firebase/auth"; // For mobile
import { apiClient } from "./client";
import { authApi } from "./auth";
import { parseApiError } from "./error-handler";

// Dynamically import Firebase Web SDK for web platform
let firebaseWeb: any;
let firebaseAnalytics: any;
if (Platform.OS === "web") {
  import("firebase/auth").then((module) => {
    firebaseWeb = module;
  });
  // Only import analytics if running in a browser environment
  if (typeof window !== "undefined") {
    import("firebase/analytics").then((module) => {
      firebaseAnalytics = module;
    });
  }
}

// Configure Google Sign-In for mobile
if (Platform.OS !== "web") {
  GoogleSignin.configure({
    webClientId:
      "230701056851-d1lqfo4r16r29irhq2q7ihb61bsr5o9k.apps.googleusercontent.com",
    iosClientId:
      "230701056851-gckqvt47r5ch4ln18iid3c6fe4e8vlad.apps.googleusercontent.com",
    offlineAccess: true,
  });
}

// Initialize Firebase Web SDK for web platform
let webAuth: any;
let analytics: any;
if (Platform.OS === "web") {
  import("firebase/app").then((firebaseApp) => {
    import("firebase/auth").then((firebaseAuth) => {
      const firebaseConfig = {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      };

      // Validate that all required config values are present
      if (
        !firebaseConfig.apiKey ||
        !firebaseConfig.authDomain ||
        !firebaseConfig.projectId ||
        !firebaseConfig.storageBucket ||
        !firebaseConfig.messagingSenderId ||
        !firebaseConfig.appId
      ) {
        throw new Error("Missing Firebase configuration values");
      }

      const app = firebaseApp.initializeApp(firebaseConfig);
      webAuth = firebaseAuth.getAuth(app);

      // Only initialize analytics in a browser environment
      if (typeof window !== "undefined" && firebaseConfig.measurementId && firebaseAnalytics) {
        import("firebase/analytics").then((firebaseAnalyticsModule) => {
          analytics = firebaseAnalyticsModule.getAnalytics(app);
        });
      }
    });
  });
}

export const socialAuth = {
  // Google Sign In for both mobile and web
  signInWithGoogle: async () => {
    try {
      if (Platform.OS === "web") {
        if (!firebaseWeb || !webAuth) {
          throw new Error("Firebase Web SDK not initialized");
        }

        // Web-specific Google Sign-In
        const provider = new firebaseWeb.GoogleAuthProvider();
        provider.addScope("email");
        provider.addScope("profile");

        // Sign in with popup for web
        const userCredential = await firebaseWeb.signInWithPopup(webAuth, provider);

        // Get Firebase ID token
        const firebaseToken = await userCredential.user.getIdToken();

        // Authenticate with backend
        return await socialAuth.authenticateWithBackend(firebaseToken);
      } else {
        // Mobile-specific Google Sign-In
        // Check if device has Google Play Services (Android)
        await GoogleSignin.hasPlayServices();

        // Sign in to Google
        const userInfo = await GoogleSignin.signIn();


        if (!userInfo.data?.idToken) {
          throw new Error("No ID token received from Google");
        }

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(
          userInfo.data.idToken
        );


        // Sign in to Firebase with the Google credential
        const userCredential = await auth().signInWithCredential(googleCredential);


        // Get Firebase ID token
        const firebaseToken = await userCredential.user.getIdToken();


        // Authenticate with backend
        return await socialAuth.authenticateWithBackend(firebaseToken);
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);

      // Handle specific error cases
      if (Platform.OS !== "web") {
        if (error.code === "statusCodes.SIGN_IN_CANCELLED") {
          return null; // User cancelled
        } else if (error.code === "statusCodes.IN_PROGRESS") {
          throw new Error("Sign in already in progress");
        } else if (error.code === "statusCodes.PLAY_SERVICES_NOT_AVAILABLE") {
          throw new Error("Google Play Services not available");
        }
      } else {
        // Web-specific error handling
        if (error.code === "auth/popup-closed-by-user") {
          return null; // User cancelled
        }
      }

      throw error;
    }
  },

  // Apple Sign In using Expo Apple Authentication
  signInWithApple: async () => {
    try {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();

      if (!isAvailable) {
        throw new Error("Apple Authentication is not available on this device");
      }

      // Request Apple Authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identity token received from Apple");
      }

      // Create an Apple credential with the token
      const appleCredential = auth.AppleAuthProvider.credential(
        credential.identityToken,
        credential.authorizationCode || undefined
      );

      // Sign in to Firebase with the Apple credential
      const userCredential = await auth().signInWithCredential(appleCredential);

      // Get Firebase ID token
      const firebaseToken = await userCredential.user.getIdToken();

      // Store additional user info if available
      const additionalUserInfo = {
        fullName: credential.fullName,
        email: credential.email,
      };

      // Authenticate with backend
      return await socialAuth.authenticateWithBackend(
        firebaseToken,
        additionalUserInfo
      );
    } catch (error: any) {
      console.error("Apple sign in error:", error);

      // Handle Apple-specific errors
      if (error.code === "ERR_CANCELED") {
        return null; // User cancelled
      }

      throw error;
    }
  },

  // Check if Apple Sign-In is available (iOS only)
  isAppleSignInAvailable: async () => {
    if (Platform.OS !== "ios") return false;
    return await AppleAuthentication.isAvailableAsync();
  },

  // Sign out from Google (if needed)
  signOutGoogle: async () => {
    try {
      if (Platform.OS === "web") {
        if (!webAuth) {
          throw new Error("Firebase Web SDK not initialized");
        }
        await webAuth.signOut();
      } else {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error("Google sign out error:", error);
    }
  },

  authenticateWithBackend: async (
    idToken: string,
    additionalUserInfo?: any
  ) => {
    try {

      const response = await apiClient.post("auth/firebase/login", {
        id_token: idToken,
        // additional_info: additionalUserInfo,
      });

      // Save tokens
      await authApi.saveTokens(
        response.data.access_token,
        response.data.refresh_token
      );

      return response.data;
    } catch (error: any) {
      console.error("Backend authentication error:", error);
      console.error("Error message:", error.message);
      console.error("Error details:", error.apiError);
      console.error("Original error:", error.originalError?.response?.data);

      // Parse the error to get user-friendly message
      const parsedError = parseApiError(error.originalError || error);

      // Log the parsed error details
      console.error("Parsed error:", {
        status: parsedError.status,
        code: parsedError.code,
        message: parsedError.message,
        action: parsedError.action,
      });

      // Create a new error with the user-friendly message
      const enhancedError = new Error(parsedError.message);
      (enhancedError as any).apiError = parsedError;
      (enhancedError as any).originalError = error;

      throw enhancedError;
    }
  },
};