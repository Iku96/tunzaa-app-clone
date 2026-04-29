import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SharedItem {
    id: string;
    type: 'product' | 'shop';
    title: string;
    image: string;
    shared_at: string;
}

interface SharesState {
  items: SharedItem[];
  addItem: (item: SharedItem) => void;
  clearItems: () => void;
}

export const useSharesStore = create<SharesState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        // Remove existing if same ID to update timestamp
        const filtered = items.filter(i => i.id !== item.id);
        set({ items: [item, ...filtered] });
      },
      clearItems: () => set({ items: [] }),
    }),
    {
      name: "shares-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
