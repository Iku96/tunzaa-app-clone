import React from "react";
import { Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTunzaaAuth } from "../../src/contexts/TunzaaAuthContext";
import { KycModal } from "../../components/modals/KycModal";

const BuyerLayout = () => {
  const { user } = useTunzaaAuth();
  const [showKycModal, setShowKycModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const currentProfile = user.profiles?.find(
        (profile: any) => profile.role === user.activeProfileRole
      );
      if (currentProfile?.kyc && !currentProfile.kyc.verified) {
        setShowKycModal(true);
      }
    }
  }, [user?.activeProfileRole, user?.profiles]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' }
        }}
      />
      
      {showKycModal && (
        <KycModal
          visible={showKycModal}
          onClose={() => setShowKycModal(false)}
        />
      )}
    </>
  );
};

export default BuyerLayout;
