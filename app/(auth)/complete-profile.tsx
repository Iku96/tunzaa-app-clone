import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth, type UserRole } from "@/context/auth";
import { BuyerForm, type BuyerFormData } from "@/components/forms/BuyerForm";
import { VendorForm, type VendorFormData } from "@/components/forms/VendorForm";
import {
  DeliveryForm,
  type DeliveryFormData,
} from "@/components/forms/DeliveryForm";
import {
  AffiliateForm,
  type AffiliateFormData,
} from "@/components/forms/AffiliateForm";
import { Text } from "@/components/ui/text";
import AuthHeader from "@/features/auth/components/AuthHeader";
import {
  useRegister,
  useCreateVendor,
  useCreateDeliveryPartner,
} from "@/services/auth";
import { useCreateAffiliate } from "@/services/affiliates";
import { useAuthStore } from "@/stores/auth";
import { navigateToRoleHome } from "@/utils/navigation";
import { getTempPhoneNumber, clearTempPhoneNumber, setNewlyRegisteredFlag } from "@/utils/storage";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "@/services/config";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTenantModules } from "@/hooks/useTenantModules";

const generateStoreSlug = (storeName: string): string => {
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

type Step = "basic-info" | "role-selection" | "role-form";

export default function CompleteProfileScreen() {
  const { userType, error, register, setUserType, login, socialLogin } = useAuth();
  const { user: tunzaaUser, isAuthenticated: isTunzaaAuthenticated } = useTunzaaAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>("basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cachedPhoneNumber, setCachedPhoneNumber] = useState<string | null>(
    null
  );
  const [registrationData, setRegistrationData] = useState<{
    userData: BuyerFormData;
    authResponse?: any;
    isRegistered: boolean;
  } | null>(null);
  const [socialAuthData, setSocialAuthData] = useState<any>(null);
  const [isSocialAuth, setIsSocialAuth] = useState(false);
  const [registrationProgress, setRegistrationProgress] = useState<{
    step: 'idle' | 'registering' | 'creating-profile' | 'logging-in' | 'done';
    message: string;
  }>({
    step: 'idle',
    message: '',
  });

  const createVendor = useCreateVendor();
  const createDeliveryPartner = useCreateDeliveryPartner();
  const createAffiliate = useCreateAffiliate();
  const { clearRegistrationState, registrationPhone } = useAuthStore();
  usePageTitle("Complete-profile");

  useEffect(() => {
    const socialAuth = params.socialAuth === "true";
    const socialData = params.socialData
      ? JSON.parse(params.socialData as string)
      : null;

    if (socialAuth && socialData) {
      setIsSocialAuth(true);
      setSocialAuthData(socialData);

      const userData: BuyerFormData = {
        name: socialData.name || socialData.display_name || "",
        email: socialData.email || "",
        password: "",
      };

      setRegistrationData({
        userData,
        authResponse: socialData,
        isRegistered: true, // Social auth users are already registered
      });

      setCurrentStep("role-selection");
    }
  }, [params.socialAuth, params.socialData]);

  // BRIDGE: Detect if user just came from Tunzaa registration flow
  useEffect(() => {
    if (isTunzaaAuthenticated && tunzaaUser && !registrationData && !isSocialAuth) {
      console.log("🌉 [CompleteProfile] Bridging TunzaaAuth user data...");
      setRegistrationData({
        userData: {
          name: `${tunzaaUser.first_name || ''} ${tunzaaUser.last_name || ''}`.trim(),
          email: tunzaaUser.email || '',
          password: '', // Password already set in previous step
        },
        isRegistered: true,
      });
      setCurrentStep("role-selection");
    }
  }, [isTunzaaAuthenticated, tunzaaUser, isSocialAuth]);

  useEffect(() => {
    const loadPhoneNumber = async () => {
      const tempPhone = await getTempPhoneNumber();
      const storePhone = registrationPhone;
      const phoneNumber = storePhone || tempPhone;
      setCachedPhoneNumber(phoneNumber);
    };

    loadPhoneNumber();
  }, [registrationPhone]);

  const handleBasicInfoSubmit = async (data: BuyerFormData) => {
    // Just cache the data, don't call register API yet
    // Registration will happen after role selection
    setRegistrationData({
      userData: data,
      isRegistered: false,
    });
    setCurrentStep("role-selection");
  };

  const handleRoleSelection = (role: UserRole) => {
    setUserType(role);
    if (role === "buyer") {
      handleBuyerRole();
    } else {
      setCurrentStep("role-form");
    }
  };

  const handleBuyerRole = async () => {
    if (!registrationData) return;

    setIsSubmitting(true);
    try {
      if (isSocialAuth || registrationData.isRegistered) {
        // User is already authenticated or registered
        if (isSocialAuth) {
            setRegistrationProgress({ step: 'logging-in', message: 'Logging you in...' });
            await socialLogin(socialAuthData);
        }
        
        await setNewlyRegisteredFlag();
        await AsyncStorage.removeItem('IS_FIRST_TIME_BUYER');
        setRegistrationProgress({ step: 'done', message: 'Success!' });
        navigateToRoleHome(router, "buyer");
      } else {
        // Regular registration flow - register user first
        setRegistrationProgress({ step: 'registering', message: 'Creating your account...' });
        
        const nameParts = registrationData.userData.name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || firstName;

        const authResponse = await register(
          {
            first_name: firstName,
            last_name: lastName,
            email: registrationData.userData.email,
            phone_number: cachedPhoneNumber || "",
            password: registrationData.userData.password,
          },
          false
        );

        // Login after registration
        setRegistrationProgress({ step: 'logging-in', message: 'Logging you in...' });
        const identifier = registrationData.userData.email || cachedPhoneNumber || "";
        await login(identifier, registrationData.userData.password);

        clearRegistrationState();
        await clearTempPhoneNumber();
        await setNewlyRegisteredFlag();
        await AsyncStorage.removeItem('IS_FIRST_TIME_BUYER');
        setRegistrationProgress({ step: 'done', message: 'Success!' });
        navigateToRoleHome(router, "buyer");
      }
    } catch (err: any) {
      setRegistrationProgress({ step: 'idle', message: '' });
      Alert.alert(
        "Registration Failed", 
        err.message || "An error occurred while setting up your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorSubmit = async (data: VendorFormData) => {
    if (!registrationData) return;

    setIsSubmitting(true);
    let userId: string | undefined;
    
    try {
      const nameParts = registrationData.userData.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || firstName;
      const storeSlug = generateStoreSlug(data.businessName);

      // Step 1: Register user (if not already registered)
      if (isSocialAuth || registrationData.isRegistered) {
        userId = socialAuthData?.user_id || tunzaaUser?.user_id || tunzaaUser?.id;
      } else {
        setRegistrationProgress({ step: 'registering', message: 'Creating your account...' });
        
        const authResponse = await register(
          {
            first_name: firstName,
            last_name: lastName,
            email: registrationData.userData.email,
            phone_number: cachedPhoneNumber || "",
            password: registrationData.userData.password,
          },
          false
        );
        userId = authResponse.user_id;
      }

      // Step 2: Create vendor profile
      setRegistrationProgress({ step: 'creating-profile', message: 'Setting up your vendor profile...' });
      
      await createVendor.mutateAsync({
        userId: userId || "",
        data: {
          user: {
            user_id: userId || "",
            first_name: firstName,
            last_name: lastName,
            email: registrationData.userData.email,
            phone_number: cachedPhoneNumber || "",
          },
          business_name: data.businessName,
          display_name: data.businessName,
          contact_email: registrationData.userData.email,
          contact_phone: data.contactDetails,
          policy: "",
          website: "",
          address_line1: data.location?.address || data.address || "",
          address_line2: "",
          city: data.location?.city || "Dar es salaam",
          state_province: data.location?.city || "Dar es salaam",
          postal_code: "",
          country: data.location?.country || "Tanzania",
          tax_id: "",
          bank_account: {
            bank_name: "",
            account_number: "",
            account_name: "",
            swift_code: "",
            branch_code: "",
          },
          verification_documents: [],
          commission_rate: "",
          store: {
            store_name: data.businessName,
            store_slug: storeSlug,
            description: `Welcome to ${data.businessName}`,
            branding: {
              logo_url: data.businessLogo || "",
              colors: {
                primary: "",
                secondary: "",
                accent: "",
                text: "",
                background: "",
              },
            },
            banners: [],
          },
        },
      });

      // Step 3: Login (if not already authenticated)
      if (!isSocialAuth && !registrationData.isRegistered) {
        setRegistrationProgress({ step: 'logging-in', message: 'Logging you in...' });
        clearRegistrationState();
        await clearTempPhoneNumber();
        const identifier = registrationData.userData.email || cachedPhoneNumber || "";
        await login(identifier, registrationData.userData.password);
      } else if (isSocialAuth) {
        await socialLogin(socialAuthData);
      }
      
      await setNewlyRegisteredFlag();
      await AsyncStorage.removeItem('IS_FIRST_TIME_BUYER');
      setRegistrationProgress({ step: 'done', message: 'Success!' });
      navigateToRoleHome(router, "vendor");
    } catch (err: any) {
      setRegistrationProgress({ step: 'idle', message: '' });
      
      // Enhanced error handling
      let errorTitle = "Registration Failed";
      let errorMessage = err.message || "An error occurred";
      
      if (userId && registrationProgress.step === 'creating-profile') {
        errorTitle = "Profile Creation Failed";
        errorMessage = "Your account was created, but we couldn't complete your vendor profile. Please try logging in or contact support.";
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliverySubmit = async (data: DeliveryFormData) => {
    if (!registrationData) return;
    setIsSubmitting(true);
    let userId: string | undefined;

    try {
      const nameParts = registrationData.userData.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // Step 1: Register user (if not already registered)
      if (isSocialAuth || registrationData.isRegistered) {
        userId = socialAuthData?.user_id || tunzaaUser?.user_id || tunzaaUser?.id;
      } else {
        setRegistrationProgress({ step: 'registering', message: 'Creating your account...' });
        
        const authResponse = await register(
          {
            first_name: firstName,
            last_name: lastName,
            email: registrationData.userData.email,
            phone_number: cachedPhoneNumber || "",
            password: registrationData.userData.password,
          },
          false
        );
        userId = authResponse.user_id;
      }

      // Step 2: Create delivery partner profile
      setRegistrationProgress({ step: 'creating-profile', message: 'Setting up your delivery partner profile...' });
      
      const deliveryData: any = {
        user: {
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          email: registrationData.userData.email,
          phone_number: cachedPhoneNumber || "",
        },
        type: data.formType,
        name: registrationData.userData.name,
        commission_percent: 0,
      };

      await createDeliveryPartner.mutateAsync({
        userId: userId || "",
        data: deliveryData,
      });

      // Step 3: Login (if not already authenticated)
      if (!isSocialAuth && !registrationData.isRegistered) {
        setRegistrationProgress({ step: 'logging-in', message: 'Logging you in...' });
        clearRegistrationState();
        await clearTempPhoneNumber();
        const identifier = registrationData.userData.email || cachedPhoneNumber || "";
        await login(identifier, registrationData.userData.password);
      } else if (isSocialAuth) {
        await socialLogin(socialAuthData);
      }
      
      await setNewlyRegisteredFlag();
      await AsyncStorage.removeItem('IS_FIRST_TIME_BUYER');
      setRegistrationProgress({ step: 'done', message: 'Success!' });
      navigateToRoleHome(router, "delivery");
    } catch (err: any) {
      setRegistrationProgress({ step: 'idle', message: '' });
      
      // Enhanced error handling
      let errorTitle = "Registration Failed";
      let errorMessage = err.message || "An error occurred";
      
      if (userId && registrationProgress.step === 'creating-profile') {
        errorTitle = "Profile Creation Failed";
        errorMessage = "Your account was created, but we couldn't complete your delivery partner profile. Please try logging in or contact support.";
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAffiliateSubmit = async (data: AffiliateFormData) => {
    if (!registrationData) return;

    setIsSubmitting(true);
    let userId: string | undefined;
    
    try {
      const nameParts = registrationData.userData.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // Step 1: Register user (if not already registered)
      if (isSocialAuth || registrationData.isRegistered) {
        userId = socialAuthData?.user_id || tunzaaUser?.user_id || tunzaaUser?.id;
      } else {
        setRegistrationProgress({ step: 'registering', message: 'Creating your account...' });
        
        const authResponse = await register(
          {
            first_name: firstName,
            last_name: lastName,
            email: registrationData.userData.email,
            phone_number: cachedPhoneNumber || "",
            password: registrationData.userData.password,
          },
          false
        );
        userId = authResponse.user_id;
      }

      // Step 2: Create affiliate profile
      setRegistrationProgress({ step: 'creating-profile', message: 'Setting up your affiliate profile...' });
      
      const socialMedia: any = {};
      if (data.instagram) socialMedia.instagram = data.instagram;
      if (data.twitter) socialMedia.twitter = data.twitter;
      if (data.facebook) socialMedia.facebook = data.facebook;

      await createAffiliate.mutateAsync({
        tenant_id: API_CONFIG.TENANT_ID,
        user_id: userId || "",
        name: registrationData.userData.name,
        email: registrationData.userData.email,
        phone: cachedPhoneNumber || "",
        bio: data.bio,
        website: "",
        social_media: Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
      });

      // Step 3: Login (if not already authenticated)
      if (!isSocialAuth && !registrationData.isRegistered) {
        setRegistrationProgress({ step: 'logging-in', message: 'Logging you in...' });
        clearRegistrationState();
        await clearTempPhoneNumber();
        const identifier = registrationData.userData.email || cachedPhoneNumber || "";
        await login(identifier, registrationData.userData.password);
      } else if (isSocialAuth) {
        await socialLogin(socialAuthData);
      }
      
      await setNewlyRegisteredFlag();
      await AsyncStorage.removeItem('IS_FIRST_TIME_BUYER');
      setRegistrationProgress({ step: 'done', message: 'Success!' });
      navigateToRoleHome(router, "affiliate" as any);
    } catch (err: any) {
      setRegistrationProgress({ step: 'idle', message: '' });
      Alert.alert("Registration Failed", err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "basic-info":
        return <BuyerForm onSubmit={handleBasicInfoSubmit} isLoading={isSubmitting} />;
      case "role-selection":
        return (
          <View style={styles.roleContainer}>
            <TouchableOpacity
              className="p-4 bg-primary/10 rounded-xl border border-primary/20"
              onPress={() => handleRoleSelection("buyer")}
            >
              <Text className="text-lg font-semibold text-primary">Buyer</Text>
              <Text className="text-sm text-muted-foreground">Shop for products on Tunzaa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 bg-primary/10 rounded-xl border border-primary/20"
              onPress={() => handleRoleSelection("vendor")}
            >
              <Text className="text-lg font-semibold text-primary">Vendor</Text>
              <Text className="text-sm text-muted-foreground">Sell your products on Tunzaa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 bg-primary/10 rounded-xl border border-primary/20"
              onPress={() => handleRoleSelection("delivery")}
            >
              <Text className="text-lg font-semibold text-primary">Delivery Partner</Text>
              <Text className="text-sm text-muted-foreground">Deliver orders to customers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 bg-primary/10 rounded-xl border border-primary/20"
              onPress={() => handleRoleSelection("winga")}
            >
              <Text className="text-lg font-semibold text-primary">Affiliate (Winga)</Text>
              <Text className="text-sm text-muted-foreground">Earn commissions by referring sales</Text>
            </TouchableOpacity>
          </View>
        );
      case "role-form":
        switch (userType) {
          case "vendor":
            return <VendorForm onSubmit={handleVendorSubmit} isLoading={isSubmitting} />;
          case "delivery":
            return <DeliveryForm onSubmit={handleDeliverySubmit} isLoading={isSubmitting} />;
          case "winga":
            return <AffiliateForm onSubmit={handleAffiliateSubmit} isLoading={isSubmitting} />;
          default:
            return null;
        }
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "basic-info":
        return "Create your account";
      case "role-selection":
        return "Choose your role";
      case "role-form":
        return "Complete your profile";
      default:
        return "Complete your profile";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "basic-info":
        return "Tell us a bit about yourself";
      case "role-selection":
        return "What would you like to do on our platform?";
      case "role-form":
        return "Tell us more about your business";
      default:
        return "Tell us a bit about yourself";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-muted">
      <AuthHeader />
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={Platform.OS === "web" ? styles.webCenterContainer : styles.mobileContainer}>
            <View style={Platform.OS === "web" ? styles.webCard : styles.formWrapper}>
              <Text className="text-4xl font-bold text-foreground mb-2">
                {getStepTitle()}
              </Text>
              <Text className="text-base text-muted-foreground mb-6">
                {getStepDescription()}
              </Text>

              {error && (
                <View className="bg-destructive/10 p-4 rounded-lg mb-4">
                  <Text className="text-sm text-destructive">{error}</Text>
                </View>
              )}

              {renderCurrentStep()}
              
              {isSubmitting && registrationProgress.step !== 'idle' && (
                <View className="mt-4">
                  <Text className="text-sm text-muted-foreground text-center">
                    {registrationProgress.message}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  mobileContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
  },
  webCenterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  formWrapper: {
    width: "100%",
    maxWidth: 600,
  },
  webCard: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  roleContainer: {
    gap: 16,
  },
});
