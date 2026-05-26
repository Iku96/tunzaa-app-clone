import React, { useRef, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { FlashSaleCard } from "./FlashSaleCard";
import { useHomepageRecommendations, useTrackInteraction } from "@/hooks/useRecommendations";
import { useProducts } from "@/stores/products";
import { useAuth } from "@/context/auth";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ScrollView } from '../ui/scroll-view';
import { ProductTileSkeleton } from '../ui/skeleton';

export function WebRecommendationSection({ title = "Recommended for You", count = 5 }: { title?: string; count?: number }) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const trackInteraction = useTrackInteraction();
  const { width } = useWindowDimensions(); // Get screen width to detect desktop
  const isDesktop = width >= 1024; // Define desktop as width >= 1024px
  const flatListRef = useRef<FlatList>(null); // Ref for FlatList
  const [scrollPosition, setScrollPosition] = useState(0); // Track scroll position

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

  const productsToDisplay = React.useMemo(() => {
    const mappedProducts = shouldUseFallback
      ? (fallbackProducts?.items || []).slice(0, count).map((item: any) => ({
          id: item.product_id,
          name: item.name || "Unnamed Product",
          sale_price: item.price,
          originalPrice: item.sale_price !== null ? `TSh ${item.base_price.toLocaleString()}` : `TSh ${item.base_price.toLocaleString()}`,
          discountPrice: item.sale_price !== null ? `TSh ${item.sale_price.toLocaleString()}` : `TSh ${item.base_price.toLocaleString()}`,
          image: Array.isArray(item.images) && item.images.length > 0 ? (typeof item.images[0] === "string" ? item.images[0] : (item.images[0] as any).url) : "https://via.placeholder.com/150",
          soldCount: item.inventory_quantity - (item.low_stock_threshold || 0) > 0 ? item.inventory_quantity - (item.low_stock_threshold || 0) : 0,
          totalCount: item.inventory_quantity || 10,
        }))
      : (recommendations?.recommendations || []).slice(0, count).map(item => ({
          id: item.item_id,
          name: item.title || "Unnamed Product",
          originalPrice: `TSh ${item.price.toLocaleString()}`, // No sale price, use price as original
          sale_price: item.price, // No sale price, use price as discount
          discountPrice: `TSh ${item.price.toLocaleString()}`, // No discount, same as original
          image: item.image_url || "https://via.placeholder.com/150",
          soldCount: 0, // No inventory data, default to 0
          totalCount: 10, // Default total count
        }));
    return mappedProducts;
  }, [recommendations, fallbackProducts, shouldUseFallback, count]);

  const hasTracked = React.useRef(false);
  React.useEffect(() => {
    if (
      recommendations?.recommendations &&
      user?.user_id &&
      !hasTracked.current
    ) {
      hasTracked.current = true;
      const timer = setTimeout(() => {
        trackInteraction.mutate({
          user_id: user.user_id!,
          item_id: "recommendation_section",
          interaction_type: "view",
          scenario: "recommendation",
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [recommendations?.recommendations?.length, user?.user_id]);

  // Function to scroll left
  const scrollLeft = () => {
    if (flatListRef.current) {
      const newPosition = Math.max(scrollPosition - 180, 0); // Prevent negative scroll
      flatListRef.current.scrollToOffset({ offset: newPosition, animated: true });
      setScrollPosition(newPosition);
    }
  };

  // Function to scroll right
  const scrollRight = () => {
    if (flatListRef.current) {
      const newPosition = scrollPosition + 180; // Adjust based on content width
      flatListRef.current.scrollToOffset({ offset: newPosition, animated: true });
      setScrollPosition(newPosition);
    }
  };

  if (isLoading) {
    return (
      <View className="w-full bg-white-100 p-4">
        <Text className="text-xl font-bold text-black mb-4">{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} className="w-[262px] mx-2">
              <ProductTileSkeleton variant="default" />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (hasError || productsToDisplay.length === 0) {
    return (
      <View className="w-full bg-gray-100 p-4">
        <Text className="text-xl font-bold text-black mb-4">{title}</Text>
        <Text className="text-center text-gray-500 py-4">
          {hasError ? "Unable to load recommendations" : "No products available"}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <FlashSaleCard key={item.id} product={item} />
  );

  return (
    <View className="w-full bg-white p-4">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-black mr-2">{title}</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="p-2" onPress={scrollLeft}>
            <Text className="text-black">←</Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={scrollRight}>
            <Text className="text-black">→</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        ref={flatListRef}
        data={productsToDisplay}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        onScroll={(event) => setScrollPosition(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16} // For smooth scroll updates
      />
    </View>
  );
}