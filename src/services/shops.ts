import { apiClient } from "./client";

export interface StoreBranding {
    logo_url: string;
    favicon_url: string | null;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
    };
    font_family: string;
    slogan: string | null;
    about_html: string | null;
    facebook_url: string | null;
    instagram_handle: string | null;
    twitter_handle: string | null;
    youtube_url: string | null;
}

export interface StoreBanner {
    banner_id: string;
    title: string;
    image_url: string;
    mobile_image_url: string | null;
    destination_url: string | null;
    alt_text: string;
    display_order: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
}

export interface Store {
    _id: string;
    store_id: string;
    tenant_id: string;
    vendor_id: string;
    store_name: string;
    store_slug: string;
    description: string;
    branding: StoreBranding;
    banners: StoreBanner[];
    featured_categories: string[];
    general_policy: string;
    return_policy: string;
    shipping_policy: string;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string[];
    is_active: boolean;
    is_featured: boolean;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    followers_count?: number; // Tunzaa might add this later
}

export interface StoresResponse {
    items: Store[];
    total: number;
    skip: number;
    limit: number;
}

export const shopsApi = {
    getStores: async (params?: { is_featured?: boolean, vendor_verification_status?: string, is_vendor_active?: boolean, verification_status?: string }): Promise<StoresResponse> => {
        const response = await apiClient.get<StoresResponse>("/marketplace/stores", {
            params,
        });
        return response.data;
    },

    getStoreById: async (storeId: string): Promise<Store> => {
        const response = await apiClient.get<Store>(`/marketplace/stores/${storeId}`);
        return response.data;
    }
};
