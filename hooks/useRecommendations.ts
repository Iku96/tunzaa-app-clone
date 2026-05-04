import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recommendationsApi } from "@/src/services/recommendations";
import type {
  PersonalizedRecommendationResponse,
  SimilarItemsResponse,
  TrendingItemsResponse,
  CategoryPopularResponse,
  PersonalizedSearchResponse,
  RecommendationScenarios,
  RecommendationScenario,
  InteractionTrackingRequest,
  PersonalizedSearchRequest,
} from "@/src/services/types/recommendations";

// Query Keys
const RECOMMENDATION_QUERY_KEYS = {
  all: ["recommendations"] as const,
  scenarios: () => [...RECOMMENDATION_QUERY_KEYS.all, "scenarios"] as const,
  personalized: (userId: string) =>
    [...RECOMMENDATION_QUERY_KEYS.all, "personalized", userId] as const,
  personalizedWithScenario: (
    userId: string,
    scenario: RecommendationScenario
  ) => [...RECOMMENDATION_QUERY_KEYS.personalized(userId), scenario] as const,
  similar: (productId: string) =>
    [...RECOMMENDATION_QUERY_KEYS.all, "similar", productId] as const,
  trending: () => [...RECOMMENDATION_QUERY_KEYS.all, "trending"] as const,
  trendingWithParams: (timePeriod: string, categoryId?: string) =>
    [...RECOMMENDATION_QUERY_KEYS.trending(), timePeriod, categoryId] as const,
  categoryPopular: (categoryId: string) =>
    [...RECOMMENDATION_QUERY_KEYS.all, "category", categoryId] as const,
  categoryPopularWithUser: (categoryId: string, userId?: string) =>
    [...RECOMMENDATION_QUERY_KEYS.categoryPopular(categoryId), userId] as const,
  search: () => [...RECOMMENDATION_QUERY_KEYS.all, "search"] as const,
};

/**
 * Hook to get available recommendation scenarios
 */
export function useRecommendationScenarios() {
  return useQuery({
    queryKey: RECOMMENDATION_QUERY_KEYS.scenarios(),
    queryFn: recommendationsApi.getScenarios,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to get personalized recommendations
 */
export function usePersonalizedRecommendations(
  userId: string,
  scenario: RecommendationScenario,
  count?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: RECOMMENDATION_QUERY_KEYS.personalizedWithScenario(
      userId,
      scenario
    ),
    queryFn: () =>
      recommendationsApi.getPersonalizedRecommendations(userId, {
        scenario,
        count,
      }),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get homepage recommendations
 */
export function useHomepageRecommendations(
  userId: string,
  count?: number,
  enabled: boolean = true
) {
  return usePersonalizedRecommendations(userId, "homepage", count, enabled);
}

/**
 * Hook to get user profile recommendations
 */
export function useUserProfileRecommendations(
  userId: string,
  count?: number,
  enabled: boolean = true
) {
  return usePersonalizedRecommendations(userId, "user-profile", count, enabled);
}

/**
 * Hook to get email campaign recommendations
 */
export function useEmailCampaignRecommendations(
  userId: string,
  count?: number,
  enabled: boolean = true
) {
  return usePersonalizedRecommendations(
    userId,
    "email-campaign",
    count,
    enabled
  );
}

/**
 * Hook to get cart complementary recommendations
 */
export function useCartComplementaryRecommendations(
  userId: string,
  count?: number,
  enabled: boolean = true
) {
  return usePersonalizedRecommendations(
    userId,
    "cart-complementary",
    count,
    enabled
  );
}

/**
 * Hook to get similar items recommendations
 */
export function useSimilarItems(
  productId: string,
  count?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: RECOMMENDATION_QUERY_KEYS.similar(productId),
    queryFn: () => recommendationsApi.getSimilarItems(productId, { count }),
    enabled: enabled && !!productId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get trending items
 */
export function useTrendingItems(
  count?: number,
  timePeriod: "day" | "week" | "month" = "week",
  categoryId?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: RECOMMENDATION_QUERY_KEYS.trendingWithParams(
      timePeriod,
      categoryId
    ),
    queryFn: () =>
      recommendationsApi.getTrendingItems({
        count,
        time_period: timePeriod,
        category_id: categoryId,
      }),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

/**
 * Hook to get category popular items
 */
export function useCategoryPopular(
  categoryId: string,
  userId?: string,
  count?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: RECOMMENDATION_QUERY_KEYS.categoryPopularWithUser(
      categoryId,
      userId
    ),
    queryFn: () =>
      recommendationsApi.getCategoryPopular(categoryId, {
        count,
        user_id: userId,
      }),
    enabled: enabled && !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

/**
 * Hook to perform personalized search
 */
export function usePersonalizedSearch() {
  return useMutation({
    mutationFn: (request: PersonalizedSearchRequest) =>
      recommendationsApi.getPersonalizedSearch(request),
  });
}

/**
 * Hook to track recommendation interactions
 */
export function useTrackInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interaction: InteractionTrackingRequest) =>
      recommendationsApi.trackInteraction(interaction),
    onSuccess: (data, variables) => {
      // Optionally invalidate related queries to refresh recommendations
      // This can help improve future recommendations based on the tracked interaction
      queryClient.invalidateQueries({
        queryKey: RECOMMENDATION_QUERY_KEYS.personalized(variables.user_id),
      });
    },
  });
}

/**
 * Hook to track multiple interactions in batch
 */
export function useTrackInteractionsBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interactions: InteractionTrackingRequest[]) =>
      recommendationsApi.trackInteractionsBatch(interactions),
    onSuccess: (data, variables) => {
      // Invalidate queries for all users involved in the batch
      const userIds = [
        ...new Set(variables.map((interaction) => interaction.user_id)),
      ];
      userIds.forEach((userId) => {
        queryClient.invalidateQueries({
          queryKey: RECOMMENDATION_QUERY_KEYS.personalized(userId),
        });
      });
    },
  });
}

// Convenience hooks for specific scenarios

/**
 * Hook to get and track homepage recommendations with automatic interaction tracking
 */
export function useHomepageRecommendationsWithTracking(
  userId: string,
  count?: number
) {
  const recommendations = useHomepageRecommendations(userId, count);
  const trackInteraction = useTrackInteraction();

  const trackView = (itemId: string) => {
    trackInteraction.mutate({
      user_id: userId,
      item_id: itemId,
      interaction_type: "view",
      scenario: "homepage",
    });
  };

  const trackClick = (itemId: string) => {
    trackInteraction.mutate({
      user_id: userId,
      item_id: itemId,
      interaction_type: "click",
      scenario: "homepage",
    });
  };

  return {
    ...recommendations,
    trackView,
    trackClick,
  };
}

/**
 * Hook to get and track similar items with automatic interaction tracking
 */
export function useSimilarItemsWithTracking(productId: string, count?: number) {
  const recommendations = useSimilarItems(productId, count);
  const trackInteraction = useTrackInteraction();

  const trackView = (itemId: string) => {
    trackInteraction.mutate({
      user_id: "", // Note: Similar items don't require user_id, but tracking does
      item_id: itemId,
      interaction_type: "view",
      scenario: "similar-items",
    });
  };

  const trackClick = (itemId: string) => {
    trackInteraction.mutate({
      user_id: "", // Note: You'll want to get the actual user_id from auth context
      item_id: itemId,
      interaction_type: "click",
      scenario: "similar-items",
    });
  };

  return {
    ...recommendations,
    trackView,
    trackClick,
  };
}

/**
 * Hook to get and track trending items with automatic interaction tracking
 */
export function useTrendingItemsWithTracking(
  count?: number,
  timePeriod: "day" | "week" | "month" = "week",
  categoryId?: string
) {
  const recommendations = useTrendingItems(count, timePeriod, categoryId);
  const trackInteraction = useTrackInteraction();

  const trackView = (itemId: string, userId: string) => {
    trackInteraction.mutate({
      user_id: userId,
      item_id: itemId,
      interaction_type: "view",
      scenario: "trending",
    });
  };

  const trackClick = (itemId: string, userId: string) => {
    trackInteraction.mutate({
      user_id: userId,
      item_id: itemId,
      interaction_type: "click",
      scenario: "trending",
    });
  };

  return {
    ...recommendations,
    trackView,
    trackClick,
  };
}
