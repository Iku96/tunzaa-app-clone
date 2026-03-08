import { setStorageItemAsync } from "../hooks/useStorageState";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "../services/config";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage utilities for token management and temporary data
 * Works cross-platform: SecureStore on native, localStorage on web
 */

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

// ---- Token Storage ----

export const getAccessToken = async (): Promise<string | null> => {
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
    ]);
};

export const clearTokens = async (): Promise<void> => {
    console.log("🔑 [Storage] Clearing authentication tokens and userId");
    await Promise.all([
        setAccessToken(null),
        setRefreshToken(null),
        setUserId(null),
    ]);
};

// ---- User ID Storage (for session recovery) ----

export const getUserId = async (): Promise<string | null> => {
    return await getStorageItemAsync('user_id');
};

export const setUserId = async (userId: string | null): Promise<void> => {
    await setStorageItemAsync('user_id', userId);
};

export const clearUserId = async (): Promise<void> => {
    await setUserId(null);
};

// ---- Temp Phone Number ----

export const getTempPhoneNumber = async (): Promise<string | null> => {
    return await getStorageItemAsync("temp_phone_number");
};

export const setTempPhoneNumber = async (
    phoneNumber: string | null
): Promise<void> => {
    await setStorageItemAsync("temp_phone_number", phoneNumber);
};

export const clearTempPhoneNumber = async (): Promise<void> => {
    await setStorageItemAsync("temp_phone_number", null);
};

/**
 * Get phone number from multiple storage sources
 */
export const getPhoneNumberFromSources = async (): Promise<string | null> => {
    try {
        const tempPhone = await getTempPhoneNumber();
        if (tempPhone) return tempPhone;
        return null;
    } catch (error) {
        return null;
    }
};

// ---- Newly Registered User Flag ----

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
