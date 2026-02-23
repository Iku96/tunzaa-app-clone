import { Platform } from "react-native";
import { apiClient } from "./client";
import { authApi } from "./auth";
import { parseApiError } from "./error-handler";

/**
 * Social Auth Service
 * Handles Google and Apple sign-in via Firebase, then authenticates with Tunzaa backend.
 *
 * Pattern matches legacy_client/services/social-auth.ts:
 *   - Direct imports for native deps (will error at module load if not installed)
 *   - Dynamic import() for web Firebase SDK
 *   - No availability pre-check — caller catches errors directly
 */

// ── Native deps (mobile only) ─────────────────────────────────────────
// These are imported directly, matching the legacy pattern.
// On web, Platform.OS guard prevents them from executing.
let GoogleSignin: any;
let firebaseAuth: any;
let AppleAuthentication: any;

if (Platform.OS !== "web") {
    try {
        const gsModule = require("@react-native-google-signin/google-signin");
        GoogleSignin = gsModule.GoogleSignin;
        GoogleSignin.configure({
            webClientId:
                "230701056851-d1lqfo4r16r29irhq2q7ihb61bsr5o9k.apps.googleusercontent.com",
            iosClientId:
                "230701056851-gckqvt47r5ch4ln18iid3c6fe4e8vlad.apps.googleusercontent.com",
            offlineAccess: true,
        });
    } catch (e) {
        console.warn("⚠️ @react-native-google-signin/google-signin not available.");
    }

    try {
        firebaseAuth = require("@react-native-firebase/auth").default;
    } catch (e) {
        console.warn("⚠️ @react-native-firebase/auth not available.");
    }

    try {
        AppleAuthentication = require("expo-apple-authentication");
    } catch (e) {
        console.warn("⚠️ expo-apple-authentication not available.");
    }
}

// ── Web Firebase SDK (dynamic import, matching legacy) ─────────────────
let firebaseWeb: any;
let webAuth: any;

if (Platform.OS === "web") {
    // Dynamic import so web Firebase SDK is loaded asynchronously
    import("firebase/auth").then((module) => {
        firebaseWeb = module;
    });

    import("firebase/app").then((firebaseApp) => {
        import("firebase/auth").then((firebaseAuthModule) => {
            const firebaseConfig = {
                apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
                measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
            };

            // Validate required config
            if (
                !firebaseConfig.apiKey ||
                !firebaseConfig.authDomain ||
                !firebaseConfig.projectId ||
                !firebaseConfig.storageBucket ||
                !firebaseConfig.messagingSenderId ||
                !firebaseConfig.appId
            ) {
                console.error("❌ Missing Firebase configuration values");
                return;
            }

            const app = firebaseApp.initializeApp(firebaseConfig);
            webAuth = firebaseAuthModule.getAuth(app);
        });
    });
}

export const socialAuth = {
    /**
     * Google Sign In (mobile and web)
     */
    signInWithGoogle: async () => {
        try {
            if (Platform.OS === "web") {
                if (!firebaseWeb || !webAuth) {
                    throw new Error("Firebase Web SDK not initialized");
                }

                // Web: Google Sign-In via popup
                const provider = new firebaseWeb.GoogleAuthProvider();
                provider.addScope("email");
                provider.addScope("profile");

                const userCredential = await firebaseWeb.signInWithPopup(webAuth, provider);
                const firebaseToken = await userCredential.user.getIdToken();

                return await socialAuth.authenticateWithBackend(firebaseToken);
            } else {
                // Mobile: Google Sign-In
                if (!GoogleSignin) {
                    throw new Error(
                        "Google Sign-In not available. Install @react-native-google-signin/google-signin"
                    );
                }
                if (!firebaseAuth) {
                    throw new Error(
                        "Firebase Auth not available. Install @react-native-firebase/auth"
                    );
                }

                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();

                if (!userInfo.data?.idToken) {
                    throw new Error("No ID token received from Google");
                }

                const googleCredential = firebaseAuth.GoogleAuthProvider.credential(
                    userInfo.data.idToken
                );

                const userCredential = await firebaseAuth().signInWithCredential(googleCredential);
                const firebaseToken = await userCredential.user.getIdToken();

                return await socialAuth.authenticateWithBackend(firebaseToken);
            }
        } catch (error: any) {
            console.error("Google sign in error:", error);

            if (Platform.OS !== "web") {
                if (error.code === "statusCodes.SIGN_IN_CANCELLED") return null;
                if (error.code === "statusCodes.IN_PROGRESS") {
                    throw new Error("Sign in already in progress");
                }
                if (error.code === "statusCodes.PLAY_SERVICES_NOT_AVAILABLE") {
                    throw new Error("Google Play Services not available");
                }
            } else {
                if (error.code === "auth/popup-closed-by-user") return null;
            }

            throw error;
        }
    },

    /**
     * Apple Sign In (iOS only, uses expo-apple-authentication)
     */
    signInWithApple: async () => {
        try {
            if (!AppleAuthentication) {
                throw new Error(
                    "Apple Authentication not available. Install expo-apple-authentication"
                );
            }
            if (!firebaseAuth) {
                throw new Error(
                    "Firebase Auth not available. Install @react-native-firebase/auth"
                );
            }

            const isAvailable = await AppleAuthentication.isAvailableAsync();
            if (!isAvailable) {
                throw new Error("Apple Authentication is not available on this device");
            }

            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (!credential.identityToken) {
                throw new Error("No identity token received from Apple");
            }

            const appleCredential = firebaseAuth.AppleAuthProvider.credential(
                credential.identityToken,
                credential.authorizationCode || undefined
            );

            const userCredential = await firebaseAuth().signInWithCredential(appleCredential);
            const firebaseToken = await userCredential.user.getIdToken();

            const additionalUserInfo = {
                fullName: credential.fullName,
                email: credential.email,
            };

            return await socialAuth.authenticateWithBackend(
                firebaseToken,
                additionalUserInfo
            );
        } catch (error: any) {
            console.error("Apple sign in error:", error);
            if (error.code === "ERR_CANCELED") return null;
            throw error;
        }
    },

    /**
     * Check if Apple Sign-In is available (iOS only)
     */
    isAppleSignInAvailable: async () => {
        if (Platform.OS !== "ios") return false;
        if (!AppleAuthentication) return false;
        try {
            return await AppleAuthentication.isAvailableAsync();
        } catch {
            return false;
        }
    },

    /**
     * Sign out from Google
     */
    signOutGoogle: async () => {
        try {
            if (Platform.OS === "web") {
                if (webAuth) await webAuth.signOut();
            } else {
                if (GoogleSignin) await GoogleSignin.signOut();
            }
        } catch (error) {
            console.error("Google sign out error:", error);
        }
    },

    /**
     * Authenticate with Tunzaa backend using Firebase ID token
     */
    authenticateWithBackend: async (
        idToken: string,
        additionalUserInfo?: any
    ) => {
        try {
            const response = await apiClient.post("/auth/firebase/login", {
                id_token: idToken,
            });

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

            const parsedError = parseApiError(error.originalError || error);

            console.error("Parsed error:", {
                status: parsedError.status,
                code: parsedError.code,
                message: parsedError.message,
                action: parsedError.action,
            });

            const enhancedError = new Error(parsedError.message);
            (enhancedError as any).apiError = parsedError;
            (enhancedError as any).originalError = error;

            throw enhancedError;
        }
    },
};
