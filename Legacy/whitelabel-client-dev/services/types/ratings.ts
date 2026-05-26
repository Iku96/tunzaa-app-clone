// Ratings & Reviews API Types

export interface Rating {
  rating_id: string;
  tenant_id: string;
  entity_id: string;
  entity_type?: string;
  user_id: string;
  score: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  is_verified_purchase: boolean;
  media_urls: string[];
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface RatingsSummary {
  summary_id: string;
  tenant_id: string;
  entity_id: string;
  entity_type: string;
  average_rating: number;
  total_ratings: number;
  total_reviews: number;
  rating_distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  last_updated: string;
}

export interface EntityRatingResponse {
  items: Rating[];
  total: number;
  average: number;
  distribution: Record<string, number>;
  skip: number;
  limit: number;
}

export interface EntityReviewsResponse {
  items: Rating[];
  total: number;
  rating_summary: {
    average: number;
    total_ratings: number;
    distribution: Record<string, number>;
  };
  skip: number;
  limit: number;
}

export interface CreateRatingBody {
  entity_id: string;
  entity_type: string;
  user_id: string;
  score: number;
  content: string;
  media_urls?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateRatingBody {
  score?: number;
  content?: string;
  media_urls?: string[];
  is_verified_purchase?: boolean;
  metadata?: Record<string, any>;
}

export interface GetEntityRatingsParams {
  skip?: number;
  limit?: number;
}

export interface GetEntityReviewsParams {
  status?: 'pending' | 'approved' | 'rejected';
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_direction?: 1 | -1;
}

export type EntityType = 'product' | 'store' | 'vendor' | 'delivery';

export interface RatingError {
  message: string;
  status: number;
  code?: string;
  details?: any;
} 