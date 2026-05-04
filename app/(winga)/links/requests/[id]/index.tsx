import React, { useCallback, useState } from "react";
import { View, ScrollView, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  AlertCircle,
  MessageSquare,
  User,
  Store,
  ShoppingBag,
  Image as ImageIcon,
} from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useGetRequestDetails, useCreateReferralLink } from "@/src/services/affiliates";
import { useGetVendor } from "@/src/services/vendors";
import { useProductDetail } from "@/hooks/useProductDetails";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Terminal } from "@/lib/icons/Terminal";
import { getImageUrl } from "@/utils/images";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const resolvedColors = useResolvedThemeColors();
  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRequestDetails(id as string, !!id);

  // Fetch vendor details if request has vendor_id
  const {
    data: vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useGetVendor(request?.vendor_id || "", !!request?.vendor_id);

  // Fetch product details if request has product_id
  const {
    product,
    productImage,
    isLoading: productLoading,
    error: productError,
  } = useProductDetail(request?.product_id || "");

  // Create referral link mutation
  const createReferralLinkMutation = useCreateReferralLink();
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Handle creating referral link
  const handleCreateReferralLink = async () => {
    if (!request?.id) return;

    try {
      const linkResponse = await createReferralLinkMutation.mutateAsync(request.id);
      setGeneratedLink(linkResponse.code);
    } catch (error) {
      console.error("Failed to create referral link:", error);
    }
  };

  // Refetch request data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
      }
    }, [id, refetch])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing request:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const getStatusVariant = (
    status: string
  ): "default" | "primary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "approved":
        return "outline"; // Green
      case "pending":
        return "primary"; // Gray/Blue
      case "rejected":
        return "destructive"; // Red
      default:
        return "outline";
    }
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            Loading request...
          </Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Package size={48} className="text-muted-foreground mb-4" />
          <Text className="text-muted-foreground">
            Loading request details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!request || isError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            Request not found
          </Text>
          <View className="w-6" />
        </View>
        <View className="p-4">
          <Alert icon={Terminal} variant="destructive">
            <Text className="text-sm text-destructive">
              Failed to load request details. Please try again.
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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          Request Details
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Request Header */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">
                  {request.request_type.charAt(0).toUpperCase() +
                    request.request_type.slice(1)}{" "}
                  Request
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Created on {formatDate(request.created_at)}
                </Text>
              </View>
              <Badge variant={getStatusVariant(request.status)}>
                <Text className="text-sm capitalize">{request.status}</Text>
              </Badge>
            </View>

          </View>
        </Card>

        {/* Status Alert */}
        {request.status === "pending" && (
          <Card className="mb-6 border-warning">
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                <AlertCircle size={20} className="text-warning mr-2" />
                <Text className="text-lg font-semibold text-warning pl-2">
                  Request Pending
                </Text>
              </View>

              <Text className="text-muted-foreground">
                Your request is waiting for approval from the vendor. You will
                be notified once they respond.
              </Text>
            </View>
          </Card>
        )}

        {request.status === "rejected" && request.response_message && (
          <Card className="mb-6 border-destructive">
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                <AlertCircle size={20} className="text-destructive mr-2" />
                <Text className="text-lg font-semibold text-destructive">
                  Request Rejected
                </Text>
              </View>

              <Text className="text-muted-foreground mb-2">
                Unfortunately, your request was rejected:
              </Text>
              <Text className="text-foreground font-medium">
                "{request.response_message}"
              </Text>
            </View>
          </Card>
        )}

        {request.status === "approved" && (
          <Card className="mb-6 border-success">
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                <Package size={20} className="text-success mr-2" color={resolvedColors?.primary || "#000000"} />
                <Text className="text-lg font-semibold text-success ml-2">
                  Request Approved
                </Text>
              </View>

              <Text className="text-muted-foreground">
                Congratulations! Your request has been approved. You can now
                start promoting and earning commissions.
              </Text>
              {request.response_message && (
                <Text className="text-foreground font-medium mt-2">
                  "{request.response_message}"
                </Text>
              )}
            </View>
          </Card>
        )}

        {/* Request Details */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <MessageSquare size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
              <Text className="text-lg font-semibold text-foreground pl-2">
                Request Information
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Request Type:</Text>
                <Text className="text-foreground capitalize font-medium">
                  {request.request_type}
                </Text>
              </View>

              {request.commission_rate && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Commission Rate:</Text>
                  <Text className="text-foreground font-medium">
                    {request.commission_rate}%
                  </Text>
                </View>
              )}

              <Separator />

              <View>
                <Text className="text-muted-foreground mb-2">
                  Your Message:
                </Text>
                <Text className="text-foreground">"{request.message}"</Text>
              </View>

              {request.response_message && (
                <>
                  <Separator />
                  <View>
                    <Text className="text-muted-foreground mb-2">
                      Vendor Response:
                    </Text>
                    <Text className="text-foreground">
                      "{request.response_message}"
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </Card>

        {/* Vendor Details */}
        {vendor && (
          <Card className="mb-6">
            <View className="p-4">
              <View className="flex-row items-center mb-4">
                <Store size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
                <Text className="text-lg font-semibold text-foreground pl-2">
                  Vendor Details
                </Text>
              </View>

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
                          <Phone size={14} className="text-muted-foreground" />
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
                        <MapPin size={14} className="text-muted-foreground mt-1" />
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
          </Card>
        )}

        {/* Product Details */}
        {product && (
          <Card className="mb-6">
            <View className="p-4">
              <View className="flex-row items-center mb-4">
                <ShoppingBag size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
                <Text className="text-lg font-semibold text-foreground pl-2">
                  Product Details
                </Text>
              </View>

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



                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Featured:</Text>
                  <Badge variant={product.is_featured ? "primary" : "outline"}>
                    <Text className="text-sm">{product.is_featured ? "Yes" : "No"}</Text>
                  </Badge>
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
          </Card>
        )}

        {/* Request Timeline */}
        <Card className="mb-6">
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <Calendar size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
              <Text className="text-lg font-semibold text-foreground pl-2">
                Request Timeline
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Request Created:</Text>
                <Text className="text-foreground">
                  {formatDate(request.created_at)}
                </Text>
              </View>

              {request.updated_at && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Last Updated:</Text>
                  <Text className="text-foreground">
                    {formatDate(request.updated_at)}
                  </Text>
                </View>
              )}

              {request.responded_at && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Response Date:</Text>
                  <Text className="text-foreground">
                    {formatDate(request.responded_at)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>



        {/* Next Steps for Approved Requests */}
        {request.status === "approved" && (
          <Card className="mb-6 border-primary">
            <View className="p-4">
              <Text className="text-lg font-semibold text-foreground mb-3">
                Next Steps
              </Text>
              <Text className="text-muted-foreground mb-4">
                Your partnership request has been approved! You can now:
              </Text>
              <View className="gap-2">
                <Text className="text-sm text-foreground">
                  • Generate your referral link for this partnership
                </Text>
                <Text className="text-sm text-foreground">
                  • Start sharing your referral links to earn commissions
                </Text>
                <Text className="text-sm text-foreground">
                  • Track your performance and earnings
                </Text>
              </View>

              {/* Generate Referral Link Button */}
              {!generatedLink && (
                <Button
                  variant="primary"
                  className="mt-4"
                  onPress={handleCreateReferralLink}
                  disabled={createReferralLinkMutation.isPending}
                >
                  <Text className="text-foreground">
                    {createReferralLinkMutation.isPending ? "Generating..." : "Generate Referral Link"}
                  </Text>
                </Button>
              )}

              {/* Show generated link */}
              {generatedLink && (
                <View className="mt-4 p-3 bg-muted rounded-lg">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Your Referral Link Generated!
                  </Text>
                  <Text className="text-sm text-muted-foreground mb-2">
                    Referral Code: {generatedLink}
                  </Text>
                  <View className="flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onPress={() => router.push("/(winga)/links")}
                    >
                      <Text className="text-foreground">View All Links</Text>
                    </Button>
                  </View>
                </View>
              )}

              {/* Show error if link generation failed */}
              {createReferralLinkMutation.isError && (
                <Alert icon={AlertCircle} className="mt-4">
                  <Text className="text-sm text-destructive">
                    Failed to generate referral link. Please try again.
                  </Text>
                </Alert>
              )}

              {/* View My Links button - shown by default or after link generation */}
              {!generatedLink && (
                <Button
                  variant="outline"
                  className="mt-2"
                  onPress={() => router.push("/(winga)/links")}
                >
                  <Text className="text-foreground">View My Links</Text>
                </Button>
              )}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 