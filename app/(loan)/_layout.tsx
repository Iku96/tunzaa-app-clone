import React, { useEffect, useState } from "react";
import { Stack, useRouter, Redirect } from "expo-router";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { KycModal } from "@/components/modals/KycModal";
import { View } from "react-native";
import SidebarMenu from "@/src/components/merchant/SidebarMenu";
import { AuthGuard } from "@/src/components/auth/AuthGuard";

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

const LoanLayout = () => {
  const { user, refreshProfile, switchRole, isSidebarOpen, setIsSidebarOpen } = useTunzaaAuth();
  const [showKycModal, setShowKycModal] = useState(false);
  const router = useRouter();

  // Role guard: Prevent merchants/vendors from accessing the loan layout
  if (user && ['vendor', 'merchant', 'business'].includes(user.activeProfileRole?.toLowerCase())) {
    return <Redirect href="/(vendor)" />;
  }

  // Ensure we are on a loan profile when in this portal
  useEffect(() => {
    if (user && user.activeProfileRole === 'buyer' && typeof switchRole === 'function') {
      console.log('🔄 [LoanLayout] Switching to loan profile...');
      switchRole('loan');
    }
  }, [user?.activeProfileRole]);

  const handleKycSuccess = async () => {
    console.log('KYC submitted successfully from loan layout, refreshing profile...');
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

    const loanProfile = user.profiles?.find(
        (profile: any) => 
            profile.role?.toLowerCase() === 'loan' || 
            profile.role?.toLowerCase() === 'loan_provider'
    );

    if (!loanProfile) {
      console.log('🛡️ [LoanLayout] No loan profile found in profiles:', user.profiles?.map((p: any) => p.role));
      setShowKycModal(false);
      return;
    }

    const metadata = typeof loanProfile?.metadata === 'string' ? JSON.parse(loanProfile.metadata) : (loanProfile?.metadata || {});
    const kycMetadataStatus = (metadata?.verification_status || metadata?.kyc_status || '').toLowerCase();
    const kycVerified = loanProfile.kyc?.verified;
    const generalStatus = (metadata?.status || '').toLowerCase();
    
    const metadataKeys = Object.keys(metadata);
    const isMetadataHydrated = metadataKeys.length > 0;

    const isVerified = 
        kycVerified === true || 
        ['approved', 'verified', 'active', 'completed'].includes(kycMetadataStatus) ||
        ['approved', 'verified', 'active', 'completed'].includes(generalStatus) ||
        metadata?.is_verified === true ||
        metadata?.is_verified === 'true' ||
        user.is_verified === true;
    
    if (isVerified) {
        setShowKycModal(false);
    } else if (!isMetadataHydrated) {
        console.log('🛡️ [LoanLayout] Metadata not hydrated yet, deferring KYC check');
        setShowKycModal(false);
    } else {
        setShowKycModal(true);
    }
  }, [user?.activeProfileRole, user?.profiles, user?.is_verified]);

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
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="business-profile" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="history" />
        <Stack.Screen name="requests" />
        <Stack.Screen name="collections" />
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

export default LoanLayout;
