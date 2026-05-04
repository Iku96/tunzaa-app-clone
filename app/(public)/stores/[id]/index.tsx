import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, FlatList, useWindowDimensions } from "react-native";
import SearchWithFilters from "@/components/search/SearchWithFilters";
import { ProductTile } from "@/components/products/ProductTile";
import { useShops } from "@/stores/shops";
import { useProducts } from "@/stores/products";
import { Text } from "@/components/ui/text";
import { ProductTileSkeleton } from "@/components/ui/skeleton";
import { useLocalSearchParams } from "expo-router";
import { ProductsParams } from "@/src/services/products";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useResponsive } from "@/hooks/useResponsive";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function StoreScreen() {
  const { id } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useState<ProductsParams>({
    skip: 0,
    limit: 50,
    is_active: true,
    verification_status: "approved",
    store_id: id as string,
    is_vendor_active: true,
  });

    usePageTitle("Store");

  const { width } = useWindowDimensions();
  const isDesktop = useResponsive();

  const { data: shop, isLoading: shopLoading } = useShops();
  const { data: productsData, isLoading: productsLoading } = useProducts(searchParams);

  const products = productsData?.items || [];
  const shopName = shop?.items?.find(s => s.store_id === id)?.store_name || "Store";

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams(prev => ({ ...prev, query }));
  };

  const handleFiltersChange = (filters: ProductsParams) => {
    setSearchParams(filters);
  };

  const renderHeader = () => (
    <View className="mb-4 pt-4">
      <Text className="text-2xl font-bold text-foreground mb-2">
        {searchQuery ? `Search Results for "${searchQuery}"` : `${shopName} Products`}
      </Text>
      {productsData && (
        <Text className="text-sm text-muted-foreground">
          {productsData.total} products found
        </Text>
      )}
    </View>
  );

  if (isDesktop) {
    // Desktop layout with flex wrap
    return (
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={true}
        containerClassName="bg-white"
      >
        <SafeAreaView className="flex-1 bg-background px-8 py-4">

          {productsLoading ? (
            <View>
              {renderHeader()}
              <View className="flex-row flex-wrap justify-start gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductTileSkeleton key={index} />
                ))}
              </View>
            </View>
          ) : (
            <View>
              {renderHeader()}
              <View className="flex-row flex-wrap justify-start gap-4">
                {products.length ? (
                  products.map(product => (
                    <View key={product.product_id} className="mb-4">
                      <ProductTile product={product} />
                    </View>
                  ))
                ) : (
                  <View className="items-center py-8">
                    <Text className="text-muted-foreground text-center">
                      {searchQuery
                        ? `No products found for "${searchQuery}"`
                        : "No products found in this store"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </SafeAreaView>
      </DesktopLayoutWrapper>
    );
  }

  // Mobile layout with FlatList
  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-white"
    >
      <SafeAreaView className="flex-1 bg-background">
        <SearchWithFilters
          store_id={id as string}
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
                    : "No products found in this store"}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
}
