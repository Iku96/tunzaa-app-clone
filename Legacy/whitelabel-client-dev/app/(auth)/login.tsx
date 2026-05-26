// app/(auth)/login.tsx
import { View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScrollView } from "@/components/ui/scroll-view";
import LoginForm from "@/features/auth/components/LoginForm";
import AuthHeader from "@/features/auth/components/AuthHeader";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { useResponsive } from "@/hooks/useResponsive";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function LoginScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
 usePageTitle("Login");
  return (
    <DesktopLayoutWrapper
      layoutType="auth"
      showNavBar={false}
      showFooter={true}
      showSidebar={false}
    >
      {/* Mobile Layout */}
      {!isDesktop && (
        <SafeAreaView className="flex-1 bg-muted">
        
              <AuthHeader />
          <LoginForm />
         
        
        </SafeAreaView>
      )}

      {/* Desktop Layout */}
      {isDesktop && (
         <SafeAreaView className="flex-1 bg-muted">
           <ScrollView>
          <AuthHeader />
         <View className="flex-1 flex items-center justify-center px-8 py-1">
  <View className="w-full max-w-md bg-white border border-border rounded-lg p-8">
    <LoginForm />
  </View>
</View>
  </ScrollView>
         </SafeAreaView>
       
      )}
    </DesktopLayoutWrapper>
  );
}

