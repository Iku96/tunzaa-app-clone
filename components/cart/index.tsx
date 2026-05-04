import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  useWindowDimensions,
  ActivityIndicator,
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
import { useAuth } from "@/context/auth";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "@/lib/icons/Terminal";
import type { CartItem } from "@/src/services/cart";
import type { LocalCartItem } from "@/stores/cart";
import { getImageUrl } from "@/utils/images";
import { useI18n } from "@/hooks/useI18n";
import { CartItemSkeleton } from "@/components/ui/skeleton";

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
  const { t } = useI18n();

  if (isLoading) return <CartItemSkeleton />;
  if (!product) return (
    <View className="p-4 border-b border-border">
      <Text className="text-muted-foreground">{t("products.product_not_found")}</Text>
    </View>
  );

  // Get variant information if available
  const getVariantInfo = () => {
    // Check if cart item has variant data directly
    const itemWithVariants = item as any;
    if (itemWithVariants.variants?.sku) {
      return itemWithVariants.variants;
    }
    
    // Fallback to checking metadata (for backward compatibility)
    if (!product.has_variants || !item.metadata?.sku) return null;
    
    const variant = product.variants?.find((v: any) => v.sku === item.metadata.sku);
    return variant;
  };

  const variant = getVariantInfo();

  return (
    <View className="flex-row p-4 border-b border-border">
      {/* <Image
        source={{ uri: getImageUrl(product.images[0]) }}
        className="w-20 h-20 rounded-lg"
      /> */}
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
          TShs {item.sale_price.toLocaleString()}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center bg-muted rounded-full p-1">
            <TouchableOpacity
              className={`w-8 h-8 rounded-full items-center justify-center bg-background ${Platform.select({
                web: "shadow-sm",
                default: "elevation-1",
              })} ${item.quantity === 1 ? "bg-muted" : ""}`}
              onPress={() => onQuantityChange(item, -1)}
              disabled={item.quantity === 1 || isUpdating}
            >
              <Minus size={16} className={item.quantity === 1 ? "text-muted-foreground" : "text-foreground"} />
            </TouchableOpacity>
            <Text className="text-sm font-semibold px-4">{item.quantity}</Text>
            <TouchableOpacity
              className={`w-8 h-8 rounded-full items-center justify-center bg-background ${Platform.select({
                web: "shadow-sm",
                default: "elevation-1",
              })} ${item.quantity === 5 ? "bg-muted" : ""}`}
              onPress={() => onQuantityChange(item, 1)}
              disabled={item.quantity === 5 || isUpdating}
            >
              <Plus size={16} className={item.quantity === 5 ? "text-muted-foreground" : "text-foreground"} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="p-2"
            onPress={() => onRemove(item)}
            disabled={isUpdating}
          >
            <Trash2 size={20} className="text-destructive" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const OptimisticCartItemComponent = ({ item }: { item: LocalCartItem }) => {
  const { data: product, isLoading } = useProductById(item.product_id);
  const { t } = useI18n();
  if (isLoading) return <View className="opacity-60"><CartItemSkeleton /></View>;
  if (!product) return (
    <View className="p-4 border-b border-border opacity-60">
      <Text className="text-muted-foreground">{t("products.product_not_found")}</Text>
    </View>
  );

  // Get variant information if available
  const getVariantInfo = () => {
    // Check if cart item has variant data directly
    const itemWithVariants = item as any;
    if (itemWithVariants.variants?.sku) {
      return itemWithVariants.variants;
    }
    
    // Fallback to checking sku property (for LocalCartItem)
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
        <Text className="text-base font-semibold text-foreground mb-1">{product.name}</Text>
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

const CartScreen = ({ setVisible }: { setVisible: (visible: boolean) => void }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 768;

  const cart = useCartCombined(user?.user_id ?? "");
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const { data: cartTotals, isLoading: isLoadingTotals, refetch: refetchTotals } = useCartTotals(
    cart.cart?.cart_id ?? ""
  );

  useFocusEffect(
    useCallback(() => {
      if (user) {
        cart.refetch();
        if (cart.cart?.cart_id) {
          refetchTotals();
        }
      }
    }, [user, cart, refetchTotals])
  );

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-lg text-muted-foreground mb-4">{t("cart.please_login")}</Text>
        <Button onPress={() => router.push("../../(auth)/login")}>
          <Text className="text-white">{t("auth.login")}</Text>
        </Button>
      </SafeAreaView>
    );
  }

  const cartItems = cart.cart?.items || [];
  const isUpdating = updateCartItem.isPending || removeCartItem.isPending || clearCart.isPending;
  const isAnyOperationInProgress = isUpdating || cart.addToCartMutation.isPending || isRefreshing;

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    if (!cart.cart) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1 || newQuantity > 5) return;
    alert(JSON.stringify(item))
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
        item,
      });
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    }
  };

  const handleClearCart = async () => {
    if (!cart.cart) return;
    try {
      await clearCart.mutateAsync({ cartId: cart.cart.cart_id });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        cart.refetch(),
        cart.cart?.cart_id ? refetchTotals() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleProceedToCheckout = () => {
    setVisible(false)
    router.push({
      pathname: "/(buyer)/cart/checkout",
      params: { returnTo: "cart" },
    });
  };

  if (cart.isLoading || !cart.cart) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (cart.error) {
    return (
      <SafeAreaView className="flex-1 bg-background p-4">
        <Alert icon={Terminal} variant="destructive">
          <Text className="text-sm text-destructive">
            {cart.error.message || t("common.error")}
          </Text>
        </Alert>
        <Button onPressIn={() => cart.refetch()} className="mt-4">
          <Text>{t("common.retry")}</Text>
        </Button>
      </SafeAreaView>
    );
  }

  if (!cart.hasItems()) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-lg text-muted-foreground">{t("cart.empty")}</Text>
        <Button variant="outline" className="mt-4" onPress={() => router.push("/")}>
          <Text>{t("cart.continue_shopping")}</Text>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <View className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-2 py-8">
      <SafeAreaView className="flex-1 bg-background">
        {!isDesktop && (
          <View className="p-4 border-b border-border flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} className="text-foreground" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">{t("cart.title")}</Text>
            <View className="flex-row items-center">
              {isAnyOperationInProgress && (
                <Badge variant="secondary" className="mr-2">
                  <ActivityIndicator size="small" />
                  <Text className="text-xs ml-1">{t("cart.updating")}</Text>
                </Badge>
              )}
              <TouchableOpacity onPress={handleClearCart} disabled={clearCart.isPending} className="mr-2">
                <Trash2 size={20} className="text-destructive" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
                <RefreshCw size={20} className="text-muted-foreground" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView className="flex-1">
          {cartItems.map((item) => (
            <CartItemComponent
              key={item.item_id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
              isUpdating={isUpdating}
            />
          ))}
          {cart.optimisticItems.map((item) => (
            <OptimisticCartItemComponent key={item.temp_id} item={item} />
          ))}
          <View className="p-4">
            <Text className="text-lg font-bold text-foreground mb-2">{t("cart.total")}</Text>
            {isLoadingTotals ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-lg font-bold text-success">
                TShs {(cartTotals?.total || 0).toLocaleString()}
              </Text>
            )}
            <Button
              onPress={handleProceedToCheckout}
              disabled={!cart.hasItems() || isUpdating || isLoadingTotals}
              className="w-full mt-4"
            >
              <Text className="text-white">{t("cart.proceed_to_checkout")}</Text>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default CartScreen;
