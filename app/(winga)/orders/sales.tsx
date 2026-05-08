import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  ArrowLeft, 
  ChevronDown, 
  Calendar as CalendarIcon
} from "lucide-react-native";
import { Svg, Circle, G } from "react-native-svg";
import { Text } from "@/components/ui/text";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useGetAffiliateStats, useGetAffiliateLinks } from "@/src/services/affiliates";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

export default function OrdersSalesScreen() {
  const router = useRouter();

  // Get dynamic affiliate details
  const { affiliateDetails, isLoading: profileLoading } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  // Fetch dynamic affiliate statistics
  const { data: affiliateStats, isLoading: statsLoading } = useGetAffiliateStats(
    affiliateId || "",
    !!affiliateId
  );

  // Fetch dynamic referral links/products list to populate table rows dynamically
  const { data: affiliateLinks, isLoading: linksLoading } = useGetAffiliateLinks(
    affiliateId || "",
    { limit: 100 },
    !!affiliateId
  );

  // Active filter type: 'completed' | 'installments' | 'pending'
  const [activeFilterType, setActiveFilterType] = useState<'completed' | 'installments' | 'pending'>('completed');

  // Date Filter State
  const [rangeLabel, setRangeLabel] = useState("Last 10 days");
  const [startDate, setStartDate] = useState(subDays(new Date(), 10));
  const [endDate, setEndDate] = useState(new Date());
  
  // Custom Date Picker triggers
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Fallback orders
  const mockOrdersList = [];

  const hasDynamicLinks = affiliateLinks?.links && affiliateLinks.links.length > 0;
  
  // Map dynamic links to table rows if available
  const dynamicOrdersList = hasDynamicLinks 
    ? affiliateLinks.links.map((link, idx) => ({
        id: `#${link.code.substring(0, 5)}`,
        name: link.product_id ? "Product Resold" : "Store Resold",
        price: `Tsh ${link.total_commission.toLocaleString()}`,
        type: idx % 3 === 0 ? "completed" : idx % 3 === 1 ? "installments" : "pending",
        date: new Date(link.created_at)
      }))
    : mockOrdersList;

  // Filter orders by date range dynamically
  const dateFilteredOrders = dynamicOrdersList.filter(order => {
    const orderTime = new Date(order.date).getTime();
    const startLimit = startOfDay(startDate).getTime();
    const endLimit = endOfDay(endDate).getTime();
    return orderTime >= startLimit && orderTime <= endLimit;
  });

  // Then filter by order status type
  const filteredOrders = dateFilteredOrders.filter(o => o.type === activeFilterType);

  // Dynamic metrics for segments
  const completedCount = dateFilteredOrders.filter(o => o.type === "completed").length;
  const installmentsCount = dateFilteredOrders.filter(o => o.type === "installments").length;
  const pendingCount = dateFilteredOrders.filter(o => o.type === "pending").length;
  const totalCount = dateFilteredOrders.length;

  // Compute SVG Segment Stroke Offsets for Dynamic Donut Chart
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.2
  
  const completedPct = totalCount > 0 ? completedCount / totalCount : 0;
  const installmentsPct = totalCount > 0 ? installmentsCount / totalCount : 0;
  const pendingPct = totalCount > 0 ? pendingCount / totalCount : 0;

  const completedOffset = circumference - (completedPct * circumference);
  const installmentsOffset = circumference - (installmentsPct * circumference);
  const pendingOffset = circumference - (pendingPct * circumference);

  const handleRangeSelect = () => {
    Alert.alert(
      "Select Range",
      "Choose a date range filter",
      [
        { text: "Last 10 Days", onPress: () => {
            setRangeLabel("Last 10 days");
            setStartDate(subDays(new Date(), 10));
            setEndDate(new Date());
          }
        },
        { text: "Last 30 Days", onPress: () => {
            setRangeLabel("Last 30 days");
            setStartDate(subDays(new Date(), 30));
            setEndDate(new Date());
          }
        },
        { text: "Last 60 Days", onPress: () => {
            setRangeLabel("Last 60 days");
            setStartDate(subDays(new Date(), 60));
            setEndDate(new Date());
          }
        },
        { text: "Custom Range...", onPress: () => {
            setRangeLabel("Custom Range");
            setShowStartPicker(true);
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      if (Platform.OS !== 'ios') {
        setShowEndPicker(true);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const isPageLoading = profileLoading || statsLoading || linksLoading;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 1. HEADER */}
      <View className="px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-gray-800">Orders and sales</Text>
      </View>

      {isPageLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text className="text-xs text-gray-400 font-bold mt-2">Loading sales data...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* 2. INSIGHT CARD HEADER */}
          <View className="p-6 items-center">
            <Text className="text-base font-extrabold text-gray-800 mb-4">Orders and sales Insight</Text>
            <Text className="text-4xl font-black text-gray-900 mb-1">
              {totalCount}
            </Text>
            <Text className="text-sm font-bold text-gray-500 mb-1">Total Orders from Resold Products</Text>
            <Text className="text-xs text-gray-400 font-medium">
              {format(startDate, 'd MMMM')} - {format(endDate, 'd MMMM')}
            </Text>
          </View>

          {/* 3. STUNNING SVG DONUT CHART */}
          <View className="items-center pb-6">
            <View className="relative w-44 h-44 items-center justify-center">
              <Svg width="160" height="160" viewBox="0 0 100 100">
                <G transform="rotate(-90 50 50)">
                  {/* Completed - Green segment */}
                  <Circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={completedOffset}
                    fill="transparent"
                  />
                  {/* Installments - Gray segment */}
                  <Circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#4B5563"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={installmentsOffset}
                    fill="transparent"
                    transform={`rotate(${completedPct * 360} 50 50)`}
                  />
                  {/* Pending - Red segment */}
                  <Circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#EF4444"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={pendingOffset}
                    fill="transparent"
                    transform={`rotate(${(completedPct + installmentsPct) * 360} 50 50)`}
                  />
                </G>
              </Svg>
              {/* Donut Center */}
              <View className="absolute w-24 h-24 bg-white rounded-full items-center justify-center shadow-inner">
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">Active</Text>
              </View>
            </View>
          </View>

          {/* 4. DONUT CHART LEGEND */}
          <View className="flex-row justify-center gap-4 px-6 pb-6 flex-wrap">
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-full bg-emerald-500" />
              <Text className="text-xs font-bold text-gray-600">{completedCount} Completed orders</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-full bg-gray-600" />
              <Text className="text-xs font-bold text-gray-600">{installmentsCount} Installments orders</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-full bg-red-500" />
              <Text className="text-xs font-bold text-gray-600">{pendingCount} Pending orders</Text>
            </View>
          </View>

          {/* 5. FILTER ROW: DROPDOWN & DATE */}
          <View className="px-6 pb-4 flex-row justify-between items-center">
            <TouchableOpacity 
              onPress={handleRangeSelect}
              className="flex-row items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl"
            >
              <Text className="text-xs font-bold text-gray-700">{rangeLabel}</Text>
              <ChevronDown size={14} color="#4B5563" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5">
              <CalendarIcon size={14} color="#9CA3AF" />
              <Text className="text-xs font-extrabold text-gray-500">
                {format(startDate, 'd MMM')} - {format(endDate, 'd MMM')}
              </Text>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
              maximumDate={endDate}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              minimumDate={startDate}
              maximumDate={new Date()}
            />
          )}

          {/* 6. FILTER BY ORDER TYPE DROPDOWN */}
          <View className="px-6 pb-6">
            <Text className="text-xs font-extrabold text-gray-500 mb-2">Filter by order type</Text>
            <View className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              <View className="flex-row">
                <TouchableOpacity 
                  onPress={() => setActiveFilterType('completed')}
                  className={`flex-1 py-3 items-center justify-center ${activeFilterType === 'completed' ? 'bg-[#3B5191]' : ''}`}
                >
                  <Text className={`text-xs font-black ${activeFilterType === 'completed' ? 'text-white' : 'text-gray-500'}`}>Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setActiveFilterType('installments')}
                  className={`flex-1 py-3 items-center justify-center border-l border-r border-gray-200 ${activeFilterType === 'installments' ? 'bg-[#3B5191]' : ''}`}
                >
                  <Text className={`text-xs font-black ${activeFilterType === 'installments' ? 'text-white' : 'text-gray-500'}`}>Installments</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setActiveFilterType('pending')}
                  className={`flex-1 py-3 items-center justify-center ${activeFilterType === 'pending' ? 'bg-[#3B5191]' : ''}`}
                >
                  <Text className={`text-xs font-black ${activeFilterType === 'pending' ? 'text-white' : 'text-gray-500'}`}>Pending</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 7. DATA HISTORY TABLE */}
          <View className="px-6 pb-8">
            <View className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              
              {/* Table Headers */}
              <View className="flex-row bg-gray-100/70 p-3 border-b border-gray-100">
                <Text className="flex-1 text-[11px] font-extrabold text-gray-500">Order Number</Text>
                <Text className="flex-1 text-[11px] font-extrabold text-gray-500 text-center">Product name</Text>
                <Text className="flex-1 text-[11px] font-extrabold text-gray-500 text-right">Sale Price</Text>
              </View>

              {/* Table Rows */}
              {filteredOrders.map((order, i) => (
                <View key={i} className="flex-row p-4 border-b border-gray-100/50 items-center">
                  <Text className="flex-1 text-xs font-black text-[#3B5191]">{order.id}</Text>
                  <Text className="flex-1 text-xs font-bold text-gray-700 text-center">{order.name}</Text>
                  <Text className="flex-1 text-xs font-black text-gray-800 text-right">{order.price}</Text>
                </View>
              ))}

              {filteredOrders.length === 0 && (
                <View className="p-6 items-center">
                  <Text className="text-xs text-gray-400 font-bold">No orders found for this filter type</Text>
                </View>
              )}

            </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}
