import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/auth';
import { socialAuth } from '../services/social-auth';
import { saveTokens, clearTokens, getAccessToken, getUserId, setUserId } from '../utils/storage';
import { STORAGE_KEYS } from '../services/config';
import type { AuthResponse as TunzaaUser, RegisterBody, LoginBody } from '../services/types';

const TunzaaAuthContext = createContext<any>(null);

const IS_MERCHANT = (role: string) => ['vendor', 'merchant', 'business'].includes(role.toLowerCase());
const IS_DELIVERY = (role: string) => ['delivery', 'driver', 'delivery_partner'].includes(role.toLowerCase());

export const TunzaaAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<TunzaaUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const userRef = useRef<TunzaaUser | null>(null);

    useEffect(() => { userRef.current = user; }, [user]);


    const storeUserData = useCallback(async (incomingData: any) => {
        let raw = incomingData.user || incomingData;
        if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch (e) { } }

        // Bug #7 fix: Filter out null/undefined/empty-string values from API response
        // to prevent overwriting good cached data with blank server responses
        const filteredRaw: any = {};
        for (const key of Object.keys(raw)) {
            if (raw[key] !== null && raw[key] !== undefined && raw[key] !== '') {
                filteredRaw[key]= raw[key];
            }
        }
        raw = { ...raw, ...filteredRaw };

        const existingProfiles = userRef.current?.profiles || [];
        const incomingProfiles = incomingData.profiles || raw.profiles || [];
        const finalProfiles = incomingProfiles.length > 0 ? incomingProfiles : existingProfiles;

        const normalizedProfiles = finalProfiles.map((p: any) => {
            const meta = p.metadata || {};
            const isBusiness = IS_MERCHANT(p.role) || IS_DELIVERY(p.role);
            const name = isBusiness 
                ? (meta.partner_name || meta.business_name || p.display_name || p.displayName || '')
                : (p.display_name || p.displayName || '');
            
            return { 
                ...p, 
                profile_id: p.profile_id || p.profileId, 
                profileId: p.profileId || p.profile_id, 
                display_name: name, 
                displayName: name 
            };
        });

        const activeRole = raw.activeProfileRole || raw.active_profile_role || userRef.current?.activeProfileRole || 'buyer';
        const activeProfile = normalizedProfiles.find((p: any) => p.role.toLowerCase() === activeRole.toLowerCase()) || normalizedProfiles[0];

        const updatedUser: TunzaaUser = {
            ...userRef.current, ...raw,
            id: raw.id || raw.user_id || userRef.current?.id,
            user_id: raw.user_id || raw.id || userRef.current?.user_id,
            // Don't pull role-specific display_name up to the user root — it bleeds across portals
            display_name: raw.first_name 
                ? `${raw.first_name} ${raw.last_name || ''}`.trim()
                : (userRef.current?.first_name 
                    ? `${userRef.current.first_name} ${userRef.current.last_name || ''}`.trim()
                    : 'User'),
            profiles: normalizedProfiles,
            activeProfileRole: activeRole,
        };

        setUser(updatedUser);

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
            if (updatedUser.user_id) await setUserId(updatedUser.user_id);
            if (typeof incomingData.access_token === 'string') await saveTokens(incomingData.access_token, incomingData.refresh_token);
        } catch (e) { }

        return updatedUser;
    }, []);

    // Stale-Aware Cache Restoration (Background Hydration)
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const token = await getAccessToken();
                const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
                
                if (token && userData) {
                    const parsedUser = JSON.parse(userData);
                    // 1. Instant Cache Load (Optimistic UI)
                    setUser(parsedUser); 
                    
                    // 2. Background Hydration (Reconciliation)
                    const idToFetch = parsedUser.id || parsedUser.user_id;
                    if (idToFetch) {
                        authApi.getUserDetails(idToFetch).then(freshData => {
                            if (freshData) storeUserData(freshData);
                        }).catch(err => console.log('⚠️ [Cache] Background hydration failed or offline:', err.message));
                    }
                } else {
                    await clearTokens();
                }
            } catch (error) { 
                console.error('Session Restoration Failed:', error); 
            } finally { 
                setIsLoading(false); 
            }
        };

        restoreSession();
    }, [storeUserData]);

    const value = {
        user, isAuthenticated: !!user, isLoading,
        requestOTP: (phone: string) => authApi.requestOTP({ phone_number: phone }),
        verifyOTP: (phone: string, otp: string) => authApi.verifyOTP({ phone_number: phone, otp }),
        register: async (data: RegisterBody, targetPortal?: string) => {
            const response = await authApi.register(data);
            
            const serverRole = (response.activeProfileRole || response.active_profile_role || '').toLowerCase();
            const hasVendor = response.profiles?.some((p: any) => IS_MERCHANT(p.role));
            const hasDelivery = response.profiles?.some((p: any) => IS_DELIVERY(p.role));

            let finalPortal = 'buyer';
            if (targetPortal === 'merchant' && (hasVendor || serverRole === 'vendor')) finalPortal = 'merchant';
            else if (targetPortal === 'delivery' && (hasDelivery || serverRole === 'delivery')) finalPortal = 'delivery';
            else if (IS_MERCHANT(serverRole)) finalPortal = 'merchant';
            else if (IS_DELIVERY(serverRole)) finalPortal = 'delivery';

            await AsyncStorage.setItem('LAST_PORTAL', finalPortal);
            return await storeUserData(response);
        },
        login: async (id: string, pass: string, isPhone: boolean = true, targetPortal?: string) => {
            const response = await authApi.login({ identifier: id, password: pass, is_phone: isPhone });
            
            const serverRole = (response.activeProfileRole || response.active_profile_role || '').toLowerCase();
            const hasVendor = response.profiles?.some((p: any) => IS_MERCHANT(p.role));
            const hasDelivery = response.profiles?.some((p: any) => IS_DELIVERY(p.role));

            let finalPortal = 'buyer';
            if (targetPortal === 'merchant' && (hasVendor || serverRole === 'vendor')) finalPortal = 'merchant';
            else if (targetPortal === 'delivery' && (hasDelivery || serverRole === 'delivery')) finalPortal = 'delivery';
            else if (IS_MERCHANT(serverRole) || hasVendor) finalPortal = 'merchant';
            else if (IS_DELIVERY(serverRole) || hasDelivery) finalPortal = 'delivery';
            
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_PORTAL, finalPortal);
            return await storeUserData(response);
        },
        logout: async () => { 
            await clearTokens(); 
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            // Bug #1, #2, #3: Clear ALL session-specific keys on logout
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.LAST_PORTAL,
                STORAGE_KEYS.IS_FIRST_TIME_BUYER,
                STORAGE_KEYS.TEMP_ONBOARDING_SHOP_NAME,
                STORAGE_KEYS.TEMP_ONBOARDING_PHONE,
                STORAGE_KEYS.TEMP_ONBOARDING_DESCRIPTION,
                STORAGE_KEYS.TEMP_ONBOARDING_LOGO,
                STORAGE_KEYS.TEMP_ONBOARDING_COVER,
                STORAGE_KEYS.TEMP_ONBOARDING_LOCATION,
                STORAGE_KEYS.TEMP_ONBOARDING_FIRST_NAME,
                STORAGE_KEYS.TEMP_ONBOARDING_LAST_NAME,
                STORAGE_KEYS.ONBOARDING_CACHE,
            ]);
            await socialAuth.signOutGoogle(); 
            setUser(null); 
            console.log('🔑 [Logout] Session fully cleared (tokens + portal + onboarding flags)');
        },
        updateUser: async (data: any) => {
            const previousState = userRef.current;
            try {
                // 1. Bug #9 fix: Optimistic update through storeUserData for normalization
                await storeUserData({ ...previousState, ...data });
                
                // 2. Persist to API
                if (previousState?.user_id) {
                    await authApi.updateUser(previousState.user_id, data);
                }
            } catch (e: any) {
                console.error("⚠️ [AuthContext] updateUser API failed, rolling back UI", e.message);
                // 3. Rollback UI on failure
                setUser(previousState);
                if (previousState) await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(previousState));
                throw e;
            } finally {
                // 4. Reconciliation: Always fetch truth from server
                if (previousState?.user_id) {
                    const freshData = await authApi.getUserDetails(previousState.user_id);
                    if (freshData) await storeUserData(freshData);
                }
            }
        },
        refreshProfile: async () => { if (userRef.current) await storeUserData(await authApi.getUserDetails(userRef.current.user_id)); },

        updateVendor: async (vendorId: string, profileId: string, vendorData: any) => {
            
            const previousState = userRef.current;
            try {
                // 1. Dual Write to Auth Profile & Marketplace
                const promise1 = authApi.updateUserProfile(previousState?.user_id || '', profileId, {
                    display_name: vendorData.display_name || vendorData.business_name,
                    metadata: { ...vendorData.metadata, vendor_id: vendorId }
                }).catch(e => { throw new Error(`Auth Profile failed: ${e.message}`); });

                let promise2 = Promise.resolve();
                if (vendorId) {
                    const marketplaceData = {
                        business_name: vendorData.display_name || vendorData.business_name,
                        display_name: vendorData.display_name || vendorData.business_name,
                        contact_email: vendorData.metadata?.contact_email,
                        contact_phone: vendorData.metadata?.contact_phone,
                        tax_id: vendorData.tax_id || vendorData.metadata?.tax_id || vendorData.metadata?.tin_number,
                        store: {
                            store_name: vendorData.display_name || vendorData.business_name,
                            store_slug: vendorData.metadata?.store_slug || `${vendorId.substring(0, 8)}-store`,
                            description: vendorData.metadata?.description,
                            branding: { 
                                logo_url: vendorData.metadata?.logo_url, 
                                banner_url: vendorData.metadata?.banner_url,
                                colors: vendorData.metadata?.colors || { primary: '#315BA9', secondary: '#84CC16', accent: '#FBBF24', text: '#1F2937', background: '#FFFFFF' }
                            },
                            banners: vendorData.metadata?.banner_url ? [vendorData.metadata?.banner_url] : []
                        }
                    };
                    promise2 = authApi.updateVendor(vendorId, marketplaceData).catch(e => { throw new Error(`Marketplace update failed: ${e.message}`); });
                }

                // 2. Optimistic Update Local UI while APIs are flying
                if (previousState) {
                    const finalUser = JSON.parse(JSON.stringify(previousState));
                    const pIndex = finalUser.profiles.findIndex((p: any) => p.profile_id === profileId || p.profileId === profileId);
                    if (pIndex > -1) {
                        const newLogo = vendorData.metadata?.logo_url || vendorData.metadata?.image_url;
                        const newBanner = vendorData.metadata?.banner_url;
                        finalUser.profiles[pIndex].metadata = { ...finalUser.profiles[pIndex].metadata, ...(vendorData.metadata || {}), vendor_id: vendorId, logo_url: newLogo || finalUser.profiles[pIndex].metadata?.logo_url, image_url: newLogo || finalUser.profiles[pIndex].metadata?.image_url, logoUrl: newLogo || finalUser.profiles[pIndex].metadata?.logoUrl, profile_picture: newLogo || finalUser.profiles[pIndex].metadata?.profile_picture };
                        finalUser.profiles[pIndex].branding = { ...finalUser.profiles[pIndex].branding, logo_url: newLogo || finalUser.profiles[pIndex].branding?.logo_url, logoUrl: newLogo || finalUser.profiles[pIndex].branding?.logoUrl, banner_url: newBanner || finalUser.profiles[pIndex].branding?.banner_url, bannerUrl: newBanner || finalUser.profiles[pIndex].branding?.bannerUrl, image_url: newLogo || finalUser.profiles[pIndex].branding?.image_url, colors: vendorData.metadata?.colors || finalUser.profiles[pIndex].branding?.colors };
                        finalUser.profiles[pIndex].display_name = vendorData.display_name || vendorData.business_name || finalUser.profiles[pIndex].display_name;
                    }
                    setUser(finalUser);
                }

                // Wait for all writes to finish
                await Promise.all([promise1, promise2]);
            } catch (e: any) { 
                console.error("⚠️ [AuthContext] updateVendor failed, rolling back UI", e);
                // 3. Rollback UI on failure
                setUser(previousState);
                if (previousState) await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(previousState));
                throw e;
            } finally {
                // 4. Reconciliation Layer
                if (previousState?.user_id) {
                    authApi.getUserDetails(previousState.user_id).then(freshData => {
                        if (freshData) storeUserData(freshData);
                    }).catch(err => console.log('⚠️ [Reconciliation] updateVendor refresh failed:', err.message));
                }
            }
            return true;
        },
        saveAuthResponse: storeUserData,

        // Bug #14 fix: Expose social auth methods that properly pipe through storeUserData
        signInWithGoogle: async () => {
            const response = await socialAuth.signInWithGoogle();
            if (response) {
                return await storeUserData(response);
            }
            return null; // User cancelled
        },
        signInWithApple: async () => {
            const response = await socialAuth.signInWithApple();
            if (response) {
                return await storeUserData(response);
            }
            return null; // User cancelled
        },
        
        createVendor: async (vendorData: any) => {
            const previousState = userRef.current;
            try {
                const userId = previousState?.user_id || previousState?.id || '';
                const response = await authApi.createVendor(userId, vendorData);
                return response;
            } finally {
                // Bug #13 fix: Retry reconciliation once after 2s if first attempt fails
                if (previousState?.user_id) {
                    authApi.getUserDetails(previousState.user_id).then(freshData => {
                        if (freshData) storeUserData(freshData);
                    }).catch(err => {
                        console.log('⚠️ [Reconciliation] createVendor refresh failed, retrying in 2s:', err.message);
                        setTimeout(() => {
                            authApi.getUserDetails(previousState.user_id).then(freshData => {
                                if (freshData) storeUserData(freshData);
                            }).catch(retryErr => console.log('⚠️ [Reconciliation] Retry also failed:', retryErr.message));
                        }, 2000);
                    });
                }
            }
        },

        submitVendorKyc: async (documents: any[]) => {
            const vendorProfile = userRef.current?.profiles?.find((p: any) => IS_MERCHANT(p.role));
            const vendorId = vendorProfile?.metadata?.vendor_id || (vendorProfile as any)?.vendor_id || vendorProfile?.profile_id;
            
            if (!vendorId) throw new Error('No vendor profile found for KYC submission.');
            
            const normalizedDocs = documents.map(doc => {
                const url = doc.document_url || doc.url || doc.image_url || doc.link;
                const id = (doc.document_type_id || doc.id || '').toString().toLowerCase();
                return {
                    document_type_id: id,
                    document_url: url,
                    image_url: url,
                    link: url,
                    verification_status: doc.verification_status || 'pending'
                };
            });

            try {
                const { kycApi } = require('../services/kyc');
                const response = await kycApi.submitVendorKyc(vendorId, normalizedDocs);
                return response;
            } catch (e: any) {
                const apiError = e.response?.data?.message || e.message || 'Unknown error';
                throw new Error(`KYC Error: ${apiError}`);
            } finally {
                const userId = userRef.current?.user_id || userRef.current?.id;
                if (userId) {
                    authApi.getUserDetails(userId).then(freshData => {
                        if (freshData) storeUserData(freshData);
                    }).catch(err => console.log('⚠️ [Reconciliation] submitVendorKyc refresh failed:', err.message));
                }
            }
        },

        submitDeliveryKyc: async (documents: any[]) => {
            const isMatch = (p: any, vendorProfile: any) => p.role.toLowerCase() === vendorProfile.role.toLowerCase() || IS_MERCHANT(p.role);
            const deliveryProfile = userRef.current?.profiles?.find((p: any) => p.role === 'delivery' || p.role === 'driver');
            const partnerId = deliveryProfile?.metadata?.partner_id || deliveryProfile?.profile_id;
            
            if (!partnerId) throw new Error('No delivery profile found for KYC submission.');
            
            const normalizedDocs = documents.map(doc => {
                const url = doc.document_url || doc.url || doc.image_url || doc.link;
                const id = (doc.document_type_id || doc.id || '').toString().toLowerCase();
                // Aligning with DeliveryKycDocument interface in kyc.ts
                return {
                    document_type_id: id,
                    number: '', // Placeholder as number is required by interface
                    link: url,
                    verified: false
                };
            });

            try {
                const { kycApi } = require('../services/kyc');
                // Correcting method name to match kycApi.submitDeliveryKyc
                const response = await kycApi.submitDeliveryKyc(partnerId, normalizedDocs);
                return response;
            } catch (e: any) {
                const apiError = e.response?.data?.message || e.message || 'Unknown error';
                throw new Error(`KYC Error: ${apiError}`);
            } finally {
                const userId = userRef.current?.user_id || userRef.current?.id;
                if (userId) {
                    authApi.getUserDetails(userId).then(freshData => {
                        if (freshData) storeUserData(freshData);
                    }).catch(err => console.log('⚠️ [Reconciliation] submitDeliveryKyc refresh failed:', err.message));
                }
            }
        },
    };

    return <TunzaaAuthContext.Provider value={value}>{children}</TunzaaAuthContext.Provider>;
}

export const useTunzaaAuth = () => {
    const context = useContext(TunzaaAuthContext);
    if (!context) throw new Error('useTunzaaAuth error');
    return context;
};