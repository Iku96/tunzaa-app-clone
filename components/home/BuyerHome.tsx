import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import { RefreshControl } from "react-native";
import { MapPin, Search, ArrowRight, X, ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";
import { NotificationIcon } from "@/components/NotificationIcon";
import { AddressModal } from "@/components/modals/AddressModal";
import { AddressSelectionModal } from "@/components/modals/AddressSelectionModal";
import { useAddressManagement } from "@/hooks/useAddressManagement";
import { CategoryTile } from "@/components/categories/CategoryTile";
import { ShopTile } from "@/components/shop/ShopTile";
import {
  HomepageRecommendations,
  TrendingItems,
  CategoryPopular,
} from "@/components/recommendations";
import { useProducts } from "@/stores/products";
import { useCategories } from "@/stores/categories";
import { useFeaturedShops, useShops } from "@/stores/shops";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { API_CONFIG } from "@/src/services/config";
import {
  CategoryTileSkeleton,
  ShopTileSkeleton,
} from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { AdaptiveThemingDemo } from "@/examples/AdaptiveThemingDemo";
import { ScrollView } from "@/components/ui/scroll-view";
import { Image } from "expo-image";
import { WebCarousel } from "../carousel";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { FlashSaleSection } from "../Productcard/FlashSaleSection";
import { WebRecommendationSection } from "../Productcard/WebRecommendations";
import { WebShopSection } from "../Productcard/WebShopSection";
import { WebCategoryPopular } from "../Productcard/WebCategoryPopular";
import { AllProductsSection } from "./AllProductsSection";
import { useTenantModules } from "@/hooks/useTenantModules";

export function BuyerHome() {
  const router = useRouter();
  const { t } = useI18n();
  const resolvedColors = useResolvedThemeColors();
  const { isDeliveryEnabled } = useTenantModules();

  console.log("🔍 [BuyerHome] isDeliveryEnabled:", isDeliveryEnabled);

  const [showAddressSelectionModal, setShowAddressSelectionModal] =
    useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(
    "Dar es Salaam, Tanzania"
  );
  const { width } = useWindowDimensions(); // Get screen width to detect desktop
  const isDesktop = width >= 1024; // Define desktop as width >= 1024px
  const [refreshing, setRefreshing] = useState(false);

  // Address management hook
  const {
    buyerProfile,
    profileLoading,
    handleAddressSubmit,
    handleSetDefaultAddress,
  } = useAddressManagement({
    onSuccess: (newAddress) => {
      // Update location display and set as default
      setCurrentLocation(`${newAddress.address_line1}, ${newAddress.city}`);
      setShowAddressModal(false);
      setShowAddressSelectionModal(false);
    },
    onError: (errorMsg) => console.error("Address operation failed:", errorMsg),
  });

  const addresses = buyerProfile?.delivery_address || [];

  // Initialize current location from default address
  useEffect(() => {
    if (buyerProfile?.default_delivery_address && addresses.length > 0) {
      const defaultAddress = addresses.find(
        (addr) => addr.address_id === buyerProfile.default_delivery_address
      );
      if (defaultAddress) {
        setCurrentLocation(
          `${defaultAddress.address_line1}, ${defaultAddress.city}`
        );
      }
    }
  }, [buyerProfile, addresses]);

  // Use React Query hooks
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useProducts({
    is_featured: true,
    verification_status: "approved",
    is_vendor_active: true,
  });
  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } =
    useCategories();
  const { data: shopsData, isLoading: shopsLoading, refetch: refetchShops } = useFeaturedShops();

  const handleSearchPress = () => {
    router.push({
      pathname: "/search",
      params: { focus: "true" },
    });
  };

  const handleAddressButtonPress = () => {
    setShowAddressSelectionModal(true);
  };

  const handleAddressSelect = async (address: any) => {
    // Update the location display
    setCurrentLocation(`${address.address_line1}, ${address.city}`);

    // Set this address as default for checkout
    if (address.address_id !== buyerProfile?.default_delivery_address) {
      await handleSetDefaultAddress(address.address_id);
    }

    setShowAddressSelectionModal(false);
  };

  const handleAddNewAddress = () => {
    setShowAddressSelectionModal(false);
    setShowAddressModal(true);
  };

  const handleAddressModalSubmit = async (address: any) => {
    await handleAddressSubmit(address);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refetch all React Query data
      await Promise.all([
        refetchProducts(),
        refetchCategories(),
        refetchShops(),
      ]);

      // Refetch category products manually
      if (topCategories.length > 0) {
        const categoryRefreshPromises = topCategories.slice(0, 2).map(async (category) => {
          try {
            const res = await fetch(
              `${API_CONFIG.BASE_URL}/products/?category_id=${category.category_id}&is_active=true&verification_status=approved`,
              {
                headers: {
                  "X-Tenant-Id": API_CONFIG.TENANT_ID,
                },
              }
            );
            const data = await res.json();
            setCategoryProducts((prev) => ({
              ...prev,
              [category.category_id]: data.items || [],
            }));
          } catch (e) {
            setCategoryProducts((prev) => ({
              ...prev,
              [category.category_id]: [],
            }));
          }
        });

        await Promise.all(categoryRefreshPromises);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get data from React Query
  const trendingProducts = productsData?.items || [];
  const allCategories = categoriesData?.items || [];
  // Only top-level categories (no parent_id)
  const topCategories = allCategories.filter((cat) => !cat.parent_id);
  const shops = shopsData?.items || [];

  // Helper to fetch products for a category
  // We'll use a local state to store products per category
  const [categoryProducts, setCategoryProducts] = useState<
    Record<string, any[]>
  >({});
  const [loadingCategories, setLoadingCategories] = useState<
    Record<string, boolean>
  >({});

  // Fetch products for each top-level category on mount or when categories change
  useEffect(() => {
    if (topCategories.length > 0) {
      topCategories.forEach(async (category) => {
        setLoadingCategories((prev) => ({
          ...prev,
          [category.category_id]: true,
        }));
        try {
          const res = await fetch(
            `${API_CONFIG.BASE_URL}/products/?category_id=${category.category_id}&is_active=true&verification_status=approved`,
            {
              headers: {
                "X-Tenant-Id": API_CONFIG.TENANT_ID,
              },
            }
          );
          const data = await res.json();
          setCategoryProducts((prev) => ({
            ...prev,
            [category.category_id]: data.items || [],
          }));
        } catch (e) {
          setCategoryProducts((prev) => ({
            ...prev,
            [category.category_id]: [],
          }));
        } finally {
          setLoadingCategories((prev) => ({
            ...prev,
            [category.category_id]: false,
          }));
        }
      });
    }
  }, [categoriesData]);


  return (
    <View
      className="flex-1"
      style={{ backgroundColor: resolvedColors?.background || "#F8F9FD" }}
    >
      {/* Mobile/Tablet Header - Hidden on Desktop */}
      {/* Address picker - only show if delivery enabled */}
      {isDeliveryEnabled && (
      <View className="lg:hidden p-4 pb-2 flex-row items-center justify-between bg-background">
        <Button
          size="sm"
          variant="ghost"
          className="flex-1 mr-4 rounded-full pl-0"
          onPress={handleAddressButtonPress}
        >
          <View className="flex-row items-center flex-1">
            <Text
              className="text-base font-semibold ml-1 flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {currentLocation}
            </Text>
            <ChevronDown size={20} className="text-foreground ml-2 flex-shrink-0" />
          </View>
        </Button>
        <NotificationIcon />
      </View>
      )}

      {/* Show notification icon separately if delivery disabled */}
      {!isDeliveryEnabled && (
        <View className="lg:hidden p-4 pb-2 flex-row items-center justify-end bg-background">
          <NotificationIcon />
        </View>
      )}

      <Button
        variant="outline"
        className="lg:hidden mx-4 mb-0 rounded-full"

        style={{ borderRadius: 9999 }}
        onPress={handleSearchPress}
      >
        <View className="flex-row items-center w-full">
          <Search size={20} className="text-foreground mr-2" color={resolvedColors?.foreground || "#000000"} />
          <Text className="flex-1 ml-2 text-muted-foreground font-medium">
            {t("home.search_placeholder")}
          </Text>
        </View>
      </Button>

      {/* <AdaptiveThemingDemo /> */}

      <ScrollView>
        <View className="w-full">
          {/* Categories Section */}
          {isDesktop && (
            <WebCarousel />
          )}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Categories Section */}
            <View className="my-1 bg-background">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="min-h-200 pt-4"
                contentContainerStyle={{ gap: 6 }}
              >
                {categoriesLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                    <View key={index} style={{ width: isDesktop ? 230 : 88 }}>
                      <CategoryTileSkeleton />
                    </View>
                  ))
                  : topCategories.map((category) => (
                    <View key={category.category_id} style={{ width: isDesktop ? 230 : 90, height: isDesktop ? 230 : 100, alignItems: 'center', justifyContent: "space-between" }} >
                      <CategoryTile
                        id={category.category_id}
                        name={category.name}
                        icon={category.image_url}
                      />
                    </View>
                  ))}
              </ScrollView>
            </View>
          </ScrollView>



          {!isDesktop && <View className="rounded-t-xl bg-background mb-1">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 mb-4"
              onPress={() => router.push("/stores" as any)}
            >
              <Text className="text-base font-bold">
                {t("home.most_visited_shops")}
              </Text>
              <ArrowRight size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
            </TouchableOpacity>
            {!isDesktop && <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-6 pb-6 "
              contentContainerStyle={{ gap: 16, paddingRight: 32 }}
            >
              {shopsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <View key={index} style={{ width: 80 }}>
                    <ShopTileSkeleton />
                  </View>
                ))
              ) : (
                <>
                  {shops.map((shop) => (
                    <View key={shop.store_id} style={{ width: 80 }}>
                      <ShopTile
                        id={shop.store_id}
                        name={shop.store_name}
                        logo={shop.branding.logo_url}
                        delivery=""
                        badge={shop.is_featured ? "Featured" : undefined}
                      />
                    </View>
                  ))}
                </>
              )}
            </ScrollView>}
          </View>}

          {isDesktop && <WebShopSection shops={shops} />}


          {!isDesktop && <View className="bg-background mb-1">
            {/* Only show trending items if we have homepage recommendations or user is not logged in */}
            <Text className="text-base font-bold pt-4 px-4">
              {t("home.trending_products")}
            </Text>
            <View className=" pt-3">
              <TrendingItems count={6} timePeriod="week" title="Trending This Week" />

            </View>
          </View>}
          {isDesktop && <FlashSaleSection title={t("home.trending_products")} />}
          {/* {!isDesktop && <View className="bg-background mb-1"> */}
          {/* Only show trending items if we have homepage recommendations or user is not logged in */}
          {/* <Text className="text-base font-bold pt-4 px-4">
              {t("home.recommended_for_you")}
            </Text>
            <View className="pt-3"> */}
          {/* Load recommendations progressively to avoid overwhelming the app */}
          {/* <HomepageRecommendations count={4} title="Recommended for You" />
            </View>
          </View>} */}
          {/* {isDesktop && <WebRecommendationSection count={4} title="Recommended for You" />} */}
          {/* Limit to only 2 category sections to reduce API load */}
          {/* {isDesktop && topCategories.slice(0, 2).map((category) => (
            <View key={category.category_id} className="bg-background mb-4">
              <View className="pt-3"> */}
          {/* Load recommendations progressively to avoid overwhelming the app */}
          {/* <WebCategoryPopular
                  key={category.category_id}
                  categoryId={category.category_id}
                  title={`${t("home.popular_in")} ${category.name}`}
                  count={12}
                />
              </View>
            </View>
          ))} */}
          {/* {!isDesktop && topCategories.slice(0, 2).map((category) => (
          <View className="bg-background mb-1"> */}
          {/* Only show trending items if we have homepage recommendations or user is not logged in */}
          {/* <Text className="text-base font-bold pt-4 px-4">
          {t("home.popular_in")}{` ${category.name}`}
             </Text>
          <View className=" pt-3"> */}
          {/* Load recommendations progressively to avoid overwhelming the app */}
          {/* <CategoryPopular
            key={category.category_id}
            categoryId={category.category_id}
            count={4}
            title={`${t("home.popular_in")} ${category.name}`}
          />
        </View>
        </View>
          
        ))} */}

          {/* All Products Section with Infinite Scroll */}
          <AllProductsSection />
        </View>
      </ScrollView>

      {isDeliveryEnabled && (
        <AddressSelectionModal
          isOpen={showAddressSelectionModal}
          addresses={addresses}
          currentLocation={currentLocation}
          defaultAddressId={buyerProfile?.default_delivery_address}
          isLoading={profileLoading}
          onClose={() => setShowAddressSelectionModal(false)}
          onAddressSelect={handleAddressSelect}
          onAddNewAddress={handleAddNewAddress}
        />
      )}

      {isDeliveryEnabled && (
        <AddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSubmit={handleAddressModalSubmit}
        />
      )}
    </View>
  );
}
