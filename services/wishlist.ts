import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  WishlistItem,
  AddToWishlistBody,
  UpdateWishlistItemBody,
  MoveToCartBody,
  MoveToCartResponse,
  WishlistResponse,
  WishlistStatusResponse,
  WishlistCountResponse,
  ClearWishlistResponse,
} from "./types/wishlist";
import { parseApiError } from "./error-handler";

export const wishlistApi = {
  // Add item to wishlist
  addToWishlist: async (data: AddToWishlistBody): Promise<WishlistItem> => {
    const response = await apiClient.post<WishlistItem>("wishlist/items", data);
    return response.data;
  },

  // Get user's wishlist
  getWishlist: async (
    skip: number = 0,
    limit: number = 50,
    includeProductDetails: boolean = true
  ): Promise<WishlistResponse> => {
    const response = await apiClient.get<WishlistResponse>(
      `wishlist?skip=${skip}&limit=${limit}&include_product_details=${includeProductDetails}`
    );
    return response.data;
  },

  // Check if product is in wishlist
  checkWishlistStatus: async (
    productId: string,
    variantSku?: string
  ): Promise<WishlistStatusResponse> => {
    const url = variantSku
      ? `wishlist/check/${productId}?variant_sku=${variantSku}`
      : `wishlist/check/${productId}`;
    const response = await apiClient.get<WishlistStatusResponse>(url);
    return response.data;
  },

  // Remove item from wishlist
  removeFromWishlist: async (
    productId: string,
    variantSku?: string
  ): Promise<{ message: string }> => {
    const url = variantSku
      ? `wishlist/items/${productId}?variant_sku=${variantSku}`
      : `wishlist/items/${productId}`;
    const response = await apiClient.delete<{ message: string }>(url);
    return response.data;
  },

  // Move items to cart
  moveToCart: async (data: MoveToCartBody): Promise<MoveToCartResponse> => {
    const response = await apiClient.post<MoveToCartResponse>(
      "wishlist/move-to-cart",
      data
    );
    return response.data;
  },

  // Get wishlist count
  getWishlistCount: async (): Promise<WishlistCountResponse> => {
    const response = await apiClient.get<WishlistCountResponse>("wishlist/count");
    return response.data;
  },

  // Clear wishlist
  clearWishlist: async (): Promise<ClearWishlistResponse> => {
    const response = await apiClient.delete<ClearWishlistResponse>("wishlist/clear");
    return response.data;
  },

  // Update wishlist item
  updateWishlistItem: async (
    wishlistId: string,
    data: UpdateWishlistItemBody
  ): Promise<WishlistItem> => {
    const response = await apiClient.patch<WishlistItem>(
      `wishlist/items/${wishlistId}`,
      data
    );
    return response.data;
  },
};

// React Query Hooks

export const useGetWishlist = (
  skip: number = 0,
  limit: number = 50,
  includeProductDetails: boolean = true
) => {
  return useQuery({
    queryKey: ["wishlist", skip, limit, includeProductDetails],
    queryFn: () => wishlistApi.getWishlist(skip, limit, includeProductDetails),
  });
};

export const useGetWishlistCount = () => {
  return useQuery({
    queryKey: ["wishlist-count"],
    queryFn: () => wishlistApi.getWishlistCount(),
  });
};

export const useCheckWishlistStatus = (
  productId: string,
  variantSku?: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["wishlist-status", productId, variantSku],
    queryFn: () => wishlistApi.checkWishlistStatus(productId, variantSku),
    enabled: enabled && !!productId,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.addToWishlist,
    onSuccess: () => {
      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
    },
    onError: (error: any) => {
      // The error is already parsed by the axios interceptor
      // You can access the user-friendly message via error.message
      // and additional details via error.apiError
      console.error('Add to wishlist error:', error.message);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantSku }: { productId: string; variantSku?: string }) =>
      wishlistApi.removeFromWishlist(productId, variantSku),
    onSuccess: () => {
      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-status"] });
    },
  });
};

export const useMoveToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.moveToCart,
    onSuccess: () => {
      // Invalidate wishlist and cart data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistApi.clearWishlist,
    onSuccess: () => {
      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-status"] });
    },
  });
};

export const useUpdateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ wishlistId, data }: { wishlistId: string; data: UpdateWishlistItemBody }) =>
      wishlistApi.updateWishlistItem(wishlistId, data),
    onSuccess: () => {
      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};