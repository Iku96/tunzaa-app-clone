import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert as RNAlert,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  Link,
  ExternalLink,
  Eye,
  ShoppingCart,
  Banknote,
  Copy,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react-native";
import { useGetAffiliateLinks, useGetAffiliateRequests } from "@/src/services/affiliates";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReferralLinkResponse, AffiliateRequestResponse } from "@/src/services/types/affiliates";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import {
  useThemeColors,
  useResolvedThemeColors,
  useBrandStyles,
} from "@/hooks/useThemeColors";

const PartnershipsScreen = () => {
  const [currentTab, setCurrentTab] = useState("links");
  const [linksRefreshing, setLinksRefreshing] = useState(false);
  const [requestsRefreshing, setRequestsRefreshing] = useState(false);

  // Get affiliate details
  const { affiliateDetails } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  // Theme hooks
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();
  const brandStyles = useBrandStyles();

  // API hooks
  const {
    data: linksData,
    isLoading: isLinksLoading,
    error: linksError,
    refetch: refetchLinks,
    isFetching: isLinksFetching,
  } = useGetAffiliateLinks(
    affiliateId || "",
    { skip: 0, limit: 50 },
    !!affiliateId
  );

  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    error: requestsError,
    refetch: refetchRequests,
    isFetching: isRequestsFetching,
  } = useGetAffiliateRequests(
    {
      affiliate_id: affiliateId || "",
      skip: 0,
      limit: 50,
    },
    !!affiliateId
  );

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (affiliateId) {
        refetchLinks();
        refetchRequests();
      }
    }, [affiliateId, refetchLinks, refetchRequests])
  );

  // Handle pull-to-refresh for links
  const onRefreshLinks = useCallback(async () => {
    if (!affiliateId) return;
    setLinksRefreshing(true);
    try {
      await refetchLinks();
    } catch (error) {
      console.error("Error refreshing links:", error);
    } finally {
      setLinksRefreshing(false);
    }
  }, [refetchLinks, affiliateId]);

  // Handle pull-to-refresh for requests
  const onRefreshRequests = useCallback(async () => {
    if (!affiliateId) return;
    setRequestsRefreshing(true);
    try {
      await refetchRequests();
    } catch (error) {
      console.error("Error refreshing requests:", error);
    } finally {
      setRequestsRefreshing(false);
    }
  }, [refetchRequests, affiliateId]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!affiliateId) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4">
          <Text className="text-2xl font-bold text-foreground mb-4">
            Partnerships
          </Text>
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <Text className="text-destructive font-medium">
              Affiliate profile not found. Please ensure you're registered as an affiliate.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4 flex-1">
        <Text className="text-2xl font-bold text-foreground mb-4">
          Partnerships
        </Text>

        {/* Tab Buttons */}
        <View className="flex-row gap-2 mb-4">
          <Button
            variant={currentTab === "links" ? "default" : "outline"}
            onPress={() => setCurrentTab("links")}
            className="flex-1"
          >
            <View className="flex-row items-center gap-2">
              <Link size={16} className="text-current" color={resolvedColors?.foreground || "#000000"} />
              <Text className={currentTab === "links" ? "text-primary" : "text-foreground"}>
                Links ({linksData?.links?.length || 0})
              </Text>
            </View>
          </Button>
          <Button
            variant={currentTab === "requests" ? "default" : "outline"}
            onPress={() => setCurrentTab("requests")}
            className="flex-1"
          >
            <View className="flex-row items-center gap-2">
              <MessageSquare size={16} className="text-current" color={resolvedColors?.foreground || "#000000"} />
              <Text className={currentTab === "requests" ? "text-primary" : "text-foreground"}>
                Requests ({requestsData?.requests?.length || 0})
              </Text>
            </View>
          </Button>
        </View>

        {/* Links Tab */}
        {currentTab === "links" && (
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={linksRefreshing}
                onRefresh={onRefreshLinks}
              />
            }
          >
            {isLinksLoading ? (
              <View className="flex-1 items-center justify-center py-16">
                <Link size={48} className="text-muted-foreground mb-4" />
                <Text className="text-muted-foreground">Loading links...</Text>
              </View>
            ) : linksError ? (
              <Card className="p-4 bg-destructive/10 border-destructive/20">
                <Text className="text-destructive font-medium text-center">
                  Error loading links
                </Text>
              </Card>
            ) : !linksData?.links?.length ? (
              <View className="flex-1 items-center justify-center py-16">
                <Link size={64} className="text-muted-foreground mb-4" />
                <Text className="text-lg font-semibold text-foreground mb-2">No links found</Text>
                <Text className="text-muted-foreground text-center">
                  Create your first affiliate link to get started
                </Text>
              </View>
            ) : (
              <View className="gap-4 pb-6">
                {linksData.links.map((link: ReferralLinkResponse) => (
                  <TouchableOpacity
                    key={link.id}
                    onPress={() => router.push(`/(winga)/links/${link.id}`)}
                  >
                    <Card className="p-4 bg-card border-border">
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground mb-1">
                            {link.product_id ? "Product Link" : "Store Link"}
                          </Text>
                          <Text className="text-sm text-muted-foreground mb-1">
                            Code: {link.code}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            Created: {formatDate(link.created_at)}
                          </Text>
                        </View>
                        <Badge variant={link.is_active ? "default" : "outline"}>
                          <Text className="text-xs">
                            {link.is_active ? "Active" : "Inactive"}
                          </Text>
                        </Badge>
                      </View>

                      {/* Performance Metrics */}
                      <View className="border-t border-border pt-3 mb-3">
                        <View className="flex-row justify-between">
                          <View className="items-center">
                            <View className="flex-row items-center mb-1">
                              <Eye size={12} className="text-muted-foreground mr-1" color={resolvedColors?.foreground || "#000000"} />
                              <Text className="text-xs text-muted-foreground ml-2">Clicks</Text>
                            </View>
                            <Text className="text-sm font-semibold text-foreground">{link.clicks}</Text>
                          </View>
                          <View className="items-center">
                            <View className="flex-row items-center mb-1">
                              <ShoppingCart size={12} className="text-muted-foreground mr-1" color={resolvedColors?.foreground || "#000000"} />
                              <Text className="text-xs text-muted-foreground ml-2">Orders</Text>
                            </View>
                            <Text className="text-sm font-semibold text-foreground">{link.orders}</Text>
                          </View>
                          <View className="items-center">
                            <View className="flex-row items-center mb-1">
                              <Banknote size={12} className="text-muted-foreground mr-1" color={resolvedColors?.foreground || "#000000"} />
                              <Text className="text-xs text-muted-foreground ml-2">Earned</Text>
                            </View>
                            <Text className="text-sm font-semibold text-green-600">
                              TZS {link.total_commission.toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 flex-row items-center justify-center"
                          onPress={() => handleCopyLink(link.code)}
                        >
                          <Copy size={14} className="text-foreground mr-1" color={resolvedColors?.foreground || "#000000"} />
                          <Text className="text-xs ml-2">Copy</Text>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 flex-row items-center justify-center"
                          onPress={() => handleShareLink(link.code)}
                        >
                          <ExternalLink size={14} className="text-foreground mr-1" color={resolvedColors?.foreground || "#000000"} />
                          <Text className="text-xs ml-2">Share</Text>
                        </Button>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Requests Tab */}
        {currentTab === "requests" && (
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={requestsRefreshing}
                onRefresh={onRefreshRequests}
              />
            }
          >
            {isRequestsLoading ? (
              <View className="flex-1 items-center justify-center py-16">
                <Package size={48} className="text-muted-foreground mb-4" />
                <Text className="text-muted-foreground">Loading requests...</Text>
              </View>
            ) : requestsError ? (
              <Card className="p-4 bg-destructive/10 border-destructive/20">
                <Text className="text-destructive font-medium text-center">
                  Error loading requests
                </Text>
              </Card>
            ) : !requestsData?.requests?.length ? (
              <View className="flex-1 items-center justify-center py-16">
                <Package size={64} className="text-muted-foreground mb-4" />
                <Text className="text-lg font-semibold text-foreground mb-2">No requests found</Text>
                <Text className="text-muted-foreground text-center">
                  Start creating affiliate requests to see them here
                </Text>
              </View>
            ) : (
              <View className="gap-4 pb-6">
                {requestsData.requests.map((request: AffiliateRequestResponse) => (
                  <TouchableOpacity
                    key={request.id}
                    onPress={() => router.push(`/(winga)/links/requests/${request.id}`)}
                  >
                    <Card className="p-4 bg-card border-border">
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground mb-1">
                            {request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1)} Request
                          </Text>
                          <Text className="text-sm text-muted-foreground">
                            {formatDate(request.created_at)}
                          </Text>
                        </View>
                        <Badge
                          variant={
                            request.status === "pending" ? "primary" :
                              request.status === "approved" ? "outline" :
                                request.status === "rejected" ? "destructive" :
                                  "outline"
                          }
                        >
                          <View className="flex-row items-center">
                            {request.status === "pending" && <Clock size={12} className="text-current mr-1" color={resolvedColors?.foreground || "#000000"} />}
                            {request.status === "approved" && <CheckCircle2 size={12} className="text-current mr-1" color={resolvedColors?.foreground || "#000000"} />}
                            {request.status === "rejected" && <XCircle size={12} className="text-current mr-1" color={resolvedColors?.foreground || "#000000"} />}
                            <Text className="text-xs capitalize pl-2">
                              {request.status}
                            </Text>
                          </View>
                        </Badge>
                      </View>

                      <View className="border-t border-border pt-3">
                        <Text className="text-sm text-muted-foreground mb-3">
                          {request.message.length > 100
                            ? `${request.message.substring(0, 100)}...`
                            : request.message}
                        </Text>

                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Text className="text-xs text-muted-foreground mr-2">
                              Type:
                            </Text>
                            <Badge variant="outline">
                              <Text className="text-xs capitalize">
                                {request.request_type}
                              </Text>
                            </Badge>
                          </View>

                          <Text className="text-xs text-primary font-medium">
                            View Details →
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PartnershipsScreen;
