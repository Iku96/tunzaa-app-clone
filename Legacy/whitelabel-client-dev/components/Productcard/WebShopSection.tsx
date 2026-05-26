import React, { useRef, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, FlatList, useWindowDimensions } from "react-native";
import { ShopTile } from "./ShopTile";

interface Branding {
  logo_url: string;
}

interface Shop {
  store_id: string;
  store_name: string;
  branding: Branding;
  badge?: string;
  delivery?: string;
}

interface ShopSectionProps {
  title?: string;
  count?: number;
  showAll?: boolean;
  shops?: Shop[];
}

export function WebShopSection({ title = "Top Shops", count = 5, showAll = true, shops = [] }: ShopSectionProps) {
  const { width } = useWindowDimensions(); // Get screen width to detect desktop
  const isDesktop = width >= 1024; // Define desktop as width >= 1024px
  const flatListRef = useRef<FlatList>(null); // Ref for FlatList (desktop)
  const scrollViewRef = useRef<ScrollView>(null); // Ref for ScrollView (mobile)
  const [scrollPosition, setScrollPosition] = useState(0); // Track scroll position

  const productsToDisplay = React.useMemo(() => {
    const displayedShops = shops.slice(0, count).map((shop: Shop) => ({
      id: shop.store_id,
      name: shop.store_name,
      logo: shop.branding.logo_url,
      badge: shop.badge,
      delivery: shop.delivery,
    }));
    if (showAll && shops.length > count) {
      displayedShops.push({
        id: "all-shops",
        name: "Show all",
        logo: "",
        badge: undefined,
        delivery: undefined,
      });
    }
    return displayedShops;
  }, [shops, count, showAll]);

  // Function to scroll left
  const scrollLeft = () => {
    if (isDesktop && flatListRef.current) {
      const newPosition = Math.max(scrollPosition - 180, 0); // Prevent negative scroll
      flatListRef.current.scrollToOffset({ offset: newPosition, animated: true });
      setScrollPosition(newPosition);
    } else if (!isDesktop && scrollViewRef.current) {
      const newPosition = Math.max(scrollPosition - 180, 0); // Prevent negative scroll
      scrollViewRef.current.scrollTo({ x: newPosition, animated: true });
      setScrollPosition(newPosition);
    }
  };

  // Function to scroll right
  const scrollRight = () => {
    if (isDesktop && flatListRef.current) {
      const newPosition = scrollPosition + 180; // Adjust based on content width
      flatListRef.current.scrollToOffset({ offset: newPosition, animated: true });
      setScrollPosition(newPosition);
    } else if (!isDesktop && scrollViewRef.current) {
      const newPosition = scrollPosition + 180; // Adjust based on content width
      scrollViewRef.current.scrollTo({ x: newPosition, animated: true });
      setScrollPosition(newPosition);
    }
  };

  if (!shops || shops.length === 0) {
    return (
      <View className="w-full bg-gray-100 p-4">
        <Text className="text-xl font-bold text-black mb-4">{title}</Text>
        <Text className="text-center text-gray-500 py-4">
          No shops available
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <ShopTile
      key={item.id}
      id={item.id}
      name={item.name}
      logo={item.logo}
      badge={item.badge}
      delivery={item.delivery}
      showStoreCount={item.showStoreCount}
      storeCount={item.storeCount}
    />
  );

  return (
    <View className="w-full bg-white p-4">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-black mr-2">{title}</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="p-2" onPress={scrollLeft}>
            <Text className="text-black">←</Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={scrollRight}>
            <Text className="text-black">→</Text>
          </TouchableOpacity>
        </View>
      </View>
      {isDesktop ? (
        <FlatList
          ref={flatListRef}
          data={productsToDisplay}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          onScroll={(event) => setScrollPosition(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16} // For smooth scroll updates
        />
      ) : (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          onScroll={(event) => setScrollPosition(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16} // For smooth scroll updates
        >
          {productsToDisplay.map((item: any) => renderItem({ item }))}
        </ScrollView>
      )}
    </View>
  );
}