import { useEffect, useCallback, useReducer } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

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
        try {
            if (value === null) {
                await SecureStore.deleteItemAsync(key);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch (e) {
            console.error("SecureStore error:", e);
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
                try {
                    const val = await SecureStore.getItemAsync(key);
                    setState(val);
                } catch (e) {
                    console.error("SecureStore error:", e);
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
