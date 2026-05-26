import React from 'react';
import { View, TouchableOpacity, Image, Text } from "react-native";
import { useRouter } from "expo-router";
import { Product, ProductImage } from '@/services/products';
import { Heart } from 'lucide-react-native'; // Or any heart icon you prefer
import { Card } from "../ui/card";

export function FlashSaleCard({ product }: { product: Product }) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/product/${product.product_id}`);
  };

  const displayPrice = product.sale_price ?? product.base_price;

  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : (product.images[0] as ProductImage).url
      : "https://via.placeholder.com/150";

  return (
    <TouchableOpacity onPress={handlePress} className="w-[262px] mr-2 mb-5">
      <Card className="bg-white rounded-xl overflow-hidden border-0 shadow-none">

        <View className="relative bg-gray-100 rounded-xl overflow-hidden">
          {/* Increased height and width for the image */}
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-[262px]"  // Increased height of the image area
            resizeMode="cover"
          />

          {/* Heart Icon */}
          <View className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
            <Heart size={16} color="#555" />
          </View>
        </View>

        <View className="px-0 py-2 border-0">
          <Text
            numberOfLines={2}
            className="text-[13px] font-medium text-gray-900"
          >
            {product.name}
          </Text>

          <Text className="text-[15px] font-bold text-gray-900 mt-1">
            TSh {displayPrice.toLocaleString()}
          </Text>

          {product.sale_price !== null && product.sale_price < product.base_price && (
            <Text className="text-xs text-gray-500 line-through mt-0.5">
              TSh {product.base_price.toLocaleString()}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
