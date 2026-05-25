import { useEffect, useCallback, useReducer } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UseStateHook<T> = [
  [boolean, T | null],
  (value: T | null) => Promise<void>
];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
  return useReducer(
    (
      state: [boolean, T | null],
      action: T | null = null
    ): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    const useSecure = key.includes("Token");
    try {
      if (useSecure) {
        if (value === null) {
          await SecureStore.deleteItemAsync(key);
        } else {
          await SecureStore.setItemAsync(key, value);
        }
      } else {
        if (value === null) {
          await AsyncStorage.removeItem(key);
        } else {
          await AsyncStorage.setItem(key, value);
        }
      }
    } catch (e) {
      console.error(`${useSecure ? "SecureStore" : "AsyncStorage"} error for key ${key}:`, e);
    }
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();

  // Get
  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        try {
          const val = localStorage.getItem(key);
          setState(val);
        } catch (e) {
          console.error("Local storage is unavailable:", e);
          setState(null);
        }
      } else {
        const useSecure = key.includes("Token");
        try {
          const val = useSecure
            ? await SecureStore.getItemAsync(key)
            : await AsyncStorage.getItem(key);
          setState(val);
        } catch (e) {
          console.error(`${useSecure ? "SecureStore" : "AsyncStorage"} error for key ${key}:`, e);
          setState(null);
        }
      }
    })();
  }, [key]);

  // Set
  const setValue = useCallback(
    async (value: string | null) => {
      setState(value);
      await setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}

