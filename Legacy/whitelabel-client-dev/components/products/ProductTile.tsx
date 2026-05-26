import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Product, ProductImage } from "@/services/products";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/utils/images";
import { useAuth } from "@/context/auth";
import { useCheckWishlistStatus, useAddToWishlist, useRemoveFromWishlist } from "@/services/wishlist";
import { useWishlistStore } from "@/stores/wishlist";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { FlashSaleCard } from "../Productcard/FlashSaleCard";

interface ProductTileProps {
  product: Product;
  variant?: "default" | "compact";
}

export function ProductTile({
  product,
  variant = "default",
}: ProductTileProps) {
  const { isDesktop } = useResponsive();
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const resolvedThemeColors = useResolvedThemeColors();

  // Wishlist hooks
  const { data: wishlistStatus } = useCheckWishlistStatus(
    product.product_id,
    undefined,
    !!user?.user_id
  );
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { isInWishlist, addItem, removeItem } = useWishlistStore();

  // Update local state when wishlist status changes
  useEffect(() => {
    if (wishlistStatus) {
      setIsFavorite(wishlistStatus.is_wishlisted);
    } else if (user?.user_id) {
      setIsFavorite(isInWishlist(product.product_id));
    }
  }, [wishlistStatus, user?.user_id, isInWishlist, product.product_id]);

  const handlePress = () => {
    router.push(`/product/${product.product_id}`);
  };

  const handleFavoritePress = async (e: React.GestureResponderEvent) => {
    e.stopPropagation();
    if (!user?.user_id) {
      return;
    }

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    try {
      if (isFavorite) {
        await removeFromWishlist.mutateAsync({
          productId: product.product_id,
        });
        removeItem(product.product_id);
      } else {
        const result = await addToWishlist.mutateAsync({
          product_id: product.product_id,
        });
        addItem(result);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      setIsFavorite(!newFavoriteState);
    }
  };

  const displayPrice = product.sale_price ?? product.base_price;


  if (isDesktop) {
    return <FlashSaleCard product={product} />
  }

  return (
    <TouchableOpacity className="overflow-hidden" onPress={handlePress}>
      <Card className="relative mb-3 rounded overflow-hidden">
        {product.images && product.images.length > 0 && (
          <Image
            source={{ uri: getImageUrl(product.images[0]) }}
            className="aspect-square w-full"
            resizeMode="cover"
          />
        )}
        <TouchableOpacity
          className="absolute right-2 top-2 rounded-full bg-white/80 p-2"
          onPress={handleFavoritePress}
          disabled={addToWishlist.isPending || removeFromWishlist.isPending}
        >
          <Heart
            size={16}
            color={isFavorite ? resolvedThemeColors.primary : resolvedThemeColors.mutedForeground}
            fill={isFavorite ? resolvedThemeColors.primary : "transparent"}
          />
        </TouchableOpacity>
      </Card>
      <View className="px-1">
        <Text className="mb-1 text-sm font-medium text-foreground">{product.name}</Text>
        <Text className="text-base font-bold text-foreground">
          TSh {displayPrice.toLocaleString()}
        </Text>
        {product.sale_price && product.sale_price < product.base_price && (
          <Text className="text-xs text-gray-500 line-through">
            TSh {product.base_price.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}