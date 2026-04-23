import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/hooks/useI18n";

export default function AccountScreen() {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    // Redirect to onboarding when this tab is accessed
    router.replace("/(onboarding)");
  }, [router]);

  // Show a loading state while redirecting
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-muted-foreground">{t("common.loading")}</Text>
    </View>
  );
}
