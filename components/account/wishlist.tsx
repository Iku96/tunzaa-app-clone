import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, Trash2, ShoppingCart } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useGetWishlist, useRemoveFromWishlist, useClearWishlist, useMoveToCart } from "@/src/services/wishlist";
import { WishlistItem } from "@/components/wishlist";
import { WishlistItem as WishlistItemType } from "@/src/services/types/wishlist";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { useI18n } from "@/hooks/useI18n";

const WishlistScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);
  const resolvedColors = useResolvedThemeColors();
  const { isDesktop } = useResponsive();

  // Wishlist hooks
  const { data: wishlistData, isLoading, refetch } = useGetWishlist(0, 100, true);
  const removeFromWishlist = useRemoveFromWishlist();
  const clearWishlist = useClearWishlist();
  const moveToCart = useMoveToCart();

  const wishlistItems = wishlistData?.items || [];
  const totalItems = wishlistData?.total || 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRemoveItem = async (productId: string, variantSku?: string) => {
    try {
      await removeFromWishlist.mutateAsync({ productId, variantSku });
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleClearWishlist = async () => {
    try {
      await clearWishlist.mutateAsync();
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
    }
  };

  const handleMoveToCart = async () => {
    if (wishlistItems.length === 0) return;
    try {
      const productIds = wishlistItems.map((item) => item.product_id);
      await moveToCart.mutateAsync({ product_ids: productIds, verify_stock: true });
      router.push("/cart");
    } catch (error) {
      console.error("Failed to move items to cart:", error);
    }
  };

  const handleMoveItemToCart = async (productId: string, variantSku?: string) => {
    try {
      await moveToCart.mutateAsync({
        product_ids: [productId],
        verify_stock: true,
      });
      router.push("/cart");
    } catch (error) {
      console.error("Failed to move item to cart:", error);
    }
  };

  if (!user?.user_id) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-6">
          <Heart
            size={64}
            className="text-muted-foreground mb-4"
            color={resolvedColors.primary}
            fill={resolvedColors.primary}
          />
          <Text className="text-xl font-semibold text-foreground mb-2">
            {t("wishlist.sign_in_to_view_wishlist")}
          </Text>
          <Text className="text-base text-muted-foreground text-center mb-6">
            {t("wishlist.create_account_save_favorites")}
          </Text>
          <Button onPress={() => router.push("/(auth)/login")}>
            <Text className="text-base font-medium">{t("wishlist.sign_in")}</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView className="flex-1 bg-background">
        {/* Header */}
       {!isDesktop &&  <View className="flex-row items-center justify-between p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">{t("wishlist.my_wishlist")}</Text>
          <View className="w-6" />
        </View>}

        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {isLoading ? (
            <View className="flex-1 justify-center items-center p-6">
              <Text className="text-base text-muted-foreground">{t("wishlist.loading_wishlist")}</Text>
            </View>
          ) : wishlistItems.length === 0 ? (
            <View className="flex-1 justify-center items-center p-6">
              <Heart
                size={64}
                className="text-muted-foreground mb-4"
                color={resolvedColors.primary}
                fill={resolvedColors.primary}
              />
              <Text className="text-xl font-semibold text-foreground mb-2 mt-4">
                {t("wishlist.wishlist_empty")}
              </Text>
              <Text className="text-base text-muted-foreground text-center mb-6">
                {t("wishlist.start_adding_products")}
              </Text>
              <Button onPress={() => router.push("/(buyer)")}>
                <Text className="text-base font-medium">{t("wishlist.browse_products")}</Text>
              </Button>
            </View>
          ) : (
            <>
              {/* Wishlist Summary */}
         <View className="p-4 bg-secondary/10">
  {isDesktop ? (
    // ✅ Desktop layout: left/right
    <View className="flex-row items-center justify-between w-full">
      {/* Left side: items + subtitle */}
      <View>
        <Text className="text-lg font-semibold text-foreground">
          {totalItems} {totalItems === 1 ? t("wishlist.item") : t("wishlist.items")}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {t("wishlist.save_favorite_products_later")}
        </Text>
      </View>

      {/* Right side: buttons */}
      <View className="flex-row gap-x-2">
        <Button
          variant="destructive"
          size="sm"
          onPress={handleClearWishlist}
          disabled={clearWishlist.isPending}
          className="flex-row items-center"
        >
          <Trash2 size={16} className="mr-2" color="white" />
          <Text className="text-sm font-medium ml-2">{t("wishlist.clear_all")}</Text>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={handleMoveToCart}
          disabled={moveToCart.isPending}
          className="flex-row items-center"
        >
          <ShoppingCart size={16} className="mr-2" />
          <Text className="text-sm font-medium ml-2">{t("wishlist.move_to_cart")}</Text>
        </Button>
      </View>
    </View>
  ) : (
    // ✅ Mobile layout: stacked (original)
    <>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-semibold text-foreground">
            {totalItems} {totalItems === 1 ? t("wishlist.item") : t("wishlist.items")}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {t("wishlist.save_favorite_products_later")}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-x-2 justify-end w-full mt-4">
        <Button
          variant="destructive"
          size="sm"
          onPress={handleClearWishlist}
          disabled={clearWishlist.isPending}
          className="flex-row items-center"
        >
          <Trash2 size={16} className="mr-2" color="white" />
          <Text className="text-sm font-medium ml-2">{t("wishlist.clear_all")}</Text>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={handleMoveToCart}
          disabled={moveToCart.isPending}
          className="flex-row items-center"
        >
          <ShoppingCart size={16} className="mr-2" />
          <Text className="text-sm font-medium ml-2">{t("wishlist.move_to_cart")}</Text>
        </Button>
      </View>
    </>
  )}
</View>



              {/* Wishlist Items */}
              <View className={`p-4 ${isDesktop ? "grid grid-cols-4 gap-6" : ""}`}>
                {wishlistItems.map((item) => (
                  <WishlistItem
                    key={item.wishlist_id}
                    item={item}
                    onRemove={handleRemoveItem}
                    onMoveToCart={handleMoveItemToCart}
                    onEdit={(item) => {
                      // console.log("Edit item:", item);
                    }}
                    variant={isDesktop ? undefined : "compact"} // desktop uses grid card style
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
  );
};

export default WishlistScreen;
