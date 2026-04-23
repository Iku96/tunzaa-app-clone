import { useCallback } from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useGetOrder } from "@/services/order-management";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { VendorOrderDetails } from "@/components/orders/details/VendorOrderDetails";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const resolvedColors = useResolvedThemeColors();
  const isDesktop = width >= 1024;

  // API hook to fetch order details
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrder(id as string, !!id);

  // Refresh order when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
      }
    }, [id, refetch])
  );

  // Desktop Loading Skeleton
  const DesktopLoadingSkeleton = () => (
    <View className="p-6">
      {/* Two Column Layout Skeleton */}
      <View className="flex-row gap-6">
        {/* Left Column */}
        <View className="flex-1">
          {/* Status Banner Skeleton */}
          <Card className="mb-6 p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-muted" />
                <View>
                  <View className="h-5 w-32 bg-muted rounded mb-2" />
                  <View className="h-4 w-24 bg-muted rounded" />
                </View>
              </View>
              <View className="items-end">
                <View className="h-7 w-40 bg-muted rounded mb-2" />
                <View className="h-4 w-24 bg-muted rounded" />
              </View>
            </View>
          </Card>

          {/* Timeline Skeleton */}
          <Card className="mb-6 p-6">
            <View className="h-5 w-40 bg-muted rounded mb-4" />
            <View className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-muted" />
                  <View className="flex-1">
                    <View className="h-4 w-full bg-muted rounded mb-2" />
                    <View className="h-3 w-3/4 bg-muted rounded" />
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Items Skeleton */}
          <Card className="mb-6 p-6">
            <View className="h-5 w-32 bg-muted rounded mb-4" />
            {[1, 2, 3].map((i) => (
              <View key={i} className="flex-row items-center py-4">
                <View className="w-20 h-20 rounded-lg bg-muted mr-4" />
                <View className="flex-1">
                  <View className="h-4 w-full bg-muted rounded mb-2" />
                  <View className="h-3 w-2/3 bg-muted rounded mb-2" />
                  <View className="h-3 w-1/2 bg-muted rounded" />
                </View>
                <View className="h-5 w-24 bg-muted rounded" />
              </View>
            ))}
          </Card>
        </View>

        {/* Right Column */}
        <View className="w-96">
          {/* Actions Skeleton */}
          <Card className="mb-6 p-6">
            <View className="h-5 w-32 bg-muted rounded mb-4" />
            <View className="gap-3">
              <View className="h-11 w-full bg-muted rounded" />
              <View className="h-11 w-full bg-muted rounded" />
            </View>
          </Card>

          {/* Summary Skeleton */}
          <Card className="mb-6 p-6">
            <View className="h-5 w-40 bg-muted rounded mb-4" />
            <View className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="flex-row justify-between">
                  <View className="h-4 w-24 bg-muted rounded" />
                  <View className="h-4 w-32 bg-muted rounded" />
                </View>
              ))}
            </View>
          </Card>

          {/* Customer Details Skeleton */}
          <Card className="mb-6 p-6">
            <View className="h-5 w-40 bg-muted rounded mb-4" />
            <View className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} className="h-4 w-full bg-muted rounded" />
              ))}
            </View>
          </Card>

          {/* Payment Info Skeleton */}
          <Card className="mb-6 p-6">
            <View className="h-5 w-40 bg-muted rounded mb-4" />
            <View className="space-y-3">
              {[1, 2, 3].map((i) => (
                <View key={i} className="flex-row justify-between">
                  <View className="h-4 w-24 bg-muted rounded" />
                  <View className="h-4 w-32 bg-muted rounded" />
                </View>
              ))}
            </View>
          </Card>
        </View>
      </View>
    </View>
  );

  // Mobile Loading
  const MobileLoadingSkeleton = () => (
    <View className="p-4 space-y-4">
      <Card className="p-4">
        <View className="h-6 w-48 bg-muted rounded mb-2" />
        <View className="h-4 w-32 bg-muted rounded mb-4" />
        <View className="h-5 w-full bg-muted rounded" />
      </Card>
      
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <View className="h-5 w-40 bg-muted rounded mb-3" />
          <View className="space-y-2">
            <View className="h-4 w-full bg-muted rounded" />
            <View className="h-4 w-5/6 bg-muted rounded" />
            <View className="h-4 w-4/6 bg-muted rounded" />
          </View>
        </Card>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={isDesktop}
        containerClassName="bg-white"
      >
        <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
          {!isDesktop && (
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Button variant="ghost" size="icon" onPress={() => router.back()}>
                <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
              </Button>
              <Text className="text-lg font-semibold text-foreground">
                Loading...
              </Text>
              <View className="w-6" />
            </View>
          )}
          <ScrollView className="flex-1">
            {isDesktop ? <DesktopLoadingSkeleton /> : <MobileLoadingSkeleton />}
          </ScrollView>
        </SafeAreaView>
      </DesktopLayoutWrapper>
    );
  }

  if (error || !order || !user) {
    return (
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={isDesktop}
        containerClassName="bg-white"
      >
        <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
          {!isDesktop && (
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Button variant="ghost" size="icon" onPress={() => router.back()}>
                <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
              </Button>
              <Text className="text-lg font-semibold text-foreground">
                {error ? "Error" : "Order not found"}
              </Text>
              <View className="w-6" />
            </View>
          )}
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-destructive mb-4 text-center">
              {error ? "Failed to load order details. Please try again." : "Order not found"}
            </Text>
            <Button onPress={() => refetch()} variant="default" className="mb-3">
              <Text className="text-white font-semibold">Retry</Text>
            </Button>
            <Button onPress={() => router.back()} variant="outline">
              <Text className="font-semibold">Go Back</Text>
            </Button>
          </View>
        </SafeAreaView>
      </DesktopLayoutWrapper>
    );
  }

  const renderContent = () => {
    return <VendorOrderDetails order={order} onOrderUpdated={refetch} />;
  };

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={isDesktop}
      containerClassName="bg-white"
    >
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        {!isDesktop && (
          <View className="flex-row justify-between items-center p-4 border-b border-border">
            <Button variant="ghost" size="icon" onPress={() => router.back()}>
              <ArrowLeft size={24} className="text-foreground" color={resolvedColors.foreground} />
            </Button>
            <Text className="text-lg font-semibold text-foreground">
              Order Details
            </Text>
            <View className="w-6" />
          </View>
        )}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {isDesktop ? (
            <View className="flex-1 w-full">
              <View className="w-full">{renderContent()}</View>
            </View>
          ) : (
            <View className="p-4">{renderContent()}</View>
          )}
        </ScrollView>
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
}