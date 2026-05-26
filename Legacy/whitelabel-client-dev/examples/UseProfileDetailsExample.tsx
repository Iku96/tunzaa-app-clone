import React from "react";
import { View } from "react-native";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Example component demonstrating the useProfileDetails hook
 * This hook provides a clean interface to access profile details with built-in retry logic
 */
export const UseProfileDetailsExample = () => {
  const {
    vendorDetails,
    deliveryDetails,
    affiliateDetails,
    isLoading,
    hasErrors,
    errors,
  } = useProfileDetails();

  if (isLoading) {
    return (
      <View className="p-4 space-y-4">
        <Text className="text-lg font-semibold">
          Loading Profile Details...
        </Text>
        <View className="h-20 w-full bg-muted rounded-lg" />
        <View className="h-20 w-full bg-muted rounded-lg" />
        <View className="h-20 w-full bg-muted rounded-lg" />
      </View>
    );
  }

  return (
    <View className="p-4 space-y-4">
      <Text className="text-xl font-bold">Profile Details Hook Demo</Text>

      {hasErrors && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <Text className="text-destructive font-semibold mb-2">
            Errors occurred:
          </Text>
          {errors.vendor && (
            <Text className="text-destructive text-sm">
              Vendor: {errors.vendor}
            </Text>
          )}
          {errors.delivery && (
            <Text className="text-destructive text-sm">
              Delivery: {errors.delivery}
            </Text>
          )}
          {errors.affiliate && (
            <Text className="text-destructive text-sm">
              Affiliate: {errors.affiliate}
            </Text>
          )}
        </Card>
      )}

      {/* Vendor Details */}
      <Card className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold">Vendor Details</Text>
          <Badge variant={vendorDetails ? "default" : "secondary"}>
            {vendorDetails ? "Loaded" : "Not Available"}
          </Badge>
        </View>
        {vendorDetails ? (
          <View className="space-y-2">
            <Text className="font-medium">{vendorDetails.business_name}</Text>
            <Text className="text-sm text-muted-foreground">
              ID: {vendorDetails.vendor_id}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Stores: {vendorDetails.stores?.length || 0}
            </Text>
          </View>
        ) : (
          <Text className="text-muted-foreground">No vendor profile found</Text>
        )}
      </Card>

      {/* Delivery Details */}
      <Card className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold">Delivery Details</Text>
          <Badge variant={deliveryDetails ? "default" : "secondary"}>
            {deliveryDetails ? "Loaded" : "Not Available"}
          </Badge>
        </View>
        {deliveryDetails ? (
          <View className="space-y-2">
            <Text className="font-medium">{deliveryDetails.display_name}</Text>
            <Text className="text-sm text-muted-foreground">
              ID: {deliveryDetails.partner_id}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Type: {deliveryDetails.partner_type}
            </Text>
          </View>
        ) : (
          <Text className="text-muted-foreground">
            No delivery profile found
          </Text>
        )}
      </Card>

      {/* Affiliate Details */}
      <Card className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold">Affiliate Details</Text>
          <Badge variant={affiliateDetails ? "default" : "secondary"}>
            {affiliateDetails ? "Loaded" : "Not Available"}
          </Badge>
        </View>
        {affiliateDetails ? (
          <View className="space-y-2">
            <Text className="font-medium">{affiliateDetails.display_name}</Text>
            <Text className="text-sm text-muted-foreground">
              ID: {affiliateDetails.affiliate_id}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Status: {affiliateDetails.status}
            </Text>
          </View>
        ) : (
          <Text className="text-muted-foreground">
            No affiliate profile found
          </Text>
        )}
      </Card>

      <Card className="p-4 bg-muted">
        <Text className="text-sm font-semibold mb-2">Hook Features:</Text>
        <View className="space-y-1">
          <Text className="text-xs text-muted-foreground">
            ✓ Automatic retry with exponential backoff
          </Text>
          <Text className="text-xs text-muted-foreground">
            ✓ Falls back to context data when available
          </Text>
          <Text className="text-xs text-muted-foreground">
            ✓ Built-in error handling and loading states
          </Text>
          <Text className="text-xs text-muted-foreground">
            ✓ React Query caching and invalidation
          </Text>
          <Text className="text-xs text-muted-foreground">
            ✓ Conditional fetching based on profiles
          </Text>
        </View>
      </Card>
    </View>
  );
};
