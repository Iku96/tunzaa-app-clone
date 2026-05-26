import React, { useState, useCallback, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { ProductTile } from "@/components/products/ProductTile";
import { Product, ProductsParams } from "@/services/products";
import { useProducts } from "@/stores/products";
import { ProductTileSkeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";

const ITEMS_PER_PAGE = 20;

export function AllProductsSection() {
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();
  const [currentPage, setCurrentPage] = useState(0);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const { isDesktop } = useResponsive();
  const loadingRef = useRef(false);
  // Fetch products with filters
  const params: ProductsParams = {
    skip: currentPage * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  };

  const { data, isLoading, isFetching } = useProducts(params);

  // Update products when data changes
  React.useEffect(() => {
    if (data?.items) {
      if (currentPage === 0) {
        setAllProducts(data.items);
      } else {
        setAllProducts(prev => {
          // Avoid duplicates
          const newProducts = data.items.filter(
            item => !prev.some(p => p.product_id === item.product_id)
          );
          return [...prev, ...newProducts];
        });
      }

      // Check if there are more products to load
      const totalFetched = (currentPage + 1) * ITEMS_PER_PAGE;
      setHasMore(totalFetched < data.total);
    }
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore && !isLoading && !loadingRef.current) {
      loadingRef.current = true;
      setCurrentPage(prev => prev + 1);
    }
  }, [isFetching, hasMore, isLoading]);

  // Reset loading ref when fetching completes
  React.useEffect(() => {
    if (!isFetching) {
      loadingRef.current = false;
    }
  }, [isFetching]);

  // Detect when sentinel element becomes visible
  const handleSentinelLayout = useCallback((event: any) => {
    // This will trigger when the sentinel element is laid out (becomes visible)
    if (hasMore && !isFetching && !isLoading && !loadingRef.current) {
      handleLoadMore();
    }
  }, [hasMore, isFetching, isLoading, handleLoadMore]);

  if (isLoading && currentPage === 0) {
    return (
      <View className="bg-background px-4 pb-4">
        <Text className="text-lg font-bold mb-4">
          {t("home.all_products")}
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} className="w-[48%] mb-4">
              <ProductTileSkeleton />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!allProducts || allProducts.length === 0) {
    return (
      <View className="bg-background px-4 pb-4">
        <Text className="text-lg font-bold mb-4">
          {t("home.all_products")}
        </Text>
        <View className="items-center py-8">
          <Text className="text-muted-foreground text-center">
            {t("home.no_products")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-background px-4 pb-4">
      <Text className="text-lg font-bold mb-4">
        {t("home.all_products")}
      </Text>

      {/* Products Grid */}
      <View className="flex-row flex-wrap justify-between">
        {allProducts.map((product) => (
          <View key={product.product_id} className={`${isDesktop ? "w-[24%]" : "w-[48%]"} mb-4`}>
            <ProductTile product={product} />
          </View>
        ))}
      </View>

      {/* Loading Indicator and Sentinel for Infinite Scroll */}
      {hasMore && (
        <View
          className="items-center py-6"
          onLayout={handleSentinelLayout}
        >
          {isFetching && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={resolvedColors.primary} />
              <Text className="text-muted-foreground text-sm">
                {t("common.loading")}...
              </Text>
            </View>
          )}
        </View>
      )}

      {/* End of products message */}
      {!hasMore && allProducts.length > 0 && (
        <View className="items-center py-4">
          <Text className="text-muted-foreground text-sm">
            {t("home.all_products_loaded")}
          </Text>
        </View>
      )}
    </View>
  );
}

