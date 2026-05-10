import React, { useState, useEffect } from "react";
import { View, ScrollView, Image, TouchableOpacity, Modal, ActivityIndicator, Dimensions, StyleSheet, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { 
  CheckCircle, 
  Grid, 
  Calendar as CalendarIcon,
  TrendingUp,
  X,
  Home as HomeIcon,
  Package,
  FileSpreadsheet,
  Users,
  Wallet
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useGetAffiliateStats, useGetAffiliateLinks } from "@/src/services/affiliates";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export function AffiliateHome() {
  const router = useRouter();
  const { logout } = useTunzaaAuth();

  // Navigation Drawer Sidebar state
  const [showDrawer, setShowDrawer] = useState(false);

  // DatePicker state
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Stored onboarding details as safe fallbacks
  const [savedName, setSavedName] = useState("Fedelika Maxmus");
  const [savedBio, setSavedBio] = useState("Joined November 2010");
  const [savedLogo, setSavedLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedWingaData = async () => {
      try {
        const name = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_NAME");
        const bio = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_BIO");
        const logo = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_LOGO");
        if (name) setSavedName(name);
        if (bio) setSavedBio(bio);
        if (logo) setSavedLogo(logo);
      } catch (err) {
        console.log("Error loading saved Winga data inside dashboard:", err);
      }
    };
    loadSavedWingaData();
  }, []);

  // Get dynamic affiliate details and profile
  const { affiliateDetails, isLoading: profileLoading } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  // Use real dynamic names if available
  const displayName = affiliateDetails?.name || savedName;
  
  // Build dynamic letter avatar fallback
  const letterAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B5191&color=fff&size=200`;
  
  // Fallback Chain: API Logo -> Local Cached Logo -> Letter Avatar
  const displayLogo = affiliateDetails?.profile_picture || savedLogo || letterAvatar; 

  // Fetch dynamic affiliate statistics
  const { data: affiliateStats, isLoading: statsLoading } = useGetAffiliateStats(
    affiliateId || "",
    !!affiliateId
  );

  // Fetch dynamic referral links/products list
  const { data: affiliateLinks, isLoading: linksLoading } = useGetAffiliateLinks(
    affiliateId || "",
    { limit: 100 },
    !!affiliateId
  );

  // Filter links locally by selected dates
  const filteredLinks = affiliateLinks?.links?.filter(link => {
    const linkDate = new Date(link.created_at);
    // Set hours to boundaries for accurate inclusive filtering
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return linkDate >= start && linkDate <= end;
  });

  const handleWithdrawPress = () => {
    router.push("/(winga)/withdraw/status" as any);
  };

  const isPageLoading = profileLoading || statsLoading || linksLoading;

  if (isPageLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B5191" />
      </View>
    );
  }

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* ========================================== */}
      {/* 1. HEADER ROW (Clean root design without redundant back arrow) */}
      {/* ========================================== */}
      <View className="px-5 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 mt-2">
        {/* Company Name and Logo clickable to view the profile */}
        <TouchableOpacity 
          onPress={() => router.push("/(winga)/account" as any)}
          className="flex-row items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full"
        >
          <View className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
            <Image source={{ uri: displayLogo }} className="w-full h-full" />
          </View>
          <Text className="font-extrabold text-gray-800 text-sm">{displayName}</Text>
          <CheckCircle size={14} color="#10B981" fill="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setShowDrawer(true)} className="p-1">
          <Grid size={24} color="#1D1E1F" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        
        {/* ========================================== */}
        {/* 2. DATE SELECTOR ROW (Matches Screenshot 2) */}
        {/* ========================================== */}
        <View className="px-6 pt-4 flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => setShowStartPicker(true)}
            className="flex-row items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-1 mr-2.5"
          >
            <CalendarIcon size={18} color="#9CA3AF" />
            <Text className="text-sm font-bold text-gray-800">{format(startDate, 'MMM dd, yyyy')}</Text>
          </TouchableOpacity>
          
          <Text className="text-gray-400 font-bold text-lg">-</Text>
          
          <TouchableOpacity 
            onPress={() => setShowEndPicker(true)}
            className="flex-row items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-1 ml-2.5"
          >
            <CalendarIcon size={18} color="#9CA3AF" />
            <Text className="text-sm font-bold text-gray-800">{format(endDate, 'MMM dd, yyyy')}</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-center text-xs text-gray-400 font-bold mt-2.5 mb-2">
          Report : {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
        </Text>

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

        {/* ========================================== */}
        {/* 3. COMMISSION HERO CARD (Matches Screenshot 2) */}
        {/* ========================================== */}
        <View className="p-6">
          <View className="bg-[#3B5191] rounded-[24px] p-6 shadow-md">
            <Text className="text-xs text-white/70 font-semibold mb-1">
              Total Earning Commission
            </Text>
            <Text className="text-3xl font-extrabold text-white mb-2.5">
              Tsh.{(affiliateStats?.total_earnings || 0).toLocaleString()}
            </Text>
            
            <View className="flex-row items-center gap-1.5 mb-6">
              <TrendingUp size={16} color="#84CC16" />
              <Text className="text-xs text-[#84CC16] font-bold">
                {(affiliateStats?.conversion_rate || 0)}% Conversion Rate
              </Text>
            </View>

            <TouchableOpacity 
              onPress={handleWithdrawPress}
              className="bg-white/10 border border-white/20 rounded-2xl py-3.5 items-center justify-center"
            >
              <Text className="text-white text-sm font-black">Withdraw Fund</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================== */}
        {/* 4. ORDERS STATS ROW (Matches Screenshot 2) */}
        {/* ========================================== */}
        <View className="px-6 flex-row gap-4 mb-8">
          <View className="flex-1 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm items-center">
            <Text className="text-xs font-semibold text-gray-400 mb-2">Total Orders Placed</Text>
            <Text className="text-3xl font-black text-gray-800 mb-4">
              {affiliateStats?.clicks || 0}
            </Text>
            <TouchableOpacity 
              onPress={() => router.push("/(winga)/orders/sales" as any)}
              className="bg-[#00C620] rounded-xl py-2 px-6 items-center justify-center w-full"
            >
              <Text className="text-white text-xs font-extrabold">View Details</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm items-center">
            <Text className="text-xs font-semibold text-gray-400 mb-2">Total Completed Orders</Text>
            <Text className="text-3xl font-black text-gray-800 mb-4">
              {affiliateStats?.orders || 0}
            </Text>
            <TouchableOpacity 
              onPress={() => router.push("/(winga)/orders/sales" as any)}
              className="bg-[#00C620] rounded-xl py-2 px-6 items-center justify-center w-full"
            >
              <Text className="text-white text-xs font-extrabold">View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================== */}
        {/* 5. TOP EARNING PRODUCTS (Matches Screenshot 2) */}
        {/* ========================================== */}
        <View className="px-6 pb-12">
          <Text className="text-lg font-bold text-gray-900 mb-4">Top Earning Products</Text>

          <View className="gap-4">
            {/* Dynamic links rendering with local date filtering */}
            {filteredLinks && filteredLinks.length > 0 ? (
              filteredLinks.map((link) => (
                <TouchableOpacity 
                  key={link.id}
                  onPress={() => router.push("/(winga)/product/performance" as any)}
                  className="flex-row items-center gap-4 p-4 bg-white border border-gray-100 rounded-3xl shadow-sm"
                >
                  <View className="w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center overflow-hidden">
                    <Image 
                      source={{ uri: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150" }} 
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-extrabold text-gray-800 mb-1">Product Code: {link.code}</Text>
                    <Text className="text-xs text-gray-400 font-bold mb-0.5">Clicks: {link.clicks} • Orders: {link.orders}</Text>
                    <Text className="text-xs text-green-600 font-black">Tsh {link.total_commission.toLocaleString()} Commission</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-8 items-center justify-center">
                <Text className="text-gray-400 font-medium">No products found for this date range.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ========================================================== */}
      {/* 6. SIDEBAR MENU DRAWER MODAL (Matches Screenshot 3) */}
      {/* ========================================================== */}
      <Modal
        visible={showDrawer}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDrawer(false)}
      >
        <View className="flex-1 flex-row bg-black/40">
          <View className="w-4/5 max-w-[310px] bg-white h-full p-6 shadow-2xl justify-between">
            <View>
              {/* Profile Card Header Clickable to Profile Page */}
              <TouchableOpacity 
                onPress={() => { setShowDrawer(false); router.push("/(winga)/account" as any); }}
                className="flex-row items-center gap-3 pb-6 border-b border-gray-100 mb-6 mt-8"
              >
                <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-emerald-500">
                  <Image 
                    source={{ uri: displayLogo }} 
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Text className="font-extrabold text-gray-800 text-sm" numberOfLines={1}>
                      {displayName}
                    </Text>
                    <CheckCircle size={14} color="#10B981" fill="#FFFFFF" />
                  </View>
                  <Text className="text-[10px] text-gray-400 font-bold" numberOfLines={1}>
                    {savedBio}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowDrawer(false)} className="p-1.5 bg-gray-100 rounded-full">
                  <X size={16} color="#4B5563" />
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Links list */}
              <View className="gap-2">
                <TouchableOpacity 
                  onPress={() => { setShowDrawer(false); }}
                  className="flex-row items-center gap-4 p-4 bg-blue-50/70 rounded-2xl border border-blue-100/50"
                >
                  <HomeIcon size={20} color="#1E3A8A" />
                  <Text className="font-extrabold text-blue-900 text-base">Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => { setShowDrawer(false); router.push("/(winga)/product/performance" as any); }}
                  className="flex-row items-center gap-4 p-4 rounded-2xl"
                >
                  <Package size={20} color="#4B5563" />
                  <Text className="font-bold text-gray-800 text-base">Products</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => { setShowDrawer(false); router.push("/(winga)/orders/sales" as any); }}
                  className="flex-row items-center gap-4 p-4 rounded-2xl"
                >
                  <FileSpreadsheet size={20} color="#4B5563" />
                  <Text className="font-bold text-gray-800 text-base">Orders and sales</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => { setShowDrawer(false); router.push("/(winga)/customer/profile" as any); }}
                  className="flex-row items-center gap-4 p-4 rounded-2xl"
                >
                  <Users size={20} color="#4B5563" />
                  <Text className="font-bold text-gray-800 text-base">Customer Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => { setShowDrawer(false); router.push("/(winga)/withdraw/status" as any); }}
                  className="flex-row items-center gap-4 p-4 rounded-2xl"
                >
                  <Wallet size={20} color="#4B5563" />
                  <Text className="font-bold text-gray-800 text-base">Withdraw</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Logout and Close buttons */}
            <View className="gap-2 mb-4">
              <TouchableOpacity 
                onPress={async () => {
                  setShowDrawer(false);
                  Alert.alert(
                    "Log Out",
                    "Are you sure you want to log out?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Log Out", style: "destructive", onPress: async () => {
                          await logout();
                        }
                      }
                    ]
                  );
                }}
                className="py-4 bg-red-50 border border-red-100 rounded-2xl items-center justify-center flex-row gap-2"
              >
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                <Text className="text-red-600 font-extrabold text-sm">Log Out</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setShowDrawer(false)}
                className="py-4 bg-gray-100 rounded-2xl items-center justify-center"
              >
                <Text className="text-gray-500 font-extrabold text-sm">Close Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Backdrop Touch Dismiss */}
          <TouchableOpacity className="flex-1" onPress={() => setShowDrawer(false)} />
        </View>
      </Modal>

    </View>
  );
}
