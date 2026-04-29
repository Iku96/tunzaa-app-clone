import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LikedItem {
    product_id: string;
    liked_at: string;
}

interface LikesState {
    items: LikedItem[];
    addItem: (productId: string) => void;
    removeItem: (productId: string) => void;
    isLiked: (productId: string) => boolean;
    clearLikes: () => void;
}

export const useLikesStore = create<LikesState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (productId) => {
                const { items } = get();
                if (!items.find(i => i.product_id === productId)) {
                    set({
                        items: [
                            ...items,
                            { product_id: productId, liked_at: new Date().toISOString() }
                        ]
                    });
                }
            },
            removeItem: (productId) => {
                set({
                    items: get().items.filter(i => i.product_id !== productId)
                });
            },
            isLiked: (productId) => {
                return get().items.some(i => i.product_id === productId);
            },
            clearLikes: () => set({ items: [] }),
        }),
        {
            name: 'likes-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
