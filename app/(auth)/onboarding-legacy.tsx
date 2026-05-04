import { View, ScrollView, Image, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import type { UserRole } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useResolvedThemeColors } from "@/hooks/useThemeColors";
import { useTenantStore } from "@/stores/tenant";
import type { Banner } from "@/src/services/types";
import { useMemo, useState, useRef, useEffect } from "react";

import AuthHeader from "@/features/auth/components/AuthHeader";
import { ChevronRight } from "lucide-react-native";
import { AdaptiveThemingDemo } from "@/examples/AdaptiveThemingDemo";
import { WebViewScreen } from "@/components/ui/webview";
import { useI18n } from "@/hooks/useI18n";
const { width } = Dimensions.get("window");

// Fallback slides for when tenant banners are not available
const fallbackSlides = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1024",
    title: "Welcome to MarketPlace!",
    description:
      "Your go-to app for a hassle-free life. We are here to help with all your needs anytime, anywhere.",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1024",
    title: "Fresh Groceries Delivered",
    description:
      "Get fresh produce and groceries delivered to your doorstep within hours.",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=1024",
    title: "Support Local Businesses",
    description:
      "Connect with local vendors and support your community while shopping for your needs.",
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1024",
    title: "Fast & Reliable Delivery",
    description:
      "Our delivery partners ensure your orders reach you quickly and safely.",
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
  const [showTermsWebView, setShowTermsWebView] = useState(false);
  const [showPrivacyWebView, setShowPrivacyWebView] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { setUserType } = useAuth();
  const { tenant } = useTenantStore();
  const resolvedColors = useResolvedThemeColors();
  const { t } = useI18n();
  // Redirect web users to login page instead of showing mobile onboarding
  useEffect(() => {
    if (Platform.OS === 'web') {
      router.replace('/login');
    }
  }, [router]);

  // Fallback URLs for terms and privacy policy
  const fallbackTermsUrl = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf";
  const fallbackPrivacyUrl = "https://www.orimi.com/pdf-test.pdf";

  // Get URLs from tenant metadata or use fallbacks
  const termsUrl = tenant?.metadata?.terms_conditions || fallbackTermsUrl;
  const privacyUrl = tenant?.metadata?.privacy_policy || fallbackPrivacyUrl;

  // Helper function to get PDF viewer URL if needed
  const getPdfViewerUrl = (url: string) => {
    if (url.toLowerCase().includes('.pdf')) {
      const encodedUrl = encodeURIComponent(url);
      return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
    }
    return url;
  };

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
    return fallbackSlides;
  }, [tenant?.banners]);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentSlide(Math.round(index));
  };

  const handleSignUp = (type: UserRole) => {
    setUserType(type);
    router.push({ pathname: "/register" });
  };

  return (
    <SafeAreaView className="flex-1 bg-muted">
      <AuthHeader />
      {/* <AdaptiveThemingDemo /> */}
      <ScrollView>
        {/* Banners Section */}
        <View className="relative mb-4" style={{ height: Dimensions.get('window').height * 0.4 }}>
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
              <View key={slide.id} style={{ width, height: Dimensions.get('window').height * 0.4 }} className="relative">
                <Image
                  source={{ uri: slide.image }}
                  style={{
                    width,
                    height: Dimensions.get('window').height * 0.4,
                    resizeMode: "cover",
                  }}
                />
                <View className="absolute inset-0 bg-black/30" />

                <View className="absolute left-0 right-0 px-6 bottom-4">
                  <Text className="text-xl font-bold text-white text-center mb-2">
                    {slide.title}
                  </Text>
                  <Text className="text-sm text-white/90 text-center">
                    {slide.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="absolute left-0 right-0 flex-row justify-center gap-2 bottom-2">
            {slides.map((_, index) => (
              <View
                key={index}
                className={
                  index === currentSlide
                    ? "bg-white w-4 h-1.5 rounded-full"
                    : "bg-white/50 w-1.5 h-1.5 rounded-full"
                }
              />
            ))}
          </View>
        </View>

        <View className="flex-1">
          <View className="p-6">
            <Button
              variant="default"
              className="shadow shadow-foreground/5"
              onPress={() => router.push({ pathname: "/login" })}
            >
              <Text>{t("auth.log_in")}</Text>
            </Button>

            <Button
              variant="outline"
              className="shadow shadow-foreground/5 mt-4 mb-5 border-primary native:h-auto native:min-h-[56px]"
              onPress={() => handleSignUp("buyer")}
            >
              <Text className="text-primary font-bold">{t("auth.i_m_new_sign_me_up")}</Text>
            </Button>

            <Button
              variant="link"
              className="shadow shadow-foreground/5 mb-5 flex-row items-center justify-center"
              onPress={() => router.push("/(public)")}
            >
              <Text className="mr-2">
                {t("auth.skip_for_now")}
              </Text>
              <ChevronRight color={resolvedColors?.primary || "#000000"} className="ml-2" size={16} />
            </Button>

            {/* <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-sm text-gray-500">{t("auth.or")}</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View> */}

            {/* <Button
              variant="secondary"
              className="shadow shadow-foreground/5"
              onPress={() => handleSignUp("delivery")}
            >
              <Text className="text-accent">Deliver with us</Text>
            </Button>

            <Button
              variant="secondary"
              className="shadow shadow-foreground/5 mt-3"
              onPress={() => handleSignUp("vendor")}
            >
              <Text className="text-accent">Sell on Marketplace</Text>
            </Button>

            <Button
              variant="secondary"
              className="shadow shadow-foreground/5 mt-3"
              onPress={() => handleSignUp("winga")}
            >
              <Text className="text-accent">Affiliate Sign Up</Text>
            </Button> */}

            <Text className="text-sm text-muted-foreground text-center leading-5 mt-5">
              {t("auth.by_logging_in_or_registering_you_agree_to_our")} {" "}
              <Text
                className="text-sm text-primary underline"
                onPress={() => {
                  setShowTermsWebView(true);
                  // console.log("Terms of service pressed");
                }}
              >
                {t("auth.terms_of_service")}
              </Text>{" "}
              {t("auth.and")} {" "}
              <Text
                className="text-sm text-primary underline"
                onPress={() => setShowPrivacyWebView(true)}
              >
                {t("auth.privacy_policy")}
              </Text>
              .
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Terms of Service WebView Screen */}
      {showTermsWebView && (
        <View className="absolute inset-0 z-50">
          <WebViewScreen
            url={getPdfViewerUrl(termsUrl)}
            title={t("auth.terms_of_service")}
            onClose={() => setShowTermsWebView(false)}
          />
        </View>
      )}

      {/* Privacy Policy WebView Screen */}
      {showPrivacyWebView && (
        <View className="absolute inset-0 z-50">
          <WebViewScreen
            url={getPdfViewerUrl(privacyUrl)}
            title={t("auth.privacy_policy")}
            onClose={() => setShowPrivacyWebView(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
