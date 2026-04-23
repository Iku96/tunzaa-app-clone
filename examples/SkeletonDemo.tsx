import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import {
  Skeleton,
  ProductTileSkeleton,
  CategoryTileSkeleton,
  ShopTileSkeleton,
  CartItemSkeleton,
  SearchPageSkeleton,
  BuyerHomeSkeleton,
  OrderCardSkeleton,
  OrdersListSkeleton,
  OrderDetailsSkeleton,
  ProductDetailsSkeleton,
  CategoriesPageSkeleton,
  StoreDetailsSkeleton,
  StorePageSkeleton,
} from "@/components/ui/skeleton";

export default function SkeletonDemo() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold mb-6">Skeleton Loading Demo</Text>

        {/* Basic Skeleton */}
        <Text className="text-lg font-semibold mb-3">Basic Skeleton</Text>
        <View className="mb-6">
          <Skeleton height={20} style={{ marginBottom: 8 }} />
          <Skeleton height={16} width="70%" style={{ marginBottom: 8 }} />
          <Skeleton height={14} width="40%" />
        </View>

        {/* Product Tile Skeleton */}
        <Text className="text-lg font-semibold mb-3">
          Product Tile Skeleton
        </Text>
        <View className="flex-row gap-3 mb-6">
          <View style={{ width: 140 }}>
            <ProductTileSkeleton />
          </View>
          <View style={{ width: 140 }}>
            <ProductTileSkeleton variant="compact" />
          </View>
        </View>

        {/* Category Tile Skeleton */}
        <Text className="text-lg font-semibold mb-3">
          Category Tile Skeleton
        </Text>
        <View className="flex-row gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={{ width: 88 }}>
              <CategoryTileSkeleton />
            </View>
          ))}
        </View>

        {/* Shop Tile Skeleton */}
        <Text className="text-lg font-semibold mb-3">Shop Tile Skeleton</Text>
        <View className="flex-row gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={{ width: 80 }}>
              <ShopTileSkeleton />
            </View>
          ))}
        </View>

        {/* Cart Item Skeleton */}
        <Text className="text-lg font-semibold mb-3">Cart Item Skeleton</Text>
        <View className="mb-6">
          <CartItemSkeleton />
          <CartItemSkeleton />
        </View>

        {/* Search Page Skeleton */}
        <Text className="text-lg font-semibold mb-3">Search Page Skeleton</Text>
        <View className="border border-border rounded-lg p-4 mb-6">
          <SearchPageSkeleton />
        </View>

        {/* Order Card Skeleton */}
        <Text className="text-lg font-semibold mb-3">Order Card Skeleton</Text>
        <View className="mb-6">
          <OrderCardSkeleton />
        </View>

        {/* Orders List Skeleton */}
        <Text className="text-lg font-semibold mb-3">Orders List Skeleton</Text>
        <View className="border border-border rounded-lg overflow-hidden mb-6">
          <OrdersListSkeleton />
        </View>

        {/* Order Details Skeleton */}
        <Text className="text-lg font-semibold mb-3">
          Order Details Skeleton
        </Text>
        <View className="border border-border rounded-lg overflow-hidden mb-6">
          <OrderDetailsSkeleton />
        </View>

        {/* Product Details Skeleton */}
        <Text className="text-lg font-semibold mb-3">
          Product Details Skeleton
        </Text>
        <View className="border border-border rounded-lg overflow-hidden mb-6">
          <ProductDetailsSkeleton />
        </View>

        {/* Categories Page Skeleton */}
        <Text className="text-lg font-semibold mb-3">
          Categories Page Skeleton
        </Text>
        <View className="border border-border rounded-lg overflow-hidden mb-6">
          <CategoriesPageSkeleton />
        </View>

        {/* Store Details Skeleton */}
        <Text className="text-lg font-semibold mb-3">
          Store Details Skeleton
        </Text>
        <View className="border border-border rounded-lg overflow-hidden mb-6">
          <StoreDetailsSkeleton />
        </View>

        {/* Complete Store Page Skeleton */}
        <Text className="text-lg font-semibold mb-3">
          Complete Store Page Skeleton
        </Text>
        <View className="border border-border rounded-lg overflow-hidden mb-6">
          <StorePageSkeleton />
        </View>

        {/* Full Home Skeleton */}
        <Text className="text-lg font-semibold mb-3">Buyer Home Skeleton</Text>
        <View className="border border-border rounded-lg overflow-hidden">
          <BuyerHomeSkeleton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
