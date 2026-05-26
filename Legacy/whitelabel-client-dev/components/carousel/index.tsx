import React, { useState, useEffect, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTenantStore } from "@/stores/tenant";

export const WebCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { tenant } = useTenantStore();

  // Process tenant banners into carousel items
  const carouselItems = useMemo(() => {
    if (tenant?.metadata?.banners && tenant.metadata.banners.length > 0) {
      // Filter active banners and sort by display_order
      const activeBanners = tenant.metadata.banners.sort((a: any, b: any) => a.display_order - b.display_order);

      // Map to the required structure with id and backgroundImage
      return activeBanners.map((banner: any) => ({
        id: banner.display_order,
        backgroundImage: banner.image_url,
      }));
    }

    // Fallback to default carousel items if no tenant banners
    return [
      {
        id: 1,
        backgroundImage: "https://m.media-amazon.com/images/I/81hIlE5xocL._SX3000_.jpg"
      },
      {
        id: 2,
        backgroundImage: "https://m.media-amazon.com/images/I/61Yx5-N155L._SX3000_.jpg"
      },
      {
        id: 3,
        backgroundImage: "https://m.media-amazon.com/images/I/619geyiQI5L._SX3000_.jpg"
      }
    ];
  }, [tenant?.banners]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const currentItem = carouselItems[activeIndex];

  return (
    <View className="w-full">
      <View className="relative w-full overflow-hidden rounded-xl h-[400px] mt-5">
        {/* Background image layer */}
        <Image
          source={{ uri: currentItem.backgroundImage }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={1000}
        />

        {/* Navigation dots */}
        <View className="absolute bottom-6 left-8 flex-row gap-2 z-10">
          {carouselItems.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full ${index === activeIndex
                ? 'bg-white scale-110'
                : 'bg-gray-400'
                }`}
              accessibilityLabel={`Go to slide ${index + 1}`}
            />
          ))}
        </View>
      </View>
    </View>
  );
};