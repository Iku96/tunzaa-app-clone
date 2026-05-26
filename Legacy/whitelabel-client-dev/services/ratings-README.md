# Ratings & Reviews Service

A comprehensive TypeScript/React Native service for managing ratings and reviews for products, stores, vendors, and delivery services.

## Features

- ✅ **Multi-Entity Support**: Rate products, stores, vendors, and delivery services
- ✅ **Rating Aggregation**: Automatic calculation of averages and distributions
- ✅ **React Query Integration**: Optimistic updates and caching
- ✅ **Review Moderation**: Status-based approval workflow
- ✅ **Media Support**: Support for images and videos in reviews
- ✅ **Verified Purchases**: Track and display verified purchase badges
- ✅ **Comprehensive Error Handling**: User-friendly error messages
- ✅ **Utilities**: Helper functions for common operations

## Installation

The service is already integrated into your project. Make sure you have the required dependencies:

```bash
npm install @tanstack/react-query axios
```

## Quick Start

### 1. Import the Service

```typescript
import { 
  ratingsApi, 
  useGetRatingSummary, 
  useCreateRating,
  useGetEntityReviews 
} from '@/services/ratings';
```

### 2. Create a Rating

```typescript
// Using React Query hook
const createRating = useCreateRating();
const { user } = useAuth();

const handleSubmitReview = async () => {
  await createRating.mutateAsync({
    entity_id: 'product-123',
    entity_type: 'product',
    user_id: user.user_id,
    score: 5,
    content: 'Great product! Highly recommended.'
  });
};

// Using direct API call
const createDirectRating = async () => {
  const rating = await ratingsApi.createRating({
    entity_id: 'product-123',
    entity_type: 'product',
    user_id: user.user_id,
    score: 5,
    content: 'Great product!'
  });
};
```

### 3. Get Rating Summary

```typescript
// Using React Query hook
const ProductRatingSummary = ({ productId }) => {
  const { data: summary, isLoading } = useGetRatingSummary(productId);
  
  if (isLoading) return <Text>Loading...</Text>;
  
  return (
    <View>
      <Text>Average: {summary?.average_rating.toFixed(1)}</Text>
      <Text>Total Reviews: {summary?.total_ratings}</Text>
    </View>
  );
};

// Using direct API call
const getSummary = async () => {
  const summary = await ratingsApi.getRatingSummary('product-123');
  console.log('Average rating:', summary.average_rating);
};
```

### 4. Get Reviews

```typescript
// Using React Query hook
const ProductReviews = ({ productId }) => {
  const { data: reviews, isLoading } = useGetEntityReviews(productId, {
    status: 'approved',
    limit: 10
  });
  
  if (isLoading) return <Text>Loading reviews...</Text>;
  
  return (
    <FlatList
      data={reviews?.items || []}
      renderItem={({ item }) => (
        <View>
          <Text>Rating: {item.score}/5</Text>
          <Text>{item.content}</Text>
        </View>
      )}
    />
  );
};
```

## API Reference

### Core Functions

#### `ratingsApi.createRating(data)`
Create a new rating/review.

**Parameters:**
- `data.entity_id` (string): ID of the entity being rated
- `data.entity_type` (string): Type of entity ('product', 'store', 'vendor', 'delivery')
- `data.user_id` (string): ID of the user creating the rating
- `data.score` (number): Rating score (1-5)
- `data.content` (string): Review text
- `data.media_urls` (string[], optional): Array of image/video URLs
- `data.metadata` (object, optional): Additional metadata

**Returns:** `Promise<Rating>`

#### `ratingsApi.getRatingSummary(entityId)`
Get aggregated rating statistics for an entity.

**Parameters:**
- `entityId` (string): ID of the entity

**Returns:** `Promise<RatingsSummary>`

#### `ratingsApi.getUserRating(entityId, userId)`
Get a user's specific rating for an entity.

**Parameters:**
- `entityId` (string): ID of the entity
- `userId` (string): ID of the user

**Returns:** `Promise<Rating | null>`

#### `ratingsApi.getEntityReviews(entityId, params?)`
Get reviews for a specific entity.

**Parameters:**
- `entityId` (string): ID of the entity
- `params.status` (string, optional): Filter by status ('approved', 'pending', 'rejected')
- `params.skip` (number, optional): Number of reviews to skip
- `params.limit` (number, optional): Number of reviews to return
- `params.sort_by` (string, optional): Field to sort by
- `params.sort_direction` (1 | -1, optional): Sort direction

**Returns:** `Promise<EntityReviewsResponse>`

### React Query Hooks

#### `useCreateRating()`
Mutation hook for creating ratings.

```typescript
const createRating = useCreateRating();
const { user } = useAuth();

createRating.mutate({
  entity_id: 'product-123',
  entity_type: 'product',
  user_id: user.user_id,
  score: 5,
  content: 'Great product!'
});
```

#### `useGetRatingSummary(entityId, enabled?)`
Query hook for fetching rating summaries.

```typescript
const { data, isLoading, error } = useGetRatingSummary('product-123');
```

#### `useGetEntityReviews(entityId, params?, enabled?)`
Query hook for fetching entity reviews.

```typescript
const { data, isLoading } = useGetEntityReviews('product-123', {
  status: 'approved',
  limit: 20
});
```

#### `useGetUserRating(entityId, userId, enabled?)`
Query hook for fetching user's own rating for an entity.

```typescript
const { user } = useAuth();
const { data, isLoading, error } = useGetUserRating('product-123', user.user_id);
```

#### `useUpdateRating()`
Mutation hook for updating ratings.

```typescript
const updateRating = useUpdateRating();

updateRating.mutate({
  ratingId: 'rating-123',
  data: { score: 4, content: 'Updated review' }
});
```

#### `useDeleteRating()`
Mutation hook for deleting ratings.

```typescript
const deleteRating = useDeleteRating();

deleteRating.mutate({
  ratingId: 'rating-123',
  entityId: 'product-123'
});
```

## Helper Functions

### Entity-Specific Helpers

```typescript
// Create product rating
await createProductRating('product-123', user.user_id, 5, 'Great product!');

// Create store rating
await createStoreRating('store-456', user.user_id, 4, 'Good service');

// Create delivery rating
await createDeliveryRating('delivery-789', user.user_id, 3, 'Decent delivery');

// Create vendor rating
await createVendorRating('vendor-101', user.user_id, 5, 'Excellent vendor');
```

### Utility Functions

```typescript
// Format rating for display
const formatted = formatRating(4.2567); // "4.3"

// Get rating color
const color = getRatingColor(4.5); // "#22c55e" (green)

// Get star distribution percentages
const percentages = getStarDistributionPercentages(summary);
// Returns: { "1": 5, "2": 10, "3": 15, "4": 30, "5": 40 }
```

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  await ratingsApi.createRating(data);
} catch (error) {
  if (error.apiError?.status === 400) {
    // Handle validation errors
    console.log('Validation error:', error.apiError.message);
  } else if (error.apiError?.status === 401) {
    // Handle authentication errors
    console.log('Please log in to rate this item');
  } else {
    // Handle other errors
    console.log('Something went wrong:', error.message);
  }
}
```

## Usage Examples

### Complete Product Review Component

```typescript
import React from 'react';
import { useGetRatingSummary, useCreateRating } from '@/services/ratings';
import ProductRatingsExample from '@/examples/ProductRatingsExample';

const ProductDetailsScreen = ({ productId }) => {
  return (
    <View style={{ flex: 1 }}>
      <ProductRatingsExample productId={productId} />
    </View>
  );
};
```

### Store Ratings Integration

```typescript
const StoreProfileScreen = ({ storeId }) => {
  const { data: summary } = useGetRatingSummary(storeId);
  const { data: reviews } = useGetEntityReviews(storeId, { 
    status: 'approved',
    limit: 5 
  });
  
  return (
    <View>
      <Text>Store Rating: {summary?.average_rating.toFixed(1)}</Text>
      <Text>Based on {summary?.total_ratings} reviews</Text>
      
      {reviews?.items.map(review => (
        <View key={review.rating_id}>
          <Text>{review.score}/5 - {review.content}</Text>
        </View>
      ))}
    </View>
  );
};
```

### Delivery Rating After Order

```typescript
const OrderCompletionScreen = ({ orderId, deliveryId }) => {
  const createRating = useCreateRating();
  const { user } = useAuth();
  
  const handleRateDelivery = async (score, content) => {
    await createRating.mutateAsync({
      entity_id: deliveryId,
      entity_type: 'delivery',
      user_id: user.user_id,
      score,
      content,
      metadata: { order_id: orderId }
    });
  };
  
  return (
    <View>
      <Text>Rate your delivery experience</Text>
      {/* Rating component */}
    </View>
  );
};
```

## Advanced Features

### Moderation (Admin/Vendor Only)

```typescript
const useModerateRating = () => {
  const moderateRating = useModerateRating();
  
  const handleApprove = (ratingId) => {
    moderateRating.mutate({
      ratingId,
      status: 'approved'
    });
  };
  
  const handleReject = (ratingId, reason) => {
    moderateRating.mutate({
      ratingId,
      status: 'rejected',
      reason
    });
  };
  
  return { handleApprove, handleReject };
};
```

### Verified Purchase Marking

```typescript
const markAsVerified = useMarkAsVerifiedPurchase();

const handleMarkVerified = (ratingId) => {
  markAsVerified.mutate(ratingId);
};
```

### Caching for Performance

```typescript
import { ratingsCache } from '@/services/ratings';

// Get cached summary
const summary = await ratingsCache.getSummaryWithCache('product-123');

// Clear cache when needed
ratingsCache.clearEntityCache('product-123');
```

## Best Practices

1. **Always handle loading states** when using React Query hooks
2. **Use optimistic updates** for better UX with mutations
3. **Implement proper error boundaries** for error handling
4. **Cache rating summaries** for frequently accessed entities
5. **Show verified purchase badges** to build trust
6. **Implement rating moderation** for content quality
7. **Use pagination** for large review lists
8. **Provide clear feedback** when users submit reviews

## API Endpoints

The service expects these endpoints to be available:

- `POST /ratings/` - Create rating
- `GET /ratings/{ratingId}` - Get rating by ID
- `PUT /ratings/{ratingId}` - Update rating
- `DELETE /ratings/{ratingId}` - Delete rating
- `GET /ratings/entities/{entityId}/ratings` - Get entity ratings
- `GET /ratings/entities/{entityId}/reviews` - Get entity reviews
- `GET /ratings/entities/{entityId}/summary` - Get rating summary
- `GET /ratings/entities/{entityId}/ratings?user_id={userId}` - Get user's rating
- `PUT /ratings/{ratingId}/moderate` - Moderate rating (admin)

## TypeScript Types

All types are exported from `@/services/types/ratings`:

```typescript
import {
  Rating,
  RatingsSummary,
  EntityRatingResponse,
  EntityReviewsResponse,
  CreateRatingBody,
  UpdateRatingBody,
  GetEntityRatingsParams,
  GetEntityReviewsParams,
  EntityType
} from '@/services/types/ratings';
```

## Contributing

When adding new features:
1. Update the types in `services/types/ratings.ts`
2. Add the API functions to `services/ratings.ts`
3. Create React Query hooks if needed
4. Update this README
5. Add examples to the examples folder

## Support

For issues or questions:
1. Check the error handling patterns above
2. Verify your API endpoints are correctly implemented
3. Ensure proper authentication headers are set
4. Check the React Query DevTools for debugging 