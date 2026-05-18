import React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    cartApi,
    Cart,
    CartItem,
    AddToCartRequest,
    UpdateCartItemRequest,
    RemoveCartItemRequest,
} from "@/src/services/cart";

console.log('🚀 [CART_STORE] File loaded into memory');

// Custom storage adapter for cross-platform compatibility
// Using AsyncStorage instead of SecureStore because cart data can exceed 2KB (SecureStore limit on Android)
const createCrossPlatformStorage = () => ({
    getItem: async (name: string): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(name);
        } catch (e) {
            console.error("AsyncStorage error:", e);
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            await AsyncStorage.setItem(name, value);
        } catch (e) {
            console.error("AsyncStorage error:", e);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            await AsyncStorage.removeItem(name);
        } catch (e) {
            console.error("AsyncStorage error:", e);
        }
    },
});

// Local cart item interface for optimistic updates
export interface LocalCartItem extends AddToCartRequest {
    temp_id: string;
    timestamp: number;
}

// Interface for tracking items in cart
export interface CartItemTracker {
    product_id: string;
    variant_sku?: string;
    quantity: number;
    item_id?: string; // Server item ID once added
}

// Interface for temporary quantity state
export interface TempQuantityState {
    product_id: string;
    variant_sku?: string;
    quantity: number;
}

// Interface for temporary cart storage
export interface TempCartState {
    cart: Cart | null;
    timestamp: number;
}

interface CartState {
    // Local optimistic items (pending server sync)
    optimisticItems: LocalCartItem[];

    // Track items that are in cart (for UI state)
    cartItems: CartItemTracker[];

    // Temporary quantity state (not persisted)
    tempQuantities: TempQuantityState[];

    // Temporary cart storage for "Buy Now" functionality
    tempCart: TempCartState | null;

    // Actions
    addOptimisticItem: (
        item: Omit<LocalCartItem, "temp_id" | "timestamp">
    ) => void;
    removeOptimisticItem: (tempId: string) => void;
    clearOptimisticItems: () => void;

    // Cart item tracking
    addCartItem: (item: CartItemTracker) => void;
    updateCartItemQuantity: (productId: string, variantSku: string | undefined, quantity: number) => void;
    removeCartItem: (productId: string, variantSku: string | undefined) => void;
    clearCartItems: () => void;

    // Temporary quantity management
    setTempQuantity: (productId: string, variantSku: string | undefined, quantity: number) => void;
    clearTempQuantity: (productId: string, variantSku: string | undefined) => void;
    clearAllTempQuantities: () => void;

    // Temporary cart management for "Buy Now"
    saveTempCart: (cart: Cart) => void;
    getTempCart: () => TempCartState | null;
    clearTempCart: () => void;
    restoreTempCart: () => Cart | null;

    // Getters
    getOptimisticItemCount: () => number;
    hasOptimisticItems: () => boolean;
    getCartItemQuantity: (productId: string, variantSku: string | undefined) => number;
    getTempQuantity: (productId: string, variantSku: string | undefined) => number;
    isInCart: (productId: string, variantSku: string | undefined) => boolean;
}

// Zustand store for optimistic updates only
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            optimisticItems: [],
            cartItems: [],
            tempQuantities: [],
            tempCart: null,

            addOptimisticItem: (item) => {
                const tempId = `temp_${Date.now()}_${Math.random()}`;
                const timestamp = Date.now();

                set((state) => ({
                    optimisticItems: [
                        ...state.optimisticItems,
                        { ...item, temp_id: tempId, timestamp },
                    ],
                }));
            },

            removeOptimisticItem: (tempId) => {
                set((state) => ({
                    optimisticItems: state.optimisticItems.filter(
                        (item) => item.temp_id !== tempId
                    ),
                }));
            },

            clearOptimisticItems: () => {
                set({ optimisticItems: [], cartItems: [], tempQuantities: [], tempCart: null });
            },

            getOptimisticItemCount: () => {
                const { optimisticItems } = get();
                return optimisticItems.reduce(
                    (count, item) => count + item.quantity,
                    0
                );
            },

            hasOptimisticItems: () => {
                return get().optimisticItems.length > 0;
            },

            addCartItem: (item) => {
                set((state) => ({
                    cartItems: [...state.cartItems, item],
                }));
            },

            updateCartItemQuantity: (productId, variantSku, quantity) => {
                set((state) => ({
                    cartItems: state.cartItems.map((item) =>
                        item.product_id === productId && item.variant_sku === variantSku
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            removeCartItem: (productId, variantSku) => {
                set((state) => ({
                    cartItems: state.cartItems.filter(
                        (item) => item.product_id !== productId || item.variant_sku !== variantSku
                    ),
                }));
            },

            clearCartItems: () => {
                set({ cartItems: [] });
            },

            setTempQuantity: (productId, variantSku, quantity) => {
                set((state) => ({
                    tempQuantities: [...state.tempQuantities, { product_id: productId, variant_sku: variantSku, quantity }],
                }));
            },

            clearTempQuantity: (productId, variantSku) => {
                set((state) => ({
                    tempQuantities: state.tempQuantities.filter(
                        (item) => item.product_id !== productId || item.variant_sku !== variantSku
                    ),
                }));
            },

            clearAllTempQuantities: () => {
                set({ tempQuantities: [] });
            },

            getCartItemQuantity: (productId, variantSku) => {
                const { cartItems } = get();
                return cartItems.find(item => item.product_id === productId && item.variant_sku === variantSku)?.quantity || 0;
            },

            getTempQuantity: (productId, variantSku) => {
                const { tempQuantities } = get();
                return tempQuantities.find(item => item.product_id === productId && item.variant_sku === variantSku)?.quantity || 0;
            },

            isInCart: (productId, variantSku) => {
                const { cartItems } = get();
                return cartItems.some(item => item.product_id === productId && item.variant_sku === variantSku);
            },

            saveTempCart: (cart) => {
                set({ tempCart: { cart, timestamp: Date.now() } });
            },

            getTempCart: () => {
                const { tempCart } = get();
                return tempCart;
            },

            clearTempCart: () => {
                set({ tempCart: null });
            },

            restoreTempCart: () => {
                const { tempCart } = get();
                return tempCart?.cart || null;
            },
        }),
        {
            name: "cart-optimistic-storage",
            storage: createJSONStorage(() => createCrossPlatformStorage()),
            partialize: (state) => ({
                optimisticItems: state.optimisticItems,
                cartItems: state.cartItems, // Include cart tracking state in persistence
            }),
        }
    )
);

// React Query hooks for server state
export const useCart = (userId: string) => {
    return useQuery({
        queryKey: ["cart", userId],
        queryFn: () => cartApi.getOrCreateCart(userId),
        enabled: !!userId,
        staleTime: 1 * 60 * 1000, // 1 minute
        refetchOnWindowFocus: true,
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });
};

export const useCartTotals = (cartId: string) => {
    return useQuery({
        queryKey: ["cartTotals", cartId],
        queryFn: () => cartApi.getCartTotals(cartId),
        enabled: !!cartId,
        staleTime: 30 * 1000, // 30 seconds
    });
};

// Bulk add to cart with optimistic updates
export const useAddToCartBulk = () => {
    const queryClient = useQueryClient();
    const cartStore = useCartStore();

    return useMutation({
        mutationFn: async ({
            cartId,
            items,
            existingCart,
        }: {
            cartId: string;
            items: AddToCartRequest[];
            existingCart?: Cart;
        }) => {
            // Use existing cart data if provided, otherwise get it from the cache
            let currentCart = existingCart;

            if (!currentCart) {
                // Try to get from cache first
                // Try to get from cache first - try both cartId and userId since there's a mismatch in some places
                currentCart = queryClient.getQueryData<Cart>(["cart", cartId]) || 
                             (currentCart = queryClient.getQueryData<Cart>(["cart", items[0]?.currency === 'TZS' ? 'guest' : 'guest'])); // This is a bit arbitrary, but let's just use the cartId first.
                
                // Better way to get userId if possible? AddToCartRequest doesn't have it.
                // Let's just try to find ANY cart in the cache if cartId fails.
                if (!currentCart) {
                    const allCarts = queryClient.getQueriesData<Cart>({ queryKey: ["cart"] });
                    currentCart = allCarts.find(([key, data]) => data?.cart_id === cartId)?.[1];
                }

                if (!currentCart) {
                    // If not in cache, we need to get the user_id to fetch the cart
                    // This is a fallback case - ideally we should always have the cart data
                    console.warn('Cart not found in cache, cannot add items without existing cart data');
                    throw new Error('Cart data not available');
                }
            }

            // Create a map of existing items for easy lookup
            const existingItemsMap = new Map();
            currentCart.items.forEach(cartItem => {
                const key = `${cartItem.product_id}-${cartItem.metadata?.sku || 'default'}`;
                existingItemsMap.set(key, {
                    product_id: cartItem.product_id,
                    quantity: cartItem.quantity,
                    variant_id: cartItem.variant_id,
                    sku: cartItem.metadata?.sku,
                    currency: cartItem.metadata?.currency,
                    metadata: cartItem.metadata
                });
            });

            // Add or update the new items
            items.forEach(item => {
                const itemKey = `${item.product_id}-${item.sku || 'default'}`;
                const existingItem = existingItemsMap.get(itemKey);

                if (existingItem) {
                    // Item exists, update quantity
                    existingItem.quantity += item.quantity;
                    existingItemsMap.set(itemKey, existingItem);
                } else {
                    // Item doesn't exist, add it
                    existingItemsMap.set(itemKey, {
                        product_id: item.product_id,
                        quantity: item.quantity,
                    });
                }
            });

            // Convert map back to array for API - strip null/undefined values
            const allItems = Array.from(existingItemsMap.values()).map(item => {
                const clean: Record<string, any> = {};
                for (const [k, v] of Object.entries(item)) {
                    if (v !== null && v !== undefined && v !== '') clean[k] = v;
                }
                return clean;
            });

            // Send all items to the API
            return cartApi.addToCart(cartId, allItems);
        },

        // Optimistic update
        onMutate: async ({ cartId, items }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["cart"] });

            // Snapshot previous value
            const previousCart = queryClient.getQueryData<Cart>(["cart", cartId]);

            // Optimistically update the cache
            if (previousCart) {
                const optimisticCart: Cart = {
                    ...previousCart,
                    items: [...previousCart.items],
                    updated_at: new Date().toISOString(),
                };

                // Add each new item optimistically
                items.forEach((item, index) => {
                    const existingItemIndex = optimisticCart.items.findIndex(
                        (cartItem) =>
                            cartItem.product_id === item.product_id &&
                            cartItem.metadata?.sku === item.sku
                    );

                    if (existingItemIndex >= 0) {
                        // Update existing item quantity
                        optimisticCart.items[existingItemIndex] = {
                            ...optimisticCart.items[existingItemIndex],
                            quantity: optimisticCart.items[existingItemIndex].quantity + item.quantity,
                        };
                    } else {
                        // Add new item
                        optimisticCart.items.push({
                            item_id: `optimistic_${Date.now()}_${index}`,
                            product_id: item.product_id,
                            variant_id: null,
                            quantity: item.quantity,
                            unit_price: 0, // We don't have price in the request
                            added_at: new Date().toISOString(),
                            metadata: { sku: item.sku, currency: item.currency },
                        });
                    }
                });

                queryClient.setQueryData(["cart", cartId], optimisticCart);
            }

            return { previousCart };
        },

        // On success, replace optimistic update with real data
        onSuccess: (data, variables) => {
            queryClient.setQueryData(["cart", data.user_id], data);
            // Clear optimistic items that were successfully synced
            cartStore.clearOptimisticItems();
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["cartTotals", data.cart_id] });
        },

        onError: (error, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(
                    ["cart", variables.cartId],
                    context.previousCart
                );
            }
        },

        retry: 2,
        retryDelay: 1000,
    });
};

// Single item add to cart (wrapper around bulk)
export const useAddToCart = () => {
    const queryClient = useQueryClient();
    const cartStore = useCartStore();

    return useMutation({
        mutationFn: async ({
            cartId,
            item,
            existingCart,
            userId,
        }: {
            cartId: string;
            item: AddToCartRequest;
            existingCart?: Cart;
            userId?: string;
        }) => {
            // Use existing cart data if provided, otherwise get it from the cache
            let currentCart = existingCart;

            if (!currentCart) {
                // Try to get from cache first - try both cartId and userId
                currentCart = queryClient.getQueryData<Cart>(["cart", cartId]) || 
                             queryClient.getQueryData<Cart>(["cart", userId || '']);
                
                // Debug log what we found in cache
                if (currentCart) {
                    console.log('🛒 [useAddToCart] Found cart in cache:', currentCart.cart_id);
                }
            }

            // Create a map of existing items for easy lookup
            const existingItemsMap = new Map();
            if (currentCart && currentCart.items) {
                currentCart.items.forEach(cartItem => {
                    const key = `${cartItem.product_id}-${cartItem.metadata?.sku || 'default'}`;
                    existingItemsMap.set(key, {
                        product_id: cartItem.product_id,
                        quantity: cartItem.quantity,
                        sku: cartItem.metadata?.sku,
                        currency: cartItem.metadata?.currency || 'TZS',
                    });
                });
            }

            // Check if the item already exists in the cart
            const itemKey = `${item.product_id}-${item.sku || 'default'}`;
            const existingItem = existingItemsMap.get(itemKey);

            if (existingItem) {
                // Item exists, update quantity
                existingItem.quantity += item.quantity;
                existingItemsMap.set(itemKey, existingItem);
            } else {
                // Item doesn't exist, add it
                existingItemsMap.set(itemKey, {
                    product_id: item.product_id,
                    quantity: item.quantity,
                    sku: item.sku,
                    currency: item.currency || 'TZS',
                });
            }

            // Convert map back to array for API - strip null/undefined values
            const allItems = Array.from(existingItemsMap.values()).map(item => {
                const clean: Record<string, any> = {};
                for (const [k, v] of Object.entries(item)) {
                    if (v !== null && v !== undefined && v !== '') clean[k] = v;
                }
                return clean;
            });
            console.log('🛒 [useAddToCart] Final Payload to API:', JSON.stringify(allItems));

            // Send all items to the API
            return cartApi.addToCart(cartId, allItems);
        },

        onMutate: async ({ cartId, item }) => {
            await queryClient.cancelQueries({ queryKey: ["cart"] });

            const previousCart = queryClient.getQueryData<Cart>(["cart", cartId]);

            if (previousCart) {
                // Find if item already exists
                const existingItemIndex = previousCart.items.findIndex(
                    (cartItem) =>
                        cartItem.product_id === item.product_id &&
                        cartItem.metadata?.sku === item.sku
                );

                const optimisticCart: Cart = {
                    ...previousCart,
                    items: [...previousCart.items],
                    updated_at: new Date().toISOString(),
                };

                if (existingItemIndex >= 0) {
                    // Update existing item quantity
                    optimisticCart.items[existingItemIndex] = {
                        ...optimisticCart.items[existingItemIndex],
                        quantity: optimisticCart.items[existingItemIndex].quantity + item.quantity,
                    };
                } else {
                    // Add new item
                    optimisticCart.items.push({
                        item_id: `optimistic_${Date.now()}`,
                        product_id: item.product_id,
                        variant_id: null,
                        quantity: item.quantity,
                        unit_price: 0, // We don't have price in the request
                        sale_price: 0,
                        added_at: new Date().toISOString(),
                        metadata: { sku: item.sku, currency: item.currency },
                    });
                }

                queryClient.setQueryData(["cart", cartId], optimisticCart);
            }

            return { previousCart };
        },

        onSuccess: (data, variables) => {
            // Use variables.userId since data might not have it
            const userId = variables.userId || data.user_id;
            if (userId) {
                queryClient.setQueryData(["cart", userId], data);
                queryClient.invalidateQueries({ queryKey: ["cart", userId] });
            }
            
            // Clear optimistic items that were successfully synced
            cartStore.clearOptimisticItems();
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["cartTotals", data.cart_id] });
        },

        onError: (error, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(
                    ["cart", variables.cartId],
                    context.previousCart
                );
            }
        },

        retry: 2,
        retryDelay: 1000,
    });
};

export const useUpdateCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            cartId,
            itemId,
            update,
        }: {
            cartId: string;
            itemId: string;
            update: UpdateCartItemRequest;
        }) => {
            // For now, we'll use the existing updateCartItem API since it updates by item ID
            // This might be different from the addToCart API that expects all items
            return cartApi.updateCartItem(cartId, itemId, update);
        },

        onMutate: async ({ cartId, itemId, update }) => {
            await queryClient.cancelQueries({ queryKey: ["cart"] });

            const previousCart = queryClient.getQueryData<Cart>(["cart", cartId]);

            if (previousCart) {
                const optimisticCart: Cart = {
                    ...previousCart,
                    items: previousCart.items.map((item) =>
                        item.item_id === itemId
                            ? { ...item, quantity: update.quantity }
                            : item
                    ),
                    updated_at: new Date().toISOString(),
                };

                queryClient.setQueryData(["cart", cartId], optimisticCart);
            }

            return { previousCart };
        },

        onSuccess: (data) => {
            queryClient.setQueryData(["cart", data.user_id], data);
            queryClient.invalidateQueries({ queryKey: ["cartTotals", data.cart_id] });
        },

        onError: (error, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(
                    ["cart", variables.cartId],
                    context.previousCart
                );
            }
        },

        retry: 2,
        retryDelay: 1000,
    });
};

export const useRemoveCartItem = () => {
    const queryClient = useQueryClient();
    const cartStore = useCartStore();

    return useMutation({
        mutationFn: ({
            cartId,
            itemId,
            userId,
        }: {
            cartId: string;
            itemId: string;
            userId?: string;
        }) => cartApi.removeCartItem(cartId, itemId),

        onMutate: async ({ cartId, itemId, userId }) => {
            const queryKey = ["cart", userId || cartId];
            await queryClient.cancelQueries({ queryKey });

            const previousCart = queryClient.getQueryData<Cart>(queryKey);

            if (previousCart) {
                const optimisticCart: Cart = {
                    ...previousCart,
                    items: previousCart.items.filter(
                        (cartItem) => cartItem.item_id !== itemId
                    ),
                    updated_at: new Date().toISOString(),
                };

                queryClient.setQueryData(queryKey, optimisticCart);
            }

            return { previousCart };
        },

        onSuccess: (data, variables) => {
            const userId = variables.userId || data.user_id;
            if (userId) {
                queryClient.setQueryData(["cart", userId], data);
                queryClient.invalidateQueries({ queryKey: ["cart", userId] });
            }
            queryClient.invalidateQueries({ queryKey: ["cartTotals", data.cart_id] });
        },

        onError: (error, variables, context) => {
            const userId = variables.userId || variables.cartId;
            if (context?.previousCart && userId) {
                queryClient.setQueryData(
                    ["cart", userId],
                    context.previousCart
                );
            }
        },

        retry: 2,
        retryDelay: 1000,
    });
};

export const useClearCart = () => {
    const queryClient = useQueryClient();
    const cartStore = useCartStore();

    return useMutation({
        mutationFn: ({ cartId }: { cartId: string }) => cartApi.clearCart(cartId),

        onMutate: async ({ cartId, existingCart }) => {
            await queryClient.cancelQueries({ queryKey: ["cart"] });
            return { previousCart: existingCart };
        },

        onSuccess: (data) => {
            // CRITICAL: The query key is ["cart", userId]
            queryClient.setQueryData(["cart", data.user_id], data);
            queryClient.invalidateQueries({ queryKey: ["cartTotals", data.cart_id] });
            queryClient.invalidateQueries({ queryKey: ["cart", data.user_id] });

            // Clear all local cart tracking state
            cartStore.clearCartItems();
            cartStore.clearAllTempQuantities();
            cartStore.clearOptimisticItems();
        },

        onError: (error, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(
                    ["cart", variables.cartId],
                    context.previousCart
                );
            }
        },

        retry: 2,
        retryDelay: 1000,
    });
};

// Combined hook for easy cart access
export const useCartCombined = (userId: string) => {
    const cartStore = useCartStore();
    const { data: serverCart, isLoading, error, refetch } = useCart(userId);
    const addToCart = useAddToCart();
    const updateCartItem = useUpdateCartItem();
    const addToCartBulk = useAddToCartBulk();
    const clearCart = useClearCart();
    const removeCartItemMutation = useRemoveCartItem();

    // Use ref to track previous cart state to prevent unnecessary updates
    const previousCartRef = React.useRef<Cart | null>(null);

    // Sync local cart tracking state with server state
    React.useEffect(() => {
        if (serverCart && serverCart !== previousCartRef.current) {
            previousCartRef.current = serverCart;

            const updateCartState = () => {
                if (serverCart) {
                    const serverItemsMap = new Map();
                    serverCart.items.forEach(item => {
                        const key = `${item.product_id}-${item.metadata?.sku || 'default'}`;
                        serverItemsMap.set(key, {
                            product_id: item.product_id,
                            variant_sku: item.metadata?.sku,
                            quantity: item.quantity,
                            item_id: item.item_id,
                        });
                    });

                    const localItemsMap = new Map();
                    cartStore.cartItems.forEach(item => {
                        const key = `${item.product_id}-${item.variant_sku || 'default'}`;
                        localItemsMap.set(key, item);
                    });

                    const needsUpdate = serverItemsMap.size !== localItemsMap.size ||
                        Array.from(serverItemsMap.keys()).some(key => {
                            const serverItem = serverItemsMap.get(key);
                            const localItem = localItemsMap.get(key);
                            return !localItem ||
                                localItem.quantity !== serverItem.quantity ||
                                localItem.item_id !== serverItem.item_id;
                        });

                    if (needsUpdate) {
                        cartStore.clearCartItems();
                        serverItemsMap.forEach(item => {
                            cartStore.addCartItem(item);
                        });
                    }
                }
            };
            setTimeout(updateCartState, 0);
        }
    }, [serverCart]);

    const getTotalItemCount = () => {
        const serverCount = serverCart?.items.reduce((count, item) => count + item.quantity, 0) || 0;
        const optimisticCount = cartStore.getOptimisticItemCount();
        return serverCount + optimisticCount;
    };

    const hasItems = () => getTotalItemCount() > 0;

    const addItem = async (item: AddToCartRequest, variantSku?: string) => {
        const safeItem = { ...item, quantity: item.quantity || 1 };
        cartStore.addOptimisticItem(safeItem);

        try {
            if (serverCart?.cart_id) {
                await addToCart.mutateAsync({
                    cartId: serverCart.cart_id,
                    item: safeItem,
                    existingCart: serverCart,
                    userId
                });
            } else {
                const newCart = await cartApi.createCart(userId);
                await addToCart.mutateAsync({
                    cartId: newCart.cart_id,
                    item: safeItem,
                    existingCart: newCart,
                    userId
                });
            }
        } catch (error) {
            console.error("❌ [addItem] Server sync failed:", error);
            cartStore.removeCartItem(safeItem.product_id, variantSku);
        }
    };

    const buyNow = async (item: AddToCartRequest, variantSku?: string) => {
        const safeItem = { ...item, quantity: item.quantity || 1 };
        let currentCart = serverCart;
        if (!currentCart) {
            try {
                currentCart = await cartApi.createCart(userId);
            } catch (err) {
                currentCart = { cart_id: userId, items: [], user_id: userId, total_price: 0 } as any;
            }
        }

        try {
            if (currentCart) cartStore.saveTempCart(currentCart);
            return await addToCart.mutateAsync({
                cartId: currentCart?.cart_id || userId,
                item: safeItem,
                existingCart: currentCart ? { ...currentCart, items: [] } : undefined,
                userId
            });
        } catch (error) {
            console.error("Failed to process Buy Now:", error);
            throw error;
        }
    };

    const restoreOriginalCart = async () => {
        const tempCart = cartStore.getTempCart();
        if (!tempCart?.cart) return null;
        try {
            const itemsToRestore = tempCart.cart.items.map(cartItem => ({
                product_id: cartItem.product_id,
                quantity: cartItem.quantity,
                sku: cartItem.metadata?.sku,
                currency: cartItem.metadata?.currency,
            }));
            if (itemsToRestore.length === 0) {
                cartStore.clearTempCart();
                return null;
            }
            const restoredCart = await addToCartBulk.mutateAsync({
                cartId: tempCart.cart.cart_id,
                items: itemsToRestore,
                existingCart: { ...tempCart.cart, items: [] }
            });
            cartStore.clearTempCart();
            return restoredCart;
        } catch (error) {
            console.error("Failed to restore original cart:", error);
            throw error;
        }
    };

    const updateItemQuantityHelper = async (productId: string, variantSku: string | undefined, quantity: number) => {
        if (!serverCart) return;
        // Try exact match first, then fallback to product_id only
        let cartItem = serverCart.items.find(item =>
            item.product_id === productId &&
            item.metadata?.sku === variantSku
        );
        if (!cartItem) {
            cartItem = serverCart.items.find(item => item.product_id === productId);
        }
        if (cartItem) {
            try {
                await updateCartItem.mutateAsync({
                    cartId: serverCart.cart_id,
                    itemId: cartItem.item_id,
                    update: { quantity }
                });
            } catch (error) {
                console.error("Failed to update cart item quantity:", error);
                throw error;
            }
        } else {
            console.warn(`[Cart] Item not found for update: ${productId}`);
        }
    };

    // Direct item_id based operations (most reliable)
    const updateItemByIdHelper = async (itemId: string, quantity: number) => {
        if (!serverCart) return;
        try {
            await updateCartItem.mutateAsync({
                cartId: serverCart.cart_id,
                itemId,
                update: { quantity }
            });
        } catch (error) {
            console.error("Failed to update cart item:", error);
            throw error;
        }
    };

    const removeItemByIdHelper = async (itemId: string) => {
        if (!serverCart) return;
        try {
            await removeCartItemMutation.mutateAsync({
                cartId: serverCart.cart_id,
                userId,
                itemId
            });
        } catch (error) {
            console.error("Failed to remove cart item:", error);
            throw error;
        }
    };

    return {
        cart: serverCart,
        isLoading: isLoading || addToCart.isPending,
        error: error || addToCart.error,
        optimisticItems: cartStore.optimisticItems,
        addItem,
        refetch,
        getTotalItemCount,
        hasItems,
        getCartItemQuantity: cartStore.getCartItemQuantity,
        getTempQuantity: cartStore.getTempQuantity,
        isInCart: cartStore.isInCart,
        setTempQuantity: cartStore.setTempQuantity,
        clearTempQuantity: cartStore.clearTempQuantity,
        addCartItem: cartStore.addCartItem,
        updateCartItemQuantity: async (productId: string, variantSku: string | undefined, quantity: number) => {
            cartStore.updateCartItemQuantity(productId, variantSku, quantity);
            await updateItemQuantityHelper(productId, variantSku, quantity);
        },
        removeCartItem: async (productId: string, variantSku: string | undefined) => {
            if (!serverCart) return;
            // Try exact match first, then fallback to product_id only
            let item = serverCart.items.find(i => i.product_id === productId && i.metadata?.sku === variantSku);
            if (!item) {
                item = serverCart.items.find(i => i.product_id === productId);
            }
            if (item) {
                cartStore.removeCartItem(productId, variantSku);
                await removeCartItemMutation.mutateAsync({
                    cartId: serverCart.cart_id,
                    userId,
                    itemId: item.item_id
                });
            } else {
                console.warn(`[Cart] Item not found for removal: ${productId}`);
            }
        },
        // Direct item_id based operations (preferred for cart screen)
        updateItemById: updateItemByIdHelper,
        removeItemById: removeItemByIdHelper,
        addToCartMutation: addToCart,
        updateCartItemMutation: updateCartItem,
        clearCartMutation: clearCart,
        removeCartItemMutation,
        buyNow,
        restoreOriginalCart,
        getTempCart: cartStore.getTempCart,
        clearTempCart: cartStore.clearTempCart,
        isAdding: addToCart.isPending || addToCartBulk.isPending,
        isUpdating: updateCartItem.isPending,
        isRemoving: removeCartItemMutation.isPending,
    };
};
