import React, { useState, useEffect } from "react";
import { View, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { AffiliateHome } from "@/components/home/AffiliateHome";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [step, setStep] = useState(3); // Onboarding Steps: 3 (Details), 4 (Industry), 5 (Documents)
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [businessName, setBusinessName] = useState("");
  const [businessBio, setBusinessBio] = useState("");
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [nidaImage, setNidaImage] = useState<string | null>(null);

  const router = useRouter();

  const industriesList = [
    { id: "market", label: "Market" },
    { id: "food", label: "Food" },
    { id: "tourism", label: "Tourism" },
    { id: "entertainment", label: "Entertainment" },
    { id: "beauty", label: "Beauty" },
    { id: "tech", label: "Technology industry" },
    { id: "baby", label: "Mother and baby product" },
    { id: "books", label: "Books" },
    { id: "deals", label: "Deals & Discounts" },
    { id: "auto", label: "Automotive" }
  ];

  // Localized dictionary matching active selected language
  const translations = {
    en: {
      stepTitle: "Mauzo by Tunzaa",
      wingaOnboardingTitle: "Weka Taarifa Zako Kama Winga",
      wingaOnboardingSubtitle: "Logo, store name and store details are important in creating your Tunzaa store.",
      uploadLogo: "Weka logo*",
      businessNamePlaceholder: "Add business name",
      moreDetailsTitle: "Weka Maelezo zaidi *",
      moreDetailsPlaceholder: "Weka maelezo hapa",
      wordLimit: "Must not exceed 240 words",
      requiredField: "Required field *",
      backBtn: "Rudi",
      continueBtn: "Endelea",
      // Step 4 (Industry)
      industryTitle: "Choose your meet industry",
      industrySubtitle: "Please select the relevant sector of your mishe",
      continueIndustry: "Continue",
      skipIndustry: "Skip",
      // Step 5 (Documents)
      docTitle: "Hati Za Kampuni",
      docSubtitle: "It is important to attach business documents for better security of your account.",
      uploadHeader: "Upload the following details",
      nidaLabel: "National ID (NIDA)",
      uploadSuccess: "Document uploaded successfully",
      // Alerts & Common
      successTitle: "Congratulations!",
      successSubtitle: "Your Winga profile has been successfully configured. Click below to open your dashboard.",
      openDashboard: "Open My Dashboard",
      requiredAlertTitle: "Required Field",
      requiredAlertName: "Please enter your store name.",
      requiredAlertNida: "Please upload your NIDA identity card.",
    },
    sw: {
      stepTitle: "Mauzo by Tunzaa",
      wingaOnboardingTitle: "Weka Taarifa Zako Kama Winga",
      wingaOnboardingSubtitle: "Logo, jina la duka na maelezo ya duka ni muhimu katika kuunda duka lako Tunzaa.",
      uploadLogo: "Weka logo*",
      businessNamePlaceholder: "Add business name",
      moreDetailsTitle: "Weka Maelezo zaidi *",
      moreDetailsPlaceholder: "Weka maelezo hapa",
      wordLimit: "Isizidi maneno 240",
      requiredField: "Sehemu ya lazima *",
      backBtn: "Rudi",
      continueBtn: "Endelea",
      // Step 4 (Industry)
      industryTitle: "Choose your meet industry",
      industrySubtitle: "Please select the relevant sector of your mishe",
      continueIndustry: "Continue",
      skipIndustry: "Skip",
      // Step 5 (Documents)
      docTitle: "Hati Za Kampuni",
      docSubtitle: "Ni muhimu kuambatanisha hati za biashara kwa usalama zaidi wa akaunti yako.",
      uploadHeader: "Pakia taarifa zifuatazo",
      nidaLabel: "Kitambulisho cha Taifa",
      uploadSuccess: "Hati imepakiwa kikamilifu",
      // Alerts & Common
      successTitle: "Hongera sana!",
      successSubtitle: "Profaili yako ya Winga imekamilishwa na kusanidiwa kwa mafanikio. Bofya hapa chini kufungua dashboard yako.",
      openDashboard: "Fungua Dashboard Yangu",
      requiredAlertTitle: "Taarifa ya Lazima",
      requiredAlertName: "Tafadhali weka jina la duka lako.",
      requiredAlertNida: "Tafadhali weka na pakia Kitambulisho cha Taifa.",
    }
  };

  const t = translations[language === 'en' ? 'en' : 'sw'];

  useEffect(() => {
    // Prefill form if temporary profile exists
    const loadSavedData = async () => {
      const savedName = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_NAME");
      const savedBio = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_BIO");
      const savedLogo = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_LOGO");
      const savedNida = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_NIDA");
      const savedInds = await AsyncStorage.getItem("TEMP_WINGA_PROFILE_INDUSTRIES");
      if (savedName) setBusinessName(savedName);
      if (savedBio) setBusinessBio(savedBio);
      if (savedLogo) setLogoImage(savedLogo);
      if (savedNida) setNidaImage(savedNida);
      if (savedInds) setSelectedIndustries(JSON.parse(savedInds));
    };
    loadSavedData();
  }, []);

  // Local state to bypass onboarding in testing
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Check local flag for fast loading
  useEffect(() => {
    const checkOnboardingDone = async () => {
      try {
        const done = await AsyncStorage.getItem("WINGA_ONBOARDING_COMPLETE");
        if (done === "true") {
          setIsOnboardingDone(true);
        }
      } catch (err) {
        // safe ignore
      } finally {
        setIsCheckingOnboarding(false);
      }
    };
    checkOnboardingDone();
  }, []);

  if (!user || isCheckingOnboarding) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B5191" />
      </View>
    );
  }

  // Check if they already have an active/verified affiliate profile
  const affiliateProfile = Array.isArray(user?.profiles)
    ? user.profiles.find((p) => p.role === "winga")
    : null;

  const isVerified = affiliateProfile?.kyc?.verified;

  if (isVerified || isOnboardingDone) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-muted" edges={['top', 'left', 'right']}>
        <AffiliateHome />
      </SafeAreaView>
    );
  }

  const pickImage = async (type: 'logo' | 'nida') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Error", "We need access to your gallery to upload images.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        if (type === 'logo') {
          setLogoImage(result.assets[0].uri);
        } else {
          setNidaImage(result.assets[0].uri);
        }
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  const toggleIndustry = (id: string) => {
    if (selectedIndustries.includes(id)) {
      setSelectedIndustries(selectedIndustries.filter((item) => item !== id));
    } else {
      setSelectedIndustries([...selectedIndustries, id]);
    }
  };

  const handleNextStep = async () => {
    if (step === 3) {
      if (!businessName.trim()) {
        Alert.alert(t.requiredAlertTitle, t.requiredAlertName);
        return;
      }
      // Persist step 3 details to AsyncStorage
      await AsyncStorage.setItem("TEMP_WINGA_PROFILE_NAME", businessName.trim());
      await AsyncStorage.setItem("TEMP_WINGA_PROFILE_BIO", businessBio.trim());
      if (logoImage) {
        await AsyncStorage.setItem("TEMP_WINGA_PROFILE_LOGO", logoImage);
      }
      setStep(4);
    } else if (step === 4) {
      await AsyncStorage.setItem("TEMP_WINGA_PROFILE_INDUSTRIES", JSON.stringify(selectedIndustries));
      setStep(5);
    } else if (step === 5) {
      if (!nidaImage) {
        Alert.alert(t.requiredAlertTitle, t.requiredAlertNida);
        return;
      }
      await AsyncStorage.setItem("TEMP_WINGA_PROFILE_NIDA", nidaImage);
      setStep(6);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // Persist onboarding completeness
      await AsyncStorage.setItem("WINGA_ONBOARDING_COMPLETE", "true");
      setIsOnboardingDone(true);
    } catch (e) {
      Alert.alert("Error", "Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: step === 4 ? '#FFFFFF' : '#315BA9' }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* STEP 4: WHITE BACKGROUND INTEREST PAGE (Choose your meet industry) */}
          {step === 4 && (
            <View className="flex-1 px-6 pb-8 pt-4">
              
              {/* Back Arrow & Title */}
              <View className="flex-row items-center mb-2 mt-2">
                <TouchableOpacity onPress={() => setStep(3)} className="p-2 mr-3 bg-gray-50 rounded-full">
                  <Ionicons name="arrow-back" size={22} color="#1D1E1F" />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 text-left">
                    {t.industryTitle}
                  </Text>
                  <Text className="text-xs text-gray-400 text-left mt-0.5">
                    {t.industrySubtitle}
                  </Text>
                </View>
              </View>

              {/* Centered TUNZAA Wordmark */}
              <View className="items-center my-10">
                <Text style={{ fontSize: 44, fontWeight: '900', color: '#3B5191', letterSpacing: 1.5, fontFamily: 'Gilroy-Bold' }}>
                  TUNZAA
                </Text>
              </View>

              {/* Badges Grid */}
              <View style={styles.badgeContainer}>
                {industriesList.map((ind) => {
                  const isSelected = selectedIndustries.includes(ind.id);
                  return (
                    <TouchableOpacity
                      key={ind.id}
                      onPress={() => toggleIndustry(ind.id)}
                      style={[
                        styles.badgePill,
                        isSelected && styles.badgePillSelected
                      ]}
                    >
                      <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                        {ind.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Button: Continue */}
              <TouchableOpacity 
                onPress={handleNextStep}
                className="bg-[#3B5191] rounded-3xl py-4 items-center justify-center shadow-lg mb-6 mt-8"
              >
                <Text className="text-white text-base font-extrabold">{t.continueIndustry}</Text>
              </TouchableOpacity>

              {/* Skip Footer Button */}
              <TouchableOpacity onPress={() => setStep(5)} className="flex-row items-center justify-center gap-1 py-2">
                <Text className="text-[#3B5191] text-base font-bold">{t.skipIndustry}</Text>
                <Ionicons name="arrow-forward" size={18} color="#3B5191" />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3 & STEP 5 LAYOUTS (Royal Blue theme) */}
          {step !== 4 && (
            <>
              {/* HEADER SECTION */}
              <View className="items-center pt-6 pb-2">
                <Text style={styles.mainTitle}>{t.stepTitle}</Text>
              </View>

              {/* STEPPER INDICATOR */}
              <View className="flex-row items-center justify-center py-4 px-10 mb-2">
                {[1, 2, 3, 4, 5].map((s, index) => (
                  <View key={s} className="flex-row items-center flex-1 justify-center">
                    {/* Stepper Circle */}
                    <View 
                      style={[
                        styles.stepCircle,
                        s < step ? styles.stepCircleCompleted : s === step ? styles.stepCircleActive : styles.stepCircleInactive
                      ]}
                    >
                      {s < (step === 6 ? 6 : step) ? (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.stepNumber, s === step ? styles.stepNumberActive : styles.stepNumberInactive]}>
                          {s}
                        </Text>
                      )}
                    </View>

                    {/* Stepper Connective Line */}
                    {index < 4 && (
                      <View 
                        style={[
                          styles.stepLine,
                          s < (step === 6 ? 6 : step) ? styles.stepLineCompleted : styles.stepLineInactive
                        ]} 
                      />
                    )}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* STEP 3: MOCKUP WINGA DETAILS */}
          {step === 3 && (
            <View className="flex-1 px-6 pb-8">
              <View className="items-center mb-6">
                <Text style={{ fontFamily: 'Gilroy-Bold' }} className="text-2xl font-extrabold text-white text-center mb-2">
                  {t.wingaOnboardingTitle}
                </Text>
                <Text className="text-xs text-white/80 text-center px-4 leading-5">
                  {t.wingaOnboardingSubtitle}
                </Text>
              </View>

              {/* WHITE CARD CONTAINER (Rounded corners 32) */}
              <View className="bg-white rounded-[32px] overflow-hidden p-6 mb-8 shadow-2xl">
                
                {/* Top Avatar Area with light blue background */}
                <View className="bg-[#EFF4FB] rounded-2xl py-6 items-center justify-center relative mb-6">
                  <TouchableOpacity style={{ position: 'absolute', top: 12, right: 12 }} className="p-1" onPress={() => pickImage('logo')}>
                    <Ionicons name="camera" size={22} color="#4B5563" />
                  </TouchableOpacity>

                  <TouchableOpacity className="w-24 h-24 rounded-full border-2 border-dashed border-blue-800 bg-white items-center justify-center relative overflow-hidden" onPress={() => pickImage('logo')}>
                    {logoImage ? (
                      <Image source={{ uri: logoImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <Text className="text-[11px] font-black text-blue-800 text-center px-2">{t.uploadLogo}</Text>
                    )}
                    <View className="absolute bottom-0 right-0 bg-blue-800 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Form Input fields */}
                <View className="gap-5 mb-4">
                  <View>
                    <TextInput
                      style={{ height: 50 }}
                      className="bg-white border border-gray-200 rounded-xl px-4 text-base text-gray-800 font-medium"
                      placeholder={t.businessNamePlaceholder}
                      placeholderTextColor="#9CA3AF"
                      value={businessName}
                      onChangeText={setBusinessName}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-extrabold text-gray-700 mb-1.5">
                      {t.moreDetailsTitle}
                    </Text>
                    <View className="relative">
                      <TextInput
                        style={{ height: 110, textAlignVertical: 'top' }}
                        className="bg-gray-50 rounded-2xl p-4 text-base text-gray-800"
                        placeholder={t.moreDetailsPlaceholder}
                        placeholderTextColor="#9CA3AF"
                        multiline={true}
                        maxLength={240}
                        value={businessBio}
                        onChangeText={setBusinessBio}
                      />
                      <Text className="absolute bottom-3 right-4 text-[10px] text-gray-400 font-bold">
                        {t.wordLimit}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-[10px] text-red-500 font-bold">
                    {t.requiredField}
                  </Text>
                </View>
              </View>

              {/* ACTION BUTTONS ROW */}
              <View className="flex-row gap-4">
                <TouchableOpacity 
                  onPress={() => router.back()}
                  className="flex-1 bg-transparent border-2 border-white/30 rounded-2xl py-3.5 items-center justify-center"
                >
                  <Text className="text-white text-base font-black">{t.backBtn}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleNextStep}
                  className="flex-1 bg-[#84CC16] rounded-2xl py-3.5 items-center justify-center shadow-lg shadow-emerald-800/10"
                >
                  <Text className="text-white text-base font-black">{t.continueBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 5: DOCUMENTS PAGE (Hati Za Kampuni) */}
          {step === 5 && (
            <View className="flex-1 px-6 pb-8">
              <View className="items-center mb-6">
                <Text style={{ fontFamily: 'Gilroy-Bold' }} className="text-2xl font-extrabold text-white text-center mb-2">
                  {t.docTitle}
                </Text>
                <Text className="text-xs text-white/80 text-center px-4 leading-5">
                  {t.docSubtitle}
                </Text>
              </View>

              {/* WHITE CARD CONTAINER (Rounded corners 32) */}
              <View className="bg-white rounded-[32px] p-6 mb-8 shadow-2xl">
                
                {/* Cloud Upload Icon & Header */}
                <View className="flex-row items-center gap-2 mb-4 px-2">
                  <Ionicons name="cloud-upload-outline" size={22} color="#10B981" />
                  <Text className="text-base font-extrabold text-gray-800">{t.uploadHeader}</Text>
                </View>

                {/* Interactive ID Document Upload Card */}
                <TouchableOpacity 
                  onPress={() => pickImage('nida')}
                  style={{
                    backgroundColor: '#F3F4F6',
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: nidaImage ? 12 : 0
                  }}
                >
                  <Text className="text-base font-extrabold text-gray-700">{t.nidaLabel}</Text>
                  <Ionicons name="create-outline" size={20} color="#3B5191" />
                </TouchableOpacity>

                {/* Green Uploaded Success Checkbox */}
                {nidaImage && (
                  <View className="flex-row items-center gap-1.5 px-2">
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text className="text-xs text-green-600 font-bold">{t.uploadSuccess}</Text>
                  </View>
                )}
              </View>

              {/* ACTION BUTTONS ROW */}
              <View className="flex-row gap-4">
                <TouchableOpacity 
                  onPress={() => setStep(4)}
                  className="flex-1 bg-transparent border-2 border-white/30 rounded-2xl py-3.5 items-center justify-center"
                >
                  <Text className="text-white text-base font-black">{t.backBtn}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleNextStep}
                  className="flex-1 bg-[#84CC16] rounded-2xl py-3.5 items-center justify-center shadow-lg shadow-emerald-800/10"
                >
                  <Text className="text-white text-base font-black">{t.continueBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 6: SUCCESS CONGRATULATIONS */}
          {step === 6 && (
            <View className="flex-1 px-6 pb-8 justify-center mt-20">
              <View className="bg-white rounded-[32px] p-8 mb-8 items-center justify-center shadow-2xl">
                <View className="w-20 h-20 bg-emerald-50 rounded-3xl items-center justify-center mb-6">
                  <Ionicons name="checkmark-circle" size={44} color="#059669" />
                </View>
                <Text className="text-2xl font-black text-gray-800 text-center mb-3">
                  {t.successTitle}
                </Text>
                <Text className="text-sm text-gray-500 text-center px-4 leading-5">
                  {t.successSubtitle}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={handleCompleteOnboarding}
                disabled={loading}
                className="bg-[#84CC16] rounded-2xl py-4 items-center justify-center shadow-lg shadow-emerald-800/10 mt-6"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-black">{t.openDashboard}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Gilroy-Bold',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 1,
  },
  stepCircleActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  stepCircleCompleted: {
    backgroundColor: '#84CC16', // Tunzaa Green
    borderColor: '#84CC16',
  },
  stepCircleInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: '#315BA9', // Tunzaa Blue
  },
  stepNumberInactive: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 0,
  },
  stepLineCompleted: {
    backgroundColor: '#84CC16',
  },
  stepLineInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  badgePill: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgePillSelected: {
    borderColor: '#3B5191',
    borderWidth: 2,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1D1E1F',
  },
  badgeTextSelected: {
    color: '#3B5191',
  }
});
