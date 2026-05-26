import React, { useRef, useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { FlashSaleCard } from "./FlashSaleCard";
import { useCategoryPopular } from "@/hooks/useRecommendations";
import { useProducts } from "@/stores/products";
import { useTrackInteraction } from "@/hooks/useRecommendations";
import { useAuth } from "@/context/auth";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { Product } from "@/services/products";
import { ProductTileSkeleton } from "../ui/skeleton";

interface WebCategoryPopularProps {
  title?: string;
  categoryId: string;
  count?: number;
}

export function WebCategoryPopular({
  title = "Flash Sale",
  categoryId,
  count = 5,
}: WebCategoryPopularProps) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const trackInteraction = useTrackInteraction();
  const scrollViewRef = useRef<ScrollView>(null);

  const [scrollPosition, setScrollPosition] = useState(0);

  const {
    data: categoryPopular,
    isLoading: popularLoading,
    error: popularError,
  } = useCategoryPopular(categoryId, user?.user_id, count);

  const { data: fallbackProducts, isLoading: fallbackLoading } = useProducts({
    category_id: categoryId,
    limit: count,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  });

  const isLoading = popularLoading || fallbackLoading;
  const hasError = !!popularError;

  const productsToDisplay = React.useMemo(() => {
    return (fallbackProducts?.items || []).slice(0, count);
  }, [fallbackProducts, count]);

  const hasTracked = useRef(false);
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

  // Update cardWidth to match FlashSaleCard width (262px) with margins
  const cardWidth = 262 + 8 * 2; // 262px (card width) + 16px (total margin)
  const maxScroll = Math.max((productsToDisplay.length * cardWidth) - (cardWidth * 2), 0); // Adjusted to account for visible cards

  const scrollBy = (offset: number) => {
    if (scrollViewRef.current) {
      const newPosition = Math.max(0, Math.min(scrollPosition + offset, maxScroll));
      scrollViewRef.current.scrollTo({ x: newPosition, animated: true });
      setScrollPosition(newPosition); // Sync state with scroll position
    }
  };

  const scrollLeft = () => scrollBy(-cardWidth);
  const scrollRight = () => scrollBy(cardWidth);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollPosition(event.nativeEvent.contentOffset.x);
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
      <View className="w-full bg-white p-4">
        <Text className="text-xl font-bold text-black mb-4">{title}</Text>
        <Text className="text-center text-gray-500 py-4">
          {hasError ? `Unable to load ${title}` : `No ${title} items available`}
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full bg-white p-4">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-black mr-2">{title}</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            className="p-2"
            onPress={scrollLeft}
            disabled={scrollPosition <= 0}
            style={{ opacity: scrollPosition <= 0 ? 0.5 : 1 }}
          >
            <Text className="text-black">←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2"
            onPress={scrollRight}
            disabled={scrollPosition >= maxScroll}
            style={{ opacity: scrollPosition >= maxScroll ? 0.5 : 1 }}
          >
            <Text className="text-black">→</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {productsToDisplay.map((item: Product) => (
          <View key={item.product_id} className="mx-2">
            <FlashSaleCard product={item} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}