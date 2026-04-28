import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

// Product Management Types
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductImage {
  image_id?: string;
  url: string;
  alt_text?: string | null;
  is_primary?: boolean;
  display_order?: number;
}

export interface ProductVariant {
  variant_id?: string;
  sku: string;
  name: string; // Full variant name (e.g., "MacBook Pro 14 M5 512GB SSD Space Black")
  price: number;
  inventory_quantity: number;
  attributes: Record<string, string>; // Flexible key-value pairs (e.g., {chip: "M5", color: "Space Black"})
  image_url?: string | null;
  is_active?: boolean;
}

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

export interface CreateProductRequest {
  vendor_id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  sku: string;
  category_ids: string[]; // Kept for backward compatibility
  categories?: Category[]; // Added to support full Category objects
  base_price: number;
  cost_price?: number;
  sale_price?: number;
  inventory_quantity: number;
  inventory_tracking?: boolean;
  low_stock_threshold?: number;
  images?: ProductImage[];
  has_variants?: boolean;
  tags?: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  requires_shipping?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface UpdateProductRequest {
  product_id: string;
  tenant_id: string;
  vendor_id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  sku: string;
  barcode?: string | null;
  category_ids: string[];
  tags?: string[];
  base_price: number;
  sale_price?: number;
  cost_price?: number;
  inventory_quantity: number;
  inventory_tracking?: boolean;
  low_stock_threshold?: number;
  images?: ProductImage[];
  has_variants?: boolean;
  variants?: ProductVariant[] | null;
  variant_attributes?: any | null;
  weight?: number;
  dimensions?: ProductDimensions;
  requires_shipping?: boolean;
  promotion?: any | null;
  is_active?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
}

export interface UpdateInventoryRequest {
  inventory_quantity: number;
  base_price?: number;
  sale_price?: number;
}

export interface UpdateProductStatusRequest {
  is_active: boolean;
}

export interface ProductResponse {
  _id?: string;
  product_id: string;
  tenant_id: string;
  vendor_id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  barcode?: string | null;
  category_ids: string[];
  categories?: Category[];
  tags: string[];
  base_price: number;
  sale_price: number;
  cost_price: number;
  inventory_quantity: number;
  inventory_tracking: boolean;
  low_stock_threshold: number;
  images: ProductImage[];
  has_variants: boolean;
  variants?: ProductVariant[] | null;
  variant_attributes?: any | null;
  weight: number;
  dimensions: ProductDimensions;
  requires_shipping: boolean;
  promotion?: any | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  rejection_reason?: string;
  status?: string;
  verification_status?: string;
}

export interface ProductsListResponse {
  items: ProductResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetProductsParams {
  vendor_id?: string;
  store_id?: string;
  category_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  skip?: number;
  limit?: number;
}

export const productManagementApi = {
  // Create Product
  createProduct: async (
    data: CreateProductRequest
  ): Promise<ProductResponse> => {
    const response = await apiClient.post<ProductResponse>("/products/", data);
    return response.data;
  },

  // Get Product Details
  getProduct: async (productId: string): Promise<ProductResponse> => {
    const response = await apiClient.get<ProductResponse>(
      `/products/${productId}`
    );
    return response.data;
  },

  // Update Product
  updateProduct: async (
    productId: string,
    data: UpdateProductRequest
  ): Promise<ProductResponse> => {
    const response = await apiClient.put<ProductResponse>(
      `/products/${productId}`,
      data
    );
    return response.data;
  },

  // Update Product Inventory
  updateProductInventory: async (
    productId: string,
    data: UpdateInventoryRequest
  ): Promise<ProductResponse> => {
    const response = await apiClient.put<ProductResponse>(
      `/products/${productId}/inventory`,
      data
    );
    return response.data;
  },

  // Update Product Status
  updateProductStatus: async (
    productId: string,
    data: UpdateProductStatusRequest
  ): Promise<ProductResponse> => {
    const response = await apiClient.put<ProductResponse>(
      `/products/${productId}/status`,
      data
    );
    return response.data;
  },

  // Get All Products
 getProducts: async (
  params?: GetProductsParams
): Promise<ProductsListResponse> => {
  const searchParams = new URLSearchParams();

  // ✅ Always apply default filters
  searchParams.append("verification_status", "approved");
  searchParams.append("is_vendor_active", "true");
  searchParams.append("has_images", "true");

  // ✅ Add optional filters if provided
  if (params?.vendor_id) {
    searchParams.append("vendor_id", params.vendor_id);
  }
  if (params?.store_id) {
    searchParams.append("store_id", params.store_id);
  }
  if (params?.category_id) {
    searchParams.append("category_id", params.category_id);
  }
  if (params?.is_active !== undefined) {
    searchParams.set("is_active", params.is_active.toString()); 
  }
  if (params?.is_featured !== undefined) {
    searchParams.append("is_featured", params.is_featured.toString());
  }
  if (params?.skip !== undefined) {
    searchParams.append("skip", params.skip.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  const response = await apiClient.get<ProductsListResponse>(
    `/products/?${searchParams.toString()}`
  );
  return response.data;
},

};

// React Query Hooks

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: productManagementApi.createProduct,
  });
};

export const useGetProduct = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => productManagementApi.getProduct(productId),
    enabled: enabled && !!productId,
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateProductRequest;
    }) => productManagementApi.updateProduct(productId, data),
  });
};

export const useUpdateProductInventory = () => {
  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateInventoryRequest;
    }) => productManagementApi.updateProductInventory(productId, data),
  });
};

export const useUpdateProductStatus = () => {
  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateProductStatusRequest;
    }) => productManagementApi.updateProductStatus(productId, data),
  });
};

export const useGetProducts = (
  params?: GetProductsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productManagementApi.getProducts(params),
    enabled,
  });
};
