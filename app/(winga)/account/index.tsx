import React, { useState, useEffect } from "react";
import { View, ScrollView, Image, TouchableOpacity, Modal, TextInput, Alert, Share, Dimensions, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft, 
  MoreVertical, 
  MapPin, 
  CheckCircle, 
  Grid, 
  Video, 
  Award, 
  Share2, 
  Copy, 
  ExternalLink,
  ChevronDown,
  X,
  Plus,
  Heart,
  MessageCircle,
  Send
} from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useGetAffiliateStats } from "@/src/services/affiliates";
import { format } from "date-fns";

const { width, height } = Dimensions.get('window');

interface WingaPost {
  id: string;
  uri: string;
  type: 'image' | 'video';
  createdAt: string;
}

export default function AccountScreen() {
  const router = useRouter();
  const { logout } = useTunzaaAuth();

  // Fetch real API data
  const { affiliateDetails, isLoading: profileLoading } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  const { data: affiliateStats, isLoading: statsLoading } = useGetAffiliateStats(
    affiliateId || "",
    !!affiliateId
  );

  // Active Tab: 'posts' (grid) or 'videos'
  const [activeTab, setActiveTab] = useState<'posts' | 'videos'>('posts');

  // Modal / Bottom Sheet States
  const [showDiamondModal, setShowDiamondModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChooseShopModal, setShowChooseShopModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<WingaPost | null>(null);

  // Post & Video local state
  const [localPosts, setLocalPosts] = useState<WingaPost[]>([]);

  // Profile data mappings
  const [displayName, setDisplayName] = useState("Loading...");
  const [displayLocation, setDisplayLocation] = useState("Dar es Salaam");
  const [displayBio, setDisplayBio] = useState("");
  const [displayLogo, setDisplayLogo] = useState("");

  const sanitize = (url: any) => {
    if (!url) return null;
    let s = String(url).trim();
    if (!s || s === "null" || s === "undefined") return null;
    
    // Auto-fix presigned upload URLs by removing query parameters
    if (s.includes("linodeobjects.com") && s.includes("?")) {
      s = s.split("?")[0];
    }
    return s;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const savedLogo = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_LOGO");
      const savedName = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_NAME");
      const savedBio = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_BIO");
      const savedLocation = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_LOCATION");

      console.log("🛠️ [DEBUG] Details screen payloads:", {
        api_profile_picture: affiliateDetails?.profile_picture,
        async_saved_logo: savedLogo
      });

      const activeName = affiliateDetails?.name || savedName || "Winga Affiliate";
      const letterAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeName)}&background=3B5191&color=fff&size=200`;

      const resolved = sanitize(affiliateDetails?.profile_picture) || sanitize(savedLogo) || letterAvatar;
      setDisplayLogo(resolved);
      
      console.log(`🖼️ [DEBUG] Account Screen Resolved displayLogo: "${resolved}"`);
      
      // Fallback intelligently so we never show 'Loading...' indefinitely
      setDisplayName(activeName);
      setDisplayBio(affiliateDetails?.bio || savedBio || "");
      setDisplayLocation(savedLocation || "Dar es Salaam");

      // Load locally persisted posts
      const savedPostsStr = await AsyncStorage.getItem("WINGA_LOCAL_POSTS");
      if (savedPostsStr) {
        setLocalPosts(JSON.parse(savedPostsStr));
      }
    };
    loadInitialData();
  }, [affiliateDetails]);

  const savePosts = async (posts: WingaPost[]) => {
    setLocalPosts(posts);
    await AsyncStorage.setItem("WINGA_LOCAL_POSTS", JSON.stringify(posts));
  };

  const handleUploadMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Sorry, we need camera roll permissions to upload media.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newPost: WingaPost = {
        id: Math.random().toString(36).substring(7),
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        createdAt: new Date().toISOString(),
      };
      
      await savePosts([newPost, ...localPosts]);
      
      // Auto-switch to correct tab
      if (newPost.type === 'video') setActiveTab('videos');
      else setActiveTab('posts');
      
      Alert.alert("Success", "Media uploaded successfully!");
    }
  };

  const handleCopyLink = () => {
    Alert.alert("Success", "Referral link copied to clipboard!");
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Check out ${displayName}'s profile on Tunzaa Winga! https://tunzaa.co.tz/winga/${affiliateDetails?.id || 'profile'}`,
      });
    } catch (error) {
      console.log("Error sharing profile:", error);
    }
  };

  if (profileLoading || statsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B5191" />
      </SafeAreaView>
    );
  }

  // Filter posts based on active tab
  const displayedPosts = localPosts.filter(post => 
    activeTab === 'posts' ? post.type === 'image' : post.type === 'video'
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. HEADER SECTION */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setShowChooseShopModal(true)}
          className="flex-row items-center gap-2 px-3 py-1 bg-gray-50 rounded-full"
        >
          <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <Text className="text-base font-bold text-gray-800">{displayName}</Text>
          <ChevronDown size={16} color="#4B5563" />
        </TouchableOpacity>

        <View className="flex-row gap-2 items-center">
          <TouchableOpacity 
            onPress={handleUploadMedia}
            className="p-1.5 bg-[#3B5191] rounded-full"
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 2. STATS & AVATAR ROW */}
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
          <View className="relative">
            <View className="w-20 h-20 rounded-full p-0.5 border-2 border-green-500">
              <Image 
                source={{ uri: displayLogo }} 
                className="w-full h-full rounded-full"
                onError={(e) => console.warn("❌ [PROFILE IMAGE ERROR]", e.nativeEvent)}
              />
            </View>
            <View className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white items-center justify-center">
              <View className="w-2.5 h-2.5 bg-white rounded-full" />
            </View>
          </View>

          <View className="flex-row gap-6 pr-4">
            <View className="items-center">
              <Text className="text-lg font-extrabold text-gray-800">{localPosts.length}</Text>
              <Text className="text-xs text-gray-500">Posts</Text>
            </View>
            <View className="h-8 w-[1px] bg-gray-200" style={{ alignSelf: 'center' }} />
            <View className="items-center">
              <Text className="text-lg font-extrabold text-gray-800">{affiliateStats?.orders || 0}</Text>
              <Text className="text-xs text-gray-500">Orders</Text>
            </View>
            <View className="h-8 w-[1px] bg-gray-200" style={{ alignSelf: 'center' }} />
            <View className="items-center">
              <Text className="text-lg font-extrabold text-[#84CC16]">Tsh</Text>
              <Text className="text-xs text-gray-500 font-bold">{(affiliateStats?.total_earnings || 0).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* 3. PROFILE DETAILS / BIO */}
        <View className="px-6 pb-4">
          <View className="flex-row items-center gap-2 mb-1.5">
            <Text className="text-xl font-extrabold text-gray-800">{displayName}</Text>
            <CheckCircle size={18} color="#10B981" fill="#FFFFFF" />
            
            <TouchableOpacity 
              onPress={() => setShowDiamondModal(true)}
              className="bg-blue-50 px-2 py-0.5 rounded-full flex-row items-center gap-1 border border-blue-200"
            >
              <Award size={12} color="#425BA4" />
              <Text className="text-[10px] font-bold text-blue-700 uppercase">Diamond</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-1 mb-2">
            <MapPin size={14} color="#9CA3AF" />
            <Text className="text-sm font-semibold text-gray-500">{displayLocation}</Text>
          </View>

          {displayBio ? (
            <Text className="text-sm text-gray-600 mb-4">{displayBio}</Text>
          ) : <View className="mb-2" />}

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => router.push("/(winga)/account/details" as any)}
              className="flex-1 bg-[#3B5191] rounded-xl py-3 items-center justify-center"
            >
              <Text className="text-white font-extrabold text-sm">Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowShareModal(true)}
              className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl items-center justify-center"
            >
              <Share2 size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. TABS ROW */}
        <View className="flex-row mt-4 border-b border-gray-200">
          <TouchableOpacity 
            onPress={() => setActiveTab('posts')}
            className={`flex-1 py-4 items-center ${activeTab === 'posts' ? 'border-b-2 border-gray-800' : ''}`}
          >
            <Grid size={24} color={activeTab === 'posts' ? '#1F2937' : '#9CA3AF'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setActiveTab('videos')}
            className={`flex-1 py-4 items-center ${activeTab === 'videos' ? 'border-b-2 border-gray-800' : ''}`}
          >
            <Video size={24} color={activeTab === 'videos' ? '#1F2937' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>

        {/* 5. GRID CONTENT */}
        <View className="flex-row flex-wrap">
          {displayedPosts.length > 0 ? (
            displayedPosts.map((post) => (
              <TouchableOpacity 
                key={post.id} 
                onPress={() => setSelectedPost(post)}
                style={{ width: width / 3, height: width / 3, padding: 1 }}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: post.uri }} 
                  className="w-full h-full bg-gray-100"
                  resizeMode="cover"
                />
                {post.type === 'video' && (
                  <View className="absolute top-2 right-2 drop-shadow-md">
                    <Video size={18} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View className="w-full py-16 items-center justify-center">
              <Text className="text-gray-400 font-medium mb-4">No {activeTab} yet</Text>
              <TouchableOpacity onPress={handleUploadMedia} className="bg-gray-100 px-6 py-2 rounded-full">
                <Text className="text-gray-600 font-bold text-sm">Upload {activeTab === 'posts' ? 'Photo' : 'Video'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ========================================================== */}
      {/* MODALS SECTION */}
      {/* ========================================================== */}

      {/* 0. Instagram-Style Post Viewer Modal */}
      <Modal
        visible={!!selectedPost}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPost(null)}
      >
        <SafeAreaView className="flex-1 bg-black">
          {/* Top Navbar */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
            <TouchableOpacity onPress={() => setSelectedPost(null)}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-base">Posts</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedPost && (
            <ScrollView className="flex-1">
              {/* Post Header */}
              <View className="flex-row items-center p-3 gap-3">
                <View className="w-10 h-10 rounded-full border border-gray-700 overflow-hidden">
                  <Image source={{ uri: displayLogo }} className="w-full h-full" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-white font-bold">{displayName}</Text>
                    <CheckCircle size={12} color="#10B981" fill="white" />
                  </View>
                  <Text className="text-gray-400 text-xs">{displayLocation}</Text>
                </View>
                <MoreVertical size={20} color="white" />
              </View>

              {/* Media Content */}
              <View style={{ width, height: width, backgroundColor: '#111' }}>
                <Image 
                  source={{ uri: selectedPost.uri }} 
                  className="w-full h-full"
                  resizeMode="contain"
                />
                {selectedPost.type === 'video' && (
                  <View className="absolute inset-0 items-center justify-center bg-black/20">
                    <View className="w-16 h-16 bg-black/50 rounded-full items-center justify-center pl-1">
                      <Ionicons name="play" size={32} color="white" />
                    </View>
                  </View>
                )}
              </View>

              {/* Engagement Bar */}
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row gap-4">
                  <Heart size={26} color="white" />
                  <MessageCircle size={26} color="white" />
                  <Send size={26} color="white" />
                </View>
                <Award size={26} color="white" />
              </View>

              {/* Details & Time */}
              <View className="px-4 pb-8">
                <Text className="text-white font-bold mb-1">1,245 likes</Text>
                <Text className="text-white leading-5">
                  <Text className="font-bold">{displayName} </Text>
                  Check out this amazing {selectedPost.type === 'video' ? 'video' : 'product'} update! We're bringing the best to Tunzaa. 🚀✨
                </Text>
                <Text className="text-gray-500 text-xs mt-2 uppercase">
                  {format(new Date(selectedPost.createdAt), 'MMM dd, yyyy')}
                </Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* 1. Share Profile Bottom Sheet */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-extrabold text-gray-900">Share Profile</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)} className="bg-gray-100 p-2 rounded-full">
                <X size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full border-2 border-emerald-500 overflow-hidden mb-3">
                <Image source={{ uri: displayLogo }} className="w-full h-full" />
              </View>
              <Text className="text-lg font-bold text-gray-800">{displayName}</Text>
              <Text className="text-sm text-gray-500">tunzaa.co.tz/winga/{affiliateDetails?.id || 'profile'}</Text>
            </View>

            <View className="flex-row justify-center gap-4">
              <TouchableOpacity 
                onPress={handleCopyLink}
                className="items-center gap-2"
              >
                <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center">
                  <Copy size={24} color="#4B5563" />
                </View>
                <Text className="text-xs font-semibold text-gray-600">Copy Link</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleShareLink}
                className="items-center gap-2"
              >
                <View className="w-14 h-14 bg-blue-50 rounded-full items-center justify-center">
                  <Share2 size={24} color="#3B5191" />
                </View>
                <Text className="text-xs font-semibold text-gray-600">Share Via</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Choose Shop Modal */}
      <Modal
        visible={showChooseShopModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChooseShopModal(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center p-6">
          <View className="bg-white w-full rounded-3xl overflow-hidden">
            <View className="p-5 border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
              <Text className="text-lg font-extrabold text-gray-900">Switch Account</Text>
              <TouchableOpacity onPress={() => setShowChooseShopModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <TouchableOpacity 
                onPress={() => setShowChooseShopModal(false)}
                className="flex-row items-center gap-4 p-4 rounded-2xl mb-2 bg-blue-50/50 border border-blue-100"
              >
                <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  <Image source={{ uri: displayLogo }} className="w-full h-full" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-base font-extrabold text-gray-800">{displayName}</Text>
                    <CheckCircle size={14} color="#10B981" fill="#FFFFFF" />
                  </View>
                  <Text className="text-xs text-gray-500 font-medium">{displayLocation}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center gap-4 p-4 mt-2">
                <View className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 items-center justify-center">
                  <Plus size={24} color="#9CA3AF" />
                </View>
                <Text className="text-base font-extrabold text-gray-600">Add another account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. Diamond Status Modal */}
      <Modal
        visible={showDiamondModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDiamondModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-white w-full rounded-3xl p-6 items-center">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
              <Award size={32} color="#425BA4" />
            </View>
            <Text className="text-2xl font-extrabold text-gray-900 mb-2">Diamond Status</Text>
            <Text className="text-center text-gray-500 font-medium leading-5 mb-6">
              You are currently in the Diamond Tier. Maintain high sales and low dispute rates to keep your status and enjoy premium benefits.
            </Text>
            
            <TouchableOpacity 
              onPress={() => setShowDiamondModal(false)}
              className="bg-[#3B5191] w-full py-4 rounded-xl items-center"
            >
              <Text className="text-white font-extrabold text-base">Got it, thanks!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
