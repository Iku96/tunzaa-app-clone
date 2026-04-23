import { Platform } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useRouting } from "@/hooks/useRouting";
export default function OnboardingLayout() {
  // Redirect web users away from onboarding
  // if (Platform.OS === "web") {
  //   return <Redirect href="/(public)/" />;
  // }

  return <Stack screenOptions={{ headerShown: false }} />;
}
