import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Simple local cart item
export interface LocalCartItem {
  product_id: string;
  variant_sku?: string;
  quantity: number;
  name?: string;
  price?: number;
  image_url?: string;
  currency: string;
}

// Cart context types
type CartContext = 'normal' | 'buy_now';

interface SimplifiedCartState {
  // Single local cart - no server sync until checkout
  items: LocalCartItem[];
  context: CartContext;
  
  // Buy Now backup (for restoration)
  savedItems: LocalCartItem[];
  
  // Actions
  addItem: (item: LocalCartItem) => void;
  removeItem: (productId: string, variantSku?: string) => void;
  updateQuantity: (productId: string, variantSku: string | undefined, quantity: number) => void;
  clearCart: () => void;
  
  // Buy Now specific
  initBuyNow: (item: LocalCartItem) => void;
  restoreFromBuyNow: () => void;
  
  // Checkout specific
  prepareForCheckout: () => LocalCartItem[];
  clearAfterOrder: () => void;
  
  // Getters
  getTotalItems: () => number;
  hasItems: () => boolean;
  getItem: (productId: string, variantSku?: string) => LocalCartItem | undefined;
}

const createCrossPlatformStorage = () => ({
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(name);
    } else {
      return await SecureStore.getItemAsync(name);
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(name, value);
    } else {
      await SecureStore.setItemAsync(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(name);
    } else {
      await SecureStore.deleteItemAsync(name);
    }
  },
});

export const useSimplifiedCart = create<SimplifiedCartState>()(
  persist(
    (set, get) => ({
      items: [],
      context: 'normal',
      savedItems: [],

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.product_id === item.product_id && i.variant_sku === item.variant_sku
          );

          if (existingIndex >= 0) {
            // Update existing item
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + item.quantity,
            };
            return { items: updatedItems };
          } else {
            // Add new item
            return { items: [...state.items, item] };
          }
        });
      },

      removeItem: (productId, variantSku) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product_id === productId && item.variant_sku === variantSku)
          ),
        }));
      },

      updateQuantity: (productId, variantSku, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId && item.variant_sku === variantSku
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], context: 'normal' });
      },

      initBuyNow: (item) => {
        set((state) => ({
          savedItems: state.items, // Save current cart
          items: [item], // Replace with single item
          context: 'buy_now',
        }));
      },

      restoreFromBuyNow: () => {
        set((state) => ({
          items: state.savedItems, // Restore original cart
          savedItems: [],
          context: 'normal',
        }));
      },

      prepareForCheckout: () => {
        const { items } = get();
        return items;
      },

      clearAfterOrder: () => {
        set({ 
          items: [], 
          savedItems: [], 
          context: 'normal' 
        });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      hasItems: () => {
        const { items } = get();
        return items.length > 0;
      },

      getItem: (productId, variantSku) => {
        const { items } = get();
        return items.find(
          (item) => item.product_id === productId && item.variant_sku === variantSku
        );
      },
    }),
    {
      name: "simplified-cart-storage",
      storage: createJSONStorage(() => createCrossPlatformStorage()),
    }
  )
);

// Hook for checkout-specific operations
export const useCheckoutCart = () => {
  const cart = useSimplifiedCart();
  
  const syncToServer = async (userId: string) => {
    const items = cart.prepareForCheckout();
    
    if (items.length === 0) {
      throw new Error("No items to checkout");
    }

    try {
      // Import cart API dynamically to avoid circular dependencies
      const { cartApi } = await import("@/src/services/cart");

      // Get or create cart first
      const serverCart = await cartApi.getOrCreateCart(userId);

      // Convert local items to server format
      const serverItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        sku: item.variant_sku,
        currency: item.currency,
      }));

      // Replace cart contents with local items
      const updatedCart = await cartApi.addToCart(serverCart.cart_id, serverItems);
      
      return updatedCart;
    } catch (error) {
      console.error('Failed to sync cart to server:', error);
      throw error;
    }
  };

  return {
    ...cart,
    syncToServer,
  };
}; 