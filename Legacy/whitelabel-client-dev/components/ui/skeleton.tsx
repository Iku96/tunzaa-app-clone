import { useResponsive } from "@/hooks/useResponsive";
import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, ScrollView } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    
    // Cleanup function to stop animation when component unmounts
    return () => {
      animation.stop();
    };
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#E5E7EB",
          opacity,
        },
        style,
      ]}
    />
  );
};
// Product Tile Skeleton
export const ProductTileSkeleton: React.FC<{
  variant?: 'default' | 'compact';
}> = ({ variant = 'default' }) => {
  const imageHeight = variant === 'compact' ? 80 : 120;
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return (
      <View className="rounded-lg p-4 flex-row items-center">
        <Skeleton height={262} width={262} borderRadius={8} style={{ marginRight: 16 }} />
        <View className="flex-1">
          <Skeleton height={20} style={{ marginBottom: 8 }} />
          <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />
          <Skeleton height={24} width="40%" />
        </View>
      </View>
    );
  }

  return (
    <View className="bg-card rounded-lg p-3 shadow-sm">
      <Skeleton
        height={imageHeight}
        borderRadius={8}
        style={{ marginBottom: 8 }}
      />
      <Skeleton height={16} style={{ marginBottom: 4 }} />
      <Skeleton height={14} width="70%" style={{ marginBottom: 4 }} />
      <Skeleton height={18} width="50%" />
    </View>
  );
};
// Category Tile Skeleton
export const CategoryTileSkeleton: React.FC = () => {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return (
      <View className="items-center">
        <Skeleton
          height={230}
          width={230}
          borderRadius={115}
          style={{ marginBottom: 8 }}
        />
        <Skeleton height={12} width={60} />
      </View>
    );
  }

  return (
    <View className="items-center">
      <Skeleton
        height={64}
        width={64}
        borderRadius={32}
        style={{ marginBottom: 8 }}
      />
      <Skeleton height={12} width={60} />
    </View>
  );
};

// Shop Tile Skeleton
export const ShopTileSkeleton: React.FC = () => {
  return (
    <View className="items-center">
      <Skeleton
        height={64}
        width={64}
        borderRadius={32}
        style={{ marginBottom: 8 }}
      />
      <Skeleton height={12} width={50} style={{ marginBottom: 4 }} />
      <Skeleton height={10} width={40} />
    </View>
  );
};

// Cart Item Skeleton
export const CartItemSkeleton: React.FC = () => {
  return (
    <View className="flex-row p-4 border-b border-border">
      <Skeleton height={80} width={80} borderRadius={8} />
      <View className="flex-1 ml-4">
        <Skeleton height={16} style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="60%" style={{ marginBottom: 8 }} />
        <Skeleton height={18} width="40%" style={{ marginBottom: 12 }} />
        <View className="flex-row items-center justify-between">
          <Skeleton height={32} width={120} borderRadius={16} />
          <Skeleton height={24} width={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

// Search Page Skeleton
export const SearchPageSkeleton: React.FC = () => {
  return (
    <View className="px-4">
      {/* Categories section skeleton */}
      <Skeleton height={24} width="40%" style={{ marginBottom: 16 }} />
      <View className="flex-row flex-wrap gap-3 mb-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={index} className="w-[22%]">
            <CategoryTileSkeleton />
          </View>
        ))}
      </View>

      {/* Products section skeleton */}
      <Skeleton height={24} width="50%" style={{ marginBottom: 16 }} />
      <View className="flex-row flex-wrap justify-between">
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} className="w-[48%] mb-4">
            <ProductTileSkeleton />
          </View>
        ))}
      </View>
    </View>
  );
};

// Home Page Skeleton
export const BuyerHomeSkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Header skeleton */}
      <View className="p-4 flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Skeleton height={48} borderRadius={24} />
        </View>
        <Skeleton height={48} width={48} borderRadius={24} />
      </View>

      {/* Search bar skeleton */}
      <View className="mx-4 mb-4">
        <Skeleton height={48} borderRadius={8} />
      </View>

      {/* Content sections */}
      <View className="px-4">
        {/* Top Categories section */}
        <Skeleton height={20} width="40%" style={{ marginBottom: 16 }} />
        <View className="flex-row gap-3 mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={{ width: 88 }}>
              <CategoryTileSkeleton />
            </View>
          ))}
        </View>

        {/* Most visited shops section */}
        <Skeleton height={20} width="50%" style={{ marginBottom: 16 }} />
        <View className="flex-row gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} style={{ width: 80 }}>
              <ShopTileSkeleton />
            </View>
          ))}
        </View>

        {/* Trending Products section */}
        <Skeleton height={20} width="45%" style={{ marginBottom: 16 }} />
        <View className="flex-row gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={{ width: 140 }}>
              <ProductTileSkeleton />
            </View>
          ))}
        </View>

        {/* Category sections */}
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Skeleton height={20} width="35%" style={{ marginBottom: 16 }} />
            <View className="flex-row gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={{ width: 140 }}>
                  <ProductTileSkeleton variant="compact" />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Order Card Skeleton
export const OrderCardSkeleton: React.FC = () => {
  return (
    <View className="bg-card rounded-lg p-4 shadow-sm mb-4">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Skeleton height={18} width="60%" style={{ marginBottom: 8 }} />
          <Skeleton height={14} width="40%" />
        </View>
        <View className="items-end">
          <Skeleton
            height={24}
            width={80}
            borderRadius={12}
            style={{ marginBottom: 4 }}
          />
          <Skeleton height={16} width="50%" />
        </View>
      </View>

      <View className="border-t border-border pt-3">
        <Skeleton height={14} width="30%" style={{ marginBottom: 8 }} />
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Skeleton height={12} width={60} style={{ marginRight: 8 }} />
            <Skeleton height={20} width={50} borderRadius={10} />
          </View>
          <Skeleton height={12} width={80} />
        </View>
      </View>
    </View>
  );
};

// Orders List Skeleton
export const OrdersListSkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="p-4">
        <Skeleton height={32} width="40%" style={{ marginBottom: 24 }} />

        {/* Search and Filters */}
        <View className="gap-4 mb-6">
          <Skeleton height={48} borderRadius={8} />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Skeleton height={48} borderRadius={8} />
            </View>
            <View className="flex-1">
              <Skeleton height={48} borderRadius={8} />
            </View>
          </View>
        </View>
      </View>

      {/* Orders List */}
      <View className="px-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </View>
    </View>
  );
};

// Order Details Skeleton
export const OrderDetailsSkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="lg:hidden flex-row justify-between items-center p-4 border-b border-border">
        <Skeleton height={24} width={24} borderRadius={12} />
        <Skeleton height={20} width={120} />
        <View className="w-6" />
      </View>

      <View className="flex-1 p-4">
        {/* Order Header Card */}
        <View className="bg-card rounded-lg p-4 mb-6">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Skeleton height={24} width="70%" style={{ marginBottom: 8 }} />
              <Skeleton height={14} width="50%" />
            </View>
            <Skeleton height={28} width={80} borderRadius={14} />
          </View>

          <View className="border-t border-border pt-4">
            <View className="flex-row justify-between items-center">
              <Skeleton height={20} width={60} />
              <Skeleton height={24} width={120} />
            </View>
          </View>
        </View>

        {/* Order Items Card */}
        <View className="bg-card rounded-lg p-4 mb-6">
          <Skeleton height={20} width="40%" style={{ marginBottom: 16 }} />

          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index}>
              <View className="flex-row justify-between items-start py-3">
                <View className="flex-1 mr-4">
                  <Skeleton height={16} style={{ marginBottom: 4 }} />
                  <Skeleton
                    height={14}
                    width="60%"
                    style={{ marginBottom: 4 }}
                  />
                  <Skeleton height={14} width="40%" />
                </View>
                <View className="items-end">
                  <Skeleton
                    height={16}
                    width={80}
                    style={{ marginBottom: 4 }}
                  />
                  <Skeleton height={14} width={60} />
                </View>
              </View>
              {index < 2 && <View className="h-px bg-border my-2" />}
            </View>
          ))}
        </View>

        {/* Shipping Address Card */}
        <View className="bg-card rounded-lg p-4 mb-6">
          <Skeleton height={20} width="50%" style={{ marginBottom: 16 }} />
          <View className="gap-2">
            <Skeleton height={16} width="60%" />
            <Skeleton height={14} width="80%" />
            <Skeleton height={14} width="70%" />
            <Skeleton height={14} width="50%" />
            <View className="pt-2">
              <Skeleton height={14} width="40%" />
            </View>
          </View>
        </View>

        {/* Payment Details Card */}
        <View className="bg-card rounded-lg p-4 mb-6">
          <Skeleton height={20} width="60%" style={{ marginBottom: 16 }} />

          <View className="gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} className="flex-row justify-between">
                <Skeleton height={14} width="40%" />
                <Skeleton height={14} width="30%" />
              </View>
            ))}

            <View className="border-t border-border pt-3">
              <View className="flex-row justify-between">
                <Skeleton height={18} width={60} />
                <Skeleton height={18} width={100} />
              </View>
            </View>
          </View>
        </View>

        {/* Order Timeline Card */}
        <View className="bg-card rounded-lg p-4">
          <Skeleton height={20} width="50%" style={{ marginBottom: 16 }} />

          <View className="gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} className="flex-row justify-between">
                <Skeleton height={14} width="45%" />
                <Skeleton height={14} width="35%" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};


export const ProductDetailsSkeleton: React.FC = () => {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return (
      <View className="flex-row bg-background">
        {/* Product Image */}
        <View className="w-1/2 p-4">
          <Skeleton height="100%" width="100%" />
        </View>

        {/* Product Info Section */}
        <View className="w-1/2 p-4">
          {/* Product Title */}
          <Skeleton height={40} width="80%" style={{ marginBottom: 16 }} />
          <Skeleton height={24} width="60%" style={{ marginBottom: 20 }} />

          {/* Price and Quantity */}
          <View className="flex-row items-center mb-6">
            <Skeleton height={40} width={150} style={{ marginRight: 20 }} />
            <View className="flex-row items-center">
              <Skeleton height={32} width={100} borderRadius={16} />
            </View>
          </View>

          {/* Product Information */}
          <Skeleton height={24} width="50%" style={{ marginBottom: 16 }} />
          <View className="gap-2 mb-6">
            <Skeleton height={20} />
            <Skeleton height={20} width="90%" />
          </View>

          {/* Specifications */}
          <Skeleton height={24} width="60%" style={{ marginBottom: 16 }} />
          <View className="gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} className="flex-row justify-between">
                <Skeleton height={20} width="40%" />
                <Skeleton height={20} width="50%" />
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View className="flex-row gap-4">
            <Skeleton height={48} width="45%" borderRadius={8} />
            <Skeleton height={48} width="45%" borderRadius={8} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Product Images */}
        <View className="aspect-square bg-muted">
          <Skeleton height="100%" width="100%" />
        </View>

        {/* Product Info Section */}
        <View className="p-4">
          {/* Product Title */}
          <Skeleton height={28} style={{ marginBottom: 8 }} />
          <Skeleton height={20} width="70%" style={{ marginBottom: 12 }} />

          {/* Rating */}
          <View className="flex-row items-center mb-4">
            <Skeleton height={16} width={100} style={{ marginRight: 8 }} />
            <Skeleton height={16} width={80} />
          </View>

          {/* Price */}
          <View className="flex-row items-center mb-6">
            <Skeleton height={32} width={120} style={{ marginRight: 12 }} />
            <Skeleton height={20} width={80} />
          </View>

          {/* Product Details */}
          <Skeleton height={20} width="30%" style={{ marginBottom: 12 }} />
          <View className="gap-2 mb-6">
            <Skeleton height={16} />
            <Skeleton height={16} width="90%" />
            <Skeleton height={16} width="80%" />
            <Skeleton height={16} width="95%" />
          </View>

          {/* Specifications */}
          <Skeleton height={20} width="40%" style={{ marginBottom: 12 }} />
          <View className="gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} className="flex-row justify-between">
                <Skeleton height={16} width="35%" />
                <Skeleton height={16} width="45%" />
              </View>
            ))}
          </View>

          {/* Quantity Selector */}
          <Skeleton height={20} width="25%" style={{ marginBottom: 12 }} />
          <View className="flex-row items-center mb-6">
            <Skeleton height={40} width={120} borderRadius={20} />
          </View>
        </View>

        {/* Nearby Products Section */}
        <View className="px-4 pb-6">
          <Skeleton height={24} width="50%" style={{ marginBottom: 16 }} />
          <View className="flex-row gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={{ width: 140 }}>
                <ProductTileSkeleton variant="compact" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="p-4 border-t border-border bg-background">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Skeleton height={48} borderRadius={8} />
          </View>
          <View className="flex-1">
            <Skeleton height={48} borderRadius={8} />
          </View>
        </View>
      </View>
    </View>
  );
};

// Categories Page Skeleton
export const CategoriesPageSkeleton: React.FC = () => {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return null
  }
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Skeleton height={24} width={24} borderRadius={12} />
        <Skeleton height={20} width={120} />
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        {/* Category Header Section */}
        <View className="p-4">
          {/* Category Image */}
          <View className="aspect-video bg-muted rounded-lg mb-4">
            <Skeleton height="100%" width="100%" borderRadius={8} />
          </View>

          {/* Category Name */}
          <Skeleton height={32} width="60%" style={{ marginBottom: 8 }} />

          {/* Category Description */}
          <View className="gap-2 mb-6">
            <Skeleton height={16} />
            <Skeleton height={16} width="90%" />
            <Skeleton height={16} width="70%" />
          </View>

          {/* Subcategories Section */}
          <Skeleton height={20} width="40%" style={{ marginBottom: 12 }} />
          <View className="flex-row flex-wrap gap-2 mb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                height={32}
                width={Math.random() * 40 + 80} // Random width between 80-120
                borderRadius={16}
              />
            ))}
          </View>
        </View>

        {/* Products Section */}
        <View className="px-4 pb-6">
          <Skeleton height={24} width="35%" style={{ marginBottom: 16 }} />

          {/* Product Grid */}
          <View className="flex-row flex-wrap justify-between">
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} className="w-[48%] mb-4">
                <ProductTileSkeleton />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Store Details Skeleton
export const StoreDetailsSkeleton: React.FC = () => {
  return (
    <ScrollView className="flex-1">
      {/* Store Banners */}
      <View className="px-4 w-full">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16 }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={160} width={320} borderRadius={8} />
          ))}
        </ScrollView>
      </View>

      {/* Store Description */}
      <View className="p-4">
        <View className="gap-2">
          <Skeleton height={16} />
          <Skeleton height={16} width="90%" />
          <Skeleton height={16} width="75%" />
        </View>
      </View>

      {/* Search and Filter Section */}
      <View className="flex-row p-4 gap-3">
        <View className="flex-1">
          <Skeleton height={48} borderRadius={12} />
        </View>
        <Skeleton height={48} width={48} borderRadius={12} />
      </View>

      {/* Categories */}
      <View className="px-4 pb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              height={32}
              width={Math.random() * 30 + 60} // Random width between 60-90
              borderRadius={16}
            />
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <View className="p-4">
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 8 }).map((_, index) => (
            <View key={index} className="w-[48%] mb-4">
              <ProductTileSkeleton />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// Complete Store Page Skeleton (with header)
export const StorePageSkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Skeleton height={24} width={24} borderRadius={12} />
        <Skeleton height={20} width={120} />
        <View className="w-6" />
      </View>

      {/* Store Info Header */}
      <View className="p-4">
        <View className="flex-row items-start gap-4">
          {/* Store Logo */}
          <Skeleton height={80} width={80} borderRadius={40} />

          {/* Store Info */}
          <View className="flex-1">
            <Skeleton height={24} width="70%" style={{ marginBottom: 8 }} />
            <Skeleton height={16} width="50%" style={{ marginBottom: 4 }} />
            <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />

            {/* Rating and Reviews */}
            <View className="flex-row items-center gap-2">
              <Skeleton height={16} width={80} />
              <Skeleton height={16} width={60} />
            </View>
          </View>
        </View>
      </View>

      {/* Store Content */}
      <StoreDetailsSkeleton />
    </View>
  );
};
