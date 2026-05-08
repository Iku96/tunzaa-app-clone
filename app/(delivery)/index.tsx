import { SafeAreaView } from "react-native-safe-area-context";

import { DeliveryHome } from "@/components/home/DeliveryHome";
import { DesktopLayoutWrapper } from "@/components/layout";
import { useResponsive } from "@/hooks/useResponsive";
import { useI18n } from "@/hooks/useI18n";

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import { useRouter, useSegments } from "expo-router";

export default function HomeScreen() {
  const { user } = useTunzaaAuth();
  const { isDesktop } = useResponsive();
  const { t } = useI18n();
  const router = useRouter();
  const segments = useSegments();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const pendingOnboarding = await AsyncStorage.getItem("HAS_PENDING_DELIVERY_ONBOARDING");
        if (!user?.deliveryDetails || pendingOnboarding === "true") {
           // Wait a tick to ensure layout is mounted before pushing
           setTimeout(() => {
              router.replace("/(delivery)/onboarding");
           }, 0);
        } else {
           setIsChecking(false);
        }
      } catch (e) {
        setIsChecking(false);
      }
    };
    if (user) {
       checkOnboarding();
    }
  }, [user, segments]);

  if (!user || isChecking) return null;

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={true}
      containerClassName="bg-muted"
    >
      <SafeAreaView style={{ flex: 1 }} className={isDesktop ? "bg-white" : "bg-muted"}>
        <DeliveryHome />
      </SafeAreaView> 
    </DesktopLayoutWrapper>
    
  );
}
