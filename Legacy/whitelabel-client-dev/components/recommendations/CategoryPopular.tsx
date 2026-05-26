import React from "react";
import { View, FlatList } from "react-native";
import { ProductTile } from "@/components/products/ProductTile";
import { Text } from "@/components/ui/text";
import { useCategoryPopular } from "@/hooks/useRecommendations";
import { useTrackInteraction } from "@/hooks/useRecommendations";
import { useAuth } from "@/context/auth";
import { ProductTileSkeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/stores/products";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

interface CategoryPopularProps {
  categoryId: string;
  count?: number;
  title?: string;
}

export function CategoryPopular({
  categoryId,
  count = 10,
  title,
}: CategoryPopularProps) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const { t } = useI18n();
  const trackInteraction = useTrackInteraction();
  
  const displayTitle = title || t("recommendations.popular_in_category");

  // Use category popular recommendations
  const {
    data: categoryPopular,
    isLoading: popularLoading,
    error: popularError,
  } = useCategoryPopular(categoryId, user?.user_id, count);

  // Fallback to category products when recommendations fail
  const { data: fallbackProducts, isLoading: fallbackLoading } = useProducts({
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
    category_id: categoryId,
    limit: count,
  });

  const isLoading = popularLoading || fallbackLoading;
  const hasError = !!popularError;

  // Get products to display - use fallback products for now
  // In a real implementation, you would fetch actual product details using the item_ids from recommendations
  const productsToDisplay = React.useMemo(() => {
    return (fallbackProducts?.items || []).slice(0, count);
  }, [fallbackProducts, count]);

  // Track interactions only once when component mounts
  const hasTracked = React.useRef(false);
  React.useEffect(() => {
    if (
      categoryPopular?.recommendations &&
      user?.user_id &&
      !hasTracked.current
    ) {
      hasTracked.current = true;
      const timer = setTimeout(() => {
        trackInteraction.mutate({
          user_id: user.user_id!,
          item_id: categoryId,
          interaction_type: "view",
          scenario: "category-popular",
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [categoryPopular?.recommendations?.length, categoryId, user?.user_id]);

  if (isLoading) {
    return (
      <View style={{ marginBottom: 24 }}>
        <FlatList
          data={Array.from({ length: count })}
          renderItem={({ index }) => (
            <View style={{ width: 140, marginRight: 16 }}>
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
            // color: colors.textSecondary, 
            textAlign: 'center', 
            paddingVertical: 32,
            fontSize: 16 
          }}>
            {hasError
              ? t("recommendations.unable_to_load_popular")
              : t("recommendations.no_popular_available")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    // <View style={{ marginBottom: 24 }}>
    //   <FlatList
    //     data={productsToDisplay.slice(0, 4)} // Show 4 products in 2x2 grid
    //     renderItem={({ item }) => (
    //       <View style={{ width: '47%', marginBottom: 16 }}>
    //         <ProductTile product={item} />
    //       </View>
    //     )}
    //     keyExtractor={(item) => item.product_id}
    //     numColumns={2}
    //     horizontal={false}
    //     contentContainerStyle={{ paddingHorizontal: 16 }}
    //     columnWrapperStyle={{
    //       justifyContent: "space-between",
    //     }}
    //     scrollEnabled={false}
    //   />
    // </View>
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
