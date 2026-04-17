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
    useEffect(() => { restoreSession(); }, []);

    const restoreSession = async () => {
        try {
            const token = await getAccessToken();
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            if (token && userData) setUser(JSON.parse(userData));
            else await clearTokens();
        } catch (error) { console.error('Session Restoration Failed:', error); }
        finally { setIsLoading(false); }
    };

    const storeUserData = useCallback(async (incomingData: any) => {
        let raw = incomingData.user || incomingData;
        if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch (e) { } }

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
            
            await AsyncStorage.setItem('LAST_PORTAL', finalPortal);
            return await storeUserData(response);
        },
        logout: async () => { 
            await clearTokens(); 
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            await socialAuth.signOutGoogle(); 
            setUser(null); 
        },
        updateUser: async (data: any) => await storeUserData({ ...userRef.current, ...data }),
        refreshProfile: async () => { if (userRef.current) await storeUserData(await authApi.getUserDetails(userRef.current.user_id)); },

        updateVendor: async (vendorId: string, profileId: string, vendorData: any) => {
            try {
                await authApi.updateUserProfile(userRef.current?.user_id || '', profileId, {
                    display_name: vendorData.display_name || vendorData.business_name,
                    metadata: { ...vendorData.metadata, vendor_id: vendorId }
                });
            } catch (e: any) { console.warn("⚠️ [AuthContext] Auth Profile update failed:", e.message); }

            if (vendorId) {
                try {
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
                    await authApi.updateVendor(vendorId, marketplaceData);
                } catch (e: any) { console.warn("⚠️ [AuthContext] Marketplace update failed:", e.message); }
            }

            if (userRef.current) {
                const finalUser = JSON.parse(JSON.stringify(userRef.current));
                const pIndex = finalUser.profiles.findIndex((p: any) => p.profile_id === profileId || p.profileId === profileId);
                if (pIndex > -1) {
                    const newLogo = vendorData.metadata?.logo_url || vendorData.metadata?.image_url;
                    const newBanner = vendorData.metadata?.banner_url;
                    finalUser.profiles[pIndex].metadata = { ...finalUser.profiles[pIndex].metadata, ...(vendorData.metadata || {}), vendor_id: vendorId, logo_url: newLogo || finalUser.profiles[pIndex].metadata?.logo_url, image_url: newLogo || finalUser.profiles[pIndex].metadata?.image_url, logoUrl: newLogo || finalUser.profiles[pIndex].metadata?.logoUrl, profile_picture: newLogo || finalUser.profiles[pIndex].metadata?.profile_picture };
                    finalUser.profiles[pIndex].branding = { ...finalUser.profiles[pIndex].branding, logo_url: newLogo || finalUser.profiles[pIndex].branding?.logo_url, logoUrl: newLogo || finalUser.profiles[pIndex].branding?.logoUrl, banner_url: newBanner || finalUser.profiles[pIndex].branding?.banner_url, bannerUrl: newBanner || finalUser.profiles[pIndex].branding?.bannerUrl, image_url: newLogo || finalUser.profiles[pIndex].branding?.image_url, colors: vendorData.metadata?.colors || finalUser.profiles[pIndex].branding?.colors };
                    finalUser.profiles[pIndex].display_name = vendorData.display_name || vendorData.business_name || finalUser.profiles[pIndex].display_name;
                }
                await storeUserData(finalUser);
            }
            return true;
        },
        saveAuthResponse: storeUserData,
        
        createVendor: async (vendorData: any) => {
            const userId = userRef.current?.user_id || userRef.current?.id || '';
            const response = await authApi.createVendor(userId, vendorData);
            if (userRef.current) await storeUserData(await authApi.getUserDetails(userRef.current.user_id));
            return response;
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
                if (userRef.current) await storeUserData(await authApi.getUserDetails(userRef.current.user_id));
                return response;
            } catch (e: any) {
                const apiError = e.response?.data?.message || e.message || 'Unknown error';
                throw new Error(`KYC Error: ${apiError}`);
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
                if (userRef.current) await storeUserData(await authApi.getUserDetails(userRef.current.user_id));
                return response;
            } catch (e: any) {
                const apiError = e.response?.data?.message || e.message || 'Unknown error';
                throw new Error(`KYC Error: ${apiError}`);
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