import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Platform, ScrollView, TextInput } from "react-native";
import { useRouter, usePathname, useLocalSearchParams } from "expo-router";
import { ChevronRight, Filter } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/stores/categories";
import { CategoryTileSkeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { ProductsParams } from "@/services/products";
import { Image } from "expo-image";

interface CategoriesSidebarProps {
  store_id?: string;
  category_id?: string;
  onFiltersChange: (filters: ProductsParams) => void;
  onSearch: (query: string) => void;
  isCategoryScreen?: boolean;
}

export function CategoriesSidebar({
  store_id,
  category_id: initialCategoryId,
  onFiltersChange,
  onSearch,
  isCategoryScreen = false,
}: CategoriesSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useLocalSearchParams();
  const { t } = useI18n();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const [filters, setFilters] = useState({
    query: (searchParams.query as string) || "",
    min_price: searchParams.min_price ? Number(searchParams.min_price) : undefined,
    max_price: searchParams.max_price ? Number(searchParams.max_price) : undefined,
    category_id: initialCategoryId || (searchParams.category_id as string) || undefined,
    is_vendor_active: true,
  });

  // Sync filters with URL params on mount and when params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      query: (searchParams.query as string) || prev.query,
      min_price: searchParams.min_price ? Number(searchParams.min_price) : prev.min_price,
      max_price: searchParams.max_price ? Number(searchParams.max_price) : prev.max_price,
      category_id: initialCategoryId || (searchParams.category_id as string) || prev.category_id,
    }));
  }, [searchParams.query, searchParams.min_price, searchParams.max_price, searchParams.category_id, initialCategoryId]);

  if (Platform.OS !== "web") {
    return null;
  }

  const categories = categoriesData?.items || [];
  const topCategories = categories.filter((cat) => !cat.parent_id);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Build query params, preserving existing search query
    const query: Record<string, string> = {};
    
    // Always preserve the search query if it exists
    if (newFilters.query) {
      query.query = newFilters.query;
    }
    
    // Add other filters
    Object.entries(newFilters).forEach(([k, v]) => {
      if (k !== 'query' && k !== 'is_vendor_active' && v !== undefined && v !== "") {
        query[k] = String(v);
      }
    });

    if (isCategoryScreen && key === "category_id" && value) {
      router.replace({
        pathname: "/categories/[id]",
        params: { id: value, ...query },
      });
    } else {
      router.replace({
        pathname: pathname as "/search" | "/categories",
        params: query,
      });
    }

    const searchParamsData: ProductsParams = {
      skip: 0,
      limit: 50,
      is_active: true,
      verification_status: "approved",
      ...newFilters,
      is_vendor_active: true,
    };
    if (store_id) searchParamsData.store_id = store_id;
    onFiltersChange(searchParamsData);
  };

  const handlePriceInputChange = (key: "min_price" | "max_price", value: string) => {
    // Convert input to number, ensuring non-negative for min_price
    const numValue = value ? Number(value) : undefined;
    if (key === "min_price" && numValue !== undefined && numValue < 0) {
      return; // Prevent negative min_price
    }
    handleFilterChange(key, numValue);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: filters.query, // Preserve search query
      min_price: undefined,
      max_price: undefined,
      category_id: isCategoryScreen ? initialCategoryId : undefined,
      is_vendor_active: true,
    };
    setFilters(clearedFilters);

    const query: Record<string, string> = {};
    
    // Preserve search query when clearing filters
    if (clearedFilters.query) {
      query.query = clearedFilters.query;
    }

    if (isCategoryScreen && initialCategoryId) {
      router.replace({
        pathname: "/categories/[id]",
        params: { id: initialCategoryId, ...query },
      });
    } else {
      router.replace({
        pathname: pathname as "/search" | "/categories",
        params: query,
      });
    }

    const searchParamsData: ProductsParams = {
      skip: 0,
      limit: 50,
      is_active: true,
      verification_status: "approved",
      ...clearedFilters,
      is_vendor_active: true,
    };
    if (store_id) searchParamsData.store_id = store_id;
    onFiltersChange(searchParamsData);
  };

  const hasActiveFilters =
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    (filters.category_id && !isCategoryScreen);

  return (
    <Card style={{ padding: 16 }}>
      {/* Categories Section */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Filter size={20} color="#4b5563" style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 18, fontWeight: "600" }}>{t("sidebar.categories")}</Text>
      </View>
      <ScrollView style={{ maxHeight: 384 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 8 }}>
          {categoriesLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CategoryTileSkeleton key={index} />
            ))
          ) : (
            <>
              <TouchableOpacity
                onPress={() => handleFilterChange("category_id", undefined)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  backgroundColor: !filters.category_id ? "#e5e7eb" : "transparent",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "500", color: "#1f2937" }}>
                  {t("sidebar.all_categories")}
                </Text>
                <ChevronRight size={16} color="#9ca3af" />
              </TouchableOpacity>
              {topCategories.map((category) => (
                <TouchableOpacity
                  key={category.category_id}
                  onPress={() => handleFilterChange("category_id", category.category_id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor:
                      filters.category_id === category.category_id ? "#e5e7eb" : "transparent",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    {category.image_url && (
                      <Image
                        source={{ uri: category.image_url }}
                        style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12 }}
                      />
                    )}
                    <Text style={{ fontSize: 14, color: "#374151", flex: 1 }}>
                      {category.name}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Price Filter Section */}
      <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderColor: "#e5e7eb" }}>
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
          {t("sidebar.price_range")}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Input
            value={filters.min_price?.toString() || ""}
            onChangeText={(value) => handlePriceInputChange("min_price", value)}
            placeholder="Min Price"
            keyboardType="numeric"
            style={{ flex: 1, height: 40, borderRadius: 8 }}
          />
          <Text style={{ fontSize: 16, color: "#374151" }}>-</Text>
          <Input
            value={filters.max_price?.toString() || ""}
            onChangeText={(value) => handlePriceInputChange("max_price", value)}
            placeholder="Max Price"
            keyboardType="numeric"
            style={{ flex: 1, height: 40, borderRadius: 8 }}
          />
        </View>
      </View>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <View style={{ marginTop: 16 }}>
          <Button variant="outline" onPress={clearFilters}>
            <Text>{t("sidebar.clear_all")}</Text>
          </Button>
        </View>
      )}
    </Card>
  );
}