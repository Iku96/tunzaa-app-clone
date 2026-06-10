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

// Request interceptor - attach auth token and log request
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
        const tenantId = config.headers["X-Tenant-ID"];
        console.log(`🌐 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`📋 [Request Headers]`, JSON.stringify(config.headers));
        if (config.data) {
            console.log(`📝 [Request Data]`, JSON.stringify(config.data));
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response logging
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';

        // Auth endpoints that should NOT trigger token refresh on 401
        const isAuthEndpoint = [
            '/auth/login', '/auth/register', '/auth/otp/',
            '/auth/password/reset', '/auth/password-reset',
            '/auth/firebase/login', '/auth/verify-otp',
        ].some(path => requestUrl.includes(path));

        // Auto-refresh on 401 (ONLY for protected endpoints, not auth endpoints)
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                const refreshToken = await getRefreshToken();

                if (refreshToken) {
                    const response = await apiClient.post(
                        "/auth/refresh",
                        { refresh_token: refreshToken },
                        { _retry: true } as any
                    );

                    await setAccessToken(response.data.access_token);
                    await setRefreshToken(response.data.refresh_token);

                    originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError: any) {
                console.error("❌ [API Client] Token refresh failed:", refreshError?.message || refreshError);
                console.warn("⚠️ [API Client] Clearing session due to refresh failure");
                await clearTokens();
                await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
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

// Document upload client - FIXED: Added fallback to BASE_URL to prevent "Network Error"
export const documentClient = axios.create({
    baseURL: API_CONFIG.DOCUMENT_UPLOAD_URL || API_CONFIG.BASE_URL,
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
    (response) => {
        console.log(`✅ [Document Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        console.log(`📦 [Document Data]`, JSON.stringify(response.data));
        return response;
    },
    (error) => {
        console.error("📄 Document Upload Error:", {
            url: error.config?.url,
            status: error.response?.status,
            errorMessage: error.message,
            responseData: error.response?.data
        });

        const parsedError = parseApiError(error);
        const enhancedError = new Error(parsedError.message);
        (enhancedError as any).apiError = parsedError;
        (enhancedError as any).originalError = error;
        return Promise.reject(enhancedError);
    }
);