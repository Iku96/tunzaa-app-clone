export interface RecommendationItem {
  image_url: string;
  price: any;
  title: string;
  item_id: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface BaseRecommendationResponse {
  recommendations: RecommendationItem[];
  scenario: string;
  user_id: string | null;
  tenant_id: string;
  total_count: number;
  request_id: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface PersonalizedRecommendationResponse
  extends BaseRecommendationResponse {
  scenario:
    | "homepage"
    | "user-profile"
    | "email-campaign"
    | "search-personalized"
    | "cart-complementary"
    | "post-purchase";
  metadata: {
    personalized: boolean;
    filters_applied?: string;
  };
}

export interface SimilarItemsResponse extends BaseRecommendationResponse {
  scenario: "similar-items";
  user_id: null;
  metadata: {
    source_item_id: string;
    personalized: false;
  };
}

export interface TrendingItemsResponse extends BaseRecommendationResponse {
  scenario: "trending";
  user_id: null;
  metadata: {
    time_period: "day" | "week" | "month";
    category_id: string | null;
    filters_applied: string;
  };
}

export interface CategoryPopularResponse extends BaseRecommendationResponse {
  scenario: "category-popular";
  metadata: {
    category_id: string;
    personalized: boolean;
    filters_applied: string;
  };
}

export interface InteractionTrackingRequest {
  user_id: string;
  item_id: string;
  interaction_type:
    | "view"
    | "click"
    | "purchase"
    | "add_to_cart"
    | "remove_from_cart"
    | "rating"
    | "review";
  scenario: string;
  value?: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface InteractionTrackingResponse {
  message: string;
  interaction_id: string;
  timestamp: string;
}

export interface PersonalizedSearchRequest {
  user_id: string;
  query: string;
  count?: number;
  filters?: {
    price_min?: number;
    price_max?: number;
    category?: string;
    brand?: string;
    [key: string]: any;
  };
}

export interface PersonalizedSearchResponse extends BaseRecommendationResponse {
  scenario: "search-personalized";
  metadata: {
    query: string;
    filters_applied: string;
    personalized: boolean;
  };
}

export interface RecommendationScenarios {
  personalized: string[];
  item_based: string[];
  contextual: string[];
}

export type RecommendationScenario =
  | "homepage"
  | "user-profile"
  | "email-campaign"
  | "similar-items"
  | "product-detail"
  | "frequently-bought-together"
  | "trending"
  | "category-popular"
  | "search-personalized"
  | "cart-complementary"
  | "post-purchase";
