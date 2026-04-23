import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import RoleSwitcher from "@/components/RoleSwitcher";
import { useAuth } from "@/context/auth";
import { useState, useEffect } from "react";
import { KycModal } from "@/components/modals/KycModal";
import { LanguageSelector } from "@/components/modals/LanguageSelector";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { 
  ProfileCard, 
  MenuCards, 
  VerificationCard,
  OtherRolesCards 
} from "@/components/account";  
import { useI18n } from "@/hooks/useI18n";
import { AppVersion } from "@/components/account/AppVersion";
const AccountScreen = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { user, logout, refreshUserData } = useAuth();
  const [showKycModal, setShowKycModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh user data when component mounts
  useEffect(() => {
    const refreshData = async () => {
      try {
        await refreshUserData();
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    };
    
    refreshData();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleVerificationClick = () => {
    setShowKycModal(true);
  };

  const handleKycSuccess = async () => {
    console.log('KYC submitted successfully, refreshing user data...');
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Failed to refresh user data after KYC submission:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-muted">
      <View className="p-4 border-b border-border bg-background">
        <View className="flex-row justify-between items-center">
          <RoleSwitcher />
          <LanguageSelector />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4 gap-4">
          {/* Profile Card */}
          <ProfileCard />

          {/* Verification Card */}
          <VerificationCard onPress={handleVerificationClick} />

          {/* Menu Cards - Don't show delivery addresses for affiliates */}
          <MenuCards showDeliveryAddresses={false} showAffiliateRequests={false} />

          {/* Other Roles Cards - Shows available roles for expansion */}
          <OtherRolesCards />

          {/* Logout Button */}
          <View className="mt-6">
            <Button
              variant="destructive"
              onPress={handleLogout}
              disabled={isLoading}
              className="w-full"
            >
              <Text className="text-base font-medium text-white">
                {isLoading ? t("common.saving") : t("account.sign_out")}
              </Text>
            </Button>
          </View>
        </View>

        <View className="flex-row justify-center">
              <AppVersion />
            </View>
      </ScrollView>

      <KycModal 
        isOpen={showKycModal} 
        onClose={() => setShowKycModal(false)}
        onSuccess={handleKycSuccess}
      />
    </SafeAreaView>
  );
};

export default AccountScreen;
