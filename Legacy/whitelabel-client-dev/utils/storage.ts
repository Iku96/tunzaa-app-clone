import { setStorageItemAsync } from "@/hooks/useStorageState";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "@/services/config";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Utility functions for storage operations that can be used outside React components

// Cross-platform storage getter utility
const getStorageItemAsync = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("Local storage is unavailable:", e);
      return null;
    }
  } else {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error("SecureStore error:", e);
      return null;
    }
  }
};

// Token storage utilities
export const getAccessToken = async (): Promise<string | null> => {

  const token = await getStorageItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

  return await getStorageItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await getStorageItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setAccessToken = async (token: string | null): Promise<void> => {
  await setStorageItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const setRefreshToken = async (token: string | null): Promise<void> => {
  await setStorageItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const saveTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  await Promise.all([
    setAccessToken(accessToken),
    setRefreshToken(refreshToken),
    setStorageItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    setStorageItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
};

export const clearTokens = async (): Promise<void> => {
  console.log("🔑 Clearing authentication tokens");
  await Promise.all([
    setAccessToken(null),
    setRefreshToken(null),
    setStorageItemAsync(STORAGE_KEYS.ACCESS_TOKEN, null),
    setStorageItemAsync(STORAGE_KEYS.REFRESH_TOKEN, null),
  ]);
};

// Temp phone number utilities
export const getTempPhoneNumber = async (): Promise<string | null> => {
  const phoneNumber = await getStorageItemAsync("temp_phone_number");
  // console.log("📱 getTempPhoneNumber called:", phoneNumber);
  return phoneNumber;
};

export const setTempPhoneNumber = async (
  phoneNumber: string | null
): Promise<void> => {
  // console.log("📱 setTempPhoneNumber called with:", phoneNumber);
  await setStorageItemAsync("temp_phone_number", phoneNumber);
};

export const clearTempPhoneNumber = async (): Promise<void> => {
  // console.log("📱 clearTempPhoneNumber called");
  await setStorageItemAsync("temp_phone_number", null);
};

// Utility function to reliably get phone number from multiple sources
export const getPhoneNumberFromSources = async (): Promise<string | null> => {
  try {
    // First try temp storage
    const tempPhone = await getTempPhoneNumber();
    if (tempPhone) {
      // console.log("📱 Phone number found in temp storage:", tempPhone);
      return tempPhone;
    }

    // If no phone number found anywhere, return null
    // console.log("📱 No phone number found in any source");
    return null;
  } catch (error) {
    // console.error("📱 Error getting phone number from sources:", error);
    return null;
  }
};

// Newly registered user flag for referral modal
const NEWLY_REGISTERED_KEY = "newly_registered_user";

export const setNewlyRegisteredFlag = async (): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(NEWLY_REGISTERED_KEY, "true");
    } else {
      await AsyncStorage.setItem(NEWLY_REGISTERED_KEY, "true");
    }
  } catch (error) {
    console.error("Failed to set newly registered flag:", error);
  }
};

export const getNewlyRegisteredFlag = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "web") {
      const flag = localStorage.getItem(NEWLY_REGISTERED_KEY);
      return flag === "true";
    } else {
      const flag = await AsyncStorage.getItem(NEWLY_REGISTERED_KEY);
      return flag === "true";
    }
  } catch (error) {
    console.error("Failed to get newly registered flag:", error);
    return false;
  }
};

export const clearNewlyRegisteredFlag = async (): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(NEWLY_REGISTERED_KEY);
    } else {
      await AsyncStorage.removeItem(NEWLY_REGISTERED_KEY);
    }
  } catch (error) {
    console.error("Failed to clear newly registered flag:", error);
  }
};
