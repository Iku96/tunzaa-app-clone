import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LayoutGrid } from 'lucide-react-native';
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
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
import { ActivationStatusCard } from "@/components/account/ActivationStatusCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";
import { AppVersion } from "@/components/account/AppVersion";
import SidebarMenu from '@/src/components/merchant/SidebarMenu';

const AccountScreen = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { user, logout, refreshProfile } = useTunzaaAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showDocumentStatusModal, setShowDocumentStatusModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileCreationModal, setShowProfileCreationModal] = useState(false);
  const [selectedProfileType, setSelectedProfileType] = useState<"delivery" | "winga" | null>(null);
  const { isDesktop } = useResponsive();
  
  usePageTitle("Account");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
      await refreshProfile();
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleVerificationClick = () => {
    const vendorProfile = user?.profiles?.find((p: any) => p.role === 'vendor');
    if (!vendorProfile) return;

    const kyc = vendorProfile.kyc;
    if (kyc && !kyc.verified) {
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
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Failed to refresh profile after KYC:', error);
    }
  };

  const handleProfileCreationClose = () => {
    setShowProfileCreationModal(false);
    setSelectedProfileType(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <SidebarMenu isVisible={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={toggleSidebar}>
            <LayoutGrid size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <LanguageSelector />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4 gap-4" style={{
            alignSelf: "center",
            width: isDesktop ? 600 : "100%",
          }}>
          {/* Profile Card */}
          <ProfileCard />

          {/* Verification Card */}
          {user?.profiles?.some((p: any) => p.role === 'vendor') && (
            <VerificationCard onPress={handleVerificationClick} />
          )}

          {/* Activation Status Card */}
          {user?.profiles?.some((p: any) => p.role === 'vendor') && (
            <ActivationStatusCard />
          )}

          {/* Menu Cards */}
          <MenuCards showDeliveryAddresses={false} showAffiliateRequests={false} showWishlist={false} />

          {/* Other Roles Cards */}
          <OtherRolesCards />

          {/* Logout Button */}
          <View className="mt-6 mb-10">
            <Button
              variant="destructive"
              onPress={handleLogout}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl"
            >
              <Text className="text-base font-medium text-white">
                {isLoading ? t("common.saving") : t("account.sign_out")}
              </Text>
            </Button>
          </View>
        </View>

        <View className="flex-row justify-center pb-10">
              <AppVersion />
            </View>
      </ScrollView>

      <KycModal 
        isOpen={showKycModal} 
        onClose={() => setShowKycModal(false)}
        onSuccess={handleKycSuccess}
      />

      {user?.profiles?.find((p: any) => p.role === 'vendor')?.metadata?.vendor_id && (
        <DocumentStatusModal
          isOpen={showDocumentStatusModal}
          onClose={() => setShowDocumentStatusModal(false)}
          vendorDetails={user?.profiles?.find((p: any) => p.role === 'vendor')?.metadata}
          onResubmit={handleResubmitDocuments}
        />
      )}

      <ProfileCreationModal
        isOpen={showProfileCreationModal}
        onClose={handleProfileCreationClose}
        profileType={selectedProfileType}
      />
    </SafeAreaView> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  }
});

export default AccountScreen;
