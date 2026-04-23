import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  RewardConfig,
  UserBalance,
  GetBalanceParams,
  RedeemPointsBody,
  RedeemPointsResponse,
  GenerateReferralCodeResponse,
  ApplyReferralCodeBody,
  ApplyReferralCodeResponse,
  ReferralCode,
} from "./types/rewards";

export const rewardsApi = {
  // Configuration Management
  getRewardConfig: async (): Promise<RewardConfig> => {
    const response = await apiClient.get<RewardConfig>("rewards/config");
    return response.data;
  },

  // Point Balance & History
  getUserBalance: async (params: GetBalanceParams = {}): Promise<UserBalance> => {
    const response = await apiClient.get<UserBalance>("/rewards/balance", {
      params: {
        include_history: params.include_history,
        limit: params.limit,
      },
    });
    return response.data;
  },

  // Redeeming Points
  redeemPoints: async (data: RedeemPointsBody): Promise<RedeemPointsResponse> => {
    const response = await apiClient.post<RedeemPointsResponse>("rewards/redeem", data);
    return response.data;
  },

  // Referral System
  generateReferralCode: async (): Promise<GenerateReferralCodeResponse> => {
    const response = await apiClient.post<GenerateReferralCodeResponse>("referrals/code");
    console.log("Generate referral code response:", JSON.stringify(response.data, null, 2));
    return response.data;
  },

  applyReferralCode: async (data: ApplyReferralCodeBody): Promise<ApplyReferralCodeResponse> => {
    const response = await apiClient.post<ApplyReferralCodeResponse>("referrals/apply", data);
    return response.data;
  },

  // Get User's Referral Code (single code)
  getUserReferralCode: async (): Promise<ReferralCode> => {
    const response = await apiClient.post<ReferralCode>("referrals/code");
    return response.data;
  },

  // Get User's Referral Codes (legacy - for backward compatibility)
  getUserReferralCodes: async (): Promise<ReferralCode[]> => {
    const response = await apiClient.get<ReferralCode[]>("referrals/codes");
    return response.data;
  },

  // Validate Referral Code
  validateReferralCode: async (code: string): Promise<{ valid: boolean; message: string }> => {
    const response = await apiClient.get<{ valid: boolean; message: string }>(`referrals/validate/${code}`);
    return response.data;
  },
};

// React Query Keys
export const rewardsKeys = {
  all: ["rewards"] as const,
  config: () => [...rewardsKeys.all, "config"] as const,
  balance: (params?: GetBalanceParams) => [...rewardsKeys.all, "balance", params] as const,
  referralCode: () => [...rewardsKeys.all, "referral-code"] as const,
  referralCodes: () => [...rewardsKeys.all, "referral-codes"] as const,
  validateReferral: (code: string) => [...rewardsKeys.all, "validate-referral", code] as const,
};

// React Query Hooks

// Configuration Hooks
export const useRewardConfig = () => {
  return useQuery({
    queryKey: rewardsKeys.config(),
    queryFn: rewardsApi.getRewardConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};



// Balance Hooks
export const useUserBalance = (params: GetBalanceParams = {}) => {
  return useQuery({
    queryKey: rewardsKeys.balance(params),
    queryFn: () => rewardsApi.getUserBalance(params),
    staleTime: 30 * 1000, // 30 seconds - balance changes frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};



// Points Redemption Hooks
export const useRedeemPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardsApi.redeemPoints,
    onSuccess: () => {
      // Invalidate balance queries to reflect redeemed points
      queryClient.invalidateQueries({ queryKey: rewardsKeys.balance() });
    },
  });
};

// Referral Code Hooks
export const useReferralCode = (enabled: boolean = true) => {
  return useQuery({
    queryKey: rewardsKeys.referralCode(),
    queryFn: rewardsApi.getUserReferralCode,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (no referral code exists)
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useGenerateReferralCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardsApi.generateReferralCode,
    onSuccess: () => {
      // Invalidate referral code to show new code
      queryClient.invalidateQueries({ queryKey: rewardsKeys.referralCode() });
      // Also invalidate the old codes query for backward compatibility
      queryClient.invalidateQueries({ queryKey: rewardsKeys.referralCodes() });
    },
  });
};

export const useApplyReferralCode = () => {
  return useMutation({
    mutationFn: rewardsApi.applyReferralCode,
  });
};



export const useUserReferralCodes = () => {
  return useQuery({
    queryKey: rewardsKeys.referralCodes(),
    queryFn: rewardsApi.getUserReferralCodes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useValidateReferralCode = (code: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: rewardsKeys.validateReferral(code),
    queryFn: () => rewardsApi.validateReferralCode(code),
    enabled: enabled && !!code,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Utility Functions
export const rewardsUtils = {
  // Calculate points from order amount
  calculatePoints: (orderAmount: number, pointsPerHundred: number = 1): number => {
    return Math.floor(orderAmount / 100) * pointsPerHundred;
  },

  // Calculate coupon value from points
  // Calculate coupon value from points
  calculateCouponValue: (points: number, redemptionPoints: number = 100, redemptionValue: number = 500): number => {
    return (points / redemptionPoints) * redemptionValue;
  },

  // Format points display
  formatPoints: (points: number): string => {
    return new Intl.NumberFormat('en-US').format(points);
  },

  // Format currency display
  formatCurrency: (amount: number, currency: string = 'TZS'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Check if points are valid for redemption
  isValidRedemption: (points: number, redemptionRate: number = 100): boolean => {
    return points > 0 && points % redemptionRate === 0;
  },

  // Generate referral code display format
  formatReferralCode: (code: string): string => {
    return code.replace(/_/g, ' ');
  },

  // Calculate days until expiry
  getDaysUntilExpiry: (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  // Check if coupon is expired
  isCouponExpired: (expiryDate: string): boolean => {
    return new Date(expiryDate) < new Date();
  },
};

// Export all types for convenience
export type {
  RewardConfig,
  UserBalance,
  GetBalanceParams,
  RedeemPointsBody,
  RedeemPointsResponse,
  GenerateReferralCodeResponse,
  ApplyReferralCodeBody,
  ApplyReferralCodeResponse,
  ReferralCode,
} from "./types/rewards";