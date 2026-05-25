import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  BuyerProfile,
  UpdateBuyerProfileBody,
  UpdateBuyerProfileResponse,
} from "./types/buyers";

export const buyersApi = {
  getBuyerProfile: async (userId: string): Promise<BuyerProfile> => {
    try {
      const response = await apiClient.get<BuyerProfile>(
        `/marketplace/buyers/user/${userId}`
      );
      return response.data;
    } catch (error: any) {
      if (error?.originalError?.response?.status === 404 || error?.response?.status === 404) {
        console.log(`ℹ️ [buyersApi] Buyer profile not found for user ${userId}, returning default empty profile.`);
        return {
          user_id: userId,
          tenant_id: '',
          contact_email: '',
          contact_phone: '',
          delivery_address: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      throw error;
    }
  },

  // Update User's Delivery Addresses
  updateBuyerProfile: async (
    userId: string,
    data: UpdateBuyerProfileBody
  ): Promise<UpdateBuyerProfileResponse> => {
    const response = await apiClient.put<UpdateBuyerProfileResponse>(
      `/marketplace/buyers`,
      data
    );
    return response.data;
  },
};

// React Query Hooks

export const useGetBuyerProfile = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["buyerProfile", userId],
    queryFn: () => buyersApi.getBuyerProfile(userId),
    enabled: enabled && !!userId,
  });
};

export const useUpdateBuyerProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateBuyerProfileBody;
    }) => buyersApi.updateBuyerProfile(userId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch buyer profile data
      queryClient.invalidateQueries({ queryKey: ["buyerProfile", variables.userId] });
    },
  });
};
