import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { API_CONFIG } from "./config";
import { saveTokens, clearTokens } from "../utils/storage";
import {
    OTPRequestBody, OTPRequestResponse, OTPVerifyBody, OTPVerifyResponse,
    RegisterBody, LoginBody, AuthResponse, PasswordResetRequestBody,
    PasswordResetRequestResponse, PasswordResetConfirmBody, PasswordResetConfirmResponse,
    CreateVendorBody, CreateDeliveryPartnerBody, FirebaseLoginBody,
    FirebaseTokenBody, FirebaseTokenResponse, FirebaseTokenStatusBody, FirebaseTokenStatusResponse,
} from "./types";

export const authApi = {
    // ---- Auth & Core Identity ----
    requestOTP: async (data: OTPRequestBody): Promise<OTPRequestResponse> => (await apiClient.post("/auth/otp/request", data)).data,
    verifyOTP: async (data: OTPVerifyBody): Promise<OTPVerifyResponse> => (await apiClient.post("/auth/otp/verify", data)).data,

    register: async (data: RegisterBody): Promise<AuthResponse> => {
        const payload = { ...data, email: data.email || `${data.phone_number}@${API_CONFIG.TENANT_ID}.com` };
        return (await apiClient.post<AuthResponse>("/auth/register", payload)).data;
    },

    login: async (data: LoginBody): Promise<AuthResponse> => (await apiClient.post<AuthResponse>("/auth/login", data)).data,

    updateUser: async (userId: string, data: any): Promise<any> => (await apiClient.put(`/users/${userId}`, data)).data,
    updateUserProfile: async (userId: string, profileId: string, data: any): Promise<any> => (await apiClient.put(`/users/${userId}/profile/${profileId}`, data)).data,
    updatePassword: async (userId: string, data: any): Promise<any> => (await apiClient.put(`/users/${userId}/password`, data)).data,
    getUserDetails: async (userId: string): Promise<any> => (await apiClient.get(`/users/${userId}`)).data,

    // ---- Marketplace Vendor ----
    createVendor: async (userId: string, vendorData: CreateVendorBody) => (await apiClient.post("/marketplace/vendors", { ...vendorData, user_id: userId })).data,
    updateVendor: async (vendorId: string, vendorData: Partial<CreateVendorBody>) => (await apiClient.put(`/marketplace/vendors/${vendorId}`, vendorData)).data,

    // 🚀 TunzaaPay Merchant APIs (Now correctly routed through /v1 Gateway)
    submitMerchantApplication: async (applicationData: any) => (await apiClient.post("/accounts/merchant/application", applicationData)).data,
    updateMerchantApplication: async (applicationData: any) => (await apiClient.put("/accounts/merchant/application/update", applicationData)).data,
    getMerchantProfile: async () => (await apiClient.get("/accounts/merchant/profile")).data,
    updateMerchantProfile: async (profileData: any) => (await apiClient.put("/accounts/merchant/profile/update", profileData)).data,

    // ---- Delivery Partner ----
    createDeliveryPartner: async (userId: string, partnerData: CreateDeliveryPartnerBody) => (await apiClient.post("/partners/", { ...partnerData, user_id: userId })).data,
    updateDeliveryPartner: async (partnerId: string, partnerData: Partial<CreateDeliveryPartnerBody>) => (await apiClient.put(`/partners/${partnerId}`, partnerData)).data,

    // ---- Utilities ----
    requestPasswordReset: async (data: PasswordResetRequestBody) => (await apiClient.post("/auth/password/reset/request", data)).data,
    confirmPasswordReset: async (data: PasswordResetConfirmBody) => (await apiClient.post("/auth/password/reset/confirm", data)).data,
    firebaseLogin: async (data: FirebaseLoginBody) => (await apiClient.post("/auth/firebase/login", data)).data,
    addFirebaseToken: async (data: FirebaseTokenBody) => (await apiClient.post("/auth/add-firebase-token", data)).data,
    updateFirebaseTokenStatus: async (data: FirebaseTokenStatusBody) => (await apiClient.patch("/auth/firebase-token/status", data)).data,
    removeFirebaseToken: async (token: string) => (await apiClient.delete("/auth/firebase-token", { data: { token } })).data,

    saveTokens: async (accessToken: string, refreshToken: string) => await saveTokens(accessToken, refreshToken),
    clearTokens: async () => await clearTokens(),
};

// React Query Hooks
export const useRequestOTP = () => useMutation({ mutationFn: authApi.requestOTP });
export const useVerifyOTP = () => useMutation({ mutationFn: authApi.verifyOTP });
export const useRegister = () => useMutation({ mutationFn: authApi.register, onSuccess: async (data) => await authApi.saveTokens(data.access_token, data.refresh_token) });
export const useLogin = () => useMutation({ mutationFn: authApi.login, onSuccess: async (data) => await authApi.saveTokens(data.access_token, data.refresh_token) });
export const useUpdateUser = () => useMutation({ mutationFn: ({ userId, data }: any) => authApi.updateUser(userId, data) });
export const useUpdateUserProfile = () => useMutation({ mutationFn: ({ userId, profileId, data }: any) => authApi.updateUserProfile(userId, profileId, data) });
export const useUpdatePassword = () => useMutation({ mutationFn: ({ userId, data }: any) => authApi.updatePassword(userId, data) });
export const useGetUserDetails = (userId: string, enabled: boolean = true) => useQuery({ queryKey: ["userDetails", userId], queryFn: () => authApi.getUserDetails(userId), enabled: enabled && !!userId });

export const useCreateVendor = () => useMutation({ mutationFn: ({ userId, data }: any) => authApi.createVendor(userId, data) });
export const useUpdateVendor = () => useMutation({ mutationFn: ({ vendorId, data }: any) => authApi.updateVendor(vendorId, data) });
export const useCreateDeliveryPartner = () => useMutation({ mutationFn: ({ userId, data }: any) => authApi.createDeliveryPartner(userId, data) });
export const useUpdateDeliveryPartner = () => useMutation({ mutationFn: ({ partnerId, data }: any) => authApi.updateDeliveryPartner(partnerId, data) });