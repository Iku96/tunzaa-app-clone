import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface Category {
    category_id: string;
    tenant_id: string;
    name: string;
    slug: string;
    description: string;
    parent_id: string | null;
    image_url: string;
    icon?: string;
    is_active: boolean;
    is_featured: boolean;
    display_order?: number;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface CategoriesResponse {
    items: Category[];
    total: number;
    skip: number;
    limit: number;
}

export interface CategoriesParams {
    skip?: number;
    limit?: number;
    parent_id?: string;
    is_active?: boolean;
}

export const categoriesApi = {
    getCategories: async (params?: CategoriesParams): Promise<CategoriesResponse> => {
        const response = await apiClient.get<CategoriesResponse>("/categories/", { params });
        return response.data;
    },

    getCategoryById: async (id: string): Promise<Category> => {
        const response = await apiClient.get<Category>(`/categories/${id}`);
        return response.data;
    },
};

// ---- React Query Hooks ----

/** Fetch all categories. Stale time set to 5 min since categories rarely change. */
export const useCategories = (params?: CategoriesParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["categories", params],
        queryFn: () => categoriesApi.getCategories(params),
        enabled,
        staleTime: 5 * 60 * 1000,
    });
};

/** Fetch a single category by ID */
export const useCategory = (categoryId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["category", categoryId],
        queryFn: () => categoriesApi.getCategoryById(categoryId),
        enabled: enabled && !!categoryId,
    });
};
