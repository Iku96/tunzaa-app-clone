# Recommendations API Documentation

This document provides comprehensive guidance on using the recommendation APIs and hooks in the marketplace application.

## Table of Contents

1. [API Overview](#api-overview)
2. [Available APIs](#available-apis)
3. [Hooks](#hooks)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Error Handling](#error-handling)

## API Overview

The recommendation system provides personalized and contextual recommendations based on user behavior, item similarity, and trending patterns. All APIs support scenario-based recommendations for better context understanding.

### Base Configuration

All recommendation APIs use the same base configuration from `services/client.ts`:

- Base URL: Configured via `API_CONFIG.BASE_URL`
- Automatic authentication via Bearer token
- Tenant ID header: `X-Tenant-ID`

## Available APIs

### 1. Get Available Scenarios

```typescript
import { recommendationsApi } from "@/services/recommendations";

const scenarios = await recommendationsApi.getScenarios();
```

**Response:**

```typescript
{
  personalized: ['homepage', 'user-profile', 'email-campaign'],
  item_based: ['similar-items', 'product-detail', 'frequently-bought-together'],
  contextual: ['trending', 'category-popular', 'search-personalized']
}
```

### 2. Get Similar Items

```typescript
const similarItems = await recommendationsApi.getSimilarItems(productId, {
  count: 10,
});
```

**Response:**

```typescript
{
  recommendations: [
    {
      item_id: "product-123",
      score: 0.95,
      metadata: {}
    }
  ],
  scenario: "similar-items",
  user_id: null,
  tenant_id: "tenant-123",
  total_count: 10,
  request_id: "req-123",
  timestamp: "2025-06-27T05:37:51.729510",
  metadata: {
    source_item_id: "product-456",
    personalized: false
  }
}
```

### 3. Get Trending Items

```typescript
const trendingItems = await recommendationsApi.getTrendingItems({
  count: 10,
  time_period: "week",
  category_id: "electronics",
});
```

**Response:**

```typescript
{
  recommendations: [...],
  scenario: "trending",
  user_id: null,
  tenant_id: "tenant-123",
  total_count: 10,
  request_id: "req-456",
  timestamp: "2025-06-27T05:38:26.874065",
  metadata: {
    time_period: "week",
    category_id: "electronics",
    filters_applied: "'tenant_id' == \"tenant-123\""
  }
}
```

### 4. Get Category Popular Items

```typescript
const categoryPopular = await recommendationsApi.getCategoryPopular(
  categoryId,
  {
    count: 10,
    user_id: userId,
  }
);
```

**Response:**

```typescript
{
  recommendations: [...],
  scenario: "category-popular",
  user_id: "user-123",
  tenant_id: "tenant-123",
  total_count: 10,
  request_id: "req-789",
  timestamp: "2025-06-27T05:39:41.266540",
  metadata: {
    category_id: "category-123",
    personalized: true,
    filters_applied: "'tenant_id' == \"tenant-123\" and 'category-123' in 'categories'"
  }
}
```

### 5. Get Personalized Recommendations

```typescript
const personalizedRecs =
  await recommendationsApi.getPersonalizedRecommendations(userId, {
    scenario: "homepage",
    count: 10,
    filters: {
      price_max: 1000,
    },
  });
```

### 6. Track Interactions

```typescript
await recommendationsApi.trackInteraction({
  user_id: userId,
  item_id: productId,
  interaction_type: "view",
  scenario: "homepage",
  value: 29.99, // Optional, for purchases
});
```

### 7. Personalized Search

```typescript
const searchResults = await recommendationsApi.getPersonalizedSearch({
  user_id: userId,
  query: "wireless headphones",
  count: 10,
  filters: {
    price_max: 200,
    category: "electronics",
  },
});
```

## Hooks

### Basic Hooks

#### useHomepageRecommendations

```typescript
import { useHomepageRecommendations } from "@/hooks/useRecommendations";

function HomePage() {
  const { data, isLoading, error } = useHomepageRecommendations(userId, 10);

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <div>
      {data?.recommendations.map((item) => (
        <ProductCard key={item.item_id} itemId={item.item_id} />
      ))}
    </div>
  );
}
```

#### useSimilarItems

```typescript
import { useSimilarItems } from "@/hooks/useRecommendations";

function ProductDetailPage({ productId }: { productId: string }) {
  const { data, isLoading, error } = useSimilarItems(productId, 5);

  return (
    <div>
      <h3>Similar Products</h3>
      {data?.recommendations.map((item) => (
        <ProductCard
          key={item.item_id}
          itemId={item.item_id}
          score={item.score}
        />
      ))}
    </div>
  );
}
```

#### useTrendingItems

```typescript
import { useTrendingItems } from "@/hooks/useRecommendations";

function TrendingSection() {
  const { data, isLoading } = useTrendingItems(10, "week");

  return (
    <div>
      <h3>Trending This Week</h3>
      {data?.recommendations.map((item) => (
        <ProductCard key={item.item_id} itemId={item.item_id} />
      ))}
    </div>
  );
}
```

#### useCategoryPopular

```typescript
import { useCategoryPopular } from "@/hooks/useRecommendations";

function CategoryPage({
  categoryId,
  userId,
}: {
  categoryId: string;
  userId?: string;
}) {
  const { data, isLoading } = useCategoryPopular(categoryId, userId, 8);

  return (
    <div>
      <h3>Popular in Category</h3>
      {data?.recommendations.map((item) => (
        <ProductCard key={item.item_id} itemId={item.item_id} />
      ))}
    </div>
  );
}
```

### Enhanced Hooks with Tracking

#### useHomepageRecommendationsWithTracking

```typescript
import { useHomepageRecommendationsWithTracking } from "@/hooks/useRecommendations";

function HomePage() {
  const { data, isLoading, trackView, trackClick } =
    useHomepageRecommendationsWithTracking(userId, 10);

  return (
    <div>
      {data?.recommendations.map((item) => (
        <ProductCard
          key={item.item_id}
          itemId={item.item_id}
          onView={() => trackView(item.item_id)}
          onClick={() => trackClick(item.item_id)}
        />
      ))}
    </div>
  );
}
```

### Interaction Tracking Hooks

#### useTrackInteraction

```typescript
import { useTrackInteraction } from "@/hooks/useRecommendations";

function ProductCard({ itemId, userId, scenario }) {
  const trackInteraction = useTrackInteraction();

  const handlePurchase = async () => {
    await trackInteraction.mutateAsync({
      user_id: userId,
      item_id: itemId,
      interaction_type: "purchase",
      scenario: scenario,
      value: 99.99,
    });
  };

  return (
    <div>
      <button onClick={handlePurchase}>
        {trackInteraction.isPending ? "Processing..." : "Buy Now"}
      </button>
    </div>
  );
}
```

### Search Hook

#### usePersonalizedSearch

```typescript
import { usePersonalizedSearch } from "@/hooks/useRecommendations";

function SearchPage() {
  const personalizedSearch = usePersonalizedSearch();

  const handleSearch = async (query: string) => {
    const results = await personalizedSearch.mutateAsync({
      user_id: userId,
      query: query,
      count: 20,
      filters: {
        price_max: 500,
      },
    });

    // Handle results
    console.log(results.recommendations);
  };

  return (
    <div>
      <SearchInput onSearch={handleSearch} />
      {personalizedSearch.data && (
        <SearchResults results={personalizedSearch.data.recommendations} />
      )}
    </div>
  );
}
```

## Usage Examples

### 1. Homepage with Personalized Recommendations

```typescript
import React from "react";
import { useHomepageRecommendationsWithTracking } from "@/hooks/useRecommendations";

export function HomePage({ userId }: { userId: string }) {
  const {
    data: recommendations,
    isLoading,
    error,
    trackView,
    trackClick,
  } = useHomepageRecommendationsWithTracking(userId, 12);

  if (isLoading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error loading recommendations</div>;

  return (
    <div className="homepage">
      <h2>Recommended for You</h2>
      <div className="recommendations-grid">
        {recommendations?.recommendations.map((item) => (
          <ProductCard
            key={item.item_id}
            itemId={item.item_id}
            score={item.score}
            onView={() => trackView(item.item_id)}
            onClick={() => trackClick(item.item_id)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2. Product Detail Page with Similar Items

```typescript
import React from "react";
import { useSimilarItemsWithTracking } from "@/hooks/useRecommendations";

export function ProductDetailPage({ productId }: { productId: string }) {
  const {
    data: similarItems,
    isLoading,
    trackView,
    trackClick,
  } = useSimilarItemsWithTracking(productId, 6);

  return (
    <div className="product-detail">
      {/* Product details */}

      <div className="similar-items-section">
        <h3>Similar Products</h3>
        {isLoading ? (
          <div>Loading similar items...</div>
        ) : (
          <div className="similar-items-grid">
            {similarItems?.recommendations.map((item) => (
              <ProductCard
                key={item.item_id}
                itemId={item.item_id}
                score={item.score}
                onView={() => trackView(item.item_id)}
                onClick={() => trackClick(item.item_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Category Page with Popular Items

```typescript
import React from "react";
import { useCategoryPopular } from "@/hooks/useRecommendations";
import { useTrackInteraction } from "@/hooks/useRecommendations";

export function CategoryPage({
  categoryId,
  userId,
}: {
  categoryId: string;
  userId: string;
}) {
  const { data: popularItems, isLoading } = useCategoryPopular(
    categoryId,
    userId,
    20
  );
  const trackInteraction = useTrackInteraction();

  const handleItemClick = (itemId: string) => {
    trackInteraction.mutate({
      user_id: userId,
      item_id: itemId,
      interaction_type: "click",
      scenario: "category-popular",
    });
  };

  return (
    <div className="category-page">
      <h2>Popular in Category</h2>
      {isLoading ? (
        <div>Loading popular items...</div>
      ) : (
        <div className="products-grid">
          {popularItems?.recommendations.map((item) => (
            <ProductCard
              key={item.item_id}
              itemId={item.item_id}
              score={item.score}
              onClick={() => handleItemClick(item.item_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4. Trending Items Dashboard

```typescript
import React, { useState } from "react";
import { useTrendingItemsWithTracking } from "@/hooks/useRecommendations";

export function TrendingDashboard({ userId }: { userId: string }) {
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month">(
    "week"
  );

  const {
    data: trendingItems,
    isLoading,
    trackView,
    trackClick,
  } = useTrendingItemsWithTracking(15, timePeriod);

  return (
    <div className="trending-dashboard">
      <div className="trending-header">
        <h2>Trending Items</h2>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as any)}
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {isLoading ? (
        <div>Loading trending items...</div>
      ) : (
        <div className="trending-grid">
          {trendingItems?.recommendations.map((item, index) => (
            <div key={item.item_id} className="trending-item">
              <span className="trending-rank">#{index + 1}</span>
              <ProductCard
                itemId={item.item_id}
                score={item.score}
                onView={() => trackView(item.item_id, userId)}
                onClick={() => trackClick(item.item_id, userId)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Always Use Scenarios

```typescript
// ✅ Good - specify scenario
const { data } = usePersonalizedRecommendations(userId, "homepage", 10);

// ❌ Bad - generic usage without scenario context
```

### 2. Track Interactions Consistently

```typescript
// ✅ Good - track interactions with proper scenario
const trackInteraction = useTrackInteraction();

const handleProductClick = (itemId: string) => {
  // Navigate to product
  router.push(`/product/${itemId}`);

  // Track the interaction
  trackInteraction.mutate({
    user_id: userId,
    item_id: itemId,
    interaction_type: "click",
    scenario: "homepage", // Match the scenario where this was displayed
  });
};
```

### 3. Use Enhanced Hooks for Automatic Tracking

```typescript
// ✅ Better - use enhanced hooks for automatic tracking
const { data, trackView, trackClick } =
  useHomepageRecommendationsWithTracking(userId);

// Instead of manually managing tracking
const { data } = useHomepageRecommendations(userId);
const trackInteraction = useTrackInteraction();
```

### 4. Handle Loading and Error States

```typescript
function RecommendationSection() {
  const { data, isLoading, error, refetch } =
    useHomepageRecommendations(userId);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <ErrorBoundary>
        <button onClick={() => refetch()}>Retry</button>
      </ErrorBoundary>
    );
  }

  return <RecommendationsList recommendations={data?.recommendations} />;
}
```

### 5. Optimize Query Keys and Caching

```typescript
// The hooks automatically handle caching, but you can customize
const { data } = useHomepageRecommendations(
  userId,
  10,
  true // enabled
);

// For conditional fetching
const { data } = useSimilarItems(
  productId,
  5,
  !!productId && isProductDetailPage // only fetch when needed
);
```

## Error Handling

### API Errors

```typescript
function RecommendationComponent() {
  const { data, error, isError } = useHomepageRecommendations(userId);

  if (isError) {
    console.error("Recommendation API Error:", error);

    // Handle different error types
    if (error?.response?.status === 401) {
      // Handle authentication error
      redirectToLogin();
    } else if (error?.response?.status === 429) {
      // Handle rate limiting
      showRateLimitMessage();
    } else {
      // Handle general errors
      showGenericErrorMessage();
    }
  }

  return null;
}
```

### Interaction Tracking Errors

```typescript
function ProductCard({ itemId, userId }) {
  const trackInteraction = useTrackInteraction();

  const handleClick = async () => {
    try {
      await trackInteraction.mutateAsync({
        user_id: userId,
        item_id: itemId,
        interaction_type: "click",
        scenario: "homepage",
      });
    } catch (error) {
      // Don't block user interaction due to tracking errors
      console.warn("Failed to track interaction:", error);

      // Optionally queue for retry
      queueInteractionForRetry({
        user_id: userId,
        item_id: itemId,
        interaction_type: "click",
        scenario: "homepage",
      });
    }

    // Continue with the main action
    navigateToProduct(itemId);
  };

  return <button onClick={handleClick}>View Product</button>;
}
```

## Performance Considerations

1. **Caching**: All hooks use React Query for automatic caching
2. **Stale Time**: Different stale times based on data freshness needs
3. **Background Refetch**: Automatic background updates when data becomes stale
4. **Conditional Fetching**: Use the `enabled` parameter to control when queries run
5. **Batch Interactions**: Use `useTrackInteractionsBatch` for multiple interactions

## Configuration

The recommendation APIs use the following configuration from `services/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.example.com/v1",
  TENANT_ID: process.env.EXPO_PUBLIC_TENANT_ID || "default-tenant",
  // ...
};
```

Make sure to set the appropriate environment variables for your recommendation service endpoint.
