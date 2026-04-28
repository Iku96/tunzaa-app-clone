import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { API_CONFIG } from "./config";
import { saveTokens, clearTokens } from "@/utils/storage";
import { parseApiError } from "./error-handler";
import {
  OTPRequestBody,
  OTPRequestResponse,
  OTPVerifyBody,
  OTPVerifyResponse,
  RegisterBody,
  LoginBody,
  AuthResponse,
  PasswordResetRequestBody,
  PasswordResetRequestResponse,
  PasswordResetConfirmBody,
  PasswordResetConfirmResponse,
  CreateVendorBody,
  CreateDeliveryPartnerBody,
  FirebaseLoginBody,
  FirebaseTokenBody,
  FirebaseTokenResponse,
  FirebaseTokenStatusBody,
  FirebaseTokenStatusResponse,
} from "./types";

export const authApi = {
  // OTP Request
  requestOTP: async (data: OTPRequestBody): Promise<OTPRequestResponse> => {
    const response = await apiClient.post("auth/otp/request", data);
    return response.data;
  },

  // OTP Verification
  verifyOTP: async (data: OTPVerifyBody): Promise<OTPVerifyResponse> => {
    const response = await apiClient.post("auth/otp/verify", data);
    return response.data;
  },

  // User Registration
  register: async (data: RegisterBody): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "auth/register",
      data
    );
    return response.data;
  },

  // User Login
  login: async (data: LoginBody): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("auth/login", data);
    return response.data;
  },

  // Update User Profile
  updateUser: async (
    userId: string,
    data: { first_name?: string; last_name?: string; preferred_language?: string }
  ): Promise<any> => {
    const response = await apiClient.put(`users/${userId}`, data);
    return response.data;
  },

  // Get User Details
  getUserDetails: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`users/${userId}`);
    return response.data;
  },

  //Disable / Delete user (Self)
  disableUser: async (): Promise<any> => {
    const response = await apiClient.delete(`auth/me`);
    return response.data;
  },

  // Create Vendor Profile
  createVendor: async (userId: string, vendorData: CreateVendorBody) => {
    const response = await apiClient.post("marketplace/vendors", {
      ...vendorData,
    });
    return response.data;
  },

  // ✅ Update Vendor Profile
  updateVendor: async (
    vendorId: string,
    vendorData: Partial<CreateVendorBody>
  ) => {
    const response = await apiClient.put(
      `marketplace/vendors/${vendorId}`,
      vendorData
    );
    return response.data;
  },

  // Create Delivery Partner Profile
  createDeliveryPartner: async (
    userId: string,
    partnerData: CreateDeliveryPartnerBody
  ) => {
    const response = await apiClient.post("partners/", {
      ...partnerData,
    });
    return response.data;
  },

  // ✅ Update Delivery Partner Profile
  updateDeliveryPartner: async (
    partnerId: string,
    partnerData: Partial<CreateDeliveryPartnerBody>
  ) => {
    const response = await apiClient.put(
      `partners/${partnerId}`,
      partnerData
    );
    return response.data;
  },

  // Password Reset Request
  requestPasswordReset: async (
    data: PasswordResetRequestBody
  ): Promise<PasswordResetRequestResponse> => {
    const response = await apiClient.post<PasswordResetRequestResponse>(
      "auth/password/reset/request",
      data
    );
    return response.data;
  },

  // Password Reset Confirmation
  confirmPasswordReset: async (
    data: PasswordResetConfirmBody
  ): Promise<PasswordResetConfirmResponse> => {
    const response = await apiClient.post<PasswordResetConfirmResponse>(
      "auth/password/reset/confirm",
      data
    );
    return response.data;
  },

  // Firebase Social Login
  firebaseLogin: async (data: FirebaseLoginBody): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "auth/firebase/login",
      data
    );
    return response.data;
  },

  // Register Firebase Token for Push Notifications
  addFirebaseToken: async (
    data: FirebaseTokenBody
  ): Promise<FirebaseTokenResponse> => {
    const response = await apiClient.post<FirebaseTokenResponse>(
      "auth/add-firebase-token",
      data
    );
    return response.data;
  },

  // Update Firebase Token Status
  updateFirebaseTokenStatus: async (
    data: FirebaseTokenStatusBody
  ): Promise<FirebaseTokenStatusResponse> => {
    const response = await apiClient.patch<FirebaseTokenStatusResponse>(
      "auth/firebase-token/status",
      data
    );
    return response.data;
  },

  // Remove Firebase Token
  removeFirebaseToken: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      "auth/firebase-token",
      { data: { token } }
    );
    return response.data;
  },

  // Save tokens securely
  saveTokens: async (accessToken: string, refreshToken: string) => {
    await saveTokens(accessToken, refreshToken);
  },

  // Clear tokens securely
  clearTokens: async () => {
    await clearTokens();
  },
};

// ---------------------------
// React Query Hooks
// ---------------------------

export const useRequestOTP = () => {
  return useMutation({
    mutationFn: authApi.requestOTP,
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: authApi.verifyOTP,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      await authApi.saveTokens(data.access_token, data.refresh_token);
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await authApi.saveTokens(data.access_token, data.refresh_token);
    },
    onError: (error: any) => {
      console.error("Login error:", error.message);
    },
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { first_name?: string; last_name?: string; preferred_language?: string };
    }) => authApi.updateUser(userId, data),
  });
};

export const useGetUserDetails = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["userDetails", userId],
    queryFn: () => authApi.getUserDetails(userId),
    enabled: enabled && !!userId,
  });
};

export const useCreateVendor = () => {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: CreateVendorBody;
    }) => authApi.createVendor(userId, data),
  });
};

// ✅ New hook: Update Vendor
export const useUpdateVendor = () => {
  return useMutation({
    mutationFn: ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: Partial<CreateVendorBody>;
    }) => authApi.updateVendor(vendorId, data),
  });
};

export const useCreateDeliveryPartner = () => {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: CreateDeliveryPartnerBody;
    }) => authApi.createDeliveryPartner(userId, data),
  });
};

// ✅ New hook: Update Delivery Partner
export const useUpdateDeliveryPartner = () => {
  return useMutation({
    mutationFn: ({
      partnerId,
      data,
    }: {
      partnerId: string;
      data: Partial<CreateDeliveryPartnerBody>;
    }) => authApi.updateDeliveryPartner(partnerId, data),
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: authApi.requestPasswordReset,
  });
};

export const useConfirmPasswordReset = () => {
  return useMutation({
    mutationFn: authApi.confirmPasswordReset,
  });
};

export const useFirebaseLogin = () => {
  return useMutation({
    mutationFn: authApi.firebaseLogin,
    onSuccess: async (data) => {
      await authApi.saveTokens(data.access_token, data.refresh_token);
    },
  });
};

export const useAddFirebaseToken = () => {
  return useMutation({
    mutationFn: authApi.addFirebaseToken,
  });
};

export const useUpdateFirebaseTokenStatus = () => {
  return useMutation({
    mutationFn: authApi.updateFirebaseTokenStatus,
  });
};

export const useRemoveFirebaseToken = () => {
  return useMutation({
    mutationFn: authApi.removeFirebaseToken,
  });
};
