import React from "react";
import { View, FlatList } from "react-native";
import { ProductTile } from "@/components/products/ProductTile";
import { Text } from "@/components/ui/text";
import {
  useHomepageRecommendations,
  useTrackInteraction,
} from "@/hooks/useRecommendations";
import { useAuth } from "@/context/auth";
import { ProductTileSkeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/stores/products";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

interface HomepageRecommendationsProps {
  count?: number;
  title?: string;
}

export function HomepageRecommendations({
  count = 10,
  title,
}: HomepageRecommendationsProps) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const { t } = useI18n();
  const trackInteraction = useTrackInteraction();
  
  const displayTitle = title || t("recommendations.recommended_for_you");

  // Use recommendations if user is logged in, fallback to featured products
  const {
    data: recommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError,
  } = useHomepageRecommendations(user?.user_id || "", count, !!user?.user_id);

  // Only fetch fallback products when needed
  const shouldUseFallback = !user?.user_id || !!recommendationsError;
  const { data: fallbackProducts, isLoading: fallbackLoading } = useProducts({
    is_featured: true,
    limit: count,
  });

  const isLoading = user?.user_id ? recommendationsLoading : fallbackLoading;
  const hasError = user?.user_id ? !!recommendationsError : false;

  // Get products to display - use fallback products for now
  // In a real implementation, you would fetch actual product details using the item_ids from recommendations
  const productsToDisplay = React.useMemo(() => {
    return (fallbackProducts?.items || []).slice(0, count);
  }, [fallbackProducts, count]);

  // Track interactions only once when component mounts, not on every render
  const hasTracked = React.useRef(false);
  React.useEffect(() => {
    if (
      recommendations?.recommendations &&
      user?.user_id &&
      !hasTracked.current
    ) {
      hasTracked.current = true;
      // Debounce tracking to avoid too many calls
      const timer = setTimeout(() => {
        trackInteraction.mutate({
          user_id: user.user_id!,
          item_id: "homepage_section",
          interaction_type: "view",
          scenario: "homepage",
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [recommendations?.recommendations?.length, user?.user_id]); // More stable dependencies

  if (isLoading) {
    return (
      <View style={{ marginBottom: 24 }}>
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          paddingHorizontal: 16,
          gap: 16 
        }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={{ width: '47%' }}>
              <ProductTileSkeleton />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (hasError || productsToDisplay.length === 0) {
    return (
      <View style={{ marginBottom: 24 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ 
            color: colors.textSecondary, 
            textAlign: 'center', 
            paddingVertical: 32,
            fontSize: 16 
          }}>
            {hasError
              ? t("recommendations.unable_to_load_recommendations")
              : t("recommendations.no_products_available")}
          </Text>
        </View>
      </View>
    );
  }

  return (
  <View style={{ marginBottom: 24 }}>
    <FlatList
      data={productsToDisplay}
      renderItem={({ item }) => (
        <View style={{ width: 140, marginRight: 16 }}>
          <ProductTile product={item} />
        </View>
      )}
      keyExtractor={(item) => item.product_id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  </View>
  );
}
