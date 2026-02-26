import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { API_CONFIG } from "./config";
import { saveTokens, clearTokens } from "../utils/storage";
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

/**
 * Auth API - all authentication and user management endpoints
 * Connects to Tunzaa multi-tenant REST API
 */
export const authApi = {
    // ---- OTP ----

    /** Request OTP for phone verification */
    requestOTP: async (data: OTPRequestBody): Promise<OTPRequestResponse> => {
        const response = await apiClient.post("/auth/otp/request", data);
        return response.data;
    },

    /** Verify OTP code */
    verifyOTP: async (data: OTPVerifyBody): Promise<OTPVerifyResponse> => {
        const response = await apiClient.post("/auth/otp/verify", data);
        return response.data;
    },

    // ---- Auth ----

    /** Register new user */
    register: async (data: RegisterBody): Promise<AuthResponse> => {
        const payload = {
            ...data,
            email: data.email || `${data.phone_number}@${API_CONFIG.TENANT_ID}.com`,
        };
        const response = await apiClient.post<AuthResponse>("/auth/register", payload);
        return response.data;
    },

    /** Login with phone/email + password */
    login: async (data: LoginBody): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/auth/login", data);
        return response.data;
    },

    // ---- User Management ----

    /** Update user info (first_name, last_name, etc.) */
    updateUser: async (
        userId: string,
        data: { first_name?: string; last_name?: string; preferred_language?: string }
    ): Promise<any> => {
        const response = await apiClient.put(`/users/${userId}`, data);
        return response.data;
    },

    /** Update a specific role profile (e.g. buyer, vendor) */
    updateUserProfile: async (
        userId: string,
        profileId: string,
        data: { display_name?: string; is_active?: boolean; metadata?: Record<string, any> }
    ): Promise<any> => {
        const response = await apiClient.put(`/users/${userId}/profile/${profileId}`, data);
        return response.data;
    },

    /** Change password (requires current password) */
    updatePassword: async (
        userId: string,
        data: { current_password: string; new_password: string }
    ): Promise<any> => {
        const response = await apiClient.put(`/users/${userId}/password`, data);
        return response.data;
    },

    /** Get user details */
    getUserDetails: async (userId: string): Promise<any> => {
        const response = await apiClient.get(`/users/${userId}`);
        return response.data;
    },

    /** Disable/delete user */
    disableUser: async (): Promise<any> => {
        const response = await apiClient.delete(`/auth/me`);
        return response.data;
    },

    // ---- Vendor ----

    /** Create vendor profile */
    createVendor: async (userId: string, vendorData: CreateVendorBody) => {
        const response = await apiClient.post("/marketplace/vendors", {
            ...vendorData,
        });
        return response.data;
    },

    /** Update vendor profile */
    updateVendor: async (
        vendorId: string,
        vendorData: Partial<CreateVendorBody>
    ) => {
        const response = await apiClient.put(
            `/marketplace/vendors/${vendorId}`,
            vendorData
        );
        return response.data;
    },

    // ---- Delivery Partner ----

    /** Create delivery partner profile */
    createDeliveryPartner: async (
        userId: string,
        partnerData: CreateDeliveryPartnerBody
    ) => {
        const response = await apiClient.post("/partners/", {
            ...partnerData,
        });
        return response.data;
    },

    /** Update delivery partner profile */
    updateDeliveryPartner: async (
        partnerId: string,
        partnerData: Partial<CreateDeliveryPartnerBody>
    ) => {
        const response = await apiClient.put(
            `/partners/${partnerId}`,
            partnerData
        );
        return response.data;
    },

    // ---- Password Reset ----

    /** Request password reset */
    requestPasswordReset: async (
        data: PasswordResetRequestBody
    ): Promise<PasswordResetRequestResponse> => {
        const response = await apiClient.post<PasswordResetRequestResponse>(
            "/auth/password/reset/request",
            data
        );
        return response.data;
    },

    /** Confirm password reset */
    confirmPasswordReset: async (
        data: PasswordResetConfirmBody
    ): Promise<PasswordResetConfirmResponse> => {
        const response = await apiClient.post<PasswordResetConfirmResponse>(
            "/auth/password/reset/confirm",
            data
        );
        return response.data;
    },

    // ---- Firebase / Social Auth ----

    /** Social login via Firebase ID token */
    firebaseLogin: async (data: FirebaseLoginBody): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            "/auth/firebase/login",
            data
        );
        return response.data;
    },

    /** Register Firebase push notification token */
    addFirebaseToken: async (
        data: FirebaseTokenBody
    ): Promise<FirebaseTokenResponse> => {
        const response = await apiClient.post<FirebaseTokenResponse>(
            "/auth/add-firebase-token",
            data
        );
        return response.data;
    },

    /** Update Firebase token status */
    updateFirebaseTokenStatus: async (
        data: FirebaseTokenStatusBody
    ): Promise<FirebaseTokenStatusResponse> => {
        const response = await apiClient.patch<FirebaseTokenStatusResponse>(
            "/auth/firebase-token/status",
            data
        );
        return response.data;
    },

    /** Remove Firebase token */
    removeFirebaseToken: async (token: string): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(
            "/auth/firebase-token",
            { data: { token } }
        );
        return response.data;
    },

    // ---- Token Management ----

    /** Save tokens securely */
    saveTokens: async (accessToken: string, refreshToken: string) => {
        await saveTokens(accessToken, refreshToken);
    },

    /** Clear tokens securely */
    clearTokens: async () => {
        await clearTokens();
    },
};

// ===================================
// React Query Hooks
// ===================================

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

export const useUpdateUserProfile = () => {
    return useMutation({
        mutationFn: ({
            userId,
            profileId,
            data,
        }: {
            userId: string;
            profileId: string;
            data: { display_name?: string; is_active?: boolean; metadata?: Record<string, any> };
        }) => authApi.updateUserProfile(userId, profileId, data),
    });
};

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: ({
            userId,
            data,
        }: {
            userId: string;
            data: { current_password: string; new_password: string };
        }) => authApi.updatePassword(userId, data),
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
