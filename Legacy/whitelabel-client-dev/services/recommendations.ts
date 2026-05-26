import { apiClient } from "./client";
import type {
  PersonalizedRecommendationResponse,
  SimilarItemsResponse,
  TrendingItemsResponse,
  CategoryPopularResponse,
  InteractionTrackingRequest,
  InteractionTrackingResponse,
  PersonalizedSearchRequest,
  PersonalizedSearchResponse,
  RecommendationScenarios,
  RecommendationScenario,
} from "./types/recommendations";

export interface PersonalizedRecommendationParams {
  scenario: RecommendationScenario;
  count?: number;
  filters?: Record<string, any>;
}

export interface SimilarItemsParams {
  count?: number;
}

export interface TrendingItemsParams {
  count?: number;
  time_period?: "day" | "week" | "month";
  category_id?: string;
}

export interface CategoryPopularParams {
  count?: number;
  user_id?: string;
}

export const recommendationsApi = {
  /**
   * Get available recommendation scenarios
   */
  getScenarios: async (): Promise<RecommendationScenarios> => {
    const response = await apiClient.get<RecommendationScenarios>(
      "recommendations/scenarios"
    );
    return response.data;
  },

  /**
   * Get personalized recommendations for a user
   */
  getPersonalizedRecommendations: async (
    userId: string,
    params: PersonalizedRecommendationParams
  ): Promise<PersonalizedRecommendationResponse> => {
    const response = await apiClient.get<PersonalizedRecommendationResponse>(
      `recommendations/user/${userId}/personalized`,
      {
        params: {
          scenario: params.scenario,
          count: params.count || 10,
          ...params.filters,
        },
      }
    );
    return response.data;
  },

  /**
   * Get similar items for a product
   */
  getSimilarItems: async (
    productId: string,
    params?: SimilarItemsParams
  ): Promise<SimilarItemsResponse> => {
    const response = await apiClient.get<SimilarItemsResponse>(
      `recommendations/item/${productId}/similar`,
      {
        params: {
          count: params?.count || 10,
        },
      }
    );
    return response.data;
  },

  /**
   * Get trending items
   */
  getTrendingItems: async (
    params?: TrendingItemsParams
  ): Promise<TrendingItemsResponse> => {
    const response = await apiClient.get<TrendingItemsResponse>(
      "recommendations/trending",
      {
        params: {
          count: params?.count || 10,
          time_period: params?.time_period || "week",
          category_id: params?.category_id,
        },
      }
    );
    return response.data;
  },

  /**
   * Get popular items by category
   */
  getCategoryPopular: async (
    categoryId: string,
    params?: CategoryPopularParams
  ): Promise<CategoryPopularResponse> => {
    const response = await apiClient.get<CategoryPopularResponse>(
      `recommendations/category/${categoryId}/popular`,
      {
        params: {
          count: params?.count || 10,
          user_id: params?.user_id,
        },
      }
    );
    return response.data;
  },

  /**
   * Get personalized search recommendations
   */
  getPersonalizedSearch: async (
    searchRequest: PersonalizedSearchRequest
  ): Promise<PersonalizedSearchResponse> => {
    const response = await apiClient.post<PersonalizedSearchResponse>(
      "recommendations/search/personalized",
      searchRequest
    );
    return response.data;
  },

  /**
   * Track user interactions with recommended items
   */
  trackInteraction: async (
    interaction: InteractionTrackingRequest
  ): Promise<InteractionTrackingResponse> => {
    const response = await apiClient.post<InteractionTrackingResponse>(
      "recommendations/interactions/track",
      interaction
    );
    return response.data;
  },

  /**
   * Track multiple interactions in batch
   */
  trackInteractionsBatch: async (
    interactions: InteractionTrackingRequest[]
  ): Promise<{ interactions: InteractionTrackingResponse[] }> => {
    const response = await apiClient.post<{
      interactions: InteractionTrackingResponse[];
    }>("recommendations/interactions/track/batch", { interactions });
    return response.data;
  },

  /**
   * Get homepage recommendations (convenience method)
   */
  getHomepageRecommendations: async (
    userId: string,
    count?: number
  ): Promise<PersonalizedRecommendationResponse> => {
    return recommendationsApi.getPersonalizedRecommendations(userId, {
      scenario: "homepage",
      count: count || 10,
    });
  },

  /**
   * Get product detail page recommendations (convenience method)
   */
  getProductDetailRecommendations: async (
    productId: string,
    count?: number
  ): Promise<SimilarItemsResponse> => {
    return recommendationsApi.getSimilarItems(productId, { count: count || 5 });
  },

  /**
   * Get email campaign recommendations (convenience method)
   */
  getEmailCampaignRecommendations: async (
    userId: string,
    count?: number
  ): Promise<PersonalizedRecommendationResponse> => {
    return recommendationsApi.getPersonalizedRecommendations(userId, {
      scenario: "email-campaign",
      count: count || 5,
    });
  },

  /**
   * Get cart complementary recommendations (convenience method)
   */
  getCartComplementaryRecommendations: async (
    userId: string,
    count?: number
  ): Promise<PersonalizedRecommendationResponse> => {
    return recommendationsApi.getPersonalizedRecommendations(userId, {
      scenario: "cart-complementary",
      count: count || 3,
    });
  },
};
