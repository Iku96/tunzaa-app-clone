import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { useStorageState } from "@/hooks/useStorageState";
import { authApi } from "@/services/auth";
import {
  getTempPhoneNumber,
  clearTempPhoneNumber,
  saveTokens,
  clearNewlyRegisteredFlag,
} from "@/utils/storage";
import { STORAGE_KEYS } from "@/services/config";
import { vendorsApi } from "@/services/vendors";
import { deliveryApi } from "@/services/delivery";
import { affiliatesApi } from "@/services/affiliates";
import pushNotificationsService from "@/services/push-notifications";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from "@tanstack/react-query";
import { Permission, ROLE_PERMISSIONS } from "@/config/permissions";

export type UserRole = "buyer" | "vendor" | "delivery" | "winga" | "super";

interface KycDocument {
  documentType: string;
  documentNumber: string;
  documentLink: string;
}

interface Kyc {
  verified: boolean;
  documents: KycDocument[];
}

interface UserProfile {
  profile_id: string;
  role: UserRole;
  displayName: string;
  preferences?: {
    newsletterSubscribed: boolean;
    defaultPaymentMethod: string;
  };
  address?: {
    line1: string;
    city: string;
    country: string;
  };
  contactNumber?: string;
  availability?: boolean;
  storeDetails?: {
    storeName: string;
    storeAddress: string;
    registrationNumber: string;
  };
  settings?: {
    autoApproveOrders: boolean;
  };
  kyc: Kyc;
}

interface User {
  id: any;
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  activeProfileRole: UserRole;
  profiles: UserProfile[];
  roles: { role: string; description: string }[];
  permissions: string[];
  meta: {
    createdAt: string;
    updatedAt: string;
  };
  userType?: UserRole;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  is_verified: boolean;
  tenant_id: string;
  last_login: string | null;
  provider: string;
  firebase_uid: string | null;
  // Profile details (loaded separately to avoid SecureStore size limit)
  vendorDetails?: any;
  deliveryDetails?: any;
  affiliateDetails?: any;
}

// Core user data that fits in SecureStore (without large profile details)
interface CoreUserData {
  id: any;
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  activeProfileRole: UserRole;
  profiles: UserProfile[];
  roles: { role: string; description: string }[];
  permissions: string[];
  meta: {
    createdAt: string;
    updatedAt: string;
  };
  userType?: UserRole;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  is_verified: boolean;
  tenant_id: string;
  last_login: string | null;
  provider: string;
  firebase_uid: string | null;
}

// Profile details stored separately
interface ProfileDetails {
  vendorDetails?: any;
  deliveryDetails?: any;
  affiliateDetails?: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  userType: UserRole | null;
  setUserType: (type: UserRole) => void;
  login: (identifier: string, password: string) => Promise<void>;
  socialLogin: (socialData: any) => Promise<void>;
  register: (
    registrationData?: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      password: string;
    },
    autoLogin?: boolean
  ) => Promise<any>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  updateKyc: (documents: KycDocument[]) => Promise<void>;
  refreshUserData: () => Promise<void>;
  // Helper methods to get profile details
  getVendorDetails: () => any | null;
  getDeliveryDetails: () => any | null;
  getAffiliateDetails: () => any | null;
  hasPermission: (permission: Permission) => boolean;
}

// Utility functions for user data storage management
const PROFILE_DETAILS_KEY = 'userProfileDetails';

const extractCoreUserData = (user: User): CoreUserData => {
  const { vendorDetails, deliveryDetails, affiliateDetails, ...coreData } = user;
  return coreData;
};

const extractProfileDetails = (user: User): ProfileDetails => {
  return {
    vendorDetails: user.vendorDetails,
    deliveryDetails: user.deliveryDetails,
    affiliateDetails: user.affiliateDetails,
  };
};

const combineUserData = (coreData: CoreUserData, profileDetails: ProfileDetails): User => {
  return {
    ...coreData,
    ...profileDetails,
  };
};

const saveProfileDetails = async (profileDetails: ProfileDetails) => {
  try {
    await AsyncStorage.setItem(PROFILE_DETAILS_KEY, JSON.stringify(profileDetails));
  } catch (error) {
    console.error('Failed to save profile details:', error);
  }
};

const loadProfileDetails = async (): Promise<ProfileDetails | null> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_DETAILS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load profile details:', error);
    return null;
  }
};

const clearProfileDetails = async () => {
  try {
    await AsyncStorage.removeItem(PROFILE_DETAILS_KEY);
  } catch (error) {
    console.error('Failed to clear profile details:', error);
  }
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  userType: null,
  setUserType: () => {},
  login: async () => {},
  socialLogin: async () => {},
  register: async () => {},
  logout: async () => {},
  setRole: async () => {},
  updateKyc: async () => {},
  refreshUserData: async () => {},
  getVendorDetails: () => null,
  getDeliveryDetails: () => null,
  getAffiliateDetails: () => null,
  hasPermission: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [[isLoading, storedUser], setStoredUser] = useStorageState("user");
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [lastStoredUser, setLastStoredUser] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Helper to get default permissions based on role
  const getPermissionsForRole = (role: UserRole): string[] => {
    return (ROLE_PERMISSIONS as Record<string, string[]>)[role] || (ROLE_PERMISSIONS.buyer as string[]);
  };

  // Sync storage -> state once loaded and combine with profile details
  useEffect(() => {
    if (!isLoading && storedUser !== lastStoredUser) {
      const loadCompleteUser = async () => {
        try {
          if (storedUser) {
            const coreUserData: CoreUserData = JSON.parse(storedUser);
            const profileDetails = await loadProfileDetails();
            
            if (profileDetails) {
              const completeUser = combineUserData(coreUserData, profileDetails);
              setUser(completeUser);
            } else {
              // If no profile details, just use core data
              setUser(coreUserData as User);
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to load complete user data:', error);
          setUser(null);
        } finally {
          setLastStoredUser(storedUser);
        }
      };
      
      loadCompleteUser();
    }
  }, [isLoading, storedUser, lastStoredUser]); // Only update when storedUser actually changes

  // Function to fetch profile details based on user profiles
  const fetchProfileDetails = async (userData: User) => {
    const updatedUserData = { ...userData };

    // Fetch details for each profile (except buyer)
    for (const profile of userData.profiles) {
      try {
        if (profile.role === "vendor") {
          const vendorDetails = await vendorsApi.getVendor(profile.profile_id);
          updatedUserData.vendorDetails = vendorDetails;
        } else if (profile.role === "delivery") {
          const deliveryDetails = await deliveryApi.getDeliveryPartner(
            profile.profile_id
          );
          updatedUserData.deliveryDetails = deliveryDetails;
        } else if (profile.role === "winga") {
          //This will use the user id for now TODO: use profile id
          const affiliateDetails = await affiliatesApi.getAffiliate(
            userData.user_id
          );
          updatedUserData.affiliateDetails = affiliateDetails;
        }
      } catch (error) {
        console.log(`Failed to fetch ${profile.role} details:`, error);
        // Continue with other profiles even if one fails
      }
    }

    return updatedUserData;
  };

  const login = async (identifier: string, password: string) => {
    try {
      // Fix: Check if identifier starts with + BEFORE removing it
      const processedIdentifier = identifier.startsWith("+")
        ? identifier.slice(1)
        : identifier;

      const is_phone = /^\d+$/.test(processedIdentifier);

      setError(null);
      const response = await authApi.login({
        identifier: processedIdentifier,
        password,
        is_phone: is_phone,
      });

      // Map API response to existing User structure
      const userData: User = {
        id: response.user_id,
        user_id: response.user_id,
        name: response.name || `${response.first_name} ${response.last_name}`,
        email: response.email || "",
        activeProfileRole: response.active_profile_role,
        profiles: response.profiles.map((profile) => ({
          profile_id: profile.profile_id,
          role: profile.role as UserRole,
          displayName: profile.display_name || response.name,
          kyc: {
            verified: false,
            documents: [],
          },
          // Add other profile fields based on role
        })),
        meta: {
          createdAt: response.created_at,
          updatedAt: response.updated_at,
        },
        phone_number: response.phone_number,
        roles: response.roles,
        permissions: response.permissions || getPermissionsForRole(response.active_profile_role),
        created_at: response.created_at,
        updated_at: response.updated_at,
        is_active: response.is_active || false,
        is_verified: response.is_verified || false,
        tenant_id: response.tenant_id,
        last_login: response.last_login,
        provider: response.provider,
        firebase_uid: response.firebase_uid,
      };

      // Store user data

      // Set role based on priority: vendor > delivery > winga > buyer
      const userRoles = userData.profiles.map((profile) => profile.role);
      let priorityRole: UserRole = userData.activeProfileRole;

      if (userRoles.includes("vendor")) {
        priorityRole = "vendor";
      } else if (userRoles.includes("delivery")) {
        priorityRole = "delivery";
      } else if (userRoles.includes("winga")) {
        priorityRole = "winga";
      }
      // buyer is default, no need to explicitly set

      // Update role if different from current
      // Also update permissions if role changes (unless backend provided specific permissions that should persist)
      // Note: Here we assume if permissions were not provided by backend, we should re-derive them from the new priority role.
      // If backend provided them, we keep them (unless we want to enforce role-based permissions).
      // For now, let's prioritize backend permissions if present, otherwise derive from active role.
      const permissions = response.permissions || getPermissionsForRole(priorityRole);

      const updated = { ...userData, activeProfileRole: priorityRole, permissions };

      // Fetch profile details for non-buyer profiles
      const updatedWithDetails = await fetchProfileDetails(updated);

      // Save core user data and profile details separately
      const coreUserData = extractCoreUserData(updatedWithDetails);
      const profileDetails = extractProfileDetails(updatedWithDetails);
      
      await setStoredUser(JSON.stringify(coreUserData));
      await saveProfileDetails(profileDetails);
      setUser(updatedWithDetails);
      await saveTokens(response.access_token, response.refresh_token);

      // 🔔 Register push notification token after successful login
      try {
       

        // Check if push notifications are supported and if user has permissions
        if (pushNotificationsService.isSupported()) {
          const permissionStatus =
            await pushNotificationsService.getPermissionStatus();

          if (permissionStatus.hasPermission) {
            
            await pushNotificationsService.initialize();
            const token = await pushNotificationsService.getAndRegisterToken();

            if (token) {
              // console.log(
              //   "🎯 Push notification token registered successfully after login"
              // );
            } else {
              // console.log("⚠️ No push notification token available");
            }
          } else {
            // console.log(
            //   "ℹ️ User doesn't have push notification permissions, skipping token registration"
            // );
          }
        } else {
          // console.log("ℹ️ Push notifications not supported on this platform");
        }
      } catch (pushNotificationError) {
        // Don't fail login if push notification registration fails
        console.error(
          "⚠️ Failed to register push notification token after login:",
          pushNotificationError
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
      throw err;
    }
  };

  const socialLogin = async (socialData: any) => {
    try {
      setError(null);

      // Map social auth response to existing User structure
      const userData: User = {
        id: socialData.user_id,
        user_id: socialData.user_id,
        name:
          socialData.name || `${socialData.first_name} ${socialData.last_name}`,
        email: socialData.email || "",
        activeProfileRole: socialData.active_profile_role,
        profiles: socialData.profiles.map((profile: any) => ({
          profile_id: profile.profile_id,
          role: profile.role as UserRole,
          displayName: profile.display_name || socialData.name,
          kyc: {
            verified: false,
            documents: [],
          },
        })),
        meta: {
          createdAt: socialData.created_at,
          updatedAt: socialData.updated_at,
        },
        phone_number: socialData.phone_number || "",
        roles: socialData.roles || [],
        permissions: socialData.permissions || getPermissionsForRole(socialData.active_profile_role),
        created_at: socialData.created_at,
        updated_at: socialData.updated_at,
        is_verified: socialData.is_verified || false,
        tenant_id: socialData.tenant_id,
        last_login: socialData.last_login,
        provider: socialData.provider || "firebase",
        firebase_uid: socialData.firebase_uid,
      };

      // Set role based on priority: vendor > delivery > winga > buyer
      const userRoles = userData.profiles.map((profile) => profile.role);
      let priorityRole: UserRole = userData.activeProfileRole;

      if (userRoles.includes("vendor")) {
        priorityRole = "vendor";
      } else if (userRoles.includes("delivery")) {
        priorityRole = "delivery";
      } else if (userRoles.includes("winga")) {
        priorityRole = "winga";
      }

      const permissions = socialData.permissions || getPermissionsForRole(priorityRole);

      const updated = { ...userData, activeProfileRole: priorityRole, permissions };

      // Fetch profile details for non-buyer profiles
      const updatedWithDetails = await fetchProfileDetails(updated);

      // Save core user data and profile details separately
      const coreUserData = extractCoreUserData(updatedWithDetails);
      const profileDetails = extractProfileDetails(updatedWithDetails);
      
      await setStoredUser(JSON.stringify(coreUserData));
      await saveProfileDetails(profileDetails);
      setUser(updatedWithDetails);

      // 🔔 Register push notification token after successful social login
      try {
        

        // Check if push notifications are supported and if user has permissions
        if (pushNotificationsService.isSupported()) {
          const permissionStatus =
            await pushNotificationsService.getPermissionStatus();

          if (permissionStatus.hasPermission) {
            
            await pushNotificationsService.initialize();
            const token = await pushNotificationsService.getAndRegisterToken();

            if (token) {
              // console.log(
              //   "🎯 Push notification token registered successfully after social login"
              // );
            } else {
              // console.log("⚠️ No push notification token available");
            }
          } else {
            // console.log(
            //   "ℹ️ User doesn't have push notification permissions, skipping token registration"
            // );
          }
        } else {
          // console.log("ℹ️ Push notifications not supported on this platform");
        }
      } catch (pushNotificationError) {
        // Don't fail login if push notification registration fails
        console.error(
          "⚠️ Failed to register push notification token after social login:",
          pushNotificationError
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Social login failed. Please try again.";
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (
    registrationData?: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      password: string;
    },
    autoLogin: boolean = true
  ) => {
    try {
      setError(null);

      let registerPayload;

      if (registrationData) {
        // Called from complete-profile submit methods with full data
        registerPayload = registrationData;
      } else {
        // Legacy call - shouldn't happen anymore but keeping for safety
        throw new Error("Registration data is required");
      }

      // Register the user
      const response = await authApi.register(registerPayload);

      // Clear temporary phone number
      await clearTempPhoneNumber();

      // Always save tokens so API calls can authenticate, but don't set user state yet
      await saveTokens(response.access_token, response.refresh_token);

      // Only complete login (set user state) for buyers, vendors/delivery/affiliates will login manually after profile creation
      if (autoLogin) {
        const identifier =
          registerPayload.email || registerPayload.phone_number;
        await login(identifier, registerPayload.password);
      }

      // Return the response for cases where user_id is needed (vendor/delivery/affiliate)
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);

      // 🔔 Clean up push notification tokens before logout
      try {
        await pushNotificationsService.handleLogout();
      } catch (pushNotificationError) {
        // Don't fail logout if push notification cleanup fails
        console.error(
          "⚠️ Failed to clean up push notification tokens:",
          pushNotificationError
        );
      }

      // 🧹 Clear all authentication data
      await authApi.clearTokens();
      await setStoredUser(null);
      await clearProfileDetails();
      await clearTempPhoneNumber();
      await clearNewlyRegisteredFlag();

      // 🧹 Clear all Zustand persisted stores
      try {
        // Import stores dynamically to avoid circular dependencies
        const { useWishlistStore } = await import("@/stores/wishlist");
        const { useSimplifiedCart } = await import("@/stores/cart-simplified");
        const { useCartStore } = await import("@/stores/cart");
        const { useAuthStore } = await import("@/stores/auth");

        // Clear wishlist
        useWishlistStore.getState().clearItems();

        // Clear simplified cart
        useSimplifiedCart.getState().clearAfterOrder();

        // Clear cart store
        useCartStore.getState().clearCartItems();
        useCartStore.getState().clearAllTempQuantities();

        // Clear auth store
        useAuthStore.getState().clearRegistrationState();

        console.log("✅ All Zustand stores cleared");
      } catch (storeError) {
        console.error("⚠️ Failed to clear some stores:", storeError);
      }

      // 🧹 Clear React Query cache (all cached API data)
      queryClient.clear();
      console.log("✅ React Query cache cleared");

      // 🧹 Clear additional AsyncStorage items
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        await AsyncStorage.removeItem("temp_phone_number");
        console.log("✅ AsyncStorage user data cleared");
      } catch (asyncStorageError) {
        console.error("⚠️ Failed to clear AsyncStorage:", asyncStorageError);
      }

      // 🧹 Clear referral data from SecureStore
      try {
        const referralKeys = [
          'referral_code',
          'referral_tenant_id',
          'referral_affiliate_id',
          'referral_product_id',
          'referral_session_id',
          'referral_session_start_time',
          'referral_has_tracked_click',
        ];
        
        // Use dynamic import for SecureStore to avoid web issues
        if (Platform.OS !== 'web') {
          const SecureStore = await import('expo-secure-store');
          await Promise.all(
            referralKeys.map(key => SecureStore.deleteItemAsync(key).catch(() => {}))
          );
        }
        console.log("✅ Referral data cleared");
      } catch (referralError) {
        console.error("⚠️ Failed to clear referral data:", referralError);
      }

      // 🧹 Clear state
      setUser(null);
      setUserType(null);
      setLastStoredUser(null);

      console.log("✅ Logout completed - all user data cleared");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      setError("Logout failed");
    }
  };

  const setRole = async (role: UserRole) => {
    try {
      setError(null);
      if (user) {
        const permissions = getPermissionsForRole(role);
        const updated = { ...user, activeProfileRole: role, permissions };
        
        // Save core user data and profile details separately
        const coreUserData = extractCoreUserData(updated);
        const profileDetails = extractProfileDetails(updated);
        
        await setStoredUser(JSON.stringify(coreUserData));
        await saveProfileDetails(profileDetails);
        setUser(updated);
      }
    } catch {
      setError("Failed to update role");
    }
  };

  const updateKyc = async (documents: KycDocument[]) => {
    try {
      setError(null);
      if (user) {
        const updated = { ...user };
        const profile = updated.profiles.find(
          (p) => p.role === updated.activeProfileRole
        );
        if (profile) profile.kyc = { verified: false, documents };
        
        // Save core user data and profile details separately
        const coreUserData = extractCoreUserData(updated);
        const profileDetails = extractProfileDetails(updated);
        
        await setStoredUser(JSON.stringify(coreUserData));
        await saveProfileDetails(profileDetails);
        setUser(updated);
      }
    } catch {
      setError("Failed to update KYC documents");
    }
  };

  const refreshUserData = async () => {
    try {
      if (user?.user_id) {
        setError(null);

        // Get fresh user data from API
        const freshUserData = await authApi.getUserDetails(user.user_id);
        const activeRole = user?.activeProfileRole || freshUserData.active_profile_role;

        // Map API response to existing User structure (similar to login)
        const userData: User = {
          id: freshUserData.user_id,
          user_id: freshUserData.user_id,
          name:
            freshUserData.name ||
            `${freshUserData.first_name} ${freshUserData.last_name}`,
          email: freshUserData.email || "",
          activeProfileRole: activeRole,
          profiles: freshUserData.profiles.map((profile: any) => ({
            profile_id: profile.profile_id,
            role: profile.role as UserRole,
            displayName: profile.display_name || freshUserData.name,
            kyc: {
              verified: false,
              documents: [],
            },
            // Add other profile fields based on role
          })),
          meta: {
            createdAt: freshUserData.created_at,
            updatedAt: freshUserData.updated_at,
          },
          phone_number: freshUserData.phone_number,
          roles: freshUserData.roles,
          permissions: freshUserData.permissions || getPermissionsForRole(activeRole),
          created_at: freshUserData.created_at,
          updated_at: freshUserData.updated_at,
          is_verified: freshUserData.is_verified || false,
          tenant_id: freshUserData.tenant_id,
          last_login: freshUserData.last_login,
          provider: freshUserData.provider,
          firebase_uid: freshUserData.firebase_uid,
        };

        // Fetch profile details for non-buyer profiles
        const updatedWithDetails = await fetchProfileDetails(userData);

        // Save core user data and profile details separately
        const coreUserData = extractCoreUserData(updatedWithDetails);
        const profileDetails = extractProfileDetails(updatedWithDetails);
        
        await setStoredUser(JSON.stringify(coreUserData));
        await saveProfileDetails(profileDetails);
        setUser(updatedWithDetails);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      setError("Failed to refresh user data");
    }
  };

  // Helper methods to get profile details
  const getVendorDetails = () => {
    return user?.vendorDetails || null;
  };

  const getDeliveryDetails = () => {
    return user?.deliveryDetails || null;
  };

  const getAffiliateDetails = () => {
    return user?.affiliateDetails || null;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    isLoading,
    error,
    userType,
    setUserType,
    login,
    socialLogin,
    register,
    logout,
    setRole,
    updateKyc,
    refreshUserData,
    getVendorDetails,
    getDeliveryDetails,
    getAffiliateDetails,
    hasPermission,
  }), [
    user,
    isLoading,
    error,
    userType,
    setUserType,
    login,
    socialLogin,
    register,
    logout,
    setRole,
    updateKyc,
    refreshUserData,
    getVendorDetails,
    getDeliveryDetails,
    getAffiliateDetails,
    hasPermission,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
