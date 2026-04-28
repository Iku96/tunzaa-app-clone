/**
 * Affiliate (Winga) Service API
 * Connects to the winga-service backend for affiliate signup, profile, and updates.
 * Replaces hardcoded data in affiliate screens.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

// ---- Types ----

export type AffiliateStatus = "pending" | "active" | "suspended" | "rejected";

export interface AffiliateCreate {
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    social_media_links?: Record<string, string>;
    bio?: string;
    profile_picture?: string;
}

export interface AffiliateUpdate {
    name?: string;
    email?: string;
    phone?: string;
    social_media_links?: Record<string, string>;
    bio?: string;
    profile_picture?: string;
    status?: AffiliateStatus;
}

export interface Affiliate {
    id: string;
    user_id: string;
    tenant_id: string;
    name: string;
    email: string;
    phone?: string;
    social_media_links?: Record<string, string>;
    bio?: string;
    profile_picture?: string;
    status: AffiliateStatus;
    referral_code?: string;
    total_referrals?: number;
    total_earnings?: number;
    created_at: string;
    updated_at: string;
}

export interface AffiliateList {
    affiliates: Affiliate[];
    total: number;
}

// ---- API Functions ----

export const affiliateApi = {
    /** Sign up as a new affiliate */
    signup: async (data: AffiliateCreate): Promise<Affiliate> => {
        const response = await apiClient.post<Affiliate>("/winga/signup", data);
        return response.data;
    },

    /** Get affiliate details by user ID */
    getAffiliate: async (userId: string): Promise<Affiliate> => {
        const response = await apiClient.get<Affiliate>(`/winga/${userId}`);
        return response.data;
    },

    /** Update affiliate profile */
    updateAffiliate: async (
        affiliateId: string,
        data: AffiliateUpdate
    ): Promise<Affiliate> => {
        const response = await apiClient.patch<Affiliate>(
            `/winga/${affiliateId}`,
            data
        );
        return response.data;
    },

    /** List affiliates (admin only) */
    listAffiliates: async (params?: {
        skip?: number;
        limit?: number;
        status?: AffiliateStatus;
    }): Promise<AffiliateList> => {
        const response = await apiClient.get<AffiliateList>("/winga", { params });
        return response.data;
    },
};

// ---- React Query Hooks ----

/** Fetch affiliate profile by user ID */
export const useAffiliate = (userId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["affiliate", userId],
        queryFn: () => affiliateApi.getAffiliate(userId),
        enabled: enabled && !!userId,
    });
};

/** Mutation: sign up as affiliate */
export const useSignupAffiliate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: affiliateApi.signup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["affiliate"] });
        },
    });
};

/** Mutation: update affiliate profile */
export const useUpdateAffiliate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            affiliateId,
            data,
        }: {
            affiliateId: string;
            data: AffiliateUpdate;
        }) => affiliateApi.updateAffiliate(affiliateId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["affiliate"] });
        },
    });
};
