import React, { useState, useEffect, useRef } from "react";
import { View, FlatList, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryTile } from "@/components/categories/CategoryTile";
import { ProductTile } from "@/components/products/ProductTile";
import SearchWithFilters from "@/components/search/SearchWithFilters";
import { useCategories } from "@/stores/categories";
import { useProducts } from "@/stores/products";
import { Text } from "@/components/ui/text";
import { TrendingItems } from "@/components/recommendations";
import { useLocalSearchParams } from "expo-router";
import {
  ProductTileSkeleton,
  CategoryTileSkeleton,
} from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { ProductsParams } from "@/src/services/products";

interface ProductSearchPageProps {
  store_id?: string;
  category_id?: string;
}

export default function ProductSearchPage({ store_id, category_id }: ProductSearchPageProps) {
  const { t } = useTranslation();
  const { focus } = useLocalSearchParams();
  const searchInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useState<ProductsParams>({
    skip: 0,
    limit: 50,
    is_active: true,
    verification_status: "approved",
    category_id: category_id || undefined,
    is_vendor_active: true,
  });

  // Add store_id if provided
  if (store_id) {
    searchParams.store_id = store_id;
  }

  // Use React Query hooks
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: productsData, isLoading: productsLoading } = useProducts(searchParams);

  // Get categories and products from the API responses
  const categories = categoriesData?.items || [];
  const products = productsData?.items || [];

  useEffect(() => {
    if (focus === "true" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [focus]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams(prev => ({ ...prev, query }));
  };

  const handleFiltersChange = (filters: ProductsParams) => {
    setSearchParams(filters);
  };

  const hasActiveFilters = searchParams.min_price || searchParams.max_price || searchParams.vendor_id || 
    (searchParams.category_id && searchParams.category_id !== category_id);

  const renderHeader = () => (
    <>
      {searchQuery.length === 0 && !hasActiveFilters ? (
        <>
          {/* Categories Section */}
          <View className="lg:hidden">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold mt-2">
                {t("home.top_categories")}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-4">
              {categoriesLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <View key={index} style={{ width: 88 }}>
                      <CategoryTileSkeleton />
                    </View>
                  ))
                : categories.slice(0, 6).map((category) => (
                    <View key={category.category_id} style={{ width: 88 }}>
                      <CategoryTile
                        id={category.category_id}
                        name={category.name}
                        icon={category.image_url}
                      />
                    </View>
                  ))}
            </View>
          </View>
          <View className=" ">
            <Text className="text-xl font-bold mb-4">Most Searched For</Text>
            {/* Show trending items when no search query */}
            <TrendingItems
              count={6}
              timePeriod="week"
              title="Trending Products"
            />
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SearchWithFilters
        store_id={store_id}
        category_id={category_id}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {productsLoading ? (
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
      ) : (
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
      )}
    </SafeAreaView>
  );
}
