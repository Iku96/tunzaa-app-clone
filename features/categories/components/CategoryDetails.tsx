import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Category } from "@/src/services/categories";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";

interface CategoryDetailsProps {
  category: Category;
  selectedSubcategory: string | null;
  onSubcategorySelect: (subcategoryId: string | null) => void;
}

export default function CategoryDetails({
  category,
  selectedSubcategory,
  onSubcategorySelect,
}: CategoryDetailsProps) {
  const { t } = useI18n();
  
  return (
    <View className="p-2">
      <Text className="mb-4 text-2xl font-bold text-foreground">
        {category.name}
      </Text>

      {category.subcategories && category.subcategories.length > 0 && (
        <View className="mb-4">
          <Text className="mb-2 text-lg font-semibold text-foreground">
            {t("categories.subcategories")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {category.subcategories.map((subcategory: Category) => (
              <TouchableOpacity
                key={subcategory.category_id}
                onPress={() =>
                  onSubcategorySelect(
                    selectedSubcategory === subcategory.category_id
                      ? null
                      : subcategory.category_id
                  )
                }
                className="mr-2"
              >
                <Card 
                  className={`px-4 py-2 rounded-lg ${
                    selectedSubcategory === subcategory.category_id
                      ? "bg-primary border-primary"
                      : "bg-muted border-border"
                  }`}
                >
                  <Text 
                    className={`text-sm font-medium ${
                      selectedSubcategory === subcategory.category_id
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {subcategory.name}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
