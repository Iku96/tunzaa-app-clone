import React from "react";
import { View, ScrollView, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  useThemeColors,
  useResolvedThemeColors,
  useBrandStyles,
} from "@/hooks/useThemeColors";

/**
 * Demo of adaptive theming system
 */
export function AdaptiveThemingDemo() {
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();
  const brandStyles = useBrandStyles();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-6">
        {/* System Colors */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>System Colors (Auto Dark/Light)</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-foreground">Primary text</Text>
            <Text className="text-muted-foreground">Secondary text</Text>

            <View className="bg-muted p-3 rounded-md">
              <Text className="text-foreground">Muted background</Text>
            </View>
          </CardContent>
        </Card>

        {/* Button Variants */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-muted-foreground text-sm">
              All button variants work seamlessly with adaptive theming:
            </Text>

            <View className="gap-3">
              <Button variant="default">
                <Text className="font-semibold">Default Button</Text>
              </Button>

              <Button variant="secondary">
                <Text className="font-semibold">Secondary Button</Text>
              </Button>

              <Button variant="destructive">
                <Text className="font-semibold">Destructive Button</Text>
              </Button>

              <Button variant="outline">
                <Text className="font-semibold">Outline Button</Text>
              </Button>

              <Button variant="ghost">
                <Text className="font-semibold">Ghost Button</Text>
              </Button>

              <Button variant="link">
                <Text className="font-semibold">Link Button</Text>
              </Button>
            </View>

            <Text className="text-muted-foreground text-xs mt-2">
              💡 All variants automatically adapt their colors based on your
              tenant's branding and current dark/light mode.
            </Text>
          </CardContent>
        </Card>

        {/* Button Sizes */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Button Sizes</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-muted-foreground text-sm">
              Different button sizes with the default variant:
            </Text>

            <View className="gap-3">
              <Button variant="default" size="sm">
                <Text className="font-semibold">Small Button</Text>
              </Button>

              <Button variant="default" size="default">
                <Text className="font-semibold">Default Size Button</Text>
              </Button>

              <Button variant="default" size="lg">
                <Text className="font-semibold">Large Button</Text>
              </Button>

              <Button variant="default" size="icon">
                <Text className="font-semibold">📱</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Mixed Variants Demo */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Mixed Variants in Action</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-muted-foreground text-sm">
              Real-world usage example:
            </Text>

            <View className="gap-3">
              {/* Primary action */}
              <Button variant="default" size="lg">
                <Text className="font-semibold">Save Changes</Text>
              </Button>

              {/* Secondary actions */}
              <View className="flex-row gap-2">
                <Button variant="outline" className="flex-1">
                  <Text className="font-medium">Cancel</Text>
                </Button>
                <Button variant="secondary" className="flex-1">
                  <Text className="font-medium">Draft</Text>
                </Button>
              </View>

              {/* Danger action */}
              <Button variant="destructive">
                <Text className="font-semibold">Delete Item</Text>
              </Button>

              {/* Subtle actions */}
              <View className="flex-row gap-2">
                <Button variant="ghost">
                  <Text>Reset</Text>
                </Button>
                <Button variant="link">
                  <Text>Learn More</Text>
                </Button>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Brand Colors (Tenant Identity)</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-muted-foreground text-sm">
              Custom brand styling alongside system buttons:
            </Text>

            <Button variant="default">
              <Text className="text-primary-foreground font-semibold">
                Primary Brand Button
              </Text>
            </Button>

            {resolvedColors ? (
              <View
                style={{
                  backgroundColor: resolvedColors.primary,
                  padding: 12,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "500" }}>
                  Brand Primary (Direct Styling)
                </Text>
              </View>
            ) : (
              <View className="bg-brand-primary p-3 rounded-md">
                <Text className="text-white font-medium">
                  Brand Primary (CSS Fallback)
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Cross-Platform Solution */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Cross-Platform Solution</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-muted-foreground text-sm">
              ✅ This works on both web and React Native using conditional
              rendering:
            </Text>

            <View
              {...brandStyles.primaryBackground()}
              style={[
                brandStyles.primaryBackground().style,
                { padding: 12, borderRadius: 6 },
              ]}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "500" }}>
                Cross-Platform Brand Background
              </Text>
            </View>

            <Text className="text-muted-foreground text-sm">
              useBrandStyles() automatically returns either style props for
              React Native or className props for web.
            </Text>
          </CardContent>
        </Card>

        {/* Direct Styling */}
        {resolvedColors && (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Direct Styling with Opacity</CardTitle>
            </CardHeader>
            <CardContent>
              <View
                style={{
                  backgroundColor: resolvedColors.primaryWithOpacity(0.1),
                  borderColor: resolvedColors.primary,
                  borderWidth: 1,
                  padding: 12,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{ color: resolvedColors.primary, fontWeight: "600" }}
                >
                  Direct styling with opacity helpers
                </Text>
              </View>
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
