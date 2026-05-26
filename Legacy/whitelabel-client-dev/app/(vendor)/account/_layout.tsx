import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="details" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="support" />
      <Stack.Screen name="affiliate-requests" />
    </Stack>
  );
}
