// CrashDuringRender.tsx
import React from "react";
import { View, Text } from "react-native";

export default function CrashTest() {
  // thrown during render -> caught by ErrorBoundary
  throw new Error("Intentional crash — render-time (for testing)");
  return (
    <View>
      <Text>This will never render</Text>
    </View>
  );
}
