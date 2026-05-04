import React, { useEffect } from "react";
import { Stack, Redirect, useSegments, useRouter } from "expo-router";
import { useTunzaaAuth } from "@/src/contexts/TunzaaAuthContext";

export default function AuthLayout() {
  const { user, isAuthenticated } = useTunzaaAuth();
  const segments = useSegments();
  const router = useRouter();

  // Only allow authenticated users to stay if they are on the complete-profile screen.
  // Other auth screens (login/register/otp) should redirect to root to let it decide the portal.
  const isOnboarding = segments.includes("complete-profile");

  useEffect(() => {
    if (isAuthenticated && user && !isOnboarding) {
      // Use imperative routing to avoid React's "Maximum update depth exceeded" 
      // caused by `<Redirect>` mounting during state transitions.
      router.replace("/");
    }
  }, [isAuthenticated, user, isOnboarding]);

  // Let the Stack render normally while the redirect is processing in the background.
  // Returning null here causes React Navigation to crash with "Maximum update depth exceeded".
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="onboarding" /> */}
      <Stack.Screen name="onboarding-legacy" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
