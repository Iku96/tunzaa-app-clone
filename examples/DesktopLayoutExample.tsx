import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DesktopLayoutWrapper } from "@/components/layout/DesktopLayoutWrapper";
import { DesktopEnhancedCard, DesktopEnhancedGrid } from "@/components/layout/DesktopEnhancedComponents";
import { useResponsive } from "@/hooks/useResponsive";

// Example: Product listing page
export function ProductListingExample() {
  const { isDesktop } = useResponsive();

  const products = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Product ${i + 1}`,
    price: (Math.random() * 100 + 10).toFixed(2),
    description: `This is a description for product ${i + 1}. It's a great product with many features.`,
  }));

  return (
    <DesktopLayoutWrapper
      showSidebar={true}
      showNavBar={true}
      showFooter={true}
      layoutType="default"
    >
      {!isDesktop && (
        <SafeAreaView className="flex-1 bg-background p-4">
          <Text className="text-2xl font-bold mb-4">Products</Text>
          <ScrollView>
            <View className="space-y-4">
              {products.map((product) => (
                <DesktopEnhancedCard key={product.id} className="p-4">
                  <Text className="text-lg font-semibold">{product.title}</Text>
                  <Text className="text-sm text-muted-foreground">{product.description}</Text>
                  <Text className="text-lg font-bold text-primary mt-2">${product.price}</Text>
                </DesktopEnhancedCard>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      )}

      {isDesktop && (
        <View className="p-6">
          <Text className="text-3xl font-bold mb-6">Products</Text>
          
          <DesktopEnhancedGrid
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap="gap-6"
          >
            {products.map((product) => (
              <DesktopEnhancedCard 
                key={product.id} 
                className="p-6" 
                hoverable={true}
                onPress={() => {}}
              >
                <Text className="text-xl font-semibold mb-2">{product.title}</Text>
                <Text className="text-sm text-muted-foreground mb-4">{product.description}</Text>
                <Text className="text-xl font-bold text-primary">${product.price}</Text>
              </DesktopEnhancedCard>
            ))}
          </DesktopEnhancedGrid>
        </View>
      )}
    </DesktopLayoutWrapper>
  );
}

// Example: Account settings page
export function AccountSettingsExample() {
  const { isDesktop } = useResponsive();

  return (
    <DesktopLayoutWrapper
      showSidebar={false}
      showNavBar={true}
      showFooter={true}
      layoutType="default"
    >
      {!isDesktop && (
        <SafeAreaView className="flex-1 bg-background p-4">
          <Text className="text-2xl font-bold mb-4">Account Settings</Text>
          <ScrollView>
            <View className="space-y-4">
              <DesktopEnhancedCard className="p-4">
                <Text className="text-lg font-semibold">Profile Information</Text>
                <Text className="text-sm text-muted-foreground">Update your profile details</Text>
              </DesktopEnhancedCard>
              
              <DesktopEnhancedCard className="p-4">
                <Text className="text-lg font-semibold">Security</Text>
                <Text className="text-sm text-muted-foreground">Change password and security settings</Text>
              </DesktopEnhancedCard>
              
              <DesktopEnhancedCard className="p-4">
                <Text className="text-lg font-semibold">Notifications</Text>
                <Text className="text-sm text-muted-foreground">Manage your notification preferences</Text>
              </DesktopEnhancedCard>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}

      {isDesktop && (
        <View className="p-6">
          <Text className="text-3xl font-bold mb-6">Account Settings</Text>
          
          <View className="max-w-2xl space-y-6">
            <DesktopEnhancedCard className="p-6" hoverable={true}>
              <Text className="text-xl font-semibold mb-2">Profile Information</Text>
              <Text className="text-sm text-muted-foreground">Update your profile details</Text>
            </DesktopEnhancedCard>
            
            <DesktopEnhancedCard className="p-6" hoverable={true}>
              <Text className="text-xl font-semibold mb-2">Security</Text>
              <Text className="text-sm text-muted-foreground">Change password and security settings</Text>
            </DesktopEnhancedCard>
            
            <DesktopEnhancedCard className="p-6" hoverable={true}>
              <Text className="text-xl font-semibold mb-2">Notifications</Text>
              <Text className="text-sm text-muted-foreground">Manage your notification preferences</Text>
            </DesktopEnhancedCard>
          </View>
        </View>
      )}
    </DesktopLayoutWrapper>
  );
}

// Example: Authentication page
export function AuthenticationExample() {
  const { isDesktop } = useResponsive();

  return (
    <DesktopLayoutWrapper
      layoutType="auth"
      showNavBar={false}
      showFooter={true}
      showSidebar={false}
    >
      {!isDesktop && (
        <SafeAreaView className="flex-1 bg-background p-4">
          <Text className="text-2xl font-bold mb-4">Sign In</Text>
          <View className="space-y-4">
            <View className="p-4 border rounded-lg">
              <Text className="text-sm text-muted-foreground">Email input would go here</Text>
            </View>
            <View className="p-4 border rounded-lg">
              <Text className="text-sm text-muted-foreground">Password input would go here</Text>
            </View>
            <View className="p-4 bg-primary rounded-lg">
              <Text className="text-center text-primary-foreground font-semibold">Sign In</Text>
            </View>
          </View>
        </SafeAreaView>
      )}

      {isDesktop && (
        <View className="space-y-6">
          <Text className="text-3xl font-bold text-center">Sign In</Text>
          
          <View className="space-y-4">
            <View className="p-4 border rounded-lg">
              <Text className="text-sm text-muted-foreground">Email input would go here</Text>
            </View>
            <View className="p-4 border rounded-lg">
              <Text className="text-sm text-muted-foreground">Password input would go here</Text>
            </View>
            <View className="p-4 bg-primary rounded-lg">
              <Text className="text-center text-primary-foreground font-semibold">Sign In</Text>
            </View>
          </View>
        </View>
      )}
    </DesktopLayoutWrapper>
  );
} 