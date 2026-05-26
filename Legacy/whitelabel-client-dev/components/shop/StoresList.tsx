import React, { useState } from "react";
import { View, FlatList, RefreshControl, Alert, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Search, Filter, Users, Link } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShopTile } from "@/components/shop/ShopTile";
import { ShopTileSkeleton } from "@/components/ui/skeleton";
import { useShops } from "@/stores/shops";
import { useI18n } from "@/hooks/useI18n";
import { useCreateVendorRequest } from "@/services/affiliates";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

interface StoresListProps {
  mode?: "buyer" | "affiliate";
  title?: string;
  showHeader?: boolean;
  showBackButton?: boolean;
  onStorePress?: (store: any) => void;
}

export function StoresList({
  mode = "buyer",
  title = "Stores",
  showHeader = true,
  showBackButton = true,
  onStorePress,
}: StoresListProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const resolvedColors = useResolvedThemeColors();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024; // desktop breakpoint
  const numColumns = isDesktop ? 4 : 3;
  const tileWidth = isDesktop ? "23%" : "31%"; // width for each tile

  // Affiliate-specific hooks
  const { affiliateDetails } = useProfileDetails();
  const createVendorRequest = useCreateVendorRequest();
  const affiliateId = affiliateDetails?.id;

  // Fetch stores data
  const { data: storesData, isLoading, error, refetch } = useShops(
    filterFeatured ? { is_active: true, vendor_verification_status: "approved", is_vendor_active: true, verification_status: "approved", is_featured: true } : { is_active: true, vendor_verification_status: "approved", is_vendor_active: true, verification_status: "approved" }
  );

  const stores = storesData?.items || [];

  // Filter stores based on search query
  const filteredStores = stores.filter((store) =>
    store.store_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error("Failed to refresh stores:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Vendor partnership request (affiliate mode)
  const handleVendorRequest = (vendorId: string, vendorName: string) => {
    if (!affiliateId) {
      Alert.alert("Error", "Please complete your affiliate profile first");
      return;
    }

    Alert.prompt(
      "Request Partnership",
      `Send a partnership request to ${vendorName}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: (message) => {
            if (message) {
              createVendorRequest.mutate(
                {
                  affiliate_id: affiliateId,
                  vendor_id: vendorId,
                  message,
                  request_type: "vendor",
                },
                {
                  onSuccess: () => Alert.alert("Success", "Partnership request sent successfully!"),
                  onError: () => Alert.alert("Error", "Failed to send partnership request"),
                }
              );
            }
          },
        },
      ],
      "plain-text",
      "",
      "Enter your message to the vendor"
    );
  };

  const renderStoreItem = ({ item }: { item: any }) => (
    <View style={{ width: tileWidth, marginBottom: 16 }}>
      <ShopTile
        id={item.store_id}
        name={item.store_name}
        logo={item.branding.logo_url}
        badge={item.is_featured ? "Featured" : undefined}
        delivery=""
        size={isDesktop ? "large" : "default"} // bigger tiles on desktop
      />
      {mode === "affiliate" && (
        <Button
          size="sm"
          className="mt-2 bg-primary"
          onPress={() => handleVendorRequest(item.vendor_id, item.store_name)}
          disabled={createVendorRequest.isPending}
        >
          <View className="flex-row items-center gap-1">
            <Users size={12} className="text-white" />
            <Text className="text-white text-xs font-semibold">
              {createVendorRequest.isPending ? "Sending..." : "Partner"}
            </Text>
          </View>
        </Button>
      )}
    </View>
  );

  const renderSkeleton = () => (
    <View className="flex-row flex-wrap justify-between px-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <View key={index} style={{ width: tileWidth, marginBottom: 16 }}>
          <ShopTileSkeleton />
        </View>
      ))}
    </View>
  );

  const renderHeader = () => (
    <View className="px-4 pb-4">
      {showFilters && (
        <View className="bg-card border border-input rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium">Filters</Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {
                setFilterFeatured(false);
                setSearchQuery("");
              }}
            >
              <Text className="text-sm text-muted-foreground">Clear All</Text>
            </Button>
          </View>
          <View className="flex-row gap-2">
            <Button
              variant={filterFeatured ? "default" : "outline"}
              size="sm"
              onPress={() => setFilterFeatured(!filterFeatured)}
            >
              <Text className={filterFeatured ? "text-primary-foreground" : "text-foreground"}>
                Featured Only
              </Text>
            </Button>
          </View>
        </View>
      )}

      <View className="flex-row items-center justify-between mb-4 mt-4">
        <Text className="text-sm text-muted-foreground">
          {filteredStores.length} {filteredStores.length === 1 ? "store" : "stores"}
        </Text>
      </View>

      {mode === "affiliate" && (
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <Text className="text-sm text-blue-800">
            <Link size={14} className="text-blue-600" /> Request partnerships with stores to start earning commissions
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-8">
      <Text className="text-muted-foreground text-center mb-2">
        {searchQuery ? `No stores found for "${searchQuery}"` : "No stores available"}
      </Text>
      {searchQuery && (
        <Button variant="outline" size="sm" onPress={() => setSearchQuery("")}>
          <Text>Clear Search</Text>
        </Button>
      )}
    </View>
  );

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-destructive text-center mb-4">Failed to load stores. Please try again.</Text>
        <Button variant="outline" onPress={() => refetch()}>
          <Text>Retry</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1">
          {showHeader && renderHeader()}
          {renderSkeleton()}
        </View>
      ) : (
        <FlatList
          data={filteredStores}
          renderItem={renderStoreItem}
          keyExtractor={(item) => item.store_id}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListHeaderComponent={showHeader ? renderHeader : undefined}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={resolvedColors?.foreground || "#000000"}
              title="Pull to refresh"
              titleColor={resolvedColors?.foreground || "#000000"}
            />
          }
        />
      )}
    </View>
  );
}
