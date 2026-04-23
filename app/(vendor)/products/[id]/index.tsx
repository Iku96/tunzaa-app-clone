import { useCallback, useState } from "react";
import { View, ScrollView, Alert, Platform, Dimensions, Image, TouchableOpacity, FlatList } from "react-native";
import * as Burnt from "burnt";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { ArrowLeft, Edit, Package, Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  useGetProduct,
  useUpdateProduct,
  useUpdateProductInventory,
  useUpdateProductStatus,
  type ProductResponse,
} from "@/services/product-management";
import { ProductModal } from "@/components/modals/ProductModal";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageSlider } from "@/components/ui/image-slider";
import { useAuth } from "@/context/auth";
import { useGetVendor } from "@/services/vendors";
import { InventoryModal } from "@/components/modals/InventoryModal";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { getImageUrl } from "@/utils/images";

const ProductDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedColors = useResolvedThemeColors();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { height: screenHeight } = Dimensions.get("window");
  
  // Get auth user and find vendor profile
  const { user } = useAuth();
  const vendorProfile = user?.profiles?.find(
    (profile) => profile.role === "vendor"
  );
  const vendorProfileId = vendorProfile?.profile_id;

  // Fetch vendor details using the profile ID
  const {
    data: vendorData,
    isLoading: isVendorLoading,
    error: vendorError,
  } = useGetVendor(vendorProfileId || "", !!vendorProfileId);

  // Extract vendor_id and store_id from vendor response
  const VENDOR_ID = vendorData?.vendor_id;
  const STORE_ID = vendorData?.stores?.[0]?.store_id;

  // API hooks
  const { data: product, isLoading, error, refetch } = useGetProduct(id!, !!id);
  const updateProductMutation = useUpdateProduct();
  const updateInventoryMutation = useUpdateProductInventory();
  const updateProductStatusMutation = useUpdateProductStatus();

  // Refresh product when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
      }
    }, [id, refetch])
  );

  const handleProductSubmit = async (productData: any) => {
    try {
      if (!VENDOR_ID || !STORE_ID || !product) {
        Burnt.toast({
          title: "Error",
          message: "Vendor or store information is missing",
          preset: "error",
          haptic: "error",
          duration: 4,
          from: "top",
        });
        return;
      }

      await updateProductMutation.mutateAsync({
        productId: product.product_id,
        data: {
          ...product,
          ...productData,
          vendor_id: VENDOR_ID,
          store_id: STORE_ID,
        },
      });
      Burnt.toast({
        title: "Product Updated",
        message: "Product updated successfully",
        preset: "done",
        haptic: "success",
        duration: 3,
        from: "top",
      });
      refetch();
    } catch (error: any) {
      // Extract detailed error message from API response
      let errorMessage = "Failed to update product";
      
      if (error?.originalError?.response?.data?.detail) {
        errorMessage = error.originalError.response.data.detail;
      } else if (error?.apiError?.message) {
        errorMessage = error.apiError.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Burnt.toast({
        title: "Error",
        message: errorMessage,
        preset: "error",
        haptic: "error",
        duration: 5,
        from: "top",
      });
    }
  };

  const handleInventorySubmit = async (
    productId: string,
    newQuantity: number,
    basePrice?: number,
    salePrice?: number
  ) => {
    updateInventoryMutation.mutate(
      {
        productId,
        data: { inventory_quantity: newQuantity, base_price: basePrice, sale_price: salePrice },
      },
      {
        onSuccess: () => {
          Burnt.toast({
            title: "Inventory Updated",
            message: "Inventory updated successfully",
            preset: "done",
            haptic: "success",
            duration: 3,
            from: "top",
          });
          refetch();
        },
        onError: (error: any) => {
          // Extract detailed error message from API response
          let errorMessage = "Failed to update inventory";
          
          if (error?.originalError?.response?.data?.detail) {
            errorMessage = error.originalError.response.data.detail;
          } else if (error?.apiError?.message) {
            errorMessage = error.apiError.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          Burnt.toast({
            title: "Error",
            message: errorMessage,
            preset: "error",
            haptic: "error",
            duration: 5,
            from: "top",
          });
        },
      }
    );
  };

  const handleToggleVisibility = () => {
    if (!product) return;
    
    const newStatus = !product.is_active;
    const action = newStatus ? "activate" : "hide";
    const title = `${action.charAt(0).toUpperCase() + action.slice(1)} Product`;
    const message = `Are you sure you want to ${action} "${product.name}"? ${
      newStatus 
        ? "This will make the product visible to customers." 
        : "This will hide the product from customers."
    }`;

    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: newStatus ? "default" : "destructive",
          onPress: () => {
            updateProductStatusMutation.mutate(
              {
                productId: product.product_id,
                data: { is_active: newStatus },
              },
              {
                onSuccess: () => {
                  Burnt.toast({
                    title: newStatus ? "Product Activated" : "Product Hidden",
                    message: `Product ${action}d successfully`,
                    preset: "done",
                    haptic: "success",
                    duration: 3,
                    from: "top",
                  });
                  refetch();
                },
                onError: (error: any) => {
                  // Extract detailed error message from API response
                  let errorMessage = `Failed to ${action} product`;
                  
                  if (error?.originalError?.response?.data?.detail) {
                    errorMessage = error.originalError.response.data.detail;
                  } else if (error?.apiError?.message) {
                    errorMessage = error.apiError.message;
                  } else if (error?.message) {
                    errorMessage = error.message;
                  }
                  
                  Burnt.toast({
                    title: "Error",
                    message: errorMessage,
                    preset: "error",
                    haptic: "error",
                    duration: 5,
                    from: "top",
                  });
                },
              }
            );
          },
        },
      ]
    );
  };

  const getStockStatus = () => {
    if (!product) return { status: "unknown", color: "text-muted-foreground" };

    if (product.inventory_quantity === 0) {
      return { status: "Out of Stock", color: "text-destructive" };
    } else if (product.inventory_quantity <= product.low_stock_threshold) {
      return { status: "Low Stock", color: "text-warning" };
    } else {
      return { status: "In Stock", color: "text-success" };
    }
  };

  // Process images for thumbnails (from ProductDetails.tsx)
  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const processedImages =
    product?.images?.map((image) => {
      // Handle both string URLs and image objects
      const imageUrl = typeof image === "string" ? image : image.url;
      return {
        original: image,
        url: imageUrl,
        isValid: isValidImageUrl(imageUrl),
      };
    }) || [];

  const validImages = processedImages.filter((img) => img.isValid);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted-foreground">
            Loading product details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-destructive mb-4">
            Failed to load product details
          </Text>
          <Button onPress={() => refetch()}>
            <Text className="text-white font-semibold">Retry</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <ScrollView className="flex-1">
        {/* Product Image Section with Overlay Header */}
        <View className="relative">
          <ImageSlider
            images={product.images || []}
            height={Platform.OS === "web" ? undefined : screenHeight * 0.4}
            minHeight={Platform.OS === "web" ? 400 : screenHeight * 0.4}
            onImageChange={setCurrentImageIndex}
            showIndicators={product.images && product.images.length > 1}
            fallbackText="No product images"
          />
          
          {/* Header Overlay */}
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "transparent"]}
            className="absolute top-0 left-0 right-0 h-[120px]"
          />
          <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between p-4 pt-12">
            <View className="flex-row items-center">
              <Button
                variant="ghost"
                size="icon"
                onPress={() => router.back()}
                className="bg-black/50"
              >
                <ArrowLeft size={24} color="white" />
              </Button>
              <Text className="text-xl font-bold text-foreground ml-4">
                Product Details
              </Text>
            </View>
          </View>

          {/* Thumbnail Images */}
          {validImages.length > 1 && (
            <View className="px-4 py-3 bg-background">
              <FlatList
                data={validImages}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ gap: 8 }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => setCurrentImageIndex(index)}
                    className={`rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      source={{ uri: item.url }}
                      style={{
                        width: 60,
                        height: 60,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        <View className="p-4">
          {/* Product Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground mb-2">
              {product.name}
            </Text>
            <Text className="text-muted-foreground mb-4">SKU: {product.sku}</Text>

            {product.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    <Text className="text-xs">{tag}</Text>
                  </Badge>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <ProductModal
              product={product}
              onSubmit={handleProductSubmit}
              triggerSize="default"
              triggerVariant="primary"
              triggerText="Edit Product"
            />
            <InventoryModal 
              product={product} 
              onSubmit={handleInventorySubmit}
              triggerSize="default"
              triggerVariant="outline"
              triggerText="Update Stock"
            />
            <Button
              variant={product.is_active ? "outline" : "default"}
              size="default"
              onPress={handleToggleVisibility}
              className="flex-row items-center gap-2"
            >
              {product.is_active ? (
                <EyeOff size={18} color={resolvedColors.foreground} />
              ) : (
                <Eye size={18} color="white" />
              )}
              <Text className={`font-medium ${product.is_active ? 'text-foreground' : 'text-white'}`}>
                {product.is_active ? "Hide" : "Show"}
              </Text>
            </Button>
          </View>

          {/* Variants Section */}
          {product.has_variants && product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
            <Card className="mb-6 p-4">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Product Variants
              </Text>
              <View className="gap-3">
                {product.variants.map((variant, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between py-3 border-b border-border last:border-b-0"
                  >
                    {/* Variant Image */}
                    {(variant as any).image_url && (
                      <Image
                        source={{ uri: (variant as any).image_url }}
                        className="w-16 h-16 rounded-lg mr-3"
                        resizeMode="cover"
                      />
                    )}
                    
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {variant.name}
                      </Text>
                      <Text className="text-sm text-muted-foreground mb-1">
                        SKU: {variant.sku}
                      </Text>
                      <Text className="text-sm text-muted-foreground mb-2">
                        Stock: {variant.inventory_quantity} units
                      </Text>
                      {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                        <View className="flex-row flex-wrap gap-1">
                          {Object.entries(variant.attributes).map(([key, value], i) => (
                            <View key={i} className="bg-muted px-2 py-1 rounded">
                              <Text className="text-xs text-foreground">
                                {key}: {value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-foreground">
                        TShs {variant.price.toLocaleString()}
                      </Text>
                      <Badge variant={variant.is_active ? "outline" : "primary"} className="mt-2">
                        <Text className="text-xs">
                          {variant.is_active ? "Active" : "Inactive"}
                        </Text>
                      </Badge>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Pricing & Stock Overview */}
          <Card className="mb-6 p-4 bg-muted/30">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">Current Price</Text>
                <Text className="text-2xl font-bold text-foreground">
                  TShs {(product.sale_price || product.base_price).toLocaleString()}
                </Text>
                {product.cost_price && (
                  <Text className="text-sm text-muted-foreground">
                    Cost: TShs {product.cost_price.toLocaleString()}
                  </Text>
                )}
              </View>
              <View className="items-end">
                <Text className="text-sm text-muted-foreground mb-1">Stock Status</Text>
                <Badge 
                  variant={
                    stockStatus.status === "Out of Stock" ? "destructive" :
                    stockStatus.status === "Low Stock" ? "secondary" : "primary"
                  }
                >
                  <Text className="text-xs">{stockStatus.status}</Text>
                </Badge>
                <Text className={`text-lg font-semibold mt-1 ${stockStatus.color}`}>
                  {product.inventory_quantity} units
                </Text>
              </View>
            </View>
          </Card>

          {/* Product Information */}
          <Card className="mb-4 p-4">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Product Information
            </Text>

            <View className="gap-4">
              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <Text className="text-muted-foreground">Low Stock Alert</Text>
                <Text className="font-semibold text-foreground">
                  {product.low_stock_threshold} units
                </Text>
              </View>

              {product.weight > 0 && (
                <View className="flex-row justify-between items-center py-2 border-b border-border">
                  <Text className="text-muted-foreground">Weight</Text>
                  <Text className="font-semibold text-foreground">
                    {product.weight}g
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <Text className="text-muted-foreground">Status</Text>
                <Badge variant={product.is_active ? "primary" : "outline"}>
                  <Text className="text-xs">
                    {product.is_active ? "Active" : "Inactive"}
                  </Text>
                </Badge>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <Text className="text-muted-foreground">Verification</Text>
                <Badge variant={product.verification_status === "approved" ? "primary" : "outline"}>
                  <Text className="text-xs">
                    {product.verification_status === "approved" ? "Approved" : "Pending"}
                  </Text>
                </Badge>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-muted-foreground">Featured</Text>
                <Text className="font-semibold text-foreground">
                  {product.is_featured ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          </Card>

          {/* Description */}
          {product.description && (
            <Card className="mb-4 p-4">
              <Text className="text-lg font-semibold text-foreground mb-3">
                Description
              </Text>
              <Text className="text-foreground leading-6">
                {product.description}
              </Text>
            </Card>
          )}

          {/* Short Description */}
          {product.short_description && (
            <Card className="mb-4 p-4">
              <Text className="text-lg font-semibold text-foreground mb-3">
                Summary
              </Text>
              <Text className="text-foreground leading-5">
                {product.short_description}
              </Text>
            </Card>
          )}

          {/* Product Status */}
          {(product.status || product.rejection_reason) && (
            <Card className="mb-4 p-4 border-l-4 border-l-destructive">
              <Text className="text-lg font-semibold text-foreground mb-3">
                Review Status
              </Text>
              {product.status && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-muted-foreground">Current Status</Text>
                  <Badge
                    variant={
                      product.status === "approved" ? "default" : "destructive"
                    }
                  >
                    <Text className="text-xs capitalize">{product.status}</Text>
                  </Badge>
                </View>
              )}
              {product.rejection_reason && (
                <View className="bg-destructive/10 p-3 rounded-lg">
                  <Text className="text-sm font-medium text-destructive mb-1">
                    Rejection Reason
                  </Text>
                  <Text className="text-sm text-destructive">
                    {product.rejection_reason}
                  </Text>
                </View>
              )}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;
