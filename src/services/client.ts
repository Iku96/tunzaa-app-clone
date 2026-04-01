import axios from "axios";
import { API_CONFIG, STORAGE_KEYS } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
    clearTokens,
} from "../utils/storage";
import { parseApiError, ErrorResponse } from "./error-handler";

/**
 * Axios API Client for Tunzaa Multi-Tenant REST API
 * Features:
 * - Auto-attaches JWT Bearer token
 * - Auto-refreshes expired tokens via /auth/refresh
 * - Parses errors into user-friendly messages
 * - Separate document upload client
 */
export const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        ...API_CONFIG.HEADERS,
        "X-Tenant-ID": API_CONFIG.TENANT_ID,
    },
});

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error getting auth token:", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// State to manage synchronized token refresh
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Response interceptor - token refresh + error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Extract URL
        const requestUrl = originalRequest.url || '';
        const isAuthRoute = requestUrl.includes('/auth/login') || 
                            requestUrl.includes('/auth/register') || 
                            requestUrl.includes('/auth/refresh') ||
                            requestUrl.includes('/auth/otp/request') ||
                            requestUrl.includes('/auth/otp/verify') ||
                            requestUrl.includes('/auth/firebase/login');

        // Auto-refresh on 401, but NOT if the 401 came from an authentication endpoint itself
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
            
            // If we're already refreshing, wait for the existing promise
            if (isRefreshing) {
                console.log("⏳ [API Client] Waiting for ongoing token refresh...");
                try {
                    const newToken = await refreshPromise;
                    if (newToken) {
                        originalRequest._retry = true;
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    }
                } catch (queueError) {
                    return Promise.reject(queueError);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            // Create the refresh promise so other requests can join
            refreshPromise = (async () => {
                try {
                    console.log("🔑 [API Client] Refreshing token...");
                    const refreshToken = await getRefreshToken();

                    if (!refreshToken) {
                        throw new Error("No refresh token available");
                    }

                    const response = await axios.post(
                        `${API_CONFIG.BASE_URL}/auth/refresh`,
                        { refresh_token: refreshToken },
                        { 
                            headers: { 
                                ...API_CONFIG.HEADERS,
                                "X-Tenant-ID": API_CONFIG.TENANT_ID 
                            } 
                        }
                    );

                    const { access_token, refresh_token } = response.data;
                    await setAccessToken(access_token);
                    await setRefreshToken(refresh_token);
                    
                    console.log("✅ [API Client] Token refreshed successfully");
                    return access_token;
                } catch (refreshError: any) {
                    console.error("❌ [API Client] Token refresh failed:", refreshError?.message || refreshError);
                    console.warn("⚠️ [API Client] Clearing session due to refresh failure");
                    
                    await clearTokens();
                    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
                    
                    // Throw to reject all waiting requests
                    throw refreshError;
                } finally {
                    isRefreshing = false;
                    refreshPromise = null;
                }
            })();

            try {
                const newToken = await refreshPromise;
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (retryError) {
                // Fall through to standard error parsing
            }
        }

        // Parse and enhance error with user-friendly messages
        const parsedError = parseApiError(error);
        const enhancedError = new Error(parsedError.message);
        (enhancedError as any).apiError = parsedError;
        (enhancedError as any).originalError = error;
        return Promise.reject(enhancedError);
    }
);

// Document upload client
export const documentClient = axios.create({
    baseURL: API_CONFIG.DOCUMENT_UPLOAD_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

// Auth interceptor for document client
documentClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error getting auth token:", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Error handling for document client
documentClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("📄 Document Upload Error:", {
            url: error.config?.url,
            status: error.response?.status,
            errorMessage: error.message,
        });

        const parsedError = parseApiError(error);
        const enhancedError = new Error(parsedError.message);
        (enhancedError as any).apiError = parsedError;
        (enhancedError as any).originalError = error;
        return Promise.reject(enhancedError);
    }
);
