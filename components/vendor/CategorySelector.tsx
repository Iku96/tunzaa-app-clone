import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { type Category } from "@/services/categories";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

// Category Selector Component
export const CategorySelector = React.memo(
  ({
    categories,
    selectedCategories,
    onCategoryChange,
    disabled = false,
  }: {
    categories: Category[];
    selectedCategories: Category[];
    onCategoryChange: (categories: Category[]) => void;
    disabled?: boolean;
  }) => {
    const resolvedColors = useResolvedThemeColors();

    const toggleCategory = (category: Category) => {
      if (selectedCategories.some((cat) => cat.category_id === category.category_id)) {
        const newSelected = selectedCategories.filter((cat) => cat.category_id !== category.category_id);
        onCategoryChange(newSelected);
      } else {
        const newSelected = [...selectedCategories, category];
        onCategoryChange(newSelected);
      }
    };

    // Get theme-aware colors
    const primaryColor = resolvedColors?.primary || "#0ea5e9";
    const primaryWithOpacity = resolvedColors?.primaryWithOpacity?.(0.1) || "#e0f2fe";
    const mutedColor = "#6b7280";
    const borderColor = "#e5e7eb";
    const backgroundColor = resolvedColors?.background || "#f9fafb";
    const textColor = "#374151";
    const lightBorderColor = "#d1d5db";

    return (
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: "500" }}>
          Categories <Text className="text-destructive">*</Text>
        </Text>

        {categories.length === 0 ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: borderColor,
              borderRadius: 8,
              padding: 16,
              alignItems: "center",
              backgroundColor: backgroundColor,
            }}
          >
            <Text style={{ fontSize: 14, color: mutedColor }}>Loading categories...</Text>
          </View>
        ) : (
          <View
            style={{
              borderWidth: 1,
              borderColor: borderColor,
              borderRadius: 8,
              backgroundColor: disabled ? backgroundColor : resolvedColors.background,
              maxHeight: 300,
              minHeight: 180,
            }}
          >
            <ScrollView
              style={{ flex: 1, padding: 12 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View style={{ gap: 8 }}>
                {categories.map((category) => {
                  const isSelected = selectedCategories.some((cat) => cat.category_id === category.category_id);
                  return (
                    <TouchableOpacity
                      key={category.category_id}
                      onPress={() => !disabled && toggleCategory(category)}
                      disabled={disabled}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 6,
                        backgroundColor: isSelected ? primaryWithOpacity : "transparent",
                        borderWidth: isSelected ? 1 : 0,
                        borderColor: isSelected ? primaryColor : "transparent",
                      }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 3,
                          borderWidth: 2,
                          borderColor: isSelected ? primaryColor : lightBorderColor,
                          backgroundColor: isSelected ? primaryColor : "transparent",
                          marginRight: 12,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && (
                          <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>✓</Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: isSelected ? primaryColor : textColor,
                          }}
                        >
                          {category.name}
                        </Text>
                        {category.description && (
                          <Text style={{ fontSize: 12, color: mutedColor, marginTop: 2 }}>
                            {category.description}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        <Text style={{ fontSize: 12, color: mutedColor }}>
          {selectedCategories.length > 0
            ? `${selectedCategories.length} selected`
            : "Select categories for your product"}
        </Text>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to ensure proper re-rendering
    // Return true if props are equal (don't re-render), false if different (re-render)

    // Check simple props first
    if (prevProps.disabled !== nextProps.disabled) return false;
    if (prevProps.categories.length !== nextProps.categories.length) return false;

    // Check selectedCategories arrays (order-independent comparison)
    if (prevProps.selectedCategories.length !== nextProps.selectedCategories.length) return false;

    const prevSelectedSet = new Set(prevProps.selectedCategories.map((cat) => cat.category_id));
    const nextSelectedSet = new Set(nextProps.selectedCategories.map((cat) => cat.category_id));

    if (prevSelectedSet.size !== nextSelectedSet.size) return false;

    for (const id of prevSelectedSet) {
      if (!nextSelectedSet.has(id)) return false;
    }

    // Check if categories array changed (compare category_id)
    for (let i = 0; i < prevProps.categories.length; i++) {
      if (prevProps.categories[i]?.category_id !== nextProps.categories[i]?.category_id) {
        return false;
      }
    }

    return true; // Props are equal, don't re-render
  }
);