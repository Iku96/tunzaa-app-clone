import { useState, useEffect } from "react";
import { View } from "react-native";
import { ShoppingCart, Zap, Eye, Loader2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Product } from "@/src/services/products";
import { useCartCombined } from "@/stores/cart";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useResponsive } from "@/hooks/useResponsive";
import { useI18n } from "@/hooks/useI18n";

export default function AddToCart({
  handleAddToCart,
  handleBuyNow,
  product,
  quantity,
  selectedVariantSku,
}: {
  handleAddToCart: () => Promise<void> | void;
  handleBuyNow?: () => void;
  product: Product;
  quantity: number;
  selectedVariantSku?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const cart = useCartCombined(user?.user_id?.toString() ?? "");
  const resolvedThemeColors = useResolvedThemeColors();
  const isDesktop = useResponsive();
  const { t } = useI18n();
  // Local loading state to track add to cart operation
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Check if product is out of stock
  const isOutOfStock = (product?.inventory_quantity || 0) <= 0;
  
  // Check if variant is required but not selected
  const isVariantRequired = product?.has_variants && product?.variants && product.variants.length > 0;
  const isVariantSelected = !!selectedVariantSku;
  const isVariantRequiredButNotSelected = isVariantRequired && !isVariantSelected;
  
  // Check actual server cart state for this product
  const getCartItemFromServer = () => {
    if (!cart.cart?.items) return null;
    
    return cart.cart.items.find(item => 
      item.product_id === product.product_id && 
      item.metadata?.sku === selectedVariantSku
    );
  };

  const serverCartItem = getCartItemFromServer();
  
  // Improved state calculation that accounts for optimistic updates and loading state
  const getCartState = () => {
    // If we're currently adding to cart, show loading state with optimistic quantity
    if (isAddingToCart) {
      // Calculate optimistic quantity: existing quantity + new quantity being added
      const currentQuantity = serverCartItem?.quantity || cart.getCartItemQuantity(product.product_id, selectedVariantSku) || 0;
      return {
        isInCart: true,
        cartQuantity: currentQuantity + quantity,
        isLoading: true
      };
    }
    
    // Check server cart state first
    if (serverCartItem) {
      return {
        isInCart: true,
        cartQuantity: serverCartItem.quantity,
        isLoading: false
      };
    }
    
    // Check local cart tracking (for items that were added but server hasn't synced yet)
    const localIsInCart = cart.isInCart(product.product_id, selectedVariantSku);
    const localQuantity = cart.getCartItemQuantity(product.product_id, selectedVariantSku);
    
    if (localIsInCart && localQuantity > 0) {
      return {
        isInCart: true,
        cartQuantity: localQuantity,
        isLoading: false
      };
    }
    
    return {
      isInCart: false,
      cartQuantity: 0,
      isLoading: false
    };
  };

  const { isInCart, cartQuantity, isLoading } = getCartState();

  // Sync local cart tracking with server state when server data changes
  useEffect(() => {
    if (serverCartItem && !cart.isInCart(product.product_id, selectedVariantSku)) {
      // If item exists in server but not in local tracking, add it
      cart.addCartItem?.({
        product_id: product.product_id,
        variant_sku: selectedVariantSku,
        quantity: serverCartItem.quantity,
        item_id: serverCartItem.item_id,
      });
    }
  }, [serverCartItem, product.product_id, selectedVariantSku]);

  const onAddToCartPress = async () => {
    if (isOutOfStock) {
      return; // Don't allow adding out of stock items
    }
    
    if (isVariantRequiredButNotSelected) {
      return; // Don't allow adding to cart without selecting a variant
    }
    
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    
    if (isInCart && !isLoading) {
      // If already in cart and not loading, navigate to cart
      router.push("/cart");
      return;
    }
    
    if (isLoading) {
      // If currently adding to cart, do nothing
      return;
    }
    
    // Set loading state and call the handler
    setIsAddingToCart(true);
    try {
      await handleAddToCart();
      
      // Force a cart refetch to get the updated state
      if (cart.refetch) {
        await cart.refetch();
      }
      
      // Keep loading state for a brief moment to ensure smooth transition
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 300);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setIsAddingToCart(false);
    }
  };

  const onBuyNowPress = () => {
    if (isOutOfStock) {
      return; // Don't allow buying out of stock items
    }
    
    if (isVariantRequiredButNotSelected) {
      return; // Don't allow buying without selecting a variant
    }
    
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    if (handleBuyNow) {
      handleBuyNow();
    }
  };

  const getButtonContent = () => {
    if (isOutOfStock) {
      return (
        <>
          <ShoppingCart size={20} className="text-muted-foreground mr-2" color={resolvedThemeColors?.mutedForeground || "#6b7280"} />
          <Text className="text-sm ml-2 font-semibold text-muted-foreground">
            {t("products.out_of_stock")}
          </Text>
        </>
      );
    }
    
    if (isVariantRequiredButNotSelected) {
      return (
        <>
          <ShoppingCart size={20} className="text-muted-foreground mr-2" color={resolvedThemeColors?.mutedForeground || "#6b7280"} />
          <Text className="text-sm ml-2 font-semibold text-muted-foreground">
            {t("products.select_variant")}
          </Text>
        </>
      );
    }
    
    if (isLoading) {
      return (
        <>
          <Loader2 size={20} className="text-primary mr-2 animate-spin" color={resolvedThemeColors.primary} />
          <Text className="text-sm ml-2 font-semibold text-primary">
            {t("products.adding")}
          </Text>
        </>
      );
    }
    
    if (isInCart) {
      return (
        <>
          <Eye size={20} className="text-primary mr-2" color={resolvedThemeColors.primary} />
          <Text className="text-sm ml-2 font-semibold text-primary">
            {cartQuantity} {t("products.in_cart")}
          </Text>
        </>
      );
    }
    
    return (
      <>
        <ShoppingCart size={20} className="text-primary mr-2" color={resolvedThemeColors.primary} />
        <Text className="text-sm ml-2 font-semibold text-primary">
          {t("products.add_to_cart")}
        </Text>
      </>
    );
  };

  return (
    <View className={`px-4 pt-2 border-t border-border bg-background`}>
      <View className="flex-row gap-3">
        {/* Add to Cart Button */}
        <Button
          variant={isOutOfStock || isVariantRequiredButNotSelected ? "outline" : (isInCart ? "secondary" : "default")}
          className={`flex-1 flex-row items-center justify-center py-2 ${
            isOutOfStock || isVariantRequiredButNotSelected ? "opacity-50" : ""
          }`}
          onPress={onAddToCartPress}
          disabled={isLoading || isOutOfStock || isVariantRequiredButNotSelected}
        >
          {getButtonContent()}
        </Button>

        {/* Buy Now Button */}
        <Button
          variant={isOutOfStock || isVariantRequiredButNotSelected ? "outline" : "primary"}
          className={`flex-1 flex-row items-center justify-center py-2 ${
            isOutOfStock || isVariantRequiredButNotSelected ? "opacity-50" : "bg-primary"
          }`}
          onPress={onBuyNowPress}
          disabled={isOutOfStock || isVariantRequiredButNotSelected}
        >
          <Zap 
            size={20} 
            color={isOutOfStock || isVariantRequiredButNotSelected ? (resolvedThemeColors?.mutedForeground || "#6b7280") : "white"} 
            className={`mr-2 ${isOutOfStock || isVariantRequiredButNotSelected ? "text-muted-foreground" : "text-white"}`} 
          />
          <Text className={`text-sm ml-2 font-semibold ${
            isOutOfStock || isVariantRequiredButNotSelected ? "text-muted-foreground" : "text-white"
          }`}>
            {isOutOfStock ? t("products.out_of_stock") : isVariantRequiredButNotSelected ? t("products.select_variant") : t("products.buy_now")}
          </Text>
        </Button>
      </View>

      {/* Price Display */}
      {/* <View className="mt-3 items-center">
        <Text className="text-lg font-bold text-foreground">
          TShs {(product.base_price * quantity).toLocaleString()}
        </Text>
      </View> */}
    </View>
  );
}
