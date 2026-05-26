import axios from "axios";
import { API_CONFIG, STORAGE_KEYS } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "@/utils/storage";
import { parseApiError, ErrorResponse } from "./error-handler";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...API_CONFIG.HEADERS,
    "X-Tenant-ID": API_CONFIG.TENANT_ID,
  },
});

// Request interceptor for auth token
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // console.log("FJ41: Error:", JSON.stringify(error.response?.data));

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (refreshToken) {

          // Implement token refresh
          const response = await apiClient.post(
            "auth/refresh",
            {
              refresh_token: refreshToken,
            },
            {
              // Don't retry refresh requests
              _retry: true,
            } as any
          );

          // Save new tokens using cross-platform utilities
          await setAccessToken(response.data.access_token);
          await setRefreshToken(response.data.refresh_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // Clear tokens using cross-platform utility
        await clearTokens();

        // Clear user data
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);

        // TODO: Trigger navigation to login screen
        // This would typically be done through an event emitter or global state
      }
    }

    // Parse and enhance error with user-friendly messages
    const parsedError = parseApiError(error);

    // Create a new error object with the parsed information
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

// Add auth interceptor to document client
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
  (error) => {
    return Promise.reject(error);
  }
);

// Add response logging to document client
documentClient.interceptors.response.use(
  (response) => {
    // Log successful document upload responses
    // console.log("📄 Document Upload Success:", {
    //   url: response.config.url,
    //   method: response.config.method?.toUpperCase(),
    //   status: response.status,
    //   statusText: response.statusText,
    //   data: response.data,
    //   headers: response.headers,
    //   requestId: response.headers['x-request-id'] || 'N/A'
    // });

    return response;
  },
  (error) => {
    // Log document upload errors
    console.error("📄 Document Upload Error:", {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      requestId: error.response?.headers?.['x-request-id'] || 'N/A',
      errorMessage: error.message
    });

    // Parse and enhance error with user-friendly messages
    const parsedError = parseApiError(error);

    // Create a new error object with the parsed information
    const enhancedError = new Error(parsedError.message);
    (enhancedError as any).apiError = parsedError;
    (enhancedError as any).originalError = error;

    return Promise.reject(enhancedError);
  }
);
