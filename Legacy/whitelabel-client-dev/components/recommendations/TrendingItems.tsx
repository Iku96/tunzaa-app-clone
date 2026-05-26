import React from "react";
import { View, FlatList } from "react-native";
import { ProductTile } from "@/components/products/ProductTile";
import { Text } from "@/components/ui/text";
import { useTrendingItems } from "@/hooks/useRecommendations";
import { useTrackInteraction } from "@/hooks/useRecommendations";
import { useAuth } from "@/context/auth";
import { ProductTileSkeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/stores/products";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { useI18n } from "@/hooks/useI18n";

interface TrendingItemsProps {
  count?: number;
  timePeriod?: "day" | "week" | "month";
  categoryId?: string;
  title?: string;
}

export function TrendingItems({
  count = 10,
  timePeriod = "week",
  categoryId,
  title,
}: TrendingItemsProps) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const { t } = useI18n();
  const trackInteraction = useTrackInteraction();
  
  const displayTitle = title || t("recommendations.trending_now");

  // Use trending items recommendations
  const {
    data: trendingItems,
    isLoading: trendingLoading,
    error: trendingError,
  } = useTrendingItems(count, timePeriod, categoryId);

  // Fallback to featured products when recommendations fail
  const { data: fallbackProducts, isLoading: fallbackLoading } = useProducts({
    is_featured: true,
    limit: count,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  });

  const isLoading = trendingLoading || fallbackLoading;
  const hasError = !!trendingError;
    const { isDesktop } = useResponsive();
  // Get products to display - use fallback products for now
  // In a real implementation, you would fetch actual product details using the item_ids from recommendations
  const productsToDisplay = React.useMemo(() => {
    return (fallbackProducts?.items || []).slice(0, count);
  }, [fallbackProducts, count]);

  // Track interactions only once when component mounts
  const hasTracked = React.useRef(false);
  React.useEffect(() => {
    if (
      trendingItems?.recommendations &&
      user?.user_id &&
      !hasTracked.current
    ) {
      hasTracked.current = true;
      const timer = setTimeout(() => {
        trackInteraction.mutate({
          user_id: user.user_id!,
          item_id: "trending_section",
          interaction_type: "view",
          scenario: "trending",
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [trendingItems?.recommendations?.length, user?.user_id]);

  if (isLoading) {
    return (
      <View style={{ marginBottom: 24 }}>
        <FlatList
          data={Array.from({ length: count })}
          renderItem={({ index }) => (
            <View style={{ width: isDesktop ? 262 : 140, marginRight: 16 }}>
              <ProductTileSkeleton />
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
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
              ? t("recommendations.unable_to_load_trending")
              : t("recommendations.no_trending_available")}
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
          <View style={{ width: isDesktop ? 262 : 140, marginRight: 16 }}>
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
