import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";
import { TenantResponse } from "./types";
import { API_CONFIG, STORAGE_KEYS } from "./config";

export const tenantApi = {
  getTenant: async (): Promise<TenantResponse> => {
    console.log("🔄 [Tenant API] getTenant called - fetching tenant config");

    // Check cache first
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.TENANT_CONFIG);
      if (cached) {
        console.log("📦 [Tenant API] Found cached config, returning cache");
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Error reading tenant cache:", error);
    }

    try {
      console.log("🌐 [Tenant API] No cache found, making API call to:", `tenants/${API_CONFIG.TENANT_ID}`);
      const response = await apiClient.get<TenantResponse>(
        `tenants/${API_CONFIG.TENANT_ID}`,
        {
          headers: {
            // Remove tenant header for this specific request
            "X-Tenant-ID": undefined as any,
          },
        }
      );

      console.log("✅ [Tenant API] API call successful, caching response");

      // Cache the response
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.TENANT_CONFIG,
          JSON.stringify(response.data)
        );
      } catch (error) {
        console.error("Error caching tenant config:", error);
      }

      return response.data;
    } catch (apiError) {
      console.error("❌ [Tenant API] API call failed:", apiError);
      throw apiError;
    }
  },

  clearCache: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TENANT_CONFIG);
    } catch (error) {
      console.error("Error clearing tenant cache:", error);
    }
  },
};

// React Query Hook
export const useTenant = () => {
  const query = useQuery({
    queryKey: ["tenant"],
    queryFn: tenantApi.getTenant,
    staleTime: Infinity, // Never refetch automatically
    gcTime: Infinity, // Keep in cache forever (was cacheTime in v4)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return query;
};
