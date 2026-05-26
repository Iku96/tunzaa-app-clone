import React, { forwardRef, useState } from "react";
import { View, TextInput, NativeSyntheticEvent, TextInputSubmitEditingEventData, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/useI18n";
import { Search } from "lucide-react-native";

interface SearchBarProps {
  interactive?: boolean;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  ({ interactive = false, placeholder, onSearch }, ref) => {
    const router = useRouter();
    const { t } = useI18n();
    const defaultPlaceholder = placeholder || t("home.search_placeholder");
    const [searchQuery, setSearchQuery] = useState(""); // Track input value
    const isWeb = Platform.OS === "web";

    const handleSearch = () => {
      const query = searchQuery.trim();
      if (!query) return;

      // Call optional callback
      if (interactive && onSearch) {
        onSearch(query);
      }

      // Navigate to search results page
      router.push({
        pathname: "/search",
        params: { query },
      });
    };

    const handleSubmit = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      const query = e.nativeEvent.text.trim();
      if (!query) return;

      // Call optional callback
      if (interactive && onSearch) {
        onSearch(query);
      }

      // Navigate to search results page
      router.push({
        pathname: "/search",
        params: { query },
      });
    };

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: isWeb ? 24 : 5, // No border radius on mobile
          marginVertical: 8,
          borderWidth: 1,
          borderColor: "#D1D5DB",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Input
          ref={ref}
          style={{
            flex: 1,
            fontSize: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            paddingRight: isWeb ? 48 : 16, // Less padding on mobile (no icon)
            borderWidth: 0, // Border is on parent View
            outline: "none", // Remove focus highlight
          }}
          withFocusStyles={false} // Disable default focus styles
          placeholder={defaultPlaceholder}
          placeholderTextColor="#6B7280"
          editable={interactive}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          onChangeText={setSearchQuery} // Update searchQuery state
          value={searchQuery}
        />
        {isWeb && (
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              padding: 8,
              backgroundColor: interactive && searchQuery.trim() ? "#EF4444" : "#D1D5DB", // Red when active, gray when disabled
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 24,
              marginRight: 4, // Space from input edge
            }}
            disabled={!interactive || !searchQuery.trim()}
            accessibilityLabel="Search"
          >
            <Search size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);