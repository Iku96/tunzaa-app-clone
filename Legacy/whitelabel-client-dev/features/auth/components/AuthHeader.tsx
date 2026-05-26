import { View, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { LanguageSelector } from "@/components/modals/LanguageSelector";
import { Button } from "@/components/ui/button";
import { DynamicLogo } from "@/components/ui/DynamicLogo";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";

export default function AuthHeader() {
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const resolvedColors = useResolvedThemeColors();
  return (
    <View className="flex-row justify-between items-center p-4 w-full">
      {/* Mobile Back Button */}
      {!isWeb && (
        <Button
          variant="ghost"
          size="icon"
          onPress={() => router.back()}
          className="lg:absolute lg:left-4"
        >
          <ArrowLeft size={24} color={resolvedColors?.foreground || "#000000"} />
        </Button>
      )}

      {/* Logo */}
      <View className="flex-row items-center">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.push("/(public)")}
          className="p-0"
        >
          <DynamicLogo width={120} height={45} className="bg-muted" />
        </Button>
      </View>

      {/* Language Selector */}
      <View className="lg:absolute right-4">
        <LanguageSelector />
      </View>
    </View>
  );
}
