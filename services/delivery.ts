import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  DeliveryType,
  DeliveryTypesResponse,
  GetDeliveryPartnersResponse,
  GetDeliveryPartnersParams,
  Delivery,
  GetDeliveriesResponse,
  GetDeliveriesParams,
  UpdateDeliveryStageBody,
  AddProofBody,
  UpdateDeliveryPartnerStatusBody,
} from "./types/delivery";
import { FALLBACK_DELIVERY_TYPES } from "@/config/delivery-types";

export const deliveryApi = {
  // Get Delivery Types
  getDeliveryTypes: async (): Promise<DeliveryTypesResponse> => {
    const response = await apiClient.get<DeliveryTypesResponse>("deliveries/types/?is_active=true");
    return response.data;
  },

  // Get/Search Delivery Partners
  getDeliveryPartners: async (
    params?: GetDeliveryPartnersParams
  ): Promise<GetDeliveryPartnersResponse> => {
    const searchParams = new URLSearchParams({
      is_active: "true", // Always true as per requirements
    });

    if (params?.partner_type) {
      searchParams.append("partner_type", params.partner_type);
    }
    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    // Note: Not including kyc_verified as per requirements

    const response = await apiClient.get<GetDeliveryPartnersResponse>(
      `partners/?${searchParams.toString()}`
    );
    return response.data;
  },

  // Fetch Deliveries
  getDeliveries: async (
    params?: GetDeliveriesParams
  ): Promise<GetDeliveriesResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.partner_id) {
      searchParams.append("partner_id", params.partner_id);
    }
    if (params?.stage) {
      searchParams.append("stage", params.stage);
    }
    if (params?.include_order_numbers) {
      searchParams.append("include_order_numbers", params.include_order_numbers.toString());
    }
    if (params?.include_partner_names) {
      searchParams.append("include_partner_names", params.include_partner_names.toString());
    }
    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }

    const response = await apiClient.get<GetDeliveriesResponse>(
      `deliveries/?${searchParams.toString()}`
    );
    return response.data;
  },

  // Fetch a delivery by its ID
  getDelivery: async (deliveryId: string): Promise<Delivery> => {
    const response = await apiClient.get<Delivery>(`deliveries/${deliveryId}`);
    return response.data;
  },

  // Fetch a delivery by order ID
  getDeliveryByOrderId: async (orderId: string): Promise<Delivery> => {
    const response = await apiClient.get<Delivery>(`deliveries/order/${orderId}`);
    return response.data;
  },

  // Update Delivery stage by delivery id
  updateDeliveryStage: async (
    deliveryId: string,
    data: UpdateDeliveryStageBody
  ): Promise<Delivery> => {
    const response = await apiClient.post<Delivery>(
      `deliveries/${deliveryId}/stages`,
      data
    );
    return response.data;
  },

  // Add Proof of delivery by delivery id
  addDeliveryProof: async (
    deliveryId: string,
    data: AddProofBody
  ): Promise<void> => {
    const response = await apiClient.post(
      `deliveries/${deliveryId}/proof`,
      data
    );
    return response.data;
  },

  // Get Delivery Partner by Profile ID
  getDeliveryPartner: async (profileId: string): Promise<any> => {
    const response = await apiClient.get(`partners/${profileId}`);
    return response.data;
  },

  // Update Delivery Partner Status
  updateDeliveryPartnerStatus: async (
    partnerId: string,
    data: UpdateDeliveryPartnerStatusBody
  ): Promise<void> => {
    console.log("data", data);
    const response = await apiClient.patch(
      `partners/${partnerId}/status`,
      data
    );
    console.log("response", response.data);
    return response.data;
  },
};

// React Query Hooks

export const useGetDeliveryTypes = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["deliveryTypes"],
    queryFn: () => deliveryApi.getDeliveryTypes(),
    enabled,
    retry: 2, // Retry up to 2 times
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

// Hook that provides delivery types with fallback
export const useDeliveryTypesWithFallback = (enabled: boolean = true) => {
  const { data, isLoading, error, isError } = useGetDeliveryTypes(enabled);

  // If API fails or returns no data, use fallback
  const deliveryTypes = data?.items && data.items.length > 0
    ? data.items
    : FALLBACK_DELIVERY_TYPES;

  return {
    data: deliveryTypes,
    isLoading,
    error,
    isError,
    isUsingFallback: isError || !data?.items || data.items.length === 0,
  };
};

export const useGetDeliveryPartners = (
  params?: GetDeliveryPartnersParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["deliveryPartners", params],
    queryFn: () => deliveryApi.getDeliveryPartners(params),
    enabled,
  });
};

export const useGetDeliveries = (
  params?: GetDeliveriesParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["deliveries", params],
    queryFn: () => deliveryApi.getDeliveries(params),
    enabled,
  });
};

export const useGetDelivery = (deliveryId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["delivery", deliveryId],
    queryFn: () => deliveryApi.getDelivery(deliveryId),
    enabled: enabled && !!deliveryId,
  });
};

export const useGetDeliveryByOrderId = (orderId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["deliveryByOrderId", orderId],
    queryFn: () => deliveryApi.getDeliveryByOrderId(orderId),
    enabled: enabled && !!orderId,
  });
};

export const useUpdateDeliveryStage = () => {
  return useMutation({
    mutationFn: ({
      deliveryId,
      data,
    }: {
      deliveryId: string;
      data: UpdateDeliveryStageBody;
    }) => deliveryApi.updateDeliveryStage(deliveryId, data),
  });
};

export const useAddDeliveryProof = () => {
  return useMutation({
    mutationFn: ({
      deliveryId,
      data,
    }: {
      deliveryId: string;
      data: AddProofBody;
    }) => deliveryApi.addDeliveryProof(deliveryId, data),
  });
};

export const useGetDeliveryPartner = (
  profileId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["deliveryPartner", profileId],
    queryFn: () => deliveryApi.getDeliveryPartner(profileId),
    enabled: enabled && !!profileId,
  });
};

export const useUpdateDeliveryPartnerStatus = () => {
  return useMutation({
    mutationFn: ({
      partnerId,
      data,
    }: {
      partnerId: string;
      data: UpdateDeliveryPartnerStatusBody;
    }) => deliveryApi.updateDeliveryPartnerStatus(partnerId, data),
  });
};
