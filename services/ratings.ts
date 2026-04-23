import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  Rating,
  RatingsSummary,
  EntityRatingResponse,
  EntityReviewsResponse,
  CreateRatingBody,
  UpdateRatingBody,
  GetEntityRatingsParams,
  GetEntityReviewsParams,
  EntityType,
} from "./types/ratings";

// Rating API Functions
export const ratingsApi = {
  // Create a new rating
  createRating: async (data: CreateRatingBody): Promise<Rating> => {
    console.log("createRating data", data);
    const response = await apiClient.post<Rating>("ratings/", data);
    console.log("createRating response", response.data);
    return response.data;
  },

  // Get a specific rating by ID
  getRatingById: async (ratingId: string): Promise<Rating> => {
    const response = await apiClient.get<Rating>(`ratings/${ratingId}`);
    return response.data;
  },

  // Update an existing rating
  updateRating: async (ratingId: string, data: UpdateRatingBody): Promise<Rating> => {
    const response = await apiClient.put<Rating>(`ratings/${ratingId}`, data);
    return response.data;
  },

  // Delete a rating
  deleteRating: async (ratingId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`ratings/${ratingId}`);
    return response.data;
  },

  // Get all ratings for a specific entity
  getEntityRatings: async (
    entityId: string,
    params?: GetEntityRatingsParams
  ): Promise<EntityRatingResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }

    const response = await apiClient.get<EntityRatingResponse>(
      `ratings/entities/${entityId}/ratings?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get reviews (ratings with content) for a specific entity
  getEntityReviews: async (
    entityId: string,
    params?: GetEntityReviewsParams
  ): Promise<EntityReviewsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.status) {
      searchParams.append("status", params.status);
    }
    if (params?.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params?.sort_by) {
      searchParams.append("sort_by", params.sort_by);
    }
    if (params?.sort_direction !== undefined) {
      searchParams.append("sort_direction", params.sort_direction.toString());
    }

    const response = await apiClient.get<EntityReviewsResponse>(
      `ratings/entities/${entityId}/reviews?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get rating summary for a specific entity
  getRatingSummary: async (entityId: string): Promise<RatingsSummary> => {
    const response = await apiClient.get<RatingsSummary>(
      `ratings/entities/${entityId}/summary`
    );
    return response.data;
  },

  // Get user's own rating for a specific entity
  getUserRating: async (entityId: string, userId: string): Promise<Rating | null> => {
    try {
      const response = await apiClient.get<EntityRatingResponse>(
        `ratings/entities/${entityId}/ratings?user_id=${userId}`
      );

      // The API returns an array, so we get the first (and should be only) rating
      const userRating = response.data.items && response.data.items.length > 0
        ? response.data.items[0]
        : null;

      return userRating;
    } catch (error: any) {
      // If 404, user hasn't rated this entity yet
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Mark a rating as verified purchase (admin/vendor only)
  markAsVerifiedPurchase: async (ratingId: string): Promise<Rating> => {
    const response = await apiClient.put<Rating>(`ratings/${ratingId}`, {
      is_verified_purchase: true
    });
    return response.data;
  },

  // Moderate a rating (admin only)
  moderateRating: async (
    ratingId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<Rating> => {
    const data: UpdateRatingBody = {
      metadata: reason ? { moderation_reason: reason } : {}
    };

    const response = await apiClient.put<Rating>(`ratings/${ratingId}/moderate`, {
      status,
      ...data
    });
    return response.data;
  }
};

// React Query Hooks

// Create rating mutation
export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ratingsApi.createRating,
    onSuccess: (data) => {
      // Invalidate and refetch entity ratings and summary
      queryClient.invalidateQueries({ queryKey: ["entity-ratings", data.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["entity-reviews", data.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["rating-summary", data.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["user-rating", data.entity_id] });
    },
  });
};

// Update rating mutation
export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId, data }: { ratingId: string; data: UpdateRatingBody }) =>
      ratingsApi.updateRating(ratingId, data),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["rating", data.rating_id] });
      queryClient.invalidateQueries({ queryKey: ["entity-ratings", data.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["entity-reviews", data.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["rating-summary", data.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["user-rating", data.entity_id] });
    },
  });
};

// Delete rating mutation
export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId, entityId }: { ratingId: string; entityId: string }) => {
      return ratingsApi.deleteRating(ratingId).then(result => ({ ...result, entityId }));
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["entity-ratings", data.entityId] });
      queryClient.invalidateQueries({ queryKey: ["entity-reviews", data.entityId] });
      queryClient.invalidateQueries({ queryKey: ["rating-summary", data.entityId] });
      queryClient.invalidateQueries({ queryKey: ["user-rating", data.entityId] });
    },
  });
};

// Get rating by ID
export const useGetRating = (ratingId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["rating", ratingId],
    queryFn: () => ratingsApi.getRatingById(ratingId),
    enabled: enabled && !!ratingId,
  });
};

// Get entity ratings
export const useGetEntityRatings = (
  entityId: string,
  params?: GetEntityRatingsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["entity-ratings", entityId, params],
    queryFn: () => ratingsApi.getEntityRatings(entityId, params),
    enabled: enabled && !!entityId,
  });
};

// Get entity reviews
export const useGetEntityReviews = (
  entityId: string,
  params?: GetEntityReviewsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["entity-reviews", entityId, params],
    queryFn: () => ratingsApi.getEntityReviews(entityId, params),
    enabled: enabled && !!entityId,
  });
};

// Get rating summary
export const useGetRatingSummary = (entityId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["rating-summary", entityId],
    queryFn: () => ratingsApi.getRatingSummary(entityId),
    enabled: enabled && !!entityId,
  });
};

// Get user's own rating for an entity
export const useGetUserRating = (entityId: string, userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["user-rating", entityId, userId],
    queryFn: () => ratingsApi.getUserRating(entityId, userId),
    enabled: enabled && !!entityId && !!userId,
  });
};

// Mark as verified purchase mutation
export const useMarkAsVerifiedPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ratingsApi.markAsVerifiedPurchase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rating", data.rating_id] });
      queryClient.invalidateQueries({ queryKey: ["entity-ratings", data.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["entity-reviews", data.entity_id] });
    },
  });
};

// Moderate rating mutation
export const useModerateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId, status, reason }: {
      ratingId: string;
      status: 'approved' | 'rejected';
      reason?: string
    }) => ratingsApi.moderateRating(ratingId, status, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rating", data.rating_id] });
      queryClient.invalidateQueries({ queryKey: ["entity-ratings", data.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["entity-reviews", data.entity_id] });
      queryClient.invalidateQueries({ queryKey: ["rating-summary", data.entity_id] });
    },
  });
};

// Helper functions for common use cases

// Create a product rating
export const createProductRating = (
  productId: string,
  userId: string,
  score: number,
  content: string,
  mediaUrls?: string[]
) => {
  return ratingsApi.createRating({
    entity_id: productId,
    entity_type: 'product',
    user_id: userId,
    score,
    content,
    media_urls: mediaUrls,
  });
};

// Create a store rating
export const createStoreRating = (
  storeId: string,
  userId: string,
  score: number,
  content: string,
  mediaUrls?: string[]
) => {
  return ratingsApi.createRating({
    entity_id: storeId,
    entity_type: 'store',
    user_id: userId,
    score,
    content,
    media_urls: mediaUrls,
  });
};

// Create a delivery rating
export const createDeliveryRating = (
  deliveryId: string,
  userId: string,
  score: number,
  content: string,
  mediaUrls?: string[]
) => {
  return ratingsApi.createRating({
    entity_id: deliveryId,
    entity_type: 'delivery',
    user_id: userId,
    score,
    content,
    media_urls: mediaUrls,
  });
};

// Create a vendor rating
export const createVendorRating = (
  vendorId: string,
  userId: string,
  score: number,
  content: string,
  mediaUrls?: string[]
) => {
  return ratingsApi.createRating({
    entity_id: vendorId,
    entity_type: 'vendor',
    user_id: userId,
    score,
    content,
    media_urls: mediaUrls,
  });
};

// Utility to get star distribution as percentages
export const getStarDistributionPercentages = (summary: RatingsSummary) => {
  if (summary.total_ratings === 0) {
    return { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  }

  return {
    "1": Math.round((summary.rating_distribution["1"] / summary.total_ratings) * 100),
    "2": Math.round((summary.rating_distribution["2"] / summary.total_ratings) * 100),
    "3": Math.round((summary.rating_distribution["3"] / summary.total_ratings) * 100),
    "4": Math.round((summary.rating_distribution["4"] / summary.total_ratings) * 100),
    "5": Math.round((summary.rating_distribution["5"] / summary.total_ratings) * 100),
  };
};

// Utility to format rating display
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

// Utility to get rating color based on score
export const getRatingColor = (score: number): string => {
  if (score >= 4.5) return '#22c55e'; // green
  if (score >= 3.5) return '#eab308'; // yellow
  if (score >= 2.5) return '#f97316'; // orange
  return '#ef4444'; // red
};

// Cache utilities for performance
export const ratingsCache = {
  // Get cached summary or fetch if not available
  getSummaryWithCache: async (entityId: string): Promise<RatingsSummary> => {
    const cacheKey = `rating-summary-${entityId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes

      if (!isExpired) {
        return data;
      }
    }

    const summary = await ratingsApi.getRatingSummary(entityId);
    localStorage.setItem(cacheKey, JSON.stringify({
      data: summary,
      timestamp: Date.now()
    }));

    return summary;
  },

  // Clear cache for an entity
  clearEntityCache: (entityId: string) => {
    localStorage.removeItem(`rating-summary-${entityId}`);
  }
};