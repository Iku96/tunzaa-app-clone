import React, { useEffect, useState } from "react";
import { Stack, useRouter, Redirect } from "expo-router";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { KycModal } from "@/components/modals/KycModal";
import { View } from "react-native";
import SidebarMenu from "@/src/components/merchant/SidebarMenu";

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

import { AuthGuard } from "@/src/components/auth/AuthGuard";

const VendorLayout = () => {
  const { user, refreshProfile, switchRole, isSidebarOpen, setIsSidebarOpen } = useTunzaaAuth();
  const [showKycModal, setShowKycModal] = useState(false);
  const router = useRouter();

  // Ensure we are on a merchant profile when in this portal
  useEffect(() => {
    if (user && user.activeProfileRole === 'buyer' && typeof switchRole === 'function') {
      console.log('🔄 [VendorLayout] Switching to merchant profile...');
      switchRole('vendor');
    }
  }, [user?.activeProfileRole]);

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

    // Find vendor profile (supporting multiple merchant role aliases)
    const vendorProfile = user.profiles?.find(
        (profile: any) => 
            profile.role?.toLowerCase() === 'vendor' || 
            profile.role?.toLowerCase() === 'merchant' ||
            profile.role?.toLowerCase() === 'business'
    );

    if (!vendorProfile) {
      console.log('🛡️ [VendorLayout] No vendor profile found in profiles:', user.profiles?.map((p: any) => p.role));
      setShowKycModal(false);
      return;
    }

    // Check KYC status from multiple possible locations (API returns vary by role/version)
    const metadata = typeof vendorProfile?.metadata === 'string' ? JSON.parse(vendorProfile.metadata) : (vendorProfile?.metadata || {});
    const kycMetadataStatus = (metadata?.verification_status || metadata?.kyc_status || '').toLowerCase();
    const kycVerified = vendorProfile.kyc?.verified;
    const generalStatus = (metadata?.status || '').toLowerCase();
    
    // The login API returns profiles with EMPTY metadata {}.
    // Business name, KYC, etc. arrive later via background hydration.
    // Check if metadata has been hydrated yet (has any meaningful keys).
    const metadataKeys = Object.keys(metadata);
    const isMetadataHydrated = metadataKeys.length > 0;

    // Account is considered verified if:
    // 1. kyc.verified is true (boolean) — set during profile normalization
    // 2. metadata.verification_status or kyc_status is an approved variant
    // 3. TOP-LEVEL user.is_verified is true (present in JWT from login)
    const isVerified = 
        kycVerified === true || 
        ['approved', 'verified', 'active', 'completed'].includes(kycMetadataStatus) ||
        ['approved', 'verified', 'active', 'completed'].includes(generalStatus) ||
        metadata?.is_verified === true ||
        metadata?.is_verified === 'true' ||
        user.is_verified === true;

    console.log('🛡️ [VendorLayout] KYC Check Details:', { 
        isVerified, 
        kycVerified, 
        kycMetadataStatus,
        generalStatus,
        isVerifiedFlag: metadata?.is_verified,
        userLevelIsVerified: user.is_verified,
        isMetadataHydrated,
        profileId: vendorProfile.profile_id,
        role: vendorProfile.role
    });
    
    if (isVerified) {
        // Definitely verified — don't show KYC modal
        setShowKycModal(false);
    } else if (!isMetadataHydrated) {
        // Metadata is still empty (login just happened, hydration in progress).
        // DON'T show the KYC modal yet — wait for hydration to fill metadata.
        console.log('🛡️ [VendorLayout] Metadata not hydrated yet, deferring KYC check');
        setShowKycModal(false);
    } else {
        // Metadata IS hydrated but account is NOT verified — show KYC modal
        setShowKycModal(true);
    }
  }, [user?.activeProfileRole, user?.profiles, user?.is_verified, user?.vendorDetails]);

  // Note: Unauthenticated access is now handled by the root AuthGate in app/_layout.tsx
  // which replaces the Slot with a Redirect before this component is even evaluated.
  // As a secondary fail-safe, we wrap the content with AuthGuard.

  return (
    <AuthGuard>
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
        <Stack.Screen name="settings" />
        <Stack.Screen name="edit-business" />
        <Stack.Screen name="view-post" />
        <Stack.Screen name="product-insight" />
        <Stack.Screen name="inbox" />
        <Stack.Screen name="chat/[id]" />
    </Stack>

      <KycModalErrorBoundary>
        <KycModal
          isOpen={showKycModal}
          onClose={() => setShowKycModal(false)}
          onSuccess={handleKycSuccess}
          user={user}
          userRole={user?.activeProfileRole}
        />
      </KycModalErrorBoundary>
    </AuthGuard>
  );
};

export default VendorLayout;
