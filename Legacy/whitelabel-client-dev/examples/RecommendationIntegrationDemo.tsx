import React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HomepageRecommendations,
  SimilarItems,
  TrendingItems,
  CategoryPopular,
} from "@/components/recommendations";

/**
 * Demo component showing how recommendation components are integrated
 * throughout the buyer app experience
 */
export default function RecommendationIntegrationDemo() {
  // Mock data for demonstration
  const mockUserId = "user-123";
  const mockProductId = "product-456";
  const mockCategoryId = "category-789";

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold mb-6 text-center">
        Recommendation System Integration Demo
      </Text>

      {/* Homepage Integration */}
      <Card className="mb-6 p-4">
        <View className="flex-row items-center mb-4">
          <Badge variant="default" className="mr-2">
            <Text className="text-xs">Homepage</Text>
          </Badge>
          <Text className="text-lg font-semibold">Buyer Home Integration</Text>
        </View>

        <Text className="text-sm text-muted-foreground mb-4">
          Location: app/(buyer)/index.tsx → components/home/BuyerHome.tsx
        </Text>

        <Text className="text-sm mb-4">
          Replaces featured products with personalized recommendations for
          logged-in users. Falls back to featured products for guests.
        </Text>

        <HomepageRecommendations count={4} title="Personalized for You" />
      </Card>

      {/* Trending Items Integration */}
      <Card className="mb-6 p-4">
        <View className="flex-row items-center mb-4">
          <Badge variant="secondary" className="mr-2">
            <Text className="text-xs">Trending</Text>
          </Badge>
          <Text className="text-lg font-semibold">
            Trending Items Integration
          </Text>
        </View>

        <Text className="text-sm text-muted-foreground mb-4">
          Location: components/home/BuyerHome.tsx &
          components/search/ProductSearchPage.tsx
        </Text>

        <Text className="text-sm mb-4">
          Shows trending products based on time period (day/week/month). Used on
          homepage and search page when no query is entered.
        </Text>

        <TrendingItems count={6} timePeriod="week" title="Trending This Week" />
      </Card>

      {/* Category Popular Integration */}
      <Card className="mb-6 p-4">
        <View className="flex-row items-center mb-4">
          <Badge variant="outline" className="mr-2">
            <Text className="text-xs">Category</Text>
          </Badge>
          <Text className="text-lg font-semibold">
            Category Popular Integration
          </Text>
        </View>

        <Text className="text-sm text-muted-foreground mb-4">
          Location: components/home/BuyerHome.tsx &
          components/categories/CategoriesPageView.tsx
        </Text>

        <Text className="text-sm mb-4">
          Shows popular items within specific categories. Personalized if user
          is logged in. Used on homepage for top categories and on category
          detail pages.
        </Text>

        <CategoryPopular
          categoryId={mockCategoryId}
          count={4}
          title="Popular in Electronics"
        />
      </Card>

      {/* Similar Items Integration */}
      <Card className="mb-6 p-4">
        <View className="flex-row items-center mb-4">
          <Badge variant="destructive" className="mr-2">
            <Text className="text-xs">Similar</Text>
          </Badge>
          <Text className="text-lg font-semibold">
            Similar Items Integration
          </Text>
        </View>

        <Text className="text-sm text-muted-foreground mb-4">
          Location: app/(buyer)/product/[id]/index.tsx
        </Text>

        <Text className="text-sm mb-4">
          Replaces the NearbyProducts component with AI-powered similar item
          recommendations. Shows products similar to the currently viewed
          product.
        </Text>

        <SimilarItems
          productId={mockProductId}
          categoryId={mockCategoryId}
          count={4}
          title="You Might Also Like"
        />
      </Card>

      {/* Integration Summary */}
      <Card className="mb-6 p-4 bg-muted">
        <Text className="text-lg font-semibold mb-4">Integration Summary</Text>

        <View className="space-y-3">
          <View className="flex-row">
            <Text className="text-sm font-medium w-24">Homepage:</Text>
            <Text className="text-sm flex-1">
              HomepageRecommendations + TrendingItems + CategoryPopular (3
              sections)
            </Text>
          </View>

          <View className="flex-row">
            <Text className="text-sm font-medium w-24">Product:</Text>
            <Text className="text-sm flex-1">
              SimilarItems (replaces NearbyProducts)
            </Text>
          </View>

          <View className="flex-row">
            <Text className="text-sm font-medium w-24">Category:</Text>
            <Text className="text-sm flex-1">
              CategoryPopular (above existing product grid)
            </Text>
          </View>

          <View className="flex-row">
            <Text className="text-sm font-medium w-24">Search:</Text>
            <Text className="text-sm flex-1">
              TrendingItems (when no search query)
            </Text>
          </View>
        </View>
      </Card>

      {/* Technical Notes */}
      <Card className="mb-6 p-4 border-orange-200 bg-orange-50">
        <Text className="text-lg font-semibold mb-4 text-orange-800">
          Technical Implementation Notes
        </Text>

        <View className="space-y-2">
          <Text className="text-sm text-orange-700">
            • All components use React Query for caching and background updates
          </Text>
          <Text className="text-sm text-orange-700">
            • Automatic fallback to existing product queries when
            recommendations fail
          </Text>
          <Text className="text-sm text-orange-700">
            • Interaction tracking integrated for ML model improvement
          </Text>
          <Text className="text-sm text-orange-700">
            • Scenario-based recommendations for context-aware suggestions
          </Text>
          <Text className="text-sm text-orange-700">
            • TypeScript support with proper error handling
          </Text>
          <Text className="text-sm text-orange-700">
            • Mobile and desktop responsive layouts
          </Text>
        </View>
      </Card>

      {/* Usage Instructions */}
      <Card className="mb-6 p-4 border-blue-200 bg-blue-50">
        <Text className="text-lg font-semibold mb-4 text-blue-800">
          How to Use
        </Text>

        <View className="space-y-2">
          <Text className="text-sm text-blue-700">
            1. Import components from '@/components/recommendations'
          </Text>
          <Text className="text-sm text-blue-700">
            2. Use hooks from '@/hooks/useRecommendations'
          </Text>
          <Text className="text-sm text-blue-700">
            3. Track interactions with useTrackInteraction hook
          </Text>
          <Text className="text-sm text-blue-700">
            4. Configure API endpoints in services/config.ts
          </Text>
          <Text className="text-sm text-blue-700">
            5. Monitor performance via React Query DevTools
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

/*
INTEGRATION LOCATIONS:

1. Homepage (app/(buyer)/index.tsx):
   - HomepageRecommendations: Personalized recommendations for logged-in users
   - TrendingItems: Popular products trending this week
   - CategoryPopular: Popular items in top 3 categories

2. Product Detail (app/(buyer)/product/[id]/index.tsx):
   - SimilarItems: Replaces NearbyProducts with AI recommendations

3. Category Page (app/(buyer)/categories/[id]/index.tsx):
   - CategoryPopular: Shows popular items in the selected category

4. Search Page (app/(buyer)/search.tsx):
   - TrendingItems: Shows when no search query is entered

FALLBACK STRATEGY:
- All components gracefully fallback to existing product queries
- No disruption to user experience if recommendation service is down
- Maintains existing loading states and error handling

PERFORMANCE:
- React Query caching reduces API calls
- Background updates keep data fresh
- Optimistic updates for smooth UX
- Skeleton loaders during loading states
*/
