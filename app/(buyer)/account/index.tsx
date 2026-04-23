import { View, ScrollView, useWindowDimensions, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { useState, useEffect } from "react";
import { KycModal } from "@/components/modals/KycModal";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
  ProfileCard,
  MenuCards,
  OtherRolesCards,
} from "@/components/account";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { DesktopAccountLayout } from "@/components/account/DesktopAccountLayout"; // <-- new desktop component
import { usePageTitle } from "@/hooks/usePageTitle";
import { AppVersion } from "@/components/account/AppVersion";
import { useI18n } from "@/hooks/useI18n";
import RoleSwitcher from "@/components/RoleSwitcher";
import { LanguageSelector } from "@/components/modals/LanguageSelector";
import CrashTest from "@/components/CrashTest";

const AccountScreen = () => {
  const router = useRouter();
  const { user, logout, refreshUserData } = useAuth();
  const [showKycModal, setShowKycModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Tailwind's md breakpoint
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useI18n();
   usePageTitle(t("account.account"));
  // Refresh user data when component mounts
  useEffect(() => {
    const refreshData = async () => {
      try {
        await refreshUserData();
      } catch (error) {
        console.error("Failed to refresh user data:", error);
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
      console.error("Failed to refresh user data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-muted"
    >
      <SafeAreaView className={`flex-1 ${isDesktop ? 'bg-white' : 'bg-background'}`}>
      {!isDesktop && <View className="p-4 border-b border-border bg-background">
        <View className="flex-row justify-between items-center">
          <RoleSwitcher />
          <LanguageSelector />
        </View>
      </View>}
        {isDesktop ? (
          // === DESKTOP LAYOUT WITH SIDEBAR ===
          <DesktopAccountLayout
            handleLogout={handleLogout}
            isLoading={isLoading}
          />
        ) : (
          // === MOBILE LAYOUT (stacked cards) ===
          
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <View className="p-4 gap-4">
              <ProfileCard />


              <MenuCards
                showWishlist={true}
                showDeliveryAddresses={true}
                showAffiliateRequests={false}
                showRewards={true}
              />

              <OtherRolesCards />

              <Button
                variant="destructive"
                onPress={handleLogout}
                disabled={isLoading}
                className="w-full mt-6"
              >
                <Text className="text-base font-medium text-white">
                  {isLoading ? t("account.signing_out") : t("account.sign_out")}
                </Text>
              </Button>

              <KycModal
                isOpen={showKycModal}
                onClose={() => setShowKycModal(false)}
              />
            </View>

            {/** Add the app version and build number, use a reusable component for this */}
            <View className="flex-row justify-center">
              <AppVersion />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </DesktopLayoutWrapper>
  );
};

export default AccountScreen;
