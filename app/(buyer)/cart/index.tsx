import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { ArrowLeft, Minus, Plus, Trash2, RefreshCw } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  useCartCombined,
  useUpdateCartItem,
  useRemoveCartItem,
  useCartTotals,
  useClearCart,
} from "@/stores/cart";
import { useProductById } from "@/stores/products";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ActivityIndicator } from "react-native";
import { useAuth } from "@/context/auth";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "@/lib/icons/Terminal";
import type { CartItem } from "@/services/cart";
import type { LocalCartItem } from "@/stores/cart";
import { getImageUrl } from "@/utils/images";
import { CartItemSkeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { usePageTitle } from "@/hooks/usePageTitle";

// Separate component for cart items to properly use hooks
const CartItemComponent = ({
  item,
  onQuantityChange,
  onRemove,
  isUpdating,
}: {
  item: CartItem;
  onQuantityChange: (item: CartItem, delta: number) => void;
  onRemove: (item: CartItem) => void;
  isUpdating: boolean;
}) => {
  const { data: product, isLoading } = useProductById(item.product_id);
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();

  usePageTitle(t("cart.cart"));
  if (isLoading) {
    return <CartItemSkeleton />;
  }

  if (!product) {
    return (
      <View className="p-4 border-b border-border">
        <Text className="text-muted-foreground">{t("products.product_not_found")}</Text>
      </View>
    );
  }

  // Get variant information if available
  const getVariantInfo = () => {
    // console.log("The Item:", JSON.stringify(item, null, 2));
    // console.log("The Product:", JSON.stringify(product, null, 2));
    
    // Check if cart item has variant data directly
    const itemWithVariants = item as any;
    if (itemWithVariants.variants?.sku) {
      console.log("Found variant in item.variants:", itemWithVariants.variants);
      return itemWithVariants.variants;
    }
    
    // Fallback to checking metadata (for backward compatibility)
    if (!product.has_variants || !item.metadata?.sku) return null;
    
    const variant = product.variants?.find((v: any) => v.sku === item.metadata.sku);
    return variant;
  };

  const variant = getVariantInfo();
  // console.log("The Variant:", JSON.stringify(variant, null, 2));

  return (
    <View className="flex-row p-4 border-b border-border">
      <Image
        source={{ uri: getImageUrl(product.images[0]) }}
        className="w-20 h-20 rounded-lg"
      />
      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-foreground mb-1">
          {product.name}
        </Text>
        {variant && (
          <Text className="text-sm text-primary mb-1">
            {variant.name}: {variant.sku}
          </Text>
        )}
        <Text className="text-sm text-muted-foreground mb-2">
          {t("cart.sku")}: {product.sku}
        </Text>
        <Text className="text-base font-bold text-foreground mb-3">
          TShs {item.unit_price.toLocaleString()}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center bg-muted rounded-full p-1">
            <TouchableOpacity
              className={`w-8 h-8 rounded-full items-center justify-center bg-background ${Platform.select(
                {
                  web: "shadow-sm",
                  default: "elevation-1",
                }
              )} ${item.quantity === 1 ? "bg-muted" : ""}`}
              onPress={() => onQuantityChange(item, -1)}
              disabled={item.quantity === 1 || isUpdating}
            >
              <Minus
                size={16}
                className={
                  item.quantity === 1
                    ? "text-muted-foreground"
                    : "text-foreground"
                }
                color={ item.quantity === 1 ? resolvedColors?.foreground || "#000000" : resolvedColors?.primary || "#000000"}
              />
            </TouchableOpacity>
            <Text className="text-sm font-semibold px-4">{item.quantity}</Text>
            <TouchableOpacity
              className={`w-8 h-8 rounded-full items-center justify-center bg-background ${Platform.select(
                {
                  web: "shadow-sm",
                  default: "elevation-1",
                }
              )} ${item.quantity === 5 ? "bg-muted" : ""}`}
              onPress={() => onQuantityChange(item, 1)}
              disabled={item.quantity === 5 || isUpdating}
            >
              <Plus
                size={16}
                className={
                  item.quantity === 5
                    ? "text-muted-foreground"
                    : "text-foreground"
                }
                color={ item.quantity === 5 ? resolvedColors?.foreground || "#000000" : resolvedColors?.primary || "#000000"}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="p-2"
            onPress={() => onRemove(item)}
            disabled={isUpdating}
          >
            <Trash2 size={20} className="text-destructive" color={resolvedColors?.destructive || "#000000"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Separate component for optimistic cart items
const OptimisticCartItemComponent = ({ item }: { item: LocalCartItem }) => {
  const { data: product, isLoading } = useProductById(item.product_id);
  const { t } = useI18n();

  if (isLoading) {
    return (
      <View className="opacity-60">
        <CartItemSkeleton />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="p-4 border-b border-border opacity-60">
        <Text className="text-muted-foreground">{t("products.product_not_found")}</Text>
      </View>
    );
  }

  // Get variant information if available
  const getVariantInfo = () => {
    if (!product.has_variants || !item.sku) return null;
    
    const variant = product.variants?.find((v: any) => v.sku === item.sku);
    return variant;
  };

  const variant = getVariantInfo();

  return (
    <View className="flex-row p-4 border-b border-border opacity-60">
      <Image
        source={{ uri: getImageUrl(product.images[0]) }}
        className="w-20 h-20 rounded-lg"
      />
      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-foreground mb-1">
          {product.name}
        </Text>
        {variant && (
          <Text className="text-sm text-primary mb-1">
            {variant.name}: {variant.sku}
          </Text>
        )}
        <Text className="text-sm text-muted-foreground mb-2">
          {t("cart.sku")}: {product.sku}
        </Text>
        <Text className="text-base font-bold text-foreground mb-3">
          TShs {product.base_price.toLocaleString()}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center bg-muted rounded-full p-1">
            <View className="w-8 h-8 rounded-full items-center justify-center bg-muted">
              <Minus size={16} className="text-muted-foreground" />
            </View>
            <Text className="text-sm font-semibold px-4 text-muted-foreground">
              {item.quantity}
            </Text>
            <View className="w-8 h-8 rounded-full items-center justify-center bg-muted">
              <Plus size={16} className="text-muted-foreground" />
            </View>
          </View>
          <Badge variant="secondary">
            <Text className="text-xs">{t("cart.adding")}</Text>
          </Badge>
        </View>
      </View>
    </View>
  );
};

const CartScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();
  // Move all hooks to the top before any conditional returns
  const cart = useCartCombined(user?.user_id ?? "");
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();

  // Get cart totals from server
  const { data: cartTotals, isLoading: isLoadingTotals, refetch: refetchTotals } = useCartTotals(
    cart.cart?.cart_id ?? ""
  );

  // Memoize refetchTotals to prevent unnecessary re-renders
  const stableRefetchTotals = useCallback(() => {
    if (cart.cart?.cart_id) {
      refetchTotals();
    }
  }, [cart.cart?.cart_id, refetchTotals]);

  // Fix the useFocusEffect to prevent infinite loops
  useFocusEffect(
    useCallback(() => {
      if (user?.user_id) {
        cart.refetch();
        // Only refetch totals if cart exists
        if (cart.cart?.cart_id) {
          stableRefetchTotals();
        }
      }
    }, [user?.user_id, cart.refetch, stableRefetchTotals])
  );

  // Add user validation after hooks
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-lg text-muted-foreground mb-4">
          {t("cart.please_login")}
        </Text>
        <Button onPress={() => router.push("../../(auth)/login")}>
          <Text className="text-white">{t("auth.login")}</Text>
        </Button>
      </SafeAreaView>
    );
  }

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    if (!cart.cart) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1 || newQuantity > 5) return;

    try {
      await updateCartItem.mutateAsync({
        cartId: cart.cart.cart_id,
        itemId: item.item_id,
        update: { quantity: newQuantity },
      });
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    if (!cart.cart) return;

    try {
      await removeCartItem.mutateAsync({
        cartId: cart.cart.cart_id,
        item: {
          item_id: item.item_id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          added_at: item.added_at,
          metadata: item.metadata,
        },
      });
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    }
  };

  const handleClearCart = async () => {
    if (!cart.cart) return;

    try {
      await clearCart.mutateAsync({
        cartId: cart.cart.cart_id,
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        cart.refetch(),
        cart.cart?.cart_id ? stableRefetchTotals() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleProceedToCheckout = () => {
    router.push({
      // pathname: "/(buyer)/cart/checkout",
      pathname: "/(payment)/checkout",
      params: {
        returnTo: "cart",
      },
    });
  };

  if (cart.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {t("cart.shopping_cart")}
          </Text>
          <View className="w-6" />
        </View>
        <ScrollView className="flex-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}
        </ScrollView>
        <View className="p-4 border-t border-border bg-background">
          <View className="flex-row justify-between items-center mb-4 pt-2 border-t border-border">
            <Text className="text-lg font-bold text-foreground">{t("cart.total")}</Text>
            <View className="w-20 h-6 bg-muted rounded animate-pulse" />
          </View>
          <Button disabled className="w-full">
            <Text className="text-foreground">{t("common.loading")}</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (cart.error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {t("cart.shopping_cart")}
          </Text>
          <View className="w-6" />
        </View>
        <View className="p-4">
          <Alert icon={Terminal} variant="destructive">
            <Text className="text-sm text-destructive">
              {cart.error.message || t("cart.error_loading_cart")}
            </Text>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onPress={() => cart.refetch()}
          >
            <RefreshCw size={16} className="text-foreground mr-2" />
            <Text>{t("common.retry")}</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!cart.hasItems()) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {t("cart.shopping_cart")}
          </Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg text-muted-foreground text-center">
            {t("cart.empty")}
          </Text>
          <Button
            variant="outline"
            className="mt-4"
            onPress={() => router.push("/")}
          >
            <Text>{t("cart.continue_shopping")}</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const cartItems = cart.cart?.items || [];
  const isUpdating = updateCartItem.isPending || removeCartItem.isPending || clearCart.isPending;
  const isAnyOperationInProgress = isUpdating || cart.addToCartMutation.isPending || isRefreshing;

  // console.log("The Cart Items:", JSON.stringify(cartItems, null, 2));
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          {t("cart.shopping_cart")}
        </Text>
        <View className="flex-row items-center">
          {isAnyOperationInProgress && (
            <Badge variant="secondary" className="mr-2">
              <ActivityIndicator size="small" className="mr-1" />
              <Text className="text-xs">{t("cart.updating")}</Text>
            </Badge>
          )}
          {cart.optimisticItems.length > 0 && (
            <Badge variant="default" className="mr-2">
              <Text className="text-xs">
                {t("cart.pending_items", { count: cart.optimisticItems.length })}
              </Text>
            </Badge>
          )}
          <TouchableOpacity 
            onPress={handleClearCart}
            disabled={clearCart.isPending}
            className="mr-2"
          >
            {clearCart.isPending ? (
              <ActivityIndicator size="small" className="text-muted-foreground" />
            ) : (
              <Trash2 
                size={20} 
                className="text-destructive" 
                color={resolvedColors?.destructive || "#000000"}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleRefresh}
            disabled={isRefreshing}
            className="ml-2"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" className="text-muted-foreground" />
            ) : (
              <RefreshCw size={20} className="text-muted-foreground" color={resolvedColors?.foreground || "#000000"} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Render server cart items using proper component */}
        {cartItems.map((item) => (
          <CartItemComponent
            key={item.item_id}
            item={item}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
            isUpdating={isUpdating}
          />
        ))}

        {/* Render optimistic items using proper component */}
        {cart.optimisticItems.map((item) => (
          <OptimisticCartItemComponent key={item.temp_id} item={item} />
        ))}
      </ScrollView>

      <View className="p-4 border-t border-border bg-background">
        <View className="flex-row justify-between items-center mb-4 pt-2">
          <Text className="text-lg font-bold text-foreground">{t("cart.total")}</Text>
          {isLoadingTotals ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" className="mr-2" />
              <View className="w-20 h-6 bg-muted rounded animate-pulse" />
            </View>
          ) : (
            <Text className="text-lg font-bold text-success">
              TShs {(cartTotals?.total || 0).toLocaleString()}
            </Text>
          )}
        </View>
        <Button
          variant="default"
          onPress={handleProceedToCheckout}
          disabled={!cart.hasItems() || isUpdating || isLoadingTotals}
          className="w-full"
        >
          {isUpdating ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" className="mr-2" />
              <Text className="text-primary">{t("cart.updating_cart")}</Text>
            </View>
          ) : isLoadingTotals ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" className="mr-2" />
              <Text className="text-primary">{t("common.loading")}</Text>
            </View>
          ) : (
            <Text className="text-primary font-bold">{t("cart.proceed_to_checkout")}</Text>
          )}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;