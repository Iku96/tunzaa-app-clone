import { useQuery } from "@tanstack/react-query";
import { categoriesApi, type Category } from "@/src/services/categories";

export interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch categories from the API
 */
export function useCategories(): UseCategoriesResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    categories: data?.items || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to get active categories only
 */
export function useActiveCategories(): UseCategoriesResult {
  const { categories, isLoading, error, refetch } = useCategories();

  return {
    categories: categories.filter((category) => category.is_active),
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get categories as simple string array for forms
 */
export function useCategoryNames(): {
  categoryNames: string[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { categories, isLoading, error, refetch } = useActiveCategories();

  return {
    categoryNames: categories.map((category) => category.name),
    isLoading,
    error,
    refetch,
  };
}
