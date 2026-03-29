import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { authApi } from '../services/auth';
import { socialAuth } from '../services/social-auth';
import { uploadApi } from '../services/upload';
import { vendorsApi } from '../services/vendors';
import { saveTokens, clearTokens, getAccessToken, getUserId, setUserId } from '../utils/storage';
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
    created_at?: string;
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
    getUserDetails: (explicitUserId?: string) => Promise<any>;
    refreshProfile: () => Promise<void>;

    // Vendor / Delivery Partner
    createVendor: (vendorData: CreateVendorBody, explicitUserId?: string) => Promise<any>;
    updateVendor: (vendorId: string, profileId: string, vendorData: Partial<CreateVendorBody>) => Promise<any>;
    createDeliveryPartner: (partnerData: CreateDeliveryPartnerBody, explicitUserId?: string) => Promise<any>;

    // Internal Helpers
    changePassword: (data: { current_password: string; new_password: string }) => Promise<any>;
    saveAuthResponse: (authResponse: AuthResponse) => Promise<TunzaaUser>;
}

const TunzaaAuthContext = createContext<TunzaaAuthContextType | null>(null);

// ---- Push Notifications Setup ----
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Use device token explicitly since it asks for Firebase token
        const tokenResponse = await Notifications.getDevicePushTokenAsync();
        token = tokenResponse.data;
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

// ---- Provider ----

export function TunzaaAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<TunzaaUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Use device token explicitly since it asks for Firebase token
            const tokenResponse = await Notifications.getDevicePushTokenAsync();
            token = tokenResponse.data;
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    // Restore session on mount
    useEffect(() => {
        restoreSession();

        // Push Notifications Foreground/Background Setup
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log("Foreground OS Push Notification Received", notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("User Tapped OS Push Notification", response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    // Monitor for Login Success & Bind Push Token to Backend
    useEffect(() => {
        if (user && user.user_id) {
            registerForPushNotificationsAsync().then(token => {
                if (token) {
                    console.log("Registering FCM Push Token to Tunzaa Backend", token);
                    authApi.addFirebaseToken({
                        token: String(token),
                        device_type: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web'
                    })
                        .catch(err => console.error("Failed to register Push Token:", err));
                }
            });
        }
    }, [user?.user_id]);

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
    const storeUserData = useCallback(async (authResponse: any) => {
        console.log(`💾 [AuthContext] Storing user data for ${authResponse.user_id || authResponse.id}`);
        
        // Robustly handle different response formats (flat, nested 'user' object, or JSON-string 'user')
        let userData = authResponse;
        if (typeof authResponse.user === 'string') {
            try {
                userData = JSON.parse(authResponse.user);
            } catch (e) {
                console.error('❌ [AuthContext] Failed to parse nested user string:', e);
            }
        } else if (authResponse.user && typeof authResponse.user === 'object') {
            userData = authResponse.user;
        }

        // Normalize profiles: prefer metadata.business_name over generic display_name,
        // and ensure both snake_case and camelCase fields are present
        const rawProfiles = authResponse.profiles || userData.profiles || [];
        const normalizedProfiles = rawProfiles.map((p: any) => {
            const meta = p.metadata || {};
            const resolvedDisplayName = meta.business_name || p.display_name || p.displayName || '';
            return {
                ...p,
                profile_id: p.profile_id || p.profileId,
                profileId: p.profileId || p.profile_id,
                display_name: resolvedDisplayName,
                displayName: resolvedDisplayName,
            };
        });

        const tunzaaUser: TunzaaUser = {
            id: authResponse.id || userData.id || userData.user_id,
            user_id: authResponse.user_id || userData.user_id || userData.id,
            first_name: authResponse.first_name || userData.first_name || '',
            last_name: authResponse.last_name || userData.last_name || '',
            name: authResponse.name || userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
            email: authResponse.email || userData.email,
            phone_number: authResponse.phone_number || userData.phone_number,
            is_active: authResponse.is_active ?? userData.is_active,
            is_verified: authResponse.is_verified ?? userData.is_verified,
            activeProfileRole: authResponse.activeProfileRole || authResponse.active_profile_role || userData.active_profile_role || userData.activeProfileRole,
            profiles: normalizedProfiles,
            roles: authResponse.roles || userData.roles || [],
            permissions: authResponse.permissions || userData.permissions || [],
            tenant_id: authResponse.tenant_id || userData.tenant_id,
            provider: authResponse.provider || userData.provider,
            firebase_uid: authResponse.firebase_uid || userData.firebase_uid,
            created_at: authResponse.created_at || userData.created_at,
        };

        setUser(tunzaaUser);

        try {
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(tunzaaUser)),
                setUserId(authResponse.user_id),
                saveTokens(authResponse.access_token, authResponse.refresh_token),
            ]);
            console.log('✅ [AuthContext] User data and tokens saved successfully');
        } catch (e) {
            console.error('❌ [AuthContext] Failed to save user data:', e);
        }

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
        
        // Update local user data & persist it
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        } catch (e) {
            console.error('❌ [AuthContext] Failed to persist updated user data:', e);
        }
        
        return response;
    }, [user]);

    const getUserDetails = useCallback(async (explicitUserId?: string) => {
        const idToUse = explicitUserId || user?.user_id;
        if (!idToUse) {
            console.warn('⚠️ [AuthContext] getUserDetails called without userId or authenticated session');
            throw new Error('Not authenticated');
        }
        return await authApi.getUserDetails(idToUse);
    }, [user]);

    // Refresh profile data from server (needed after creating vendor/delivery profiles)
    const refreshProfile = useCallback(async () => {
        if (!user) return;
        try {
            const freshData = await authApi.getUserDetails(user.user_id);

            // Normalize profiles so both snake_case and camelCase fields are present
            const normalizedProfiles = (freshData.profiles || user.profiles || []).map((p: any) => ({
                ...p,
                profile_id: p.profile_id || p.profileId,
                profileId: p.profileId || p.profile_id,
                display_name: p.display_name || p.displayName,
                displayName: p.displayName || p.display_name,
            }));

            // Merge fresh server data with existing user data
            const updatedUser: TunzaaUser = {
                ...user,
                ...freshData,
                profiles: normalizedProfiles,
                roles: freshData.roles || user.roles,
                is_verified: freshData.is_verified ?? user.is_verified,
                activeProfileRole: freshData.activeProfileRole || freshData.active_profile_role || user.activeProfileRole,
            };
            setUser(updatedUser);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        }
    }, [user]);

    // ---- Vendor / Delivery Partner ----

    // Internal helper to restore session if missing but token exists
    const restoreSessionIfMissing = async (): Promise<TunzaaUser | null> => {
        if (user) return user;

        try {
            console.log('🔄 [AuthContext] State missing, attempting restoration...');

            // 1. Try AsyncStorage (Fast cache)
            const storedData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                console.log('✅ [AuthContext] Restored from AsyncStorage');
                setUser(parsed);
                return parsed;
            }

            // 2. If AsyncStorage empty, check SecureStore for UserId and Token
            const [storedUserId, token] = await Promise.all([
                getUserId(),
                getAccessToken()
            ]);

            if (storedUserId && token) {
                console.log(`🛰️ [AuthContext] Found UserId ${storedUserId} in SecureStore, fetching fresh details...`);
                try {
                    const freshData = await authApi.getUserDetails(storedUserId);
                    if (freshData) {
                        const restoredUser: TunzaaUser = {
                            ...freshData,
                            user_id: freshData.user_id || storedUserId,
                            activeProfileRole: freshData.activeProfileRole || freshData.active_profile_role,
                        };
                        setUser(restoredUser);
                        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(restoredUser));
                        console.log('✅ [AuthContext] Session recovered from server!');
                        return restoredUser;
                    }
                } catch (apiError: any) {
                    console.error('❌ [AuthContext] Server recovery failed:', apiError?.message || apiError);
                }
            } else {
                console.warn('⚠️ [AuthContext] No UserId or Token found in SecureStore');
            }
        } catch (e) {
            console.error('❌ [AuthContext] Self-healing failed:', e);
        }
        return null;
    };

    const updateVendor = useCallback(async (vendorId: string, profileId: string, vendorData: Partial<CreateVendorBody>) => {
        if (!user) throw new Error('Not authenticated');
        
        console.log(`📝 [AuthContext] updateVendor called for vendor: ${vendorId}, profile: ${profileId}`);

        let final_logo_url = (vendorData as any).store?.branding?.logo_url || (vendorData as any).logo_url;
        let final_banner_url = (vendorData as any).store?.banners?.[0] || (vendorData as any).banner_url;

        // 1. Handle Image Uploads if local URIs are provided
        try {
            if (final_logo_url && (final_logo_url.startsWith('file://') || final_logo_url.startsWith('content://'))) {
                console.log('📤 [AuthContext] Uploading logo...');
                const uploadRes = await uploadApi.uploadFile(final_logo_url, `logo_${vendorId}.jpg`);
                final_logo_url = uploadRes.url;
            }
            if (final_banner_url && (final_banner_url.startsWith('file://') || final_banner_url.startsWith('content://'))) {
                console.log('📤 [AuthContext] Uploading banner...');
                const uploadRes = await uploadApi.uploadFile(final_banner_url, `banner_${vendorId}.jpg`);
                final_banner_url = uploadRes.url;
            }
        } catch (uploadError) {
            console.error('❌ [AuthContext] Image upload failed:', uploadError);
            throw new Error('Failed to upload store images. Please try again.');
        }

        // 2. Optimistic Update (Local State)
        const vendorProfile = user.profiles.find(p => p.profile_id === profileId || p.profileId === profileId);
        const currentMetadata = vendorProfile?.metadata || {};

        const updatedProfiles = user.profiles.map(p => {
            if (p.profile_id === profileId || p.profileId === profileId) {
                const business_name = vendorData.business_name || vendorData.display_name || p.metadata?.business_name || (p as any).business_name;
                const extraMeta = (vendorData as any)._extra_metadata || {};
                
                return {
                    ...p,
                    display_name: vendorData.display_name || p.display_name,
                    displayName: vendorData.display_name || p.displayName,
                    metadata: {
                        ...p.metadata,
                        ...extraMeta,
                        business_name: business_name,
                        banner_url: final_banner_url || p.metadata?.banner_url,
                        logo_url: final_logo_url || p.metadata?.logo_url,
                        image_url: final_logo_url || p.metadata?.logo_url,
                        description: (vendorData as any).store?.description || (vendorData as any).description || p.metadata?.description,
                    }
                };
            }
            return p;
        });

        const optimisticallyUpdatedUser = { ...user, profiles: updatedProfiles };
        setUser(optimisticallyUpdatedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(optimisticallyUpdatedUser));

        try {
            // 3. Resolve the REAL marketplace vendor_id
            // If vendorId === profileId, it's likely a profile_id, not a marketplace vendor_id
            let resolvedVendorId = vendorId;
            if (vendorId === profileId) {
                console.log('⚠️ [AuthContext] vendorId === profileId, looking up real marketplace vendor_id...');
                try {
                    const vendorsResponse = await vendorsApi.getVendors({ limit: 50 });
                    const matchedVendor = vendorsResponse.items?.find(
                        (v: any) => v.user_id === user.user_id || v.user?.user_id === user.user_id
                    );
                    if (matchedVendor?.vendor_id) {
                        resolvedVendorId = matchedVendor.vendor_id;
                        console.log(`✅ [AuthContext] Found real marketplace vendor_id: ${resolvedVendorId}`);
                    } else {
                        console.warn('⚠️ [AuthContext] Could not find marketplace vendor, proceeding with profile_id');
                    }
                } catch (lookupError) {
                    console.warn('⚠️ [AuthContext] Vendor lookup failed:', lookupError);
                }
            }

            // 4. Parallel API calls (Marketplace + User Profile)
            const final_business_name = vendorData.business_name || vendorData.display_name || currentMetadata.business_name;
            const extraMetaForApi = (vendorData as any)._extra_metadata || {};

            const apiPromises: Promise<any>[] = [
                authApi.updateUserProfile(user.user_id, profileId, {
                    display_name: vendorData.display_name || final_business_name,
                    metadata: {
                        ...currentMetadata,
                        ...extraMetaForApi,
                        business_name: final_business_name,
                        banner_url: final_banner_url || currentMetadata.banner_url,
                        logo_url: final_logo_url || currentMetadata.logo_url,
                        image_url: final_logo_url || currentMetadata.logo_url,
                        description: (vendorData as any).store?.description || (vendorData as any).description || currentMetadata.description,
                        is_onboarded: true,
                        vendor_id: resolvedVendorId, // Always persist the resolved vendor_id
                    }
                })
            ];

            // Only call marketplace API if we have a real vendor_id
            if (resolvedVendorId && resolvedVendorId !== profileId) {
                apiPromises.push(
                    authApi.updateVendor(resolvedVendorId, {
                        ...vendorData,
                        business_name: final_business_name,
                        store: {
                            ...vendorData.store,
                            branding: {
                                ...vendorData.store?.branding,
                                logo_url: final_logo_url || currentMetadata.logo_url
                            },
                            banners: final_banner_url ? [final_banner_url] : (vendorData.store?.banners || (currentMetadata.banner_url ? [currentMetadata.banner_url] : []))
                        }
                    } as any)
                );
            }

            await Promise.all(apiPromises);

            console.log('✅ [AuthContext] Profile updated on server. Optimistic state is correct, skipping refreshProfile.');
            // DO NOT call refreshProfile here — the optimistic update (line ~371) is already correct.
            // refreshProfile would fetch potentially stale server data and overwrite the user's edit.
            return true;
        } catch (error) {
            console.error('❌ [AuthContext] updateVendor API failed, reverting to server state:', error);
            // On failure, revert optimistic update by fetching fresh data
            try { await refreshProfile(); } catch (_) {}
            throw error;
        }
    }, [user, refreshProfile]);

    const createVendor = useCallback(async (vendorData: CreateVendorBody, explicitUserId?: string) => {
        console.log('🏗️ [AuthContext] createVendor called');
        let userIdToUse = explicitUserId;
        let currentUser = user;

        if (!userIdToUse || !currentUser) {
            if (!currentUser) {
                console.log('🔄 [AuthContext] User state missing, attempting restoration before vendor action...');
                currentUser = await restoreSessionIfMissing();
            }
            userIdToUse = currentUser?.user_id;
        }

        if (!userIdToUse) {
            console.error('❌ [AuthContext] Vendor action failed: No userId provided and session could not be restored.');
            throw new Error('Authentication session expired. Please log in again.');
        }

        // ✅ CHECK IF VENDOR PROFILE ALREADY EXISTS
        const existingVendorProfile = currentUser?.profiles?.find(p => p.role === 'vendor');
        if (existingVendorProfile) {
            const vendorId = existingVendorProfile.profile_id || existingVendorProfile.profileId;
            const profileId = existingVendorProfile.profile_id || existingVendorProfile.profileId;
            console.log(`📝 [AuthContext] Vendor profile already exists (ID: ${vendorId}), updating via updateVendor context method...`);
            return await updateVendor(vendorId, profileId, vendorData);
        }

        console.log(`✅ [AuthContext] Proceeding with NEW vendor creation for user_id: ${userIdToUse}`);
        
        // 1. Handle Image Uploads for onboarding
        let logo_url = vendorData.store?.branding?.logo_url;
        let banner_url = vendorData.store?.banners?.[0];

        try {
            if (logo_url && (logo_url.startsWith('file://') || logo_url.startsWith('content://'))) {
                const uploadRes = await uploadApi.uploadFile(logo_url, 'vendor_logo.jpg');
                logo_url = uploadRes.url;
            }
            if (banner_url && (banner_url.startsWith('file://') || banner_url.startsWith('content://'))) {
                const uploadRes = await uploadApi.uploadFile(banner_url, 'vendor_banner.jpg');
                banner_url = uploadRes.url;
            }
        } catch (uploadError) {
            console.warn('⚠️ [AuthContext] Onboarding image upload failed, proceeding with local URIs:', uploadError);
        }

        const finalVendorData = {
            ...vendorData,
            store: {
                ...vendorData.store,
                branding: {
                    ...vendorData.store?.branding,
                    logo_url: logo_url || ''
                },
                banners: banner_url ? [banner_url] : (vendorData.store?.banners || [])
            }
        };

        const response = await authApi.createVendor(userIdToUse, finalVendorData);
        
        // After creation, we need to sync the metadata to the User Profile API
        // so that the sidebar/header show the correct info immediately.
        try {
            const newProfile = response.profiles?.find((p: any) => p.role === 'vendor') || 
                               response.user?.profiles?.find((p: any) => p.role === 'vendor');
            const profileId = newProfile?.profile_id || newProfile?.profileId;
            
            if (profileId) {
                const actualVendorId = response.vendor_id || response.id || response.data?.vendor_id || response.data?.id;
                console.log(`🔄 [AuthContext] Syncing metadata for NEW vendor profile: ${profileId}, vendorId: ${actualVendorId}`);
                
                await authApi.updateUserProfile(userIdToUse, profileId, {
                    display_name: vendorData.display_name || vendorData.business_name,
                    metadata: {
                        business_name: vendorData.business_name,
                        banner_url: banner_url || '',
                        logo_url: logo_url || '',
                        image_url: logo_url || '',
                        description: vendorData.store?.description || (vendorData as any).description,
                        is_onboarded: true,
                        vendor_id: actualVendorId 
                    }
                });
            }
        } catch (syncError) {
            console.warn('⚠️ [AuthContext] Failed to sync metadata after vendor creation:', syncError);
        }

        // Final refresh to ensure context state is perfectly in sync
        // But we wait a bit for the server to catch up
        setTimeout(() => refreshProfile(), 1000);
        
        return response;
    }, [user, restoreSessionIfMissing, refreshProfile, updateVendor]);

    const createDeliveryPartner = useCallback(async (partnerData: CreateDeliveryPartnerBody) => {
        console.log('🏗️ [AuthContext] createDeliveryPartner called');
        let currentUser = user;
        
        if (!currentUser) {
            console.log('🔄 [AuthContext] User state missing, attempting restoration before partner creation...');
            currentUser = await restoreSessionIfMissing();
        }

        if (!currentUser) {
            console.error('❌ [AuthContext] Partner creation failed: User session could not be restored.');
            throw new Error('Authentication session expired. Please log in again.');
        }

        console.log(`✅ [AuthContext] Proceeding with partner creation for user_id: ${currentUser.user_id}`);
        return await authApi.createDeliveryPartner(currentUser.user_id, partnerData);
    }, [user, restoreSessionIfMissing]);

    const changePassword = useCallback(async (data: { current_password: string; new_password: string }) => {
        if (!user) throw new Error('Not authenticated');
        return await authApi.updatePassword(user.user_id, data);
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
        refreshProfile,
        createVendor,
        updateVendor,
        createDeliveryPartner,
        changePassword,
        saveAuthResponse: storeUserData,
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
