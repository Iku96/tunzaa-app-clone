import React from "react";
import { View, Text } from "react-native";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { DesktopEnhancedCard } from "@/components/layout/DesktopEnhancedComponents";
import { useResponsive } from "@/hooks/useResponsive";

export function ScrollTestComponent() {
  const { isDesktop } = useResponsive();

  // Create a lot of content to test scrolling
  const testContent = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Test Item ${i + 1}`,
    description: `This is test content item ${i + 1}. It contains some text to make the page scrollable and test our scrolling functionality.`,
  }));

  return (
    <DesktopLayoutWrapper
      showSidebar={true}
      showNavBar={true}
      showFooter={true}
      layoutType="default"
    >
      <View className="p-6">
        <Text className="text-3xl font-bold mb-6">Scroll Test Page</Text>
        <Text className="text-lg text-muted-foreground mb-8">
          This page has a lot of content to test scrolling functionality. 
          You should be able to scroll through all the items below.
        </Text>
        
        <View className="space-y-4">
          {testContent.map((item) => (
            <DesktopEnhancedCard key={item.id} className="p-6" hoverable={true}>
              <Text className="text-xl font-semibold mb-2">{item.title}</Text>
              <Text className="text-muted-foreground">{item.description}</Text>
              <Text className="text-sm text-muted-foreground mt-2">
                Item height: {Math.floor(Math.random() * 100) + 50}px
              </Text>
            </DesktopEnhancedCard>
          ))}
        </View>
        
        <View className="mt-8 p-6 bg-primary/10 rounded-lg">
          <Text className="text-lg font-semibold text-primary">
            🎉 If you can see this, scrolling is working!
          </Text>
          <Text className="text-muted-foreground mt-2">
            This is the end of the scroll test content. The footer should appear below this.
          </Text>
        </View>
      </View>
    </DesktopLayoutWrapper>
  );
} 