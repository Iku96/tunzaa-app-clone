import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, Keyboard, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  ArrowLeft, 
  Check, 
  Camera, 
  ChevronDown, 
  UploadCloud,
  Edit2,
  FileCheck
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useUpdateAffiliate } from "@/src/services/affiliates";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { useUploadFile } from "@/src/services/upload";

export default function EditBusinessProfileScreen() {
  const router = useRouter();
  const { user } = useTunzaaAuth();
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Get dynamic profile details
  const { affiliateDetails, isLoading: profileLoading } = useProfileDetails();
  const affiliateId = affiliateDetails?.id;

  // React Query hooks
  const updateAffiliate = useUpdateAffiliate();
  const uploadFile = useUploadFile();

  // State for holding newly uploaded URLs before saving
  const [pendingLogoUrl, setPendingLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Editable Form states
  const [businessName, setBusinessName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("Electronic");
  const [location, setLocation] = useState("");

  // Scroll active state (only scrolls when focus is active on inputs that can be covered)
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categoriesList = [
    "Market", "Food", "Tourism", "Entertainment", "Beauty", 
    "Technology industry", "Mother and baby product", "Books", 
    "Deals & Discounts", "Automotive", "Electronic"
  ];

  // Attachment states
  const [displayLogo, setDisplayLogo] = useState("");
  const [nidaAttachment, setNidaAttachment] = useState<string | null>(null);

  // Monitor keyboard dismiss to reset scroll state
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        // Scroll back to top to prevent the screen from getting stuck in an offset state
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        
        // Disable scrolling after the animation completes
        setTimeout(() => {
          setScrollEnabled(false);
        }, 300);
      }
    );
    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // Populate form merging Backend data + Onboarding AsyncStorage fallbacks + Auth Context
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedLogo = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_LOGO");
        const savedName = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_NAME");
        const savedNida = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_NIDA");
        const savedLocation = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_LOCATION");
        const savedCategory = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_CATEGORY");
        
        
        const activeName = affiliateDetails?.name || savedName || "Winga Affiliate";
        const letterAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeName)}&background=3B5191&color=fff&size=200`;
        
        setDisplayLogo(affiliateDetails?.profile_picture || savedLogo || letterAvatar);
        if (savedNida) setNidaAttachment(savedNida);

        setBusinessName(activeName);
        setEmailAddress(affiliateDetails?.email || user?.email || "");
        setPhoneNumber(affiliateDetails?.phone || user?.phone_number || "");
        setCategory(savedCategory || affiliateDetails?.website || "Electronic");
        setLocation(savedLocation || "Dar es Salaam");

      } catch (error) {
        console.error("Error loading onboarding data from AsyncStorage", error);
      }
    };

    if (!profileLoading) {
      loadSavedData();
    }
  }, [affiliateDetails, profileLoading, user]);

  const handleSelectAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Sorry, we need camera roll permissions to change your business logo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newLogoUri = asset.uri;
      
      // Update UI optimistically with local path
      setDisplayLogo(newLogoUri);
      setIsUploadingLogo(true);

      try {
        const filename = `winga-logo-${Date.now()}.jpg`;
        const uploadRes = await uploadFile.mutateAsync({
          uri: newLogoUri,
          filename,
          mimeType: 'image/jpeg',
        });
        
        let serverUrl = uploadRes.fileCDNUrl || uploadRes.url || uploadRes.fileUrl;
        if (serverUrl && serverUrl.includes("?")) {
          serverUrl = serverUrl.split("?")[0];
        }

        if (serverUrl) {
          setPendingLogoUrl(serverUrl);
          await AsyncStorage.setItem("TEMP_WINGA_PROFILE_LOGO", serverUrl);
          Alert.alert("Upload Success", "New logo uploaded successfully. Click 'Save' to persist changes.");
        }
      } catch (uploadError) {
        console.error("Avatar upload error:", uploadError);
        Alert.alert("Upload Failed", "We could not upload your profile picture. Please try again.");
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleSelectNida = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Sorry, we need permissions to upload documents.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.2,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newAttachment = result.assets[0].uri;
      setNidaAttachment(newAttachment);
      await AsyncStorage.setItem("TEMP_WINGA_PROFILE_NIDA", newAttachment);
      Alert.alert("Success", "Compliance document uploaded successfully!");
    }
  };

  const handleSelectCategory = () => {
    Keyboard.dismiss();
    setShowCategoryModal(true);
  };

  const handleSaveProfile = async () => {
    if (!businessName.trim() || !phoneNumber.trim()) {
      Alert.alert("Validation Error", "Business name and Phone are required.");
      return;
    }

    if (affiliateId) {
      updateAffiliate.mutate(
        {
          affiliateId,
          data: {
            name: businessName,
            phone: phoneNumber,
            website: category,
            profile_picture: pendingLogoUrl || affiliateDetails?.profile_picture,
          }
        },
        {
          onSuccess: async () => {
            await AsyncStorage.setItem("TEMP_WINGA_PROFILE_NAME", businessName);
            await AsyncStorage.setItem("TEMP_WINGA_PROFILE_LOCATION", location);
            await AsyncStorage.setItem("TEMP_WINGA_PROFILE_CATEGORY", category);
            Alert.alert("Success", "Business profile updated successfully!");
            router.back();
          },
          onError: (err) => {
            Alert.alert("Error", "Failed to update profile. Please try again.");
            console.error("Profile update error:", err);
          }
        }
      );
    } else {
      // Offline fallback — persist locally
      await AsyncStorage.setItem("TEMP_WINGA_PROFILE_NAME", businessName);
      await AsyncStorage.setItem("TEMP_WINGA_PROFILE_LOCATION", location);
      await AsyncStorage.setItem("TEMP_WINGA_PROFILE_CATEGORY", category);
      Alert.alert("Success", "Profile details updated successfully!");
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* 1. HEADER ROW */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Text className="text-lg font-black text-gray-800">Edit business profile</Text>

        {updateAffiliate.isPending ? (
          <ActivityIndicator size="small" color="#3B5191" />
        ) : (
          <TouchableOpacity onPress={handleSaveProfile} className="p-1">
            <Check size={24} color="#3B5191" />
          </TouchableOpacity>
        )}
      </View>

      {profileLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B5191" />
          <Text className="text-xs text-gray-400 font-bold mt-2">Loading profile details...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 120}
          className="flex-1"
        >
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1" 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 180 }}
            scrollEnabled={scrollEnabled}
          >
            
            {/* 2. CIRCULAR BUSINESS AVATAR */}
            <View className="items-center py-8">
              <View className="relative">
                <View className="w-[120px] h-[120px] rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                  <Image 
                    source={{ uri: displayLogo }} 
                    className="w-full h-full"
                  />
                </View>
                <TouchableOpacity 
                  onPress={handleSelectAvatar}
                  className="absolute bottom-0 right-0 bg-[#3B5191] p-2.5 rounded-full border-2 border-white shadow-md"
                >
                  <Camera size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. BUSINESS DETAILS INPUT CARDS */}
            <View className="px-4 pb-6">
              <Text className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Business details</Text>

              <View className="gap-3">
                {/* Business Name Field */}
                <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row justify-between items-center">
                  <View className="flex-1 mr-2">
                    <Text className="text-[10px] font-black text-gray-400 uppercase mb-1">Business name</Text>
                    <TextInput 
                      value={businessName}
                      onChangeText={setBusinessName}
                      placeholder="Enter your business name"
                      className="text-sm font-black text-gray-800 p-0"
                    />
                  </View>
                  <Edit2 size={16} color="#9CA3AF" />
                </View>

                {/* Email Address Field */}
                <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row justify-between items-center">
                  <View className="flex-1 mr-2">
                    <Text className="text-[10px] font-black text-gray-400 uppercase mb-1">Email address</Text>
                    <TextInput 
                      value={emailAddress}
                      onChangeText={setEmailAddress}
                      keyboardType="email-address"
                      placeholder="Enter your email"
                      onFocus={() => setScrollEnabled(true)}
                      onBlur={() => setScrollEnabled(false)}
                      className="text-sm font-black text-gray-800 p-0"
                    />
                  </View>
                  <Edit2 size={16} color="#9CA3AF" />
                </View>

                {/* Phone Number Field */}
                <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row justify-between items-center">
                  <View className="flex-1 mr-2">
                    <Text className="text-[10px] font-black text-gray-400 uppercase mb-1">Phone number</Text>
                    <TextInput 
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      placeholder="Enter your phone number"
                      onFocus={() => setScrollEnabled(true)}
                      onBlur={() => setScrollEnabled(false)}
                      className="text-sm font-black text-gray-800 p-0"
                    />
                  </View>
                  <Edit2 size={16} color="#9CA3AF" />
                </View>

                {/* Location Field */}
                <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row justify-between items-center">
                  <View className="flex-1 mr-2">
                    <Text className="text-[10px] font-black text-gray-400 uppercase mb-1">Location</Text>
                    <TextInput 
                      value={location}
                      onChangeText={setLocation}
                      placeholder="e.g. Dar es Salaam"
                      onFocus={() => setScrollEnabled(true)}
                      onBlur={() => setScrollEnabled(false)}
                      className="text-sm font-black text-gray-800 p-0"
                    />
                  </View>
                  <Edit2 size={16} color="#9CA3AF" />
                </View>

                {/* Category Dropdown */}
                <TouchableOpacity 
                  onPress={handleSelectCategory}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-[10px] font-black text-gray-400 uppercase mb-1">Category</Text>
                    <Text className="text-sm font-black text-gray-800">{category}</Text>
                  </View>
                  <ChevronDown size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. CERTIFICATE / COMPLIANCE UPLOAD SECTION */}
            <View className="px-4 pb-12">
              <Text className="text-sm font-extrabold text-gray-800 mb-1">Certificate / compliance</Text>
              <Text className="text-[11px] text-gray-400 font-bold mb-4">upload or updated verification file</Text>

              {nidaAttachment ? (
                <View className="relative w-full h-40 bg-gray-50 rounded-3xl overflow-hidden border border-gray-200">
                  <Image 
                    source={{ uri: nidaAttachment }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    onPress={handleSelectNida}
                    className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-full shadow-sm flex-row items-center gap-2"
                  >
                    <FileCheck size={16} color="#10B981" />
                    <Text className="text-xs font-black text-gray-800">Change File</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={handleSelectNida}
                  className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-3xl p-8 items-center justify-center"
                >
                  <UploadCloud size={32} color="#3B5191" className="mb-2" />
                  <Text className="text-xs font-black text-blue-900 mb-0.5">Click to upload file</Text>
                  <Text className="text-[10px] text-gray-400 font-bold">PDF, JPG, PNG up to 10MB</Text>
                </TouchableOpacity>
              )}

            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* 5. CUSTOM CATEGORY SELECTION MODAL */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl pt-5 pb-8 max-h-[70%]">
            <View className="px-5 flex-row justify-between items-center mb-4">
              <Text className="text-lg font-black text-gray-800">Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)} className="p-2">
                <Text className="text-sm font-bold text-gray-400">Cancel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} className="px-5">
              {categoriesList.map((cat, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryModal(false);
                  }}
                  className={`py-4 border-b border-gray-100 flex-row justify-between items-center ${category === cat ? 'bg-blue-50/50 -mx-5 px-5' : ''}`}
                >
                  <Text className={`text-base font-bold ${category === cat ? 'text-[#3B5191]' : 'text-gray-700'}`}>
                    {cat}
                  </Text>
                  {category === cat && <Check size={18} color="#3B5191" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
