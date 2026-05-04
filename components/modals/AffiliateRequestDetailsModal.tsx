import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Store, 
  Package, 
  MessageSquare,
  Calendar,
  Percent,
  Mail,
  Phone,
  Globe,
  Instagram,
  Twitter,
  Facebook
} from "lucide-react-native";
import { AffiliateRequestResponse } from "@/src/services/types/affiliates";
import { useApproveRequest, useRejectRequest, useGetAffiliate } from "@/src/services/affiliates";
import { useGetProduct, ProductResponse } from "@/src/services/product-management";

interface AffiliateRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AffiliateRequestResponse | null;
  onRequestUpdate?: () => void;
}

export function AffiliateRequestDetailsModal({
  isOpen,
  onClose,
  request,
  onRequestUpdate,
}: AffiliateRequestDetailsModalProps) {
  const colors = useResolvedThemeColors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"approve" | "reject" | null>(null);

  const approveRequestMutation = useApproveRequest();
  const rejectRequestMutation = useRejectRequest();
  
  // Fetch affiliate details
  const {
    data: affiliateData,
    isLoading: isAffiliateLoading,
    error: affiliateError,
  } = useGetAffiliate(request?.affiliate_id || "", !!request?.affiliate_id);
  
  // Fetch product details if this is a product request
  const {
    data: productData,
    isLoading: isProductLoading,
    error: productError,
  } = useGetProduct(request?.product_id || "", !!request?.product_id);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle size={20} color={colors?.success || "#10b981"} />;
      case "rejected":
        return <XCircle size={20} color={colors?.destructive || "#ef4444"} />;
      case "pending":
        return <Clock size={20} color={colors?.warning || "#f59e0b"} />;
      default:
        return <Clock size={20} color={colors?.mutedForeground || "#6b7280"} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-400 text-green-800";
      case "rejected":
        return "bg-red-400 text-red-800";
      case "pending":
        return "bg-yellow-400 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const handleApprove = async () => {
    if (!request) return;

    setIsSubmitting(true);
    setSubmitAction("approve");
    try {
      const genericMessage = request.request_type === "vendor" 
        ? "Your store partnership request has been approved. Welcome to our affiliate program!"
        : "Your product partnership request has been approved. You can now promote this product!";
        
      await approveRequestMutation.mutateAsync({
        requestId: request.id,
        data: { response_message: genericMessage }
      });
      
      onRequestUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setIsSubmitting(false);
      setSubmitAction(null);
    }
  };

  const handleReject = async () => {
    if (!request) return;

    setIsSubmitting(true);
    setSubmitAction("reject");
    try {
      const genericMessage = request.request_type === "vendor"
        ? "Thank you for your interest in our affiliate program. We are not accepting new store partnerships at this time."
        : "Thank you for your interest in promoting this product. We are not accepting new product partnerships at this time.";
        
      await rejectRequestMutation.mutateAsync({
        requestId: request.id,
        data: { response_message: genericMessage }
      });
      
      onRequestUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setIsSubmitting(false);
      setSubmitAction(null);
    }
  };

  const handleClose = () => {
    setSubmitAction(null);
    onClose();
  };

  if (!request) return null;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="Request Details"
      snapPoints={["50%", "85%", "95%"]}
      enableScrolling={false}
      fitContent={false}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="p-4 gap-4">
          {/* Header with Status */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">
                {request.request_type === "vendor"
                  ? "Store Partnership Request"
                  : "Product Partnership Request"}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Request ID: {request.id.slice(0, 8)}...
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {getStatusIcon(request.status)}
              <Badge className={getStatusColor(request.status)}>
                <Text className="text-xs font-semibold capitalize">
                  {request.status}
                </Text>
              </Badge>
            </View>
          </View>

          <Separator />

          {/* Request Information */}
          <Card className="p-4">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Request Information
            </Text>
            
            <View className="gap-3">
              {/* Affiliate Details Section */}
              {isAffiliateLoading ? (
                <View className="h-20 justify-center items-center">
                  <Text className="text-sm text-muted-foreground">
                    Loading affiliate details...
                  </Text>
                </View>
              ) : affiliateError ? (
                <View className="h-20 justify-center items-center">
                  <Text className="text-sm text-destructive">
                    Failed to load affiliate details
                  </Text>
                </View>
              ) : affiliateData ? (
                <AffiliateDetailsSection affiliate={affiliateData} />
              ) : (
                <View className="flex-row items-center gap-3">
                  <User size={16} className="text-muted-foreground" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">
                      Affiliate ID
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {request.affiliate_id}
                    </Text>
                  </View>
                </View>
              )}

              {request.commission_rate && (
                <View className="flex-row items-center gap-3">
                  <Percent size={16} className="text-muted-foreground" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">
                      Proposed Commission Rate
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {request.commission_rate}%
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Product Details Card (if product request) */}
          {request.product_id && (
            <Card className="p-4">
              <View className="flex-row items-center gap-2 mb-3">
                <Package size={16} className="text-muted-foreground" />
                <Text className="text-lg font-semibold text-foreground">
                  Product Details
                </Text>
              </View>
              
              {isProductLoading ? (
                <View className="h-20 justify-center items-center">
                  <Text className="text-sm text-muted-foreground">
                    Loading product details...
                  </Text>
                </View>
              ) : productError ? (
                <View className="h-20 justify-center items-center">
                  <Text className="text-sm text-destructive">
                    Failed to load product details
                  </Text>
                </View>
              ) : productData ? (
                <ProductDetailsCard product={productData} />
              ) : (
                <View className="h-20 justify-center items-center">
                  <Text className="text-sm text-muted-foreground">
                    Product not found
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Request Message */}
          <Card className="p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <MessageSquare size={16} className="text-muted-foreground" />
              <Text className="text-lg font-semibold text-foreground">
                Request Message
              </Text>
            </View>
            <Text className="text-sm text-foreground leading-5">
              {request.message}
            </Text>
          </Card>

          {/* Response Message (if exists) */}
          {request.response_message && (
            <Card className="p-4">
              <Text className="text-lg font-semibold text-foreground mb-3">
                Your Response
              </Text>
              <Text className="text-sm text-foreground leading-5">
                {request.response_message}
              </Text>
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Calendar size={16} className="text-muted-foreground" />
              <Text className="text-lg font-semibold text-foreground">
                Timeline
              </Text>
            </View>
            
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm font-medium text-foreground">
                  Request Created
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {formatDate(request.created_at)}
                </Text>
              </View>
              
              {request.responded_at && (
                <View className="flex-row justify-between">
                  <Text className="text-sm font-medium text-foreground">
                    Response Sent
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {formatDate(request.responded_at)}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Action Section for Pending Requests */}
          {request.status === "pending" && (
            <Card className="p-4">
              <Text className="text-lg font-semibold text-foreground mb-3">
                Take Action
              </Text>
              
              <View className="flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onPress={handleReject}
                  disabled={isSubmitting}
                >
                  <Text className="text-destructive font-semibold">
                    {isSubmitting && submitAction === "reject" ? "Rejecting..." : "Reject"}
                  </Text>
                </Button>
                <Button 
                  className="flex-1"
                  onPress={handleApprove}
                  disabled={isSubmitting}
                >
                  <Text className="text-white font-semibold">
                    {isSubmitting && submitAction === "approve" ? "Approving..." : "Approve"}
                  </Text>
                </Button>
              </View>
            </Card>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ResponsiveModal>
  );
}

// Affiliate Details Section Component
interface AffiliateDetailsSectionProps {
  affiliate: import("@/src/services/types/affiliates").AffiliateResponse;
}

function AffiliateDetailsSection({ affiliate }: AffiliateDetailsSectionProps) {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return Instagram;
      case "twitter":
        return Twitter;
      case "facebook":
        return Facebook;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-400 text-green-800";
      case "inactive":
        return "bg-red-400 text-red-800";
      case "pending":
        return "bg-yellow-400 text-yellow-800";
      default:
        return "bg-gray-400 text-gray-800";
    }
  };

  return (
    <View className="gap-3">
      {/* Basic Info */}
      <View className="flex-row items-center gap-3">
        <User size={16} className="text-muted-foreground" />
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground">
            Affiliate Name
          </Text>
          <Text className="text-sm text-muted-foreground">
            {affiliate.name}
          </Text>
        </View>
        <Badge className={getStatusColor(affiliate.status)}>
          <Text className="text-xs font-semibold capitalize">
            {affiliate.status}
          </Text>
        </Badge>
      </View>

      {/* Email */}
      <View className="flex-row items-center gap-3">
        <Mail size={16} className="text-muted-foreground" />
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground">
            Email
          </Text>
          <Text className="text-sm text-muted-foreground">
            {affiliate.email}
          </Text>
        </View>
      </View>

      {/* Phone */}
      {affiliate.phone && (
        <View className="flex-row items-center gap-3">
          <Phone size={16} className="text-muted-foreground" />
          <View className="flex-1">
            <Text className="text-sm font-medium text-foreground">
              Phone
            </Text>
            <Text className="text-sm text-muted-foreground">
              {affiliate.phone}
            </Text>
          </View>
        </View>
      )}

      {/* Website */}
      {affiliate.website && (
        <View className="flex-row items-center gap-3">
          <Globe size={16} className="text-muted-foreground" />
          <View className="flex-1">
            <Text className="text-sm font-medium text-foreground">
              Website
            </Text>
            <Text className="text-sm text-muted-foreground">
              {affiliate.website}
            </Text>
          </View>
        </View>
      )}

      {/* Bio */}
      {affiliate.bio && (
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">
            About
          </Text>
          <Text className="text-sm text-muted-foreground leading-5">
            {affiliate.bio}
          </Text>
        </View>
      )}

      {/* Social Media */}
      {affiliate.social_media && (
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">
            Social Media
          </Text>
          <View className="flex-row gap-3">
            {Object.entries(affiliate.social_media).map(([platform, handle]) => {
              if (!handle) return null;
              const IconComponent = getSocialIcon(platform);
              if (!IconComponent) return null;
              
              return (
                <View key={platform} className="flex-row items-center gap-2">
                  <IconComponent size={14} className="text-muted-foreground" />
                  <Text className="text-sm text-muted-foreground">
                    {handle}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

// Product Details Card Component
interface ProductDetailsCardProps {
  product: ProductResponse;
}

function ProductDetailsCard({ product }: ProductDetailsCardProps) {
  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      // Find primary image or use first image
      const primaryImage = product.images.find(img => img.is_primary);
      return primaryImage?.url || product.images[0]?.url || null;
    }
    return null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const productImage = getProductImage();

  return (
    <View className="flex-row gap-3">
      {/* Product Image */}
      <View className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
        {productImage ? (
          <Image
            source={{ uri: productImage }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Package size={24} className="text-muted-foreground" />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground mb-1" numberOfLines={2}>
          {product.name}
        </Text>
        
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-sm font-bold text-foreground">
            {formatPrice(product.sale_price || product.base_price)}
          </Text>
          {product.sale_price && product.sale_price < product.base_price && (
            <Text className="text-xs text-muted-foreground line-through">
              {formatPrice(product.base_price)}
            </Text>
          )}
        </View>

        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-muted-foreground">SKU:</Text>
            <Text className="text-xs text-foreground">{product.sku}</Text>
          </View>
          
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-muted-foreground">Stock:</Text>
            <Text className="text-xs text-foreground">{product.inventory_quantity}</Text>
          </View>
        </View>

        {!product.is_active && (
          <Badge variant="destructive" className="self-start mt-1">
            <Text className="text-xs">Inactive</Text>
          </Badge>
        )}
      </View>
    </View>
  );
}