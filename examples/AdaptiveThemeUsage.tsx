import React from "react";
import { View, ScrollView, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useThemeColors, useResolvedThemeColors } from "@/hooks/useThemeColors";

/**
 * Example demonstrating the new adaptive theming system
 * - System colors adapt to dark/light mode
 * - Brand colors maintain tenant identity
 */
export function AdaptiveThemeUsage() {
  const colors = useThemeColors();
  const resolvedColors = useResolvedThemeColors();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-6">
        {/* System Colors Demo */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>System Colors (Auto Dark/Light Mode)</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-foreground">
              Primary text - always readable in current mode
            </Text>
            <Text className="text-muted-foreground">
              Secondary text - properly muted for current mode
            </Text>

            {/* System backgrounds */}
            <View className="bg-muted p-3 rounded-md">
              <Text className="text-foreground">Muted background section</Text>
            </View>

            <View className="bg-system-background-elevated p-3 rounded-md border border-border">
              <Text className="text-system-text">
                Elevated surface with system border
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Brand Colors Demo */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Brand Colors (Tenant Identity)</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-muted-foreground">
              These maintain your brand identity regardless of dark/light mode:
            </Text>

            {/* Primary brand button */}
            <Button variant="default">
              <Text className="text-primary-foreground font-semibold">
                Primary Brand Button
              </Text>
            </Button>

            {/* Brand colors with different styles */}
            {resolvedColors ? (
              <>
                <View
                  style={{
                    backgroundColor: resolvedColors.primary,
                    padding: 12,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "500" }}>
                    Brand Primary Background (Direct Styling)
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: resolvedColors.secondaryWithOpacity(0.1),
                    borderColor: resolvedColors.secondary,
                    borderWidth: 1,
                    padding: 12,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      color: resolvedColors.secondary,
                      fontWeight: "500",
                    }}
                  >
                    Brand Secondary with Transparency (Direct Styling)
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: resolvedColors.accentWithOpacity(0.2),
                    borderColor: resolvedColors.accent,
                    borderWidth: 1,
                    padding: 12,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{ color: resolvedColors.accent, fontWeight: "500" }}
                  >
                    Brand Accent Highlight (Direct Styling)
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View className="bg-brand-primary p-3 rounded-md">
                  <Text className="text-white font-medium">
                    Brand Primary Background (CSS Fallback)
                  </Text>
                </View>

                <View className="bg-brand-secondary/10 border border-brand-secondary p-3 rounded-md">
                  <Text className="text-brand-secondary font-medium">
                    Brand Secondary with Transparency (CSS Fallback)
                  </Text>
                </View>

                <View className="bg-brand-accent/20 border border-brand-accent p-3 rounded-md">
                  <Text className="text-brand-accent font-medium">
                    Brand Accent Highlight (CSS Fallback)
                  </Text>
                </View>
              </>
            )}
          </CardContent>
        </Card>

        {/* React Native Direct Styling */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>React Native Direct Styling</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Text className="text-muted-foreground">
              For components that need direct color values:
            </Text>

            {resolvedColors ? (
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
            ) : (
              <View className="bg-primary/10 border border-primary p-3 rounded-md">
                <Text className="text-primary font-semibold">
                  CSS fallback styling
                </Text>
              </View>
            )}

            {/* System colors with direct styling */}
            {resolvedColors && (
              <View
                style={{
                  backgroundColor: resolvedColors.backgroundWithOpacity(0.8),
                  borderColor: resolvedColors.border,
                  borderWidth: 1,
                  padding: 12,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: resolvedColors.foreground }}>
                  System colors with direct styling
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Color Information Display */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Current Theme Information</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            <Text className="text-sm text-muted-foreground">
              Platform: {Platform.OS}
            </Text>
            {resolvedColors && (
              <>
                <Text className="text-sm text-muted-foreground">
                  Background: {resolvedColors.background}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Primary Brand: {resolvedColors.primary}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Has Opacity Helpers:{" "}
                  {resolvedColors.primaryWithOpacity ? "Yes" : "No"}
                </Text>
              </>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}

/**
 * Quick reference for the new color system:
 *
 * SYSTEM COLORS (Auto Dark/Light Mode):
 * - bg-background, bg-muted, bg-card (work on both web and native)
 * - text-foreground, text-muted-foreground
 * - border-border
 *
 * BRAND COLORS (Tenant Identity):
 * - bg-primary, bg-secondary, bg-accent (shadcn system - work via variants)
 * - Use Button variants: variant="default", variant="secondary"
 *
 * CUSTOM BRAND STYLING:
 * ⚠️  CSS classes like bg-brand-primary only work on WEB
 * ✅  For React Native: Use useResolvedThemeColors() with direct styling
 * ✅  For Web fallback: Conditional rendering with CSS classes
 *
 * CROSS-PLATFORM APPROACH:
 * - Web: CSS classes (bg-brand-primary, bg-primary/10)
 * - Native: Direct styling (resolvedColors.primaryWithOpacity(0.1))
 * - Use conditional rendering: resolvedColors ? direct : className
 */
