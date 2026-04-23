import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  CreateAffiliateBody,
  AffiliateResponse,
  GetAffiliateResponse,
  UpdateAffiliateBody,
  CreateVendorRequestBody,
  CreateProductRequestBody,
  AffiliateRequestResponse,
  ApproveRequestBody,
  RejectRequestBody,
  ReferralLinkResponse,
  GetAffiliateLinksResponse,
  TrackOrderBody,
  OrderTrackingResponse,
  AffiliateStatsResponse,
  GetAffiliateRequestsParams,
  GetAffiliateRequestsResponse,
  GetVendorRequestsParams,
  GetVendorRequestsResponse,
} from "./types/affiliates";

export const affiliatesApi = {
  // Create Affiliate
  createAffiliate: async (
    data: CreateAffiliateBody
  ): Promise<AffiliateResponse> => {
    const response = await apiClient.post<AffiliateResponse>(
      "winga/signup",
      data
    );
    return response.data;
  },

  // Get Affiliate by ID
  getAffiliate: async (affiliateId: string): Promise<GetAffiliateResponse> => {
    const response = await apiClient.get<GetAffiliateResponse>(
      `winga/${affiliateId}`
    );
    return response.data;
  },

  // Update Affiliate
  updateAffiliate: async (
    affiliateId: string,
    data: UpdateAffiliateBody
  ): Promise<AffiliateResponse> => {
    const response = await apiClient.patch<AffiliateResponse>(
      `winga/${affiliateId}`,
      data
    );
    return response.data;
  },



  // Create Vendor Request
  createVendorRequest: async (
    data: CreateVendorRequestBody
  ): Promise<AffiliateRequestResponse> => {
    const response = await apiClient.post<AffiliateRequestResponse>(
      "winga/request/vendor",
      data
    );
    return response.data;
  },

  // Create Product Request
  createProductRequest: async (
    data: CreateProductRequestBody
  ): Promise<AffiliateRequestResponse> => {
    const response = await apiClient.post<AffiliateRequestResponse>(
      "winga/request/product",
      data
    );
    return response.data;
  },

  // Get Affiliate Requests
  getAffiliateRequests: async (
    params: GetAffiliateRequestsParams
  ): Promise<GetAffiliateRequestsResponse> => {
    const { affiliate_id, status, skip = 0, limit = 100 } = params;
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (status) {
      queryParams.append("status", status);
    }

    const response = await apiClient.get<GetAffiliateRequestsResponse>(
      `winga/affiliate/${affiliate_id}/requests?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get Request Details
  getRequestDetails: async (
    requestId: string
  ): Promise<AffiliateRequestResponse> => {
    const response = await apiClient.get<AffiliateRequestResponse>(
      `winga/request/${requestId}`
    );
    return response.data;
  },

  // Approve Request (Vendor Only)
  approveRequest: async (
    requestId: string,
    data: ApproveRequestBody
  ): Promise<AffiliateRequestResponse> => {
    const response = await apiClient.post<AffiliateRequestResponse>(
      `winga/request/${requestId}/approve`,
      data
    );
    return response.data;
  },

  // Reject Request (Vendor Only)
  rejectRequest: async (
    requestId: string,
    data: RejectRequestBody
  ): Promise<AffiliateRequestResponse> => {
    const response = await apiClient.post<AffiliateRequestResponse>(
      `winga/request/${requestId}/reject`,
      data
    );
    return response.data;
  },

  // Get Vendor Requests (for vendors to see affiliate requests)
  getVendorRequests: async (
    params: GetVendorRequestsParams
  ): Promise<GetVendorRequestsResponse> => {
    const { vendor_id, status, skip = 0, limit = 100 } = params;
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (status) {
      queryParams.append("status", status);
    }

    const response = await apiClient.get<GetVendorRequestsResponse>(
      `winga/vendor/${vendor_id}/requests?${queryParams.toString()}`
    );
    return response.data;
  },

  // Create Referral Link
  createReferralLink: async (
    requestId: string
  ): Promise<ReferralLinkResponse> => {
    const response = await apiClient.post<ReferralLinkResponse>(
      `winga/link/${requestId}`
    );
    return response.data;
  },

  // Get Affiliate Links
  getAffiliateLinks: async (
    affiliateId: string,
    params: { skip?: number; limit?: number } = {}
  ): Promise<GetAffiliateLinksResponse> => {
    const { skip = 0, limit = 100 } = params;
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<GetAffiliateLinksResponse>(
      `winga/affiliate/${affiliateId}/links?${queryParams.toString()}`
    );
    return response.data;
  },

  // Track Referral Link Click (This is typically handled by the server via redirect)
  trackReferralClick: async (code: string): Promise<void> => {
    // This endpoint typically redirects to the target URL and sets tracking cookies
    // For mobile apps, you might want to call this to track the click before navigating
    await apiClient.get(`winga/link/${code}`);
  },

  // Track Order Event
  trackOrderEvent: async (
    data: TrackOrderBody
  ): Promise<OrderTrackingResponse> => {
    const response = await apiClient.post<OrderTrackingResponse>(
      "winga/event/order",
      data
    );
    return response.data;
  },

  // Get Affiliate Statistics
  getAffiliateStats: async (
    affiliateId: string
  ): Promise<AffiliateStatsResponse> => {
    const response = await apiClient.get<AffiliateStatsResponse>(
      `winga/affiliate/${affiliateId}/stats`
    );
    return response.data;
  },




};

// React Query Hooks

export const useCreateAffiliate = () => {
  return useMutation({
    mutationFn: affiliatesApi.createAffiliate,
  });
};

export const useGetAffiliate = (
  affiliateId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["affiliate", affiliateId],
    queryFn: () => affiliatesApi.getAffiliate(affiliateId),
    enabled: enabled && !!affiliateId,
  });
};

export const useUpdateAffiliate = () => {
  return useMutation({
    mutationFn: ({ affiliateId, data }: { affiliateId: string; data: UpdateAffiliateBody }) =>
      affiliatesApi.updateAffiliate(affiliateId, data),
  });
};



export const useCreateVendorRequest = () => {
  return useMutation({
    mutationFn: affiliatesApi.createVendorRequest,
  });
};

export const useCreateProductRequest = () => {
  return useMutation({
    mutationFn: affiliatesApi.createProductRequest,
  });
};

export const useGetAffiliateRequests = (
  params: GetAffiliateRequestsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      "affiliateRequests",
      params.affiliate_id,
      params.status,
      params.skip,
      params.limit,
    ],
    queryFn: () => affiliatesApi.getAffiliateRequests(params),
    enabled: enabled && !!params.affiliate_id,
  });
};

export const useGetRequestDetails = (
  requestId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["requestDetails", requestId],
    queryFn: () => affiliatesApi.getRequestDetails(requestId),
    enabled: enabled && !!requestId,
  });
};

export const useApproveRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: ApproveRequestBody }) =>
      affiliatesApi.approveRequest(requestId, data),
  });
};

export const useRejectRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: RejectRequestBody }) =>
      affiliatesApi.rejectRequest(requestId, data),
  });
};

export const useGetVendorRequests = (
  params: GetVendorRequestsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      "vendorRequests",
      params.vendor_id,
      params.status,
      params.skip,
      params.limit,
    ],
    queryFn: () => affiliatesApi.getVendorRequests(params),
    enabled: enabled && !!params.vendor_id,
  });
};

export const useCreateReferralLink = () => {
  return useMutation({
    mutationFn: affiliatesApi.createReferralLink,
  });
};

export const useGetAffiliateLinks = (
  affiliateId: string,
  params: { skip?: number; limit?: number } = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      "affiliateLinks",
      affiliateId,
      params.skip,
      params.limit,
    ],
    queryFn: () => affiliatesApi.getAffiliateLinks(affiliateId, params),
    enabled: enabled && !!affiliateId,
  });
};

export const useTrackReferralClick = () => {
  return useMutation({
    mutationFn: affiliatesApi.trackReferralClick,
  });
};

export const useTrackOrderEvent = () => {
  return useMutation({
    mutationFn: affiliatesApi.trackOrderEvent,
  });
};

export const useGetAffiliateStats = (
  affiliateId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["affiliateStats", affiliateId],
    queryFn: () => affiliatesApi.getAffiliateStats(affiliateId),
    enabled: enabled && !!affiliateId,
  });
};




