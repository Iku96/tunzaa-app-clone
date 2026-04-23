import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AffiliateRequests } from "@/components/vendor/AffiliateRequests";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { Text } from "@/components/ui/text";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function AffiliateRequestsPage() {
  const { vendorDetails } = useProfileDetails();
  const vendorId = vendorDetails?.vendor_id;
  usePageTitle("Affiliate Requests");
  if (!vendorId) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-muted-foreground">
            Loading vendor details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
     <DesktopLayoutWrapper
                showSidebar={false}
                  showSecondaryNav={false}
                showNavBar={true}
                showFooter={true}
                containerClassName="bg-muted"
              >
                 <SafeAreaView className="flex-1 bg-background">
      <AffiliateRequests vendorId={vendorId} />
    </SafeAreaView>
              </DesktopLayoutWrapper>
   
  );
}
