import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SearchHistoryItem {
    id: string;
    name: string;
    avatar?: string;
    location?: string;
    joinedDate?: string;
    isVerified?: boolean;
    type: 'shop' | 'user' | 'product';
    timestamp: number;
}

interface SearchHistoryState {
    history: SearchHistoryItem[];
    addItem: (item: Omit<SearchHistoryItem, 'timestamp'>) => void;
    removeItem: (id: string) => void;
    clearAll: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
    persist(
        (set) => ({
            history: [],

            addItem: (item) => {
                set((state) => {
                    // Remove if already exists to move it to the top
                    const filtered = state.history.filter((i) => i.id !== item.id);
                    const newItem: SearchHistoryItem = {
                        ...item,
                        timestamp: Date.now(),
                    };
                    // Keep only last 20 searches
                    return {
                        history: [newItem, ...filtered].slice(0, 20),
                    };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    history: state.history.filter((i) => i.id !== id),
                }));
            },

            clearAll: () => {
                set({ history: [] });
            },
        }),
        {
            name: 'search-history-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export const useSearchHistory = () => {
    const addItem = useSearchHistoryStore((state) => state.addItem);
    const removeItem = useSearchHistoryStore((state) => state.removeItem);
    const clearAll = useSearchHistoryStore((state) => state.clearAll);
    const history = useSearchHistoryStore((state) => state.history);

    return { history, addItem, removeItem, clearAll };
};
