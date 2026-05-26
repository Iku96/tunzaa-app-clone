import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { BuyerHome } from "@/components/home/BuyerHome";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useResponsive } from "@/hooks/useResponsive";
import { ReferralCodeModal } from "@/components/modals/ReferralCodeModal";
import { getNewlyRegisteredFlag, clearNewlyRegisteredFlag } from "@/utils/storage";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useI18n } from "@/hooks/useI18n";
import { useTenantModules } from "@/hooks/useTenantModules";

export default function HomeScreen() {
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const [showReferralModal, setShowReferralModal] = useState(false);
  const { t } = useI18n();
  const { isRewardsEnabled } = useTenantModules();

  usePageTitle("Home");
  // Check for newly registered users and show referral modal only if rewards enabled
  useEffect(() => {
    const checkNewlyRegistered = async () => {
      if (user && isRewardsEnabled) {
        const isNewlyRegistered = await getNewlyRegisteredFlag();
        if (isNewlyRegistered) {
          setShowReferralModal(true);
        }
      }
    };

    checkNewlyRegistered();
  }, [user, isRewardsEnabled]);

  const handleReferralModalClose = async () => {
    setShowReferralModal(false);
    await clearNewlyRegisteredFlag();
  };

  const handleReferralModalSuccess = async () => {
    setShowReferralModal(false);
    await clearNewlyRegisteredFlag();
  };

  console.log("HomeScreen render. User ID:", user?.user_id, "showReferralModal:", showReferralModal);
  if (!user) return null;

  return (
    <>
      <DesktopLayoutWrapper
        showSidebar={false}
        showNavBar={true}
        showFooter={true}
        containerClassName="bg-muted"
      >
        {!isDesktop && (
          <SafeAreaView className="flex-1 bg-muted" edges={['top', 'left', 'right']}>
            <BuyerHome />
            {/* <RewardsServiceExample /> */}
          </SafeAreaView>
        )}

        {isDesktop && (
          <SafeAreaView className="flex-1 bg-background">
            <BuyerHome />
            {/* <QuickScrollTest /> */}
          </SafeAreaView>
        )}
      </DesktopLayoutWrapper>

      {/* Referral Code Modal for newly registered users - only if rewards enabled */}
      {isRewardsEnabled && (
        <ReferralCodeModal
          isOpen={showReferralModal}
          onClose={handleReferralModalClose}
          onSuccess={handleReferralModalSuccess}
        />
      )}
    </>
  );
}
