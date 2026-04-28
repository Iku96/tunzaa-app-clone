import React from "react";
import { useAuth } from "@/context/auth";
import { Platform } from "react-native";
import { useSegments, useRouter } from "expo-router";
import { useTenantStore } from "@/stores/tenant";
import { usePreferencesStore } from "@/stores/preferences";

export function useRouting() {
  const segments = useSegments();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isTenantLoading } = useTenantStore();
  const { isFirstTimeUser } = usePreferencesStore();

  // Add ref to prevent multiple simultaneous navigation calls
  const isNavigatingRef = React.useRef(false);
  const lastNavigationRef = React.useRef<string | null>(null);

  // Memoize router functions to prevent infinite re-renders
  const replaceToOnboarding = React.useCallback(() => {
    if (isNavigatingRef.current || lastNavigationRef.current === "onboarding") return;
    isNavigatingRef.current = true;
    lastNavigationRef.current = "onboarding";
    router.replace("/(onboarding)" as any);
    // Reset after a short delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [router]);

  const replaceToLogin = React.useCallback(() => {
    if (isNavigatingRef.current || lastNavigationRef.current === "login") return;
    isNavigatingRef.current = true;
    lastNavigationRef.current = "login";
    router.replace("/(auth)/login" as any);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [router]);

  const replaceToRole = React.useCallback((role: string) => {
    if (isNavigatingRef.current || lastNavigationRef.current === role) return;
    isNavigatingRef.current = true;
    lastNavigationRef.current = role;
    router.replace(`/(${role})` as any);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [router]);

  const replaceToPublic = React.useCallback(() => {
    if (isNavigatingRef.current || lastNavigationRef.current === "public") return;
    isNavigatingRef.current = true;
    lastNavigationRef.current = "public";
    router.replace("/(public)" as any);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [router]);

  React.useEffect(() => {
    // Wait for both auth and tenant data to load before any routing decisions
    if (isAuthLoading || isTenantLoading) {
      return;
    }

    // Prevent navigation if already navigating
    if (isNavigatingRef.current) {
      return;
    }

    const currentGroup = segments[0];
    const inAuthGroup = currentGroup === "(auth)";
    const inPublicGroup = currentGroup === "(public)";
    const inOnboardingGroup = currentGroup === "(onboarding)";

    // Handle non-authenticated users
    if (!user) {

      // For mobile: First-time users go to onboarding, existing users go to public
      if (Platform.OS !== 'web') {
        if (isFirstTimeUser()) {
          // console.log("First-time mobile user detected, redirecting to onboarding");
          if (!inOnboardingGroup) {
            replaceToOnboarding();
          }
          return;
        } else {
          // console.log("Existing mobile user detected, redirecting to public");
          if (!inPublicGroup && !inAuthGroup && !inOnboardingGroup) {
            replaceToPublic();
          }
          return;
        }
      }

      // For web: All users go to public routes
      if (Platform.OS === 'web') {
        // console.log("Web user detected, redirecting to public routes");
        if (!inPublicGroup && !inAuthGroup && !inOnboardingGroup) {
          replaceToPublic();
        }
        return;
      }

      return;
    }

    // Handle authenticated users
    try {
      // 1. Redirect away from auth/onboarding if authenticated
      if (inAuthGroup || inOnboardingGroup) {
        // console.log(
        //   "User is authenticated and in auth group or onboarding group"
        // );
        replaceToRole(user.activeProfileRole);
        return;
      }

      // 2. Ensure users stay in their role-specific routes
      const roleGroup = `(${user.activeProfileRole})`;
      // console.log("Role Group ", roleGroup);

      if (currentGroup && currentGroup !== roleGroup && !inPublicGroup) {
        // console.log("User is authenticated and in role-specific routes");
        replaceToRole(user.activeProfileRole);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      replaceToPublic();
    }
  }, [user, segments, isAuthLoading, isTenantLoading, isFirstTimeUser, replaceToOnboarding, replaceToLogin, replaceToRole, replaceToPublic]);
}
