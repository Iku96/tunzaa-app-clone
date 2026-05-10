import React, { useCallback, useState } from "react";
import { View, ScrollView, RefreshControl, Share, Alert as RNAlert, Clipboard, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  Link,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  AlertCircle,
  ExternalLink,
  User,
  Eye,
  ShoppingCart,
  Banknote,
  Copy,
  TrendingUp,
  Store,
  ShoppingBag,
  Image as ImageIcon,
} from "lucide-react-native";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { useGetAffiliateLinks } from "@/src/services/affiliates";
import { useGetVendor } from "@/src/services/vendors";
import { useProductDetail } from "@/hooks/useProductDetails";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Terminal } from "@/lib/icons/Terminal";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { getImageUrl } from "@/utils/images";
export default function LinkDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useTunzaaAuth();
  const [refreshing, setRefreshing] = useState(false);
  const resolvedColors = useResolvedThemeColors();
  // Get affiliate details
  const { affiliateDetails } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  // Get all affiliate links (since we don't have individual link endpoint)
  const {
    data: linksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAffiliateLinks(
    affiliateId || "",
    { skip: 0, limit: 100 },
    !!affiliateId
  );


  // Find the specific link by ID
  const link = linksData?.links?.find(l => l.id === id);

  // Fetch vendor details if link has vendor_id
  const {
    data: vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useGetVendor(link?.vendor_id || "", !!link?.vendor_id);

  // Fetch product details if link has product_id
  const {
    product,
    productImage,
    isLoading: productLoading,
    error: productError,
  } = useProductDetail(link?.product_id || "");

  // Refetch link data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (affiliateId) {
        refetch();
      }
    }, [affiliateId, refetch])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing link:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Handle sharing referral link
  const handleShareLink = async (code: string) => {
    try {
      const referralUrl = `https://your-domain.com/v1/winga/link/${code}`;
      await Share.share({
        message: `Check out this amazing deal! ${referralUrl}`,
        url: referralUrl,
      });
    } catch (error) {
      console.error("Error sharing link:", error);
    }
  };

  // Handle copying referral link
  const handleCopyLink = async (code: string) => {
    try {
      const referralUrl = `https://your-domain.com/v1/winga/link/${code}`;
      Clipboard.setString(referralUrl);
      RNAlert.alert("Copied", "Referral link copied to clipboard!");
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  const getStatusVariant = (isActive: boolean): "default" | "outline" => {
    return isActive ? "outline" : "outline";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateConversionRate = () => {
    if (!link || link.clicks === 0) return 0;
    return ((link.orders / link.clicks) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            Loading link...
          </Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Link size={48} className="text-muted-foreground mb-4" />
          <Text className="text-muted-foreground">
            Loading referral link details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!link || isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            Link not found
          </Text>
          <View className="w-6" />
        </View>
        <View className="p-4">
          <Alert icon={Terminal} variant="destructive">
            <Text className="text-sm text-destructive">
              Failed to load referral link details. Please try again.
            </Text>
          </Alert>
          <Button
            variant="outline"
            onPress={() => router.back()}
            className="mt-4"
          >
            <Text>Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          Referral Link Details
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Link Header */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground mb-2">
                  {link.product_id ? "Product Referral Link" : "Store Referral Link"}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Created on {formatDate(link.created_at)}
                </Text>
              </View>
              <Badge variant={getStatusVariant(link.is_active)}>
                <Text className="text-sm">
                  {link.is_active ? "Active" : "Inactive"}
                </Text>
              </Badge>
            </View>

            <Separator className="mb-4" />

            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">
                Referral Code
              </Text>
              <Text className="text-base font-mono text-primary">
                {link.code}
              </Text>
            </View>
          </View>
        </Card>

        {/* Performance Overview */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <TrendingUp size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
              <Text className="text-lg font-semibold text-foreground ml-2">
                Performance Overview
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="items-center flex-1">
                <View className="flex-row items-center mb-2">
                  <Eye size={16} className="text-blue-600 mr-1" color={resolvedColors?.foreground || "#000000"} />
                  <Text className="text-sm text-muted-foreground ml-2">Total Clicks</Text>
                </View>
                <Text className="text-2xl font-bold text-blue-600 ml-2">{link.clicks}</Text>
              </View>
              <View className="items-center flex-1">
                <View className="flex-row items-center mb-2">
                  <ShoppingCart size={16} className="text-orange-600 mr-1" color={resolvedColors?.foreground || "#000000"} />
                  <Text className="text-sm text-muted-foreground ml-2">Orders</Text>
                </View>
                <Text className="text-2xl font-bold text-orange-600">{link.orders}</Text>
              </View>
              <View className="items-center flex-1">
                <View className="flex-row items-center mb-2">
                  <Banknote size={16} className="text-green-600 mr-1" color={resolvedColors?.foreground || "#000000"} />
                  <Text className="text-sm text-muted-foreground ml-2">Earnings</Text>
                </View>
                <Text className="text-2xl font-bold text-green-600">
                  TZS {link.total_commission.toLocaleString()}
                </Text>
              </View>
            </View>

            <Separator className="mb-4" />

            <View className="flex-row justify-between items-center">
              <Text className="text-muted-foreground">Conversion Rate:</Text>
              <Text className="text-lg font-semibold text-primary">
                {calculateConversionRate()}%
              </Text>
            </View>
          </View>
        </Card>

        {/* Vendor Details */}
        {(vendor || vendorLoading) && (
          <Card className="mb-6">
            <View className="p-4">
              <View className="flex-row items-center mb-4">
                <Store size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
                <Text className="text-lg font-semibold text-foreground pl-2">
                  Vendor Details
                </Text>
              </View>

              {vendorLoading ? (
                <View className="items-center justify-center py-8">
                  <Text className="text-muted-foreground">Loading vendor details...</Text>
                </View>
              ) : vendorError ? (
                <View className="items-center justify-center py-8">
                  <Text className="text-muted-foreground">Failed to load vendor details</Text>
                </View>
              ) : vendor ? (
                <View>

                  {/* Store Logo */}
                  {vendor.stores?.[0]?.branding?.logo_url ? (
                    <View className="mb-4 items-center">
                      <View className="w-20 h-20 rounded-lg border border-border overflow-hidden bg-muted">
                        <Image
                          source={{ uri: vendor.stores[0].branding.logo_url }}
                          className="w-full h-full"
                          resizeMode="contain"
                          onError={() => console.log('Error loading store logo')}
                        />
                      </View>
                    </View>
                  ) : (
                    <View className="mb-4 items-center">
                      <View className="w-20 h-20 rounded-lg border border-border overflow-hidden bg-muted items-center justify-center">
                        <Store size={24} className="text-muted-foreground" />
                      </View>
                      <Text className="text-sm text-muted-foreground mt-2">No Logo Available</Text>
                    </View>
                  )}

                  <View className="gap-3">
                    <View className="flex-row justify-between">
                      <Text className="text-muted-foreground">Store Name:</Text>
                      <Text className="text-foreground font-medium">
                        {vendor.stores?.[0]?.store_name || "N/A"}
                      </Text>
                    </View>

                    {vendor.stores?.[0]?.description && (
                      <>
                        <Separator />
                        <View>
                          <Text className="text-muted-foreground mb-2">
                            Store Description:
                          </Text>
                          <Text className="text-foreground">
                            {vendor.stores[0].description}
                          </Text>
                        </View>
                      </>
                    )}

                    {(vendor.contact_phone || vendor.contact_email) && (
                      <>
                        <Separator />
                        <View>
                          <Text className="text-muted-foreground mb-2">
                            Contact Details:
                          </Text>
                          {vendor.contact_phone && (
                            <View className="flex-row items-center gap-2 mb-1">
                              <Phone size={14} className="text-muted-foreground" color={resolvedColors?.foreground || "#000000"} />
                              <Text className="text-foreground">
                                {vendor.contact_phone}
                              </Text>
                            </View>
                          )}
                          {vendor.contact_email && (
                            <Text className="text-foreground">
                              {vendor.contact_email}
                            </Text>
                          )}
                        </View>
                      </>
                    )}

                    {(vendor.address_line1 || vendor.city || vendor.country) && (
                      <>
                        <Separator />
                        <View>
                          <Text className="text-muted-foreground mb-2">
                            Vendor Address:
                          </Text>
                          <View className="flex-row items-start gap-2">
                            <MapPin size={14} className="text-muted-foreground mt-1" color={resolvedColors?.foreground || "#000000"} />
                            <Text className="text-foreground flex-1">
                              {[vendor.address_line1, vendor.address_line2, vendor.city, vendor.state_province, vendor.country]
                                .filter(Boolean)
                                .join(", ")}
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              ) : null}
            </View>
          </Card>
        )}

        {/* Product Details */}
        {(product || productLoading) && (
          <Card className="mb-6">
            <View className="p-4">
              <View className="flex-row items-center mb-4">
                <ShoppingBag size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
                <Text className="text-lg font-semibold text-foreground pl-2">
                  Product Details
                </Text>
              </View>

              {productLoading ? (
                <View className="items-center justify-center py-8">
                  <Text className="text-muted-foreground">Loading product details...</Text>
                </View>
              ) : productError ? (
                <View className="items-center justify-center py-8">
                  <Text className="text-muted-foreground">Failed to load product details</Text>
                </View>
              ) : product ? (
                <View>

                  {/* Product Image */}
                  {(() => {
                    let imageUri: string | null = null;

                    if (productImage && typeof productImage === 'string') {
                      imageUri = productImage;
                    } else if (product.images && product.images.length > 0) {
                      const firstImage = product.images[0];
                      imageUri = typeof firstImage === 'string' ? firstImage : firstImage?.url || null;
                    }

                    return imageUri ? (
                      <View className="mb-4 items-center">
                        <View className="w-32 h-32 rounded-lg border border-border overflow-hidden bg-muted">
                          <Image
                            source={{ uri: imageUri }}
                            className="w-full h-full"
                            resizeMode="cover"
                            onError={() => console.log('Error loading product image')}
                          />
                        </View>
                      </View>
                    ) : (
                      <View className="mb-4 items-center">
                        <View className="w-32 h-32 rounded-lg border border-border overflow-hidden bg-muted items-center justify-center">
                          <ImageIcon size={32} className="text-muted-foreground" />
                        </View>
                        <Text className="text-sm text-muted-foreground mt-2">No Image Available</Text>
                      </View>
                    );
                  })()}

                  <View className="gap-3">
                    <View className="flex-row justify-between">
                      <Text className="text-muted-foreground">Product Name:</Text>
                      <Text className="text-foreground font-medium flex-1 text-right">
                        {product.name}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-muted-foreground">SKU:</Text>
                      <Text className="text-foreground font-mono text-sm">
                        {product.sku}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-muted-foreground">Price:</Text>
                      <Text className="text-foreground font-medium">
                        TZS {(product.sale_price || product.base_price)?.toLocaleString() || "0"}
                      </Text>
                    </View>



                    {product.description && (
                      <>
                        <Separator />
                        <View>
                          <Text className="text-muted-foreground mb-2">
                            Product Description:
                          </Text>
                          <Text className="text-foreground">
                            {product.description}
                          </Text>
                        </View>
                      </>
                    )}

                    {product.status && (
                      <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Status:</Text>
                        <Badge variant="outline" className="capitalize">
                          <Text className="text-sm">{product.status}</Text>
                        </Badge>
                      </View>
                    )}
                  </View>
                </View>
              ) : null}
            </View>
          </Card>
        )}

        {/* Link Information */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <Link size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
              <Text className="text-lg font-semibold text-foreground ml-2">
                Link Information
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Link Type:</Text>
                <Text className="text-foreground font-medium">
                  {link.product_id ? "Product Link" : "Store Link"}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Request ID:</Text>
                <Text className="text-foreground font-mono text-sm">
                  {link.request_id}
                </Text>
              </View>

              {link.expiry_date && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Expires:</Text>
                  <Text className="text-foreground">
                    {formatDate(link.expiry_date)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Link Timeline */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <Calendar size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
              <Text className="text-lg font-semibold text-foreground ml-2">
                Link Timeline
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Created:</Text>
                <Text className="text-foreground">
                  {formatDate(link.created_at)}
                </Text>
              </View>

              {link.updated_at && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Last Updated:</Text>
                  <Text className="text-foreground">
                    {formatDate(link.updated_at)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Affiliate Information */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <User size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
              <Text className="text-lg font-semibold text-foreground ml-2">
                Affiliate Information
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Affiliate ID:</Text>
                <Text className="text-foreground font-mono text-sm">
                  {link.affiliate_id}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Link ID:</Text>
                <Text className="text-foreground font-mono text-sm">
                  {link.id}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-border">
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 flex-row items-center justify-center"
            onPress={() => handleCopyLink(link.code)}
          >
            <Copy size={16} className="text-foreground mr-2" color={resolvedColors?.foreground || "#000000"} />
            <Text className="text-foreground ml-2">Copy Link</Text>
          </Button>
          <Button
            variant="primary"
            className="flex-1 flex-row items-center justify-center"
            onPress={() => handleShareLink(link.code)}
          >
            <ExternalLink size={16} className="text-foreground mr-2" color={resolvedColors?.foreground || "#000000"} />
            <Text className="text-foreground ml-2">Share Link</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
