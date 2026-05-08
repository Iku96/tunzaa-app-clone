import React, { useState } from "react";
import { View, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  ChevronDown, 
  ArrowUpDown,
  ShoppingBag,
  Users,
  TrendingUp,
  Award
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useGetAffiliateStats, useGetAffiliateLinks } from "@/src/services/affiliates";

const { width } = Dimensions.get("window");

export default function ProductPerformanceScreen() {
  const router = useRouter();

  // Filter & Sort states
  const [filterOption, setFilterOption] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [sortOption, setSortOption] = useState<'none' | 'clicks' | 'orders' | 'commission'>('none');

  // Fetch real API data
  const { affiliateDetails, isLoading: profileLoading } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  const { data: affiliateStats, isLoading: statsLoading } = useGetAffiliateStats(
    affiliateId || "",
    !!affiliateId
  );

  const { data: affiliateLinks, isLoading: linksLoading } = useGetAffiliateLinks(
    affiliateId || "",
    { limit: 100 },
    !!affiliateId
  );

  const handleResellPress = (id: string) => {
    // Action stub for reselling
  };

  const showFilterOptions = () => {
    Alert.alert(
      "Filter Products",
      "Select a stock filter",
      [
        { text: "Show All", onPress: () => setFilterOption('all') },
        { text: "Show In Stock Only", onPress: () => setFilterOption('in_stock') },
        { text: "Show Out of Stock Only", onPress: () => setFilterOption('out_of_stock') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const showSortOptions = () => {
    Alert.alert(
      "Sort Products",
      "Select a sorting criteria",
      [
        { text: "Default", onPress: () => setSortOption('none') },
        { text: "Clicks (High to Low)", onPress: () => setSortOption('clicks') },
        { text: "Orders (High to Low)", onPress: () => setSortOption('orders') },
        { text: "Commission (High to Low)", onPress: () => setSortOption('commission') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const isPageLoading = profileLoading || statsLoading || linksLoading;

  if (isPageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B5191" />
      </SafeAreaView>
    );
  }

  // Map dynamic links to product rows
  let dynamicProducts = affiliateLinks?.links?.map(link => ({
    id: link.id,
    name: `Referral Link Code: ${link.code}`,
    status: link.is_active ? "in stock" : "out of stock",
    buyers: link.clicks,
    orders: link.orders,
    commissionAmount: link.total_commission,
    commission: `Tsh ${link.total_commission.toLocaleString()}`,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200"
  })) || [];

  // Apply Filter
  if (filterOption === 'in_stock') {
    dynamicProducts = dynamicProducts.filter(p => p.status === 'in stock');
  } else if (filterOption === 'out_of_stock') {
    dynamicProducts = dynamicProducts.filter(p => p.status === 'out of stock');
  }

  // Apply Sort
  if (sortOption === 'clicks') {
    dynamicProducts.sort((a, b) => b.buyers - a.buyers);
  } else if (sortOption === 'orders') {
    dynamicProducts.sort((a, b) => b.orders - a.orders);
  } else if (sortOption === 'commission') {
    dynamicProducts.sort((a, b) => b.commissionAmount - a.commissionAmount);
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 1. HEADER */}
      <View className="px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-gray-800">Product Performance</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 2. OVERVIEW SUMMARY CARD */}
        <View className="p-4">
          <View className="bg-[#3B5191] rounded-3xl p-5 shadow-lg shadow-blue-800/20">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-extrabold text-base">Monthly Overview</Text>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">
                  {new Date().toLocaleString('default', { month: 'short' })} {new Date().getFullYear()}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between pt-2">
              <View>
                <Text className="text-blue-200 text-xs font-bold mb-1">Total products</Text>
                <Text className="text-2xl font-black text-white">{affiliateLinks?.total || 0}</Text>
              </View>
              <View className="w-[1px] bg-white/20 align-self-center h-10" />
              <View className="align-end">
                <Text className="text-blue-200 text-xs font-bold mb-1">Total commission</Text>
                <Text className="text-2xl font-black text-white">Tzs {(affiliateStats?.total_earnings || 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. FILTER / SORT BUTTONS BAR */}
        <View className="px-4 pb-4 flex-row gap-3">
          <TouchableOpacity 
            onPress={showFilterOptions}
            className={`flex-row items-center justify-center gap-2 border rounded-xl px-4 py-2.5 flex-1 ${filterOption !== 'all' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}
          >
            <SlidersHorizontal size={16} color={filterOption !== 'all' ? '#3B5191' : '#4B5563'} />
            <Text className={`text-sm font-extrabold ${filterOption !== 'all' ? 'text-blue-900' : 'text-gray-700'}`}>
              {filterOption === 'all' ? 'Filter' : filterOption === 'in_stock' ? 'In Stock' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={showSortOptions}
            className={`flex-row items-center justify-center gap-2 border rounded-xl px-4 py-2.5 flex-1 ${sortOption !== 'none' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}
          >
            <ArrowUpDown size={16} color={sortOption !== 'none' ? '#3B5191' : '#4B5563'} />
            <Text className={`text-sm font-extrabold ${sortOption !== 'none' ? 'text-blue-900' : 'text-gray-700'}`}>
              {sortOption === 'none' ? 'Sort' : sortOption === 'clicks' ? 'By Clicks' : sortOption === 'orders' ? 'By Orders' : 'By Commission'}
            </Text>
            <ChevronDown size={14} color={sortOption !== 'none' ? '#3B5191' : '#4B5563'} />
          </TouchableOpacity>
        </View>

        {/* 4. PRODUCTS LIST */}
        <View className="px-4 gap-4 pb-8">
          {dynamicProducts.length > 0 ? (
            dynamicProducts.map((product) => (
              <View key={product.id} className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
                
                {/* Product Info Row */}
                <View className="flex-row gap-4 mb-4">
                  <View className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <Image source={{ uri: product.image }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <View className="flex-1 justify-between py-1">
                    <View className="flex-row justify-between items-start gap-2">
                      <Text className="text-sm font-black text-gray-800 flex-1" numberOfLines={2}>
                        {product.name}
                      </Text>
                      {/* Stock Badges */}
                      {product.status === "out of stock" && (
                        <View className="bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          <Text className="text-[10px] font-black text-red-500 capitalize">out of stock</Text>
                        </View>
                      )}
                      {product.status === "low stock" && (
                        <View className="bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          <Text className="text-[10px] font-black text-amber-500 capitalize">low stock</Text>
                        </View>
                      )}
                      {product.status === "in stock" && (
                        <View className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          <Text className="text-[10px] font-black text-blue-500 capitalize">in stock</Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row justify-between items-center mt-2">
                      <View className="items-center flex-1">
                        <Text className="text-base font-black text-gray-800">{product.buyers}</Text>
                        <Text className="text-[9px] text-gray-400 font-extrabold">Clicks</Text>
                      </View>
                      <View className="w-[1px] bg-gray-100 h-6" />
                      <View className="items-center flex-1">
                        <Text className="text-base font-black text-gray-800">{product.orders}</Text>
                        <Text className="text-[9px] text-gray-400 font-extrabold">Orders</Text>
                      </View>
                      <View className="w-[1px] bg-gray-100 h-6" />
                      <View className="items-center flex-1">
                        <Text className="text-sm font-black text-blue-900">{product.commission}</Text>
                        <Text className="text-[9px] text-gray-400 font-extrabold">Commission</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Action Button */}
                {product.status === "out of stock" ? (
                  <View className="bg-gray-100 rounded-2xl py-3.5 items-center justify-center border border-gray-200/50">
                    <Text className="text-gray-400 font-extrabold text-sm">Currently unavailable</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleResellPress(product.id)}
                    className="bg-[#3B5191] rounded-2xl py-3.5 items-center justify-center shadow-md shadow-blue-800/10"
                  >
                    <Text className="text-white font-black text-sm">Resell Again</Text>
                  </TouchableOpacity>
                )}

              </View>
            ))
          ) : (
            <View className="py-16 items-center justify-center">
              <Text className="text-gray-400 font-medium">No products match these filters</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
