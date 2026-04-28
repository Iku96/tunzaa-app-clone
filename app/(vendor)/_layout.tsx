import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { KycModal } from "@/components/modals/KycModal";
import { View } from "react-native";

// Error boundary for KycModal
class KycModalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("KycModal Error Boundary caught error:", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("KycModal Error Boundary details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

import SidebarMenu from "@/src/components/merchant/SidebarMenu";

const VendorLayout = () => {
  const { user, refreshProfile, switchRole, isSidebarOpen, setIsSidebarOpen } = useTunzaaAuth();
  const [showKycModal, setShowKycModal] = useState(false);
  const router = useRouter();

  // Ensure we are on a merchant profile when in this portal
  useEffect(() => {
    if (user && user.activeProfileRole === 'buyer') {
      console.log('🔄 [VendorLayout] Switching to merchant profile...');
      switchRole('vendor');
    }
  }, [user?.activeProfileRole]);

  // Auth guard: redirect to root when user logs out
  useEffect(() => {
    let mounted = true;
    if (!user && mounted) {
      console.log('🔒 [VendorLayout] No user — redirecting to language selection');
      // Use an explicit top-level route to ensure we break out of the current stack
      router.replace('/language');
    }
    return () => { mounted = false; };
  }, [user]);

  const handleKycSuccess = async () => {
    console.log('KYC submitted successfully from vendor layout, refreshing profile...');
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Failed to refresh profile after KYC submission:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      setShowKycModal(false);
      return;
    }

    // Find vendor profile
    const vendorProfile = user.profiles?.find(
        (profile: any) => profile.role === 'vendor' || profile.role === 'merchant'
    );

    if (!vendorProfile) {
      setShowKycModal(false);
      return;
    }

    // Check KYC status from multiple possible locations
    const kycMetadataStatus = vendorProfile.metadata?.verification_status || vendorProfile.metadata?.kyc_status;
    const kycVerified = vendorProfile.kyc?.verified;
    
    // Account is considered verified if:
    // 1. kyc.verified is true (boolean)
    // 2. metadata.verification_status or kyc_status is 'approved' or 'verified' (string)
    const isVerified = 
        kycVerified === true || 
        kycMetadataStatus === 'approved' || 
        kycMetadataStatus === 'verified' ||
        vendorProfile.metadata?.is_verified === true ||
        vendorProfile.metadata?.is_verified === 'true';

    console.log('🛡️ [VendorLayout] KYC Check:', { 
        isVerified, 
        kycVerified, 
        kycMetadataStatus,
        profileId: vendorProfile.profile_id 
    });
    
    if (!isVerified) {
        setShowKycModal(true);
    } else {
        setShowKycModal(false);
    }
  }, [user?.activeProfileRole, user?.profiles]);

  // Don't render vendor content if no user (logout in progress)
  if (!user) return null;

  return (
    <>
      <SidebarMenu 
        isVisible={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="live-orders" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="business-profile" />
        <Stack.Screen name="add-product" />
      </Stack>

      <KycModalErrorBoundary>
        <KycModal
          isOpen={showKycModal}
          onClose={() => setShowKycModal(false)}
          onSuccess={handleKycSuccess}
        />
      </KycModalErrorBoundary>
    </>
  );
};

export default VendorLayout;
