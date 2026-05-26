import React from "react";
import { View, FlatList } from "react-native";
import { ProductTile } from "@/components/products/ProductTile";
import { Text } from "@/components/ui/text";
import { useSimilarItems } from "@/hooks/useRecommendations";
import { useTrackInteraction } from "@/hooks/useRecommendations";
import { useAuth } from "@/context/auth";
import { ProductTileSkeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/stores/products";
import { Product } from "@/services/products";
import { useResponsive } from "@/hooks/useResponsive";
import { useI18n } from "@/hooks/useI18n";

interface SimilarItemsProps {
  productId: string;
  categoryId?: string;
  count?: number;
  title?: string;
}

export function SimilarItems({
  productId,
  categoryId,
  count = 6,
  title,
}: SimilarItemsProps) {
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const { t } = useI18n();
  const trackInteraction = useTrackInteraction();
  
  const displayTitle = title || t("recommendations.similar_products");

  // Use similar items recommendations
  const {
    data: similarItems,
    isLoading: similarLoading,
    error: similarError,
  } = useSimilarItems(productId, count);

  // Fallback to category products when recommendations fail
  const { data: fallbackProducts, isLoading: fallbackLoading } = useProducts({
    category_id: categoryId,
    limit: count,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  });

  const isLoading = similarLoading || fallbackLoading;
  const hasError = !!similarError;

  // Get products to display - use fallback products for now
  const productsToDisplay = React.useMemo(() => {
    return (fallbackProducts?.items || [])
      .filter((product) => product.product_id !== productId)
      .slice(0, count);
  }, [fallbackProducts, productId, count]);

  // Track interactions only once when component mounts
  const hasTracked = React.useRef(false);
  React.useEffect(() => {
    if (similarItems?.recommendations && user?.user_id && !hasTracked.current) {
      hasTracked.current = true;
      const timer = setTimeout(() => {
        trackInteraction.mutate({
          user_id: user.user_id!,
          item_id: productId,
          interaction_type: "view",
          scenario: "similar-items",
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [similarItems?.recommendations?.length, productId, user?.user_id]);

  if (isLoading) {
    return (
      <View className="border-t-8 border-muted p-4">
        <Text className="text-lg font-bold mb-4">{displayTitle}</Text>
        <View className="flex-row flex-wrap">
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} className="w-[48%] mb-4 mr-2">
              <ProductTileSkeleton />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (hasError || productsToDisplay.length === 0) {
    return (
      <View className="border-t-8 border-muted p-4">
        <Text className="text-lg font-bold mb-4">{displayTitle}</Text>
        <Text className="text-muted-foreground text-center py-8">
          {hasError
            ? t("recommendations.unable_to_load_similar")
            : t("recommendations.no_similar_found")}
        </Text>
      </View>
    );
  }

  return (
  <View className={`border-t-8 border-muted p-4 w-full ${isDesktop ? 'bg-white' : 'bg-background'}`}>
  <Text className="text-lg font-bold mb-4">{displayTitle}</Text>
  <FlatList
    data={productsToDisplay.slice(0, 4)} // Show 4 products
    renderItem={({ item }) => (
      <View className={isDesktop ? "w-[262] mb-4 mr-4" : "w-[48%] mb-4 mr-2"}>
        <ProductTile product={item} variant="compact" />
      </View>
    )}
    keyExtractor={(item) => item.product_id}
    horizontal={isDesktop}
    scrollEnabled={false}
    {...(!isDesktop && {
      numColumns: 2,
      columnWrapperStyle: { justifyContent: "flex-start" },
    })}
  />
</View>

  );
}