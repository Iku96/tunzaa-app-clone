import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Heart, Share2, Users } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/share-button";
import { useShopById } from "@/stores/shops";
import StoreDetailsView from "@/features/store/components/StoreDetails";
import { useCreateVendorRequest } from "@/src/services/affiliates";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { API_CONFIG } from "@/src/services/config";



export default function StoreDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  const resolvedThemeColors = useResolvedThemeColors();

  // Get affiliate details
  const { affiliateDetails } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  // Vendor request mutation
  const createVendorRequest = useCreateVendorRequest();

  // Fetch shop details using React Query
  const { data: shop, isLoading: shopLoading } = useShopById(id as string);

  // Generate share URL
  const getShareUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : API_CONFIG.APP_URL;
    return `${baseUrl}/stores/${id}`;
  };

  const handleVendorRequest = () => {
    if (!affiliateId) {
      Alert.alert("Error", "Please complete your affiliate profile first");
      return;
    }

    if (!shop) {
      Alert.alert("Error", "Shop details not available");
      return;
    }

    Alert.prompt(
      "Request Partnership",
      `Send a partnership request to ${shop.store_name}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: (message) => {
            if (message) {
              createVendorRequest.mutate(
                {
                  affiliate_id: affiliateId,
                  vendor_id: shop.vendor_id,
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

  if (shopLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text>Loading store details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
        <View className="flex-1 items-center justify-center">
          <Text>Store not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "right", "left"]}>
      <View className="flex-row items-center justify-between p-4">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <ArrowLeft size={24} className="text-foreground" color={resolvedThemeColors.foreground} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">
          {shop.store_name}
        </Text>
        {/* <View className="flex-row gap-4">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              size={24}
              className={
                isFavorite ? "text-red-500 fill-red-500" : "text-foreground"
              }
            />
          </Button>
          <ShareButton
            url={getShareUrl()}
            title={`Check out ${shop.store_name}`}
            message={`I found this amazing store: ${shop.store_name}`}
            variant="ghost"
            size="icon"
            iconClassName="text-foreground"
          />
        </View> */}
      </View>

      <StoreDetailsView shop={shop} />

      {/* Request Partnership Button */}
      <View className="p-4 border-t border-border">
        {/* <Button
          variant="outline"
          className="w-full flex-row items-center justify-center"
          onPress={handleVendorRequest}
          disabled={createVendorRequest.isPending}
        >
          <Users size={20} className=" mr-2" color={resolvedThemeColors.foreground} />
          <Text className="text-foreground font-semibold ml-2">
            {createVendorRequest.isPending
              ? "Sending Request..."
              : "Request Partnership"}
          </Text>
        </Button> */}
      </View>
    </SafeAreaView>
  );
}
