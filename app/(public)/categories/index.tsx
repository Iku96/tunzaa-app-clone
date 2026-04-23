import React from "react";
import { View, FlatList, useWindowDimensions } from "react-native";
import { CategoryTile } from "@/components/categories/CategoryTile";
import { CategoryTileSkeleton } from "@/components/ui/skeleton";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useCategories } from "@/stores/categories";
import { Text } from "@/components/ui/text";
import { usePageTitle } from "@/hooks/usePageTitle";

const CategoriesComponent = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const allCategories = categoriesData?.items || [];
  const topCategories = allCategories.filter((cat) => !cat.parent_id);
  usePageTitle("Categories");
  const renderCategoryItem = ({ item }: any) => (
    <View style={{ width: isDesktop ? 230 : 150, height: isDesktop ? 230 : 150, alignItems: 'center', justifyContent: "space-between" }}>
      <CategoryTile
        id={item.category_id}
        name={item.name}
        icon={item.image_url}
      />
    </View>
  );

  const renderSkeleton = () => (
    <View style={{ width: isDesktop ? 230 : 150 }}>
      <CategoryTileSkeleton />
    </View>
  );

  if (isDesktop) {
    return (
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={true}
        containerClassName="bg-white"
      >
        <View className="px-0 py-10">
          <Text className="text-2xl font-bold text-foreground mb-6">Categories</Text>
          <View className="w-full flex-row flex-wrap gap-6">
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <View key={index}>{renderSkeleton()}</View>
                ))
              : topCategories.map((category) => (
                  <View key={category.category_id}>{renderCategoryItem({ item: category })}</View>
                ))}
          </View>
        </View>
      </DesktopLayoutWrapper>
    );
  }

  return (
    <View className="p-4">
      <Text className="text-base font-bold mb-4">Categories</Text>
      <FlatList
        data={topCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.category_id}
        horizontal={false}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: 16, justifyContent: "space-between" }}
        ListEmptyComponent={categoriesLoading ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index}>{renderSkeleton()}</View>
            ))}
          </View>
        ) : null}
      />
    </View>
  );
};

export default CategoriesComponent;