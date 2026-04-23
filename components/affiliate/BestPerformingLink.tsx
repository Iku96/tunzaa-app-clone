import React from "react";
import { View, TouchableOpacity } from "react-native";
import {
  TrendingUp,
  ExternalLink,
  Copy,
  Users,
  ShoppingCart,
  Eye,
} from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BestPerformingLinkProps {
  className?: string;
}

export const BestPerformingLink: React.FC<BestPerformingLinkProps> = ({
  className,
}) => {
  // Mock data - to be replaced with API data later
  const bestLink = {
    id: "link-123",
    title: "Premium Wireless Headphones",
    url: "https://marketplace.com/ref/affiliate123/headphones",
    shortUrl: "mkt.ly/aff123hp",
    earnings: 1250.75,
    clicks: 342,
    conversions: 28,
    conversionRate: 8.2,
    revenue: 15259.5,
    commission: 8.2, // percentage
    product: {
      name: "Sony WH-1000XM5 Wireless Headphones",
      price: 545.5,
      vendor: "TechStore Pro",
    },
    performance: "+23.5%", // compared to last period
    isTopPerformer: true,
  };

  const handleCopyLink = () => {
    // Copy to clipboard functionality to be implemented
    // console.log("Copy link:", bestLink.shortUrl);
  };

  const handleViewDetails = () => {
    // Navigate to detailed link analytics
    // console.log("View details for:", bestLink.id);
  };

  const formatCurrency = (amount: number) => {
    return `TShs ${amount.toLocaleString()}`;
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <TrendingUp size={20} className="text-success mr-2" />
          <Text className="text-lg font-semibold text-foreground">
            Best Performing Link
          </Text>
        </View>
        {bestLink.isTopPerformer && (
          <Badge variant="default" className="bg-success">
            <Text className="text-xs text-success-foreground">
              🏆 Top Performer
            </Text>
          </Badge>
        )}
      </View>

      {/* Product Info */}
      <View className="mb-4">
        <Text className="text-base font-semibold text-foreground mb-1">
          {bestLink.product.name}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {bestLink.product.vendor} • {formatCurrency(bestLink.product.price)}
        </Text>
      </View>

      {/* Earnings Highlight */}
      <View className="bg-success/10 rounded-lg p-4 mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm text-muted-foreground">Total Earnings</Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-success mr-1">
              {bestLink.performance}
            </Text>
            <TrendingUp size={12} className="text-success" />
          </View>
        </View>
        <Text className="text-2xl font-bold text-success">
          {formatCurrency(bestLink.earnings)}
        </Text>
        <Text className="text-xs text-muted-foreground mt-1">
          {bestLink.commission}% commission rate
        </Text>
      </View>

      {/* Performance Metrics */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-1">
            <Eye size={14} className="text-primary mr-1" />
            <Text className="text-xs text-muted-foreground">Clicks</Text>
          </View>
          <Text className="text-lg font-semibold text-foreground">
            {bestLink.clicks.toLocaleString()}
          </Text>
        </View>

        <Separator orientation="vertical" className="mx-3" />

        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-1">
            <ShoppingCart size={14} className="text-success mr-1" />
            <Text className="text-xs text-muted-foreground">Sales</Text>
          </View>
          <Text className="text-lg font-semibold text-foreground">
            {bestLink.conversions}
          </Text>
        </View>

        <Separator orientation="vertical" className="mx-3" />

        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-1">
            <TrendingUp size={14} className="text-warning mr-1" />
            <Text className="text-xs text-muted-foreground">Rate</Text>
          </View>
          <Text className="text-lg font-semibold text-foreground">
            {bestLink.conversionRate}%
          </Text>
        </View>
      </View>

      {/* Link Section */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">
          Affiliate Link
        </Text>
        <View className="flex-row items-center justify-between bg-muted rounded-lg p-3">
          <Text
            className="text-sm text-muted-foreground flex-1"
            numberOfLines={1}
          >
            {bestLink.shortUrl}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleCopyLink}
            className="ml-2"
          >
            <Copy size={16} className="text-primary" />
          </Button>
        </View>
      </View>

      {/* Revenue Breakdown */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">
          Revenue Impact
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-muted-foreground">
            Total Revenue Generated
          </Text>
          <Text className="text-sm font-semibold text-foreground">
            {formatCurrency(bestLink.revenue)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm text-muted-foreground">
            Your Commission ({bestLink.commission}%)
          </Text>
          <Text className="text-sm font-semibold text-success">
            {formatCurrency(bestLink.earnings)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <Button
          variant="outline"
          onPress={handleViewDetails}
          className="flex-1"
        >
          <Text className="text-primary">View Analytics</Text>
        </Button>
        <Button variant="default" onPress={handleCopyLink} className="flex-1">
          <View className="flex-row items-center justify-center">
            <ExternalLink size={16} className="text-primary-foreground mr-2" />
            <Text className="text-primary-foreground">Share Link</Text>
          </View>
        </Button>
      </View>
    </Card>
  );
};
