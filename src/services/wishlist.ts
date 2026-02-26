import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface WishlistItem {
    wishlist_id: string;
    tenant_id: string;
    user_id: string;
    product_id: string;
    variant_sku?: string;
    priority: number;
    notes?: string;
    notification_enabled: boolean;
    added_at: string;
    created_at: string;
    updated_at: string;
    product?: any;
}

export interface AddToWishlistBody {
    product_id: string;
    variant_sku?: string;
    priority?: number;
    notes?: string;
    notification_enabled?: boolean;
}

export interface UpdateWishlistItemBody {
    priority?: number;
    notes?: string;
    notification_enabled?: boolean;
}

export interface MoveToCartBody {
    product_ids: string[];
    verify_stock?: boolean;
}

export interface MoveToCartResponse {
    cart_id: string;
    moved_items: Array<{
        product_id: string;
        variant_sku?: string;
    }>;
    failed_items: Array<{
        product_id: string;
        variant_sku?: string;
        reason: string;
    }>;
    total_moved: number;
    total_failed: number;
}

export interface WishlistResponse {
    items: WishlistItem[];
    total: number;
    skip: number;
    limit: number;
}

export interface WishlistStatusResponse {
    is_wishlisted: boolean;
    wishlist_id?: string;
}

export interface WishlistCountResponse {
    count: number;
}

export interface ClearWishlistResponse {
    items_removed: number;
    message: string;
}

export const wishlistApi = {
    addToWishlist: async (data: AddToWishlistBody): Promise<WishlistItem> => {
        const response = await apiClient.post<WishlistItem>("/wishlist/items", data);
        return response.data;
    },

    getWishlist: async (
        skip: number = 0,
        limit: number = 50,
        includeProductDetails: boolean = true
    ): Promise<WishlistResponse> => {
        const response = await apiClient.get<WishlistResponse>(
            `/wishlist?skip=${skip}&limit=${limit}&include_product_details=${includeProductDetails}`
        );
        return response.data;
    },

    checkWishlistStatus: async (
        productId: string,
        variantSku?: string
    ): Promise<WishlistStatusResponse> => {
        const url = variantSku
            ? `/wishlist/check/${productId}?variant_sku=${variantSku}`
            : `/wishlist/check/${productId}`;
        const response = await apiClient.get<WishlistStatusResponse>(url);
        return response.data;
    },

    removeFromWishlist: async (
        productId: string,
        variantSku?: string
    ): Promise<{ message: string }> => {
        const url = variantSku
            ? `/wishlist/items/${productId}?variant_sku=${variantSku}`
            : `/wishlist/items/${productId}`;
        const response = await apiClient.delete<{ message: string }>(url);
        return response.data;
    },

    moveToCart: async (data: MoveToCartBody): Promise<MoveToCartResponse> => {
        const response = await apiClient.post<MoveToCartResponse>(
            "/wishlist/move-to-cart",
            data
        );
        return response.data;
    },

    getWishlistCount: async (): Promise<WishlistCountResponse> => {
        const response = await apiClient.get<WishlistCountResponse>("/wishlist/count");
        return response.data;
    },

    clearWishlist: async (): Promise<ClearWishlistResponse> => {
        const response = await apiClient.delete<ClearWishlistResponse>("/wishlist/clear");
        return response.data;
    },

    updateWishlistItem: async (
        wishlistId: string,
        data: UpdateWishlistItemBody
    ): Promise<WishlistItem> => {
        const response = await apiClient.patch<WishlistItem>(
            `/wishlist/items/${wishlistId}`,
            data
        );
        return response.data;
    },
};

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
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
        },
        onError: (error: any) => {
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
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
    });
};
