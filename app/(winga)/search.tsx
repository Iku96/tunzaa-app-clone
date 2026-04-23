import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, FlatList, ScrollView } from "react-native";
import SearchWithFilters from "@/components/search/SearchWithFilters";
import { ProductTile } from "@/components/products/ProductTile";
import { useCategories } from "@/stores/categories";
import { useProducts } from "@/stores/products";
import { Text } from "@/components/ui/text";
import { TrendingItems } from "@/components/recommendations";
import { ProductTileSkeleton, CategoryTileSkeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";
import { ProductsParams } from "@/services/products";
import { CategoryTile } from "@/components/categories/CategoryTile";

export default function SearchScreen() {
  const { t } = useTranslation();
  const { store_id, category_id } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useState<ProductsParams>({
    skip: 0,
    limit: 50,
    is_active: true,
    verification_status: "approved",
    category_id: category_id as string || undefined,
    store_id: store_id as string || undefined,
    is_vendor_active: true,
  });

  // Use React Query hooks
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Check if we should fetch products (only when there's a search query or active filters)
  const hasActiveFilters = Boolean(searchParams.min_price || searchParams.max_price || searchParams.vendor_id || 
    (searchParams.category_id && searchParams.category_id !== category_id));
  const shouldFetchProducts = searchQuery.length > 0 || hasActiveFilters;
  
  const { data: productsData, isLoading: productsLoading } = useProducts(
    searchParams,
    shouldFetchProducts
  );

  const categories = categoriesData?.items || [];
  const products = productsData?.items || [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams(prev => ({ ...prev, query }));
  };

  const handleFiltersChange = (filters: ProductsParams) => {
    setSearchParams(filters);
  };

  const renderHeader = () => (
    <>
      {!shouldFetchProducts ? (
        <>
          {/* Categories Section */}
          <View className="lg:hidden">
            {/* <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold mt-2">
                {t("home.top_categories")}
              </Text>
            </View> */}

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
                <View key={category.category_id} style={{ width: 90, height: 70, justifyContent: "center" }} >
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
         {/* Only show trending items if we have homepage recommendations or user is not logged in */}
         <Text className="text-base font-bold pt-4 px-4">
              {t("home.trending_products")}
            </Text>
         <View className=" pt-3">
         <TrendingItems count={6} timePeriod="week" title="Trending This Week" />
         </View>
         </View>
        </>
      ) : (
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
      // Show only trending products and categories on initial load
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
          flexDirection: "row",
          justifyContent: "space-between",
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
    <View className="flex-1 bg-gray-50">
      {/* Desktop Navigation */}
      <View className="hidden lg:flex">
        {/* Add desktop navigation if needed */}
      </View>

      {/* Main Content Area */}
      <View className="flex-1">
        {/* Desktop Layout with Sidebar */}
        <View className="hidden lg:flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <View className="flex-row gap-8">
            {/* Sidebar */}
            <View className="w-64 flex-shrink-0">
              {/* Add sidebar if needed */}
            </View>

            {/* Main Content */}
            <View className="flex-1 min-w-0">
              <SafeAreaView className="flex-1 bg-background">
                <SearchWithFilters
                  store_id={store_id as string}
                  category_id={category_id as string}
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                />

                {renderContent()}
              </SafeAreaView>
            </View>
          </View>
        </View>

        {/* Mobile/Tablet Layout */}
        <View className="lg:hidden flex-1">
          <SafeAreaView className="flex-1 bg-background">
            <SearchWithFilters
              store_id={store_id as string}
              category_id={category_id as string}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
            />

            {renderContent()}
          </SafeAreaView>
        </View>
      </View>

      {/* Desktop Footer */}
      <View className="hidden lg:flex">
        {/* Add desktop footer if needed */}
      </View>
    </View>
  );
}
