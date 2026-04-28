/**
 * Tenant Service
 * Fetches tenant configuration including promotional banners
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { API_CONFIG } from './config';
import type { TenantResponse, Banner } from './types';

// ── API Functions ──────────────────────────────────────────────

export const tenantApi = {
    /** Fetch the current tenant configuration */
    getTenant: async (): Promise<TenantResponse> => {
        const response = await apiClient.get(`/tenants/${API_CONFIG.TENANT_ID}`);
        return response.data;
    },

    /** Fetch only active banners, sorted by display_order */
    getActiveBanners: async (): Promise<Banner[]> => {
        const tenant = await tenantApi.getTenant();
        const banners = tenant?.banners || [];

        const now = new Date();
        return banners
            .filter((b) => {
                if (!b.is_active) return false;
                // Check date range if specified
                if (b.start_date && new Date(b.start_date) > now) return false;
                if (b.end_date && new Date(b.end_date) < now) return false;
                return true;
            })
            .sort((a, b) => a.display_order - b.display_order);
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
