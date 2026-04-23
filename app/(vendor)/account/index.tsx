import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import RoleSwitcher from "@/components/RoleSwitcher";
import { useAuth } from "@/context/auth";
import { useState, useEffect } from "react";
import { KycModal } from "@/components/modals/KycModal";
import { DocumentStatusModal } from "@/components/modals/DocumentStatusModal";
import { LanguageSelector } from "@/components/modals/LanguageSelector";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ProfileCreationModal } from "@/components/modals/ProfileCreationModal";
import { 
  ProfileCard, 
  MenuCards, 
  VerificationCard,
  OtherRolesCards 
} from "@/components/account";
import { useResponsive } from "@/hooks/useResponsive";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { ActivationStatusCard } from "@/components/account/ActivationStatusCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";
import { AppVersion } from "@/components/account/AppVersion";

const AccountScreen = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { user, logout, refreshUserData } = useAuth();
  const [showKycModal, setShowKycModal] = useState(false);
  const [showDocumentStatusModal, setShowDocumentStatusModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileCreationModal, setShowProfileCreationModal] = useState(false);
  const [selectedProfileType, setSelectedProfileType] = useState<"delivery" | "winga" | null>(null);
  const {isDesktop} = useResponsive();
  usePageTitle("Account");
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
    if (!user?.vendorDetails) return;

    console.log(user?.vendorDetails)
    
    const vendorDetails = user.vendorDetails;
    const documents = vendorDetails.verification_documents || [];
    const verificationStatus = vendorDetails.verification_status;
    const hasRejectedDocuments = documents.some((doc: any) => doc.verification_status === "rejected");
    const hasNoDocuments = documents.length === 0;
    
    // Show KYC modal if:
    // - Verification status is not started or rejected
    // - User has rejected documents that need resubmission
    // - User hasn't submitted any documents yet
    if (verificationStatus === "not_started" || verificationStatus === "rejected" || verificationStatus === "pending" || hasRejectedDocuments || hasNoDocuments) {
      setShowKycModal(true);
    } else {
      setShowDocumentStatusModal(true);
    }
  };

  const handleResubmitDocuments = () => {
    setShowDocumentStatusModal(false);
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

  const handleProfileCreationClose = () => {
    setShowProfileCreationModal(false);
    setSelectedProfileType(null);
  };

  return (
     <DesktopLayoutWrapper
                showSidebar={false}
                showSecondaryNav={false}
                showNavBar={true}
                showFooter={true}
                containerClassName="bg-muted"
              >
                <SafeAreaView className="flex-1 bg-muted">
     {!isDesktop && <View className="p-4 border-b border-border bg-background">
        <View className="flex-row justify-between items-center">
          <RoleSwitcher />
          <LanguageSelector />
        </View>
      </View>}

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4 gap-4"  style={{
            alignSelf: "center",
            width: isDesktop ? 600 : "100%",
          }}>
          {/* Profile Card */}
          <ProfileCard />

          {/* Verification Card */}
          {user?.vendorDetails && (
            <VerificationCard onPress={handleVerificationClick} />
          )}

          {/* Activation Status Card */}
          {user?.vendorDetails && (
            <ActivationStatusCard />
          )}

          {/* Menu Cards - Don't show delivery addresses for vendors, but show affiliate requests */}
          <MenuCards showDeliveryAddresses={false} showAffiliateRequests={false} showWishlist={false} />

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

      {user?.vendorDetails && (
        <DocumentStatusModal
          isOpen={showDocumentStatusModal}
          onClose={() => setShowDocumentStatusModal(false)}
          vendorDetails={user.vendorDetails}
          onResubmit={handleResubmitDocuments}
        />
      )}

      <ProfileCreationModal
        isOpen={showProfileCreationModal}
        onClose={handleProfileCreationClose}
        profileType={selectedProfileType}
      />
    </SafeAreaView> 
              </DesktopLayoutWrapper>
   
  );
};

export default AccountScreen;
