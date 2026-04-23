import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import {
  useHomepageRecommendations,
  useSimilarItems,
  useTrendingItems,
  useCategoryPopular,
  usePersonalizedSearch,
  useTrackInteraction,
  useRecommendationScenarios,
  useHomepageRecommendationsWithTracking,
  useSimilarItemsWithTracking,
  useTrendingItemsWithTracking,
} from "@/hooks/useRecommendations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RecommendationsUsageExampleProps {
  userId: string;
  productId: string;
  categoryId: string;
}

export default function RecommendationsUsageExample({
  userId,
  productId,
  categoryId,
}: RecommendationsUsageExampleProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get available scenarios
  const { data: scenarios } = useRecommendationScenarios();

  // Homepage recommendations
  const {
    data: homepageRecommendations,
    isLoading: homepageLoading,
    error: homepageError,
  } = useHomepageRecommendations(userId, 10);

  // Similar items recommendations
  const {
    data: similarItems,
    isLoading: similarLoading,
    error: similarError,
  } = useSimilarItems(productId, 5);

  // Trending items
  const {
    data: trendingItems,
    isLoading: trendingLoading,
    error: trendingError,
  } = useTrendingItems(10, "week");

  // Category popular items
  const {
    data: categoryPopular,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategoryPopular(categoryId, userId, 8);

  // Personalized search
  const personalizedSearch = usePersonalizedSearch();

  // Interaction tracking
  const trackInteraction = useTrackInteraction();

  // Enhanced hooks with automatic tracking
  const homepageWithTracking = useHomepageRecommendationsWithTracking(
    userId,
    10
  );
  const similarWithTracking = useSimilarItemsWithTracking(productId, 5);
  const trendingWithTracking = useTrendingItemsWithTracking(10, "week");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const result = await personalizedSearch.mutateAsync({
        user_id: userId,
        query: searchQuery,
        count: 10,
        filters: {
          price_max: 1000,
          category: "electronics",
        },
      });

      Alert.alert(
        "Search Results",
        `Found ${result.recommendations.length} recommendations`
      );
    } catch (error) {
      Alert.alert("Search Error", "Failed to get personalized search results");
    }
  };

  const handleTrackInteraction = async (
    itemId: string,
    type: "view" | "click" | "purchase"
  ) => {
    try {
      await trackInteraction.mutateAsync({
        user_id: userId,
        item_id: itemId,
        interaction_type: type,
        scenario: "homepage",
        value: type === "purchase" ? 99.99 : undefined,
      });

      Alert.alert(
        "Interaction Tracked",
        `${type} interaction tracked successfully`
      );
    } catch (error) {
      Alert.alert("Tracking Error", "Failed to track interaction");
    }
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">
        Recommendations API Examples
      </Text>

      {/* Available Scenarios */}
      <Card className="mb-4 p-4">
        <Text className="text-lg font-semibold mb-2">Available Scenarios</Text>
        {scenarios && (
          <View>
            <Text className="text-sm text-gray-600 mb-1">
              Personalized: {scenarios.personalized?.join(", ")}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              Item-based: {scenarios.item_based?.join(", ")}
            </Text>
            <Text className="text-sm text-gray-600">
              Contextual: {scenarios.contextual?.join(", ")}
            </Text>
          </View>
        )}
      </Card>

      {/* Homepage Recommendations */}
      <Card className="mb-4 p-4">
        <Text className="text-lg font-semibold mb-2">
          Homepage Recommendations
        </Text>
        {homepageLoading && <Text>Loading homepage recommendations...</Text>}
        {homepageError && (
          <Text className="text-red-500">Error: {homepageError.message}</Text>
        )}
        {homepageRecommendations && (
          <View>
            <Text className="text-sm text-gray-600 mb-2">
              Found {homepageRecommendations.total_count} recommendations
            </Text>
            {homepageRecommendations.recommendations.slice(0, 3).map((item) => (
              <View
                key={item.item_id}
                className="mb-2 p-2 border border-gray-200 rounded"
              >
                <Text className="font-medium">Item ID: {item.item_id}</Text>
                <Text className="text-sm text-gray-600">
                  Score: {item.score}
                </Text>
                <View className="flex-row gap-2 mt-2">
                  <Button
                    size="sm"
                    onPress={() => handleTrackInteraction(item.item_id, "view")}
                  >
                    Track View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() =>
                      handleTrackInteraction(item.item_id, "click")
                    }
                  >
                    Track Click
                  </Button>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Similar Items */}
      <Card className="mb-4 p-4">
        <Text className="text-lg font-semibold mb-2">Similar Items</Text>
        {similarLoading && <Text>Loading similar items...</Text>}
        {similarError && (
          <Text className="text-red-500">Error: {similarError.message}</Text>
        )}
        {similarItems && (
          <View>
            <Text className="text-sm text-gray-600 mb-2">
              Similar to: {similarItems.metadata.source_item_id}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              Found {similarItems.total_count} similar items
            </Text>
            {similarItems.recommendations.slice(0, 3).map((item) => (
              <View
                key={item.item_id}
                className="mb-2 p-2 border border-gray-200 rounded"
              >
                <Text className="font-medium">Item ID: {item.item_id}</Text>
                <Text className="text-sm text-gray-600">
                  Similarity Score: {item.score}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Trending Items */}
      <Card className="mb-4 p-4">
        <Text className="text-lg font-semibold mb-2">Trending Items</Text>
        {trendingLoading && <Text>Loading trending items...</Text>}
        {trendingError && (
          <Text className="text-red-500">Error: {trendingError.message}</Text>
        )}
        {trendingItems && (
          <View>
            <Text className="text-sm text-gray-600 mb-2">
              Time Period: {trendingItems.metadata.time_period}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              Found {trendingItems.total_count} trending items
            </Text>
            {trendingItems.recommendations.slice(0, 3).map((item) => (
              <View
                key={item.item_id}
                className="mb-2 p-2 border border-gray-200 rounded"
              >
                <Text className="font-medium">Item ID: {item.item_id}</Text>
                <Text className="text-sm text-gray-600">
                  Trending Score: {item.score}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Category Popular Items */}
      <Card className="mb-4 p-4">
        <Text className="text-lg font-semibold mb-2">
          Category Popular Items
        </Text>
        {categoryLoading && <Text>Loading category popular items...</Text>}
        {categoryError && (
          <Text className="text-red-500">Error: {categoryError.message}</Text>
        )}
        {categoryPopular && (
          <View>
            <Text className="text-sm text-gray-600 mb-2">
              Category: {categoryPopular.metadata.category_id}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              Personalized:{" "}
              {categoryPopular.metadata.personalized ? "Yes" : "No"}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              Found {categoryPopular.total_count} popular items
            </Text>
            {categoryPopular.recommendations.slice(0, 3).map((item) => (
              <View
                key={item.item_id}
                className="mb-2 p-2 border border-gray-200 rounded"
              >
                <Text className="font-medium">Item ID: {item.item_id}</Text>
                <Text className="text-sm text-gray-600">
                  Popularity Score: {item.score}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Enhanced Hooks with Tracking */}
      <Card className="mb-4 p-4">
        <Text className="text-lg font-semibold mb-2">
          Enhanced Hooks with Auto-Tracking
        </Text>

        {/* Homepage with tracking */}
        <View className="mb-4">
          <Text className="font-medium mb-2">Homepage (with tracking)</Text>
          {homepageWithTracking.data?.recommendations
            .slice(0, 2)
            .map((item) => (
              <View
                key={item.item_id}
                className="mb-2 p-2 border border-gray-200 rounded"
              >
                <Text className="font-medium">Item ID: {item.item_id}</Text>
                <View className="flex-row gap-2 mt-2">
                  <Button
                    size="sm"
                    onPress={() => homepageWithTracking.trackView(item.item_id)}
                  >
                    Auto Track View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() =>
                      homepageWithTracking.trackClick(item.item_id)
                    }
                  >
                    Auto Track Click
                  </Button>
                </View>
              </View>
            ))}
        </View>

        {/* Trending with tracking */}
        <View className="mb-4">
          <Text className="font-medium mb-2">Trending (with tracking)</Text>
          {trendingWithTracking.data?.recommendations
            .slice(0, 2)
            .map((item) => (
              <View
                key={item.item_id}
                className="mb-2 p-2 border border-gray-200 rounded"
              >
                <Text className="font-medium">Item ID: {item.item_id}</Text>
                <View className="flex-row gap-2 mt-2">
                  <Button
                    size="sm"
                    onPress={() =>
                      trendingWithTracking.trackView(item.item_id, userId)
                    }
                  >
                    Auto Track View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() =>
                      trendingWithTracking.trackClick(item.item_id, userId)
                    }
                  >
                    Auto Track Click
                  </Button>
                </View>
              </View>
            ))}
        </View>
      </Card>

      {/* Personalized Search */}
      <Card className="mb-4 p-4">
        <Text className="text-lg font-semibold mb-2">Personalized Search</Text>
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-2">
            Search Query: "wireless headphones"
          </Text>
          <Button
            onPress={handleSearch}
            disabled={personalizedSearch.isPending}
          >
            {personalizedSearch.isPending ? "Searching..." : "Perform Search"}
          </Button>
        </View>

        {personalizedSearch.data && (
          <View>
            <Text className="text-sm text-green-600 mb-2">
              Search completed! Found{" "}
              {personalizedSearch.data.recommendations.length} results
            </Text>
            <Text className="text-xs text-gray-500">
              Query: {personalizedSearch.data.metadata.query}
            </Text>
          </View>
        )}

        {personalizedSearch.error && (
          <Text className="text-red-500">
            Search Error: {personalizedSearch.error.message}
          </Text>
        )}
      </Card>

      {/* Manual Interaction Tracking */}
      <Card className="mb-4 p-4">
        <Text className="text-lg font-semibold mb-2">
          Manual Interaction Tracking
        </Text>
        <Text className="text-sm text-gray-600 mb-4">
          Track interactions manually for testing purposes
        </Text>

        <View className="flex-row gap-2 mb-2">
          <Button
            size="sm"
            onPress={() => handleTrackInteraction("test-item-1", "view")}
            disabled={trackInteraction.isPending}
          >
            Track View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => handleTrackInteraction("test-item-1", "click")}
            disabled={trackInteraction.isPending}
          >
            Track Click
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => handleTrackInteraction("test-item-1", "purchase")}
            disabled={trackInteraction.isPending}
          >
            Track Purchase
          </Button>
        </View>

        {trackInteraction.isPending && (
          <Text className="text-sm text-gray-600">Tracking interaction...</Text>
        )}

        {trackInteraction.error && (
          <Text className="text-red-500 text-sm">
            Tracking Error: {trackInteraction.error.message}
          </Text>
        )}
      </Card>
    </ScrollView>
  );
}

// Usage in your app:
// <RecommendationsUsageExample
//   userId="user-123"
//   productId="product-456"
//   categoryId="category-789"
// />
