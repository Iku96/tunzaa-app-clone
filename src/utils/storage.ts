/**
 * ============================================================================
 * STORAGE UTILITIES (SECURE & ASYNC)
 * ============================================================================
 */

import { Platform } from "react-native";
import { STORAGE_KEYS } from "../services/config";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ------------------------------------------------------------------------
// CORE GETTER (INTERNAL)
// ------------------------------------------------------------------------
const getStorageItemAsync = async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    } else {
        try { return await SecureStore.getItemAsync(key); } catch (e) { return null; }
    }
};

// ------------------------------------------------------------------------
// TOKEN MANAGEMENT (SECURE)
// ------------------------------------------------------------------------
export const getAccessToken = async (): Promise<string | null> => {
    return await getStorageItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
};

export const getRefreshToken = async (): Promise<string | null> => {
    return await getStorageItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setAccessToken = async (token: string | null | undefined): Promise<void> => {
    if (Platform.OS === "web") {
        if (!token) localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        else localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
        try {
            if (typeof token !== 'string') await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            else await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
        } catch (e) { console.error("SecureStore Error:", e); }
    }
};

export const setRefreshToken = async (token: string | null | undefined): Promise<void> => {
    if (Platform.OS === "web") {
        if (!token) localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        else localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } else {
        try {
            if (typeof token !== 'string') await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            else await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
        } catch (e) { console.error("SecureStore Error:", e); }
    }
};

export const saveTokens = async (accessToken?: string, refreshToken?: string): Promise<void> => {
    const promises = [];
    if (typeof accessToken === 'string') promises.push(setAccessToken(accessToken));
    if (typeof refreshToken === 'string') promises.push(setRefreshToken(refreshToken));
    await Promise.all(promises);
};

export const clearTokens = async (): Promise<void> => {
    console.log("🔑 [Storage] Nuclear wipe of session and portal preference");
    try {
        if (Platform.OS !== "web") {
            await Promise.all([
                SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN).catch(() => { }),
                SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN).catch(() => { }),
                SecureStore.deleteItemAsync("user_id").catch(() => { }),
                SecureStore.deleteItemAsync("temp_phone_number").catch(() => { }),
                // ✅ This prevents the "Flash" when switching portals
                AsyncStorage.removeItem('LAST_PORTAL').catch(() => { }),
                AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA).catch(() => { })
            ]);
        } else {
            localStorage.clear();
        }
    } catch (e) { console.error("Storage clear error:", e); }
};

// ------------------------------------------------------------------------
// USER ID & TEMP PHONE NUMBER
// ------------------------------------------------------------------------
export const getUserId = async (): Promise<string | null> => {
    return await getStorageItemAsync("user_id");
};

export const setUserId = async (userId: string | null): Promise<void> => {
    if (Platform.OS === "web") {
        if (!userId) localStorage.removeItem("user_id");
        else localStorage.setItem("user_id", userId);
    } else {
        try {
            if (!userId) await SecureStore.deleteItemAsync("user_id");
            else await SecureStore.setItemAsync("user_id", userId);
        } catch (e) { }
    }
};

export const clearUserId = async (): Promise<void> => {
    await setUserId(null);
};

export const getTempPhoneNumber = async (): Promise<string | null> => {
    return await getStorageItemAsync("temp_phone_number");
};

export const setTempPhoneNumber = async (phoneNumber: string | null): Promise<void> => {
    if (Platform.OS === "web") {
        if (!phoneNumber) localStorage.removeItem("temp_phone_number");
        else localStorage.setItem("temp_phone_number", phoneNumber);
    } else {
        try {
            if (!phoneNumber) await SecureStore.deleteItemAsync("temp_phone_number");
            else await SecureStore.setItemAsync("temp_phone_number", phoneNumber);
        } catch (e) { }
    }
};

export const clearTempPhoneNumber = async (): Promise<void> => {
    await setTempPhoneNumber(null);
};

export const getPhoneNumberFromSources = async (): Promise<string | null> => {
    try {
        const tempPhone = await getTempPhoneNumber();
        if (tempPhone) return tempPhone;
        return null;
    } catch (error) { return null; }
};

// ------------------------------------------------------------------------
// NEWLY REGISTERED FLAG
// ------------------------------------------------------------------------
const NEWLY_REGISTERED_KEY = "newly_registered_user";

export const setNewlyRegisteredFlag = async (): Promise<void> => {
    try {
        if (Platform.OS === "web") {
            localStorage.setItem(NEWLY_REGISTERED_KEY, "true");
        } else {
            await AsyncStorage.setItem(NEWLY_REGISTERED_KEY, "true");
        }
    } catch (error) { console.error("Failed to set flag:", error); }
};

export const getNewlyRegisteredFlag = async (): Promise<boolean> => {
    try {
        if (Platform.OS === "web") {
            return localStorage.getItem(NEWLY_REGISTERED_KEY) === "true";
        } else {
            return (await AsyncStorage.getItem(NEWLY_REGISTERED_KEY)) === "true";
        }
    } catch (error) { return false; }
};

export const clearNewlyRegisteredFlag = async (): Promise<void> => {
    try {
        if (Platform.OS === "web") localStorage.removeItem(NEWLY_REGISTERED_KEY);
        else await AsyncStorage.removeItem(NEWLY_REGISTERED_KEY);
    } catch (error) { }
};

// ------------------------------------------------------------------------
// PORTAL ROUTING OVERRIDE (DELIVERY VS BUYER VS MERCHANT)
// ------------------------------------------------------------------------
export const setLastPortal = async (portal: 'delivery' | 'buyer' | 'merchant' | 'affiliate'): Promise<void> => {
    try {
        if (Platform.OS === "web") localStorage.setItem(STORAGE_KEYS.LAST_PORTAL, portal);
        else await AsyncStorage.setItem(STORAGE_KEYS.LAST_PORTAL, portal);
    } catch (error) { console.error("Failed to set portal:", error); }
};

export const getLastPortal = async (): Promise<string | null> => {
    try {
        if (Platform.OS === "web") return localStorage.getItem(STORAGE_KEYS.LAST_PORTAL);
        else return await AsyncStorage.getItem(STORAGE_KEYS.LAST_PORTAL);
    } catch (error) { return null; }
};