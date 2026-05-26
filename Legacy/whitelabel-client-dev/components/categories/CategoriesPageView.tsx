import { useState, useEffect } from "react";
import { View, ScrollView, FlatList, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCategoryById } from "@/stores/categories";
import { useProducts } from "@/stores/products";
import { Button } from "@/components/ui/button";
import { Text as UiText } from "@/components/ui/text";
import CategoryDetails from "@/features/categories/components/CategoryDetails";
import { CategoriesPageSkeleton, ProductTileSkeleton } from "@/components/ui/skeleton";
import SearchWithFilters from "@/components/search/SearchWithFilters";
import { ProductTile } from "@/components/products/ProductTile";
import { ProductsParams } from "@/services/products";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useI18n } from "@/hooks/useI18n";

export default function CategoriesPageView() {
  const router = useRouter();
  const { t } = useI18n();
  const { id: rawId } = useLocalSearchParams();
  // Normalize id to string or undefined
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useState<ProductsParams>({
    skip: 0,
    limit: 50,
    is_active: true,
    verification_status: "approved",
    category_id: id || undefined,
    min_price: undefined,
    max_price: undefined,
    vendor_id: undefined,
    query: undefined,
    is_vendor_active: true,
  });

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024; // breakpoint for desktop

  const { data: category, isLoading: categoryLoading } = useCategoryById(id || "");
  const hasActiveFilters =
    searchParams.min_price ||
    searchParams.max_price ||
    searchParams.vendor_id ||
    (searchParams.category_id && searchParams.category_id !== id) ||
    searchQuery;

  const shouldFetchProducts = Boolean(searchQuery || hasActiveFilters || id);

  const { data: productsData, isLoading: productsLoading } = useProducts(
    searchParams,
    shouldFetchProducts
  );

  // Sync searchParams with id and selectedSubcategory
  useEffect(() => {
    const categoryId = selectedSubcategory || id || undefined;
    if (
      searchParams.category_id !== categoryId ||
      searchParams.query !== (searchQuery || undefined)
    ) {
      setSearchParams((prev) => ({
        ...prev,
        category_id: categoryId,
        query: searchQuery || undefined,
      }));
    }
  }, [id, selectedSubcategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (filters: ProductsParams) => {
    const newCategoryId = filters.category_id || selectedSubcategory || id || undefined;
    // Update selectedSubcategory if a new category_id is set by SearchWithFilters
    if (filters.category_id && filters.category_id !== selectedSubcategory) {
      setSelectedSubcategory(filters.category_id);
    }
    setSearchParams((prev) => ({
      ...prev,
      ...filters,
      category_id: newCategoryId,
      query: searchQuery || undefined,
      is_vendor_active: true,
    }));
  };

  const products = productsData?.items || [];
  const hasActiveFiltersApplied =
    searchParams.min_price ||
    searchParams.max_price ||
    searchParams.vendor_id ||
    (searchParams.category_id && searchParams.category_id !== id) ||
    searchQuery;

  if (!category && !categoryLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <UiText className="text-lg font-semibold text-foreground">
            {t("products.product_not_found")}
          </UiText>
          <View className="w-6" />
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <>
      {category && (
        <CategoryDetails
          category={category}
          selectedSubcategory={selectedSubcategory}
          onSubcategorySelect={setSelectedSubcategory}
        />
      )}

      {(searchQuery || hasActiveFiltersApplied) && (
        <View className="px-4 mb-4">
          <UiText className="text-xl font-bold mb-2">
            {searchQuery
              ? t("search.search_results_for", { query: searchQuery })
              : t("search.filtered_products")}
          </UiText>
          {productsData && (
            <UiText className="text-sm text-muted-foreground">
              {t("search.products_found", { count: productsData.total })}
            </UiText>
          )}
        </View>
      )}
    </>
  );

  return (
    <DesktopLayoutWrapper
      showSidebar={true}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-white"
      category_id={id || ""}
      onFiltersChange={handleFiltersChange}
      onSearch={handleSearch}

    >
      <SafeAreaView className={`flex-1 ${isDesktop ? "bg-white" : "bg-muted"}`}>
        {!isDesktop && <SearchWithFilters
          category_id={id || ""}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          isCategoryScreen={isDesktop ? true : false}
        />
        }
        {categoryLoading || !category ? (
          <ScrollView className="flex-1">
            <CategoriesPageSkeleton />
          </ScrollView>
        ) : productsLoading ? (
          <ScrollView className="flex-1">
            {renderHeader()}
            <View className="px-4">
              <View
                className={`flex-row flex-wrap justify-start ${isDesktop ? "gap-4" : "justify-between"
                  }`}
              >
                {Array.from({ length: isDesktop ? 8 : 6 }).map((_, index) => (
                  <View
                    key={index}
                    className={isDesktop ? "w-[23%] mb-4" : "w-[48%] mb-4"}
                  >
                    <ProductTileSkeleton />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : isDesktop ? (
          <ScrollView className="flex-1 px-4">
            {renderHeader()}
            <View className="flex-row flex-wrap justify-start gap-4">
              {products.length ? (
                products.map((item) => (
                  <View key={item.product_id} className="w-[23%] min-w-[200px] max-w-[300px] mb-4">
                    <ProductTile product={item} />
                  </View>
                ))
              ) : (
                <View className="items-center py-8 w-full">
                  <UiText className="text-muted-foreground text-center">
                    {searchQuery
                      ? t("search.no_products_found_for", { query: searchQuery })
                      : hasActiveFiltersApplied
                        ? t("search.no_products_found_filters")
                        : t("products.no_products_found")}
                  </UiText>
                </View>
              )}
            </View>
          </ScrollView>
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
                <UiText className="text-muted-foreground text-center">
                  {searchQuery
                    ? t("search.no_products_found_for", { query: searchQuery })
                    : hasActiveFiltersApplied
                      ? t("search.no_products_found_filters")
                      : t("products.no_products_found")}
                </UiText>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
}