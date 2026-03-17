import { useQuery } from "@tanstack/react-query";
import { recommendationsApi } from "@/services/recommendations";
import { useProducts } from "@/stores/products";
import { useAuth } from "@/context/auth";
import React from "react";

interface UseOptimizedRecommendationsOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

/**
 * Optimized hook for homepage recommendations that prevents performance issues
 */
export function useOptimizedHomepageRecommendations(
  count: number = 10,
  options: UseOptimizedRecommendationsOptions = {}
) {
  const { user } = useAuth();
  const isLoggedIn = !!user?.user_id;

  // Only enable recommendations for logged-in users
  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", "homepage", user?.user_id, count],
    queryFn: () =>
      recommendationsApi.getPersonalizedRecommendations(user!.user_id, {
        scenario: "homepage",
        count,
      }),
    enabled: isLoggedIn && options.enabled !== false,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime || 10 * 60 * 1000, // 10 minutes
    retry: 1, // Reduce retries to prevent API spam
  });

  // Only fetch fallback when needed
  const fallbackQuery = useProducts({
    is_featured: true,
    limit: count,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  });

  // Determine what to show
  const shouldUseFallback = !isLoggedIn || recommendationsQuery.isError;
  const isLoading = isLoggedIn
    ? recommendationsQuery.isLoading
    : fallbackQuery.isLoading;
  const error = isLoggedIn ? recommendationsQuery.error : fallbackQuery.error;

  const data = React.useMemo(() => {
    if (shouldUseFallback) {
      return fallbackQuery.data?.items || [];
    }
    // For now, return fallback until we implement product fetching by IDs
    return fallbackQuery.data?.items || [];
  }, [shouldUseFallback, fallbackQuery.data, recommendationsQuery.data]);

  return {
    data,
    isLoading,
    error,
    isRecommendations: isLoggedIn && !recommendationsQuery.isError,
    refetch: isLoggedIn ? recommendationsQuery.refetch : fallbackQuery.refetch,
  };
}

/**
 * Optimized hook for similar items that reduces API calls
 */
export function useOptimizedSimilarItems(
  productId: string,
  count: number = 6,
  options: UseOptimizedRecommendationsOptions = {}
) {
  const similarQuery = useQuery({
    queryKey: ["recommendations", "similar", productId, count],
    queryFn: () => recommendationsApi.getSimilarItems(productId, { count }),
    enabled: !!productId && options.enabled !== false,
    staleTime: options.staleTime || 15 * 60 * 1000, // 15 minutes
    gcTime: options.cacheTime || 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  return similarQuery;
}

/**
 * Optimized hook for trending items with better caching
 */
export function useOptimizedTrendingItems(
  count: number = 10,
  timePeriod: "day" | "week" | "month" = "week",
  options: UseOptimizedRecommendationsOptions = {}
) {
  const trendingQuery = useQuery({
    queryKey: ["recommendations", "trending", timePeriod, count],
    queryFn: () =>
      recommendationsApi.getTrendingItems({ count, time_period: timePeriod }),
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime || 20 * 60 * 1000, // 20 minutes
    retry: 1,
  });

  return trendingQuery;
}

/**
 * Optimized hook for category popular items
 */
export function useOptimizedCategoryPopular(
  categoryId: string,
  userId?: string,
  count: number = 10,
  options: UseOptimizedRecommendationsOptions = {}
) {
  const categoryQuery = useQuery({
    queryKey: [
      "recommendations",
      "category-popular",
      categoryId,
      userId,
      count,
    ],
    queryFn: () =>
      recommendationsApi.getCategoryPopular(categoryId, {
        count,
        user_id: userId,
      }),
    enabled: !!categoryId && options.enabled !== false,
    staleTime: options.staleTime || 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime || 20 * 60 * 1000, // 20 minutes
    retry: 1,
  });

  return categoryQuery;
}
