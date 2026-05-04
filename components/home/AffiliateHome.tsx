import { useState } from "react";
import { View, ScrollView, Alert, Share } from "react-native";
import {
  MapPin,
  Search,
  ArrowRight,
  X,
  Users,
  MessageSquare,
  ExternalLink,
  TrendingUp,
  Banknote,
  Eye,
  ShoppingCart,
  Link,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { NotificationIcon } from "@/components/NotificationIcon";
import { ProductTile } from "@/components/products/ProductTile";
import { CategoryTile } from "@/components/categories/CategoryTile";
import { ShopTile } from "@/components/shop/ShopTile";
import { useProducts } from "@/stores/products";
import { useCategories } from "@/stores/categories";
import { useShops } from "@/stores/shops";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import {
  useGetAffiliateStats,
  useGetAffiliateLinks,
  useGetAffiliateRequests,
  useCreateVendorRequest,
  useCreateProductRequest,
} from "@/src/services/affiliates";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
export function AffiliateHome() {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState(
    "Dar es Salaam, Tanzania"
  );
  const resolvedColors = useResolvedThemeColors();
  // Get affiliate details
  const { affiliateDetails } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  // Affiliate-specific data
  const { data: affiliateStats, isLoading: statsLoading } = useGetAffiliateStats(
    affiliateId || "",
    !!affiliateId
  );

  const { data: affiliateLinks, isLoading: linksLoading } = useGetAffiliateLinks(
    affiliateId || "",
    { limit: 5 },
    !!affiliateId
  );

  const { data: affiliateRequests, isLoading: requestsLoading } = useGetAffiliateRequests(
    { affiliate_id: affiliateId || "", limit: 5 },
    !!affiliateId
  );

  // Mutations
  const createVendorRequest = useCreateVendorRequest();
  const createProductRequest = useCreateProductRequest();

  // Marketplace data for discovery
  const { data: productsData, isLoading: productsLoading } = useProducts({
    is_featured: true,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  });
  const { data: shopsData, isLoading: shopsLoading } = useShops();

  const handleSearchPress = () => {
    router.push({
      pathname: "/search",
      params: { focus: "true" },
    });
  };

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
                  message: message,
                  request_type: "vendor",
                },
                {
                  onSuccess: () => {
                    Alert.alert(
                      "Success",
                      "Partnership request sent successfully!"
                    );
                  },
                  onError: () => {
                    Alert.alert("Error", "Failed to send partnership request");
                  },
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

  const handleProductRequest = (productId: string, productName: string, vendorId: string) => {
    if (!affiliateId) {
      Alert.alert("Error", "Please complete your affiliate profile first");
      return;
    }

    Alert.prompt(
      "Request Product Partnership",
      `Send a partnership request for ${productName}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: (message) => {
            if (message) {
              createProductRequest.mutate(
                {
                  affiliate_id: affiliateId,
                  vendor_id: vendorId,
                  product_id: productId,
                  message: message,
                  request_type: "product",
                },
                {
                  onSuccess: () => {
                    Alert.alert(
                      "Success",
                      "Product partnership request sent successfully!"
                    );
                  },
                  onError: () => {
                    Alert.alert("Error", "Failed to send product partnership request");
                  },
                }
              );
            }
          },
        },
      ],
      "plain-text",
      "",
      "Enter your message about this product"
    );
  };

  const handleShareLink = async (code: string) => {
    try {
      const referralUrl = `https://your-domain.com/v1/winga/link/${code}`;
      await Share.share({
        message: `Check out this amazing deal! ${referralUrl}`,
        url: referralUrl,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share referral link");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-400 text-green-800';
      case 'pending':
        return 'bg-yellow-400 text-yellow-800';
      case 'rejected':
        return 'bg-red-400 text-red-800';
      default:
        return 'bg-gray-400 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle size={14} className="text-green-600" color={resolvedColors?.foreground || "#000000"} />;
      case 'pending':
        return <Clock size={14} className="text-yellow-600" color={resolvedColors?.foreground || "#000000"} />;
      case 'rejected':
        return <XCircle size={14} className="text-red-600" color={resolvedColors?.foreground || "#000000"} />;
      default:
        return <Clock size={14} className="text-gray-600" color={resolvedColors?.foreground || "#000000"} />;
    }
  };

  // Get data from React Query
  const trendingProducts = productsData?.items || [];
  const shops = shopsData?.items || [];

  return (
    <View className="flex-1 bg-muted">
      <View className="p-4 flex-row items-center justify-between">
        <Text className="text-base text-2xl font-bold">Affiliate Dashboard</Text>
        <NotificationIcon />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Affiliate Stats Overview */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold mb-4">Your Performance</Text>
          <View className="flex-row gap-3 mb-4">
            <Card className="flex-1 p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Banknote size={16} className="text-green-600" color={resolvedColors?.primary || "#000000"} />
                <Text className="text-sm font-medium">Earnings</Text>
              </View>
              <Text className="text-xl font-bold text-foreground">
                TZS {affiliateStats?.total_earnings?.toLocaleString() || "0"}
              </Text>
            </Card>
            <Card className="flex-1 p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-green-600" color={resolvedColors?.primary || "#000000"} />
                <Text className="text-sm font-medium">Conversion</Text>
              </View>
              <Text className="text-xl font-bold text-foreground">
                {affiliateStats?.conversion_rate?.toFixed(1) || "0.0"}%
              </Text>
            </Card>
          </View>
          <View className="flex-row gap-3">
            <Card className="flex-1 p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Eye size={16} className="text-green-600" color={resolvedColors?.primary || "#000000"} />
                <Text className="text-sm font-medium">Clicks</Text>
              </View>
              <Text className="text-xl font-bold text-foreground">
                {affiliateStats?.clicks || 0}
              </Text>
            </Card>
            <Card className="flex-1 p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <ShoppingCart size={16} className="text-orange-600" color={resolvedColors?.primary || "#000000"} />
                <Text className="text-sm font-medium">Orders</Text>
              </View>
              <Text className="text-xl font-bold text-foreground">
                {affiliateStats?.orders || 0}
              </Text>
            </Card>
          </View>
        </View>

        {/* Recent Referral Links */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold">Your Referral Links</Text>
            <Button
              size="sm"
              variant="outline"
              onPress={() => router.push("/(winga)/links")}
            >
              <Text className="text-sm">View All</Text>
            </Button>
          </View>
          {affiliateLinks?.links?.slice(0, 3).map((link) => (
            <Card key={link.id} className="p-3 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-medium mb-1">
                    {link.product_id ? "Product Link" : "Store Link"}
                  </Text>
                  <Text className="text-sm text-muted-foreground mb-2">
                    Code: {link.code}
                  </Text>
                  <View className="flex-row gap-4">
                    <Text className="text-xs text-muted-foreground">
                      {link.clicks} clicks
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {link.orders} orders
                    </Text>
                    <Text className="text-xs text-green-600">
                      TZS {link.total_commission.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => handleShareLink(link.code)}
                >
                  <ExternalLink size={16} className="text-foreground" color={resolvedColors?.primary || "#000000"} />
                </Button>
              </View>
            </Card>
          ))}
          {(!affiliateLinks?.links || affiliateLinks.links.length === 0) && (
            <Card className="p-4">
              <Text className="text-center text-muted-foreground">
                No referral links yet. Request partnerships to start earning!
              </Text>
            </Card>
          )}
        </View>

        {/* Recent Partnership Requests */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold">Recent Requests</Text>
            <Button
              size="sm"
              variant="outline"
              onPress={() => router.push("/(winga)/links")}
            >
              <Text className="text-sm">View All</Text>
            </Button>
          </View>
          {affiliateRequests?.requests?.slice(0, 3).map((request) => (
            <Card key={request.id} className="p-3 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-medium mb-1">
                    {request.request_type === "vendor" ? "Store Partnership" : "Product Partnership"}
                  </Text>
                  <Text className="text-sm text-muted-foreground mb-2">
                    {request.message}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  {getStatusIcon(request.status)}
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </View>
              </View>
            </Card>
          ))}
          {(!affiliateRequests?.requests || affiliateRequests.requests.length === 0) && (
            <Card className="p-4">
              <Text className="text-center text-muted-foreground">
                No partnership requests yet. Start requesting partnerships below!
              </Text>
            </Card>
          )}
        </View>

        {/* Discover Partnerships */}
        <View className="pl-4 mb-6">
          <Text className="text-lg font-bold mb-4">Discover Partnerships</Text>

          {/* Popular Stores */}
          <View className="mb-6">
            <Text className="text-base font-medium mb-3">Popular Stores</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16 }}
            >
              {shops.slice(0, 10).map((shop) => (
                <View key={shop.store_id} style={{ width: 120 }}>
                  <ShopTile
                    id={shop.store_id}
                    name={shop.store_name}
                    logo={shop.branding.logo_url}
                    delivery="By 5:50am"
                    badge={shop.is_featured ? "Featured" : undefined}
                  />
                  {/* <Button
                    size="sm"
                    className="mt-2 bg-primary"
                    onPress={() =>
                      handleVendorRequest(shop.vendor_id, shop.store_name)
                    }
                    disabled={createVendorRequest.isPending}
                  >
                    <View className="flex-row items-center gap-1">
                      <Users size={14}  color={resolvedColors?.primary || "#000000"} />
                      <Text className="text-primary text-xs font-semibold">
                        {createVendorRequest.isPending ? "Sending..." : "Partner"}
                      </Text>
                    </View>
                  </Button> */}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Trending Products */}
          <View className="mb-6">
            <Text className="text-base font-medium mb-3">Trending Products</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {trendingProducts.slice(0, 10).map((product) => (
                <View key={product.product_id} style={{ width: 140 }}>
                  <ProductTile product={product} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onPress={() =>
                      handleProductRequest(
                        product.product_id,
                        product.name,
                        product.vendor_id
                      )
                    }
                    disabled={createProductRequest.isPending}
                  >
                    <View className="flex-row items-center gap-1">
                      <Link size={12} className="text-foreground" color={resolvedColors?.primary || "#000000"} />
                      <Text className="text-xs font-semibold ml-2">
                        {createProductRequest.isPending ? "Sending..." : "Request"}
                      </Text>
                    </View>
                  </Button>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
