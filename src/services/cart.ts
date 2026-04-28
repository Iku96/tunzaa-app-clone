import { apiClient } from "./client";

export interface CartItem {
    item_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price: number;
    sale_price: number;
    added_at: string;
    metadata: any | null;
    // New properties from the updated API
    product_name?: string;
    image_url?: string;
    inventory_quantity?: number;
    variants?: {
        sku: string;
        name: string;
        price: number;
        attributes: any | null;
    };
    total_price?: number;
}

export interface Cart {
    cart_id: string;
    tenant_id: string;
    user_id: string;
    session_id: string | null;
    items: CartItem[];
    discount_code: string | null;
    currency: string;
    created_at: string;
    updated_at: string;
    expires_at: string | null;
    metadata: any | null;
}

export interface CartTotals {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
}

export interface AddToCartRequest {
    product_id: string;
    quantity: number;
    variant_id?: string | null;
    sku?: string;
    currency?: string;
    vendor_id?: string;
    store_id?: string;
    metadata?: {
        sku?: string;
        currency?: string;
        vendor_id?: string;
        store_id?: string;
        [key: string]: any;
    };
    variants?: {
        sku: string;
        name: string;
        price: number;
        attributes: any | null;
    };
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface RemoveCartItemRequest {
    item_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price: number;
    added_at: string;
    metadata: any | null;
}

export const cartApi = {
    getOrCreateCart: async (userId: string): Promise<Cart> => {
        const response = await apiClient.get(`/carts/user?user_id=${userId}`);
        return response.data;
    },

    addToCart: async (
        cartId: string,
        items: AddToCartRequest[]
    ): Promise<Cart> => {
        const response = await apiClient.post(`/carts/${cartId}/items`, items);
        return response.data;
    },

    updateCartItem: async (
        cartId: string,
        itemId: string,
        update: UpdateCartItemRequest
    ): Promise<Cart> => {
        const response = await apiClient.put(
            `/carts/${cartId}/items/${itemId}`,
            update
        );
        return response.data;
    },

    removeCartItem: async (
        cartId: string,
        itemId: string
    ): Promise<Cart> => {
        const response = await apiClient.delete(`/carts/${cartId}/items/${itemId}`);
        return response.data;
    },

    clearCart: async (cartId: string): Promise<Cart> => {
        const response = await apiClient.delete(`/carts/${cartId}/items`);
        return response.data;
    },

    getCartTotals: async (cartId: string): Promise<CartTotals> => {
        const response = await apiClient.get(`/carts/${cartId}/totals`);
        return response.data;
    },
};
