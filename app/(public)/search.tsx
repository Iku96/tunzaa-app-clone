import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, FlatList, ScrollView } from "react-native";
import SearchWithFilters from "@/components/search/SearchWithFilters";
import { ProductTile } from "@/components/products/ProductTile";
import { useCategories } from "@/stores/categories";
import { useProducts } from "@/stores/products";
import { Text } from "@/components/ui/text";
import { TrendingItems } from "@/components/recommendations";
import { ProductTileSkeleton, CategoryTileSkeleton } from "@/components/ui/skeleton";
import { useLocalSearchParams } from "expo-router";
import { useI18n } from "@/hooks/useI18n";
import { ProductsParams } from "@/src/services/products";
import { CategoryTile } from "@/components/categories/CategoryTile";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useResponsive } from "@/hooks/useResponsive";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function SearchScreen() {
  const { t } = useI18n();
  const { store_id, category_id, query } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>(typeof query === 'string' ? query : '');
  const [searchParams, setSearchParams] = useState<ProductsParams>({
    skip: 0,
    limit: 50,
    is_active: true,
    verification_status: "approved",
    query: typeof query === 'string' ? query : undefined,
    category_id: typeof category_id === 'string' ? category_id : undefined,
    store_id: typeof store_id === 'string' ? store_id : undefined,
    is_vendor_active: true,
  });
  usePageTitle("Search");
  const { isDesktop } = useResponsive();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const hasActiveFilters = Boolean(
    searchParams.min_price ||
    searchParams.max_price ||
    searchParams.vendor_id ||
    searchParams.category_id // Consider any category_id as an active filter
  );
  const shouldFetchProducts = searchQuery.length > 0 || hasActiveFilters;

  const { data: productsData, isLoading: productsLoading } = useProducts(
    searchParams,
    shouldFetchProducts
  );

  const categories = categoriesData?.items || [];
  const products = productsData?.items || [];

  useEffect(() => {
    const queryParam = typeof query === 'string' ? query : '';
    const categoryIdParam = typeof category_id === 'string' ? category_id : undefined;
    setSearchQuery(queryParam);
    setSearchParams((prev) => ({
      ...prev,
      query: queryParam || undefined,
      category_id: categoryIdParam,
    }));
  }, [query, category_id]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams((prev) => ({ ...prev, query: query || undefined }));
  };

  const handleFiltersChange = (filters: ProductsParams) => {
    setSearchParams(filters);
  };

  const renderHeader = () => (
    <>
      <View className="lg:hidden">
        <View className="my-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-2 pt-4"
            contentContainerStyle={{ gap: 6 }}
          >
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <View key={index} style={{ width: 88 }}>
                    <CategoryTileSkeleton />
                  </View>
                ))
              : categories.map((category) => (
                  <View key={category.category_id} style={{ width: 90, height: 100, justifyContent: "center" }}>
                    <CategoryTile
                      id={category.category_id}
                      name={category.name}
                      icon={category.image_url}
                    />
                  </View>
                ))}
          </ScrollView>
        </View>
      </View>
      <View className="bg-background mb-1">
        <Text className="text-base font-bold pt-4 px-4">
          {t("home.trending_products")}
        </Text>
        <View className="pt-3">
          <TrendingItems count={6} timePeriod="week" title="Trending This Week" />
        </View>
      </View>
      {shouldFetchProducts && (
        <View className="mb-4">
          <Text className="text-xl font-bold mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Filtered Products"}
          </Text>
          {productsData && (
            <Text className="text-sm text-muted-foreground">
              {productsData.total} products found
            </Text>
          )}
        </View>
      )}
    </>
  );

  const renderContent = () => {
    if (!shouldFetchProducts) {
      return (
        <ScrollView className="flex-1">
          {renderHeader()}
        </ScrollView>
      );
    }

    if (productsLoading) {
      return (
        <View className="px-4">
          {renderHeader()}
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

    if (isDesktop) {
      return (
        <View className="px-4">
          {renderHeader()}
          <View className="flex-row flex-wrap gap-4">
            {products.length > 0 ? (
              products.map((item) => (
                <View key={item.product_id} className=" mb-4">
                  <ProductTile product={item} />
                </View>
              ))
            ) : (
              <View className="items-center py-8 w-full">
                <Text className="text-muted-foreground text-center">
                  {searchQuery
                    ? `No products found for "${searchQuery}"`
                    : "No products found with the selected filters"
                  }
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return (
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View className="w-[48%] mb-4">
            <ProductTile product={item} />
          </View>
        )}
        keyExtractor={(item) => item.product_id}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        className="px-4"
        columnWrapperStyle={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-muted-foreground text-center">
              {searchQuery
                ? `No products found for "${searchQuery}"`
                : "No products found with the selected filters"
              }
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <DesktopLayoutWrapper
      showSidebar={true}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-white"
      store_id={store_id as string}
      category_id={category_id as string}
      onFiltersChange={handleFiltersChange}
    >
     <View className="flex-1 bg-white w-full">
            <View className="flex-1 w-full bg-white">
              <View className="hidden lg:flex w-full">
                <View className="flex-1 w-full">
                  <SafeAreaView className="flex-1 bg-background">
                    {renderContent()}
                  </SafeAreaView>
                </View>
              </View>
          <View className="lg:hidden flex-1">
            {!isDesktop && (
              <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
                <SearchWithFilters
                  store_id={store_id as string}
                  category_id={category_id as string}
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                />
                {renderContent()}
              </SafeAreaView>
            )}
          </View>
        </View>
      </View>
    </DesktopLayoutWrapper>
  );
}