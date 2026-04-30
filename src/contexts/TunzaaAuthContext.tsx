import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/auth';
import { vendorsApi as marketplaceVendorsApi } from '../services/vendors';
import { socialAuth } from '../services/social-auth';
import { saveTokens, clearTokens, getAccessToken, getUserId, setUserId } from '../utils/storage';
import { setStorageItemAsync } from '../../hooks/useStorageState';
import { STORAGE_KEYS, API_CONFIG } from '../services/config';
import type { AuthResponse as TunzaaUser, RegisterBody, LoginBody } from '../services/types';

const TunzaaAuthContext = createContext<any>(null);

const IS_MERCHANT = (role: string) => ['vendor', 'merchant', 'business'].includes(role.toLowerCase());
const IS_DELIVERY = (role: string) => ['delivery', 'driver', 'delivery_partner'].includes(role.toLowerCase());

export const TunzaaAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<TunzaaUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const userRef = useRef<TunzaaUser | null>(null);

    useEffect(() => { userRef.current = user; }, [user]);


    const storeUserData = useCallback(async (incomingData: any, profileDetails?: any) => {
        let raw = incomingData.user || incomingData;
        if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch (e) { } }

        console.log('📦 [AuthContext] Storing User Data. ID:', raw.id, 'UserID:', raw.user_id);

        const incomingProfiles = incomingData.profiles || raw.profiles || [];
        
        // Deeply merge profiles to ensure metadata (hydration) isn't lost by shallow updates
        const finalProfiles = incomingProfiles.length > 0 ? incomingProfiles.map((ip: any) => {
            const existing = (userRef.current?.profiles || []).find((ep: any) => ep.profile_id === ip.profile_id || ep.profileId === ip.profileId);
            if (!existing) return ip;
            return {
                ...existing,
                ...ip,
                metadata: {
                    ...(existing.metadata || {}),
                    ...(ip.metadata || {})
                }
            };
        }) : (userRef.current?.profiles || []);

        const normalizedProfiles = finalProfiles.map((p: any) => {
            const meta = p.metadata || {};
            const isBusiness = IS_MERCHANT(p.role) || IS_DELIVERY(p.role);
            const personalName = raw.first_name 
                ? `${raw.first_name} ${raw.last_name || ''}`.trim()
                : (userRef.current?.first_name 
                    ? `${userRef.current.first_name} ${userRef.current.last_name || ''}`.trim()
                    : '');

            const rawName = isBusiness 
                ? (meta.business_name || meta.company_name || meta.shop_name || meta.organization_name || meta.legal_name ||
                   meta.merchant_name || meta.store_name || meta.partner_name || meta.trading_name || meta.registered_name || meta.name ||
                   p.business_name || p.company_name || p.shop_name || p.organization_name || p.legal_name ||
                   p.storeDetails?.storeName || p.storeDetails?.businessName || p.storeDetails?.companyName ||
                   p.vendor?.name || p.vendor?.business_name || p.merchant?.name || p.merchant?.business_name || p.business?.name ||
                   // Only use p.name if it's NOT the personal name
                   (p.name && p.name !== personalName ? p.name : '') ||
                   p.display_name || p.displayName || '')
                : (p.display_name || p.displayName || '');
            
            console.log(`👤 [AuthContext] Profile ${p.role} rawName: "${rawName}" (meta keys: ${Object.keys(meta).join(', ')})`);
            
            // Aggressive filtering for generic placeholders
            const cleanName = (val: string) => {
                if (!val || typeof val !== 'string') return '';
                const trimmed = val.trim();
                const lower = trimmed.toLowerCase();
                const generic = ['vendor', 'merchant', 'business', 'null', 'undefined', 'user'];
                if (generic.includes(lower) || trimmed.length < 2) return '';
                return trimmed;
            };

            const name = cleanName(rawName) || raw.name || personalName;
            
            return { 
                ...p, 
                profile_id: p.profile_id || p.profileId, 
                profileId: p.profileId || p.profile_id, 
                display_name: name, 
                displayName: name,
                kyc: p.kyc || { verified: false, documents: [] }
            };
        });

        const activeRole = raw.activeProfileRole || raw.active_profile_role || userRef.current?.activeProfileRole || 'buyer';
        const activeProfile = normalizedProfiles.find((p: any) => p.role.toLowerCase() === activeRole.toLowerCase()) || normalizedProfiles[0];

        console.log('✅ [AuthContext] Normalized profiles count:', normalizedProfiles.length);
        normalizedProfiles.forEach(p => {
            console.log(`   - Profile ${p.role}: name="${p.display_name}", metaKeys=[${Object.keys(p.metadata || {}).join(', ')}]`);
        });

        const updatedUser: TunzaaUser = {
            ...userRef.current, ...raw,
            id: raw.id || raw.user_id || userRef.current?.id,
            user_id: raw.user_id || raw.id || userRef.current?.user_id,
            // Follow the active profile's name if available, otherwise fallback to personal name
            display_name: activeProfile?.display_name || 
                (raw.first_name 
                    ? `${raw.first_name} ${raw.last_name || ''}`.trim()
                    : (userRef.current?.first_name 
                        ? `${userRef.current.first_name} ${userRef.current.last_name || ''}`.trim()
                        : 'User')),
            name: activeProfile?.display_name || 
                (raw.first_name 
                    ? `${raw.first_name} ${raw.last_name || ''}`.trim()
                    : (userRef.current?.first_name 
                        ? `${userRef.current.first_name} ${userRef.current.last_name || ''}`.trim()
                        : 'User')),
            profiles: normalizedProfiles,
            activeProfileRole: activeRole,
            vendorDetails: profileDetails?.vendorDetails || normalizedProfiles.find(p => IS_MERCHANT(p.role))?.metadata,
            deliveryDetails: profileDetails?.deliveryDetails || normalizedProfiles.find(p => IS_DELIVERY(p.role))?.metadata,
        };

        setUser(updatedUser);

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
            
            // Synchronize with whitelabel AuthProvider (SecureStore)
            // Extract core fields that AuthProvider expects
            const coreUserData = {
                id: updatedUser.id || updatedUser.user_id,
                user_id: updatedUser.user_id || updatedUser.id,
                name: updatedUser.display_name,
                email: updatedUser.email || "",
                phone_number: updatedUser.phone_number || "",
                activeProfileRole: updatedUser.activeProfileRole,
                profiles: updatedUser.profiles?.map(p => ({
                    profile_id: p.profile_id,
                    role: p.role,
                    display_name: p.display_name
                })),
                roles: updatedUser.roles || [],
                permissions: (updatedUser as any).permissions || [],
                meta: {
                    createdAt: (updatedUser as any).created_at || new Date().toISOString(),
                    updatedAt: (updatedUser as any).updated_at || new Date().toISOString(),
                }
            };
            await setStorageItemAsync("user", JSON.stringify(coreUserData));
            
            // Sync large profile details to AsyncStorage (for Whitelabel AuthProvider)
            if (profileDetails) {
                await AsyncStorage.setItem('userProfileDetails', JSON.stringify(profileDetails));
            } else {
                const vendorProfile = updatedUser.profiles.find(p => IS_MERCHANT(p.role));
                if (vendorProfile?.metadata && (vendorProfile.metadata.merchant_profile_synced || vendorProfile.metadata.vendor_id)) {
                    await AsyncStorage.setItem('userProfileDetails', JSON.stringify({
                        vendorDetails: vendorProfile.metadata
                    }));
                }
            }

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

                    // ── Tenant Mismatch Guard ──
                    // If the cached user was created under a different tenant than the
                    // one currently configured in .env, the JWT + user ID are stale and
                    // every API call will 404.  Clear the session and force re-auth.
                    const currentTenantId = API_CONFIG.TENANT_ID;
                    const cachedTenantId = parsedUser.tenant_id;
                    if (cachedTenantId && currentTenantId && cachedTenantId !== currentTenantId) {
                        console.warn(
                            `🔀 [AuthContext] Tenant mismatch detected! Cached: ${cachedTenantId}, Current: ${currentTenantId}. Clearing stale session.`
                        );
                        await clearTokens();
                        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
                        // Also clear stale onboarding flags that belong to the old tenant
                        await AsyncStorage.multiRemove([
                            'HAS_PENDING_MERCHANT_ONBOARDING',
                            'TEMP_ONBOARDING_SHOP_NAME',
                            'IS_FIRST_TIME_BUYER',
                        ]);
                        setUser(null);
                        setIsLoading(false);
                        return;
                    }

                    // 1. Instant Cache Load (Optimistic UI)
                    setUser(parsedUser); 
                    
                        // 2. Background Hydration (Reconciliation)
                    const idToFetch = parsedUser.id || parsedUser.user_id;
                    console.log('🔄 [AuthContext] FULL CACHED USER:', JSON.stringify(parsedUser));
                    if (idToFetch) {
                            // Parallel fetch for user details and potentially merchant profile
                            const promises: [Promise<any>, Promise<any>] = [
                                authApi.getUserDetails(idToFetch).catch(() => authApi.getProfile()),
                                (async () => {
                                    try {
                                        // Try marketplace vendor profile first if we have a merchant/vendor profile
                                        const vProfile = parsedUser.profiles?.find((p: any) => IS_MERCHANT(p.role));
                                        const vendorId = vProfile?.profile_id || vProfile?.profileId || vProfile?.id;
                                        
                                        if (vendorId) {
                                            console.log('🔄 [AuthContext] Hydrating marketplace vendor profile for ID:', vendorId);
                                            return await marketplaceVendorsApi.getVendor(vendorId);
                                        }
                                        
                                        // Fallback to TunzaaPay merchant profile if role matches
                                        if (parsedUser.activeProfileRole && IS_MERCHANT(parsedUser.activeProfileRole)) {
                                            console.log('🔄 [AuthContext] Falling back to TunzaaPay merchant profile');
                                            return await authApi.getMerchantProfile();
                                        }
                                        return null;
                                    } catch (e) {
                                        console.log('⚠️ [AuthContext] Merchant/Vendor hydration failed:', (e as any)?.message);
                                        return null;
                                    }
                                })()
                            ];

                        Promise.all(promises)
                            .then(([freshData, merchantData]) => {
                                console.log('🔄 [AuthContext] Background hydration results:', { 
                                    hasFreshData: !!freshData, 
                                    hasMerchantData: !!merchantData,
                                    merchantName: merchantData?.business_name || merchantData?.company_name || merchantData?.name 
                                });

                                if (freshData) {
                                    // Merge merchant profile data into the profile metadata if found
                                    if (merchantData && freshData.profiles) {
                                        const mIndex = freshData.profiles.findIndex((p: any) => IS_MERCHANT(p.role));
                                        if (mIndex > -1) {
                                            console.log('📝 [AuthContext] Merging merchant data into profile at index:', mIndex);
                                            freshData.profiles[mIndex].metadata = {
                                                ...(freshData.profiles[mIndex].metadata || {}),
                                                ...merchantData,
                                                merchant_profile_synced: true,
                                                business_name: merchantData.business_name || merchantData.company_name || merchantData.name
                                            };
                                        }
                                    }
                                    storeUserData(freshData, merchantData ? { vendorDetails: merchantData } : undefined);
                                }
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

    const activeRole = user?.activeProfileRole || 'buyer';
    const activeProfile = user?.profiles?.find((p: any) => p.role.toLowerCase() === activeRole.toLowerCase()) || user?.profiles?.[0];

    const value = React.useMemo(() => ({
        user, activeProfile, isAuthenticated: !!user, isLoading,
        requestOTP: (phone: string) => authApi.requestOTP({ phone_number: phone }),
        verifyOTP: (phone: string, otp: string) => authApi.verifyOTP({ phone_number: phone, otp }),
        register: async (data: RegisterBody, targetPortal?: string) => {
            const response = await authApi.register(data);
            
            const serverRole = (response.activeProfileRole || response.active_profile_role || '').toLowerCase();
            const hasVendor = response.profiles?.some((p: any) => IS_MERCHANT(p.role));
            const hasDelivery = response.profiles?.some((p: any) => IS_DELIVERY(p.role));

            let finalPortal = 'buyer';
            if (targetPortal === 'merchant') finalPortal = 'merchant';
            else if (targetPortal === 'delivery') finalPortal = 'delivery';
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
            if (targetPortal === 'merchant') finalPortal = 'merchant';
            else if (targetPortal === 'delivery') finalPortal = 'delivery';
            else if (IS_MERCHANT(serverRole) || hasVendor) finalPortal = 'merchant';
            else if (IS_DELIVERY(serverRole) || hasDelivery) finalPortal = 'delivery';
            
            await AsyncStorage.setItem('LAST_PORTAL', finalPortal);
            return await storeUserData(response);
        },
        logout: async () => { 
            console.log('🔒 [AuthContext] Logout initiated — clearing all session data');
            await clearTokens(); 
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            await setStorageItemAsync("user", null);
            // Clear ALL navigation/onboarding flags to prevent stale routing
            await AsyncStorage.multiRemove([
                'HAS_PENDING_MERCHANT_ONBOARDING',
                'TEMP_ONBOARDING_SHOP_NAME',
                'IS_FIRST_TIME_BUYER',
                'LAST_PORTAL',
            ]);
            await socialAuth.signOutGoogle(); 
            setUser(null); 
        },
        updateUser: async (data: any) => {
            const previousState = userRef.current;
            try {
                // 1. Optimistic Local Update
                setUser({ ...previousState, ...data } as TunzaaUser);
                
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
        refreshProfile: async () => { 
            if (!userRef.current) return;
            const id = userRef.current.user_id || userRef.current.id;
            try {
                const freshData = await authApi.getUserDetails(id);
                if (IS_MERCHANT(userRef.current.activeProfileRole || '')) {
                    let merchantData = null;
                    
                    // Try marketplace vendor profile first
                    const vProfile = userRef.current.profiles?.find((p: any) => IS_MERCHANT(p.role));
                    const vendorId = vProfile?.profile_id || vProfile?.profileId || vProfile?.id;
                    
                    if (vendorId) {
                        merchantData = await marketplaceVendorsApi.getVendor(vendorId).catch(() => null);
                    }
                    
                    // Fallback to TunzaaPay merchant profile if still null
                    if (!merchantData) {
                        merchantData = await authApi.getMerchantProfile().catch(() => null);
                    }

                    if (merchantData && freshData.profiles) {
                        const mIndex = freshData.profiles.findIndex((p: any) => IS_MERCHANT(p.role));
                        if (mIndex > -1) {
                            freshData.profiles[mIndex].metadata = {
                                ...freshData.profiles[mIndex].metadata,
                                ...merchantData,
                                merchant_profile_synced: true,
                                business_name: merchantData.business_name || merchantData.company_name || merchantData.name
                            };
                        }
                    }
                }
                await storeUserData(freshData);
            } catch (err) {
                console.error('❌ [AuthContext] refreshProfile failed:', err);
            }
        },

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
                    // Extract logo and banner with aggressive fallback
                    const logo = vendorData.metadata?.logo_url || vendorData.metadata?.logoUrl || 
                                vendorData.metadata?.image_url || vendorData.metadata?.profile_picture || 
                                vendorData.logo_url || vendorData.logoUrl || vendorData.image_url;
                                
                    const banner = vendorData.metadata?.banner_url || vendorData.metadata?.bannerUrl || 
                                  vendorData.banner_url || vendorData.bannerUrl;

                    const marketplaceData = {
                        business_name: vendorData.display_name || vendorData.business_name,
                        display_name: vendorData.display_name || vendorData.business_name,
                        contact_email: vendorData.metadata?.contact_email || vendorData.contact_email,
                        contact_phone: vendorData.metadata?.contact_phone || vendorData.contact_phone,
                        tax_id: vendorData.tax_id || vendorData.metadata?.tax_id || vendorData.metadata?.tin_number,
                        store: {
                            store_name: vendorData.display_name || vendorData.business_name,
                            store_slug: vendorData.metadata?.store_slug || vendorData.store_slug || `${vendorId.substring(0, 8)}-store`,
                            description: vendorData.metadata?.description || vendorData.description,
                            branding: { 
                                logo_url: logo, 
                                banner_url: banner,
                                colors: vendorData.metadata?.colors || vendorData.colors || { primary: '#315BA9', secondary: '#84CC16', accent: '#FBBF24', text: '#1F2937', background: '#FFFFFF' }
                            },
                            banners: banner ? [banner] : []
                        }
                    };
                    console.log('🔄 [AuthContext] Updating Marketplace Vendor:', vendorId);
                    promise2 = authApi.updateVendor(vendorId, marketplaceData).catch(e => { 
                        console.error('❌ [AuthContext] Marketplace update failed:', e.message);
                        throw new Error(`Marketplace update failed: ${e.message}`); 
                    });
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
        
        createVendor: async (vendorData: any) => {
            const previousState = userRef.current;
            try {
                const userId = previousState?.user_id || previousState?.id || '';
                const response = await authApi.createVendor(userId, vendorData);
                
                // Immediately refresh profile to ensure context is updated
                if (userId) {
                    try {
                        const freshData = await authApi.getUserDetails(userId);
                        if (freshData) await storeUserData(freshData);
                    } catch (err) {
                        console.log('⚠️ [AuthContext] Post-create refresh failed:', err);
                    }
                }
                
                return response;
            } catch (error) {
                console.error('❌ [AuthContext] createVendor failed:', error);
                throw error;
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
        switchRole: async (role: string) => {
            if (!userRef.current) return;
            const updated = { ...userRef.current, activeProfileRole: role };
            await storeUserData(updated);
            const portal = IS_MERCHANT(role) ? 'merchant' : (IS_DELIVERY(role) ? 'delivery' : 'buyer');
            await AsyncStorage.setItem('LAST_PORTAL', portal);
        },
        isSidebarOpen,
        setIsSidebarOpen
    }), [user, isLoading, activeProfile, isSidebarOpen]);

    return <TunzaaAuthContext.Provider value={value}>{children}</TunzaaAuthContext.Provider>;
}

export const useTunzaaAuth = () => {
    const context = useContext(TunzaaAuthContext);
    if (!context) throw new Error('useTunzaaAuth error');
    return context;
};