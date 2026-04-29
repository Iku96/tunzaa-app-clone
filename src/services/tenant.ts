/**
 * Tenant Service
 * Fetches tenant configuration including promotional banners
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { API_CONFIG } from './config';
import type { TenantResponse, Banner } from './types';

// ── API Functions ──────────────────────────────────────────────

import { productsApi } from './products';

// ── API Functions ──────────────────────────────────────────────

export const tenantApi = {
    /** Fetch the current tenant configuration */
    getTenant: async (): Promise<TenantResponse> => {
        const response = await apiClient.get(`/tenants/${API_CONFIG.TENANT_ID}`);
        return response.data;
    },

    /** Fetch only active banners, sorted by display_order */
    getActiveBanners: async (): Promise<Banner[]> => {
        try {
            const tenant = await tenantApi.getTenant();
            let banners = tenant?.banners || [];

            // If backend has no banners, generate dynamic banners from REAL products
            if (banners.length === 0) {
                console.log('🔄 [TenantAPI] No banners found, generating from real products...');
                const productsRes = await productsApi.getProducts({ limit: 5 });
                const products = productsRes.items || [];

                if (products.length > 0) {
                    banners = products.map((product, index) => {
                        const image = typeof product.images[0] === 'string' 
                            ? product.images[0] 
                            : (product.images[0] as any)?.url || '';
                        
                        return {
                            banner_id: `prod-${product.id}`,
                            title: product.name.toUpperCase(),
                            image_url: image,
                            mobile_image_url: null,
                            destination_url: `/(buyer)/shop/product/${product.id}`,
                            alt_text: product.short_description || `Check out ${product.name}`,
                            display_order: index,
                            is_active: true,
                            start_date: new Date().toISOString(),
                            end_date: new Date(Date.now() + 86400000 * 30).toISOString(),
                        };
                    });
                }
            }

            // Still fallback if everything fails
            if (banners.length === 0) {
                banners = [
                    {
                        banner_id: 'mock-1',
                        title: 'Premium Deals',
                        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
                        mobile_image_url: null,
                        destination_url: '/(buyer)/shop/category/all',
                        alt_text: 'Limited time offers for you',
                        display_order: 1,
                        is_active: true,
                        start_date: new Date().toISOString(),
                        end_date: new Date(Date.now() + 86400000 * 30).toISOString(),
                    }
                ];
            }

            const now = new Date();
            return banners
                .filter((b) => {
                    if (!b.is_active) return false;
                    if (b.start_date && new Date(b.start_date) > now) return false;
                    if (b.end_date && new Date(b.end_date) < now) return false;
                    return true;
                })
                .sort((a, b) => a.display_order - b.display_order);
        } catch (error) {
            console.error('❌ [TenantAPI] Error fetching banners:', error);
            return [];
        }
    },
};

// ── React Query Hooks ──────────────────────────────────────────

export const useTenant = () =>
    useQuery<TenantResponse>({
        queryKey: ['tenant', API_CONFIG.TENANT_ID],
        queryFn: tenantApi.getTenant,
        staleTime: 1000 * 60 * 15, // 15 min cache
    });

export const useBanners = () =>
    useQuery<Banner[]>({
        queryKey: ['banners', API_CONFIG.TENANT_ID],
        queryFn: tenantApi.getActiveBanners,
        staleTime: 1000 * 60 * 10, // 10 min cache
    });
