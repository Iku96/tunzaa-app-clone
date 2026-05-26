import { useState, useEffect } from "react";
import { View, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2, UserCheck } from "lucide-react-native";
import { useProductById, useProducts } from "@/stores/products";
import { useCreateProductRequest } from "@/services/affiliates";
import { useAuth } from "@/context/auth";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Terminal } from "@/lib/icons/Terminal";
import ProductDetails from "@/features/products/components/ProductDetails";
import NearbyProducts from "@/features/products/components/NearbyProducts";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessIndicator, setShowSuccessIndicator] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const { user } = useAuth();
  const resolvedColors = useResolvedThemeColors();
  // Get affiliate details
  const { affiliateDetails } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  // Animation for success indicator
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  // Use React Query hooks
  const { data: product, isLoading: productLoading } = useProductById(
    id as string
  );
  const { data: productsData } = useProducts({
    category_id: product?.category_ids[0],
    limit: 6,
    is_active: true,
    verification_status: "approved",
    is_vendor_active: true,
  });

  // Use affiliate request mutation
  const createProductRequest = useCreateProductRequest();

  const nearbyProducts =
    product && productsData?.items
      ? productsData.items.filter((p) => p.product_id !== id)
      : [];

  // Animate success indicator
  useEffect(() => {
    if (showSuccessIndicator) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setShowSuccessIndicator(false));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessIndicator, fadeAnim, scaleAnim]);

  if (!product && !productLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            Product not found
          </Text>
          <View className="w-6" />
        </View>
      </SafeAreaView>
    );
  }

  const handleQuantityChange = (delta: number) => {
    // Keep this function for ProductDetails component compatibility
    // but it won't be used for purchasing
  };

  const handleRequestAffiliation = async () => {
    if (!product || !affiliateId) {
      setError(
        "Unable to request affiliation. Please complete your affiliate profile first."
      );
      return;
    }

    try {
      setError(null);
      setShowRequestDialog(false);

      await createProductRequest.mutateAsync({
        affiliate_id: affiliateId,
        vendor_id: product.vendor_id,
        product_id: product.product_id,
        message: `Request for affiliation with product: ${product.name}`,
        request_type: "product",
      });

      // Show success indicator
      setShowSuccessIndicator(true);
    } catch (error) {
      console.error("Failed to request affiliation:", error);
      setError("Failed to request affiliation. Please try again.");
    }
  };

  if (productLoading || !product) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-row items-center justify-between p-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            Loading...
          </Text>
          <View className="w-6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedColors?.foreground || "#000000"} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          Product Details
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        {error && (
          <View className="p-4">
            <Alert icon={Terminal} variant="destructive">
              <Text className="text-sm text-destructive">{error}</Text>
            </Alert>
          </View>
        )}

        {createProductRequest.error && (
          <View className="p-4">
            <Alert icon={Terminal} variant="default">
              <Text className="text-sm text-muted-foreground">
                Request failed. Please try again.
              </Text>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onPress={() => setShowRequestDialog(true)}
              >
                <Text className="text-sm">Retry</Text>
              </Button>
            </Alert>
          </View>
        )}

        <ProductDetails
          product={product}
          quantity={quantity}
          handleQuantityChange={handleQuantityChange}
          handleAddToCart={() => {}}
          handleBuyNow={() => {}}
        />


      </ScrollView>

      {/* Request Affiliation Button */}
      <View className="p-4 border-t border-border">
        <Button
          variant="primary"
          className="w-full flex-row"
          onPress={() => setShowRequestDialog(true)}
          disabled={createProductRequest.isPending}
        >
          <UserCheck size={20} className="text-primary mr-2" color={resolvedColors?.primary || "#000000"} />
          <Text className="text-foreground font-semibold ml-4">
            {createProductRequest.isPending
              ? "Requesting..."
              : "Request Affiliation"}
          </Text>
        </Button>
      </View>

      {/* Request Confirmation Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Product Affiliation</DialogTitle>
            <DialogDescription>
              Are you sure you want to request affiliation with "{product.name}
              "? This will send a request to the vendor for approval.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onPress={() => setShowRequestDialog(false)}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="primary"
              onPress={handleRequestAffiliation}
              disabled={createProductRequest.isPending}
            >
              <Text className="text-foreground">
                {createProductRequest.isPending
                  ? "Requesting..."
                  : "Confirm Request"}
              </Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success indicator overlay */}
      {showSuccessIndicator && (
        <Animated.View
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 1000,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View className="bg-success rounded-full px-6 py-3 flex-row items-center shadow-lg">
            <CheckCircle2 size={20} className="text-white mr-2" />
            <Text className="text-white font-semibold pl-2">
              Affiliation requested!
            </Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
