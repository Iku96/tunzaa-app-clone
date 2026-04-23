import React from "react";
import { View, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductById } from "@/stores/products";
import { getImageUrl } from "@/utils/images";
import { CheckoutStep } from "./CheckoutStepHeader";
import { useI18n } from "@/hooks/useI18n";

interface CartItem {
  item_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  sale_price: number;
  variant_id?: string;
  metadata?: {
    sku?: string;
    [key: string]: any;
  };
  variants?: {
    sku?: string;
    name?: string;
    [key: string]: any;
  };
}

interface OptimisticItem {
  temp_id: string;
  quantity: number;
}

interface CartTotals {
  subtotal?: number;
  total: number;
  tax?: number;
}

interface OrderOverviewSectionProps {
  cartItems: CartItem[];
  optimisticItems: OptimisticItem[];
  cartTotals: CartTotals | undefined;
  totalItemCount: number;
  onContinue: () => void;
  isLoading?: boolean;
}

const OrderOverviewItem = ({ item }: { item: CartItem }) => {
  const { data: product, isLoading } = useProductById(item.product_id);
  const { t } = useI18n();

  if (isLoading || !product) {
    return (
      <View className="flex-row items-center p-3 border-b border-border">
        <View className="w-12 h-12 bg-muted rounded-lg mr-3" />
        <View className="flex-1">
          <View className="h-4 bg-muted rounded mb-1" />
          <View className="h-3 bg-muted rounded w-20" />
        </View>
        <View className="h-4 bg-muted rounded w-16" />
      </View>
    );
  }

  // Get variant information if available
  const getVariantInfo = () => {
    // Check if cart item has variant data directly
    const itemWithVariants = item as any;
    if (itemWithVariants.variants?.sku) {
      return itemWithVariants.variants;
    }

    // Fallback to checking metadata (for backward compatibility)
    if (!product.has_variants || !item.metadata?.sku) return null;

    const variant = product.variants?.find((v: any) => v.sku === item.metadata?.sku);
    return variant;
  };

  const variant = getVariantInfo();

  return (
    <View className="flex-row items-center p-3 border-b border-border">
      <Image
        source={{ uri: getImageUrl(product.images[0]) }}
        className="w-12 h-12 rounded-lg mr-3"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text
          className="text-sm font-semibold text-foreground"
          numberOfLines={1}
        >
          {product.name}
        </Text>
        {variant && (
          <Text className="text-xs text-primary mb-1">
            {variant.name}: {variant.sku}
          </Text>
        )}
        <Text className="text-xs text-muted-foreground">
          {t("cart.quantity")}: {item.quantity} × TShs {item.sale_price.toLocaleString()}
        </Text>
      </View>
      <Text className="text-sm font-semibold text-foreground">
        TShs {(item.sale_price * item.quantity).toLocaleString()}
      </Text>
    </View>
  );
};

const OrderOverviewSkeleton = () => {
  return (
    <View className="border-t border-border">
      {/* Loading skeleton for cart items */}
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          className="flex-row items-center p-3 border-b border-border animate-pulse"
        >
          <View className="w-12 h-12 bg-muted rounded-lg mr-3" />
          <View className="flex-1">
            <View className="h-4 bg-muted rounded mb-2" />
            <View className="h-3 bg-muted rounded w-24" />
          </View>
          <View className="h-4 bg-muted rounded w-16" />
        </View>
      ))}

      {/* Loading skeleton for order summary */}
      <View className="p-4 bg-muted/50 animate-pulse">
        <View className="flex-row justify-between mb-2">
          <View className="h-4 bg-muted rounded w-32" />
          <View className="h-4 bg-muted rounded w-20" />
        </View>
        <View className="flex-row justify-between pt-2 border-t border-border">
          <View className="h-5 bg-muted rounded w-16" />
          <View className="h-5 bg-muted rounded w-24" />
        </View>
      </View>
    </View>
  );
};

export const OrderOverviewSection: React.FC<OrderOverviewSectionProps> = ({
  cartItems,
  optimisticItems,
  cartTotals,
  totalItemCount,
  onContinue,
  isLoading = false,
}) => {
  const { t } = useI18n();
  // Show loading skeleton when fetching cart items
  if (isLoading) {
    return <OrderOverviewSkeleton />;
  }

  return (
    <View className="border-t border-border">
      {/* Cart Items */}
      {cartItems.map((item) => (
        <OrderOverviewItem key={item.item_id} item={item} />
      ))}

      {/* Optimistic Items */}
      {optimisticItems.map((item) => (
        <View
          key={item.temp_id}
          className="flex-row items-center p-3 border-b border-border opacity-60"
        >
          <View className="w-12 h-12 bg-muted rounded-lg mr-3" />
          <View className="flex-1">
            <Text className="text-sm text-muted-foreground">
              {t("common.adding_item")}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {t("cart.quantity")}: {item.quantity}
            </Text>
          </View>
          <Badge variant="secondary">
            <Text className="text-xs">{t("orders.pending")}</Text>
          </Badge>
        </View>
      ))}

      {/* Order Summary */}
      <View className="p-4 bg-muted/50">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-muted-foreground">
            {t("cart.subtotal")} ({totalItemCount.toString()} {t("orders.items")})
          </Text>
          <Text className="text-sm font-semibold text-foreground">
            TShs{" "}
            {(cartTotals?.subtotal || cartTotals?.total || 0).toLocaleString()}
          </Text>
        </View>
        {(cartTotals?.tax || 0) > 0 && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-muted-foreground">{t("common.tax")}</Text>
            <Text className="text-sm font-semibold text-foreground">
              TShs {(cartTotals?.tax || 0).toLocaleString()}
            </Text>
          </View>
        )}
        <View className="flex-row justify-between pt-2 border-t border-border">
          <Text className="text-base font-bold text-foreground">{t("cart.total")}</Text>
          <Text className="text-base font-bold text-success">
            TShs {(cartTotals?.total || 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};
