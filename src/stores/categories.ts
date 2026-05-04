import { create } from "zustand";
import { useQuery } from "@tanstack/react-query";
import {
  categoriesApi,
  Category,
  CategoriesResponse,
} from "@/src/services/categories";

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  getTopCategories: () => Category[];
  getCategoryById: (id: string) => Category | undefined;
  getSubcategories: (parentId: string) => Category[];
}

// React Query hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
  });
};

export const useCategoryById = (id: string) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoriesApi.getCategoryById(id),
    enabled: !!id,
  });
};

// Zustand store for backward compatibility
export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  getTopCategories: () => {
    return get().categories.filter((category) => !category.parent_id);
  },

  getCategoryById: (id) => {
    return get().categories.find((category) => category.category_id === id);
  },

  getSubcategories: (parentId) => {
    return get().categories.filter(
      (category) => category.parent_id === parentId
    );
  },
}));

// Initialize store with React Query data
export const initializeCategoriesStore = (categories: Category[]) => {
  useCategoriesStore.setState({ categories });
};
