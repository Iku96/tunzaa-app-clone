import { apiClient } from "./client";

export interface Category {
  category_id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  image_url: string;
  is_active: boolean;
  is_featured: boolean; // Added to match product-management.ts
  metadata: Record<string, any>; // Added to match product-management.ts
  created_at: string;
  updated_at: string;
}

export interface CategoriesResponse {
  items: Category[];
  total: number;
  skip: number;
  limit: number;
}

export const categoriesApi = {
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await apiClient.get<CategoriesResponse>("categories/");
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`categories/${id}`);
    return response.data;
  },
};
