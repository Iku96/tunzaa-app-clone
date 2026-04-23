import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { DeliveryHome } from "@/components/home/DeliveryHome";
import { DesktopLayoutWrapper } from "@/components/layout";
import { useResponsive } from "@/hooks/useResponsive";
import { useI18n } from "@/hooks/useI18n";

export default function HomeScreen() {
  const { user } = useAuth();
  const { isDesktop } = useResponsive();
  const { t } = useI18n();

  if (!user) return null;

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
