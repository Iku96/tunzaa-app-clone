import "@/global.css";
import "@/config/i18n"; // Initialize i18n

import { SplashScreen, Stack, Slot, useSegments, useRouter, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, Appearance, View } from "react-native";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { AuthProvider, useAuth } from "@/context/auth";
import { ReferralProvider } from "@/context/referral";
import { useAppStateRefresh } from "@/hooks/useAppStateRefresh";
import { useTimeTracker } from "@/src/hooks/useTimeTracker";
import { queryClient } from "@/lib/react-query";
import { ThemeProvider as AppThemeProvider } from "@/providers/ThemeProvider";
import { PushNotificationsProvider } from "@/components/notifications";
import { ForegroundNotificationProvider } from "@/context/foreground-notifications";
import { LanguageProvider } from "@/src/contexts/LanguageContext";
import { TunzaaAuthProvider, useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";
import * as ExpoSplashScreen from "expo-splash-screen";
import { Toaster } from "burnt/web";
import {
  Lato_100Thin,
  Lato_100Thin_Italic,
  Lato_300Light,
  Lato_300Light_Italic,
  Lato_400Regular,
  Lato_400Regular_Italic,
  Lato_700Bold,
  Lato_700Bold_Italic,
  Lato_900Black,
  Lato_900Black_Italic,
  useFonts,
} from "@expo-google-fonts/lato";
import { ErrorFallback } from "@/components/ErrorFallback";
import { WebRedirect } from "@/components/ui/web-redirect";

// export {
//   // Catch any errors thrown by the Layout component.
//   ErrorBoundary,
// } from "expo-router";

type ERProps = {
  error: Error;
  reset: () => void;
};

export function ErrorBoundary({ error, reset }: ERProps) {
  return <ErrorFallback error={error} reset={reset} />;
}

// Prevent the splash screen from auto-hiding before app is ready
ExpoSplashScreen.preventAutoHideAsync();

// Configure splash screen animation
ExpoSplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// Configure deep linking
//TODO: Look at this
const linking = {
  prefixes: ['myapp://', 'tunzaa://', 'https://afrizon.africa', 'https://tunzaa.co.tz'],
  config: {
    screens: {
      // Handle order deep links for authenticated users
      '(buyer)': {
        screens: {
          'orders': {
            screens: {
              '[id]': {
                path: 'order/:id',
                parse: {
                  id: (id: string) => id,
                },
              },
            },
          },
        },
      },
      // Handle public order links (for non-authenticated users)
      '(public)': {
        screens: {
          'order': {
            screens: {
              '[id]': {
                path: 'order/:id',
                parse: {
                  id: (id: string) => id,
                },
              },
            },
          },
        },
      },
    },
  },
};

// // Role validator component to check user roles
// function RoleValidator({ children }: { children: React.ReactNode }) {
//   const { user, logout, isLoading } = useAuth();
//   const [hasValidatedRole, setHasValidatedRole] = React.useState(false);

//   // Define allowed roles
//   const allowedRoles = ["buyer", "vendor", "winga", "delivery"];

//   React.useEffect(() => {
//     const validateUserRole = async () => {
//       // Skip validation if still loading or no user
//       if (isLoading || !user) {
//         return;
//       }

//       // Check if user has a valid role
//       if (user.activeProfileRole && !allowedRoles.includes(user.activeProfileRole)) {
//         console.log(`Invalid user role detected: ${user.activeProfileRole}. Logging out user.`);

//         try {
//           await logout();
//         } catch (error) {
//           console.error("Failed to logout user with invalid role:", error);
//         }
//         return;
//       }

//       // Mark role as validated
//       setHasValidatedRole(true);
//     };

//     validateUserRole();
//   }, [user, isLoading, logout]);

//   // Show loading or nothing while validating
//   if (isLoading || (user && !hasValidatedRole)) {
//     return null;
//   }

//   return <>{children}</>;
// }

  // Centralized routing component to handle global state-based navigation
  function AppWithRouting() {
  const { user, isLoading, isLoggingOut } = useTunzaaAuth();
  const segments = useSegments();
  const router = useRouter();
  useTimeTracker(); // Hooks MUST be called unconditionally before any early returns

  // Segment Analysis
  const protectedSegments = ['(vendor)', '(delivery)', '(winga)', '(payment)'];
  const currentSegment = segments[0];
  const isProtected = protectedSegments.includes(currentSegment);
  const isEntryScreen = currentSegment === 'language' || currentSegment === 'role' || currentSegment === '(auth)';

  console.log(`📡 [AppWithRouting] Render: user=${!!user}, isLoading=${isLoading}, isLoggingOut=${isLoggingOut}, isProtected=${isProtected}, segments=${JSON.stringify(segments)}`);

  // Global Auth Gate: Log state changes and provide debug trace
  React.useEffect(() => {
    console.log(`🛡️ [AuthGate] State Check: user=${!!user}, isLoading=${isLoading}, isLoggingOut=${isLoggingOut}, isProtected=${isProtected}, isEntryScreen=${isEntryScreen}`);
    if (isLoading || isLoggingOut) return;

    if (!user) {
      console.log(`ℹ️ [AuthGate] Unauthenticated user at "${currentSegment}". Protected: ${isProtected}, Entry: ${isEntryScreen}`);
    } else {
      console.log(`✅ [AuthGate] Authenticated user at "${currentSegment}". Role: ${user.activeProfileRole}`);
    }
  }, [user, isLoading, isLoggingOut, segments, isProtected, isEntryScreen]);

  // Guard: Don't perform routing checks until session restoration is complete
  if (isLoading) {
    console.log('⏳ [AppWithRouting] Auth is loading - blocking Slot render');
    return null;
  } else {
    // Notify push notifications service that navigation is ready
    import('@/src/services/push-notifications').then(mod => {
      mod.pushNotificationsService.setNavigationReady(true);
    });
  }

  if (!user && isProtected && !isEntryScreen) {
    console.log('🛑 [AuthGate] Redirecting unauthenticated user from protected portal to /language');
    return <Redirect href="/language" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [appIsReady, setAppIsReady] = React.useState(false);


  // Load Lato fonts
  const [fontsLoaded, fontError] = useFonts({
    Lato_100Thin,
    Lato_100Thin_Italic,
    Lato_300Light,
    Lato_300Light_Italic,
    Lato_400Regular,
    Lato_400Regular_Italic,
    Lato_700Bold,
    Lato_700Bold_Italic,
    Lato_900Black,
    Lato_900Black_Italic,
  });

  // Custom Tunzaa fonts
  const [customFontsLoaded] = useFonts({
    'Gilroy-Regular': require('../assets/fonts/Gilroy-Regular.ttf'),
    'Gilroy-Medium': require('../assets/fonts/Gilroy-Medium.ttf'),
    'Gilroy-SemiBold': require('../assets/fonts/Gilroy-SemiBold.ttf'),
    'Gilroy-Bold': require('../assets/fonts/Gilroy-Bold.ttf'),
    'Calibri': require('../assets/fonts/Calibri Regular.ttf'),
  });

  React.useEffect(() => {
    (async () => {
      try {

        if (Platform.OS === "web") {
          // Adds the background color to the html element to prevent white background on overscroll.
          document.documentElement.classList.add("bg-background");

          // Set up system theme listener for web
          if (typeof window !== "undefined" && window.matchMedia) {
            const mediaQuery = window.matchMedia(
              "(prefers-color-scheme: dark)"
            );
            const handleWebThemeChange = (e: MediaQueryListEvent) => {
              const webSystemTheme = e.matches ? "dark" : "light";
              if (colorScheme !== webSystemTheme) {
                setColorScheme(webSystemTheme);
              }
            };
            mediaQuery.addEventListener("change", handleWebThemeChange);
          }
        }

        // Always use system theme - no saved preferences
        setIsColorSchemeLoaded(true);
      } catch (error) {
        console.error("Error loading theme:", error);
        setIsColorSchemeLoaded(true);
      }
    })();
  }, [setColorScheme, colorScheme]);

  // Handle app readiness and splash screen hiding
  React.useEffect(() => {
    if (isColorSchemeLoaded && (fontsLoaded || fontError) && customFontsLoaded) {
      setAppIsReady(true);
    }
  }, [isColorSchemeLoaded, fontsLoaded, fontError, customFontsLoaded]);

  const onLayoutRootView = React.useCallback(() => {
    if (appIsReady) {
      // Hide splash screen once the app is ready and layout is complete
      ExpoSplashScreen.hide();
    }
  }, [appIsReady]);

  // Listen for system theme changes on native platforms
  React.useEffect(() => {
    const handleSystemThemeChange = (
      preferences: Appearance.AppearancePreferences
    ) => {
      const systemTheme = preferences.colorScheme;
      // Always follow system theme changes
      if (systemTheme) {
        const newTheme = systemTheme === "dark" ? "dark" : "light";
        if (colorScheme !== newTheme) {
          setColorScheme(newTheme);
        }
      }
    };

    if (Platform.OS !== "web") {
      const subscription = Appearance.addChangeListener(
        handleSystemThemeChange
      );
      return () => subscription?.remove();
    }
  }, [setColorScheme, colorScheme]);

  if (!appIsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />

      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <BottomSheetModalProvider>
            <AuthProvider>
              <LanguageProvider>
                <TunzaaAuthProvider>
                  {/* <ChatProvider> */}
                  <ReferralProvider>
                    {/* <RoleValidator> */}
                    <PushNotificationsProvider>
                      <ForegroundNotificationProvider>
                        <AppThemeProvider>
                          {Platform.OS === 'web' ? (
                            <WebRedirect />
                          ) : (
                            <>
                              <AppWithRouting />
                              <View
                                pointerEvents="box-none"
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                }}
                              >
                                <PortalHost />
                              </View>
                            </>
                          )}
                        </AppThemeProvider>
                      </ForegroundNotificationProvider>
                    </PushNotificationsProvider>
                    {/* </RoleValidator> */}
                  </ReferralProvider>
                  {/* </ChatProvider> */}
                </TunzaaAuthProvider>
              </LanguageProvider>
            </AuthProvider>
          </BottomSheetModalProvider>
          {Platform.OS === "web" && <Toaster position="bottom-right" />}
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}