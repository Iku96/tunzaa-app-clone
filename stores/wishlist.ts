import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { WishlistItem } from "@/src/services/types/wishlist";

interface WishlistState {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: WishlistItem[]) => void;
  setCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string, variantSku?: string) => void;
  clearItems: () => void;
  updateItem: (wishlistId: string, updates: Partial<WishlistItem>) => void;
  isInWishlist: (productId: string, variantSku?: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      isLoading: false,
      error: null,

      setItems: (items) => set({ items, count: items.length }),
      setCount: (count) => set({ count }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      addItem: (item) => {
        const { items } = get();
        // Check if item already exists
        const existingIndex = items.findIndex(
          (existing) =>
            existing.product_id === item.product_id &&
            existing.variant_sku === item.variant_sku
        );

        if (existingIndex >= 0) {
          // Update existing item
          const updatedItems = [...items];
          updatedItems[existingIndex] = item;
          set({ items: updatedItems, count: updatedItems.length });
        } else {
          // Add new item
          set({ items: [...items, item], count: items.length + 1 });
        }
      },

      removeItem: (productId, variantSku) => {
        const { items } = get();
        const filteredItems = items.filter(
          (item) =>
            !(item.product_id === productId && item.variant_sku === variantSku)
        );
        set({ items: filteredItems, count: filteredItems.length });
      },

      clearItems: () => set({ items: [], count: 0 }),

      updateItem: (wishlistId, updates) => {
        const { items } = get();
        const updatedItems = items.map((item) =>
          item.wishlist_id === wishlistId ? { ...item, ...updates } : item
        );
        set({ items: updatedItems });
      },

      isInWishlist: (productId, variantSku) => {
        const { items } = get();
        return items.some(
          (item) =>
            item.product_id === productId && item.variant_sku === variantSku
        );
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        count: state.count,
      }),
    }
  )
); 