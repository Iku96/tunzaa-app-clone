/**
 * Product & Category Data — API-Driven Exports
 *
 * This file previously contained hardcoded PRODUCTS[] and CATEGORIES[] arrays.
 * It now re-exports dynamic hooks from the API services.
 *
 * Usage in components:
 *   import { useProductsData, useCategoriesData } from '@/data/products';
 *
 * For backward compatibility, the static arrays are kept as empty defaults
 * so any components that haven't migrated yet won't crash.
 */
import { productsApi, Product as ApiProduct, ProductsParams } from "../services/products";
import { categoriesApi, Category, useCategories } from "../services/categories";
import { useQuery } from "@tanstack/react-query";

// Re-export API types for convenience
export type { ApiProduct as Product };
export type { Category };

// ---- Legacy-compatible empty arrays (components should migrate to hooks) ----

/** @deprecated Use useProductsData() hook instead */
export const PRODUCTS: any[] = [];

/** @deprecated Use useCategoriesData() hook instead */
export const CATEGORIES: any[] = [];

// ---- Dynamic Hooks ----

/** Fetch products from the API with optional filters */
export const useProductsData = (params?: ProductsParams) => {
    return useQuery({
        queryKey: ["products", params],
        queryFn: () => productsApi.getProducts(params),
    });
};

/** Re-export categories hook */
export const useCategoriesData = useCategories;
