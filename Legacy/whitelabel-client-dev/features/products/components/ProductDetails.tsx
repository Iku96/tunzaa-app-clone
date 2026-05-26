import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  Image as ImageIcon,
  Package,
  Truck,
  Tag,
  AlertCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageSlider } from "@/components/ui/image-slider";
import { ShareButton } from "@/components/ui/share-button";
import { Product } from "@/services/products";
import { getImageUrl } from "@/utils/images";
import { useAuth } from "@/context/auth";
import { useCheckWishlistStatus, useAddToWishlist, useRemoveFromWishlist } from "@/services/wishlist";
import { useWishlistStore } from "@/stores/wishlist";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import AddToCart from "@/features/products/components/AddToCart";
import { useResponsive } from "@/hooks/useResponsive";
import { API_CONFIG } from "@/services/config";
import { useI18n } from "@/hooks/useI18n";
import { useGetRatingSummary, useGetEntityReviews, formatRating, getRatingColor } from "@/services/ratings";
import { Star, ThumbsUp, User } from "lucide-react-native";

interface ProductVariant {
  variant_id?: string;
  sku: string;
  name?: string;
  price?: number;
  inventory_quantity?: number;
  attributes?: {
    name?: string;
    value?: string;
  };
  image_url?: string | null;
  is_active?: boolean;
}

// Rating Display Component
const RatingDisplay = ({ 
  averageRating, 
  totalRatings,
  totalReviews,
  size = 16,
  showText = true 
}: { 
  averageRating: number; 
  totalRatings: number;
  totalReviews?: number;
  size?: number;
  showText?: boolean;
}) => {
  const ratingColor = getRatingColor(averageRating);
  const displayRating = formatRating(averageRating);
  
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= Math.round(averageRating) ? ratingColor : "transparent"}
            color={star <= Math.round(averageRating) ? ratingColor : "#d1d5db"}
          />
        ))}
      </View>
      {showText && (
        <>
          <Text className="text-sm font-semibold text-foreground">
            {displayRating}
          </Text>
          <Text className="text-sm text-muted-foreground">
            ({totalRatings.toLocaleString()} {totalRatings === 1 ? "rating" : "ratings"})
          </Text>
        </>
      )}
    </View>
  );
};

// Review Card Component (YouTube-style)
const ReviewCard = ({ review }: { review: any }) => {
  const ratingColor = getRatingColor(review.score);
  const displayRating = formatRating(review.score);
  
  // Get user initials from user_id or metadata
  const getUserInitials = () => {
    const name = review.metadata?.user_name || review.user_id;
    if (!name) return "U";
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <View className="py-3 border-b border-border">
      <View className="flex-row">
        {/* User Avatar */}
        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
          <Text className="text-sm font-semibold text-primary">
            {getUserInitials()}
          </Text>
        </View>

        {/* Review Content */}
        <View className="flex-1">
          {/* User Name & Rating */}
          <View className="flex-row items-center mb-1">
            <Text className="text-sm font-semibold text-foreground mr-2">
              {review.metadata?.user_name || 'Anonymous'}
            </Text>
            <View className="flex-row items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  fill={star <= review.score ? ratingColor : "transparent"}
                  color={star <= review.score ? ratingColor : "#d1d5db"}
                />
              ))}
            </View>
          </View>

          {/* Timestamp */}
          <Text className="text-xs text-muted-foreground mb-2">
            {formatRelativeTime(review.created_at)}
            {review.is_verified_purchase && (
              <Text className="text-success"> • Verified Purchase</Text>
            )}
          </Text>

          {/* Review Text */}
          {review.content && (
            <Text className="text-sm text-foreground leading-5 mb-2">
              {review.content}
            </Text>
          )}

          {/* Review Images */}
          {review.media_urls && review.media_urls.length > 0 && (
            <View className="flex-row gap-2 mb-2 flex-wrap">
              {review.media_urls.slice(0, 3).map((url: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          {/* Like Button (placeholder) */}
          <View className="flex-row items-center mt-1">
            <TouchableOpacity className="flex-row items-center mr-4">
              <ThumbsUp size={14} className="text-muted-foreground mr-1" />
              <Text className="text-xs text-muted-foreground">Helpful</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function ProductScreen({
  product,
  quantity,
  handleQuantityChange,
  onVariantChange,
  handleAddToCart,
  handleBuyNow,
  selectedVariantSku
}: {
  product: Product;
  quantity: number;
  handleQuantityChange: (delta: number) => void;
  onVariantChange?: (variantSku: string | undefined) => void;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
  selectedVariantSku?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { height: screenHeight } = Dimensions.get("window");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const resolvedThemeColors = useResolvedThemeColors();
  const { isDesktop } = useResponsive();
  const { t } = useI18n();

  // Fetch product ratings summary
  const { data: ratingSummary, isLoading: ratingsLoading } = useGetRatingSummary(
    product?.product_id || "",
    !!product?.product_id
  );

  // Fetch product reviews (ratings with content)
  const { data: reviewsData, isLoading: reviewsLoading } = useGetEntityReviews(
    product?.product_id || "",
    { status: 'approved', limit: 10, sort_by: 'created_at', sort_direction: -1 },
    !!product?.product_id
  );

  // Helper function to safely get variant attribute name
  const getVariantAttributeName = (variants: any[]): string => {
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return t("products.options");
    }
    
    const firstVariant = variants[0] as ProductVariant;
    // Check if it's the old structure (with attributes) or new structure (direct name)
    if (firstVariant?.attributes?.name) {
      return firstVariant.attributes.name;
    }
    // For simplified variants, the 'name' field represents the attribute type
    return firstVariant?.name || t("products.options");
  };

  // Initialize selected variant with safety checks
  useEffect(() => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const firstVariant = product.variants[0] as ProductVariant;
      if (firstVariant && firstVariant.sku) {
        setSelectedVariant(firstVariant);
        // Also notify parent component about the default selection
        onVariantChange?.(firstVariant.sku);
      }
    }
  }, [product?.variants]);

  // Wishlist hooks
  const { data: wishlistStatus } = useCheckWishlistStatus(
    product?.product_id,
    selectedVariant?.sku,
    !!user?.user_id
  );
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { isInWishlist, addItem, removeItem } = useWishlistStore();

  // Update local state when wishlist status changes
  useEffect(() => {
    if (wishlistStatus) {
      setIsFavorite(wishlistStatus.is_wishlisted);
    } else if (user?.user_id && product?.product_id) {
      setIsFavorite(isInWishlist(product.product_id, selectedVariant?.sku));
    }
  }, [wishlistStatus, user?.user_id, isInWishlist, product?.product_id, selectedVariant?.sku]);

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!user?.user_id || !product?.product_id) {
      return;
    }

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    try {
      if (isFavorite) {
        await removeFromWishlist.mutateAsync({
          productId: product.product_id,
          variantSku: selectedVariant?.sku,
        });
        removeItem(product.product_id, selectedVariant?.sku);
      } else {
        const result = await addToWishlist.mutateAsync({
          product_id: product.product_id,
          variant_sku: selectedVariant?.sku,
        });
        addItem(result);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      setIsFavorite(!newFavoriteState);
    }
  };

  // Generate share URL
  const getShareUrl = () => {
    const baseUrl = Platform.OS === "web" ? window.location.origin : API_CONFIG.APP_URL;
    return `${baseUrl}/product/${product?.product_id || ''}`;
  };

  // Process images for thumbnails
  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Combine product images with variant images
  const getAllImages = () => {
    const productImages = product?.images?.map((image) => {
      const imageUrl = getImageUrl(image);
      return {
        original: image,
        url: imageUrl,
        isValid: isValidImageUrl(imageUrl),
        source: 'product'
      };
    }) || [];

    const variantImages = product?.variants?.map((variant: ProductVariant) => {
      if (!variant.image_url) return null;
      const imageUrl = getImageUrl({ url: variant.image_url });
      return {
        original: { url: variant.image_url },
        url: imageUrl,
        isValid: isValidImageUrl(imageUrl),
        source: 'variant',
        variantSku: variant.sku
      };
    }).filter(Boolean) || [];

    return [...productImages, ...variantImages];
  };

  const allImages = getAllImages();
  const validImages = allImages.filter((img) => img.isValid);

  // Switch to variant image when variant is selected
  useEffect(() => {
    if (selectedVariant?.sku && allImages.length > 0) {
      const variantImageIndex = allImages.findIndex(
        img => img.source === 'variant' && img.variantSku === selectedVariant.sku
      );
      if (variantImageIndex !== -1) {
        setCurrentImageIndex(variantImageIndex);
      }
    }
  }, [selectedVariant?.sku, allImages]);

  // Handle image change to deselect variant when swiping to non-variant images
  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
    
    // If user swipes to a non-variant image, deselect the variant
    const currentImage = allImages[index];
    if (currentImage && currentImage.source === 'product') {
      setSelectedVariant(null);
      onVariantChange?.(undefined);
    }
  };

  if (!product) {
    return (
      <View className="flex-row items-center justify-between">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft size={24} color={resolvedThemeColors?.foreground || "#000000"} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          {t("products.product_not_found")}
        </Text>
        <View className="w-6" />
      </View>
    );
  }

  const displayPrice = product?.sale_price || product?.base_price || 0;
  const isOnSale = product?.sale_price && product?.base_price && product.sale_price < product.base_price;
  const stockStatus =
    (product?.inventory_quantity || 0) <= 0
      ? t("products.out_of_stock")
      : (product?.inventory_quantity || 0) <= (product?.low_stock_threshold || 0)
      ? t("products.low_stock")
      : t("products.in_stock");

  const isWeb = isDesktop;

  return (
    <View className={`flex-1 ${isDesktop ? 'bg-white' : 'bg-background'}`}>
      {isWeb ? (
        <View className="flex-1 flex-row p-4 bg-white">
          {/* Left Column: Carousel and Thumbnails */}
          <View className="w-2/5 pr-4">
            <View className="relative">
              <ImageSlider
                images={validImages.map(img => img.original)}
                height={450}
                minHeight={450}
                currentIndex={currentImageIndex}
                onImageChange={handleImageChange}
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.5)", "transparent"]}
                className="absolute top-0 left-0 right-0 h-[100px]"
              />
              <View className="absolute top-0 left-0 right-0 flex-row justify-end p-4">
                {!isDesktop && (
                  <ShareButton
                    url={getShareUrl()}
                    title={`${t("products.check_out")} ${product?.name || t("products.this_product")}`}
                    message={`${t("products.i_found_amazing_product")}: ${product?.name || t("products.check_it_out")}`}
                    variant="ghost"
                    size="icon"
                    className="bg-black/50"
                    iconClassName="text-white"
                  />
                )}
              </View>
            </View>
            {validImages.length > 1 && (
              <View className="px-4 py-3">
                <FlatList
                  data={validImages}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, index) => index.toString()}
                  contentContainerStyle={{ gap: 8 }}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      onPress={() => handleImageChange(index)}
                      className={`rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        source={{ uri: item.url }}
                        style={{ width: 60, height: 60 }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
          {/* Right Column: Product Details and Delivery Info */}
          <View className="w-3/5 pl-4">
            <ScrollView>
              <View className="flex-row justify-between items-center mb-4">
                <ShareButton
                  url={getShareUrl()}
                  title={`${t("products.check_out")} ${product?.name || t("products.this_product")}`}
                  message={`${t("products.i_found_amazing_product")}: ${product?.name || t("products.check_it_out")}`}
                  variant="outline"
                  size="icon"
                  className="bg-white/50"
                  color={"grey"}
                  iconClassName="text-white"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onPress={handleWishlistToggle}
                  disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                >
                  <Heart
                    size={24}
                    color={"grey"}
                    fill={isFavorite ? resolvedThemeColors?.primary : "transparent"}
                  />
                </Button>
              </View>
              <Text className="text-2xl font-bold text-foreground mb-2">
                {product?.name || t("products.product")}
              </Text>
              <Text className="text-sm text-muted-foreground leading-6 mb-2">
                {product?.short_description || ''}
              </Text>
              {/* Product Rating */}
              {ratingSummary && ratingSummary.total_ratings > 0 && (
                <View className="mb-3">
                  <RatingDisplay
                    averageRating={ratingSummary.average_rating}
                    totalRatings={ratingSummary.total_ratings}
                    totalReviews={ratingSummary.total_reviews}
                    size={18}
                  />
                </View>
              )}
              <View className="flex-row justify-between mb-4 mt-4">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-foreground">
                    TSh {(displayPrice * quantity).toLocaleString()}
                  </Text>
                  {isOnSale && (
                    <Text className="text-base text-muted-foreground line-through">
                      TSh {((product?.base_price || 0) * quantity).toLocaleString()}
                    </Text>
                  )}
                  {quantity > 1 && (
                    <Text className="text-sm text-muted-foreground">
                      TSh {displayPrice.toLocaleString()} {t("products.each")}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center bg-muted-foreground rounded-full p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-10 h-10 rounded-full bg-white ${
                      quantity === 1 ? "opacity-50" : ""
                    }`}
                    onPress={() => handleQuantityChange(-1)}
                    disabled={quantity === 1 || (product?.inventory_quantity || 0) <= 0}
                  >
                    <Minus
                      size={20}
                      className={
                        quantity === 1 ? "text-muted-foreground" : "text-foreground"
                      }
                    />
                  </Button>
                  <Text className="text-base font-semibold text-foreground px-4">
                    {quantity}
                  </Text>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-10 h-10 rounded-full bg-white ${
                      quantity === (product?.inventory_quantity || 0) ? "opacity-50" : ""
                    }`}
                    onPress={() => handleQuantityChange(1)}
                    disabled={quantity === (product?.inventory_quantity || 0) || (product?.inventory_quantity || 0) <= 0}
                  >
                    <Plus
                      size={20}
                      className={
                        quantity === (product?.inventory_quantity || 0) ? "text-muted-foreground" : "text-foreground"
                      }
                    />
                  </Button>
                </View>
              </View>
              <View className="flex-row items-center mb-4">
                <View className="flex-row items-center gap-2">
                  <View className={`w-2 h-2 rounded-full ${
                    (product?.inventory_quantity || 0) > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <Text className="text-sm text-muted-foreground">
                    {(product?.inventory_quantity || 0) > 0 ? t("products.in_stock") : t("products.out_of_stock")}
                  </Text>
                </View>
              </View>
              {product?.has_variants && product?.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
                <View className="mb-6">
                  <Text className="text-base font-semibold text-foreground mb-3">
                    {t("products.select")} {t("products.variant")}
                  </Text>
                  <View className="gap-3">
                    {(product.variants as ProductVariant[]).map((variant, index) => {
                      if (!variant || !variant.sku) return null;
                      const isSelected = selectedVariant?.sku === variant.sku;
                      
                      return (
                        <TouchableOpacity
                          key={variant.variant_id || `variant-${index}`}
                          onPress={() => {
                            setSelectedVariant(variant);
                            onVariantChange?.(variant.sku);
                          }}
                          className={`flex-row border-2 rounded-lg p-3 ${
                            isSelected 
                              ? "border-primary bg-primary/5" 
                              : "border-border bg-muted/30"
                          }`}
                        >
                          {/* Variant Image */}
                          {variant.image_url && (
                            <Image
                              source={{ uri: variant.image_url }}
                              className="w-20 h-20 rounded-md mr-3"
                              resizeMode="cover"
                            />
                          )}
                          
                          <View className="flex-1">
                            {/* Variant Name */}
                            <Text className={`text-sm font-semibold mb-1 ${
                              isSelected ? "text-primary" : "text-foreground"
                            }`}>
                              {variant.name}
                            </Text>
                            
                            {/* Attributes */}
                            {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                              <View className="flex-row flex-wrap gap-1 mb-2">
                                {Object.entries(variant.attributes).map(([key, value], i) => (
                                  <View key={i} className="bg-muted px-2 py-0.5 rounded">
                                    <Text className="text-xs text-muted-foreground capitalize">
                                      {key}: {value}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                            
                            {/* Price */}
                            <Text className={`text-base font-bold ${
                              isSelected ? "text-primary" : "text-foreground"
                            }`}>
                              TSh {(variant.price || 0).toLocaleString()}
                            </Text>
                            
                            {/* Stock Status */}
                            <Text className="text-xs text-muted-foreground mt-1">
                              {(variant.inventory_quantity || 0) > 0 
                                ? `${variant.inventory_quantity} ${t("products.in_stock").toLowerCase()}`
                                : t("products.out_of_stock")}
                            </Text>
                          </View>
                          
                          {/* Selected Indicator */}
                          {isSelected && (
                            <View className="justify-center items-center ml-2">
                              <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                                <Text className="text-white text-xs">✓</Text>
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
              <Text className="text-base font-bold text-foreground mb-2 mt-4">
                {t("products.product_information")}
              </Text>
              <Text className="text-sm text-muted-foreground leading-6 mb-2">
                {product?.description || ''}
              </Text>
              {product?.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {product.tags.map((tag, index) => (
                    <Badge key={`tag-${index}`} variant="secondary">
                      <Text className="text-xs text-white">{tag}</Text>
                    </Badge>
                  ))}
                </View>
              )}
              <Card className="bg-muted mb-4 p-4">
                <View className="gap-4">
                  {product?.requires_shipping && (
                    <View className="flex-row items-center gap-2">
                      <Truck size={20} className="text-muted-foreground" color={resolvedThemeColors?.primary} />
                      <Text className="text-sm text-muted-foreground">
                        {t("products.shipping_weight")}: {product?.weight || 0} g
                      </Text>
                    </View>
                  )}
                  {product?.dimensions && (
                    <View className="flex-row items-center gap-2">
                      <Package size={20} className="text-muted-foreground" color={resolvedThemeColors?.primary} />
                      <Text className="text-sm text-muted-foreground">
                        {t("products.dimensions")}: {product.dimensions.length || 0}cm ×{" "}
                        {product.dimensions.width || 0}cm × {product.dimensions.height || 0}cm
                      </Text>
                    </View>
                  )}
                </View>
            </Card>

            {/* Customer Reviews Section */}
            {reviewsData && reviewsData.items && reviewsData.items.length > 0 && (
              <View className="mb-6">
                <Text className="text-base font-bold text-foreground mb-2">
                  {t("products.customer_reviews")} ({reviewsData.total})
                </Text>
                <Card className="bg-muted p-4">
                  {reviewsData.items.map((review, index) => (
                    <ReviewCard key={review.rating_id || index} review={review} />
                  ))}
                  {reviewsData.total > reviewsData.items.length && (
                    <TouchableOpacity className="pt-3">
                      <Text className="text-sm text-primary font-semibold text-center">
                        {t("products.see_all_reviews")} ({reviewsData.total})
                      </Text>
                    </TouchableOpacity>
                  )}
                </Card>
              </View>
            )}

            <AddToCart
              product={product}
              quantity={quantity}
              handleAddToCart={handleAddToCart}
              handleBuyNow={handleBuyNow}
              selectedVariantSku={selectedVariantSku}
            />
            </ScrollView>
          </View>
        </View>
      ) : (
        <>
          <View className="relative">
            <ImageSlider
              images={validImages.map(img => img.original)}
              height={screenHeight * 0.45}
              minHeight={screenHeight * 0.45}
              currentIndex={currentImageIndex}
              onImageChange={handleImageChange}
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.5)", "transparent"]}
              className="absolute top-0 left-0 right-0 h-[100px]"
            />
            <View className="absolute top-0 left-0 right-0 flex-row justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50"
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} className="text-white" color={resolvedThemeColors?.foreground} />
              </Button>
              <View className="flex-row gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50"
                  onPress={handleWishlistToggle}
                  disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                >
                  <Heart
                    size={24}
                    color={isFavorite ? resolvedThemeColors?.primary : "white"}
                    fill={isFavorite ? resolvedThemeColors?.primary : "transparent"}
                  />
                </Button>
                <ShareButton
                  url={getShareUrl()}
                  title={`${t("products.check_out")} ${product?.name || t("products.this_product")}`}
                  message={`${t("products.i_found_amazing_product")}: ${product?.name || t("products.check_it_out")}`}
                  variant="ghost"
                  size="icon"
                  className="bg-black/50"
                  iconClassName="text-white"
                />
              </View>
            </View>
            {validImages.length > 1 && (
              <View className="px-4 py-3">
                <FlatList
                  data={validImages}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, index) => index.toString()}
                  contentContainerStyle={{ gap: 8 }}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      onPress={() => handleImageChange(index)}
                      className={`rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        source={{ uri: item.url }}
                        style={{ width: 60, height: 60 }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
          <ScrollView className="p-4">
            <Text className="text-2xl font-bold text-foreground mb-2">
              {product?.name || t("products.product")}
            </Text>
            <Text className="text-sm text-muted-foreground leading-6 mb-2">
              {product?.short_description || ''}
            </Text>
            {/* Product Rating */}
            {ratingSummary && ratingSummary.total_ratings > 0 && (
              <View className="mb-3">
                <RatingDisplay
                  averageRating={ratingSummary.average_rating}
                  totalRatings={ratingSummary.total_ratings}
                  totalReviews={ratingSummary.total_reviews}
                  size={18}
                />
              </View>
            )}
            <View className="flex-row justify-between mb-4 mt-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">
                  TSh {(displayPrice * quantity).toLocaleString()}
                </Text>
                {isOnSale && (
                  <Text className="text-base text-muted-foreground line-through">
                    TSh {((product?.base_price || 0) * quantity).toLocaleString()}
                  </Text>
                )}
                {quantity > 1 && (
                  <Text className="text-sm text-muted-foreground">
                    TSh {displayPrice.toLocaleString()} {t("products.each")}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center bg-muted-foreground rounded-full p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 rounded-full bg-white ${
                    quantity === 1 ? "opacity-50" : ""
                  }`}
                  onPress={() => handleQuantityChange(-1)}
                  disabled={quantity === 1 || (product?.inventory_quantity || 0) <= 0}
                >
                  <Minus
                    size={20}
                    className={
                      quantity === 1 ? "text-muted-foreground" : "text-foreground"
                    }
                  />
                </Button>
                <Text className="text-base font-semibold text-foreground px-4">
                  {quantity}
                </Text>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 rounded-full bg-white ${
                    quantity === (product?.inventory_quantity || 0) ? "opacity-50" : ""
                  }`}
                  onPress={() => handleQuantityChange(1)}
                  disabled={quantity === (product?.inventory_quantity || 0) || (product?.inventory_quantity || 0) <= 0}
                >
                  <Plus
                    size={20}
                    className={
                      quantity === (product?.inventory_quantity || 0) ? "text-muted-foreground" : "text-foreground"
                    }
                  />
                </Button>
              </View>
            </View>
            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center gap-2">
                <View className={`w-2 h-2 rounded-full ${
                  (product?.inventory_quantity || 0) > 0 ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <Text className="text-sm text-muted-foreground">
                  {(product?.inventory_quantity || 0) > 0 ? t("products.in_stock") : t("products.out_of_stock")}
                </Text>
              </View>
            </View>
            {product?.has_variants && product?.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
              <View className="mb-6">
                <Text className="text-base font-semibold text-foreground mb-3">
                  {t("products.select")} {t("products.variant")}
                </Text>
                <View className="gap-3">
                  {(product.variants as ProductVariant[]).map((variant, index) => {
                    if (!variant || !variant.sku) return null;
                    const isSelected = selectedVariant?.sku === variant.sku;
                    
                    return (
                      <TouchableOpacity
                        key={variant.variant_id || variant.sku || `variant-${index}`}
                        onPress={() => {
                          setSelectedVariant(variant);
                          onVariantChange?.(variant.sku);
                        }}
                        className={`flex-row border-2 rounded-lg p-3 ${
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border bg-muted/30"
                        }`}
                      >
                        {/* Variant Image */}
                        {variant.image_url && (
                          <Image
                            source={{ uri: variant.image_url }}
                            className="w-20 h-20 rounded-md mr-3"
                            resizeMode="cover"
                          />
                        )}
                        
                        <View className="flex-1">
                          {/* Variant Name */}
                          <Text className={`text-sm font-semibold mb-1 ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}>
                            {variant.name}
                          </Text>
                          
                          {/* Attributes */}
                          {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                            <View className="flex-row flex-wrap gap-1 mb-2">
                              {Object.entries(variant.attributes).map(([key, value], i) => (
                                <View key={i} className="bg-muted px-2 py-0.5 rounded">
                                  <Text className="text-xs text-muted-foreground capitalize">
                                    {key}: {value}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                          
                          {/* Price */}
                          <Text className={`text-base font-bold ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}>
                            TSh {(variant.price || 0).toLocaleString()}
                          </Text>
                          
                          {/* Stock Status */}
                          <Text className="text-xs text-muted-foreground mt-1">
                            {(variant.inventory_quantity || 0) > 0 
                              ? `${variant.inventory_quantity || 0} ${t("products.in_stock").toLowerCase()}`
                              : t("products.out_of_stock")}
                          </Text>
                        </View>
                        
                        {/* Selected Indicator */}
                        {isSelected && (
                          <View className="justify-center items-center ml-2">
                            <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                              <Text className="text-white text-xs">✓</Text>
                            </View>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            <Text className="text-base font-bold text-foreground mb-2 mt-4">
              {t("products.product_information")}
            </Text>
            <Text className="text-sm text-muted-foreground leading-6 mb-2">
              {product?.description || ''}
            </Text>
            {product?.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {product.tags.map((tag, index) => (
                  <Badge key={`tag-${index}`} variant="secondary">
                    <Text className="text-xs text-white">{tag}</Text>
                  </Badge>
                ))}
              </View>
            )}
            <Card className="bg-muted mb-4 p-4">
              <View className="gap-4">
                {product?.requires_shipping && (
                  <View className="flex-row items-center gap-2">
                    <Truck size={20} className="text-muted-foreground" color={resolvedThemeColors?.primary} />
                    <Text className="text-sm text-muted-foreground">
                      {t("products.shipping_weight")}: {product?.weight || 0} g
                    </Text>
                  </View>
                )}
                {product?.dimensions && (
                  <View className="flex-row items-center gap-2">
                    <Package size={20} className="text-muted-foreground" color={resolvedThemeColors?.primary} />
                    <Text className="text-sm text-muted-foreground">
                      {t("products.dimensions")}: {product.dimensions.length || 0}cm ×{" "}
                      {product.dimensions.width || 0}cm × {product.dimensions.height || 0}cm
                    </Text>
                  </View>
                )}
              </View>
              </Card>

              {/* Customer Reviews Section - Mobile */}
              {reviewsData && reviewsData.items && reviewsData.items.length > 0 && (
                <View className="mb-6">
                  <Text className="text-base font-bold text-foreground mb-2 mt-4">
                    {t("products.customer_reviews")} ({reviewsData.total})
                  </Text>
                  <Card className="bg-muted p-4">
                    {reviewsData.items.map((review, index) => (
                      <ReviewCard key={review.rating_id || index} review={review} />
                    ))}
                    {reviewsData.total > reviewsData.items.length && (
                      <TouchableOpacity className="pt-3">
                        <Text className="text-sm text-primary font-semibold text-center">
                          {t("products.see_all_reviews")} ({reviewsData.total})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </Card>
                </View>
              )}

              {isDesktop && ( <AddToCart
                product={product}
                quantity={quantity}
                handleAddToCart={handleAddToCart}
                handleBuyNow={handleBuyNow}
                selectedVariantSku={selectedVariantSku}
              />)}
          </ScrollView>
        </>
      )}
    </View>
  );
}