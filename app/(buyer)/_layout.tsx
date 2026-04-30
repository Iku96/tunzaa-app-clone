import React from "react";
import { Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTunzaaAuth } from "../../src/contexts/TunzaaAuthContext";
import { KycModal } from "../../components/modals/KycModal";

const BuyerLayout = () => {
  const { user } = useTunzaaAuth();
  const [showKycModal, setShowKycModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' }
        }}
      />
    </>
  );
};

export default BuyerLayout;
