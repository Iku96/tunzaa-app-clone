import { useQuery } from "@tanstack/react-query";
import { useGetProduct } from "@/services/product-management";
import { useMemo } from "react";

// Hook to fetch multiple product details efficiently
export const useProductDetails = (productIds: string[] = []) => {
  // Ensure we have a stable array to prevent infinite re-renders
  const stableProductIds = useMemo(() => {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return [];
    }
    return productIds.filter(id => id && typeof id === 'string');
  }, [productIds]);

  // Instead of calling hooks in a loop, we'll use a single query to fetch all products
  // This maintains consistent hook order regardless of productIds length
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', 'multiple', stableProductIds],
    queryFn: async () => {
      if (stableProductIds.length === 0) {
        return new Map();
      }

      // Fetch all products in parallel
      const promises = stableProductIds.map(async (productId) => {
        try {
          // We need to import the product management service directly
          const { productManagementApi } = await import('@/services/product-management');
          const product = await productManagementApi.getProduct(productId);
          return [productId, product];
        } catch (error) {
          console.error(`Failed to fetch product ${productId}:`, error);
          return [productId, null];
        }
      });

      const results = await Promise.allSettled(promises);
      const productsMap = new Map();

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value[1]) {
          productsMap.set(result.value[0], result.value[1]);
        }
      });

      return productsMap;
    },
    enabled: stableProductIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Combine all the results
  const results = useMemo(() => {
    const productsMap = productsData || new Map();
    const hasError = !!error;

    return {
      products: productsMap,
      isLoading,
      hasError,
      getProduct: (productId: string) => {
        if (!productId || typeof productId !== 'string') return null;
        return productsMap.get(productId);
      },
      getProductImage: (productId: string) => {
        if (!productId || typeof productId !== 'string') return null;
        const product = productsMap.get(productId);
        if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
          // Return the primary image or the first image
          const primaryImage = product.images.find((img: any) => img?.is_primary);
          return primaryImage?.url || product.images[0]?.url || product.images[0];
        }
        return null;
      }
    };
  }, [productsData, isLoading, error]);

  return results;
};

// Hook for a single product (for cases where we only need one)
export const useProductDetail = (productId: string) => {
  const isValidProductId = Boolean(productId && typeof productId === 'string');
  const { data: product, isLoading, error } = useGetProduct(productId, isValidProductId);

  const getProductImage = useMemo(() => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      // Return the primary image or the first image
      const primaryImage = product.images.find((img: any) => img?.is_primary);
      return primaryImage?.url || product.images[0]?.url || product.images[0];
    }
    return null;
  }, [product]);

  return {
    product,
    productImage: getProductImage,
    isLoading,
    error
  };
}; 