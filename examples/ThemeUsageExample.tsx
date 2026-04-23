import React from "react";
import { View, ScrollView, Platform } from "react-native";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { useThemeColors, useResolvedThemeColors } from "@/hooks/useThemeColors";
import { ShoppingCart, Heart, Package } from "lucide-react-native";

/**
 * Example showing how to use themed components with the new CSS variables approach
 *
 * Two types of colors are available:
 * 1. System colors (bg-primary, text-foreground, etc.) - for react-native-reusables
 * 2. Theme colors (bg-theme-primary, text-theme-primary, etc.) - for custom styling
 */
export function ThemeUsageExample() {
  // Direct color access for components that don't support className
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-6">
        {/* Example 1: System colors (react-native-reusables compatibility) */}
        <Card>
          <CardHeader>
            <CardTitle>System Colors (react-native-reusables)</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-foreground">
              Standard foreground text color
            </Text>
            <Text className="text-muted-foreground">
              Muted foreground text color
            </Text>
            <View className="bg-primary p-3 rounded-md">
              <Text className="text-primary-foreground">
                Primary background with primary foreground text
              </Text>
            </View>

            {/* Standard react-native-reusables buttons */}
            <View className="flex-row gap-2">
              <Button variant="default">
                <Text>Default</Text>
              </Button>
              <Button variant="secondary">
                <Text>Secondary</Text>
              </Button>
              <Button variant="outline">
                <Text>Outline</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Example 2: Theme colors (API-driven) */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors (API-driven)</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-theme-text-primary">
              Primary theme text color
            </Text>
            <Text className="text-theme-text-secondary">
              Secondary theme text color
            </Text>

            {/* Custom themed backgrounds */}
            <View className="bg-theme-primary p-3 rounded-md">
              <Text className="text-white font-medium">
                Dynamic primary color from API
              </Text>
            </View>

            <View className="bg-theme-secondary p-3 rounded-md">
              <Text className="text-white font-medium">
                Dynamic secondary color from API
              </Text>
            </View>

            <View className="bg-theme-accent p-3 rounded-md">
              <Text className="text-white font-medium">
                Dynamic accent color from API
              </Text>
            </View>

            {/* Theme colors with opacity */}
            <View className="bg-theme-primary/20 border border-theme-primary p-3 rounded-md">
              <Text className="text-theme-primary font-medium">
                Primary color with 20% opacity background
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Example 2.5: Opacity Test - Cross-Platform */}
        <Card>
          <CardHeader>
            <CardTitle>
              Opacity Test ({Platform.OS === "web" ? "Web" : "Native"})
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-foreground">
              Testing opacity with direct style injection on native:
            </Text>

            {/* CSS Class approach (works on web) */}
            <View>
              <Text className="text-sm text-muted-foreground mb-2">
                CSS Classes (works on web):
              </Text>
              <View className="bg-theme-primary/20 border border-theme-primary p-3 rounded-md">
                <Text className="text-theme-primary font-medium">
                  20% opacity background + border
                </Text>
              </View>
            </View>

            {/* Direct style approach (works on both web and native) */}
            <View>
              <Text className="text-sm text-muted-foreground mb-2">
                Direct Styles (works on both platforms):
              </Text>
              {resolvedColors ? (
                <View
                  style={{
                    backgroundColor: resolvedColors.primaryWithOpacity(0.2),
                    borderColor: resolvedColors.primary,
                    borderWidth: 1,
                    padding: 12,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{ color: resolvedColors.primary, fontWeight: "600" }}
                  >
                    20% opacity background + border (Direct Style)
                  </Text>
                </View>
              ) : (
                <View className="bg-theme-primary/20 border border-theme-primary p-3 rounded-md">
                  <Text className="text-theme-primary font-medium">
                    20% opacity background + border (CSS Fallback)
                  </Text>
                </View>
              )}
            </View>

            {/* Additional opacity tests */}
            {resolvedColors && (
              <View>
                <Text className="text-sm text-muted-foreground mb-2">
                  Different opacity levels:
                </Text>
                <View className="gap-2">
                  <View
                    style={{
                      backgroundColor: resolvedColors.primaryWithOpacity(0.1),
                      borderColor: resolvedColors.primary,
                      borderWidth: 1,
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: resolvedColors.primary }}>
                      10% opacity
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: resolvedColors.primaryWithOpacity(0.3),
                      borderColor: resolvedColors.primary,
                      borderWidth: 1,
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: resolvedColors.primary,
                        fontWeight: "600",
                      }}
                    >
                      30% opacity
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: resolvedColors.primaryWithOpacity(0.5),
                      borderColor: resolvedColors.primary,
                      borderWidth: 1,
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                      50% opacity
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Text className="text-xs text-muted-foreground">
              Platform: {Platform.OS} | Colors available:{" "}
              {resolvedColors ? "Yes" : "CSS Variables Only"}
            </Text>
          </CardContent>
        </Card>

        {/* Example 3: Mixed usage - themed product card */}
        <Card className="bg-theme-background-secondary">
          <CardHeader>
            <CardTitle>Mixed Theme Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="bg-card rounded-lg border border-theme-border p-4 gap-3">
              <View className="flex-row justify-between items-center">
                <Badge className="bg-theme-accent">
                  <Text className="text-white text-xs">Featured</Text>
                </Badge>
                <Heart
                  size={20}
                  // Direct color access for icons
                  color={colors.textSecondary}
                />
              </View>

              <Text className="text-lg font-semibold text-theme-text-primary">
                Premium Product
              </Text>

              <Text className="text-theme-text-secondary">
                High-quality product with amazing features using dynamic theme
                colors
              </Text>

              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-2xl font-bold text-theme-primary">
                  $149.99
                </Text>

                {/* Mix of system button with theme styling */}
                <Button
                  size="sm"
                  className="bg-theme-accent hover:bg-theme-accent/90"
                >
                  <View className="flex-row items-center gap-2">
                    <ShoppingCart size={16} className="text-white" />
                    <Text className="text-white">Add to Cart</Text>
                  </View>
                </Button>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Example 4: Backward compatibility with ThemedButton */}
        <Card>
          <CardHeader>
            <CardTitle>Backward Compatibility</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <Text className="text-muted-foreground">
              Existing ThemedButton components continue to work:
            </Text>

            <ThemedButton
              title="Primary Action"
              variant="primary"
              onPress={() => console.log("Primary action")}
            />

            <ThemedButton
              title="Secondary Action"
              variant="secondary"
              onPress={() => console.log("Secondary action")}
            />

            <ThemedButton
              title="Accent Action"
              variant="accent"
              onPress={() => console.log("Accent action")}
            />
          </CardContent>
        </Card>

        {/* Example 5: Different background contexts */}
        <Card>
          <CardHeader>
            <CardTitle>Background Contexts</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="bg-theme-background-primary p-3 rounded border border-theme-border">
              <Text className="text-theme-text-primary">
                Theme primary background
              </Text>
            </View>

            <View className="bg-theme-background-secondary p-3 rounded border border-theme-border">
              <Text className="text-theme-text-secondary">
                Theme secondary background
              </Text>
            </View>

            <View className="bg-background p-3 rounded border border-border">
              <Text className="text-foreground">System background</Text>
            </View>

            <View className="bg-muted p-3 rounded border border-border">
              <Text className="text-muted-foreground">
                System muted background
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
