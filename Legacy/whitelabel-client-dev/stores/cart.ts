import React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  cartApi,
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
} from "@/services/cart";

// Custom storage adapter for cross-platform compatibility
export const createCrossPlatformStorage = () => ({
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      try {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(name);
      } catch (e) {
        console.error("Local storage is unavailable:", e);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(name);
      } catch (e) {
        console.error("SecureStore error:", e);
        return null;
      }
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(name, value);
        }
      } catch (e) {
        console.error("Local storage is unavailable:", e);
      }
    } else {
      try {
        await SecureStore.setItemAsync(name, value);
      } catch (e) {
        console.error("SecureStore error:", e);
      }
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(name);
        }
      } catch (e) {
        console.error("Local storage is unavailable:", e);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(name);
      } catch (e) {
        console.error("SecureStore error:", e);
      }
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
        currentCart = queryClient.getQueryData<Cart>(["cart", cartId]);

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
          sku: cartItem.metadata?.sku,
          currency: cartItem.metadata?.currency,
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
          existingItemsMap.set(itemKey, item);
        }
      });

      // Convert map back to array for API
      const allItems = Array.from(existingItemsMap.values());

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
              sale_price: 0
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
    }: {
      cartId: string;
      item: AddToCartRequest;
      existingCart?: Cart;
    }) => {
      // Use existing cart data if provided, otherwise get it from the cache
      let currentCart = existingCart;

      if (!currentCart) {
        // Try to get from cache first
        currentCart = queryClient.getQueryData<Cart>(["cart", cartId]);

        if (!currentCart) {
          // If not in cache, we need to get the user_id to fetch the cart
          // This is a fallback case - ideally we should always have the cart data
          console.warn('Cart not found in cache, cannot add item without existing cart data');
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
          sku: cartItem.metadata?.sku,
          currency: cartItem.metadata?.currency,
        });
      });

      // Check if the item already exists in the cart
      const itemKey = `${item.product_id}-${item.sku || 'default'}`;
      const existingItem = existingItemsMap.get(itemKey);

      if (existingItem) {
        // Item exists, update quantity
        existingItem.quantity += item.quantity;
        existingItemsMap.set(itemKey, existingItem);
      } else {
        // Item doesn't exist, add it
        existingItemsMap.set(itemKey, item);
      }

      // Convert map back to array for API
      const allItems = Array.from(existingItemsMap.values());


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
            added_at: new Date().toISOString(),
            metadata: { sku: item.sku, currency: item.currency },
            sale_price: 0
          });
        }

        queryClient.setQueryData(["cart", cartId], optimisticCart);
      }

      return { previousCart };
    },

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
      item,
    }: {
      cartId: string;
      item: RemoveCartItemRequest;
    }) => cartApi.removeCartItem(cartId, item),

    onMutate: async ({ cartId, item }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<Cart>(["cart", cartId]);

      if (previousCart) {
        const optimisticCart: Cart = {
          ...previousCart,
          items: previousCart.items.filter(
            (cartItem) => cartItem.item_id !== item.item_id
          ),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData(["cart", cartId], optimisticCart);
      }

      return { previousCart };
    },

    onSuccess: (data, variables) => {
      queryClient.setQueryData(["cart", data.user_id], data);
      queryClient.invalidateQueries({ queryKey: ["cartTotals", data.cart_id] });

      // Clear local cart tracking state for the removed item
      const removedItem = variables.item;
      cartStore.removeCartItem(removedItem.product_id, removedItem.metadata?.sku);
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

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const cartStore = useCartStore();

  return useMutation({
    mutationFn: ({ cartId }: { cartId: string }) => cartApi.clearCart(cartId),

    onMutate: async ({ cartId }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<Cart>(["cart", cartId]);

      if (previousCart) {
        const optimisticCart: Cart = {
          ...previousCart,
          items: [],
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData(["cart", cartId], optimisticCart);
      }

      return { previousCart };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["cart", data.user_id], data);
      queryClient.invalidateQueries({ queryKey: ["cartTotals", data.cart_id] });

      // Clear all local cart tracking state
      cartStore.clearCartItems();
      cartStore.clearAllTempQuantities();
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

  // console.log('serverCart', JSON.stringify(serverCart, null, 2));

  // Use ref to track previous cart state to prevent unnecessary updates
  const previousCartRef = React.useRef<Cart | null>(null);

  // Sync local cart tracking state with server state
  React.useEffect(() => {
    // Only update if server cart data has actually changed
    if (serverCart !== previousCartRef.current) {
      previousCartRef.current = serverCart || null;

      // Defer state updates until after render to prevent "setState during render" warnings
      const updateCartState = () => {
        if (serverCart) {
          // Create a map of server items for efficient comparison
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

          // Create a map of current local items
          const localItemsMap = new Map();
          cartStore.cartItems.forEach(item => {
            const key = `${item.product_id}-${item.variant_sku || 'default'}`;
            localItemsMap.set(key, item);
          });

          // Check if maps are different
          const needsUpdate = serverItemsMap.size !== localItemsMap.size ||
            Array.from(serverItemsMap.keys()).some(key => {
              const serverItem = serverItemsMap.get(key);
              const localItem = localItemsMap.get(key);
              return !localItem ||
                localItem.quantity !== serverItem.quantity ||
                localItem.item_id !== serverItem.item_id;
            });

          if (needsUpdate) {

            // Clear all local cart items and re-add only those that exist on server
            cartStore.clearCartItems();

            // Add back only the items that exist on the server
            serverItemsMap.forEach(item => {
              cartStore.addCartItem(item);
            });
          } else {
            // console.log('Cart sync: No update needed, local state is in sync');
          }
        } else {
          // console.log('Cart sync: No server cart, clearing local state');
          // If no server cart, clear all local tracking
          cartStore.clearCartItems();
          cartStore.clearAllTempQuantities();
        }
      };

      // Use setTimeout to defer state updates until after the current render cycle
      setTimeout(updateCartState, 0);
    }
  }, [serverCart]); // Remove cartStore from dependencies to prevent infinite loops

  // Combined item count (server + optimistic)
  const getTotalItemCount = () => {
    const serverCount =
      serverCart?.items.reduce((count, item) => count + item.quantity, 0) || 0;
    const optimisticCount = cartStore.getOptimisticItemCount();
    return serverCount + optimisticCount;
  };

  // Check if cart has any items
  const hasItems = () => {
    return getTotalItemCount() > 0;
  };

  // Add item with optimistic update
  const addItem = async (item: AddToCartRequest, variantSku?: string) => {
    if (!serverCart) return;

    // Add optimistic item immediately
    cartStore.addOptimisticItem(item);

    // Track item in cart
    cartStore.addCartItem({
      product_id: item.product_id,
      variant_sku: variantSku,
      quantity: item.quantity,
    });

    try {
      // Add to server - pass existing cart data so we can merge items properly
      // console.log("serverCart", serverCart);
      await addToCart.mutateAsync({
        cartId: serverCart.cart_id,
        item,
        existingCart: serverCart
      });
    } catch (error) {
      // Remove optimistic item on error
      console.error("Failed to add item to cart:", error);
      // Remove the cart tracking on error (optimistic items are cleared on success)
      cartStore.removeCartItem(item.product_id, variantSku);
    }
  };

  // Buy Now functionality - save current cart and create new cart with single item
  const buyNow = async (item: AddToCartRequest, variantSku?: string) => {
    if (!serverCart) return;

    try {
      // 1. Save current cart to temporary storage
      cartStore.saveTempCart(serverCart);
      // console.log('Saved current cart to temporary storage');

      // 2. Create new cart with just the selected item
      // We'll use the addToCart API with only this item (no existing items)
      const newCartData = await addToCart.mutateAsync({
        cartId: serverCart.cart_id,
        item,
        existingCart: { ...serverCart, items: [] } // Empty items array to create new cart
      });

      // console.log('Created new cart for Buy Now:', newCartData);
      return newCartData;
    } catch (error) {
      console.error("Failed to process Buy Now:", error);
      throw error;
    }
  };

  // Restore original cart from temporary storage
  const restoreOriginalCart = async () => {
    const tempCart = cartStore.getTempCart();
    if (!tempCart?.cart) {
      // console.log('No temporary cart to restore');
      return null;
    }

    try {
      // Convert the saved cart items to AddToCartRequest format
      const itemsToRestore = tempCart.cart.items.map(cartItem => ({
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        sku: cartItem.metadata?.sku,
        currency: cartItem.metadata?.currency,
      }));

      if (itemsToRestore.length === 0) {
        // console.log('No items to restore');
        cartStore.clearTempCart();
        return null;
      }

      // Use bulk add to restore all items
      const restoredCart = await addToCartBulk.mutateAsync({
        cartId: tempCart.cart.cart_id,
        items: itemsToRestore,
        existingCart: { ...tempCart.cart, items: [] } // Start with empty cart
      });

      // console.log('Restored original cart:', restoredCart);

      // Clear temporary cart after successful restoration
      cartStore.clearTempCart();

      return restoredCart;
    } catch (error) {
      console.error("Failed to restore original cart:", error);
      throw error;
    }
  };

  // Update cart item quantity on server
  const updateItemQuantity = async (productId: string, variantSku: string | undefined, quantity: number) => {
    if (!serverCart) return;

    // Find the cart item
    const cartItem = serverCart.items.find(item =>
      item.product_id === productId &&
      item.metadata?.sku === variantSku
    );

    if (cartItem) {
      try {
        const data = {
          cartId: serverCart.cart_id,
          itemId: cartItem.item_id,
          update: { quantity }
        };

        await updateCartItem.mutateAsync({
          cartId: serverCart.cart_id,
          itemId: cartItem.product_id,
          update: { quantity }
        });
      } catch (error) {
        console.error("Failed to update cart item quantity:", error);
      }
    }
  };

  return {
    cart: serverCart,
    isLoading: isLoading || addToCart.isPending,
    error: error || addToCart.error,
    optimisticItems: cartStore.optimisticItems,

    // Actions
    addItem,
    refetch,

    // Getters
    getTotalItemCount,
    hasItems,

    // Cart tracking methods
    getCartItemQuantity: cartStore.getCartItemQuantity,
    getTempQuantity: cartStore.getTempQuantity,
    isInCart: cartStore.isInCart,
    setTempQuantity: cartStore.setTempQuantity,
    clearTempQuantity: cartStore.clearTempQuantity,
    addCartItem: cartStore.addCartItem,
    updateCartItemQuantity: async (productId: string, variantSku: string | undefined, quantity: number) => {
      // Update local state
      cartStore.updateCartItemQuantity(productId, variantSku, quantity);
      // Update server state
      await updateItemQuantity(productId, variantSku, quantity);
    },

    // Mutations
    addToCartMutation: addToCart,
    updateCartItemMutation: updateCartItem,

    // Buy Now functionality
    buyNow,
    restoreOriginalCart,
    getTempCart: cartStore.getTempCart,
    clearTempCart: cartStore.clearTempCart,
  };
};
