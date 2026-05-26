import { useState, useRef, useMemo, useEffect } from "react";
import { View, Image, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import type { UserRole } from "@/context/auth";
import { LanguageSelector } from "@/components/modals/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useTenantStore } from "@/stores/tenant";
import { usePreferencesStore } from "@/stores/preferences";
import { useI18n } from "@/hooks/useI18n";
import type { Banner } from "@/services/types";

import { Dimensions } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { AdaptiveThemingDemo } from "@/examples/AdaptiveThemingDemo";
const { width, height } = Dimensions.get("window");

// Fallback slides for when tenant banners are not available
const getFallbackSlides = (t: any, tenantName: string) => [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1024",
    title: tenantName
      ? t("onboarding.welcome_to_afrizon", { tenantName })
      : t("onboarding.welcome_to_afrizon"),
    description: t("onboarding.go_to_app_description"),
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1024",
    title: t("onboarding.fresh_groceries_delivered"),
    description: t("onboarding.fresh_produce_description"),
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=1024",
    title: t("onboarding.support_local_businesses"),
    description: t("onboarding.connect_vendors_description"),
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1024",
    title: t("onboarding.fast_reliable_delivery"),
    description: t("onboarding.delivery_partners_description"),
  },
];

interface Slide {
  id: string;
  image: string;
  title: string;
  description: string;
}

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { setUserType } = useAuth();
  const { tenant } = useTenantStore();
  const { isFirstTimeUser } = usePreferencesStore();
  const { t } = useI18n();

  const tenantName = tenant?.name || "";

  useEffect(() => {
    // Show language selector for first-time users
    if (isFirstTimeUser()) {
      setShowLanguageSelector(true);
    }
  }, [isFirstTimeUser]);

  // Redirect web users to public routes instead of showing mobile onboarding
  useEffect(() => {
    if (Platform.OS === 'web') {
      router.replace('/(public)');
    }
  }, [router]);

  // Convert tenant banners to slides format
  const slides = useMemo((): Slide[] => {
    if (tenant?.banners && tenant.banners.length > 0) {
      // Filter active banners and sort by display_order
      const activeBanners = tenant.banners
        .filter((banner: Banner) => banner.is_active)
        .sort((a: Banner, b: Banner) => a.display_order - b.display_order);

      // Map banner fields to slide structure
      return activeBanners.map((banner: Banner) => ({
        id: banner.banner_id,
        image: banner.image_url,
        title: banner.title,
        description: banner.alt_text,
      }));
    }

    // Fall back to default slides if no tenant banners
    return getFallbackSlides(t, tenantName);
  }, [tenant?.banners, t, tenantName]);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentSlide(Math.round(index));
  };

  const handleSignUp = (type: UserRole) => {
    setUserType(type);
    router.push({ pathname: "/register" });
  };

  const handleLanguageSelected = () => {
    setShowLanguageSelector(false);
  };

  return (
    // <AdaptiveThemingDemo />
    <View className="flex-1 bg-background">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={{ width, height }} className="relative">
            <Image
              source={{ uri: slide.image }}
              style={{
                width,
                height,
                resizeMode: "cover",
              }}
            />
            <View className="absolute inset-0 bg-black/30" />

            <View
              className="absolute left-0 right-0 px-6"
              style={{ bottom: height * 0.35 }} // 35% from bottom
            >
              <Text className="text-3xl font-bold text-white text-center mb-4">
                {slide.title}
              </Text>
              <Text className="text-lg text-white/90 text-center">
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {!isFirstTimeUser() && (
        <SafeAreaView className="absolute top-0 right-6 z-10">
          <View className="pt-4">
            <LanguageSelector />
          </View>
        </SafeAreaView>
      )}

      <View
        className="absolute left-0 right-0 flex-row justify-center gap-2"
        style={{ bottom: height * 0.2 }} // 20% from bottom
      >
        {slides.map((_, index) => (
          <View
            key={index}
            className={
              index === currentSlide
                ? "bg-white w-6 h-2 rounded-full"
                : "bg-white/50 w-2 h-2 rounded-full"
            }
          />
        ))}
      </View>

      <SafeAreaView className="absolute bottom-0 left-6 right-6">
        <View className="pb-4">
          <View className="flex-row gap-3">
            <Button
              variant="default"
              className="flex-1 shadow shadow-foreground/5 mt-4 mb-5 border-primary native:h-auto native:min-h-[56px]"
              onPress={() => router.push({ pathname: "/login" })}
            >
              <Text className="text-primary font-semibold">{t("onboarding.log_in")}</Text>
            </Button>

            <Button
              variant="outline"
              className="shadow shadow-foreground/5 mt-4 mb-5 border-primary native:h-auto native:min-h-[56px]"
              // onPress={() => handleSignUp("buyer")}
              onPress={() => router.push({ pathname: "/(auth)" })}
            >
              <Text className="text-foreground font-semibold">
                {t("onboarding.im_new_sign_me_up")}
              </Text>
            </Button>
          </View>

          <Button
            variant="link"
            className="self-center justify-center items-center mt-4"
            onPress={() => router.push("/(public)")}
          >
            <View className="flex-row items-center gap-2 justify-center">
              <Text className="text-white font-medium">{t("onboarding.skip_for_now")}</Text>
              <ChevronRight size={16} color="white" />
            </View>
          </Button>
        </View>
      </SafeAreaView>

      {showLanguageSelector && (
        <LanguageSelector
          isFirstTime={true}
          onLanguageSelected={handleLanguageSelected}
        />
      )}
    </View>
  );
}
