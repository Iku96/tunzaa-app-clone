import { useQuery } from "@tanstack/react-query";
import {
  productsApi,
  Product,
  ProductsResponse,
  ProductsParams,
} from "@/src/services/products";

// Query keys for better cache management
const productsKeys = {
  all: ["products"] as const,
  lists: () => [...productsKeys.all, "list"] as const,
  list: (filters: ProductsParams) =>
    [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, "detail"] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
};

// React Query hooks
export const useProducts = (params?: ProductsParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: productsKeys.list(params || {}),
    queryFn: () => productsApi.getProducts(params),
    enabled: enabled,
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id,
  });
};

// Custom hook for filtered products (for client-side filtering if needed)
export const useFilteredProducts = (
  products: Product[],
  searchQuery: string,
  selectedCategory: string | null
) => {
  return products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category_ids.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });
};
