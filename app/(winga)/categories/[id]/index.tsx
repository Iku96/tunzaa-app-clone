import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Search, Filter } from "lucide-react-native";
import { useCategoryById } from "@/stores/categories";
import { useProducts } from "@/stores/products";
import { Button } from "@/components/ui/button";
import { Text as UiText } from "@/components/ui/text";
import { ProductTile } from "@/components/products/ProductTile";
import { CategoryTile } from "@/components/categories/CategoryTile";
import CategoryDetails from "@/features/categories/components/CategoryDetails";
import ProductGrid from "@/features/products/components/ProductGrid";

const { width } = Dimensions.get("window");
const GRID_SPACING = 16;
const NUM_COLUMNS = 2;
const TILE_SIZE =
  (width - (32 + GRID_SPACING * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );

  // Use React Query hooks
  const { data: category, isLoading: categoryLoading } = useCategoryById(
    id as string
  );
  const { data: productsData, isLoading: productsLoading } = useProducts({
    category_id: selectedSubcategory || (id as string),
    limit: 20,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  });

  if (!category && !categoryLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <UiText className="text-lg font-semibold text-foreground">
            Category not found
          </UiText>
          <View className="w-6" />
        </View>
      </SafeAreaView>
    );
  }

  if (categoryLoading || !category) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <UiText className="text-lg font-semibold text-foreground">
            Loading...
          </UiText>
          <View className="w-6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <CategoryDetails
          category={category}
          selectedSubcategory={selectedSubcategory}
          onSubcategorySelect={setSelectedSubcategory}
        />

        {productsData?.items && productsData.items.length > 0 ? (
          <ProductGrid products={productsData.items} />
        ) : (
          <View className="p-4">
            <UiText className="text-center text-foreground">
              No products found in this category
            </UiText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: "#000000",
  },
  searchSection: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  filterButton: {
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  subcategoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  subcategoryWrapper: {
    width: 88,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: GRID_SPACING,
  },
  productWrapper: {
    width: TILE_SIZE,
  },
});
