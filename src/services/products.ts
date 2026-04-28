import { apiClient } from "./client";

export interface ProductImage {
    url: string;
    alt_text?: string;
    is_primary?: boolean;
    display_order?: number;
}

export interface Product {
    _id: string;
    product_id: string;
    vendor_id: string;
    store_id: string;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    sku: string;
    barcode: string | null;
    category_ids: string[];
    tags: string[];
    base_price: number;
    base_price_raw: number;
    sale_price: number | null;
    sale_price_raw: number | null;
    cost_price: number | null;
    inventory_quantity: number;
    inventory_tracking: boolean;
    low_stock_threshold: number;
    images: (string | ProductImage)[];
    has_variants: boolean;
    variants: any | null;
    variant_attributes: any | null;
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    requires_shipping: boolean;
    promotion: any | null;
    is_active: boolean;
    is_featured: boolean;
    tenant_id: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    store?: any;
}

export interface ProductsResponse {
    items: Product[];
    total: number;
    skip: number;
    limit: number;
}

export interface SearchProductsResponse extends ProductsResponse {
    query: string;
}

export interface ProductsParams {
    skip?: number;
    limit?: number;
    store_id?: string;
    vendor_id?: string;
    category_id?: string;
    is_active?: boolean;
    is_featured?: boolean;
    min_price?: number;
    max_price?: number;
    verification_status?: string;
    query?: string;
    is_vendor_active?: boolean;
}

export interface SearchProductsParams {
    skip?: number;
    limit?: number;
}

export const productsApi = {
    getProducts: async (params?: ProductsParams): Promise<ProductsResponse> => {
        const response = await apiClient.get<ProductsResponse>("/products/", {
            params,
        });
        return response.data;
    },

    getProductById: async (id: string): Promise<Product> => {
        const response = await apiClient.get<Product>(`/products/${id}`);
        return response.data;
    },

    searchProducts: async (
        query: string,
        params?: SearchProductsParams
    ): Promise<SearchProductsResponse> => {
        const response = await apiClient.get<SearchProductsResponse>(
            "/products/search",
            {
                params: { query, ...params },
            }
        );
        return response.data;
    },
};
