import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

interface ShopTileProps {
  id: string;
  name: string;
  logo: string;
  badge?: string;
  delivery?: string;
  showStoreCount?: boolean;
  storeCount?: number;
  size?: "default" | "large"; // optional size prop
}

export function ShopTile({
  id,
  name,
  logo,
  badge,
  delivery,
  showStoreCount,
  storeCount,
  size = "default", // default size
}: ShopTileProps) {
  const router = useRouter();

  const handlePress = () => {
    if (showStoreCount) {
      router.push("/stores" as any);
      return;
    }
    router.push(`/stores/${id}` as any);
  };

  // Set tile and image dimensions based on size
  const tileSize = size === "large" ? 120 : 88;
  const imageSize = size === "large" ? 100 : 64;

  return (
    <View className="items-center">
      <Card
        className="rounded-full border-0"
        style={{ width: tileSize, height: tileSize }}
      >
        <TouchableOpacity
          className="items-center justify-center py-3 px-2 h-full"
          onPress={handlePress}
        >
          <View className="items-center justify-center h-full w-full">
            {showStoreCount ? (
              <>
                <View
                  className="rounded-full bg-foreground items-center justify-center mb-2"
                  style={{ width: imageSize, height: imageSize }}
                >
                  <Text className="text-xl text-background">→</Text>
                </View>
                <Text className="text-sm font-semibold text-center mb-1">
                  Show all
                </Text>
                <Text className="text-xs text-muted-foreground text-center">
                  {storeCount} stores
                </Text>
              </>
            ) : (
              <View
                className="flex-1 items-center justify-center gap-y-1 py-2"
              >
                {/* Image wrapper with grey background */}
                <View
                  className="rounded-full bg-gray-200 items-center justify-center"
                  style={{ width: imageSize, height: imageSize }}
                >
                  <Image
                    source={{ uri: logo }}
                    style={{ width: imageSize, height: imageSize }}
                    className="rounded-full"
                    resizeMode="contain"
                  />
                </View>

                {delivery && (
                  <Text className="text-xs text-muted-foreground text-center">
                    {delivery}
                  </Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Card>

      <Text className="text-sm font-semibold text-center" numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}
