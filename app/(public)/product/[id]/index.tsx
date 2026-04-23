import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useProductById, useProducts } from "@/stores/products";
import { useCartCombined } from "@/stores/cart";
import { useAuth } from "@/context/auth";
import { useProductReferral } from "@/hooks/useUrlHandler";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "@/lib/icons/Terminal";
import ProductDetails from "@/features/products/components/ProductDetails";
import AddToCart from "@/features/products/components/AddToCart";
import NearbyProducts from "@/features/products/components/NearbyProducts";
import { SimilarItems } from "@/components/recommendations";
import { ProductDetailsSkeleton } from "@/components/ui/skeleton";
import * as Burnt from "burnt";
import { useResponsive } from "@/hooks/useResponsive";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | undefined>(undefined);
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();
  usePageTitle(t("product.product_details"));
  
  // Validate product ID
  const productId = typeof id === 'string' ? id.trim() : '';
  
  // Early return for invalid product ID
  if (!productId) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row items-center justify-between p-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            {t("product.invalid_product")}
          </Text>
          <View className="w-6" />
        </View>
        
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-muted-foreground mb-6">
            {t("product.invalid_product_link")}
          </Text>
          
          <Button variant="outline" onPress={() => router.replace("/(buyer)")}>
            <Text>{t("product.browse_products")}</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  
  // Referral tracking
  const {
    referralCode,
    tenantId,
    isReferralActive,
    isCurrentProductReferral,
  } = useProductReferral(productId);
  
  // Use React Query hooks
  const { 
    data: product, 
    isLoading: productLoading, 
    error: productError,
    refetch: refetchProduct 
  } = useProductById(productId);
  
  const { data: productsData } = useProducts({
    category_id: product?.category_ids?.[0],
    limit: 6,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  });

  // Use combined cart state with React Query
  const cart = useCartCombined(user?.user_id?.toString() ?? "");

  const nearbyProducts =
    product && productsData?.items
      ? productsData.items.filter((p) => p.product_id !== productId)
      : [];

  // Initialize selected variant when product loads with safety checks
  useEffect(() => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant && firstVariant.sku) {
        setSelectedVariantSku(firstVariant.sku);
      } else {
        // Fallback to undefined if variant structure is invalid
        setSelectedVariantSku(undefined);
      }
    } else {
      // No variants available
      setSelectedVariantSku(undefined);
    }
  }, [product]);

  // Get quantity from cart or temp storage with safety checks
  useEffect(() => {
    if (product && product.product_id) {
      try {
        const cartQuantity = cart.getCartItemQuantity?.(product.product_id, selectedVariantSku) || 0;
        const tempQuantity = cart.getTempQuantity?.(product.product_id, selectedVariantSku) || 0;
        
        if (cartQuantity > 0) {
          setQuantity(cartQuantity);
        } else if (tempQuantity > 0) {
          setQuantity(tempQuantity);
        } else {
          setQuantity(1);
        }
      } catch (err) {
        console.error("Error getting cart quantity:", err);
        setQuantity(1);
      }
    }
  }, [product, selectedVariantSku, cart.getCartItemQuantity, cart.getTempQuantity]);

  // Show toast for product loading errors
  useEffect(() => {
    if (productError && !productLoading) {
      const is404Error = productError instanceof Error && 
        ((productError as any).apiError?.status === 404 || 
         (productError as any).originalError?.response?.status === 404);
      
      if (!is404Error) {
        Burnt.toast({
          title: "Error loading product",
          preset: "error",
          message: "Failed to load product information. Please try again.",
          haptic: "error",
          duration: 3,
          from: "top",
        });
      }
    }
  }, [productError, productLoading]);

  // Handle error states
  if (productError && !productLoading) {
    const is404Error = productError instanceof Error && 
      ((productError as any).apiError?.status === 404 || 
       (productError as any).originalError?.response?.status === 404);
    
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row items-center justify-between p-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            {is404Error ? t("product.product_not_found") : t("product.error_loading_product")}
          </Text>
          <View className="w-6" />
        </View>
        
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-muted-foreground mb-6">
            {is404Error 
              ? t("product.product_not_exist")
              : t("product.check_connection")
            }
          </Text>
          
          <View className="flex-row gap-3">
            <Button variant="outline" onPress={() => router.back()}>
              <Text>{t("product.go_back")}</Text>
            </Button>
            {!is404Error && (
              <Button onPress={() => refetchProduct()}>
                <Text>{t("product.try_again")}</Text>
              </Button>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Handle case where product doesn't exist but no error was thrown (fallback)
  if (!product && !productLoading && !productError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row items-center justify-between p-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            {t("product.product_not_found")}
          </Text>
          <View className="w-6" />
        </View>
        
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-muted-foreground mb-6">
            {t("product.product_not_exist")}
          </Text>
          
          <Button variant="outline" onPress={() => router.back()}>
            <Text>{t("product.go_back")}</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    
    const newQuantity = quantity + delta;
    const maxQuantity = product?.inventory_quantity || 1;
    
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
      
      try {
        // Store in temporary quantity
        if (cart.setTempQuantity) {
          cart.setTempQuantity(product.product_id, selectedVariantSku, newQuantity);
        }
        
        // If item is already in cart, update cart quantity
        if (cart.isInCart?.(product.product_id, selectedVariantSku)) {
          cart.updateCartItemQuantity?.(product.product_id, selectedVariantSku, newQuantity);
        }
      } catch (err) {
        console.error("Error updating quantity:", err);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!product || !product.product_id) {
      setError(t("product.unable_to_add_cart"));
      return;
    }

    try {
      setError(null);

      // Validate cart methods exist
      if (!cart.addItem) {
        throw new Error("Cart functionality is not available");
      }

      // Add to cart using React Query optimistic updates
      await cart.addItem({
        product_id: product.product_id,
        quantity,
        currency: "TZS",
        sku: selectedVariantSku,
      }, selectedVariantSku);

      // Force a cart refetch to ensure UI is updated with latest state
      if (cart.refetch) {
        await cart.refetch();
      }

      // Show success toast using Burnt
      Burnt.toast({
        title: t("product.added_to_cart"),
        preset: "done",
        message: `${product.name || t("products.product")} ${t("product.added_to_cart_message")}`,
        haptic: "success",
        duration: 2,
        from: "top",
      });

      // Clear temporary quantity since it's now in cart
      if (cart.clearTempQuantity) {
        cart.clearTempQuantity(product.product_id, selectedVariantSku);
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      setError(t("product.failed_to_add"));
      
      Burnt.toast({
        title: t("common.error"),
        preset: "error",
        message: t("product.failed_to_add"),
        haptic: "error",
        duration: 2,
        from: "top",
      });
    }
  };

  const handleBuyNow = async () => {
    if (!product || !product.product_id) {
      setError(t("product.unable_to_proceed"));
      return;
    }

    try {
      setError(null);

      // Validate cart methods exist
      if (!cart.buyNow) {
        throw new Error("Buy now functionality is not available");
      }

      // Use Buy Now functionality - saves current cart and creates new cart with single item
      await cart.buyNow({
        product_id: product.product_id,
        quantity,
        currency: "TZS",
        sku: selectedVariantSku,
      }, selectedVariantSku);

      // Show success toast and navigate to checkout
      Burnt.toast({
        title: t("product.ready_to_checkout"),
        preset: "done",
        message: t("product.redirecting"),
        haptic: "success",
        duration: 1.5,
        from: "bottom",
      });

      // Navigate directly to checkout using absolute path
      router.push({
        pathname: "/(buyer)/cart/checkout",
        params: {
          returnTo: "product",
          productId: product.product_id,
        },
      });

      // Clear temporary quantity since it's now in cart
      if (cart.clearTempQuantity) {
        cart.clearTempQuantity(product.product_id, selectedVariantSku);
      }
    } catch (error) {
      console.error("Failed to process Buy Now:", error);
      setError(t("product.failed_to_process"));
      
      Burnt.toast({
        title: t("common.error"),
        preset: "error",
        message: t("product.failed_to_process"),
        haptic: "error",
        duration: 2,
        from: "top",
      });
    }
  };

  // Show loading skeleton only when actually loading (not on errors)
  if (productLoading && !productError) {
    return (
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={true}
        containerClassName="bg-white"
      >
        <ProductDetailsSkeleton />
      </DesktopLayoutWrapper>
    );
  }

  // Final safety check - ensure product exists before rendering main component
  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row items-center justify-between p-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            {t("product.product_not_found")}
          </Text>
          <View className="w-6" />
        </View>
        
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-muted-foreground mb-6">
            {t("product.unable_to_load")}
          </Text>
          
          <Button variant="outline" onPress={() => router.back()}>
            <Text>{t("product.go_back")}</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-white"
    >
      <SafeAreaView className="flex-1 bg-background pb-4" edges={["top", "right", "left"]}>
        <ScrollView className="flex-1">
          {error && (
            <View className="p-4">
              <Alert icon={Terminal} variant="destructive">
                <Text className="text-sm text-destructive">{error}</Text>
              </Alert>
            </View>
          )}

          {cart.error && (
            <View className="p-4">
              <Alert icon={Terminal} variant="default">
                <Text className="text-sm text-muted-foreground">
                  {t("product.cart_sync_failed")}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onPress={() => cart.refetch?.()}
                >
                  <Text className="text-sm">{t("product.retry_now")}</Text>
                </Button>
              </Alert>
            </View>
          )}

          {isReferralActive && isCurrentProductReferral && (
            <View className="p-4">
            <Alert icon={Terminal} variant="default">
              <Text className="text-sm text-muted-foreground">
                {t("product.referral_link_message")}
              </Text>
            </Alert>
            </View>
          )}

          <ProductDetails
            product={product}
            quantity={quantity}
            handleQuantityChange={handleQuantityChange}
            onVariantChange={setSelectedVariantSku}
            handleAddToCart={handleAddToCart}
            handleBuyNow={handleBuyNow}
            selectedVariantSku={selectedVariantSku}
          />

          {product?.category_ids?.[0] && (
            <SimilarItems
              productId={product.product_id}
              categoryId={product.category_ids[0]}
              count={6}
              title={t("recommendations.similar_products")}
            />
          )}
        </ScrollView>

        {!isDesktop && (
          <AddToCart
            product={product}
            quantity={quantity}
            handleAddToCart={handleAddToCart}
            handleBuyNow={handleBuyNow}
            selectedVariantSku={selectedVariantSku}
          />
        )}
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
}