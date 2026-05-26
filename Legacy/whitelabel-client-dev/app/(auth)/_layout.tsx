import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/auth";
import { useRouting } from "@/hooks/useRouting";

export default function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="onboarding" /> */}
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
