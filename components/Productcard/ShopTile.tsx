import React from 'react';
import { View, Image, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { Badge } from "@/components/ui/badge";

interface ShopTileProps {
  id: string;
  name: string;
  logo: string;
  badge?: string;
  delivery?: string;
  showStoreCount?: boolean;
  storeCount?: number;
}

export function ShopTile({
  id,
  name,
  logo,
  badge,
  showStoreCount,
}: ShopTileProps) {
  const router = useRouter();

  const handlePress = () => {
    if (showStoreCount) {
      router.push("/stores" as any);
    } else {
      router.push(`/stores/${id}` as any);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="items-center w-[150px] mx-3"
      activeOpacity={0.8}
    >
      {/* Circular image container */}
      <View className="bg-gray-100 rounded-full w-[150px] h-[150px] justify-center items-center overflow-hidden">
        <Image
          source={{ uri: logo }}
          className="w-[100px] h-[100px]"
          resizeMode="contain"
        />
      </View>

      {/* Optional badge */}
      {badge && (
        <Badge className="bg-yellow-400 text-black text-xxs px-1 py-0.5 mt-1 rounded">
          {badge}
        </Badge>
      )}

      {/* Store name */}
      <Text
        className="text-sm font-semibold text-center mt-2 text-black"
        numberOfLines={2}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}
