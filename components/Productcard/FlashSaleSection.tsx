import React, { useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { FlashSaleCard } from "./FlashSaleCard";
import { useTrendingItems } from "@/hooks/useRecommendations";
import { useProducts } from "@/stores/products";
import { useAuth } from "@/context/auth";
import { useTrackInteraction } from "@/hooks/useRecommendations";
import { useThemeColors } from "@/hooks/useThemeColors";
import type { Product } from "@/src/services/products";
import { ProductTileSkeleton } from '../ui/skeleton';

export function FlashSaleSection({ title = "Flash Sale" }: { title?: string }) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const trackInteraction = useTrackInteraction();
  const scrollViewRef = useRef<ScrollView>(null); // Ref for ScrollView

  const {
    data: trendingItems,
    isLoading: trendingLoading,
    error: trendingError,
  } = useTrendingItems(5, "day");

  const { data: fallbackProducts, isLoading: fallbackLoading } = useProducts({
    is_featured: true,
    limit: 5,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  });

  const isLoading = trendingLoading || fallbackLoading;
  const hasError = !!trendingError;

  const productsToDisplay = React.useMemo(() => {
    return (fallbackProducts?.items || []).slice(0, 5).map((item: Product) => item);
  }, [fallbackProducts]);

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
          item_id: "flash_sale_section",
          interaction_type: "view",
          scenario: "flash_sale",
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [trendingItems?.recommendations?.length, user?.user_id]);

  // Function to scroll left
  const scrollLeft = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: 0, // Scroll to a relative position (adjust if needed)
        animated: true,
      });
    }
  };

  // Function to scroll right
  const scrollRight = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: 180, // Scroll to a relative position (adjust if needed)
        animated: true,
      });
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
      <View className="w-full bg-white-100 p-4">
        <Text className="text-xl font-bold text-black mb-4">{title}</Text>
        <Text className="text-center text-gray-500 py-4">
          {hasError ? "Unable to load flash sale items" : "No flash sale items available"}
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
          <TouchableOpacity className="p-2" onPress={scrollLeft}>
            <Text className="text-black">←</Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={scrollRight}>
            <Text className="text-black">→</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {(fallbackProducts?.items || []).slice(0, 5).map((item: Product) => (
          <FlashSaleCard key={item._id} product={item} />
        ))}
      </ScrollView>
    </View>
  );
}