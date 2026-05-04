import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Star,
  Filter,
  ChevronDown,
  ShoppingCart,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductTile } from "@/components/products/ProductTile";
import { useProducts, useFilteredProducts } from "@/stores/products";
import { Store } from "@/src/services/shops";
import {
  StoreDetailsSkeleton,
  ProductTileSkeleton,
} from "@/components/ui/skeleton";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useI18n } from "@/hooks/useI18n";

interface StoreDetailsViewProps {
  shop: Store;
}

export default function StoreDetailsView({ shop }: StoreDetailsViewProps) {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();
  // Fetch products for this store
  const { data: productsData, isLoading: productsLoading } = useProducts({
    store_id: shop.store_id,
    is_active: true,
    verification_status: "approved",
  });

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Filter products using the new hook
  const filteredProducts = useFilteredProducts(
    productsData?.items || [],
    searchQuery,
    selectedCategory
  );

  return (
    <Animated.ScrollView
      className="flex-1"
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
          useNativeDriver: true,
        }
      )}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Store Banners */}
      {shop.banners && shop.banners.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 w-full"
        >
          {shop.banners.map((banner) => (
            <Image
              key={banner.banner_id}
              source={{ uri: banner.image_url }}
              className="w-80 h-40 rounded-lg mr-4"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {/* Store Description */}
      <View className="p-4">
        <Text className="text-base text-foreground">
          {shop.description}
        </Text>
      </View>

      {/* Search and Filter Section */}
      <View className="flex-row p-4 gap-3">
        <View className="flex-1 flex-row items-center bg-muted rounded-xl p-3 gap-2">
          <Search size={20} className="text-gray-600" color={resolvedColors.foreground} />
          <Input
            className="flex-1 text-base"
            placeholder={t("products.search_products_placeholder")}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {/* <Button
          variant="ghost"
          size="icon"
          className="bg-gray-100 rounded-xl p-3"
        >
          <Filter size={20} className="text-gray-600" color={resolvedColors.primary} />
        </Button> */}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 pb-4"
      >
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Badge
              variant={selectedCategory === null ? "primary" : "secondary"}
              className="px-4 py-2 rounded-full"
            >
              <Text
                className={`text-sm ${
                  selectedCategory === null ? "text-white" : "text-gray-600"
                } font-semibold`}
              >
                {t("categories.all")}
              </Text>
            </Badge>
          </TouchableOpacity>
          {shop.featured_categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
            >
              <Badge
                variant={
                  selectedCategory === category ? "default" : "secondary"
                }
                className="px-4 py-2"
              >
                <Text
                  className={`text-sm ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-gray-600"
                  } font-semibold`}
                >
                  {category}
                </Text>
              </Badge>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Products Grid */}
      <View className="p-4 flex-row flex-wrap gap-4">
        {productsLoading ? (
          <View className="flex-row flex-wrap justify-between w-full">
            {Array.from({ length: 8 }).map((_, index) => (
              <View key={index} className="w-[48%] mb-4">
                <ProductTileSkeleton />
              </View>
            ))}
          </View>
        ) : filteredProducts.length === 0 ? (
          <Text>{t("products.no_products_found")}</Text>
        ) : (
          filteredProducts.map((product) => (
            <ProductTile key={product.product_id} product={product} />
          ))
        )}
      </View>
    </Animated.ScrollView>
  );
}
