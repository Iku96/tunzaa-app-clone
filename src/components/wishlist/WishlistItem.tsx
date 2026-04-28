import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Card } from "../../../components/ui/card";
import { Text } from "../../../components/ui/text";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Trash2, ShoppingCart, Edit3 } from "lucide-react-native";
import { WishlistItem as WishlistItemType } from "../../services/wishlist";
import { getImageUrl } from "../../utils/images";
import { useRouter } from "expo-router";
import { useResolvedThemeColors } from "../../hooks/useThemeColors";
import { useResponsive } from "../../hooks/useResponsive";

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove: (productId: string, variantSku?: string) => void;
  onMoveToCart: (productId: string, variantSku?: string) => void;
  onEdit: (item: WishlistItemType) => void;
  variant?: "default" | "compact";
}

export const WishlistItem: React.FC<WishlistItemProps> = ({
  item,
  onRemove,
  onMoveToCart,
  onEdit,
  variant = "default",
}) => {
  const router = useRouter();
  const resolvedThemeColors = useResolvedThemeColors();
  const { isDesktop } = useResponsive();
  const product = item.product;

  if (!product) return null;

  const displayPrice = product.sale_price ?? product.base_price;
  const hasDiscount = product.sale_price && product.sale_price < product.base_price;

  const handleProductPress = () => router.push(`/(buyer)/product/${item.product_id}`);
  const handleRemove = () => onRemove(item.product_id, item.variant_sku);
  const handleMoveToCart = () => onMoveToCart(item.product_id, item.variant_sku);
  const handleEdit = () => onEdit(item);

  /** ------------------ DESKTOP GRID VERSION ------------------- */
  if (isDesktop) {
    return (
      <Card className="overflow-hidden rounded-2xl border-0 shadow-none">
        <TouchableOpacity onPress={handleProductPress}>
          {/* Product image */}
          {product.images?.length > 0 && (
            <Image
              source={{ uri: getImageUrl(product.images[0]) }}
              className="w-full h-72 rounded-2xl"
              resizeMode="cover"
            />
          )}

          {/* Product details */}
          <View className="ph-0 py-4">
            <Text className="text-base font-semibold mb-1" numberOfLines={2}>
              {product.name}
            </Text>
            {/* Price + Icons in same row */}
            <View className="flex-row items-center justify-between mt-2">
              <View>
                <Text className="text-lg font-bold">
                  TSh {displayPrice.toLocaleString()}
                </Text>
                {hasDiscount && (
                  <Text className="text-sm text-gray-500 line-through">
                    TSh {product.base_price.toLocaleString()}
                  </Text>
                )}
              </View>
              <View className="flex-row gap-x-2">
                <Button size="icon" onPress={handleMoveToCart} className="p-2 rounded-full bg-blue-50">
                  <ShoppingCart size={18} color={resolvedThemeColors.primary} />
                </Button>
                <Button size="icon" onPress={handleRemove} className="p-2 rounded-full bg-red-50">
                  <Trash2 size={18} color={resolvedThemeColors.destructive} />
                </Button>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  }

  /** ------------------ EXISTING MOBILE (default/compact) ------------------- */
  if (variant === "compact") {
    return (
      <Card className="overflow-hidden mb-4">
        <TouchableOpacity onPress={handleProductPress}>
          <View className="flex-row">
            {product.images && product.images.length > 0 && (
              <Image
                source={{ uri: getImageUrl(product.images[0]) }}
                className="w-32 h-32"
                resizeMode="cover"
              />
            )}
            <View className="flex-1 p-4">
              <Text className="text-sm font-medium text-foreground mb-2" numberOfLines={2}>
                {product.name}
              </Text>
              <Text className="text-base font-bold text-foreground mb-1">
                TSh {displayPrice.toLocaleString()}
              </Text>
              {hasDiscount && (
                <Text className="text-xs text-gray-500 line-through mb-2">
                  TSh {product.base_price.toLocaleString()}
                </Text>
              )}
              {item.notes && (
                <Text className="text-xs text-muted-foreground mb-2" numberOfLines={1}>
                  Note: {item.notes}
                </Text>
              )}
              <View className="flex-row items-center justify-between">
                {item.priority > 0 && <Badge variant="outline">Priority: {item.priority}</Badge>}
                <View className="flex-row gap-x-2 w-full justify-end">
                  <Button size="icon" onPress={handleMoveToCart} className="p-2 rounded-full bg-blue-50">
                    <ShoppingCart size={18} color={resolvedThemeColors.primary} />
                  </Button>
                  <Button size="icon" onPress={handleRemove} className="p-2 rounded-full bg-red-50">
                    <Trash2 size={18} color={resolvedThemeColors.destructive} />
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  }

  /** ------------------ DEFAULT VERSION ------------------- */
  return (
    <Card className="overflow-hidden mb-6">
      <TouchableOpacity onPress={handleProductPress}>
        <View className="flex-row">
          <View className="w-[35%]">
            {product.images && product.images.length > 0 && (
              <Image
                source={{ uri: getImageUrl(product.images[0]) }}
                className="aspect-square w-full"
                resizeMode="cover"
              />
            )}
          </View>
          <View className="flex-1 p-5">
            <View className="flex-row items-start justify-between mb-3">
              <Text className="text-lg font-semibold text-foreground flex-1 mr-3" numberOfLines={2}>
                {product.name}
              </Text>
              <View className="flex-row gap-x-2">
                <TouchableOpacity onPress={handleEdit} className="p-2 rounded-full bg-blue-50">
                  <Edit3 size={18} color={resolvedThemeColors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRemove} className="p-2 rounded-full bg-red-50">
                  <Trash2 size={18} color={resolvedThemeColors.destructive} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-xl font-bold text-foreground">
                  TSh {displayPrice.toLocaleString()}
                </Text>
                {hasDiscount && (
                  <Text className="text-sm text-gray-500 line-through">
                    TSh {product.base_price.toLocaleString()}
                  </Text>
                )}
              </View>
              {hasDiscount && (
                <Badge variant="destructive">
                  {Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)}% OFF
                </Badge>
              )}
            </View>

            {item.notes && (
              <View className="mb-4 p-3 bg-secondary/20 rounded-lg">
                <Text className="text-sm text-muted-foreground">Note: {item.notes}</Text>
              </View>
            )}

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-x-2">
                {item.priority > 0 && <Badge variant="outline">Priority: {item.priority}</Badge>}
              </View>
              <Button size="default" onPress={handleMoveToCart} className="flex-row items-center px-4 py-2">
                <ShoppingCart size={18} className="mr-2" />
                <Text className="text-sm font-medium">Add to Cart</Text>
              </Button>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};
