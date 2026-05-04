import React, { useState, useRef } from "react";
import { View, TextInput, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SearchBar } from "@/components/SearchBar";
import { useCategories } from "@/stores/categories";
import { useVendors } from "@/stores/vendors";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react-native";
import { ProductsParams } from "@/src/services/products";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { useRouter, usePathname } from "expo-router";
import { useI18n } from "@/hooks/useI18n";

interface SearchFilters {
  query: string;
  min_price?: number;
  max_price?: number;
  category_id?: string;
  vendor_id?: string;
}

interface SearchWithFiltersProps {
  store_id?: string;
  category_id?: string;
  onFiltersChange: (filters: ProductsParams) => void;
  onSearch: (query: string) => void;
  isCategoryScreen?: boolean; // New prop to indicate category screen
}

export default function SearchWithFilters({
  store_id,
  category_id,
  onFiltersChange,
  onSearch,
  isCategoryScreen = false, // Default to false
}: SearchWithFiltersProps) {
  const resolvedColors = useResolvedThemeColors();
  const { isDesktop } = useResponsive();
  const { t } = useI18n();
  const searchInputRef = useRef<TextInput>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    min_price: undefined,
    max_price: undefined,
    category_id: category_id || undefined,
    vendor_id: undefined,
  });

  const router = useRouter();
  const pathname = usePathname();
  const { data: categoriesData } = useCategories();
  const { data: vendorsData } = useVendors({
    is_active: true,
    verification_status: "approved",
  });

  const categories = categoriesData?.items || [];
  const vendors = vendorsData?.items || [];

  const handleSearch = (searchQuery: string) => {
    setFilters((prev) => ({ ...prev, query: searchQuery }));
    onSearch(searchQuery);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const query: Record<string, string> = {};
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") query[k] = String(v);
    });

    // Determine the pathname and params based on isCategoryScreen
    if (isCategoryScreen && key === "category_id" && value) {
      // Navigate to /categories/[newCategoryId] without query params
      router.replace({
        pathname: "/categories/[id]",
        params: { id: value },
      });
    } else {
      // Use current pathname and append query params
      router.replace({
        pathname: pathname as any, // Use any to avoid type conflicts
        params: query,
      });
    }

    const searchParams: ProductsParams = {
      skip: 0,
      limit: 50,
      is_active: true,
      verification_status: "approved",
      ...newFilters,
    };

    if (store_id) searchParams.store_id = store_id;
    onFiltersChange(searchParams);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: filters.query,
      min_price: undefined,
      max_price: undefined,
      category_id: undefined,
      vendor_id: undefined,
      is_vendor_active: true,
    };
    setFilters(clearedFilters);

    const query: Record<string, string> = {};
    if (filters.query) query.query = filters.query;

    // Determine the pathname and params based on isCategoryScreen
    if (isCategoryScreen && category_id) {
      // Revert to the original category ID without query params
      router.replace({
        pathname: "/categories/[id]",
        params: { id: category_id },
      });
    } else {
      // Use current pathname and append query params
      router.replace({
        pathname: pathname as any, // Use any to avoid type conflicts
        params: query,
      });
    }

    const searchParams: ProductsParams = {
      skip: 0,
      limit: 50,
      is_active: true,
      verification_status: "approved",
      ...clearedFilters,
      is_vendor_active: true,
    };

    if (store_id) searchParams.store_id = store_id;
    onFiltersChange(searchParams);
  };

  const handlePriceModalApply = (minPrice?: number, maxPrice?: number) => {
    handleFilterChange("min_price", minPrice);
    handleFilterChange("max_price", maxPrice);
    setShowPriceModal(false);
  };

  const hasActiveFilters =
    filters.min_price ||
    filters.max_price ||
    filters.vendor_id ||
    filters.category_id;

  if (isDesktop) {
    return (
      <View className="border-b border-border bg-white px-0 py-3">
        <View className="flex-row justify-between items-center gap-4">
          <View className="flex-row items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat.category_id}
                variant={filters.category_id === cat.category_id ? "secondary" : "outline"}
                className="rounded-full px-4 py-2"
                onPress={() => handleFilterChange("category_id", cat.category_id)}
              >
                <Text>{cat.name}</Text>
              </Button>
            ))}
          </View>
          <View>
            <Button
              variant="outline"
              className="rounded-full px-4 py-2"
              onPress={() => setShowPriceModal(true)}
            >
              <Text>{t("public.price_range")} ▼</Text>
            </Button>
            <Modal
              visible={showPriceModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowPriceModal(false)}
            >
              <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <Text className="text-lg font-semibold mb-4">{t("public.set_price_range")}</Text>
                  <View className="flex-row gap-4 mb-4">
                    <Input
                      placeholder={t("public.min_price")}
                      keyboardType="numeric"
                      value={filters.min_price?.toString() || ""}
                      onChangeText={(text) =>
                        setFilters((prev) => ({
                          ...prev,
                          min_price: text ? Number(text) : undefined,
                        }))
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder={t("public.max_price")}
                      keyboardType="numeric"
                      value={filters.max_price?.toString() || ""}
                      onChangeText={(text) =>
                        setFilters((prev) => ({
                          ...prev,
                          max_price: text ? Number(text) : undefined,
                        }))
                      }
                      className="flex-1"
                    />
                  </View>
                  <View className="flex-row justify-end gap-2">
                    <Button
                      variant="outline"
                      onPress={() => {
                        setFilters((prev) => ({
                          ...prev,
                          min_price: undefined,
                          max_price: undefined,
                        }));
                        handlePriceModalApply(undefined, undefined);
                      }}
                    >
                      <Text>{t("common.clear")}</Text>
                    </Button>
                    <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      onPress={() => handlePriceModalApply(filters.min_price, filters.max_price)}
                    >
                      <Text className="text-white">{t("common.apply")}</Text>
                    </Button>
                  </View>
                  <TouchableOpacity
                    className="absolute top-2 right-2"
                    onPress={() => setShowPriceModal(false)}
                  >
                    <Text className="text-gray-500">✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-center gap-2 p-4 border-b border-border">
        <View className="flex-1">
          <SearchBar
            ref={searchInputRef}
            interactive={true}
            placeholder={t("search.placeholder")}
            onSearch={handleSearch}
          />
        </View>
        <Button
          variant={showFilters ? "primary" : "ghost"}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={resolvedColors?.foreground} />
        </Button>
      </View>

      {showFilters && (
        <View className="m-4 p-4 bg-background rounded-lg shadow">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold">{t("public.filter_results")}</Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-primary text-sm">{t("public.clear_filters")}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2">{t("public.price_range")}</Text>
            <View className="flex-row gap-2">
              <Input
                placeholder={t("public.min")}
                keyboardType="numeric"
                value={filters.min_price?.toString() || ""}
                onChangeText={(text) =>
                  handleFilterChange("min_price", text ? Number(text) : undefined)
                }
                className="flex-1"
              />
              <Input
                placeholder={t("public.max")}
                keyboardType="numeric"
                value={filters.max_price?.toString() || ""}
                onChangeText={(text) =>
                  handleFilterChange("max_price", text ? Number(text) : undefined)
                }
                className="flex-1"
              />
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2">{t("categories.category")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <Button
                  variant={!filters.category_id ? "primary" : "outline"}
                  size="sm"
                  onPress={() => handleFilterChange("category_id", undefined)}
                >
                  <Text>{t("categories.all_categories")}</Text>
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.category_id}
                    variant={filters.category_id === category.category_id ? "primary" : "outline"}
                    size="sm"
                    onPress={() => handleFilterChange("category_id", category.category_id)}
                  >
                    <Text>{category.name}</Text>
                  </Button>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}