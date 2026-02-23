import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/auth';
import { socialAuth } from '../services/social-auth';
import { saveTokens, clearTokens, getAccessToken } from '../utils/storage';
import { STORAGE_KEYS } from '../services/config';
import type {
    AuthResponse,
    UserRole,
    OTPRequestResponse,
    OTPVerifyResponse,
    RegisterBody,
    LoginBody,
    PasswordResetRequestBody,
    PasswordResetRequestResponse,
    PasswordResetConfirmBody,
    PasswordResetConfirmResponse,
    CreateVendorBody,
    CreateDeliveryPartnerBody,
} from '../services/types';

// ---- Types ----

export interface TunzaaUser {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string | null;
    phone_number: string;
    is_active?: boolean;
    is_verified: boolean;
    activeProfileRole: UserRole;
    profiles: Array<{
        profileId: string;
        profile_id: string;
        role: string;
        displayName: string | null;
        display_name: string | null;
        is_active: boolean;
        metadata: Record<string, any>;
    }>;
    roles: { role: string; description: string }[];
    permissions?: string[];
    tenant_id: string;
    provider: string;
    firebase_uid: string | null;
}

interface TunzaaAuthContextType {
    // State
    user: TunzaaUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // OTP
    requestOTP: (phoneNumber: string) => Promise<OTPRequestResponse>;
    verifyOTP: (phoneNumber: string, otp: string) => Promise<OTPVerifyResponse>;

    // Auth
    register: (data: RegisterBody) => Promise<AuthResponse>;
    login: (identifier: string, password: string, isPhone?: boolean) => Promise<AuthResponse>;
    logout: () => Promise<void>;

    // Social Auth
    signInWithGoogle: () => Promise<AuthResponse | null>;
    signInWithApple: () => Promise<AuthResponse | null>;

    // Password Reset
    requestPasswordReset: (data: PasswordResetRequestBody) => Promise<PasswordResetRequestResponse>;
    confirmPasswordReset: (data: PasswordResetConfirmBody) => Promise<PasswordResetConfirmResponse>;

    // User Management
    updateUser: (data: { first_name?: string; last_name?: string; preferred_language?: string }) => Promise<any>;
    getUserDetails: () => Promise<any>;

    // Vendor / Delivery Partner
    createVendor: (vendorData: CreateVendorBody) => Promise<any>;
    createDeliveryPartner: (partnerData: CreateDeliveryPartnerBody) => Promise<any>;
}

const TunzaaAuthContext = createContext<TunzaaAuthContextType | null>(null);

// ---- Provider ----

export function TunzaaAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<TunzaaUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    // Restore session on mount
    useEffect(() => {
        restoreSession();
    }, []);

    const restoreSession = async () => {
        try {
            const token = await getAccessToken();
            if (token) {
                // Try to get stored user data
                const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            }
        } catch (error) {
            console.error('Failed to restore session:', error);
        } finally {
            setIsLoading(false);
        }
    };



    // Store user data from AuthResponse
    const storeUserData = useCallback(async (authResponse: AuthResponse) => {
        const tunzaaUser: TunzaaUser = {
            id: authResponse.id,
            user_id: authResponse.user_id,
            first_name: authResponse.first_name,
            last_name: authResponse.last_name,
            name: authResponse.name,
            email: authResponse.email,
            phone_number: authResponse.phone_number,
            is_active: authResponse.is_active,
            is_verified: authResponse.is_verified,
            activeProfileRole: authResponse.activeProfileRole || authResponse.active_profile_role,
            profiles: authResponse.profiles,
            roles: authResponse.roles,
            permissions: authResponse.permissions,
            tenant_id: authResponse.tenant_id,
            provider: authResponse.provider,
            firebase_uid: authResponse.firebase_uid,
        };

        setUser(tunzaaUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(tunzaaUser));
        await saveTokens(authResponse.access_token, authResponse.refresh_token);

        return tunzaaUser;
    }, []);

    // ---- OTP ----

    const requestOTP = useCallback(async (phoneNumber: string) => {
        return await authApi.requestOTP({ phone_number: phoneNumber });
    }, []);

    const verifyOTP = useCallback(async (phoneNumber: string, otp: string) => {
        return await authApi.verifyOTP({ phone_number: phoneNumber, otp });
    }, []);

    // ---- Auth ----

    const register = useCallback(async (data: RegisterBody) => {
        const response = await authApi.register(data);
        await storeUserData(response);
        return response;
    }, [storeUserData]);

    const login = useCallback(async (identifier: string, password: string, isPhone: boolean = true) => {
        const response = await authApi.login({
            identifier,
            password,
            is_phone: isPhone,
        });
        await storeUserData(response);
        return response;
    }, [storeUserData]);

    const logout = useCallback(async () => {
        try {
            await clearTokens();
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            await socialAuth.signOutGoogle();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    }, []);

    // ---- Social Auth ----

    const signInWithGoogle = useCallback(async () => {
        const response = await socialAuth.signInWithGoogle();
        if (response) {
            await storeUserData(response);
        }
        return response;
    }, [storeUserData]);

    const signInWithApple = useCallback(async () => {
        const response = await socialAuth.signInWithApple();
        if (response) {
            await storeUserData(response);
        }
        return response;
    }, [storeUserData]);

    // ---- Password Reset ----

    const requestPasswordReset = useCallback(async (data: PasswordResetRequestBody) => {
        return await authApi.requestPasswordReset(data);
    }, []);

    const confirmPasswordReset = useCallback(async (data: PasswordResetConfirmBody) => {
        return await authApi.confirmPasswordReset(data);
    }, []);

    // ---- User Management ----

    const updateUser = useCallback(async (data: { first_name?: string; last_name?: string; preferred_language?: string }) => {
        if (!user) throw new Error('Not authenticated');
        const response = await authApi.updateUser(user.user_id, data);
        // Update local user data
        setUser(prev => prev ? { ...prev, ...data } : null);
        return response;
    }, [user]);

    const getUserDetails = useCallback(async () => {
        if (!user) throw new Error('Not authenticated');
        return await authApi.getUserDetails(user.user_id);
    }, [user]);

    // ---- Vendor / Delivery Partner ----

    const createVendor = useCallback(async (vendorData: CreateVendorBody) => {
        if (!user) throw new Error('Not authenticated');
        return await authApi.createVendor(user.user_id, vendorData);
    }, [user]);

    const createDeliveryPartner = useCallback(async (partnerData: CreateDeliveryPartnerBody) => {
        if (!user) throw new Error('Not authenticated');
        return await authApi.createDeliveryPartner(user.user_id, partnerData);
    }, [user]);

    // ---- Context Value ----

    const value: TunzaaAuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        requestOTP,
        verifyOTP,
        register,
        login,
        logout,
        signInWithGoogle,
        signInWithApple,
        requestPasswordReset,
        confirmPasswordReset,
        updateUser,
        getUserDetails,
        createVendor,
        createDeliveryPartner,
    };

    return (
        <TunzaaAuthContext.Provider value={value}>
            {children}
        </TunzaaAuthContext.Provider>
    );
}

// ---- Hook ----

export function useTunzaaAuth() {
    const context = useContext(TunzaaAuthContext);
    if (!context) {
        throw new Error('useTunzaaAuth must be used within a TunzaaAuthProvider');
    }
    return context;
}
