import React from "react";
import { View, Text, Platform } from "react-native";
import { DesktopEnhancedCard } from "@/components/layout/DesktopEnhancedComponents";

export function QuickScrollTest() {
  // Only show on web for testing
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View className="mt-8 space-y-4">
      <DesktopEnhancedCard className="p-4 bg-blue-50 border-blue-200">
        <Text className="text-lg font-semibold text-blue-800">🧪 Scroll Test</Text>
        <Text className="text-sm text-blue-600 mt-1">
          This is a quick scroll test component. Add more content below to test scrolling.
        </Text>
      </DesktopEnhancedCard>
      
      {/* Generate test content */}
      {Array.from({ length: 20 }, (_, i) => (
        <DesktopEnhancedCard key={i} className="p-4 bg-gray-50">
          <Text className="font-medium">Test Item {i + 1}</Text>
          <Text className="text-sm text-gray-600 mt-1">
            This is test content to make the page scrollable. Item number {i + 1} of 20.
          </Text>
        </DesktopEnhancedCard>
      ))}
      
      <DesktopEnhancedCard className="p-4 bg-green-50 border-green-200">
        <Text className="text-lg font-semibold text-green-800">✅ End of Test Content</Text>
        <Text className="text-sm text-green-600 mt-1">
          If you can see this by scrolling, the scroll functionality is working!
        </Text>
      </DesktopEnhancedCard>
    </View>
  );
} 